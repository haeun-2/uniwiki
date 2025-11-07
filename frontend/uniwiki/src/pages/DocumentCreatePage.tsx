// src/pages/DocumentCreatePage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import MDEditor, { ICommand, TextAreaTextApi, TextState } from "@uiw/react-md-editor";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const API_BASE = "https://k13d104.p.ssafy.io/api";
const PRESIGN_API = `${API_BASE}/v1/s3/presigned-urls`;
const REFRESH_URL = `${API_BASE}/v1/auth/refresh`;

/* ===================== Auth & Storage utils ===================== */
function decodeJwtPayload(token: string): any | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function getAccessToken(): string {
  try {
    const t = localStorage.getItem("accessToken");
    if (!t) return "";
    const payload = decodeJwtPayload(t);
    if (payload && typeof payload.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (now >= payload.exp) {
        localStorage.removeItem("accessToken");
        return "";
      }
    }
    return t;
  } catch {
    return "";
  }
}
function setAccessToken(t: string) {
  try { localStorage.setItem("accessToken", t); } catch {}
}
function authHeaders(extra: HeadersInit = {}) {
  const token = getAccessToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}
async function refreshAccessToken(): Promise<string | null> {
  try {
    const r = await fetch(REFRESH_URL, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j = await r.json().catch(() => ({}));
    const t = j?.accessToken || j?.token;
    if (!t) return null;
    setAccessToken(t);
    return t;
  } catch {
    return null;
  }
}
async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const first = await fetch(input, { ...init, headers: authHeaders(init.headers || {}) });
  if (first.status !== 401) return first;
  const newTok = await refreshAccessToken();
  if (!newTok) return first;
  return fetch(input, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${newTok}` } });
}

/** 로그인 후 localStorage에서 universityId를 최대한 유연하게 읽어온다. */
function getUniversityIdFromStorage(): number | null {
  try {
    const singleKeys = ["universityId", "univId", "schoolId"];
    for (const k of singleKeys) {
      const raw = localStorage.getItem(k);
      if (raw != null && raw !== "") {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) return n;
      }
    }
    const objectKeys = ["user", "profile", "me"];
    for (const k of objectKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const o = JSON.parse(raw);
        const cand =
          o?.universityId ??
          o?.univId ??
          o?.schoolId ??
          (o?.user && (o.user.universityId ?? o.user.univId ?? o.user.schoolId));
        const n = Number(cand);
        if (Number.isFinite(n) && n > 0) return n;
      } catch {}
    }
  } catch {}
  return null;
}
/* =============================================================== */

const MAX_IMAGE_MB = 10;
const isImage = (f?: File | null) => !!f && f.type.startsWith("image/");
const overLimit = (f: File) => f.size > MAX_IMAGE_MB * 1024 * 1024;

const CATEGORY_OPTIONS = [
  { id: 1, name: "학교" },
  { id: 2, name: "학과" },
  { id: 3, name: "강의" },
  { id: 4, name: "시설" },
  { id: 5, name: "행사" },
  { id: 6, name: "기타" },
] as const;

/* ---------- S3 Presign 발급/업로드 ---------- */
async function getPresignedUrl(): Promise<string> {
  const r = await fetchWithAuth(PRESIGN_API, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (r.status === 401) throw Object.assign(new Error("E401"), { code: 401 });
  if (r.status === 403) {
    const msg = await r.text().catch(() => "");
    throw Object.assign(new Error(`E403:${msg || ""}`), { code: 403 });
  }
  if (!r.ok) throw new Error((await r.text().catch(() => "")) || "presigned URL 발급 실패");
  const j = await r.json();
  if (!j?.presignedUrl) throw new Error("presignedUrl 없음");
  return j.presignedUrl as string;
}
async function uploadToS3ViaPresign(file: File): Promise<string> {
  const presignedUrl = await getPresignedUrl();
  const fileUrl = presignedUrl.split("?")[0];
  let put = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) put = await fetch(presignedUrl, { method: "PUT", body: file });
  if (!put.ok) throw new Error((await put.text().catch(() => "")) || "S3 업로드 실패");
  return fileUrl;
}

/* ---------- 컴포넌트 ---------- */
export default function DocumentCreatePage() {
  const { univName = "대학교" } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const enc = (s: string) => encodeURIComponent(s || "");

  // 입력값
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // storage에서 읽은 universityId
  const [universityId, setUniversityId] = useState<number | null>(null);

  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 🔹 라이선스 동의(체크해야 생성 가능)
  const [agree, setAgree] = useState<boolean>(false);

  useEffect(() => {
    const uid = getUniversityIdFromStorage();
    setUniversityId(uid);
  }, []);

  // sanitize 확장
  const sanitizeSchema: any = useMemo(
    () => ({
      ...defaultSchema,
      attributes: {
        ...(defaultSchema as any).attributes,
        a: [...(((defaultSchema as any).attributes?.a) || []), "target", "rel"],
        img: ["src", "alt", "title"],
      },
    }),
    []
  );

  async function handleFiles(files: FileList | null, appendAtEnd = true) {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter(isImage);
    if (images.length === 0) return;
    const big = images.find(overLimit);
    if (big) {
      alert(`이미지 용량이 큽니다. 최대 ${MAX_IMAGE_MB}MB까지 허용됩니다.`);
      return;
    }
    try {
      setBusy(true);
      const urls = await Promise.all(images.map(uploadToS3ViaPresign));
      const md = urls.map((u, i) => `![image${i + 1}](${u})`).join("\n");
      setContent((prev) => (appendAtEnd ? `${prev.trimEnd()}\n\n${md}\n` : `${md}\n${prev}`));
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.startsWith("E401")) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }
      if (msg.startsWith("E403")) {
        alert(msg.replace(/^E403:/, "") || "이미지 업로드 권한이 없습니다.");
        return;
      }
      alert(e?.message || "이미지 업로드 실패");
    } finally {
      setBusy(false);
    }
  }

  const uploadImageCommand: ICommand = {
    name: "uploadImage",
    keyCommand: "uploadImage",
    buttonProps: { "aria-label": "이미지 업로드" },
    icon: <span style={{ fontSize: 12, fontWeight: 700 }}>IMG</span>,
    execute: async (_state: TextState, api: TextAreaTextApi) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!isImage(file)) return;
        if (file && overLimit(file)) {
          alert(`이미지 용량이 큽니다. 최대 ${MAX_IMAGE_MB}MB까지 허용됩니다.`);
          return;
        }
        try {
          setBusy(true);
          const url = await uploadToS3ViaPresign(file!);
          api.replaceSelection(`![${file!.name}](${url} "${file!.name}")`);
        } catch (e: any) {
          const msg = String(e?.message || "");
          if (msg.startsWith("E401")) {
            navigate("/login", { replace: true, state: { from: location.pathname } });
            return;
          }
          if (msg.startsWith("E403")) {
            alert(msg.replace(/^E403:/, "") || "이미지 업로드 권한이 없습니다.");
            return;
          }
          alert(e?.message || "이미지 업로드 실패");
        } finally {
          setBusy(false);
        }
      };
      input.click();
    },
  };

  // 🔒 동의 + 제목 + 카테고리 + universityId 모두 있어야 저장 가능
  const canSave =
    agree &&
    !!title.trim() &&
    !!categoryId &&
    !busy &&
    !saving &&
    universityId != null &&
    universityId > 0;

  // 저장(문서 생성): POST /api/v1/documents
  const onCreate = async () => {
    if (!canSave) return;

    const token = getAccessToken();
    if (!token) {
      alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const body = {
        universityId: Number(universityId),
        categoryId: Number(categoryId),
        documentTitle: title.trim(),
        documentContent: content ?? "",
      };

      const res = await fetchWithAuth(`${API_BASE}/v1/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }
      if (res.status === 403) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "문서 생성 권한이 없습니다.");
      }
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "문서 생성 실패");
      }

      navigate(`/univ/${enc(univName)}/docs/${enc(title)}`, {
        state: { flash: { type: "success", msg: "문서가 생성되었습니다." } },
        replace: false,
      });
    } catch (e: any) {
      setErrorMsg(e?.message || "문서 생성 실패");
    } finally {
      setSaving(false);
    }
  };

  const cancelHref = `/univ/${enc(univName)}`;

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 gap-6">
        <div className="lg:col-span-8">
          {/* 브레드크럼 */}
          <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1">
              <li>
                <Link to={`/univ/${enc(univName)}`} className="text-[#2C80A0] hover:underline">
                  {decodeURIComponent(univName)}
                </Link>
              </li>
            </ol>
          </nav>

          {/* 제목 입력 */}
          <div className="mb-2">
            <input
              className="w-full rounded-lg border border-[#B3B3B3] bg-white px-3 py-2 text-[28px] font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#2C80A0]"
              placeholder="문서 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="mt-1 text-sm text-gray-500">새 문서 생성</div>
          </div>

          {(busy || saving) && (
            <div className="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
              {busy ? "이미지 업로드 중…" : "저장 중…"}
            </div>
          )}
          {errorMsg && (
            <div className="mt-3 rounded-lg bg-[#2C80A0] px-4 py-2 text-white">{errorMsg}</div>
          )}
          {universityId == null && (
            <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-amber-800">
              로그인 정보에서 <b>universityId</b>를 찾을 수 없습니다. 로그인 상태/학교 인증을 확인해주세요.
            </div>
          )}

          {/* 편집기 */}
          <div className="mt-4" data-color-mode="light">
            <MDEditor
              height={520}
              value={content}
              onChange={(v) => setContent(v || "")}
              preview="live"
              previewOptions={{
                remarkPlugins: [remarkGfm],
                rehypePlugins: [[rehypeSanitize, sanitizeSchema]],
              }}
              extraCommands={[uploadImageCommand]}
              textareaProps={{
                placeholder:
                  "마크다운 작성. 이미지 파일을 붙여넣기/드래그앤드롭하거나 IMG 버튼으로 업로드하세요.",
                onPaste: async (e) => {
                  const items = Array.from(e.clipboardData?.items || []);
                  const file = items.find((i) => i.kind === "file")?.getAsFile();
                  if (isImage(file)) {
                    e.preventDefault();
                    await handleFiles({ 0: file!, length: 1, item: () => file! } as any, true);
                  }
                },
                onDrop: async (e) => {
                  if (e.dataTransfer?.files?.length) {
                    e.preventDefault();
                    await handleFiles(e.dataTransfer.files, true);
                  }
                },
              }}
            />
          </div>

          {/* 카테고리 */}
          <div className="mt-6">
            <p className="mb-2 text-gray-900 font-medium">카테고리</p>
            <div className="flex flex-wrap gap-x-10 gap-y-2 text-[15px]">
              {CATEGORY_OPTIONS.map((opt) => (
                <label key={opt.id} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="doc-category"
                    checked={categoryId === opt.id}
                    onChange={() => setCategoryId(opt.id)}
                  />
                  {opt.name}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              현재 선택:{" "}
              <span className="font-medium text-gray-800">
                {CATEGORY_OPTIONS.find((c) => c.id === categoryId)?.name || "—"}
              </span>
            </p>
          </div>

          {/* 🔹 라이선스 동의 */}
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1"
            />
            <span className="text-[14px] leading-relaxed text-gray-700">
              문서 편집을 저장하면 당신은 기여한 내용을 CC-BY-NC-SA 2.0 KR로 배포하고 기여한 문서에 대한
              라이선스 이용(저작자 표시, 비영리, 동일조건변경허락)에 동의하는 것입니다. 이 동의는 철회할 수 없습니다.
            </span>
          </label>

          {/* 버튼 */}
          <div className="mt-5 flex justify-end gap-3">
            <Link
              to={cancelHref}
              className="inline-flex min-w-[104px] items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              onClick={onCreate}
              disabled={!canSave}
              className="inline-flex min-w-[104px] items-center justify-center rounded-xl bg-[#2C80A0] px-5 py-2 font-medium text-white hover:bg-[#276E86] disabled:opacity-40 disabled:cursor-not-allowed"
              title={
                !agree
                  ? "라이선스 동의가 필요합니다."
                  : universityId == null
                  ? "로그인 정보에 universityId가 없습니다."
                  : !title.trim()
                  ? "제목을 입력하세요."
                  : !categoryId
                  ? "카테고리를 선택하세요."
                  : busy
                  ? "이미지 업로드가 끝난 뒤 저장할 수 있습니다."
                  : saving
                  ? "저장 중입니다."
                  : undefined
              }
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
