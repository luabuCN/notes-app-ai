import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="h-screen w-full flex flex-col items-center">
      <div className="h-screen w-full flex items-center justify-center">{children}</div>
      <Toaster />
    </div>
  );
}
