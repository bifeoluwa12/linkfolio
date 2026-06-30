

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If no session, boot to login. This is tenant isolation at the routing level.
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {children}
    </div>
  );
}