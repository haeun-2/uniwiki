// src/layout/CategoryLayout.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import RecentEdit from "@/layout/RecentEdit";
import RecentDiscuss from "@/layout/RecentDiscuss";

export default function CategoryLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 w-full pb-16 pt-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 왼쪽(또는 중앙) : 카테고리 콘텐츠 */}
            <div className="lg:col-span-3">
              <Outlet />
            </div>

            {/* 오른쪽 : 최근 수정/토론 */}
            <aside className="space-y-6">
              <RecentEdit />
              <RecentDiscuss />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}