// src/pages/DocumentVersionViewPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

type BaseDoc = {
  universityId: number;
  universityName: string;
  categoryId: number;
  categoryName: string;
  documentId: number;
  documentTitle: string;
  updatedAt: string;
  versionNumber?: number;
};

type VersionDoc = {
  universityId?: number;
  universityName?: string;
  categoryId?: number;
  categoryName?: string;
  documentId: number;
  versionNumber: number;
  documentTitle: string;
  documentContent: string;
  updatedAt: string;
};

type Status = 'loading' | 'ok' | 'notfound' | 'error';

const API_BASE = 'http://k13d104.p.ssafy.io/api';

// ===== Auth =====
function getAccessToken() {
  try { return localStorage.getItem('accessToken') || ''; } catch { return ''; }
}
function authHeaders(extra: HeadersInit = {}) {
  const t = getAccessToken();
  return t ? { ...extra, Authorization: `Bearer ${t}` } : extra;
}
const enc = (s: string) => encodeURIComponent(s || '');

// ===== 시간 유틸 =====
// 서버가 UTC인데 타임존 표기가 없을 수 있으므로, 없으면 'Z'를 붙여 UTC로 파싱
function parseServerUtc(iso: string): Date {
  const norm = iso.replace(/(\.\d{3})\d+$/, '$1'); // ms 3자리로 정규화
  const hasTZ = /Z$|[+\-]\d{2}:\d{2}$/.test(norm);
  return new Date(hasTZ ? norm : `${norm}Z`);
}
// KST 포맷터(문서조회와 동일 형식)
const formatKST = (d: Date) =>
  new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);

export default function DocumentVersionViewPage() {
  const { documentTitle = '', versionId = '' } = useParams();
  const versionNumber = Number(versionId);

  const [status, setStatus] = useState<Status>('loading');
  const [errMsg, setErrMsg] = useState('');
  const [doc, setDoc] = useState<VersionDoc | null>(null);
  const [latestVersion, setLatestVersion] = useState<number | null>(null);

  // 상단 이동 버튼
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    let aborted = false;

    async function loadVersion() {
      setStatus('loading');
      setErrMsg('');
      try {
        if (!Number.isFinite(versionNumber)) throw new Error('잘못된 버전 번호입니다.');

        // 1) 제목으로 최신/메타 조회
        const baseRes = await fetch(
          `${API_BASE}/v1/documents/${encodeURIComponent(documentTitle)}`,
          { headers: { Accept: 'application/json' } }
        );
        if (aborted) return;
        if (baseRes.status === 404) { setStatus('notfound'); return; }
        if (!baseRes.ok) throw new Error(`문서 조회 실패(${baseRes.status})`);
        const baseData: BaseDoc = await baseRes.json();
        setLatestVersion(baseData.versionNumber ?? null);

        // 2) 특정 버전 내용
        const verUrl = `${API_BASE}/v1/documents/${baseData.documentId}/versions/${versionNumber}`;
        const verRes = await fetch(verUrl, { method: 'POST', headers: authHeaders({ Accept: 'application/json' }) });
        if (aborted) return;
        if (verRes.status === 404) throw new Error('존재하지 않는 버전입니다.');
        if (!verRes.ok) throw new Error(`버전 조회 실패(${verRes.status})`);
        const v = await verRes.json();

        const filled: VersionDoc = {
          universityId: v.universityId ?? baseData.universityId,
          universityName: v.universityName ?? baseData.universityName,
          categoryId: v.categoryId ?? baseData.categoryId,
          categoryName: v.categoryName ?? baseData.categoryName,
          documentId: v.documentId ?? baseData.documentId,
          versionNumber: v.versionNumber,
          documentTitle: v.documentTitle ?? baseData.documentTitle,
          documentContent: v.documentContent ?? '',
          updatedAt: v.updatedAt ?? baseData.updatedAt,
        };
        setDoc(filled);
        setStatus('ok');
      } catch (e: any) {
        if (aborted) return;
        setErrMsg(e.message || '오류가 발생했습니다.');
        setStatus('error');
      }
    }

    loadVersion();
    return () => { aborted = true; };
  }, [documentTitle, versionNumber]);

  const rehypeSchema = useMemo(() => ({
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      a: [...(defaultSchema.attributes?.a || []), ['target'], ['rel']],
      img: [...(defaultSchema.attributes?.img || []), ['alt'], ['title'], ['width'], ['height']],
    },
  }) as Parameters<typeof rehypeSanitize>[0], []);

  const docTitleParam = enc(documentTitle);
  const univName = doc?.universityName || '대학교';
  const cateName = doc?.categoryName || '카테고리';

  // ✅ 모든 링크를 univ 하위로 정규화
  const univHref = `/univ/${enc(univName)}`;
  const cateHref = `/univ/${enc(univName)}/category/${enc(cateName)}`;
  const docBase = `/univ/${enc(univName)}/docs/${docTitleParam}`;

  const isLatest = latestVersion != null && doc?.versionNumber === latestVersion;

  // ✅ KST로 정확히 표기 (서버 UTC 가정, tz 없으면 Z 부여)
  const lastUpdated = useMemo(
    () => (doc?.updatedAt ? formatKST(parseServerUtc(doc.updatedAt)) : ''),
    [doc?.updatedAt]
  );

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* 🔔 알림 배너 */}
        {status === 'ok' && doc && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-[#2C80A0] px-4 py-3 text-white">
            <span className="text-[15px]">
              {isLatest ? '최신 버전의 문서입니다.' : `r${doc.versionNumber} 버전 보기 — 최신 버전과 내용이 다를 수 있습니다.`}
            </span>
            <div />
          </div>
        )}
        {(status === 'error' || status === 'notfound') && (
          <div className="mb-4 rounded-lg bg-[#2C80A0] px-4 py-2 text-white">
            {status === 'error' ? `오류: ${errMsg}` : '문서를 찾을 수 없습니다.'}
          </div>
        )}

        {/* 📦 카드 */}
        <section className="relative rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
          {/* 브레드크럼 */}
          <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1">
              <li><Link to={univHref} className="text-[#2C80A0] hover:underline">{univName}</Link></li>
              <li className="mx-1 text-gray-500">›</li>
              <li><Link to={cateHref} className="text-[#2C80A0] hover:underline">{cateName}</Link></li>
            </ol>
          </nav>

          {/* 제목 */}
          <h1 className="text-[28px] leading-tight font-semibold text-gray-900 mb-2">
            {documentTitle}
            {doc?.versionNumber ? (
              <span className="ml-2 align-middle text-sm text-gray-500">(r{doc.versionNumber} 보기)</span>
            ) : null}
          </h1>

          {/* 날짜 + 액션바 */}
          <div className="mb-5 flex items-center gap-4">
            {lastUpdated && (
              <p className="text-[18px] text-gray-800 whitespace-nowrap">
                수정 시각 : {lastUpdated}
              </p>
            )}
            <div className="ml-auto" />
            <div
              role="tablist"
              aria-label="버전 보기 메뉴"
              className="grid grid-cols-1 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(92px,12vw,116px)]"
            >
              <Link
                role="tab"
                to={`${docBase}/history`}
                className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center text-[#7F7F7F] hover:bg-white/60"
              >
                돌아가기
              </Link>
            </div>
          </div>

          {/* 본문 */}
          <article data-color-mode="light" className="prose max-w-none">
            {status === 'loading' && (
              <div className="animate-pulse">
                <div className="mb-3 h-6 w-1/3 rounded bg-gray-200" />
                <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                <div className="mb-2 h-4 w-11/12 rounded bg-gray-200" />
                <div className="h-4 w-10/12 rounded bg-gray-200" />
              </div>
            )}
            {status === 'ok' && doc && (
              <MDEditor.Markdown
                source={doc.documentContent || ''}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeSanitize, rehypeSchema]]}
                style={{
                  backgroundColor: '#FAFAFA',
                  ['--color-canvas-default' as any]: '#FAFAFA',
                  ['--color-canvas-subtle' as any]: '#FAFAFA',
                }}
              />
            )}
          </article>
        </section>
      </div>

      {/* 상단 이동 버튼 */}
      {showTop && (
        <button
          onClick={scrollTop}
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
