import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import fullImg from "/tutorial/07_history/full.png";
import historyListImg from "/tutorial/07_history/history_list.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialHistoryPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
      { id: "list", label: "문서 버전 목록" },
    ]);
    return () => setToc([]);
  }, [setToc]);

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">문서 역사 페이지 기능 설명</h1>
        <p className="mt-1 text-sm text-gray-600">
          문서의 모든 수정 이력을 시간 순으로 확인하고, 특정 버전으로 되돌리거나 두 버전을 비교하는
          페이지입니다.
        </p>
      </header>

      <section className="space-y-8">
        {/* 개요 */}
        <Article id="overview" title="개요">
          <Figure src={fullImg} alt="문서 역사 페이지 전체 화면" tall />
          <Ul className="mt-4">
            <Li title="역할">
              한 문서가 어떻게 변경되어 왔는지 추적하는 화면입니다. 위키 운영·검수에 필수적인 기능입니다.
            </Li>
            <Li title="구성">
              상단에는 문서 제목과 페이지네이션, 본문에는 버전 목록, 우측에는 최근 수정된 문서와 최근
              토론 카드가 배치됩니다.
            </Li>
            <Li title="라우팅 예시">
              <code>/univ/:universityName/docs/:documentTitle/history</code> 와 같이 문서 경로 뒤에
              <code>/history</code> 를 붙여 접근합니다.
            </Li>
          </Ul>
        </Article>

        {/* 문서 버전 목록 */}
        <Article id="list" title="문서 버전 목록">
          <Figure src={historyListImg} alt="문서 버전 한 줄 예시" />
          <Ul className="mt-4">
            <Li title="버전 번호">
              각 행의 맨 앞에는 <code>r42</code> 같은 형식의 버전 번호가 표시됩니다. 숫자가 클수록 최신
              버전입니다.
            </Li>
            <Li title="수정 시각">
              두 번째 열에는 해당 버전이 저장된 날짜·시간이 표시됩니다. 예: <code>2025.11.13</code>.
            </Li>
            <Li title="수정자">
              세 번째 열에는 수정을 수행한 사용자의 닉네임 또는 관리자 계정명이 표시됩니다.
            </Li>
            <Li title="변경량 표시">
              네 번째 열에는 <code>+0</code>, <code>-5</code> 와 같은 변경 글자 수를 색상으로 구분해
              표시합니다. 옆의 회색 텍스트에는 간단한 메모나 되돌리기 정보를 보여줄 수 있습니다.
            </Li>
            <Li title="페이지네이션">
              목록 하단의 이전/다음 버튼으로 과거 버전들을 페이지 단위로 탐색합니다.
            </Li>
            <Li title="보기">
              해당 버전 상태의 문서를 읽기 전용으로 열어보는 기능입니다. 현재 문서는 바뀌지 않고, 과거
              내용만 확인할 수 있습니다.
            </Li>
            <Li title="이 버전으로 되돌리기">
              선택한 버전의 내용을 기준으로 새 버전을 만들어 현재 문서를 되돌립니다. 실제로는 과거 버전을
              복사한 새로운 버전이 생성됩니다.
            </Li>
            <Li title="비교">
              선택한 버전과 기준 버전(보통 바로 이전 버전)을 비교(diff)하는 화면으로 이동합니다. 어떤
              문장이 추가·삭제·수정되었는지 시각적으로 확인할 수 있습니다.
            </Li>
            <Li title="권한">
              일반 사용자는 자신이 수정한 문서에 한해 되돌리기만 허용하고, 관리자에게는 모든 버전에 대한
              복원 권한을 줄 수 있습니다.
            </Li>
          </Ul>
        </Article>
      </section>
    </main>
  );
}

/** 공용 컴포넌트 (TutorialMainPage 와 동일 형식) */
function Article({
  id,
  title,
  children,
}: React.PropsWithChildren<{ id: string; title: string }>) {
  return (
    <article id={id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function Figure({
  src,
  alt,
  small,
  tall,
}: {
  src: string;
  alt: string;
  small?: boolean;
  tall?: boolean;
}) {
  const base = "block w-full object-contain select-none";
  const h = small ? "h-24 md:h-28" : tall ? "h-56 md:h-64" : "h-40 md:h-48";
  return (
    <figure className="rounded-xl bg-gray-50 border border-gray-100 p-3">
      <img src={src} alt={alt} className={`${base} ${h}`} draggable={false} />
    </figure>
  );
}

function Ul({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return <ul className={`space-y-2 ${className}`}>{children}</ul>;
}

function Li({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <li className="text-sm leading-6">
      <span className="font-medium text-gray-900">{title}. </span>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}
