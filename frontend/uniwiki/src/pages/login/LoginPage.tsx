// src/pages/LoginPage.tsx

import { useState, useEffect } from "react";
import { Mail, Lock, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  
  const location = useLocation();
  const fromPath = (location.state as any)?.from || "/";

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 모달 관련 상태
  const [resetEmail, setResetEmail] = useState(""); // 비밀번호 찾기용 이메일
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(0); // 초기값 0으로 변경
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증번호 발송 여부
  const [isVerifying, setIsVerifying] = useState(false);

  // 타이머 기능
  useEffect(() => {
    if (!isModalOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isModalOpen, timeLeft]);

  // 시간을 MM:SS 형식으로 변환
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://k13d104.p.ssafy.io/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 토큰과 사용자 정보 저장
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userId", data.userId.toString());
        localStorage.setItem("nickName", data.nickName);
        localStorage.setItem("role", data.role);
        if (data.universityId) {
          localStorage.setItem("universityId", data.universityId.toString());
        }

        window.dispatchEvent(new Event("uniwiki:auth-changed"));

        alert(`${data.nickName}님, 환영합니다!`);

        navigate(fromPath, { replace: true });

      } else {
        const error = await response.json();
        alert(error.message || "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 발송
  const handleSendCode = async () => {
    if (!resetEmail) {
      alert("이메일을 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("http://k13d104.p.ssafy.io/api/v1/auth/password/find/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
        }),
      });

      if (response.ok) {
        alert("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
        setIsCodeSent(true);
        setTimeLeft(180); // 3분 타이머 시작
      } else if (response.status === 404) {
        alert("등록되지 않은 이메일입니다.");
      } else {
        const error = await response.json();
        alert(error.message || "인증번호 발송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Send code error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 비밀번호 재설정
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 검증
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
if (!passwordRegex.test(newPassword)) {
  alert("비밀번호는 영문 대/소문자, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
  return;
}

    setIsVerifying(true);

    try {
      const response = await fetch("http://k13d104.p.ssafy.io/api/v1/auth/password/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
          code: verificationCode,  // ✅ "code"로 변경
          newPassword: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      if (response.ok) {
        alert("비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.");
        setIsModalOpen(false);
        // 상태 초기화
        setResetEmail("");
        setVerificationCode("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeLeft(0);
        setIsCodeSent(false);
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.code === "EMAIL_CODE_400_01") {
          alert("잘못된 인증번호입니다. 다시 확인해주세요.");
        } else {
          alert(errorData.message || "비밀번호 재설정에 실패했습니다.");
        }
      } else {
        const error = await response.json();
        alert(error.message || "비밀번호 재설정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setResetEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeLeft(0);
    setIsCodeSent(false);
  };

  // 비밀번호 유효성 검사 (대문자, 소문자, 숫자, 특수문자 모두 포함)
const isPasswordValid = 
  newPassword.length >= 8 && 
  /[A-Z]/.test(newPassword) &&      // 대문자
  /[a-z]/.test(newPassword) &&      // 소문자
  /\d/.test(newPassword) &&          // 숫자
  /[^A-Za-z\d]/.test(newPassword);  // 특수문자
  const isPasswordMatch = newPassword === confirmPassword && confirmPassword !== "";

  return (
    <>
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="mb-8 text-center text-3xl font-semibold text-gray-900">로그인</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 px-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 px-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              disabled={isVerifying}
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="mb-6 text-xl font-semibold text-gray-900">비밀번호 찾기</h2>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              {/* 이메일 입력 */}
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
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isCodeSent || isVerifying}
                    className="rounded-lg bg-[#5b7c99] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
                  >
                    {isVerifying ? "발송 중..." : "인증번호 발송"}
                  </button>
                </div>
              </div>

              {/* 인증번호 입력 (이메일 발송 후에만 표시) */}
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
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                      />
                      <span className={`flex items-center text-sm font-medium ${timeLeft <= 30 ? 'text-red-500' : 'text-orange-500'}`}>
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    />
                    {newPassword && (
  <p className={`mt-1 text-xs ${isPasswordValid ? "text-green-600" : "text-orange-500"}`}>
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    />
                    {confirmPassword && (
                      <p className={`mt-1 text-xs ${isPasswordMatch ? 'text-green-600' : 'text-red-500'}`}>
                        {isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
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
                  className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                {isCodeSent && (
                  <button
                    type="submit"
                    disabled={!isPasswordValid || !isPasswordMatch || !verificationCode || isVerifying}
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