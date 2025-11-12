import React from "react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">유니위키 소개</h1>
        <p className="mt-3 text-gray-700">
          유니위키는 대학 구성원이 직접 만들고 함께 검증하는 대학 정보 위키입니다.
          학교·학과·강의·시설·행사 등 대학 생활 전반의 정보를 한곳에서 찾아보고,
          필요하면 바로 고칠 수 있습니다.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl bg-uniwikicolor px-5 py-3 text-white hover:opacity-90 transition"
          >
            로그인하고 시작하기
          </Link>
        </div>
      </section>

      {/* 목적 · 배경 · 타겟 */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          title="서비스 배경"
          desc={[
            "학교별 정보가 커뮤니티·블로그에 흩어져 있어 신뢰성과 검색성이 낮음",
            "정책·시설·강의 정보가 수시로 바뀌지만 체계적인 기록이 부족",
            "학생 참여 기반의 최신화·검증 메커니즘 필요",
          ]}
        />
        <Card
          title="서비스 목적"
          desc={[
            "대학 생활 정보를 공동 작성·수정·검색할 수 있는 위키 플랫폼 제공",
            "분산된 정보를 표준화된 문서 구조로 축적",
            "토론과 버전 관리를 통해 신뢰도 향상",
          ]}
        />
        <Card
          title="서비스 타겟"
          desc={[
            "재학생·휴학생·졸업생",
            "신입생·편입·교환학생 등 신규 유입자",
            "학교 관계자 및 동아리·학생회",
          ]}
        />
      </section>

      {/* 핵심 기능 요약 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">핵심 기능</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            title="위키 문서 시스템"
            points={[
              "카테고리: 학교 / 학과 / 강의 / 시설 / 행사 등",
              "학교별 대표 문서와 관련 문서 네비게이션",
            ]}
          />
          <Feature
            title="버전 관리"
            points={[
              "모든 수정 내역 저장, 비교, 복원",
              "최근 수정자와 시간 표기",
            ]}
          />
          <Feature
            title="학교 인증 기반 참여"
            points={[
              "학교 이메일 인증 후 편집 권한 부여",
              "신뢰도 있는 참여 유도",
            ]}
          />
          <Feature
            title="문서 추천·신고"
            points={[
              "품질 높은 문서 가시성 강화",
              "부적절한 내용 신고·관리",
            ]}
          />
          <Feature
            title="토론"
            points={[
              "문서별 토론 스레드와 댓글",
              "합의 과정을 통한 내용 개선",
            ]}
          />
          <Feature
            title="검색"
            points={[
              "제목+본문 통합 검색, 자동완성",
              "학교별 필터로 빠른 탐색",
            ]}
          />
        </div>
      </section>

      {/* 기대 효과 */}
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">기대 효과</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-700">
          <li>대학 생활 필수 정보를 최신 상태로 유지할 수 있습니다.</li>
          <li>중복 질문·불확실한 소문을 줄이고 의사결정 시간을 단축합니다.</li>
          <li>학교별 지식이 표준화된 구조로 축적되어 검색성이 높아집니다.</li>
          <li>토론과 기록을 통해 신뢰 가능한 집단지성을 형성합니다.</li>
        </ul>
      </section>

      {/* 시작 가이드 (간단) */}
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">어떻게 시작하나요?</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-gray-700">
          <li>학교 이메일 인증을 통해 회원가입, 로그인합니다.</li>
          <li>학교 페이지에서 필요한 문서를 검색하거나 새로 작성합니다.</li>
          <li>사실 확인이 필요하면 토론에서 합의를 거쳐 문서를 개선합니다.</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl bg-uniwikicolor px-5 py-3 text-white hover:opacity-90 transition"
          >
            로그인
          </Link>
        </div>
      </section>
    </div>
  );
}

/* 구성 요소들 */

function Card({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {icon}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
            {desc.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Feature({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700 text-sm">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

function CircleIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
      {children}
    </div>
  );
}
