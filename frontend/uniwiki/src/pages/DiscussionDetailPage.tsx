// src/pages/DiscussionDetailPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronUp } from "lucide-react";

const API_BASE = "http://k13d104.p.ssafy.io/api";

// ===== 토큰/유저 =====
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
function getViewerIdFromStorage(): string | null {
  try {
    const directKeys = ["userId", "userID", "memberId", "id"];
    for (const k of directKeys) {
      const v = localStorage.getItem(k);
      if (v && String(v).trim() !== "") return String(v);
    }
    const objKeys = ["user", "profile", "me"];
    for (const k of objKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const o = JSON.parse(raw);
        const cand = o?.userId ?? o?.id ?? o?.memberId;
        if (cand != null) return String(cand);
      } catch {}
    }
  } catch {}
  return null;
}

// ===== 타입 =====
type TalkMessage = {
  id: string;
  no: number;
  author: string;
  isCreator: boolean;
  body: string;
  createdAt: string; // ISO (서버: TZ 없는 UTC 가정)
};
type TalkDetail = {
  id: string;
  title: string;
  status: "open" | "closed";
  documentTitle: string;
  creatorId?: string | number | null;
  creatorNickname?: string;
  messages: TalkMessage[];
};

export default function DiscussionDetailPage() {
  const { documentTitle = "문서 제목", id = "" } = useParams();

  // UI 상태
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [flash, setFlash] = useState("");

  // 데이터
  const [data, setData] = useState<TalkDetail>({
    id,
    title: "",
    status: "open",
    documentTitle: decodeURIComponent(documentTitle),
    creatorId: null,
    creatorNickname: "",
    messages: [],
  });

  const docTitleParam = encodeURIComponent(data.documentTitle);
  const docPath = `/docs/${docTitleParam}`;

  // 현재 로그인 사용자 id
  const [viewerId, setViewerId] = useState<string | null>(null);
  useEffect(() => {
    setViewerId(getViewerIdFromStorage());
  }, []);

  // 상태
  const [status, setStatus] = useState<"open" | "closed">("open");
  useEffect(() => setStatus(data.status), [data.status]);

  // ---- 시간 포맷(KST) ----
  const formatKST = useMemo(
    () => (iso: string) => {
      const norm = iso.replace(/(\.\d{3})\d+$/, "$1"); // ms 3자리로 정규화
      const hasTZ = /Z$|[+\-]\d{2}:\d{2}$/.test(norm);
      const utcIso = hasTZ ? norm : norm + "Z";
      return new Date(utcIso).toLocaleString("sv-SE", {
        timeZone: "Asia/Seoul",
        hour12: false,
      }); // YYYY-MM-DD HH:mm:ss
    },
    []
  );

  // 성공 배너 자동 닫힘
  useEffect(() => {
    if (!flash) return;
    const auto = /등록되었습니다|생성되었습니다|종료되었습니다/.test(flash);
    if (!auto) return;
    const t = setTimeout(() => setFlash(""), 2500);
    return () => clearTimeout(t);
  }, [flash]);

  // 스크롤
  const panelRef = useRef<HTMLDivElement>(null);
  const [showTopPage, setShowTopPage] = useState(false);
  const [showTopPanel, setShowTopPanel] = useState(false);
  useEffect(() => {
    const onWinScroll = () => setShowTopPage(window.scrollY > 300);
    window.addEventListener("scroll", onWinScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWinScroll);
  }, []);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const onPanelScroll = () => setShowTopPanel(el.scrollTop > 200);
    el.addEventListener("scroll", onPanelScroll, { passive: true });
    return () => el.removeEventListener("scroll", onPanelScroll);
  }, []);
  const scrollPageTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollPanelTop = () => panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  // ----- 상세 조회 -----
  const loadDetail = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/v1/discussions/${id}`, {
        headers: { Accept: "application/json", ...authHeaders() },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`상세 조회 실패 (${res.status})`);
      const j = await res.json();

      const mapped: TalkDetail = {
        id: String(j.discussionId),
        title: j.discussionTitle,
        status: j.discussionStatus === "OPEN" ? "open" : "closed",
        documentTitle: j.documentTitle || decodeURIComponent(documentTitle),
        creatorId: j.creatorId ?? null,
        creatorNickname: j.creatorNickname,
        messages: (j.discussionContents ?? []).map((c: any) => ({
          id: String(c.discussionContentId),
          no: Number(c.contentNumber),
          author: String(c.writerNickname ?? ""),
          isCreator: Boolean(c.isCreator),
          body: String(c.discussionContent ?? ""),
          createdAt: String(c.createdAt),
        })),
      };

      setData(mapped);
      setStatus(mapped.status);
    } catch (e: any) {
      setErrorMsg(e?.message || "토론을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, documentTitle]);

  // ----- 개설자 == 현재 사용자 ? 종료 버튼 -----
  const isCreator = useMemo(() => {
    if (viewerId == null || data.creatorId == null) return false;
    return String(viewerId) === String(data.creatorId);
  }, [viewerId, data.creatorId]);

  const [closing, setClosing] = useState(false);
  const onCloseDiscussion = async () => {
    if (!isCreator || status !== "open" || closing) return;
    setClosing(true);
    setFlash("");
    try {
      // ✅ 실제 스펙: PATCH /api/v1/discussions/{id}/close
      const res = await fetch(`${API_BASE}/v1/discussions/${id}/close`, {
        method: "PATCH",
        headers: { Accept: "application/json", ...authHeaders() },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`토론 종료 실패 (${res.status})`);
      setFlash("토론이 종료되었습니다.");
      await loadDetail();
    } catch (e: any) {
      setFlash(e?.message || "토론 종료에 실패했습니다.");
    } finally {
      setClosing(false);
    }
  };

  // ----- 의견 작성 -----
  const [input, setInput] = useState("");
  const [posting, setPosting] = useState(false);

  const onSubmit = async () => {
    const body = input.trim();
    if (!body || status === "closed" || posting) return;

    if (!getAccessToken()) {
      setFlash("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
      return;
    }

    setPosting(true);
    setFlash("");
    try {
      // ✅ 실제 스펙: POST /api/v1/discussions/{id}/contents
      const res = await fetch(`${API_BASE}/v1/discussions/${id}/contents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ discussionContent: body }),
      });

      if (res.status === 401) {
        setFlash("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
        return;
      }
      if (res.status === 403) {
        setFlash("해당 학교 소속 학생만 의견을 작성할 수 있습니다.");
        return;
      }
      if (!res.ok) {
        setFlash(`의견 생성 실패 (${res.status})`);
        return;
      }

      setInput("");
      setFlash("의견이 등록되었습니다.");
      await loadDetail();
    } catch {
      setFlash("네트워크 오류로 의견을 등록하지 못했습니다.");
    } finally {
      setPosting(false);
    }
  };

  // 상태 네모
  const StatusRect = (
    <span
      className="inline-flex h-10 w-[clamp(92px,12vw,116px)] items-center justify-center rounded-xl border text-[18px] leading-tight"
      style={{
        borderColor: "#B3B3B3",
        color: status === "open" ? "#2C80A0" : "#B3B3B3",
        backgroundColor: "#FFFFFF",
      }}
      aria-label={`토론 상태: ${status === "open" ? "열림" : "종료"}`}
    >
      {status === "open" ? "열림" : "종료"}
    </span>
  );

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 gap-6">
        {/* Left */}
        <div className="lg:col-span-8 space-y-6">
          {/* 상자 #1 : 헤더 + 액션바 + 패널 */}
          <section className="rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
            {/* 배너 */}
            {errorMsg && (
              <div className="mb-4 rounded-xl bg-[#2C80A0] text-white px-4 py-3 text-[16px]">
                {errorMsg}
              </div>
            )}
            {flash && !errorMsg && (
              <div className="mb-4 rounded-xl bg-[#2C80A0] text-white px-4 py-3 text-[16px]">
                {flash}
              </div>
            )}

            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-[28px] leading-tight font-semibold text-gray-900">
                {data.title || "토론 상세"}
              </h1>

              {status === "open" && isCreator ? (
                <button
                  onClick={onCloseDiscussion}
                  disabled={closing}
                  className="h-10 w-[clamp(92px,12vw,116px)] rounded-xl bg-[color:var(--uniwikicolor,#2c80a0)] text-white flex items-center justify-center hover:opacity-90 text-[18px] leading-tight disabled:opacity-60"
                >
                  {closing ? "종료 중…" : "종료하기"}
                </button>
              ) : (
                StatusRect
              )}
            </div>

            <div className="mb-5 flex items-center gap-4">
              <p className="text-[18px] leading-tight text-gray-800 font-medium">
                ‘{data.documentTitle}’에 관한 토론
              </p>
              <div className="ml-auto" />
              <div
                role="tablist"
                aria-label="문서 작업 메뉴"
                className="grid grid-cols-2 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(184px,24vw,236px)]"
              >
                <Link
                  role="tab"
                  aria-selected={false}
                  to={`${docPath}/discussions`}
                  className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center text-[#7F7F7F] hover:bg-white/60"
                >
                  토론 목록
                </Link>
                <Link
                  role="tab"
                  aria-selected={false}
                  to={docPath}
                  className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                >
                  문서로
                </Link>
              </div>
            </div>

            {/* 토론 카드 패널 */}
            <div className="relative rounded-xl">
              <div
                ref={panelRef}
                className="max-h-[760px] overflow-y-auto rounded-xl p-1"
                style={{ maxHeight: "72vh" }}
              >
                {loading ? (
                  <div className="px-3 py-2 text-[18px] text-[#7F7F7F]">불러오는 중…</div>
                ) : (
                  <ul className="space-y-3">
                    {data.messages.map((m) => (
                      <li key={m.id} className="rounded-lg border border-[#B3B3B3]">
                        <div
                          className={
                            "flex items-center justify-between rounded-t-lg px-3 py-2 text-sm " +
                            (m.isCreator
                              ? "bg-[color:var(--uniwikicolor,#2c80a0)] text-white"
                              : "bg-gray-200 text-gray-700")
                          }
                        >
                          <div className="font-semibold">#{m.no} {m.author}</div>
                          <div className="opacity-80">{formatKST(m.createdAt)}</div>
                        </div>
                        <div className="whitespace-pre-wrap rounded-b-lg bg-white px-3 py-3 text-gray-800">
                          {m.body}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 패널 우하단 상단이동 버튼 */}
              {showTopPanel && (
                <button
                  onClick={scrollPanelTop}
                  className="absolute bottom-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50"
                  aria-label="패널 맨 위로"
                >
                  <ChevronUp className="h-5 w-5" strokeWidth={3} />
                </button>
              )}
            </div>
          </section>

          {/* 의견 작성 */}
          <section className="pt-2">
            <header className="mb-4">
              <h2 className="text-[28px] leading-tight font-semibold text-gray-900">의견 작성</h2>
            </header>

            <textarea
              className="h-28 w-full resize-none rounded-lg border border-[#B3B3B3] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C80A0] disabled:cursor-not-allowed disabled:bg-gray-100"
              rows={4}
              placeholder={
                status === "open"
                  ? "의견을 입력하세요"
                  : "종료된 토론입니다. 의견을 작성할 수 없습니다."
              }
              disabled={status === "closed"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="mt-2 text-sm text-gray-600">내용 수정 및 삭제가 불가능합니다.</div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={onSubmit}
                disabled={!input.trim() || status === "closed" || posting}
                className="h-10 w-[clamp(92px,12vw,116px)] rounded-xl bg-[color:var(--uniwikicolor,#2c80a0)] px-5 text-white disabled:opacity-50 disabled:cursor-not-allowed text-[18px] leading-tight"
              >
                {posting ? "생성 중…" : "생성"}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 페이지 우하단 '상단으로' */}
      {showTopPage && (
        <button
          onClick={scrollPageTop}
          className="fixed bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50"
          aria-label="문서 상단으로 이동"
          title="문서 상단으로 이동"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
