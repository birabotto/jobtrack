
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const statuses = [
    "Saved",
    "Applied",
    "Screening",
    "Interview",
    "Offer",
    "Rejected",
] as const;

const applicationSchema = z.object({
    company: z.string().trim().min(1).max(200),
    position: z.string().trim().min(1).max(200),
    status: z.enum(statuses),
    job_url: z.union([
        z.literal(""),
        z.url().refine((url) => {
            const protocol = new URL(url).protocol;
            return protocol === "https:" || protocol === "http:";
        }),
    ]),
    notes: z.string().max(5000),
});

async function requireUser() {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized");
    }

    return { supabase, user };
}

export async function addApplication(formData: FormData) {
    const { supabase, user } = await requireUser();

    const input = applicationSchema.parse({
        company: formData.get("company"),
        position: formData.get("position"),
        status: "Applied",
        job_url: formData.get("job_url") ?? "",
        notes: formData.get("notes") ?? "",
    });

    const { error } = await supabase.from("applications").insert({
        user_id: user.id,
        company: input.company,
        position: input.position,
        status: input.status,
        job_url: input.job_url || null,
        notes: input.notes || null,
        applied_at: new Date().toISOString().slice(0, 10),
    });

    if (error) throw new Error(error.message);

    revalidatePath("/");
}

export async function updateApplicationStatus(
    id: string,
    status: string
) {
    const { supabase, user } = await requireUser();

    const validId = z.uuid().parse(id);
    const validStatus = z.enum(statuses).parse(status);

    const { error } = await supabase
        .from("applications")
        .update({ status: validStatus })
        .eq("id", validId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/");
}

export async function deleteApplication(id: string) {
    const { supabase, user } = await requireUser();

    const validId = z.uuid().parse(id);

    const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", validId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/");
}

export async function signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) throw new Error(error.message);

    redirect("/login");
}


const followUpSchema = z.object({
    application_id: z.uuid(),
    due_at: z.iso.datetime({ offset: true }),
    notes: z.string().trim().max(2000),
});

export async function createFollowUp(formData: FormData) {
    const { supabase, user } = await requireUser();

    const input = followUpSchema.parse({
        application_id: formData.get("application_id"),
        due_at: formData.get("due_at"),
        notes: formData.get("notes") ?? "",
    });

    // Confirm the application belongs to the signed-in user.
    const { data: application, error: lookupError } = await supabase
        .from("applications")
        .select("id")
        .eq("id", input.application_id)
        .eq("user_id", user.id)
        .single();

    if (lookupError || !application) {
        throw new Error("Application not found");
    }

    const { error } = await supabase.from("follow_ups").insert({
        user_id: user.id,
        application_id: input.application_id,
        due_at: input.due_at,
        notes: input.notes || null,
        status: "Pending",
    });

    if (error) throw new Error(error.message);

    revalidatePath("/follow-ups");
}

export async function completeFollowUp(id: string) {
    const { supabase, user } = await requireUser();
    const validId = z.uuid().parse(id);

    const { error } = await supabase
        .from("follow_ups")
        .update({
            status: "Completed",
            completed_at: new Date().toISOString(),
        })
        .eq("id", validId)
        .eq("user_id", user.id)
        .eq("status", "Pending");

    if (error) throw new Error(error.message);

    revalidatePath("/follow-ups");
}

export async function deleteFollowUp(id: string) {
    const { supabase, user } = await requireUser();
    const validId = z.uuid().parse(id);

    const { error } = await supabase
        .from("follow_ups")
        .delete()
        .eq("id", validId)
        .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    revalidatePath("/follow-ups");
}

