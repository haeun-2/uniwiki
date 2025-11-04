// src/pages/LoginPage.tsx

import { useState, useEffect } from "react";
import { Mail, Lock, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 모달 관련 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(135); // 2:15 = 135초

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

        alert(`${data.nickName}님, 환영합니다!`);
        navigate("/"); // 메인 페이지로 이동
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

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    console.log("Password reset:", { verificationCode, newPassword });
    alert("비밀번호가 재설정되었습니다.");
    setIsModalOpen(false);
    setTimeLeft(135); // 타이머 리셋
  };

  const handleSendCode = () => {
    console.log("Send verification code");
    alert("인증번호가 발송되었습니다.");
    setTimeLeft(135); // 타이머 리셋
  };

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
              onClick={() => {
                setIsModalOpen(false);
                setTimeLeft(135);
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="mb-6 text-xl font-semibold text-gray-900">비밀번호 재설정</h2>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  인증번호
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="954232"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className={`flex items-center text-sm ${timeLeft <= 30 ? 'text-red-500' : 'text-orange-500'}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    인증
                  </button>
                </div>
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-orange-500">
                  영문, 대소문자, 숫자, 특수문자(~!@#$%^&*) 포함하여 8자리 이상
                </p>
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {confirmPassword && (
                  <p className={`mt-1 text-xs ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {newPassword === confirmPassword ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setTimeLeft(135);
                  }}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#5b7c99] px-6 py-2.5 font-medium text-white hover:bg-[#4a6578]"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}