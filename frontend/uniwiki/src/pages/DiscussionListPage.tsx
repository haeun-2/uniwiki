// src/pages/DiscussionListPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronUp } from "lucide-react";

type Discussion = {
  id: string;
  title: string;
  createdAt?: string;
  author?: string;
  status?: "open" | "closed";
  commentCount?: number;
};

type DocumentDto = {
  universityId: number;
  universityName: string;
  categoryId: number;
  categoryName: string;
  documentId: number;
  versionNumber: number;
  documentTitle: string;
  documentContent: string;
  updatedAt: string;
};

const API_BASE = "http://k13d104.p.ssafy.io/api";

// JWT
function getAccessToken() {
  try {
    return localStorage.getItem("accessToken") || "";
  } catch {
    return "";
  }
}
function authHeaders() {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function DiscussionListPage() {
  const { documentTitle = "문서 제목" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const enc = (s: string) => encodeURIComponent(s || "");

  const [docMeta, setDocMeta] = useState<DocumentDto | null>(null);
  const [list, setList] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 플래시 배너
  const [flash, setFlash] = useState<string>("");

  // 새 토론 입력
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const canSubmit = content.trim().length > 0;

  // Scroll-to-top
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ----- 데이터 로딩 -----
  async function fetchDocMeta(title: string) {
    const res = await fetch(`${API_BASE}/v1/documents/${encodeURIComponent(title)}`, {
      headers: { Accept: "application/json", ...authHeaders() },
      credentials: "include",
    });
    if (res.status === 401) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return null;
    }
    if (!res.ok) throw new Error(`문서 조회 실패 (${res.status})`);
    return (await res.json()) as DocumentDto;
  }

  async function fetchDiscussionList(documentId: number) {
    const res = await fetch(
      `${API_BASE}/v1/discussions?document=${documentId}&page=0&size=10`,
      {
        headers: { Accept: "application/json", ...authHeaders() },
        credentials: "include",
      }
    );
    if (res.status === 401) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!res.ok) throw new Error(`토론 목록 실패 (${res.status})`);
    const page = await res.json();

    // 서버 최신순이더라도 화면은 오래된→새로 생성된 순으로
    const itemsRaw = (page?.content ?? []).map((x: any) => ({
      id: String(x.discussionId),
      title: x.discussionTitle,
      status: "open",
    }));
    setList(itemsRaw.slice().reverse());
  }

  useEffect(() => {
    let abort = false;
    (async () => {
      setLoading(true);
      setErrorMsg("");
      setFlash("");
      try {
        const meta = await fetchDocMeta(documentTitle);
        if (!meta || abort) return;
        setDocMeta(meta);
        await fetchDiscussionList(meta.documentId);
      } catch (e: any) {
        if (!abort) setErrorMsg(e?.message || "불러오기에 실패했습니다.");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentTitle]);

  // ----- 토론 생성 -----
  const onCreate = async () => {
    if (!canSubmit || posting) return;

    if (!getAccessToken()) {
      setFlash("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
      return;
    }
    if (!docMeta) {
      setFlash("문서 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.");
      return;
    }

    setPosting(true);
    setFlash("");
    try {
      const res = await fetch(`${API_BASE}/v1/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          documentId: docMeta.documentId,
          discussionTitle:
            subject.trim() || content.trim().split("\n")[0].slice(0, 80) || "제목 없음",
          discussionContent: content.trim(),
        }),
      });

      if (res.status === 401) {
        setFlash("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
        return;
      }
      if (res.status === 403) {
        setFlash("해당 학교 소속 학생만 토론을 생성할 수 있습니다.");
        return;
      }
      if (!res.ok) {
        setFlash(`토론 생성 실패 (${res.status})`);
        return;
      }

      // 성공: 입력 초기화 + 목록 재조회
      await res.json();
      setSubject("");
      setContent("");
      setFlash("토론이 생성되었습니다.");
      await fetchDiscussionList(docMeta.documentId);
    } catch (e: any) {
      setFlash("네트워크 오류로 토론을 생성하지 못했습니다.");
    } finally {
      setPosting(false);
    }
  };

  const isEmpty = !loading && list.length === 0;

  // ----- 경로 구성 (univ/아래로) -----
  const univName = docMeta?.universityName ?? "대학교";
  const cateName = docMeta?.categoryName ?? "카테고리";
  const univHref = `/univ/${enc(univName)}`;
  const cateHref = `/univ/${enc(univName)}/category/${enc(cateName)}`;
  const docHref = `/univ/${enc(univName)}/docs/${enc(documentTitle)}`;

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 gap-6">
        {/* 좌측 */}
        <div className="lg:col-span-8 space-y-6">
          {/* 상자 #1 : 문서정보 + 토론 목록 */}
          <section className="rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
            {/* 플래시 배너 */}
            {flash && (
              <div className="mb-4 rounded-xl bg-[#2C80A0] text-white px-4 py-3 text-[16px]">
                {flash}
              </div>
            )}

            <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1">
                <li>
                  <Link to={univHref} className="text-[#2C80A0] hover:underline">
                    {univName}
                  </Link>
                </li>
                <li className="mx-1 text-gray-500">›</li>
                <li>
                  <Link to={cateHref} className="text-[#2C80A0] hover:underline">
                    {cateName}
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
                  to={docHref}
                  className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center text-[#7F7F7F] hover:bg-white/60"
                >
                  문서로
                </Link>
              </div>
            </div>

            <div>
              {loading ? (
                <p className="py-1 text-[20px] leading-snug text-[#7F7F7F]">불러오는 중…</p>
              ) : errorMsg ? (
                <p className="py-1 text-[20px] leading-snug text-red-600">{errorMsg}</p>
              ) : isEmpty ? (
                <p className="py-1 text-[20px] leading-snug text-[#7F7F7F]">
                  진행중인 토론이 없습니다.
                </p>
              ) : (
                <ol className="list-decimal pl-6 space-y-2">
                  {list.map((d) => (
                    <li key={d.id} className="py-1 text-[20px] leading-snug">
                      <Link
                        to={`${docHref}/discussions/${d.id}`}
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
              <h2 className="text-[28px] leading-tight font-semibold text-gray-900">새 토론 생성</h2>
            </header>

            <div className="space-y-5 px-2 sm:px-3 md:px-4">
              <div>
                <label className="mb-1 block text-[18px] leading-tight font-medium">주제</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="주제를 입력하세요"
                  className="w-full rounded-lg border border-[#B3B3B3] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C80A0]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[18px] leading-tight font-medium">내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="토론을 시작할 내용을 작성하세요"
                  rows={6}
                  className="w-full resize-y rounded-lg border border-[#B3B3B3] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C80A0]"
                />
                <p className="mt-2 text-sm text-gray-600">내용 수정 및 삭제가 불가능합니다.</p>
              </div>

              <div className="flex items-center justify-between">
                <span />
                <button
                  onClick={onCreate}
                  disabled={!canSubmit || posting}
                  className="h-10 w-[clamp(92px,12vw,116px)] text-[18px] leading-tight rounded-xl bg-[#2C80A0] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? "생성 중…" : "생성"}
                </button>
              </div>
            </div>
          </section>
        </div>
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
