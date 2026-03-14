import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { PaymentService, AbacatePayGateway } from '@/modules/payments/services/payment.service';

/**
 * POST /api/reservations
 * Cria uma reserva em modo HOLD e gera a cobrança Pix.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      companyId, 
      courtId, 
      customerId, // Opcional se for novo
      customerName, 
      customerPhone,
      startAt, 
      endAt 
    } = body;

    const supabase = getSupabaseAdmin();

    // 1. Buscar dados da Empresa (Taxas) e da Quadra (Preço)
    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (companyErr || !company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    // Nota: Aqui você buscaria o preço da quadra na sua tabela de quadras
    // Como estamos no MVP, vamos assumir um preço fixo vindo da request ou mock
    const courtPrice = 80.00; 

    // 2. Inicializar Serviços de Pagamento
    const gateway = new AbacatePayGateway();
    const paymentService = new PaymentService(gateway);

    const { basePrice, serviceFee, totalAmount } = paymentService.calculateFees(courtPrice, {
      feeMode: company.convenience_fee_mode,
      feeValue: Number(company.convenience_fee_value)
    });

    // 3. Gerente de Cliente (Cria ou seleciona)
    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      const { data: newCustomer, error: custErr } = await supabase
        .from('customers')
        .upsert({ name: customerName, phone: customerPhone }, { onConflict: 'phone' })
        .select()
        .single();
      
      if (custErr) throw custErr;
      finalCustomerId = newCustomer.id;
    }

    // 4. Criar Cobrança no Gateway (AbacatePay)
    const pixCharge = await gateway.createPixCharge({
      reservationId: 'temp', // Vamos atualizar depois
      companyId,
      customerId: finalCustomerId,
      amount: totalAmount,
      basePrice,
      serviceFee,
      description: `Reserva em ${company.name}`
    });

    // 5. Salvar Reserva e Pagamento no Supabase
    // Usamos o status 'HOLD' para bloquear o horário por 15 min
    const { data: reservation, error: resErr } = await supabase
      .from('reservations')
      .insert({
        company_id: companyId,
        customer_id: finalCustomerId,
        court_id: courtId,
        start_at: startAt,
        end_at: endAt,
        status: 'HOLD',
        total_price: totalAmount,
        hold_expires_at: pixCharge.expiresAt.toISOString()
      })
      .select()
      .single();

    if (resErr) throw resErr;

    const { error: payErr } = await supabase
      .from('payments')
      .insert({
        reservation_id: reservation.id,
        company_id: companyId,
        total_amount: totalAmount,
        base_amount: basePrice,
        service_fee: serviceFee,
        provider_charge_id: pixCharge.providerChargeId,
        pix_copy_paste: pixCharge.pixCopyPaste,
        pix_qr_code_url: pixCharge.pixQrCodeUrl,
        status: 'PENDING',
        expires_at: pixCharge.expiresAt.toISOString()
      });

    if (payErr) throw payErr;

    // 6. Retorno de sucesso para o Frontend
    return NextResponse.json({
      reservationId: reservation.id,
      pix: {
        copyPaste: pixCharge.pixCopyPaste,
        qrCode: pixCharge.pixQrCodeUrl,
        expiresAt: pixCharge.expiresAt
      },
      amounts: {
        total: totalAmount,
        fee: serviceFee
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
