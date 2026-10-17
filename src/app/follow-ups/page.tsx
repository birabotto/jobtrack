
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FollowUpsDashboard from "@/components/follow-ups-dashboard";

async function FollowUpsContent() {
    await connection();

    const supabase = await createClient();

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    const [applicationsResult, followUpsResult] = await Promise.all([
        supabase
            .from("applications")
            .select("id, company, position")
            .eq("user_id", user.id)
            .order("company"),
        supabase
            .from("follow_ups")
            .select("id, application_id, due_at, status, notes, completed_at")
            .eq("user_id", user.id)
            .order("due_at", { ascending: true }),
    ]);

    if (applicationsResult.error) {
        throw new Error(applicationsResult.error.message);
    }

    if (followUpsResult.error) {
        throw new Error(followUpsResult.error.message);
    }

    return (
        <FollowUpsDashboard
            applications={applicationsResult.data ?? []}
            followUps={followUpsResult.data ?? []}
        />
    );
}

export default function FollowUpsPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-slate-950 p-10 text-slate-300">
                    Loading follow-ups...
                </main>
            }
        >
            <FollowUpsContent />
        </Suspense>
    );
}
