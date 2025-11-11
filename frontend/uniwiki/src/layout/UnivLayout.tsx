import React from "react";
import { Outlet, useParams } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import RecentEdit from "@/layout/RecentEdit"
import RecentDiscuss from "@/layout/RecentDiscuss";

export default function UnivLayout() {
  const { univName } = useParams();
  const decodedName = univName ? decodeURIComponent(univName) : "";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 lg:[grid-template-columns:minmax(0,2.2fr)_minmax(0,0.8fr)] gap-8">
          {/* 왼쪽(또는 중앙) : 학교별 주요 콘텐츠 */}
          <div className="min-w-0">
            <Outlet />
          </div>

          {/* 오른쪽 : 최근 수정/토론 */}
          <aside className="space-y-6 min-w-0">
            <RecentEdit univName={decodedName} />
            <RecentDiscuss univName={decodedName} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
