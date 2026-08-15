import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false
  }
};

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function getErrorMessage(error: string | undefined) {
  if (error === "invalid") {
    return "שם המשתמש או הסיסמה לא נכונים.";
  }

  if (error === "config") {
    return "התחברות מנהל לא מוגדרת בסביבת הפרודקשן.";
  }

  return null;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);
  const nextPath = params.next?.startsWith("/admin") ? params.next : "/admin";

  return (
    <main className="min-h-screen bg-black px-5 py-16 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:p-8">
          <p className="text-sm font-black tracking-[0.12em] text-blood">PushTakim Admin</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">כניסת מנהלים</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-zinc-400">
            הכניסה מוגנת ומיועדת לצוות PushTakim בלבד.
          </p>

          {errorMessage && (
            <p className="mt-5 rounded-2xl border border-blood/35 bg-blood/12 px-4 py-3 text-sm font-black text-red-100">
              {errorMessage}
            </p>
          )}

          <form action="/api/admin/login" method="post" className="mt-7 grid gap-4">
            <input type="hidden" name="next" value={nextPath} />
            <label className="grid gap-2 text-sm font-bold text-zinc-200">
              שם משתמש
              <input
                name="username"
                autoComplete="username"
                required
                className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-zinc-200">
              סיסמה
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="min-h-12 rounded-2xl border border-white/10 bg-black/42 px-4 py-3 text-white outline-none transition focus:border-blood"
              />
            </label>

            <button
              type="submit"
              className="motion-button mt-2 inline-flex min-h-14 items-center justify-center rounded-2xl bg-blood px-6 py-4 text-base font-black text-white shadow-[0_18px_70px_rgba(193,18,31,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black active:scale-[0.98]"
            >
              כניסה לדשבורד
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
