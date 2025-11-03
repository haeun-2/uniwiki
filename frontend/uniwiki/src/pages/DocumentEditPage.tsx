// src/pages/DocumentEditPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MDEditor, { ICommand, TextAreaTextApi, TextState } from '@uiw/react-md-editor';
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

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  school: '학교',
  major: '학과',
  lecture: '강의',
  facility: '시설',
  event: '행사',
  etc: '기타',
};

// ===== S3 Presign 업로드 유틸 =====
const MAX_IMAGE_MB = 10;

function isImage(file?: File | null) {
  return !!file && file.type.startsWith('image/');
}
function overLimit(file: File) {
  return file.size > MAX_IMAGE_MB * 1024 * 1024;
}

type PresignResp = {
  uploadUrl: string; // PUT presigned URL
  fileUrl: string;   // 업로드 후 접근할 최종 공개 URL
};

async function getPresignedPutUrl(file: File): Promise<PresignResp> {
  const resp = await fetch('/api/uploads/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(txt || 'S3 presign 발급 실패');
  }
  const data = (await resp.json()) as PresignResp;
  if (!data?.uploadUrl || !data?.fileUrl) throw new Error('presign 응답값(uploadUrl/fileUrl) 없음');
  return data;
}

async function uploadToS3ViaPresign(file: File): Promise<string> {
  const { uploadUrl, fileUrl } = await getPresignedPutUrl(file);
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!put.ok) {
    const t = await put.text().catch(() => '');
    throw new Error(t || 'S3 업로드 실패');
  }
  return fileUrl; // 최종 마크다운에 넣을 공개 URL
}

export default function DocumentEditPage() {
  const navigate = useNavigate();
  const { documentTitle = '문서 제목' } = useParams();
  const docTitleParam = encodeURIComponent(documentTitle);

  // ✅ 카테고리 단일 선택으로 변경
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('school');

  const [value, setValue] = useState<string>(SAMPLE_MD);
  const [summary, setSummary] = useState<string>(''); // 선택값(필수 아님)
  const [agree, setAgree] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);     // 업로드 중
  const [saving, setSaving] = useState<boolean>(false); // 저장 중

  // 최초 상태 스냅샷 → 변경사항(dirty) 판단
  const initialRef = useRef({
    value: SAMPLE_MD,
    summary: '',
    category: 'school' as CategoryKey,
  });

  const isDirty = useMemo(() => {
    const i = initialRef.current;
    return value !== i.value || summary !== i.summary || selectedCategory !== i.category;
  }, [value, summary, selectedCategory]);

  // 저장 가능 조건: 라이선스 동의 + 변경 발생 + 진행중 아님
  const canSave = agree && isDirty && !busy && !saving;

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
  }, [canSave, value, summary, selectedCategory, agree]);

  const sanitizeSchema: any = useMemo(() => {
    return {
      ...defaultSchema,
      attributes: {
        ...(defaultSchema as any).attributes,
        a: [ ...(((defaultSchema as any).attributes?.a) || []), 'target', 'rel' ],
        img: ['src', 'alt', 'title'], // 렌더에서 이미지 허용
      },
    };
  }, []);

  // ===== 붙여넣기/드래그앤드롭 처리 =====
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
      const md = urls.map((u, i) => `![image${i + 1}](${u})`).join('\n');
      setValue((prev) => (appendAtEnd ? `${prev.trimEnd()}\n\n${md}\n` : `${md}\n${prev}`));
    } catch (e: any) {
      alert(e?.message || '이미지 업로드 실패');
    } finally {
      setBusy(false);
    }
  }

  // ===== 툴바: 이미지 업로드 버튼 =====
  const uploadImageCommand: ICommand = {
    name: 'uploadImage',
    keyCommand: 'uploadImage',
    buttonProps: { 'aria-label': '이미지 업로드' },
    icon: <span style={{ fontSize: 12, fontWeight: 700 }}>IMG</span>,
    execute: async (_state: TextState, api: TextAreaTextApi) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
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
          const md = `![${file!.name}](${url} "${file!.name}")`;
          api.replaceSelection(md); // 커서 위치에 삽입
        } catch (e: any) {
          alert(e?.message || '이미지 업로드 실패');
        } finally {
          setBusy(false);
        }
      };
      input.click();
    },
  };

  const onSave = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      // 실제 저장 API 연결 (예시)
      await fetch(`/api/v1/documents/${encodeURIComponent(documentTitle)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: value,        // 마크다운 본문(여기에 S3 URL이 들어있음)
          summary,
          categories: [selectedCategory], // ✅ 단일 선택만 전달
        }),
      });

      navigate(`/docs/${docTitleParam}`, {
        state: { flash: { type: 'success', msg: '저장되었습니다.' } },
        replace: false,
      });
    } catch (e: any) {
      alert(e?.message || '문서 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white">
      {/* 문서 조회 화면과 동일한 2열 레이아웃(우측 레일 유지) */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 메인 */}
        <div className="lg:col-span-8">
          <h1 className="text-[28px] leading-tight font-semibold text-gray-900">
            {documentTitle} <span className="text-gray-900 text-lg">(r10 편집)</span>
          </h1>

          {(busy || saving) && (
            <div className="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
              {busy ? '이미지 업로드 중…' : '저장 중…'}
            </div>
          )}

          {/* 에디터 */}
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
              extraCommands={[uploadImageCommand]}
              textareaProps={{
                placeholder:
                  '마크다운 작성. 이미지 파일을 붙여넣기/드래그앤드롭하거나 IMG 버튼으로 업로드하세요.',
                onPaste: async (e) => {
                  const items = Array.from(e.clipboardData?.items || []);
                  const file = items.find((i) => i.kind === 'file')?.getAsFile();
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

          {/* 카테고리 — ✅ 라디오로 단일 선택 */}
          <div className="mt-6">
            <p className="mb-3 text-gray-900 font-medium">카테고리</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
              {(Object.keys(CATEGORY_LABEL) as CategoryKey[]).map((key) => (
                <label key={key} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="doc-category"
                    checked={selectedCategory === key}
                    onChange={() => setSelectedCategory(key)}
                  />
                  {CATEGORY_LABEL[key]}
                </label>
              ))}
            </div>
          </div>

          {/* 편집 요약 */}
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

          {/* 라이선스 동의 */}
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

          {/* 액션 버튼 */}
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
              title={
                !agree
                  ? '라이선스 동의가 필요합니다.'
                  : !isDirty
                  ? '변경사항이 없습니다.'
                  : busy
                  ? '이미지 업로드가 끝난 뒤 저장할 수 있습니다.'
                  : saving
                  ? '저장 중입니다.'
                  : undefined
              }
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
