// src/pages/DocumentViewPage.tsx


import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronUp } from 'lucide-react'

// MD 미리보기
import MDEditor from '@uiw/react-md-editor'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

type Tab = 'edit' | 'talk' | 'history'

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
`

export default function DocumentViewPage() {
  const { documentTitle = '문서 제목' } = useParams()
  const lastUpdated = useMemo(() => new Date().toLocaleString(), [])

  const [favOn, setFavOn] = useState(false)
  const [tab, setTab] = useState<Tab>('edit')
  const [hasTalk] = useState(false) // API 붙기 전 false
  const [content] = useState<string>(INITIAL_MD)

  const [showTop, setShowTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 카테고리~본문 상자 */}
        <div className="lg:col-span-8">
          <section className="relative rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
            {/* 브레드크럼 (18px) */}
            <nav className="mb-2 text-[18px] leading-tight">
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

            {/* 날짜 + 액션바 (날짜 1줄 고정, 액션바 가변 폭) */}
            <div className="mb-5 flex items-center gap-4">
              <p className="text-[18px] text-gray-800 whitespace-nowrap">
                최근 수정 시각 : {lastUpdated}
              </p>

              <div className="ml-auto" />

              {/* 균등폭 액션바: 폭을 clamp로 반응형 조절 */}
              <div
                role="tablist"
                aria-label="문서 작업 메뉴"
                className="grid grid-cols-4 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(280px,40vw,520px)]"
              >
                {/* 1. 즐겨찾기 (토글) */}
                <button
                  onClick={() => setFavOn(v => !v)}
                  aria-pressed={favOn}
                  title="즐겨찾기"
                  className={`h-10 px-4 text-[18px] leading-tight flex items-center justify-center
                    ${favOn ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}`}
                >
                  ★
                </button>

                {/* 2. 편집 */}
                <button
                  role="tab"
                  aria-selected={tab === 'edit'}
                  onClick={() => setTab('edit')}
                  className="h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                >
                  편집
                </button>

                {/* 3. 토론 (관련 토론 있으면 하이라이트) */}
                <button
                  role="tab"
                  aria-selected={tab === 'talk'}
                  onClick={() => setTab('talk')}
                  className={`h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3]
                    ${hasTalk ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}`}
                >
                  토론
                </button>

                {/* 4. 역사 */}
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

            {/* 본문: MD 미리보기 (배경 #FAFAFA로 통일) */}
            <article data-color-mode="light" className="prose max-w-none">
              <MDEditor.Markdown
                source={content}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                style={{
                  backgroundColor: '#FAFAFA',
                  ['--color-canvas-default' as any]: '#FAFAFA',
                  ['--color-canvas-subtle' as any]: '#FAFAFA',
                }}
              />
            </article>

            {/* 카드 내부 우하단: 상단 이동 */}
            <button
              onClick={scrollTop}
              className="absolute bottom-4 right-4 rounded-full border border-gray-300 bg-white p-2.5 shadow hover:bg-gray-50"
              aria-label="문서 상단으로 이동"
              title="문서 상단으로 이동"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          </section>
        </div>

        {/* 우측 자리 확보 */}
        <aside className="lg:col-span-4 min-h-[200px]" aria-hidden="true" />
      </div>

      {showTop && (
        <button
          onClick={scrollTop}
          className="fixed bottom-6 right-5 rounded-full border border-gray-300 bg-white p-3 shadow hover:bg-gray-50"
          aria-label="문서 상단으로 이동"
          title="문서 상단으로 이동"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
