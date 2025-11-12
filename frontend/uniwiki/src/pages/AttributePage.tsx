// src/pages/AttributePage.tsx

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface Contribution {
  documentId: number;
  documentName: string;
  universityName: string;
  editMemo: string;
  plusCount: number;
  minusCount: number;
  updateAt: string;
}

interface PaginationResponse {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: Contribution[];
}

const FLASH_AUTO_MS = 1800;
const REDIRECT_AFTER_MS = FLASH_AUTO_MS + 50;

export default function AttributePage() {
  const navigate = useNavigate();

  // ── Flash (Favorite/DiscussionHistory와 동일 스타일)
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] =
    useState<"success" | "error" | "info">("info");
  const flashTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  const showFlash = (
    msg: string,
    type: "success" | "error" | "info" = "info",
    autoMs = FLASH_AUTO_MS
  ) => {
    setFlash(msg);
    setFlashType(type);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setFlash(""), autoMs);
  };

  const scheduleRedirectToLogin = (msg: string) => {
    showFlash(msg, "error", FLASH_AUTO_MS);
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    redirectTimerRef.current = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, REDIRECT_AFTER_MS);
  };

  const closeFlash = () => {
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    setFlash("");
  };

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const getFlashStyle = () => {
    switch (flashType) {
      case "success":
        return "bg-green-500/80 border-green-600/40";
      case "error":
        return "bg-red-500/80 border-red-600/40";
      default:
        return "bg-blue-500/80 border-blue-600/40";
    }
  };

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 15,
    totalPages: 0,
    totalElements: 0,
    hasPre: false,
    hasNext: false,
  });

  // 인증 체크 공통
  const ensureAuthed = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      scheduleRedirectToLogin("로그인이 필요한 페이지입니다.");
      return null;
    }
    return accessToken;
  };

  // 기여 문서 목록 조회
  const fetchContributions = async (page: number) => {
    const accessToken = ensureAuthed();
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://k13d104.p.ssafy.io/api/v1/users/me/documents?page=${page}&size=15`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data: PaginationResponse = await response.json();
        setContributions(data.content || []);
        setPagination({
          page: data.page,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          hasPre: data.hasPre,
          hasNext: data.hasNext,
        });
      } else if (response.status === 401) {
        localStorage.removeItem("accessToken");
        scheduleRedirectToLogin("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        console.error("기여 문서 목록을 불러오는데 실패했습니다.");
        showFlash("목록을 불러오지 못했습니다.", "error");
      }
    } catch (error) {
      console.error("Fetch contributions error:", error);
      showFlash("서버와의 연결에 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // 페이지 변경 함수
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 날짜 포맷 변환
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/\. /g, ".")
      .replace(/\.$/, "");
  };

  // 바이트 변화량 계산
  const getByteChange = (plusCount: number, minusCount: number) => {
    return plusCount - minusCount;
  };

  if (isLoading) {
    return (
      <>
        {/* Flash */}
        {flash && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-slideDown">
            <div
              className={`${getFlashStyle()} min-w-[320px] max-w-md rounded-xl border px-6 py-4 shadow-lg backdrop-blur-[2px] flex items-center justify-between gap-4`}
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
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}.animate-slideDown{animation:slideDown .3s ease-out}`}</style>

        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Flash */}
      {flash && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-slideDown">
          <div
            className={`${getFlashStyle()} min-w-[320px] max-w-md rounded-xl border px-6 py-4 shadow-lg backdrop-blur-[2px] flex items-center justify-between gap-4`}
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
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}.animate-slideDown{animation:slideDown .3s ease-out}`}</style>

      <div>
        {/* 페이지 헤더 */}
        <h1 className="mb-8 text-3xl font-semibold text-gray-900">
          내가 기여한 문서 목록
        </h1>

        {/* 페이지네이션 버튼 (상단) */}
        {pagination.totalPages > 1 && (
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPre}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt; 이전
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음 &gt;
            </button>
          </div>
        )}

        {/* 기여 목록 */}
        <div className="space-y-4">
          {contributions.map((contribution) => {
            const byteChange = getByteChange(
              contribution.plusCount,
              contribution.minusCount
            );

            return (
              <div
                key={contribution.documentId}
                className="border-b border-gray-200 pb-4"
              >
                {/* 문서 제목 */}
                <div className="mb-1">
                  <Link
                    to={`/docs/${encodeURIComponent(
                      contribution.documentName
                    )}`}
                    className="text-base font-normal text-gray-900 hover:underline"
                  >
                    {contribution.documentName}
                  </Link>
                </div>

                {/* 대학명, 시간, 바이트 변화, 요약 + 링크들 */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-900">
                    {contribution.universityName}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">
                    {formatDate(contribution.updateAt)}
                  </span>
                  <span
                    className={`font-medium ${
                      byteChange > 0
                        ? "text-green-600"
                        : byteChange < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {byteChange > 0 ? "+" : ""}
                    {byteChange}
                  </span>
                  <span className="text-gray-400">
                    ({contribution.editMemo || "수정 내용 없음"})
                  </span>

                  <div className="ml-auto flex gap-2 text-gray-600">
                    <Link
                      to={`/docs/${encodeURIComponent(
                        contribution.documentName
                      )}/history`}
                      className="hover:underline"
                    >
                      역사
                    </Link>
                    <span>|</span>
                    <Link
                      to={`/docs/${encodeURIComponent(
                        contribution.documentName
                      )}/discussions`}
                      className="hover:underline"
                    >
                      토론
                    </Link>
                    <span>|</span>
                    <Link
                      to={`/docs/${encodeURIComponent(
                        contribution.documentName
                      )}/history`}
                      className="hover:underline"
                    >
                      비교
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {contributions.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            기여한 문서가 없습니다.
          </div>
        )}

        {/* 페이지네이션 버튼 (하단) */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPre}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt; 이전
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음 &gt;
            </button>
          </div>
        )}
      </div>
    </>
  );
}
