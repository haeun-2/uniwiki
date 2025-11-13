// src/pages/LoginPage.tsx

import { useState, useEffect, useRef } from "react";
import { Mail, Lock, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const FLASH_AUTO_MS = 3200;

export default function LoginPage() {
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // 브랜드 컬러 적용 인풋 유틸 클래스 (조금 더 진한 테두리/포커스 링)
  const INPUT_ICON =
    "w-full rounded-lg border border-gray-400 px-10 py-2.5 " + // 진한 기본 테두리
    "caret-uniwikicolor " +
    "ring-1 ring-inset ring-transparent " +
    "focus:outline-none focus:border-uniwikicolor " +
    "focus:ring-2 focus:ring-uniwikicolor/70 " +                // 또렷한 링
    "focus:bg-uniwikicolor/2 " +                                // 포커스 시 아주 옅은 채움
    "transition-colors";

  const INPUT_PLAIN =
    "w-full rounded-lg border border-gray-400 px-4 py-2.5 " +
    "caret-uniwikicolor " +
    "ring-1 ring-inset ring-transparent " +
    "focus:outline-none focus:border-uniwikicolor " +
    "focus:ring-2 focus:ring-uniwikicolor/70 " +
    "focus:bg-uniwikicolor/2 " +
    "transition-colors";
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===== 플래시 팝업 상태 =====
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState<"success" | "error" | "info">(
    "info"
  );
  const flashTimerRef = useRef<number | null>(null);

  const showFlash = (
    msg: string,
    type: "success" | "error" | "info" = "info",
    ms = FLASH_AUTO_MS
  ) => {
    setFlash(msg);
    setFlashType(type);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    if (!/오류|실패|에러/.test(msg)) {
      flashTimerRef.current = window.setTimeout(() => setFlash(""), ms);
    }
  };

  const closeFlash = () => {
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    setFlash("");
  };

  useEffect(
    () => () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    },
    []
  );

  // 모달 관련 상태
  const [resetEmail, setResetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isModalOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isModalOpen, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showFlash("이메일과 비밀번호를 입력해주세요.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userId", data.userId.toString());
        localStorage.setItem("nickName", data.nickName);
        localStorage.setItem("role", data.role);
        if (data.universityId) {
          localStorage.setItem("universityId", data.universityId.toString());
        }

        window.dispatchEvent(new Event("uniwiki:auth-changed"));

        showFlash(`${data.nickName}님, 환영합니다!`, "success");

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } else {
        const error = await response.json();
        showFlash(
          error.message ||
            "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.",
          "error"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      showFlash("서버와의 연결에 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!resetEmail) {
      showFlash("이메일을 입력해주세요.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      showFlash("올바른 이메일 형식을 입력해주세요.", "error");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/auth/password/find/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
          }),
        }
      );

      if (response.ok) {
        showFlash("인증번호가 발송되었습니다. 이메일을 확인해주세요.", "success");
        setIsCodeSent(true);
        setTimeLeft(180);
      } else if (response.status === 404) {
        showFlash("등록되지 않은 이메일입니다.", "error");
      } else {
        const error = await response.json();
        showFlash(
          error.message || "인증번호 발송에 실패했습니다.",
          "error"
        );
      }
    } catch (error) {
      console.error("Send code error:", error);
      showFlash("서버와의 연결에 실패했습니다.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      showFlash("인증번호를 입력해주세요.", "error");
      return;
    }

    if (!newPassword || !confirmPassword) {
      showFlash("새 비밀번호를 입력해주세요.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showFlash("비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showFlash(
        "비밀번호는 영문 대/소문자, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
        "error"
      );
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/auth/password/find",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
            code: verificationCode,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
          }),
        }
      );

      if (response.ok) {
        showFlash(
          "비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.",
          "success"
        );
        setIsModalOpen(false);
        setResetEmail("");
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeLeft(0);
        setIsCodeSent(false);
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.code === "EMAIL_CODE_400_01") {
          showFlash("잘못된 인증번호입니다. 다시 확인해주세요.", "error");
        } else {
          showFlash(
            errorData.message || "비밀번호 재설정에 실패했습니다.",
            "error"
          );
        }
      } else {
        const error = await response.json();
        showFlash(
          error.message || "비밀번호 재설정에 실패했습니다.",
          "error"
        );
      }
    } catch (error) {
      console.error("Password reset error:", error);
      showFlash("서버와의 연결에 실패했습니다.", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setResetEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeLeft(0);
    setIsCodeSent(false);
  };

  const isPasswordValid =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[^A-Za-z\d]/.test(newPassword);
  const isPasswordMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  // 플래시 타입별 스타일
const getFlashStyle = () => {
  switch (flashType) {
    case "success":
      return "bg-green-500/80 border-green-600/40"; // 80% 배경, 40% 테두리
    case "error":
      return "bg-red-500/80 border-red-600/40";
    default:
      return "bg-blue-500/80 border-blue-600/40";   // info
  }
};


  return (
    <>
      {/* ===== 플래시 팝업 (화면 상단 중앙, 고정) ===== */}
      {flash && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-slideDown">
          <div
  className={`
    ${getFlashStyle()}
    min-w-[320px] max-w-md
    rounded-xl border            /* ← border-2 에서 얇게 */
    px-6 py-4
    shadow-lg                    /* ← shadow-2xl 에서 약하게 */
    backdrop-blur-[2px]          /* (선택) 살짝 유리 느낌 */
    flex items-center justify-between gap-4
  `}>

            <span className="text-white font-medium text-base flex-1">
              {flash}
            </span>
            <button
              onClick={closeFlash}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0 cursor-pointer"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* 애니메이션 + 이 페이지 전용 Autofill 오버라이드 */}
      <style>{`
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-slideDown { animation: slideDown 0.3s ease-out; }

  /* ★ 이 페이지(LoginPage) 전용 자동완성 스타일: 래퍼 .login-scope 내부로만 제한 */
  .login-scope input:-webkit-autofill,
  .login-scope input:-webkit-autofill:hover,
  .login-scope input:-webkit-autofill:focus {
    /* 은은한 브랜드색 틴트(약 6%) */
    box-shadow: 0 0 0 1000px rgba(44,128,160,0.06) inset !important;
    -webkit-text-fill-color: #0f172a !important;
    caret-color: #2c80a0 !important;
    border: 1px solid #2c80a0 !important; /* 보더도 브랜드색 */
    transition: background-color 9999s ease-out 0s !important; /* 깜빡임 방지 */
  }
  .login-scope input:autofill {
    box-shadow: 0 0 0 1000px rgba(44,128,160,0.06) inset !important;
    color: #0f172a !important;
    caret-color: #2c80a0 !important;
    border: 1px solid #2c80a0 !important;
  }
`}</style>

      <div className="login-scope flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="mb-8 text-center text-3xl font-semibold text-gray-900">
            로그인
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
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
                  /* 값이 채워지면 은은한 브랜드 틴트(3%) */
                  className={`${INPUT_ICON} ${email ? "bg-uniwikicolor/3" : "bg-white"}`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${INPUT_ICON} ${password ? "bg-uniwikicolor/3" : "bg-white"}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-uniwikicolor hover:text-uniwikicolor_hover cursor-pointer"
              >
                비밀번호를 잊으셨나요?
              </button>
              <div className="flex gap-3">
                <Link
                  to="/signup"
                  className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  계정 만들기
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-[#5b7c99] px-4 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
                >
                  {isLoading ? "로그인 중..." : "로그인"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 비밀번호 재설정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              disabled={isVerifying}
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              비밀번호 찾기
            </h2>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isCodeSent || isVerifying}
                    className={`${INPUT_PLAIN} disabled:bg-gray-100`}
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isCodeSent || isVerifying}
                    className="rounded-lg bg-[#5b7c99] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4a6578] cursor-pointer disabled:bg-gray-400 disabled:cursor-default"
                  >
                    {isVerifying ? "발송 중..." : "인증번호 발송"}
                  </button>
                </div>
              </div>

              {isCodeSent && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      인증번호
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="6자리 인증번호"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={isVerifying}
                        maxLength={6}
                        className={`${INPUT_PLAIN} disabled:bg-gray-100`}
                      />
                      <span
                        className={`flex items-center text-sm font-medium ${
                          timeLeft <= 30 ? "text-red-500" : "text-orange-500"
                        }`}
                      >
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      인증번호가 오지 않았다면 스팸 메일함을 확인해주세요.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isVerifying}
                      className={`${INPUT_PLAIN} disabled:bg-gray-100`}
                    />
                    {newPassword && (
                      <p
                        className={`mt-1 text-xs ${
                          isPasswordValid
                            ? "text-green-600"
                            : "text-orange-500"
                        }`}
                      >
                        {isPasswordValid
                          ? "안전한 비밀번호입니다."
                          : "영문 대/소문자, 숫자, 특수문자를 포함하여 8자 이상"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      비밀번호 확인
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isVerifying}
                      className={`${INPUT_PLAIN} disabled:bg-gray-100`}
                    />
                    {confirmPassword && (
                      <p
                        className={`mt-1 text-xs ${
                          isPasswordMatch ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {isPasswordMatch
                          ? "비밀번호가 일치합니다."
                          : "비밀번호가 일치하지 않습니다."}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isVerifying}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                >
                  취소
                </button>
                {isCodeSent && (
                  <button
                    type="submit"
                    disabled={
                      !isPasswordValid ||
                      !isPasswordMatch ||
                      !verificationCode ||
                      isVerifying
                    }
                    className="rounded-lg bg-[#5b7c99] px-6 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
                  >
                    {isVerifying ? "처리 중..." : "비밀번호 재설정"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
                       