// src/layout/UserLayout.tsx

import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

export default function UserLayout() {
  const location = useLocation();

  const menuItems = [
    { path: "/user/contributions", label: "기여 문서 목록" },
    { path: "/user/discussions", label: "참여 토론 목록" },
    { path: "/user/favorite", label: "즐겨찾기" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* 왼쪽 : 사용자 페이지 콘텐츠 (더 넓게) */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>

          {/* 오른쪽 : 사용자 메뉴 (더 좁게) */}
          <aside className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <ul className="space-y-2 text-sm">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`block hover:text-gray-900 ${
                        location.pathname === item.path
                          ? "font-medium text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      • {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}