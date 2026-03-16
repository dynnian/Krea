import { Outlet } from "react-router";
import { Sidebar } from "../components/Admin/sidebar.tsx";
import { Header } from "../components/Admin/header.tsx";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#E3E2DE]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />  
        </main>
      </div>
    </div>
  );
}