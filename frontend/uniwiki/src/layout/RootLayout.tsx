import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
