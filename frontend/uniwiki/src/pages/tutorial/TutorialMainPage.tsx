// src/pages/tutorial/TutorialMainPage.tsx
import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

// 실제 경로로 조정
import fullImg from "/tutorial/02_main/full.png";
import popularImg from "/tutorial/02_main/popular_univ.png";
import univAllImg from "/tutorial/02_main/univ_all.png";
import personalImg from "/tutorial/02_main/personal.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialMainPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
      { id: "popular", label: "인기 많은 학교" },
      { id: "my-favorite", label: "내 학교 · 즐겨찾기" },
      { id: "explore", label: "학교별 위키 탐색" },
    ]);
    return () => setToc([]);
  }, [setToc]);

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">메인 페이지 기능 설명</h1>
        <p className="mt-1 text-sm text-gray-600">
          메인 페이지에서 노출되는 주요 블록(인기 많은 학교, 내 학교, 즐겨찾기, 학교별 위키 탐색)을
          이미지와 함께 설명합니다.
        </p>
      </header>

      <section className="space-y-8">
        {/* 개요 */}
        <Article id="overview" title="개요">
          <Figure src={fullImg} alt="메인 페이지 전체 화면" />
          <Ul className="mt-4">
            <Li title="역할">
              유니위키에 처음 진입했을 때 사용자가 가장 먼저 보는 화면으로, 학교 탐색과 즐겨찾기
              기능으로 진입점을 제공합니다.
            </Li>
            <Li title="구성">
              상단의 인기 많은 학교, 가운데의 내 학교 · 즐겨찾기 블록, 하단의 학교별 위키 탐색 영역으로
              구성됩니다.
            </Li>
            <Li title="반응형">
              화면 너비에 따라 카드 수나 열 개수가 줄어드는 방식으로 배치가 조정됩니다.
            </Li>
          </Ul>
        </Article>

        {/* 인기 많은 학교 */}
        <Article id="popular" title="인기 많은 학교">
          <Figure src={popularImg} alt="인기 많은 학교 영역" />
          <Ul className="mt-4">
            <Li title="위치">
              메인 페이지 상단에 카드 형태로 나열되어, 가장 먼저 눈에 들어오는 진입 영역입니다.
            </Li>
            <Li title="기준">
              조회수, 문서 활동량 등 인기 지표를 기반으로 상위 몇 개 학교를 노출합니다.
            </Li>
            <Li title="동작">
              각 카드를 클릭하면 해당 학교 메인 페이지로 이동합니다. 예: <code>/univ/:universityName</code>
            </Li>
            <Li title="스타일">
              학교 로고와 학교명이 들어간 라운드 카드이며, 호버 시 약한 그림자/배경 강조가 들어갑니다.
            </Li>
          </Ul>
        </Article>

        {/* 내 학교 / 즐겨찾기 */}
        <Article id="my-favorite" title="내 학교 · 즐겨찾기 블록">
          <Figure src={personalImg} alt="내 학교 및 즐겨찾기 영역" />
          <Ul className="mt-4">
            <Li title="내 학교">
              사용자 프로필에 저장된 대표 학교가 카드로 노출됩니다. 클릭 시 해당 학교 메인으로 이동합니다.
            </Li>
            <Li title="즐겨찾기한 학교">
              사용자가 즐겨찾기한 학교 목록 중 일부를 노출합니다. 즐겨찾기한 학교가 없으면 안내 문구를
              보여줍니다.
            </Li>
            <Li title="즐겨찾기 문서">
              우측에는 사용자가 즐겨찾기한 문서 목록과 최근 수정 시각이 노출됩니다. “더보기” 클릭 시
              즐겨찾기 문서 전용 페이지로 이동합니다.
            </Li>
            <Li title="상태 처리">
              로그인하지 않은 경우나 즐겨찾기가 비어 있는 경우에는 각 구역별로 “아직 즐겨찾기가 없어요”
              와 같은 안내 문구를 노출하여 빈 상태를 명확히 보여줍니다.
            </Li>
          </Ul>
        </Article>

        {/* 학교별 위키 탐색 */}
        <Article id="explore" title="학교별 위키 탐색">
          <Figure src={univAllImg} alt="학교별 위키 탐색 영역" />
          <Ul className="mt-4">
            <Li title="탭 필터">
              상단 탭에서 전체 / 지역(서울, 부산, 인천 등) 버튼을 클릭해 해당 지역의 학교만 필터링합니다.
            </Li>
            <Li title="목록 배치">
              여러 열로 나열된 텍스트 링크 형태로 학교명이 표시되며, 스크롤로 전체 학교를 확인할 수
              있습니다.
            </Li>
            <Li title="동작">
              학교명을 클릭하면 해당 학교 메인 페이지로 이동합니다. 예: <code>/univ/:universityName</code>
            </Li>
            <Li title="성능">
              학교 목록은 캐시를 사용해 불필요한 재요청을 줄이며, 필터 변경 시 캐시된 데이터를 우선
              사용합니다.
            </Li>
          </Ul>
        </Article>
      </section>
    </main>
  );
}

/** 공용 컴포넌트 (TutorialMenuBarPage 와 동일 형식) */
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
