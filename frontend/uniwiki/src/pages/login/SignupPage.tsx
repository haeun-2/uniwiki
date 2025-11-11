// src/pages/SignupPage.tsx

import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ⬇️ 이메일 디바운스 중복 체크 상태
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);
  const reqSeq = useRef(0);

  const navigate = useNavigate();

  // 간단 이메일 형식 검증
  const isEmailFormatValid = /^\S+@\S+\.\S+$/.test(email);

  // ⬇️ 400ms 디바운스 자동 중복 체크
  useEffect(() => {
    // 코드 입력 단계에서는 체크 불필요
    if (isCodeSent) return;

    // 입력이 비었으면 상태 초기화
    if (!email) {
      setIsEmailChecking(false);
      setEmailAvailable(null);
      setEmailCheckError(null);
      return;
    }

    // 형식이 틀리면 서버 체크 안 함
    if (!isEmailFormatValid) {
      setIsEmailChecking(false);
      setEmailAvailable(null);
      setEmailCheckError(null);
      return;
    }

    setIsEmailChecking(true);
    setEmailAvailable(null);
    setEmailCheckError(null);

    const mySeq = ++reqSeq.current;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/auth/email/check?email=${encodeURIComponent(
            email
          )}`,
          { method: "GET", headers: { Accept: "application/json" }, signal: ctrl.signal }
        );

        if (reqSeq.current !== mySeq) return; // 최신 입력만 반영

        if (!res.ok) {
          setEmailAvailable(null);
          setEmailCheckError("이메일 중복 확인 중 오류가 발생했습니다.");
          return;
        }

        const data = await res.json(); // { available: boolean }
        setEmailAvailable(!!data.available);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setEmailAvailable(null);
          setEmailCheckError("서버와의 연결에 실패했습니다.");
          console.error("email check error:", e);
        }
      } finally {
        if (reqSeq.current === mySeq) setIsEmailChecking(false);
      }
    }, 400);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [email, isCodeSent, isEmailFormatValid]);

  // 1단계: 인증 코드 전송
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      alert("개인정보 처리방침 및 이용약관에 동의해주세요.");
      return;
    }
    if (!isEmailFormatValid) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }
    // 디바운스 검사 진행 중이면 대기 유도
    if (isEmailChecking) {
      alert("이메일 중복 확인 중입니다. 잠시만 기다려주세요.");
      return;
    }
    // 중복이면 차단
    if (emailAvailable === false) {
      alert("이미 가입된 이메일입니다. 로그인 화면으로 이동해주세요.");
      return;
    }
    // 체크 결과가 아직 없으면 보수적으로 한 번 더 검사 권장(선택)
    if (emailAvailable !== true) {
      alert("이메일 중복 확인 후 진행해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/auth/email/send-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        alert("인증 코드가 이메일로 발송되었습니다.");
        setIsCodeSent(true);
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error.message || "인증 코드 전송 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Send code error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 인증 코드 검증 및 다음 페이지로 이동
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/auth/email/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verificationCode }),
        }
      );

      if (response.ok) {
        alert("이메일 인증이 완료되었습니다!");
        navigate(`/signup/complete?email=${encodeURIComponent(email)}`);
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error.message || "인증 코드가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("Verify code error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-semibold text-gray-900">
          계정 만들기
        </h1>

        {!isCodeSent ? (
          // 1단계: 이메일 입력
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* 상태 메시지 */}
              {email ? (
                <p className="mt-2 text-xs">
                  {!isEmailFormatValid && (
                    <span className="text-red-600">
                      올바른 이메일 형식이 아닙니다.
                    </span>
                  )}
                  {isEmailFormatValid && isEmailChecking && (
                    <span className="text-gray-500">이메일 중복 확인 중…</span>
                  )}
                  {isEmailFormatValid && !isEmailChecking && emailAvailable === true && (
                    <span className="text-green-600">
                      사용 가능한 이메일입니다.
                    </span>
                  )}
                  {isEmailFormatValid && !isEmailChecking && emailAvailable === false && (
                    <span className="text-red-600">
                      이미 가입된 이메일입니다.
                    </span>
                  )}
                  {emailCheckError && (
                    <span className="text-red-600">{emailCheckError}</span>
                  )}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  학교 이메일(@univ.ac.kr)을 인증 시 학교 우위 소속 권리가 부여됩니다.
                </p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
  className="mt-1 h-4 w-4 rounded border-gray-300 accent-uniwikicolor focus:ring-uniwikicolor/40"
              />
              <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
                개인정보 처리방침 및 이용약관에 동의합니다
              </label>
            </div>

            <button
              type="submit"
              disabled={
                isLoading ||
                !agreed ||
                !isEmailFormatValid ||
                isEmailChecking ||
                emailAvailable === false || // 중복이면 비활성화
                emailAvailable === null // 아직 체크 결과가 없을 때도 막고 싶으면 유지
              }
              className="w-full rounded-lg bg-[#5b7c99] px-4 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
            >
              {isLoading ? "전송 중..." : "인증 코드 받기"}
            </button>
          </form>
        ) : (
          // 2단계: 인증 코드 입력
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-600"
              />
            </div>

            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                인증 코드
              </label>
              <input
                id="code"
                type="text"
                placeholder="인증 코드를 입력해주세요"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                이메일로 발송된 6자리 인증 코드를 입력해주세요.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCodeSent(false)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[#5b7c99] px-4 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
              >
                {isLoading ? "확인 중..." : "인증하기"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
