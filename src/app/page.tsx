
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ApplicationDashboard from "@/components/application-dashboard";

// Dashboard protegido com autenticação Supabase
async function DashboardContent() {
  // Garante que a autenticação seja executada
  // durante uma requisição real.
  await connection();

  const supabase = await createClient();

  // Verifica o usuário autenticado.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Busca as candidaturas do usuário.
  const { data: applications, error } = await supabase
    .from("applications")
    .select(
      "id, company, position, status, applied_at, job_url, notes"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to load applications: ${error.message}`
    );
  }

  // Exibe o Dashboard com os dados do Supabase.
  return (
    <ApplicationDashboard
      applications={applications ?? []}
    />
  );
}

// Tela de carregamento.
function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="text-center">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />

        <h1 className="mb-2 text-2xl font-bold text-emerald-400">
          JobTrack
        </h1>

        <p className="text-sm text-slate-400">
          Loading your applications...
        </p>
      </div>
    </div>
  );
}

// Página principal do Next.js App Router.
export default function HomePage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
