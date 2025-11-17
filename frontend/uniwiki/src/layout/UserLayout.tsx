// src/layout/UserLayout.tsx
import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

export default function UserLayout() {
  const location = useLocation();

  const menuItems = [
    { path: "/user/profile", label: "내 정보" }, 
    { path: "/user/contributions", label: "기여 문서 목록" },
    { path: "/user/discussions", label: "참여 토론 목록" },
    { path: "/user/favorite", label: "즐겨찾기" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
        <div className="grid grid-cols-1 lg:[grid-template-columns:minmax(0,2.2fr)_minmax(0,0.8fr)] gap-8">
          {/* 왼쪽(메인 영역) */}
          <div className="min-w-0">
            <Outlet />
          </div>

          {/* 오른쪽(메뉴 박스) */}
          <aside className="space-y-6 min-w-0">
            <nav className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <ul className="space-y-2 text-sm text-gray-700">
                {menuItems.map((item, index) => {
                  const active = location.pathname === item.path;
                  return (
                    <React.Fragment key={item.path}>
                      <li className="ms-2">
                        <Link
                          to={item.path}
                          className={`block truncate hover:underline ${
                            active ? "font-medium text-uniwikicolor" : "text-gray-700"
                          }`}
                          title={item.label}
                        >
                          {item.label}
                        </Link>
                      </li>
                      {index === 0 && <hr className="my-3 border-gray-200" />}
                    </React.Fragment>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
