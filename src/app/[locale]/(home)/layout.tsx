export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full flex flex-col items-center">
      <div className="h-screen w-full flex items-center justify-center">{children}</div>
    </div>
  );
}