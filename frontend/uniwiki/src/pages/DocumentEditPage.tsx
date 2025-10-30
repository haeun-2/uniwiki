// src/pages/DocumentEditPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// 우측 레일 — 문서 조회 화면과 동일
import RecentEdit from '@/layout/RecentEdit';
import RecentDiscuss from '@/layout/RecentDiscuss';

const SAMPLE_MD = `# 제목 예시

1. 서울대학교 문서에 대한 내용
2. 서울대학교 문서에 대한 내용
3. 서울대학교 문서에 대한 내용

- **굵게**, _기울임_, ~~취소선~~
- [링크](https://www.snu.ac.kr/)
\`\`\`ts
export const hello = (name: string) => \`hi, \${name}\`;
\`\`\`
`;

type CategoryKey = 'school' | 'major' | 'lecture' | 'facility' | 'event' | 'etc';

export default function DocumentEditPage() {
  const navigate = useNavigate();
  const { documentTitle = '문서 제목' } = useParams();
  const docTitleParam = encodeURIComponent(documentTitle);

  const initialCategories: Record<CategoryKey, boolean> = {
    school: true,
    major: false,
    lecture: false,
    facility: false,
    event: false,
    etc: false,
  };

  const [value, setValue] = useState<string>(SAMPLE_MD);
  const [summary, setSummary] = useState<string>(''); // 선택값(필수 아님)
  const [agree, setAgree] = useState<boolean>(true);
  const [categories, setCategories] = useState<Record<CategoryKey, boolean>>(initialCategories);

  // 최초 상태 스냅샷 → 변경사항(dirty) 판단
  const initialRef = useRef({
    value: SAMPLE_MD,
    summary: '',
    categories: initialCategories,
  });

  const isDirty = useMemo(() => {
    const i = initialRef.current;
    return (
      value !== i.value ||
      summary !== i.summary ||
      JSON.stringify(categories) !== JSON.stringify(i.categories)
    );
  }, [value, summary, categories]);

  // 저장 가능 조건: 라이선스 동의 + 변경 발생
  const canSave = agree && isDirty;

  // Ctrl/Cmd + S → 저장
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSave, value, summary, categories, agree]);

  const sanitizeSchema: any = useMemo(() => {
    return {
      ...defaultSchema,
      attributes: {
        ...(defaultSchema as any).attributes,
        a: [ ...(((defaultSchema as any).attributes?.a) || []), 'target', 'rel' ],
        img: ['src', 'alt', 'title'],
      },
    };
  }, []);

  const onSave = () => {
    if (!canSave) return;
    // TODO: /api/v1/documents/{document_id} 연결
    navigate(`/docs/${docTitleParam}`, {
      state: {
        flash: {
          type: 'success',
          msg: '저장되었습니다.',
        },
      },
      replace: false,
    });
  };

  return (
    <div className="bg-white">
      {/* 문서 조회 화면과 동일한 2열 레이아웃(우측 레일 유지) */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 메인 */}
        <div className="lg:col-span-8">
          {/* 제목 (버전 표기 색상 동일) */}
          <h1 className="text-[28px] leading-tight font-semibold text-gray-900">
            {documentTitle} <span className="text-gray-900 text-lg">(r10 편집)</span>
          </h1>

          {/* 2-페인 에디터 */}
          <div className="mt-4" data-color-mode="light">
            <MDEditor
              height={520}
              value={value}
              onChange={(v) => setValue(v || '')}
              preview="live"
              previewOptions={{
                remarkPlugins: [remarkGfm],
                rehypePlugins: [[rehypeSanitize, sanitizeSchema]],
              }}
            />
          </div>

          {/* 카테고리 */}
          <div className="mt-6">
            <p className="mb-3 text-gray-900 font-medium">카테고리</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categories.school}
                  onChange={(e) => setCategories((c) => ({ ...c, school: e.target.checked }))}
                />
                학교
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categories.major}
                  onChange={(e) => setCategories((c) => ({ ...c, major: e.target.checked }))}
                />
                학과
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categories.lecture}
                  onChange={(e) => setCategories((c) => ({ ...c, lecture: e.target.checked }))}
                />
                강의
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categories.facility}
                  onChange={(e) => setCategories((c) => ({ ...c, facility: e.target.checked }))}
                />
                시설
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categories.event}
                  onChange={(e) => setCategories((c) => ({ ...c, event: e.target.checked }))}
                />
                행사
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categories.etc}
                  onChange={(e) => setCategories((c) => ({ ...c, etc: e.target.checked }))}
                />
                기타
              </label>
            </div>
          </div>

          {/* 편집 요약 — placeholder 유지 */}
          <div className="mt-4">
            <p className="mb-2 text-gray-900 font-medium">편집 내용 요약</p>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="편집 내용을 요약해서 적어주세요."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 라이선스 동의 — 굵게 표시 제거 */}
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

          {/* 액션 버튼 — 가로폭 확대 & 색상 변경 */}
          <div className="mt-5 flex justify-end gap-3">
            <Link
              to={`/docs/${docTitleParam}`}
              className="inline-flex min-w-[104px] items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              onClick={onSave}
              disabled={!canSave}
              className="inline-flex min-w-[104px] items-center justify-center rounded-xl bg-[#2C80A0] px-5 py-2 font-medium text-white hover:bg-[#276E86] disabled:opacity-40 disabled:cursor-not-allowed"
              title={!agree ? '라이선스 동의가 필요합니다.' : (!isDirty ? '변경사항이 없습니다.' : undefined)}
            >
              저장
            </button>
          </div>
        </div>

        {/* 우측 레일 */}
        <aside className="lg:col-span-4 space-y-6">
          <RecentEdit />
          <RecentDiscuss />
        </aside>
      </div>
    </div>
  );
}
