import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import RecentEdit from "@/layout/RecentEdit"
import RecentDiscuss from "@/layout/RecentDiscuss";

export default function UnivLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽(또는 중앙) : 학교별 주요 콘텐츠 */}
          <div className="lg:col-span-2">
            <Outlet />
          </div>

          {/* 오른쪽 : 최근 수정/토론 */}
          <aside className="space-y-6">
            <RecentEdit />
            <RecentDiscuss />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
