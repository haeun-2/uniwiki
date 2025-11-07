// src/pages/DocumentCreatePage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronUp } from "lucide-react";

import MDEditor from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const API_BASE = "http://k13d104.p.ssafy.io/api";

type CreateResponse = {
  documentId: number;
  documentTitle: string;
  universityName?: string;
  categoryId?: number;
  categoryName?: string;
};

const CATEGORY_OPTIONS = [
  { id: 1, name: "학교" },
  { id: 2, name: "학과" },
  { id: 3, name: "강의" },
  { id: 4, name: "시설" },
  { id: 5, name: "행사" },
  { id: 6, name: "기타" },
];

function getAccessToken() {
  try { return localStorage.getItem("accessToken") || ""; } catch { return ""; }
}
function authHeaders(extra: HeadersInit = {}) {
  const t = getAccessToken();
  return t ? { ...extra, Authorization: `Bearer ${t}` } : extra;
}
const enc = (s: string) => encodeURIComponent(s || "");

export default function DocumentCreatePage() {
  const { univName = "대학교" } = useParams();
  const univSeg = enc(univName);
  const navigate = useNavigate();

  // ── 입력 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [editMemo, setEditMemo] = useState("");

  // ── UI 상태
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── 미리보기 Sanitize 스키마 (프로젝트와 동일)
  const rehypeSchema = useMemo(
    () =>
      ({
        ...defaultSchema,
        attributes: {
          ...defaultSchema.attributes,
          a: [...(defaultSchema.attributes?.a || []), ["target"], ["rel"]],
          img: [
            ...(defaultSchema.attributes?.img || []),
            ["alt"],
            ["title"],
            ["width"],
            ["height"],
          ],
        },
      }) as Parameters<typeof rehypeSanitize>[0],
    []
  );

  const univHref = `/univ/${univSeg}`;

  const disabled = !title.trim() || !categoryId || posting;
  const onSubmit = async () => {
    if (disabled) return;

    // 로그인 체크
    if (!getAccessToken()) {
      navigate("/login", {
        replace: false,
        state: { from: location.pathname },
      });
      return;
    }

    setPosting(true);
    setErrorMsg("");
    try {
      // ⚠️ 백엔드 스펙 추정: 실제 필드명과 다를 수 있으니 백엔드 열리면 맞춰 수정
      const body = {
        documentTitle: title.trim(),
        documentContent: content ?? "",
        categoryId,                       // 기본: 카테고리 단일 선택
        editMemo: editMemo?.trim() || "", // "편집 내용 요약"
        universityName: univName,         // 필요 시 활용
      };

      const res = await fetch(`${API_BASE}/v1/documents`, {
        method: "POST",
        headers: authHeaders({
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }
      if (res.status === 403) {
        setErrorMsg("해당 학교 소속만 문서를 생성할 수 있습니다.");
        return;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `문서 생성 실패 (${res.status})`);
      }

      const j: CreateResponse = await res.json().catch(() => ({} as any));
      const finalTitle = j?.documentTitle || title.trim();

      // 문서 보기로 이동 + 플래시
      navigate(`/univ/${univSeg}/docs/${enc(finalTitle)}`, {
        replace: true,
        state: { flash: { msg: "새 문서를 생성했습니다." } },
      });
    } catch (e: any) {
      setErrorMsg(e?.message || "문서 생성 중 오류가 발생했습니다.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* 브레드크럼 */}
        <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li>
              <Link to={univHref} className="text-[#2C80A0] hover:underline">
                {univName}
              </Link>
            </li>
            <li className="mx-1 text-gray-500">›</li>
            <li className="text-gray-500">새 문서 만들기</li>
          </ol>
        </nav>

        {/* 제목(편집 화면과 유사, 단 입력 가능) + 액션 */}
        <div className="mb-4 flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문서 제목을 입력하세요"
            className="flex-1 rounded-lg border border-[#B3B3B3] bg-white px-3 py-2 text-[28px] font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#2C80A0]"
          />
          <div
            role="tablist"
            aria-label="작업"
            className="grid grid-cols-2 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA]"
          >
            <Link
              to={univHref}
              className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center text-[#7F7F7F] hover:bg-white/60"
            >
              취소
            </Link>
            <button
              onClick={onSubmit}
              disabled={disabled}
              className="h-10 px-4 text-[18px] leading-tight border-l border-[#B3B3B3] bg-[color:var(--uniwikicolor,#2c80a0)] text-white hover:opacity-90 disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>

        {/* 에러 배너 */}
        {errorMsg && (
          <div className="mb-3 rounded-xl bg-[#2C80A0] px-4 py-3 text-white">{errorMsg}</div>
        )}

        {/* 편집/미리보기 두 칼럼 */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 에디터 */}
          <div className="rounded-2xl border border-[#B3B3B3] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[18px] font-medium text-gray-900">본문 편집</h2>
              <span className="text-sm text-gray-500">IMG 업로드는 기존 편집 화면과 동일한 흐름로 추후 연결</span>
            </div>
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(v) => setContent(v ?? "")}
                preview="edit"
                height={560}
              />
            </div>
          </div>

          {/* 미리보기 */}
          <div className="rounded-2xl border border-[#B3B3B3] bg-white p-3">
            <div className="mb-2">
              <h2 className="text-[18px] font-medium text-gray-900">미리보기</h2>
            </div>
            <article data-color-mode="light" className="prose max-w-none">
              <MDEditor.Markdown
                source={content || ""}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeSanitize, rehypeSchema]]}
                style={{
                  backgroundColor: "#FFFFFF",
                  ["--color-canvas-default" as any]: "#FFFFFF",
                  ["--color-canvas-subtle" as any]: "#FFFFFF",
                }}
              />
            </article>
          </div>
        </section>

        {/* 카테고리(단일 선택) */}
        <section className="mt-5 rounded-2xl border border-[#B3B3B3] bg-white p-4">
          <h3 className="mb-2 text-[18px] font-medium text-gray-900">카테고리</h3>
          <div className="flex flex-wrap items-center gap-4">
            {CATEGORY_OPTIONS.map((c) => (
              <label key={c.id} className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  value={c.id}
                  checked={categoryId === c.id}
                  onChange={() => setCategoryId(c.id)}
                />
                <span className="text-[16px] text-gray-800">{c.name}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">* 하나만 선택할 수 있습니다.</p>
        </section>

        {/* 편집 내용 요약 */}
        <section className="mt-5">
          <h3 className="mb-2 text-[18px] font-medium text-gray-900">편집 내용 요약</h3>
          <input
            value={editMemo}
            onChange={(e) => setEditMemo(e.target.value)}
            placeholder="편집 내용을 요약해서 적어주세요."
            className="h-12 w-full rounded-lg border border-[#B3B3B3] bg-white px-3 outline-none focus:ring-2 focus:ring-[#2C80A0]"
          />
          <p className="mt-3 text-[13px] leading-5 text-gray-600">
            문서 편집을 저장하면 당신은 기여한 내용을 CC-BY-NC-SA 2.0 KR로 배포하고 기여한 문서에 대한
            라이선스 이양(저작자표시, 비영리, 동일조건변경허락)에 동의하는 것입니다. 이 동의는 취소할 수
            없습니다.
          </p>
        </section>
      </div>

      {/* 상단 이동 버튼 */}
      {showTop && (
        <button
          onClick={scrollTop}
          className="fixed bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50"
          aria-label="상단으로"
          title="상단으로"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
