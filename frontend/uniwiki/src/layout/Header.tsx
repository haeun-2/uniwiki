import React from "react";
import { Link } from "react-router-dom";
import { Search, UserRound } from "lucide-react";

interface HeaderProps {
  showSearch?: boolean;
  showUserButton?: boolean;
}

export default function Header({
  showSearch = true,
  showUserButton = true,
}: HeaderProps) {
  return (
    <header className="top-0 z-30 w-full border-b border-gray-200 bg-uniwikicolor backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="유니위키"
            className="h-12 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </Link>

        {/* 검색창 (옵션) */}
        {showSearch && (
          <div className="mx-3 flex-1">
            <label className="relative block">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="학교, 학과, 강의 검색…"
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400"
              />
            </label>
          </div>
        )}

        {/* 사용자 버튼 (옵션) */}
        {showUserButton && (
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            <UserRound size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
