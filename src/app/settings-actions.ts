"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function updateTenantSettings(tenantSlug: string, data: any) {
    try {
        const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
        if (!company) return { success: false, error: "Tenant not found" };

        const { name, address, addressStreet, addressCep, addressNumber, addressCity, addressState, phone, whatsapp, email, instagram, openTime, closeTime } = data;

        // The 'address' in current data might be the street name from the form
        // We ensure we use 'addressStreet' if provided, or fallback to 'address'
        const street = addressStreet || address;

        // Construct full address for backward compatibility
        const fullAddress = `${street}${addressNumber ? `, ${addressNumber}` : ''}${addressCity ? ` - ${addressCity}` : ''}${addressState ? `/${addressState}` : ''}${addressCep ? ` - CEP: ${addressCep}` : ''}`;

        await prisma.company.update({
            where: { slug: tenantSlug },
            data: {
                name,
                address: fullAddress,
                addressStreet: street,
                addressCep,
                addressNumber,
                addressCity,
                addressState,
                phone,
                whatsapp,
                email,
                instagram,
                logo: data.logo, // Ensure this is being passed
                openingHours: {
                    open: openTime,
                    close: closeTime
                }
            } as any
        });

        revalidatePath(`/${tenantSlug}/admin/settings`);
        return { success: true };
    } catch (e: any) {
        console.error("Failed to update settings:", e);
        return { success: false, error: e.message };
    }
}

export async function updatePassword(tenantSlug: string, currentPassword: string, newPassword: string) {
    try {
        // Get company to find owner
        const company = await prisma.company.findUnique({
            where: { slug: tenantSlug },
            include: { users: true }
        });

        if (!company || !company.users) {
            return { success: false, error: "Conta não encontrada" };
        }

        const userEmail = company.users.email;
        if (!userEmail) {
            return { success: false, error: "Email do usuário não encontrado" };
        }

        // Get Supabase admin client
        const supabase = getSupabaseAdmin();

        // Verify current password by attempting to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: currentPassword,
        });

        if (signInError || !signInData.user) {
            return { success: false, error: "Senha atual incorreta" };
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            signInData.user.id,
            { password: newPassword }
        );

        if (updateError) {
            return { success: false, error: "Erro ao atualizar senha: " + updateError.message };
        }

        // Sign out the temporary session we created for verification
        await supabase.auth.signOut();

        revalidatePath(`/${tenantSlug}/admin/settings`);
        return { success: true };
    } catch (e: any) {
        console.error("Failed to update password:", e);
        return { success: false, error: e.message || "Erro ao atualizar senha" };
    }
}
