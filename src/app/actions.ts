"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { NotificationService } from "@/modules/notifications/services/notification.service";

export async function createCourtAction(tenantSlug: string, formData: FormData) {
    // 1. Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized: Please login" };

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const hourlyRate = Number(formData.get("hourlyRate"));
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const imagesStr = formData.get("images") as string;
    const images = imagesStr ? JSON.parse(imagesStr) : (imageUrl ? [imageUrl] : []);
    const reservationType = (formData.get("reservationType") as string) || "FIXED";
    const isMaintenance = formData.get("isMaintenance") === "true";
    const useCompanyAddress = formData.get("useCompanyAddress") !== "false";
    const customAddress = formData.get("customAddress") as string;
    const minPlayers = Number(formData.get("minPlayers")) || null;
    const maxPlayers = Number(formData.get("maxPlayers")) || null;
    const surface = formData.get("surface") as string;
    const dimensions = formData.get("dimensions") as string;

    const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
    if (!company) return { success: false, error: "Tenant not found" };

    // 2. Ownership Check
    if (company.ownerId !== user.id) {
        return { success: false, error: "Unauthorized: You do not own this company" };
    }

    // Check plan limits
    const isFreePlan = !company.planType || company.planType === 'FREE';
    if (isFreePlan) {
        const existingCourtsCount = await prisma.court.count({
            where: { companyId: company.id }
        });

        if (existingCourtsCount >= 3) {
            return { success: false, error: "Você atingiu o limite de 3 quadras do plano Grátis." };
        }
    }

    try {
        const newCourt = await prisma.court.create({
            data: {
                companyId: company.id,
                name: name || "Nova Quadra",
                type: type?.toUpperCase() || "FUTSAL",
                hourlyRate: hourlyRate || 100,
                description,
                reservationType,
                image: images.length > 0 ? images[0] : null,
                images,
                isActive: !isMaintenance,
                useCompanyAddress,
                customAddress: useCompanyAddress ? null : (customAddress || null),
                minPlayers,
                maxPlayers,
                surface,
                dimensions
            } as any
        });

        revalidatePath(`/${tenantSlug}/admin/courts`);
        return {
            success: true,
            data: {
                id: newCourt.id,
                tenantId: newCourt.companyId,
                name: newCourt.name,
                type: newCourt.type.toLowerCase() as any,
                hourlyRate: Number(newCourt.hourlyRate),
                reservationType: (newCourt as any).reservationType || 'FIXED',
                image: newCourt.image || undefined,
                images: newCourt.images,
                description: (newCourt as any).description || undefined,
                isMaintenance: !newCourt.isActive,
                useCompanyAddress: newCourt.useCompanyAddress,
                customAddress: newCourt.customAddress || undefined,
                minPlayers: (newCourt as any).minPlayers,
                maxPlayers: (newCourt as any).maxPlayers,
                surface: (newCourt as any).surface,
                dimensions: (newCourt as any).dimensions
            }
        };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

export async function updateCourtAction(tenantSlug: string, courtId: string, formData: FormData) {
    // 1. Auth & Ownership Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
    if (!company || company.ownerId !== user.id) return { success: false, error: "Unauthorized" };

    // Verify Court belongs to Company
    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court || court.companyId !== company.id) return { success: false, error: "Court not found in this company" };

    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const hourlyRate = Number(formData.get("hourlyRate"));
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const imagesStr = formData.get("images") as string;
    const images = imagesStr ? JSON.parse(imagesStr) : (imageUrl ? [imageUrl] : []);
    const reservationType = (formData.get("reservationType") as string) || "FIXED";
    const isMaintenance = formData.get("isMaintenance") === "true";
    const useCompanyAddress = formData.get("useCompanyAddress") !== "false";
    const customAddress = formData.get("customAddress") as string;
    const minPlayers = Number(formData.get("minPlayers")) || null;
    const maxPlayers = Number(formData.get("maxPlayers")) || null;
    const surface = formData.get("surface") as string;
    const dimensions = formData.get("dimensions") as string;

    try {
        const updatedCourt = await prisma.court.update({
            where: { id: courtId },
            data: {
                name,
                type: type?.toUpperCase(),
                hourlyRate,
                description,
                reservationType,
                image: images.length > 0 ? images[0] : null,
                images,
                isActive: !isMaintenance,
                useCompanyAddress,
                customAddress: useCompanyAddress ? null : (customAddress || null),
                minPlayers,
                maxPlayers,
                surface,
                dimensions
            } as any
        });
        revalidatePath(`/${tenantSlug}/admin/courts`);
        return {
            success: true,
            data: {
                id: updatedCourt.id,
                tenantId: updatedCourt.companyId,
                name: updatedCourt.name,
                type: updatedCourt.type.toLowerCase() as any,
                hourlyRate: Number(updatedCourt.hourlyRate),
                reservationType: (updatedCourt as any).reservationType || 'FIXED',
                image: updatedCourt.image || undefined,
                images: updatedCourt.images,
                description: (updatedCourt as any).description || undefined,
                isMaintenance: !updatedCourt.isActive,
                useCompanyAddress: updatedCourt.useCompanyAddress,
                customAddress: updatedCourt.customAddress || undefined,
                minPlayers: (updatedCourt as any).minPlayers,
                maxPlayers: (updatedCourt as any).maxPlayers,
                surface: (updatedCourt as any).surface,
                dimensions: (updatedCourt as any).dimensions
            }
        };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

export async function deleteCourtAction(tenantSlug: string, courtId: string) {
    // 1. Auth & Ownership Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
    if (!company || company.ownerId !== user.id) return { success: false, error: "Unauthorized" };

    const court = await prisma.court.findUnique({ where: { id: courtId } });
    if (!court || court.companyId !== company.id) return { success: false, error: "Court not found" };

    try {
        await prisma.court.delete({ where: { id: courtId } });
        revalidatePath(`/${tenantSlug}/admin/courts`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createBookingAction(tenantSlug: string, bookingData: any) {
    const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
    if (!company) return { success: false, error: "Tenant not found" };

    try {
        const startAt = new Date(bookingData.startTime);
        const endAt = new Date(bookingData.endTime);

        if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
            return { success: false, error: "Data inválida" };
        }

        if (startAt >= endAt) {
            return { success: false, error: "Horário de término deve ser após o início" };
        }

        // Check plan limits
        const isFreePlan = !company.planType || company.planType === 'FREE';
        if (isFreePlan) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const bookingsCount = await prisma.reservation.count({
                where: {
                    companyId: company.id,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                }
            });

            if (bookingsCount >= 30) {
                return { success: false, error: "Você atingiu o limite de 30 agendamentos por mês do plano Grátis." };
            }
        }

        // Use interactive transaction to minimize race conditions
        const result = await prisma.$transaction(async (tx) => {
            let customerId = bookingData.userId;

            // 1. Handle Customer
            if (!customerId || customerId === "user-placeholder") {
                if (bookingData.customerName) {
                    const newCustomer = await tx.customer.create({
                        data: { name: bookingData.customerName }
                    });
                    customerId = newCustomer.id;
                } else {
                    throw new Error("Nome do cliente é obrigatório");
                }
            }

            // 2. Strict Conflict Check inside Transaction
            const conflict = await tx.reservation.findFirst({
                where: {
                    courtId: bookingData.courtId,
                    status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'HOLD'] },
                    AND: [
                        { startAt: { lt: endAt } },
                        { endAt: { gt: startAt } }
                    ]
                }
            });

            if (conflict) {
                throw new Error("Este horário já está reservado.");
            }

            // 3. Create Reservation
            return await tx.reservation.create({
                data: {
                    companyId: company.id,
                    courtId: bookingData.courtId,
                    customerId: customerId,
                    startAt,
                    endAt,
                    totalPrice: Number(bookingData.totalAmount || 0),
                    status: 'CONFIRMED'
                }
            });
        });

        revalidatePath(`/${tenantSlug}/admin/bookings`);
        return { success: true };
    } catch (error: any) {
        console.error("Booking Error:", error);
        return { success: false, error: error.message || "Erro ao criar reserva" };
    }
}

export async function endReservationAction(tenantSlug: string, reservationId: string) {
    try {
        const now = new Date();
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { court: true }
        });

        if (!reservation) return { success: false, error: "Reserva não encontrada" };

        let totalPrice = Number(reservation.totalPrice);
        if ((reservation.court as any).reservationType === 'OPEN') {
            const diffInMs = now.getTime() - reservation.startAt.getTime();
            const diffInHours = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60)));
            totalPrice = Number(reservation.court.hourlyRate) * diffInHours;
        }

        await prisma.reservation.update({
            where: { id: reservationId },
            data: {
                endAt: now,
                status: 'COMPLETED',
                totalPrice: Number(totalPrice)
            }
        });

        revalidatePath(`/${tenantSlug}/admin/bookings`);
        return { success: true };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

export async function createCustomerAction(tenantSlug: string, formData: FormData) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
    if (!company || company.ownerId !== user.id) return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const cpf = formData.get("cpf") as string;
    const phone = formData.get("phone") as string;

    try {
        const newCustomer = await prisma.customer.create({
            data: {
                name,
                email: email || null,
                cpf: cpf || null,
                phone: phone || null
            }
        });

        revalidatePath(`/${tenantSlug}/admin/customers`);
        return {
            success: true,
            data: {
                id: newCustomer.id,
                name: newCustomer.name,
                email: newCustomer.email || "",
                role: "customer" as const,
                phone: newCustomer.phone || undefined,
                cpf: newCustomer.cpf || undefined
            }
        };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: error.message };
    }
}

export async function updateCustomerAction(tenantSlug: string, customerId: string, formData: FormData) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
    if (!company || company.ownerId !== user.id) return { success: false, error: "Unauthorized" };

    // Note: Customers are global in the schema (no company_id), so we can't strictly filter by company without linking table.
    // Assuming customers are shared or we are just validating admin access to the dashboard.

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const cpf = formData.get("cpf") as string;
    const phone = formData.get("phone") as string;

    try {
        const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: {
                name,
                email: email || null,
                cpf: cpf || null,
                phone: phone || null
            }
        });
        revalidatePath(`/${tenantSlug}/admin/customers`);
        return {
            success: true,
            data: {
                id: updatedCustomer.id,
                name: updatedCustomer.name,
                email: updatedCustomer.email || "",
                role: "customer" as const,
                phone: updatedCustomer.phone || undefined,
                cpf: updatedCustomer.cpf || undefined
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCustomerAction(tenantSlug: string, customerId: string) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Check ownership of tenant
    const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
    if (!company || company.ownerId !== user.id) return { success: false, error: "Unauthorized" };

    try {
        await prisma.customer.delete({ where: { id: customerId } });
        revalidatePath(`/${tenantSlug}/admin/customers`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendBookingNotificationAction(tenantSlug: string, reservationId: string) {
    // 1. Auth Check - Only owner can send notifications
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
    if (!company || company.ownerId !== user.id) return { success: false, error: "Unauthorized" };

    try {
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                customer: true,
                court: true
            }
        });

        if (!reservation) return { success: false, error: "Reserva não encontrada" };
        if (!reservation.customer) return { success: false, error: "Cliente não encontrado" };
        if (!reservation.customer.phone) return { success: false, error: "Telefone do cliente não cadastrado" };

        const notify = new NotificationService();
        await notify.onReservationConfirmed({
            companyId: company.id,
            customerId: reservation.customerId,
            customerPhone: reservation.customer.phone,
            reservationId: reservation.id,
            startAt: reservation.startAt,
            companyName: company.name,
            courtName: reservation.court?.name || 'Quadra',
            address: company.address || 'Endereço da Arena',
            contactRawLink: `https://wa.me/${company.whatsapp || company.payoutPixKey || ''}`
        });

        return { success: true };
    } catch (error: any) {
        console.error("Erro ao enviar notificação manual:", error);
        return { success: false, error: error.message || "Erro ao enviar notificação" };
    }
}
