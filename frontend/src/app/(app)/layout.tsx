import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64 min-w-0 transition-all">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 w-full mx-auto max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
