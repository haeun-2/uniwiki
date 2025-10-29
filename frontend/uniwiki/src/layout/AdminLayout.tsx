import { Outlet } from "react-router-dom";
import Header from "@/layout/Header";

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header showSearch={false} showUserButton={false} />
      <main className="flex-grow bg-white">
        <Outlet />
      </main>
    </div>
  );
}
