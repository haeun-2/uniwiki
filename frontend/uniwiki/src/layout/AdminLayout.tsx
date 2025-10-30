import { NavLink, Outlet } from "react-router-dom";
import Header from "@/layout/Header";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더: 화면 상단 고정 */}
      <div className="fixed top-0 left-0 right-0 z-30 h-14 overflow-hidden">
        <Header showSearch={false} showUserButton={false} />
      </div>

      {/* 사이드바: 왼쪽에 고정 (헤더 아래부터) */}
      <aside className="fixed top-14 left-0 bottom-0 w-56 bg-gray-50 overflow-y-auto z-20">
        <nav className="flex flex-col pt-4 text-sm">
          <NavLink
            to="/admin/user_report"
            className={({ isActive }) =>
              `px-5 py-3 ${
                isActive
                  ? "bg-uniwikicolor text-white font-semibold"
                  : "text-gray-700 hover:bg-white"
              }`
            }
          >
            유저 신고 내역
          </NavLink>
          <NavLink
            to="/admin/discussion_report"
            className={({ isActive }) =>
              `px-5 py-3 ${
                isActive
                  ? "bg-uniwikicolor text-white font-semibold"
                  : "text-gray-700 hover:bg-white"
              }`
            }
          >
            토론 신고 내역
          </NavLink>
          <NavLink
            to="/admin/document"
            className={({ isActive }) =>
              `px-5 py-3 ${
                isActive
                  ? "bg-uniwikicolor text-white font-semibold"
                  : "text-gray-700 hover:bg-white"
              }`
            }
          >
            문서 관리
          </NavLink>
          <NavLink
            to="/admin/discussion"
            className={({ isActive }) =>
              `px-5 py-3 ${
                isActive
                  ? "bg-uniwikicolor text-white font-semibold"
                  : "text-gray-700 hover:bg-white"
              }`
            }
          >
            오래된 토론 관리
          </NavLink>
          <NavLink
            to="/admin/manual"
            className={({ isActive }) =>
              `px-5 py-3 ${
                isActive
                  ? "bg-uniwikicolor text-white font-semibold"
                  : "text-gray-700 hover:bg-white"
              }`
            }
          >
            관리자 매뉴얼
          </NavLink>
        </nav>
      </aside>

      {/* 메인 콘텐츠: 왼쪽 메뉴와 헤더 공간을 제외한 나머지 */}
      <main className="pl-56 pt-14 min-h-screen bg-white">
        <div className="p-8">
          <div className="overflow-x-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
