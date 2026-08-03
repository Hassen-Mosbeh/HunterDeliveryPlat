import Sidebar from "@/components/adminDashboard/Sidebar";
import Navbar from "@/components/adminDashboard/Navbar";
import Footer from "@/components/adminDashboard/Footer";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Navbar />

        <main className="flex-1 p-6 bg-white">
          {children}
        </main>

        <Footer />
      </div>
    </div>
    </ProtectedRoute>
  );
}