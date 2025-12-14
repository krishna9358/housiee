import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

