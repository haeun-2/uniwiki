import React, { useEffect,  useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, UserRound, LogOut } from "lucide-react";

interface HeaderProps {
  showSearch?: boolean;
  showUserButton?: boolean;
}

const AUTH_KEYS = [
  "accessToken",
  "refreshToken",      // 쓰지 않으면 남겨두셔도 무방
  "nickName",
  "role",
  "universityId",
  "userId",
] as const;

const getAccessToken = () =>
  localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

export default function Header({
  showSearch = true,
  showUserButton = true,
}: HeaderProps) {
  const location = useLocation()
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // accessToken 존재 여부로 로그인 상태 판단
  useEffect(() => {
    // 최초 1회
    setIsLoggedIn(!!getAccessToken());

    const refreshAuth = () => setIsLoggedIn(!!getAccessToken());

    // 같은 탭에서 로그인/로그아웃 시 커스텀 이벤트로 갱신
    window.addEventListener("uniwiki:auth-changed", refreshAuth);

    // 다른 탭에서 바뀐 경우 동기화
    window.addEventListener("storage", refreshAuth);

    // 탭 전환/새로 포커스 시에도 재확인
    window.addEventListener("focus", refreshAuth);
    document.addEventListener("visibilitychange", refreshAuth);

    return () => {
      window.removeEventListener("uniwiki:auth-changed", refreshAuth);
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("focus", refreshAuth);
      document.removeEventListener("visibilitychange", refreshAuth);
    };
  }, []);

  // 바깥 클릭으로 닫기
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // ESC로 닫기
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!getAccessToken());
  }, []);

  const handleLogout = () => {
    AUTH_KEYS.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });

    setIsLoggedIn(false);
    setOpen(false);

    alert("로그아웃되었습니다.");

    window.location.reload();
  };
  
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

        {/* 검색창 */}
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

        {/* 사용자 버튼 */}
        {showUserButton && (
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-gray-50 hover:text-gray-600 focus:bg-gray-50 focus:text-gray-600"
            >
              <UserRound size={18} />
            </button>

            {/* 드롭다운 메뉴 */}
            {open && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="사용자 메뉴"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                {isLoggedIn ? (
                  <div className="py-1">
                    {(() => {
                      const role =
                        localStorage.getItem("role") || sessionStorage.getItem("role");
                      if (role === "ADMIN") {
                        return (
                          <Link
                            to="/admin"
                            role="menuitem"
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setOpen(false)}
                          >
                            관리자 페이지로
                          </Link>
                        );
                      }
                      return null;

                      <div className="my-1 h-px bg-gray-100" />
                    })()}

                    <Link
                      to="/profile"
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      내 정보
                    </Link>

                    <div className="my-1 h-px bg-gray-100" />
                    
                    <Link
                      to="/user/contributions"
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      기여 문서 목록
                    </Link>
                    <Link
                      to="/user/discussions"
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      참여 토론 목록
                    </Link>
                    <Link
                      to="/user/favorite"
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      즐겨찾기
                    </Link>

                    <div className="my-1 h-px bg-gray-100" />

                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <div className="py-1">
                    <Link
                      to="/login"
                      state={{ from: location.pathname + location.search + location.hash }}
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpen(false)}
                    >
                      로그인
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}