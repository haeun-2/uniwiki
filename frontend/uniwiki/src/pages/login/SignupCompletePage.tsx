// src/pages/SignupCompletePage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SignupCompletePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // ✅ 닉네임 자동 중복 확인(디바운스)
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const reqSeq = useRef(0);

  // ✅ 알림(이메일) 수신 동의 체크박스 상태
  const [pushAgree, setPushAgree] = useState<boolean>(true);

  // 유효성
  const isNicknameValid = nickname.trim().length >= 2;
  const isPasswordValid =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
  const isPasswordMatch = password === passwordConfirm && passwordConfirm !== "";

  // 닉네임 자동 중복 체크(400ms 디바운스)
  useEffect(() => {
    const next = nickname.trim();

    // 입력 초기/짧음 → 상태 리셋
    if (!next || next.length < 2) {
      setNicknameAvailable(null);
      setIsCheckingNickname(false);
      return;
    }

    setIsCheckingNickname(true);
    setNicknameAvailable(null);

    const mySeq = ++reqSeq.current;
    const ctrl = new AbortController();

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/auth/nickname/check?nickname=${encodeURIComponent(
            next
          )}`,
          { method: "GET", headers: { Accept: "application/json" }, signal: ctrl.signal }
        );

        if (reqSeq.current !== mySeq) return; // 최신 입력 아님 → 무시

        if (!res.ok) {
          setNicknameAvailable(null);
          alert("닉네임 확인 중 오류가 발생했습니다.");
          return;
        }
        const data = await res.json(); // { available: boolean } 가정
        setNicknameAvailable(!!data.available);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setNicknameAvailable(null);
          console.error("Nickname check error:", e);
        }
      } finally {
        if (reqSeq.current === mySeq) setIsCheckingNickname(false);
      }
    }, 400);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [nickname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNicknameValid) {
      alert("닉네임은 2자 이상이어야 합니다.");
      return;
    }
    if (isCheckingNickname || nicknameAvailable !== true) {
      alert("닉네임 중복 확인을 통과해야 합니다.");
      return;
    }
    if (!isPasswordValid) {
      alert("비밀번호는 영문 대/소문자, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
      return;
    }
    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://k13d104.p.ssafy.io/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          nickname: nickname.trim(),
          password,
          pushAgree, // ← 회원가입에 함께 전달
        }),
      });

      if (response.ok) {
        alert("회원가입이 완료되었습니다!");
        navigate("/");
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error.message || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Signup completion error:", error);
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이메일 (읽기 전용) */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
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

          {/* 사용자 닉네임 (자동 중복 체크) */}
          <div>
            <label htmlFor="nickname" className="mb-2 block text-sm font-medium text-gray-700">
              사용자 닉네임
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {nickname && (
              <p className="mt-1 text-xs">
                {!isNicknameValid && <span className="text-red-600">닉네임은 2자 이상이어야 합니다.</span>}
                {isNicknameValid && isCheckingNickname && (
                  <span className="text-gray-500">중복 확인 중…</span>
                )}
                {isNicknameValid && !isCheckingNickname && nicknameAvailable === true && (
                  <span className="text-green-600">✓ 사용 가능한 닉네임입니다.</span>
                )}
                {isNicknameValid && !isCheckingNickname && nicknameAvailable === false && (
                  <span className="text-red-600">✗ 이미 사용 중인 닉네임입니다.</span>
                )}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {password && (
              <p className={`mt-1 text-xs ${isPasswordValid ? "text-green-600" : "text-orange-600"}`}>
                {isPasswordValid
                  ? "안전한 비밀번호입니다."
                  : "영문 대/소문자, 숫자, 특수문자(~!@#$%^&*)를 포함하여 8자리 이상"}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="passwordConfirm" className="mb-2 block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              placeholder="••••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {passwordConfirm && (
              <p className={`mt-1 text-xs ${isPasswordMatch ? "text-green-600" : "text-red-600"}`}>
                {isPasswordMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>

          {/* 알림 수신 동의 */}
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
            <input
              id="pushAgree"
              type="checkbox"
              checked={pushAgree}
              onChange={(e) => setPushAgree(e.target.checked)}
              className="mt-1 h-4 w-4 rounded
                          accent-uniwikicolor
                          focus:outline-none focus:ring-2 focus:ring-uniwikicolor/40"
            />
            <label htmlFor="pushAgree" className="text-sm text-gray-700">
              즐겨찾기 문서에 변경 사항이 있을 때 <b>이메일로 알림</b>을 받겠습니다.
              <br />
              <span className="text-xs text-gray-500">
                언제든 마이페이지 &gt; 알림 설정에서 변경할 수 있어요.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={
              isLoading ||
              !isNicknameValid ||
              isCheckingNickname ||
              nicknameAvailable !== true ||
              !isPasswordValid ||
              !isPasswordMatch
            }
            className="w-full rounded-lg bg-[#5b7c99] px-4 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
          >
            {isLoading ? "처리 중..." : "가입"}
          </button>
        </form>
      </div>
    </div>
  );
}
