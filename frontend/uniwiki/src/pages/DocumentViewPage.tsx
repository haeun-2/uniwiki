// src/pages/DocumentViewPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

// MD 미리보기
import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

// 우측 레일 직접 사용 (라우터/레이아웃 변경 없음)
import RecentEdit from '@/layout/RecentEdit';
import RecentDiscuss from '@/layout/RecentDiscuss';

type Tab = 'edit' | 'talk' | 'history';

const INITIAL_MD = `# UniWiki 문서 예시

간단한 **데모 문서**입니다. _기울임_ / **굵게** / ~~취소선~~,  
[외부 링크](https://example.com)와 \`inline code\`를 보여줍니다.

> 인용문: 간단한 설명이나 주의를 강조할 때 사용하세요.

---

## 목록 예시

- 불릿 리스트 1
- 불릿 리스트 2
  - 하위 항목 A
  - 하위 항목 B

1. 번호 목록 1
2. 번호 목록 2
   1. 하위 번호 a
   2. 하위 번호 b

## 체크리스트 (GFM)

- [x] 문서 구조 확정
- [ ] 내용 채우기
- [ ] 리뷰 요청

## 코드 블록

\`\`\`ts
type User = { id: number; name: string };
const hello = (u: User) => \`Hello, \${u.name}!\`;
console.log(hello({ id: 1, name: "UniWiki" }));
\`\`\`

## 표 (GFM)

| 구분 | 설명                 | 상태 |
|:---:|----------------------|:---:|
| A   | 위키 문서 편집       | ✅  |
| B   | 토론 스레드 연동     | ⏳  |
| C   | 버전 비교(diff)      | 🔧  |

## 이미지

![샘플 이미지](https://picsum.photos/800/300 "랜덤 샘플")

## 각주

각주를 쓸 수 있어요[^1].

[^1]: GFM footnote. 참고 자료나 부연 설명에 사용합니다.
`;

export default function DocumentViewPage() {
  const { documentTitle = '문서 제목' } = useParams();

  // 24시간제 표기 (예: 2025. 10. 28. 23:22:33)
  const lastUpdated = useMemo(() => {
    const fmt = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return fmt.format(new Date());
  }, []);

  const docTitleParam = encodeURIComponent(documentTitle);

  const [favOn, setFavOn] = useState(false);
  const [tab, setTab] = useState<Tab>('edit');
  const [hasTalk] = useState(false); // API 붙기 전 false
  const [content] = useState<string>(INITIAL_MD);

  // 스크롤 다운 시 우하단 고정 '상단으로' 버튼 노출
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // sanitize 스키마 확장: img/a 허용 속성 명시
  const sanitizeSchema: any = useMemo(() => {
    return {
      ...defaultSchema,
      attributes: {
        ...(defaultSchema as any).attributes,
        img: ['src', 'alt', 'title', 'width', 'height'],
        a: [ ...(((defaultSchema as any).attributes?.a) || []), 'target', 'rel' ],
      },
      tagNames: [ ...((defaultSchema as any).tagNames || []), 'img' ],
    };
  }, []);

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 카테고리~본문 상자 */}
        <div className="lg:col-span-8">
          <section className="relative rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
            {/* 브레드크럼 (18px) */}
            <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1">
                <li>
                  <Link to="/" className="text-[#2C80A0] hover:underline">학교이름</Link>
                </li>
                <li className="mx-1 text-gray-500">›</li>
                <li>
                  <Link
                    to={`/categories/${encodeURIComponent('행사')}`} // TODO: 실제 라우트로 교체
                    className="text-[#2C80A0] hover:underline"
                  >
                    행사
                  </Link>
                </li>
              </ol>
            </nav>

            {/* 제목 */}
            <h1 className="text-[28px] leading-tight font-semibold text-gray-900 mb-2">
              {documentTitle}
            </h1>

            {/* 날짜 + 액션바 */}
            <div className="mb-5 flex items-center gap-4">
              <p className="text-[18px] text-gray-800 whitespace-nowrap">
                최근 수정 시각 : {lastUpdated}
              </p>

              <div className="ml-auto" />

              {/* 균등폭 액션바 */}
              <div
                role="tablist"
                aria-label="문서 작업 메뉴"
                className="grid grid-cols-4 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(280px,40vw,520px)]"
              >
                <button
                  onClick={() => setFavOn(v => !v)}
                  aria-pressed={favOn}
                  title="즐겨찾기"
                  className={`h-10 px-4 text-[18px] leading-tight flex items-center justify-center
                    ${favOn ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}`}
                >
                  ★
                </button>

                <button
                  role="tab"
                  aria-selected={tab === 'edit'}
                  onClick={() => setTab('edit')}
                  className="h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                >
                  편집
                </button>

                <Link
                  role="tab"
                  aria-selected={false}
                  to={`/docs/${docTitleParam}/discussions`}
                  className={`h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3]
                    ${hasTalk ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}`}
                >
                  토론
                </Link>

                <button
                  role="tab"
                  aria-selected={tab === 'history'}
                  onClick={() => setTab('history')}
                  className="h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                >
                  역사
                </button>
              </div>
            </div>

            {/* 본문: MD 미리보기 */}
            <article data-color-mode="light" className="prose max-w-none">
              <MDEditor.Markdown
                source={content}
                remarkPlugins={[remarkGfm]}
                // 이미지/링크가 sanitize로 지워지지 않도록 스키마 적용
                rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                style={{
                  backgroundColor: '#FAFAFA',
                  ['--color-canvas-default' as any]: '#FAFAFA',
                  ['--color-canvas-subtle' as any]: '#FAFAFA',
                }}
              />
            </article>
          </section>
        </div>

        {/* 우측 : 최근 수정/토론 — sticky 제거, 상단 배치만 */}
        <aside className="lg:col-span-4 space-y-6">
          <RecentEdit />
          <RecentDiscuss />
        </aside>
      </div>

      {/* 우하단 고정 상단 이동 버튼 */}
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
