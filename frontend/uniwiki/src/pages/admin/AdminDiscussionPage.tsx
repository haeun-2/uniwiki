import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export type DiscussionCode = "OPEN" | "CLOSED" | "RESOLVED" | string;

export type AdminDiscussionItem = {
  discussionId: number;
  discussionTitle: string;
  code: DiscussionCode;
  createdAt: string;
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

const API_BASE = "http://k13d104.p.ssafy.io/api/v1";

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

export default function AdminDiscussionPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const [data, setData] = useState<AdminDiscussionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

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
          <table className="min-w-[760px] w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr className="border-b">
                <th className="py-2 w-28 text-center">상태</th>
                <th className="py-2 w-48">생성 일시</th>
                <th className="py-2">토론 제목</th>
                <th className="py-2 w-20 text-center">ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.discussionId}
                  className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    // TODO: 실제 상세 경로 확정 시 아래 경로로 변경
                    // navigate(`/docs/${encodeURIComponent(documentTitle)}/discussions/${d.discussionId}`)
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      (e.currentTarget as HTMLTableRowElement).click();
                    }
                  }}
                >
                  <td className="py-3 w-28 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        codeStyle[d.code] ?? "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
                      }`}
                    >
                      {d.code}
                    </span>
                  </td>
                  <td className="py-3 w-48 text-gray-700">{fmt(d.createdAt)}</td>
                  <td className="py-3">
                    <span className="group-hover:underline inline-block max-w-full truncate">
                      {d.discussionTitle}
                    </span>
                  </td>
                  <td className="py-3 w-20 text-center text-gray-400">{d.discussionId}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-gray-500">
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
    </div>
  );
}
