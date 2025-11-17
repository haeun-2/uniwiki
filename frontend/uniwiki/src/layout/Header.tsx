// src/layout/Header.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, UserRound, LogOut, Sparkles, X } from "lucide-react";
import { clearAuthStorage, getAccessToken } from "@/utils/auth";

interface HeaderProps {
  showSearch?: boolean;
  showUserButton?: boolean;
}

const FLASH_AUTO_MS = 3200;
const LOGOUT_FLASH_MS = 2000;

export default function Header({
  showSearch = true,
  showUserButton = true,
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // ✅ 현재 경로가 AI 페이지인지 체크
  const isAiPage = location.pathname.startsWith("/ai-search");

  // ===== 플래시 팝업 상태 =====
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState<"success" | "error" | "info">(
    "info"
  );
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFlash = useCallback(
    (
      msg: string,
      type: "success" | "error" | "info" = "info",
      ms = FLASH_AUTO_MS
    ) => {
      setFlash(msg);
      setFlashType(type);

      if (flashTimerRef.current !== null) {
        clearTimeout(flashTimerRef.current);
        flashTimerRef.current = null;
      }

      flashTimerRef.current = setTimeout(() => {
        setFlash("");
      }, ms);
    },
    []
  );

  const closeFlash = () => {
    if (flashTimerRef.current !== null) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    setFlash("");
  };

  // ✅ 새로고침 후 플래시 메시지 복원
  useEffect(() => {
    const savedMessage = sessionStorage.getItem("flashMessage");
    const savedType = sessionStorage.getItem("flashType") as
      | "success"
      | "error"
      | "info"
      | null;
    const savedTimestamp = sessionStorage.getItem("flashTimestamp");

    if (savedMessage && savedType && savedTimestamp) {
      const elapsed = Date.now() - parseInt(savedTimestamp);

      if (elapsed < 5000) {
        // ✅ 먼저 삭제해서 중복 실행 방지
        sessionStorage.removeItem("flashMessage");
        sessionStorage.removeItem("flashType");
        sessionStorage.removeItem("flashTimestamp");

        // ✅ setTimeout으로 한 틱 지연시켜서 StrictMode 이중 마운트 회피
        setTimeout(() => {
          showFlash(savedMessage, savedType, LOGOUT_FLASH_MS);
        }, 0);
      } else {
        sessionStorage.removeItem("flashMessage");
        sessionStorage.removeItem("flashType");
        sessionStorage.removeItem("flashTimestamp");
      }
    }
  }, [showFlash]);

  useEffect(
    () => () => {
      if (flashTimerRef.current !== null) {
        clearTimeout(flashTimerRef.current);
      }
    },
    []
  );

  // 플래시 타입별 스타일
  const getFlashStyle = () => {
    switch (flashType) {
      case "success":
        return "bg-green-500/80 border-green-600/40";
      case "error":
        return "bg-red-500/80 border-red-600/40";
      default:
        return "bg-blue-500/80 border-blue-600/40"; // info
    }
  };

  // accessToken 존재 여부로 로그인 상태 판단
  useEffect(() => {
    const refreshAuth = () => setIsLoggedIn(!!getAccessToken());

    // 최초 1회
    refreshAuth();

    window.addEventListener("uniwiki:auth-changed", refreshAuth);
    window.addEventListener("storage", refreshAuth);
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

  const handleLogout = () => {
    // ✅ 공통 유틸로 토큰/유저 정보 싹 제거
    clearAuthStorage();

    setIsLoggedIn(false);
    setOpen(false);

    // ✅ 새로고침 후에도 플래시 표시하도록 sessionStorage에 저장
    sessionStorage.setItem("flashMessage", "로그아웃되었습니다.");
    sessionStorage.setItem("flashType", "success");
    sessionStorage.setItem("flashTimestamp", Date.now().toString());

    // ✅ 즉시 새로고침
    window.location.reload();
  };

  return (
    <>
      {/* ===== 플래시 팝업 ===== */}
      {flash && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-slideDown">
          <div
            className={`
              ${getFlashStyle()}
              min-w-[320px] max-w-md
              rounded-xl border
              px-6 py-4
              shadow-lg
              backdrop-blur-[2px]
              flex items-center justify-between gap-4
            `}
          >
            <span className="text-white font-medium text-base flex-1">
              {flash}
            </span>
            <button
              onClick={closeFlash}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* 애니메이션 */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>

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

          {/* 가운데 검색바 + AI 모드 버튼 */}
          {showSearch && !isAiPage && (
            <div className="mx-3 flex-1 flex items-center gap-2">
              <label className="relative block flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <Search size={18} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="학교, 학과, 강의 검색…"
                  className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-400"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const query = (e.target as HTMLInputElement).value;
                      if (query.trim()) {
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                      }
                    }
                  }}
                />
              </label>

              <button
                onClick={() => navigate("/ai-search")}
                className="
                  relative flex items-center gap-1.5 rounded-full
                  px-3 py-2 text-sm font-medium text-gray-900
                  bg-white/95 border border-white/60
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_20px_rgba(0,0,0,0.06)]
                  supports-[backdrop-filter]:backdrop-blur-md
                  hover:bg-white hover:border-white/70
                  focus:outline-none focus:ring-2 focus:ring-uniwikicolor/30
                  transition-all cursor-pointer
                "
                title="AI 자연어 검색"
              >
                <Sparkles size={16} className="text-uniwikicolor" />
                <span className="hidden sm:inline">AI 모드</span>
              </button>
            </div>
          )}

          {/* 오른쪽 사용자 버튼 */}
          {showUserButton && (
            <div className="relative ml-auto">
              <button
                ref={btnRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-gray-50 hover:text-gray-600 focus:bg-gray-50 focus:text-gray-600 cursor-pointer"
              >
                <UserRound size={18} />
              </button>

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
                          localStorage.getItem("role") ||
                          sessionStorage.getItem("role");
                        if (role === "ADMIN") {
                          return (
                            <>
                              <Link
                                to="/admin"
                                role="menuitem"
                                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setOpen(false)}
                              >
                                관리자 페이지로
                              </Link>
                              <div className="my-1 h-px bg-gray-100" />
                            </>
                          );
                        }
                        return null;
                      })()}

                      <Link
                        to="/user/profile"
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
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 cursor-pointer"
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
                        state={{
                          from:
                            location.pathname +
                            location.search +
                            location.hash,
                        }}
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
    </>
  );
}