'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Shield,
  CreditCard,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { updateTenantSettings, updatePassword } from '@/app/settings-actions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

import { SettingsData, SettingsClientProps, TabId } from './settings/types';
import { maskCep } from './settings/utils/masks';
import { ProfileTab } from './settings/tabs/ProfileTab';
import { SecurityTab } from './settings/tabs/SecurityTab';
import { SubscriptionTab } from './settings/tabs/SubscriptionTab';
import { SupportTab } from './settings/tabs/SupportTab';

export default function SettingsClient({ tenantSlug, initialData, planType = 'FREE', subscriptionDetails }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [publicBookingLink, setPublicBookingLink] = useState('');

  // Support Modal State
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const { showToast } = useToast();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const logoFileRef = useRef<File | null>(null);
  const currentCepRequest = useRef<string>('');

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    setIsCancelModalOpen(false);
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantSlug })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao abrir portal da assinatura');
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Erro ao acessar portal:', error);
      showToast(error.message, 'error');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleUpgrade = async () => {
    window.location.href = `/${tenantSlug}/admin/plan`;
  };

  // Gera o link público de agendamento apenas no cliente
  useEffect(() => {
    setPublicBookingLink(`${window.location.origin}/${tenantSlug}/agendar`);
  }, [tenantSlug]);

  const copyBookingLink = () => {
    navigator.clipboard.writeText(publicBookingLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCepChange = async (cep: string) => {
    const rawCep = cep.replace(/\D/g, '');
    const masked = maskCep(cep);
    setProfileData(prev => ({ ...prev, addressCep: masked }));

    if (rawCep.length === 8) {
      currentCepRequest.current = rawCep;
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await response.json();

        if (currentCepRequest.current !== rawCep) return;

        if (!data.erro) {
          setProfileData(prev => ({
            ...prev,
            address: data.logradouro,
            addressStreet: data.logradouro,
            addressCity: data.localidade,
            addressState: data.uf,
            addressCep: masked
          }));
          showToast("Endereço encontrado!", "success");
        } else {
          showToast("CEP não encontrado", "warning");
        }
      } catch (error) {
        if (currentCepRequest.current !== rawCep) return;
        console.error("Erro ao buscar CEP:", error);
        showToast("Erro ao buscar CEP", "error");
      }
    }
  };

  // Profile State
  const [profileData, setProfileData] = useState<SettingsData>({
    name: initialData.name || '',
    address: initialData.address || '',
    addressStreet: initialData.addressStreet || initialData.address || '',
    addressCep: initialData.addressCep || '',
    addressNumber: initialData.addressNumber || '',
    addressCity: initialData.addressCity || '',
    addressState: initialData.addressState || '',
    phone: initialData.phone || '',
    whatsapp: initialData.whatsapp || '',
    email: initialData.email || '',
    instagram: initialData.instagram || '',
    openTime: initialData.openTime || '06:00',
    closeTime: initialData.closeTime || '23:00',
    logo: initialData.logo || null
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const sections = [
    { id: 'profile' as TabId, label: 'Perfil da Unidade', icon: Settings, desc: 'Nome, endereço e informações básicas' },
    { id: 'security' as TabId, label: 'Segurança', icon: Shield, desc: 'Senha e permissões de acesso' },
    { id: 'plans' as TabId, label: 'Assinatura', icon: CreditCard, desc: 'Gerenciar plano e pagamentos' },
    { id: 'support' as TabId, label: 'Suporte', icon: HelpCircle, desc: 'Central de ajuda e chamados' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalLogo = profileData.logo;
      if (logoFileRef.current) {
        finalLogo = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(logoFileRef.current!);
        });
      }

      const payload = {
        ...profileData,
        logo: finalLogo
      };

      const result = await updateTenantSettings(tenantSlug, payload);
      if (result.success) {
        setSaved(true);
        if (profileData.logo?.startsWith('blob:')) {
          URL.revokeObjectURL(profileData.logo);
        }
        logoFileRef.current = null;
        setTimeout(() => setSaved(false), 3000);
        showToast("Configurações salvas com sucesso!", "success");

        // Revalida no lado do cliente se necessário ou recarrega
        window.location.reload();
      } else {
        console.error("Erro ao salvar:", result.error);
        showToast("Erro ao salvar configurações", "error");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showToast("Erro inesperado ao salvar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("A logo deve ter no máximo 2MB", "error");
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      if (profileData.logo?.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.logo);
      }
      setProfileData(prev => ({ ...prev, logo: objectUrl }));
      logoFileRef.current = file;
    }
  };

  const handlePasswordUpdate = async () => {
    // Validation
    if (!securityData.currentPassword) {
      showToast("Por favor, insira sua senha atual", "warning");
      return;
    }

    if (!securityData.newPassword) {
      showToast("Por favor, insira uma nova senha", "warning");
      return;
    }

    if (securityData.newPassword.length < 6) {
      showToast("A nova senha deve ter pelo menos 6 caracteres", "warning");
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast("As senhas não coincidem", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const result = await updatePassword(
        tenantSlug,
        securityData.currentPassword,
        securityData.newPassword
      );

      if (result.success) {
        setSaved(true);
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSaved(false), 3000);
        showToast("Senha atualizada com sucesso!", "success");
      } else {
        showToast(result.error || "Erro ao atualizar senha", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      showToast("Erro inesperado ao atualizar senha", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">Configurações</h1>
        <p className="text-zinc-400 text-sm">Ajuste as preferências do seu painel e da sua conta.</p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Tabs — horizontal scroll on mobile, sidebar on desktop */}
        <div className="lg:col-span-1">
          {/* Mobile: scrollable pill tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-none">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === section.id
                    ? 'bg-accent-500 text-black shadow-[0_0_16px_rgba(204,255,0,0.2)]'
                    : 'text-zinc-400 bg-white/5 hover:text-white hover:bg-white/10'
                  }`}
              >
                <section.icon size={16} className={activeTab === section.id ? 'text-black' : 'text-zinc-400'} />
                {section.label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical sidebar tabs */}
          <div className="hidden lg:flex lg:flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium transition-all group ${activeTab === section.id
                    ? 'bg-accent-500 text-black shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <section.icon size={20} className={activeTab === section.id ? 'text-black' : 'text-zinc-500 group-hover:text-accent-500 transition-colors'} />
                <div className="text-left">
                  <p className="leading-none mb-1">{section.label}</p>
                  <p className={`text-[10px] opacity-60 ${activeTab === section.id ? 'text-black' : 'text-zinc-600'}`}>
                    {section.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab
              profileData={profileData}
              setProfileData={setProfileData}
              tenantSlug={tenantSlug}
              handleCepChange={handleCepChange}
              handleLogoUpload={handleLogoUpload}
              errors={errors}
              setErrors={setErrors}
              publicBookingLink={publicBookingLink}
              copyBookingLink={copyBookingLink}
              copiedLink={copiedLink}
              handleSave={handleSave}
              saved={saved}
              isSaving={isSaving}
            />
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <SecurityTab
              securityData={securityData}
              setSecurityData={setSecurityData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              handlePasswordUpdate={handlePasswordUpdate}
              isSaving={isSaving}
              saved={saved}
            />
          )}

          {/* Subscription Tab */}
          {activeTab === 'plans' && (
            <SubscriptionTab
              planType={planType}
              subscriptionDetails={subscriptionDetails}
              handleUpgrade={handleUpgrade}
              setIsCancelModalOpen={setIsCancelModalOpen}
              isCanceling={isCanceling}
            />
          )}

          <ConfirmDialog
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleCancelSubscription}
            title="Gerenciar Assinatura"
            message="Você será redirecionado para a plataforma segura do Stripe para cancelar sua assinatura ou atualizar seus dados de pagamento. Deseja continuar?"
            confirmText="Sim, cancelar"
            cancelText="Voltar"
            variant="danger"
            isLoading={isCanceling}
          />

          {/* Support Tab */}
          {activeTab === 'support' && (
            <SupportTab
              planType={planType}
              isSupportModalOpen={isSupportModalOpen}
              setIsSupportModalOpen={setIsSupportModalOpen}
              supportMessage={supportMessage}
              setSupportMessage={setSupportMessage}
              initialDataName={initialData.name}
              tenantSlug={tenantSlug}
            />
          )}

          {/* Danger Zone */}
          <div className="p-8 rounded-[2.5rem] bg-red-500/[0.02] border border-red-500/10 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-500 mb-2">Zona de Perigo</h3>
                <p className="text-sm text-zinc-500">
                  A exclusão da conta é permanente e não pode ser desfeita. Todos os dados da sua arena serão removidos.
                </p>
              </div>
            </div>
            <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-bold hover:bg-red-500/20 transition-all">
              Encerrar atividades desta arena
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
