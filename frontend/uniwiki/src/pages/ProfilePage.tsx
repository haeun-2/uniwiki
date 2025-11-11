// src/pages/ProfilePage.tsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ 알림 수신 동의(이메일) 상태
  const [pushAgree, setPushAgree] = useState<boolean>(false);
  const [isPushLoading, setIsPushLoading] = useState<boolean>(true);
  const [isPushSaving, setIsPushSaving] = useState<boolean>(false);

  // 닉네임 변경 모달 상태
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  // ⬇️ 닉네임 자동 중복확인(디바운스)용 상태
  const [isNickChecking, setIsNickChecking] = useState(false);
  const [nickAvailable, setNickAvailable] = useState<boolean | null>(null);
  const reqSeq = useRef(0); // 최신 요청 식별

  // 비밀번호 변경 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // 계정 삭제 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const getToken = () =>
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  // ✅ 사용자 정보 조회
  useEffect(() => {
    const fetchUserInfo = async () => {
      const accessToken = getToken();

      if (!accessToken) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("https://k13d104.p.ssafy.io/api/v1/users/me", {
          method: "GET",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setNickname(data.nickname);
          setEmail(data.email);
          setRole(
            data.role === "USER" ? "사용자" : data.role === "ADMIN" ? "관리자" : data.role
          );
        } else if (response.status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          navigate("/login");
        } else {
          alert("사용자 정보를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("Fetch user info error:", error);
        alert("서버와의 연결에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // ✅ 알림 동의 조회 (GET /api/v1/users/me/push)
  useEffect(() => {
    const fetchPush = async () => {
      const accessToken = getToken();
      if (!accessToken) return;

      try {
        setIsPushLoading(true);
        const res = await fetch("https://k13d104.p.ssafy.io/api/v1/users/me/push", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json(); // { pushAgree: boolean }
          setPushAgree(!!data.pushAgree);
        } else if (res.status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          navigate("/login");
        } else {
          alert("알림 설정을 불러오지 못했습니다.");
        }
      } catch (e) {
        console.error("GET push error:", e);
        alert("알림 설정을 불러오지 못했습니다.");
      } finally {
        setIsPushLoading(false);
      }
    };

    fetchPush();
  }, [navigate]);

  // 저장(프로필 전반) — 여기서 알림 동의 PATCH까지 수행
  const handleSave = async () => {
    const accessToken = getToken();
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // ✅ 알림 동의 저장 (PATCH /api/v1/users/me/push)
    try {
      setIsPushSaving(true);
      const res = await fetch("https://k13d104.p.ssafy.io/api/v1/users/me/push", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ pushAgree }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }
        const err = await res.json().catch(() => ({}));
        alert(err.message || "알림 설정 저장에 실패했습니다.");
        return;
      }

      alert("프로필이 저장되었습니다.");
      setIsEditing(false);
    } catch (e) {
      console.error("PATCH push error:", e);
      alert("알림 설정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsPushSaving(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  // 계정 삭제 확인
  const handleDeleteConfirm = () => {
    if (deleteConfirmText !== "계정 삭제") {
      alert("'계정 삭제'를 정확히 입력해주세요.");
      return;
    }
    console.log("Account deleted");
    alert("계정이 삭제되었습니다.");
    setIsDeleteModalOpen(false);
    setDeleteConfirmText("");
  };

  // ⬇️ 닉네임 변경 저장 (PATCH /api/v1/users/me/nickname/change) + 가드
  const handleNicknameSave = async () => {
    const next = newNickname.trim();

    if (next.length < 2) {
      alert("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    // 변경 없음: 서버 호출 불필요
    if (next === nickname) {
      setIsNicknameModalOpen(false);
      setNewNickname("");
      setNickAvailable(null);
      return;
    }

    // 중복 미확인/불가일 때 막기
    if (isNickChecking || nickAvailable !== true) {
      alert("닉네임 중복 확인을 통과해야 저장할 수 있습니다.");
      return;
    }

    const accessToken = getToken();
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/users/me/nickname/change",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ nickname: next }),
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          navigate("/login");
          return;
        }
        const err = await res.json().catch(() => ({}));
        alert(err.message || "닉네임 변경에 실패했습니다.");
        return;
      }

      // 서버가 성공 시 OK(200). 필요하면 응답에서 닉네임을 다시 읽어도 됨.
      setNickname(next);
      alert("닉네임이 변경되었습니다.");
      setIsNicknameModalOpen(false);
      setNewNickname("");
      setNickAvailable(null);
    } catch (e) {
      console.error("PATCH nickname error:", e);
      alert("서버와의 연결에 실패했습니다.");
    }
  };

  // ⬇️ 닉네임 자동 중복확인(400ms 디바운스)
  useEffect(() => {
    if (!isNicknameModalOpen) return;
    const next = newNickname.trim();

    // 길이 미달 → 검사 안 함
    if (next.length < 2) {
      setNickAvailable(null);
      setIsNickChecking(false);
      return;
    }

    // 기존 닉네임과 동일 → 중복확인 패스(저장 시 서버 호출은 스킵)
    if (next === nickname) {
      setNickAvailable(true);
      setIsNickChecking(false);
      return;
    }

    setIsNickChecking(true);
    setNickAvailable(null);

    const mySeq = ++reqSeq.current;
    const ctrl = new AbortController();

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/auth/nickname/check?nickname=${encodeURIComponent(
            next
          )}`,
          { headers: { Accept: "application/json" }, signal: ctrl.signal }
        );

        // 더 최신 입력이 있으면 무시
        if (reqSeq.current !== mySeq) return;

        if (!res.ok) {
          setNickAvailable(null);
          alert("닉네임 중복 확인 중 오류가 발생했습니다.");
          return;
        }

        const data = await res.json(); // { available: boolean } 가정
        setNickAvailable(!!data.available);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setNickAvailable(null);
          console.error("nickname check error:", e);
        }
      } finally {
        if (reqSeq.current === mySeq) setIsNickChecking(false);
      }
    }, 400);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [newNickname, isNicknameModalOpen, nickname]);

  // 비밀번호 변경 저장
  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    const accessToken = getToken();
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setIsPasswordLoading(true);

    try {
      const response = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/users/password/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
          }),
        }
      );

      if (response.ok) {
        alert("비밀번호가 변경되었습니다.");
        setIsPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (response.status === 401) {
        alert("현재 비밀번호가 일치하지 않습니다.");
      } else if (response.status === 400) {
        const errorData = await response.json();
        alert(
          errorData.message ||
            "비밀번호 형식이 올바르지 않습니다.\n영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요."
        );
      } else {
        alert("비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const isNicknameValid = newNickname.trim().length >= 2;
  const isPasswordValid =
    newPassword.length >= 8 &&
    /[A-Za-z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[^A-Za-z\d]/.test(newPassword);
  const isPasswordMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  // ✅ 로딩 중 UI
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-12 text-center text-3xl font-semibold text-gray-900">
          내 정보
        </h1>

        <div className="space-y-8">
          {/* 닉네임 */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <label className="text-lg font-medium text-gray-900">닉네임</label>
            <div className="flex items-center gap-4">
              <span className="text-gray-900">{nickname}</span>
              {isEditing && (
                <button
                  onClick={() => {
                    setNewNickname(nickname);   // ← 모달 열 때 현재 닉네임 주입
                    setNickAvailable(null);     // 상태 초기화
                    setIsNicknameModalOpen(true);
                  }}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  수정
                </button>
              )}
            </div>
          </div>

          {/* 이메일 */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <label className="text-lg font-medium text-gray-900">이메일</label>
            <span className="text-gray-900">{email}</span>
          </div>

          {/* 비밀번호 */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <label className="text-lg font-medium text-gray-900">비밀번호</label>
            <div className="flex items-center gap-4">
              {isEditing ? (
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="text-gray-600 hover:text-gray-900 underline"
                >
                  비밀번호 변경
                </button>
              ) : (
                <span className="text-gray-900">••••••••</span>
              )}
            </div>
          </div>

          {/*  알림 수신(이메일) */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <label className="text-lg font-medium text-gray-900">
              알림 수신
            </label>
            <div className="flex items-center gap-3">
              {isPushLoading ? (
                <div className="h-5 w-24 rounded bg-gray-100 animate-pulse" />
              ) : (
                <>
                  <input
                    id="pushAgree"
                    type="checkbox"
                    className="h-4 w-4 accent-uniwikicolor disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-uniwikicolor/40 rounded"
                    checked={pushAgree}
                    onChange={(e) => setPushAgree(e.target.checked)}
                    disabled={!isEditing || isPushSaving}
                  />
                  <label
                    htmlFor="pushAgree"
                    className={`text-sm ${
                      isEditing ? "text-gray-700" : "text-gray-500"
                    }`}
                  >
                    즐겨찾기 문서 수정 시 이메일로 알림
                  </label>
                </>
              )}
            </div>
          </div>

          {/* 권한 */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <label className="text-lg font-medium text-gray-900">권한</label>
            <span className="text-gray-900">{role}</span>
          </div>

          {/* 버튼 */}
          <div className="pt-8">
            {isEditing ? (
              <div className="flex justify-between">
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500 px-8 py-2.5 font-medium text-white hover:bg-red-600"
                >
                  계정 삭제
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPushSaving}
                  className="rounded-lg bg-[#5b7c99] px-8 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:opacity-50"
                >
                  {isPushSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-[#5b7c99] px-8 py-2.5 font-medium text-white hover:bg-[#4a6578]"
                >
                  수정
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 닉네임 변경 모달 */}
      {isNicknameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsNicknameModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              닉네임 변경
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              닉네임은 두 글자 이상부터 사용가능합니다.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="새 닉네임을 입력하세요"
                value={newNickname}
                onChange={(e) => {
                  setNewNickname(e.target.value);
                  setNickAvailable(null); // 입력 중 상태 초기화
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              {/* 상태 표시 */}
              {newNickname && (
                <p className="text-xs">
                  {!isNicknameValid && (
                    <span className="text-red-600">닉네임은 2자 이상이어야 합니다.</span>
                  )}
                  {isNicknameValid && isNickChecking && (
                    <span className="text-gray-500">중복 확인 중…</span>
                  )}
                  {isNicknameValid && !isNickChecking && nickAvailable === true && (
                    <span className="text-green-600">사용 가능한 닉네임입니다.</span>
                  )}
                  {isNicknameValid && !isNickChecking && nickAvailable === false && (
                    <span className="text-red-600">이미 사용 중인 닉네임입니다.</span>
                  )}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsNicknameModalOpen(false)}
                className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleNicknameSave}
                disabled={
                  isNickChecking ||
                  !isNicknameValid ||
                  // 동일 닉네임이면 저장 가능(호출 스킵), 다르면 반드시 사용 가능 상태여야 저장 가능
                  (newNickname.trim() !== nickname && nickAvailable !== true)
                }
                className="rounded-lg bg-[#5b7c99] px-6 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
              >
                {isNickChecking ? "확인 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              disabled={isPasswordLoading}
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              비밀번호 변경
            </h2>

            <div className="space-y-6">
              {/* 기존 비밀번호 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  기존 비밀번호
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isPasswordLoading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                />
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isPasswordLoading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                />
                {newPassword && (
                  <p
                    className={`mt-1 text-xs ${
                      isPasswordValid ? "text-green-600" : "text-orange-500"
                    }`}
                  >
                    {isPasswordValid
                      ? "안전한 비밀번호입니다."
                      : "영문, 숫자, 특수문자를 포함하여 8자리 이상"}
                  </p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  placeholder="••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPasswordLoading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
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
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={isPasswordLoading}
                className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handlePasswordSave}
                disabled={!isPasswordValid || !isPasswordMatch || isPasswordLoading}
                className="rounded-lg bg-[#5b7c99] px-6 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
              >
                {isPasswordLoading ? "변경 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계정 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmText("");
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              계정 삭제 확인
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                계정을 삭제한다면, 불이익이 
                <br />
                있을 수 있습니다. 그 외에 모든 데이터가 어쩌구
                <br />
                내용이 있습니다.
              </p>
              <p className="text-sm text-gray-700">
                그래도 삭제하시려면,
                <br />
                '계정 삭제' 기입 후 계정 삭제를 눌러주세요.
              </p>
              <input
                type="text"
                placeholder="계정 삭제"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmText("");
                }}
                className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-500 px-6 py-2.5 font-medium text-white hover:bg-red-600"
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
