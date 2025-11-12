import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration getKey={(location) => location.pathname} />
    </div>
  );
}
