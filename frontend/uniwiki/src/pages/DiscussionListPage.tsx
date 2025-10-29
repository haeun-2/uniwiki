// src/pages/DiscussionListPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronUp } from "lucide-react";

// ✅ 우측 레일 직접 사용 (라우터/레이아웃 변경 없음)
import RecentEdit from "@/layout/RecentEdit";
import RecentDiscuss from "@/layout/RecentDiscuss";

type Discussion = {
  id: string;
  title: string;
  createdAt: string; // ISO
  author?: string;
  status: "open" | "closed";
  commentCount?: number;
};

const SAMPLE_DISCUSSIONS: Discussion[] = [];

export default function DiscussionListPage() {
  const { documentTitle = "문서 제목" } = useParams();
  const docTitleParam = encodeURIComponent(documentTitle);

  const [list, setList] = useState<Discussion[]>(SAMPLE_DISCUSSIONS);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const isEmpty = list.length === 0;
  const canSubmit = content.trim().length > 0;

  const onCreate = () => {
    if (!canSubmit) return;
    const now = new Date();
    const fallbackTitle =
      subject.trim() ||
      content.trim().split("\n")[0].slice(0, 80) ||
      "제목 없음";
    const newItem: Discussion = {
      id: Math.random().toString(36).slice(2),
      title: fallbackTitle,
      createdAt: now.toISOString(),
      author: "나",
      status: "open",
      commentCount: 0,
    };
    setList((prev) => [...prev, newItem]); // 맨 아래 추가
    setSubject("");
    setContent("");
  };

  // 상단 이동 버튼 (문서 화면과 동일)
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 컬럼 */}
        <div className="lg:col-span-8 space-y-6">
          {/* 상자 #1 : 문서정보 + 토론 목록 */}
          <section className="rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
            <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1">
                <li><Link to="/" className="text-[#2C80A0] hover:underline">학교이름</Link></li>
                <li className="mx-1 text-gray-500">›</li>
                <li>
                  <Link
                    to={`/categories/${encodeURIComponent("행사")}`}
                    className="text-[#2C80A0] hover:underline"
                  >
                    행사
                  </Link>
                </li>
              </ol>
            </nav>

            <h1 className="text-[28px] leading-tight font-semibold text-gray-900 mb-2">
              {documentTitle}
            </h1>

            <div className="mb-5 flex items-center gap-4">
              <p className="text-[18px] leading-tight text-gray-800 font-medium">토론</p>
              <div className="ml-auto" />
              <div
                role="tablist"
                aria-label="문서 작업 메뉴"
                className="grid grid-cols-1 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(92px,12vw,116px)]"
              >
                <Link
                  role="tab"
                  aria-selected={false}
                  to={`/docs/${docTitleParam}`}
                  className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center text-[#7F7F7F] hover:bg-white/60"
                >
                  문서로
                </Link>
              </div>
            </div>

            <div>
              {isEmpty ? (
                <p className="py-1 text-[20px] leading-snug text-[#7F7F7F]">
                  진행중인 토론이 없습니다.
                </p>
              ) : (
                <ol className="list-decimal pl-6 space-y-2">
                  {list.map((d) => (
                    <li key={d.id} className="py-1 text-[20px] leading-snug">
                      <Link
                        to={`/docs/${docTitleParam}/discussions/${d.id}`}
                        className="font-semibold text-[#2C80A0] hover:underline"
                      >
                        {d.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          {/* 상자 #2 : 새 토론 생성 */}
          <section className="rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
            <header className="mb-4">
              <h2 className="text-[28px] leading-tight font-semibold text-gray-900">
                새 토론 생성
              </h2>
            </header>

            <div className="space-y-5 px-2 sm:px-3 md:px-4">
              <div>
                <label className="mb-1 block text-[18px] leading-tight font-medium">주제</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="주제를 입력하세요"
                  className="w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C80A0]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[18px] leading-tight font-medium">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="토론을 시작할 내용을 작성하세요"
                  rows={6}
                  className="w-full resize-y rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C80A0]"
                />
                <p className="mt-2 text-sm text-gray-600">내용 수정 및 삭제가 불가능합니다.</p>
              </div>

              <div className="flex items-center justify-between">
                <span />
                <button
                  onClick={onCreate}
                  disabled={!canSubmit}
                  className="h-10 w-[clamp(92px,12vw,116px)] text-[18px] leading-tight rounded-xl bg-[#2C80A0] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  생성
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ✅ 우측 : 최근 수정/토론 — sticky 없이 상단 배치 */}
        <aside className="lg:col-span-4 space-y-6">
          <RecentEdit />
          <RecentDiscuss />
        </aside>
      </div>

      {showTop && (
        <button
          onClick={scrollTop}
          className="fixed bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50"
          aria-label="상단으로 이동"
          title="상단으로 이동"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
