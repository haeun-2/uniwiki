import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

type DocumentInfo = {
  id: number;
  category_univ: string;
  category_type: string;
  title: string;
  createdAt: string;
  author: string;
  change: number;
};

const mockDocuments: DocumentInfo[] = Array.from({ length: 47 }).map((_, i) => ({
  id: i + 1,
  category_univ: ["서울대학교", "경북대학교", "인하대학교"][i % 3],
  category_type: ['행사', "강의", "학교"][i % 3],
  title: ["축제", "현대 사회와 문화", "경북대학교"][i % 3],
  createdAt: "2025.10.22 13:21:15",
  author: "김코드",
  change: i % 2 === 0 ? -2800 : 35,
}));

export default function AdminDocumentPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(mockDocuments.length / pageSize));

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mockDocuments.slice(start, start + pageSize);
  }, [page]);

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

  return (
    <>
      {/* 우측 콘텐츠 */}
      <h1 className="text-xl font-semibold mb-6">문서 관리</h1>

      <div className="overflow-x-auto border-t border-gray-200">
        <table className="min-w-[960px] w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr className="border-b">
              <th className="py-2 w-24"></th>
              <th className="py-2 w-40">일시</th>
              <th className="py-2 w-32">작성자</th>
              <th className="py-2 w-24">변경</th>
              <th className="py-2 w-40">카테고리</th>
              <th className="py-2">문서 제목</th>
            </tr>
          </thead>
          <tbody>
            {pageSlice.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="py-3 text-uniwikicolor text-center">
                  <button className="hover:underline cursor-pointer">비교</button>
                  <span className="mx-1 text-gray-400">|</span>
                  <button className="hover:underline cursor-pointer">역사</button>
                </td>
                <td className="py-3">{d.createdAt}</td>
                <td className="py-3">
                  <Link to="#" className="hover:underline">
                    {d.author}
                  </Link>

                </td>
                <td
                  className={`py-3 font-medium ${
                    d.change > 0 ? "text-blue-600" : "text-red-500"
                  }`}
                >
                  {d.change > 0 ? `+${d.change}` : d.change}
                </td>
                <td className="py-3">
                  <button className="hover:underline cursor-pointer">{d.category_univ}</button>
                  <span className="mx-1 text-gray-400">&gt;</span>
                  <button className="hover:underline cursor-pointer">{d.category_type}</button>
                </td>
                <td className="py-3">
                  <Link to="#" className="hover:underline">
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
