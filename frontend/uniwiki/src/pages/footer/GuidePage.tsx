import React from "react";
import { Link } from "react-router-dom";

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-4">{title}</h2>
    {children}
  </section>
);

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
  <pre className="rounded-lg bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm">
    <code>{code}</code>
  </pre>
);

export default function MarkdownGuidePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <header className="mb-8 border-b pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">문서 작성법 (Markdown)</h1>
          <p className="text-gray-600 mt-2">
            유니위키 문서는 <strong>Markdown</strong> 문법을 사용합니다. 제목, 목록, 표, 코드, 링크, 이미지 등을 간단히 표현할 수 있습니다.
          </p>
        </header>

        {/* 목차 */}
        <nav aria-label="목차" className="mb-8">
          <ul className="flex flex-wrap gap-2 text-sm">
            {[
              ["heading", "제목"],
              ["emphasis", "강조"],
              ["list", "목록"],
              ["link", "링크"],
              ["image", "이미지"],
              ["code", "코드"],
              ["table", "표"],
              ["quote", "인용문"],
              ["divider", "구분선"],
              ["wikilink", "문서 간 링크"],
            ].map(([id, label]) => (
              <li key={id}>
                <a className="rounded-md border px-3 py-1.5 hover:bg-gray-50" href={`#${id}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 본문 */}
        <Section id="heading" title="1. 제목 (Heading)">
          <p className="text-gray-700 mb-3">`#`의 개수가 많을수록 더 작은 제목입니다.</p>
          <CodeBlock
            code={[
              "# 제목1",
              "## 제목2",
              "### 제목3",
            ].join("\n")}
          />
          <div className="mt-3 space-y-1">
            <h1 className="text-2xl font-bold">제목1</h1>
            <h2 className="text-xl font-semibold">제목2</h2>
            <h3 className="text-lg font-semibold">제목3</h3>
          </div>
        </Section>

        <Section id="emphasis" title="2. 강조 (Emphasis)">
          <CodeBlock
            code={[
              "**굵게**",
              "*기울임*",
              "~~취소선~~",
            ].join("\n")}
          />
          <p className="text-gray-700 mt-2">
            <strong>굵게</strong>, <em>기울임</em>, <span className="line-through">취소선</span>
          </p>
        </Section>

        <Section id="list" title="3. 목록 (List)">
          <h3 className="font-medium mb-2">● 순서 없는 목록</h3>
          <CodeBlock
            code={[
              "- 항목1",
              "- 항목2",
              "  - 하위항목",
            ].join("\n")}
          />
          <ul className="list-disc pl-6 text-gray-700 mt-2">
            <li>항목1</li>
            <li>항목2
              <ul className="list-disc pl-6">
                <li>하위항목</li>
              </ul>
            </li>
          </ul>

          <h3 className="font-medium mt-6 mb-2">● 순서 있는 목록</h3>
          <CodeBlock
            code={[
              "1. 첫 번째",
              "2. 두 번째",
              "3. 세 번째",
            ].join("\n")}
          />
          <ol className="list-decimal pl-6 text-gray-700">
            <li>첫 번째</li>
            <li>두 번째</li>
            <li>세 번째</li>
          </ol>
        </Section>

        <Section id="link" title="4. 링크 (Link)">
          <CodeBlock code='[유니위키](https://example.com)' />
          <p className="text-gray-700 mt-2">
            예: <Link to="/" className="text-uniwikicolor underline-offset-2 hover:underline">유니위키 홈</Link>
          </p>
        </Section>

        <Section id="image" title="5. 이미지 (Image)">
          <CodeBlock code='![이미지 설명](https://example.com/image.png)' />
          <div className="mt-3 rounded-md bg-blue-50 border border-blue-100 p-3 text-sm text-blue-900">
            에디터에 이미지를 드래그 앤 드롭하거나, 클립보드 이미지를 붙여넣으면 자동 업로드 후 문서에 삽입됩니다.
          </div>
        </Section>

        <Section id="code" title="6. 코드 (Code)">
          <h3 className="font-medium mb-2">● 인라인 코드</h3>
          <CodeBlock code="`인라인 코드`" />
          <p className="text-gray-700 mt-2"><code className="rounded bg-gray-100 px-1 py-0.5">인라인 코드</code></p>

          <h3 className="font-medium mt-6 mb-2">● 코드 블록</h3>
          <CodeBlock
            code={[
              "```javascript",
              "function hello() {",
              '  console.log("Hello, UniWiki!");',
              "}",
              "```",
            ].join("\n")}
          />
        </Section>

        <Section id="table" title="7. 표 (Table)">
          <CodeBlock
            code={[
              "| 제목 | 설명 |",
              "| --- | --- |",
              "| 항목1 | 내용1 |",
              "| 항목2 | 내용2 |",
            ].join("\n")}
          />
          <div className="overflow-x-auto mt-3">
            <table className="min-w-[360px] table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2 text-left">제목</th>
                  <th className="border px-3 py-2 text-left">설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-3 py-2">항목1</td>
                  <td className="border px-3 py-2">내용1</td>
                </tr>
                <tr>
                  <td className="border px-3 py-2">항목2</td>
                  <td className="border px-3 py-2">내용2</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="quote" title="8. 인용문 (Quote)">
          <CodeBlock
            code={[
              "> 인용문입니다.",
              ">> 중첩 인용",
            ].join("\n")}
          />
          <blockquote className="border-l-4 border-gray-300 pl-4 text-gray-700">
            인용문입니다.
            <blockquote className="border-l-4 border-gray-200 pl-4 mt-2">중첩 인용</blockquote>
          </blockquote>
        </Section>

        <Section id="divider" title="9. 구분선 (Divider)">
          <CodeBlock code="---" />
          <hr className="my-4" />
        </Section>

        <Section id="wikilink" title="10. 문서 간 링크 (내부 링크)">
          <p className="text-gray-700 mb-3">문서 제목을 <code className="rounded bg-gray-100 px-1 py-0.5">[[문서명]]</code> 형태로 입력하면 자동 링크됩니다.</p>
          <CodeBlock code="[[서울대학교]]" />
        </Section>
      </section>
    </div>
  );
}
