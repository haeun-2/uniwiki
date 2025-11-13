// src/pages/RulePage.tsx
import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

type TocItem = { id: string; label: string };

const TOC: TocItem[] = [
  { id: "doc-policy", label: "문서 관리 정책" },
  { id: "discussion-policy", label: "토론 관리 정책" },
  { id: "user-policy", label: "이용자 관리 정책" },
  { id: "ops-policy", label: "운영 관리 정책" },
  { id: "copyright", label: "저작권" },
  { id: "privacy", label: "개인정보 처리방침" },
];

export default function RulePage() {
  const { hash } = useLocation();

  // 최초 진입 시 최상단 이동
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  // 해시로 진입한 경우 해당 섹션 포커스
  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  const today = useMemo(
    () =>
      new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    []
  );

  const handleAnchor = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // 주소 표시줄 해시 동기화
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">정책과 방침</h1>
        <p className="text-sm text-gray-500 mt-1">
          최종 업데이트: {today}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[0.5fr_2.5fr] gap-6">
        {/* 좌측 목차 */}
        <nav
          aria-label="페이지 목차"
          className="sticky lg:top-5 h-max rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-3">목차</h2>
          <ul className="space-y-2">
            {TOC.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  onClick={(e) => handleAnchor(e, t.id)}
                  className="block text-sm text-gray-700 hover:text-uniwikicolor hover:underline cursor-pointer"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* 본문 */}
        <section className="space-y-8">
          {/* 문서 관리 정책 */}
          <Article id="doc-policy" title="문서 관리 정책">
            <Ul>
              <Li title="작성·편집">
                로그인 이용자는 문서를 생성·수정할 수 있습니다. 동일 문서의 동시 편집 충돌이
                발생할 경우 최신 버전을 기준으로 저장에 실패할 수 있습니다.
              </Li>
              <Li title="버전 관리">
                모든 수정 내역은 버전으로 보관되며 변경점 비교(diff)와 복원이 가능합니다.
              </Li>
              <Li title="출처 표기">
                외부 정보 인용 시 출처를 명확히 표기합니다. 확인 불가한 사실의 단정적 서술을
                지양합니다.
              </Li>
              <Li title="링크 규칙">
                문서 간 연결은 내부 링크 규칙(예: [[문서명]])을 권장합니다. 죽은 링크는 정기
                점검 시 수정·제거될 수 있습니다.
              </Li>
              <Li title="신고 및 조치">
                허위·명예훼손·저작권 침해 등 문제가 있는 내용은 신고 대상이며, 운영자는
                검토 후 수정·비공개·삭제·복원 등 필요한 조치를 할 수 있습니다.
              </Li>
            </Ul>
          </Article>

          {/* 토론 관리 정책 */}
          <Article id="discussion-policy" title="토론 관리 정책">
            <Ul>
              <Li title="개설·참여">
                각 문서에는 주제별 토론을 개설할 수 있으며, 참여자는 주제와 무관한 글이나
                도배성 글을 금지합니다.
              </Li>
              <Li title="댓글 운영">
                타인을 존중하며, 인신공격·차별·혐오 표현을 금지합니다. 운영 방침 위반 댓글은
                사전 통보 없이 편집·가림 처리될 수 있습니다.
              </Li>
              <Li title="수정·삭제">
                작성자는 자신의 글을 수정·삭제할 수 있으나, 삭제 시 “삭제된 글” 표기가
                남을 수 있습니다.
              </Li>
              <Li title="상태 표시">
                토론은 진행 중·합의 완료·종료 상태를 가질 수 있으며, 장기간 활동이 없거나
                규칙 위반이 반복되면 종료될 수 있습니다.
              </Li>
              <Li title="신고 처리">
                신고 접수 시 운영자는 기록을 검토하여 경고, 숨김, 차단, 게시 중단 등의
                조치를 결정합니다.
              </Li>
            </Ul>
          </Article>

          {/* 이용자 관리 정책 */}
          <Article id="user-policy" title="이용자 관리 정책">
            <Ul>
              <Li title="가입·인증">
                학교 이메일 인증을 통해 가입할 수 있으며, 부정 사용이 확인되면 이용이 제한될
                수 있습니다.
              </Li>
              <Li title="프로필">
                닉네임 등 공개 정보는 커뮤니티 가이드에 적합해야 하며, 타인 사칭·홍보·불건전
                표현을 금지합니다.
              </Li>
              <Li title="금지 행위">
                스팸, 시스템 악용, 불법 정보 유통, 저작권 침해, 개인정보 불법 수집·공유를
                금지합니다.
              </Li>
              <Li title="제재 기준">
                위반 정도와 누적 횟수에 따라 경고, 일시 차단, 영구 차단이 적용될 수 있습니다.
                제재 이의 제기는 안내된 채널로 접수할 수 있습니다.
              </Li>
            </Ul>
          </Article>

          {/* 운영 관리 정책 */}
          <Article id="ops-policy" title="운영 관리 정책">
            <Ul>
              <Li title="관리 권한">
                운영자는 신고 처리, 문서/토론 관리, 사용자 제재, 버전 복원 등 서비스 유지에
                필요한 권한을 가집니다.
              </Li>
              <Li title="로그 및 보존">
                보안·감사를 위해 최소한의 접근 로그를 보존할 수 있으며, 관련 법령과 내부
                정책에 따라 기간·범위를 결정합니다.
              </Li>
              <Li title="장애·보안 대응">
                서비스 장애·보안 사고 발생 시 일시적 기능 제한·롤백이 있을 수 있으며, 필요한
                경우 공지를 통해 안내합니다.
              </Li>
              <Li title="정책 변경">
                정책은 사전 공지 후 개정될 수 있습니다. 중대한 변경은 합리적인 유예기간을
                두고 적용합니다.
              </Li>
            </Ul>
          </Article>

          {/* 저작권 */}
          <Article id="copyright" title="저작권">
            <Ul>
              <Li title="게시물 권리">
                이용자가 작성한 콘텐츠의 저작권은 원저작자에게 있습니다. 이용자는 자신이 권리를
                보유하거나 적법한 이용 허락을 받은 내용만 게시해야 합니다.
              </Li>
              <Li title="라이선스">
                서비스는 문서의 자유 이용을 장려합니다. 구체적 라이선스(예: CC 계열) 적용 여부는
                운영 공지에 따르며, 명시된 조건을 준수해야 합니다.
              </Li>
              <Li title="침해 신고">
                저작권 침해가 의심되는 경우 증빙과 함께 신고해 주시기 바랍니다. 운영자는 사실
                확인 후 게시 중단, 열람 제한, 복원 등을 결정합니다.
              </Li>
              <Li title="인용 가이드">
                합리적 범위의 인용은 출처와 원문 링크를 명확히 표기해야 합니다.
              </Li>
            </Ul>
          </Article>

          {/* 개인정보 처리방침 */}
          <Article id="privacy" title="개인정보 처리방침">
            <p className="text-sm text-gray-600 mb-4">
              본 방침은 관계 법령을 준수하며, 서비스 제공을 위해 필요한 최소한의 개인정보만을
              수집·이용합니다. 실제 운영에 맞게 항목을 보완해 주십시오.
            </p>
            <Ul>
              <Li title="수집 항목">
                필수: 이메일, 닉네임, 학교 인증 정보, 접근 로그(보안 목적)
                <br />
                선택: 프로필 이미지 등
              </Li>
              <Li title="이용 목적">
                회원 식별·인증, 서비스 제공, 게시물 관리, 민원 처리, 보안 및 부정 이용 방지
              </Li>
              <Li title="보유 기간">
                회원 탈퇴 시 지체 없이 파기하되, 법령·분쟁 대비 목적의 기록은 해당 기간 보관
              </Li>
              <Li title="제3자 제공·위탁">
                법령 근거 또는 동의가 있는 경우에 한하여 제공·위탁하며, 수탁사와는
                개인정보 처리에 관한 계약을 체결합니다.
              </Li>
              <Li title="파기 절차">
                목적 달성 후 지체 없이 복구 불가능한 방법으로 파기합니다.
              </Li>
              <Li title="이용자 권리">
                열람·정정·삭제·처리정지 요구권을 보장하며, 요청은 지정 채널로 접수합니다.
              </Li>
              <Li title="문의처">
                이메일: [운영자 이메일], 주소/연락처: [운영사 정보]
              </Li>
            </Ul>
          </Article>
        </section>
      </div>
    </main>
  );
}

/** 서브 컴포넌트들 */
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

function Ul({ children }: React.PropsWithChildren) {
  return <ul className="space-y-3">{children}</ul>;
}

function Li({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <li className="text-sm leading-6">
      <span className="font-medium text-gray-900">{title}. </span>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}
