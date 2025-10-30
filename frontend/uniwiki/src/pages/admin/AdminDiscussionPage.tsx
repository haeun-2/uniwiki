import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

/** ---------------- Types & Mocks ---------------- */
type OldDiscussion = {
  id: number;
  createdAt: string;
  title: string;
  ended: boolean; // 종료 여부
};

const mockOldDiscussions: OldDiscussion[] = Array.from({ length: 83 }).map((_, i) => ({
  id: i + 1,
  createdAt: ["2025.9.21 13:21:15","2025.9.26 13:21:15","2025.9.27 13:21:15","2025.10.01 13:21:15","2025.10.04 13:21:15","2025.10.17 13:21:15","2025.10.21 13:21:15","2025.10.22 13:21:15"][i % 8],
  title: [
    "서울대학교 토론 주제",
    "경북대학교 축제 노점인가 아닌가에 대해",
    "고려대학교 학식 맛있는가 아닌가에 대해",
    "한남대학교 수업 재미있는가 아닌가에 대해",
  ][i % 4],
  ended: i % 9 === 0, // 일부만 이미 종료 처리된 상태
}));

/** ---------------- Page ---------------- */
export default function AdminDiscussionPage() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<OldDiscussion[]>(mockOldDiscussions);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [page, rows]);

  const paginationNumbers = useMemo(() => {
    const visible = 10;
    let start = Math.max(1, page - Math.floor(visible / 2));
    let end = start + visible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - visible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const handleEnd = (id: number) => {
    // 실제 연동 시에는 API 호출 후 성공 시 상태 갱신
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ended: true } : r)));
  };

  return (
    <>
      {/* 우측 콘텐츠 */}
      <h1 className="text-xl font-semibold mb-6">토론 관리</h1>

      <div className="overflow-x-auto border-t border-gray-200">
        <table className="min-w-[760px] w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr className="border-b">
              <th className="py-2 w-24 text-center">종료 여부</th>
              <th className="py-2 w-40">일시</th>
              <th className="py-2">토론 제목</th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 text-center">
                  {d.ended ? (
                    <span className="text-gray-400">종료됨</span>
                  ) : (
                    <button
                      onClick={() => handleEnd(d.id)}
                      className="text-uniwikicolor hover:underline cursor-pointer"
                    >
                      종료하기
                    </button>
                  )}
                </td>
                <td className="py-3">{d.createdAt}</td>
                <td className="py-3">
                  <Link to="#" className="hover:underline cursor-pointer">
                    {d.title}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-5 flex items-center gap-1 text-xs">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-2 py-1 rounded border hover:bg-gray-50 cursor-pointer"
        >
          &lt; 이전
        </button>

        {paginationNumbers.map((n) => (
          <button
            key={n}
            onClick={() => setPage(n)}
            className={`px-2 py-1 rounded border hover:bg-gray-50 cursor-pointer ${
              n === page ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            {n}
          </button>
        ))}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-2 py-1 rounded border hover:bg-gray-50 cursor-pointer"
        >
          다음 &gt;
        </button>
      </div>
    </>
  );
}
