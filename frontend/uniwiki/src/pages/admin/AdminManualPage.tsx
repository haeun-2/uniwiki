import React from "react";

export default function AdminManualPage() {
  return (
    <>
      <h1 className="text-xl font-semibold mb-8">관리자 매뉴얼</h1>

      {/* 1️⃣ 유저 신고 처리 기준 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-uniwikicolor">
          1. 유저 신고 처리 기준
        </h2>
        <p className="text-sm text-gray-700 mb-3">
          사용자가 다른 이용자를 신고한 경우, 관리자는 신고 내용을 검토한 후 사안의 경중에 따라
          아래 기준에 맞춰 계정을 일시 또는 영구 차단합니다.
        </p>

        <table className="w-full text-sm border border-gray-200">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="py-2 px-3 w-72 text-left">위반 유형</th>
              <th className="py-2 px-3 w-48 text-left">차단 기간</th>
              <th className="py-2 px-3 text-left">비고</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-3">경미한 언행, 불쾌감 유발 표현</td>
              <td className="py-2 px-3">1일</td>
              <td className="py-2 px-3 text-gray-600">1회 경고성 조치 (반복 시 강화)</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-3">욕설, 인신공격, 비하 발언</td>
              <td className="py-2 px-3">3일</td>
              <td className="py-2 px-3 text-gray-600">재발 시 7일 또는 30일로 연장</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-3">허위 정보 기재, 문서 훼손</td>
              <td className="py-2 px-3">7일</td>
              <td className="py-2 px-3 text-gray-600">고의적/반복 시 30일 차단</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 px-3">반복적인 신고 누적 (3회 이상)</td>
              <td className="py-2 px-3">30일</td>
              <td className="py-2 px-3 text-gray-600">짧은 기간 안에 많은 신고가 누적된 경우 영구 차단 고려</td>
            </tr>
            <tr>
              <td className="py-2 px-3">불법·음란물, 명예훼손, 심각한 공격적 행위</td>
              <td className="py-2 px-3">1000년 (영구 차단)</td>
              <td className="py-2 px-3 text-gray-600">즉시 영구 차단 및 재가입 제한</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 2️⃣ 토론 신고 및 차단 기준 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-uniwikicolor">
          2. 토론 신고 및 차단 기준
        </h2>
        <ul className="list-disc pl-6 text-sm text-gray-700">
          <li>토론 중 상대방을 인신공격하거나 비하한 경우 → 3일 차단</li>
          <li>토론 목적을 벗어난 홍보/스팸성 발언 → 7일 차단</li>
          <li>불법/음란물 관련 언급 → 즉시 영구 차단</li>
          <li>중복 신고된 게시글은 관리자가 우선 검토</li>
        </ul>
      </section>

      {/* 3️⃣ 오래된 토론 종료 기준 */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-uniwikicolor">
          3. 오래된 토론 종료 기준
        </h2>
        <ul className="list-disc pl-6 text-sm text-gray-700">
          <li>최근 14일간 새로운 댓글이 없는 토론은 “자동 종료” 대상</li>
          <li>관리자는 합의 완료된 토론을 수동 종료 가능</li>
          <li>종료된 토론은 다시 댓글 작성 불가</li>
        </ul>
      </section>

      {/* 4️⃣ 문서 관리 기준 */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-uniwikicolor">
          4. 문서 관리 기준
        </h2>
        <ul className="list-disc pl-6 text-sm text-gray-700">
          <li>악의적 편집(대량 삭제, 욕설 추가 등) 발견 시 해당 버전 삭제</li>
          <li>5회 이상 동일 문서 수정 시 모니터링 대상</li>
          <li>비정상적인 수정(봇, 반복 패턴)은 영구 차단 검토</li>
        </ul>
      </section>
    </>
  );
}
