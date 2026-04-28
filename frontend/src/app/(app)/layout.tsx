import Navbar from "@/components/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background w-full flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-8 py-10">
        {children}
      </main>
    </div>
  );
}
