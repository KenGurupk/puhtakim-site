import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return (
    <>
      <form action="/api/admin/logout" method="post" className="fixed left-4 top-4 z-40">
        <button
          type="submit"
          className="rounded-full border border-white/10 bg-black/70 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:border-blood hover:text-blood"
        >
          יציאה
        </button>
      </form>
      <AdminDashboard />
    </>
  );
}
