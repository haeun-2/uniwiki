import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // 필요 시 유지

export type DiscussionCode = "OPEN" | "CLOSED" | "RESOLVED" | string;

export type AdminDiscussionItem = {
  discussionId: number;
  discussionTitle: string;
  code: DiscussionCode;
  universityName: string;
  documentTitle: string;
  createdAt: string;
  updatedAt?: string;
};

export type AdminDiscussionResponse = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: AdminDiscussionItem[];
};

const API_BASE = "https://k13d104.p.ssafy.io/api/v1";

function getToken() {
  return (
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const codeStyle: Record<string, string> = {
  OPEN: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  CLOSED: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const isInactive = (iso: string) => {
  const last = new Date(iso).getTime();
  return Date.now() - last >= 14 * MS_IN_DAY
};

export default function AdminDiscussionPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const size = 10;
  const [data, setData] = useState<AdminDiscussionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  // 종료 모달 상태
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [targetDiscussion, setTargetDiscussion] = useState<AdminDiscussionItem | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await fetch(
          `${API_BASE}/admin/discussions?page=${page}&size=${size}`,
          {
            headers: {
              Accept: "*/*",
              Authorization: token ? `Bearer ${token}` : "",
            },
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AdminDiscussionResponse;
        setData(json);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message ?? "불러오기에 실패했습니다");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [page]);

  // ESC로 모달 닫기
  useEffect(() => {
    if (!endModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEndModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [endModalOpen]);

  const rows = data?.content ?? [];

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return rows;
    return rows.filter((d) => d.discussionTitle.includes(kw));
  }, [rows, keyword]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">오래된 토론 목록</h1>

      {/* 상단 바 (검색 및 페이지 정보) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm text-gray-500">
          페이지 {data ? data.page + 1 : page + 1} / {data ? data.totalPages : 1}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="제목으로 검색"
              className="w-64 border rounded-lg px-3 py-2 text-sm pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 border-b bg-gray-50/60 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">
          불러오는 중 오류가 발생했습니다: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto border-t border-gray-200 rounded-2xl bg-white">
          <table className="min-w-[900px] w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr className="border-b">
                <th className="py-2 w-32 text-center">작업</th>
                <th className="py-2 w-48">생성 일시</th>
                <th className="py-2">토론 제목</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const lastActivityIso = d.updatedAt ?? d.createdAt;
                const canEnd = isInactive(lastActivityIso); // 14일 이상 미갱신이면 true
                return (
                  <tr
                    key={d.discussionId}
                    className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      const url = `/univ/${encodeURIComponent(d.universityName)}/docs/${encodeURIComponent(d.documentTitle)}/discussions/${d.discussionId}`;
                      window.open(url, "_blank", "noopener, noreferrer");
                    }}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        (e.currentTarget as HTMLTableRowElement).click();
                      }
                    }}
                  >
                    <td className="py-3 w-32 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTargetDiscussion(d);
                          setEndModalOpen(true);
                        }}
                        disabled={!canEnd}
                        className={`px-3 py-1.5 rounded-md text-sm border
                          ${!canEnd
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-gray-50 border-gray-300 bg-white"
                          }`}
                        title={
                          !canEnd
                            ? "생성 후 14일 이상 지난 토론은 종료할 수 없습니다."
                            : "토론 종료"
                        }
                      >
                        토론 종료
                      </button>
                    </td>
                    <td className="py-3 w-48 text-gray-700">{fmt(d.createdAt)}</td>
                    <td className="py-3">
                      <span className="group-hover:underline inline-block max-w-full truncate">
                        {d.discussionTitle}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                    표시할 토론이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-2 flex items-center gap-1 text-xs">
        <button
          disabled={loading || !(data?.hasPre)}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
        >
          &lt; 이전
        </button>
        <span className="px-2 py-1 rounded border bg-gray-100 font-semibold">
          {data ? data.page + 1 : page + 1}
        </span>
        <button
          disabled={loading || !(data?.hasNext)}
          onClick={() => setPage((p) => p + 1)}
          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
        >
          다음 &gt;
        </button>
      </div>

      {/* 토론 종료 모달 */}
      {endModalOpen && targetDiscussion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setEndModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-[520px] max-w-[92vw] rounded-2xl bg-white shadow-xl border border-gray-200 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">토론 종료</h3>
            <p className="mt-2 text-sm text-gray-600">
              아래 토론을 종료하시겠습니까?
            </p>
            <div className="mt-4 rounded-lg border bg-gray-50 p-3">
              <div className="text-sm font-medium truncate">{targetDiscussion.discussionTitle}</div>
              <div className="mt-1 text-xs text-gray-500">
                ID {targetDiscussion.discussionId} · 생성 {fmt(targetDiscussion.createdAt)}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50"
                onClick={() => setEndModalOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700"
                onClick={async () => {
                  // TODO: 종료 API 연동 필요 시 여기서 호출
                  // 예: await fetch(`${API_BASE}/admin/discussions/${targetDiscussion.discussionId}/close`, { method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` }})
                  setEndModalOpen(false);
                }}
              >
                종료하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
