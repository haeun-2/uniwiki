// src/pages/ProfilePage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("김코드");
  const [email] = useState("psh406014@gmail.com");
  const [role] = useState("User");
  const [isEditing, setIsEditing] = useState(false);
  
  // 닉네임 변경 모달 상태
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  // 비밀번호 변경 모달 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // 계정 삭제 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleSave = () => {
    console.log("Save profile:", { nickname });
    alert("프로필이 저장되었습니다.");
    setIsEditing(false);
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

  // 닉네임 변경 저장
  const handleNicknameSave = () => {
    if (!newNickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    console.log("Nickname changed:", newNickname);
    setNickname(newNickname);
    alert("닉네임이 변경되었습니다.");
    setIsNicknameModalOpen(false);
    setNewNickname("");
  };

  // 비밀번호 변경 저장 (API 연동)
  const handlePasswordSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 최소 요구사항만 체크
    if (newPassword.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setIsPasswordLoading(true);
    
    try {
      const response = await fetch("http://k13d104.p.ssafy.io/api/v1/users/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword,  // ✅ 추가!
        }),
      });

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
        alert(errorData.message || "비밀번호 형식이 올바르지 않습니다.\n영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요.");
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

  const isNicknameValid = newNickname.length >= 2;
  // 모든 특수문자 허용
  const isPasswordValid = 
    newPassword.length >= 8 && 
    /[A-Za-z]/.test(newPassword) && 
    /\d/.test(newPassword) && 
    /[^A-Za-z\d]/.test(newPassword);
  const isPasswordMatch = newPassword === confirmPassword && confirmPassword !== "";

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-12 text-center text-3xl font-semibold text-gray-900">내 정보</h1>

        <div className="space-y-8">
          {/* 닉네임 */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <label className="text-lg font-medium text-gray-900">닉네임</label>
            <div className="flex items-center gap-4">
              <span className="text-gray-900">{nickname}</span>
              {isEditing && (
                <button 
                  onClick={() => setIsNicknameModalOpen(true)}
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
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 underline"
              >
                비밀번호 변경
              </button>
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
                  className="rounded-lg bg-[#5b7c99] px-8 py-2.5 font-medium text-white hover:bg-[#4a6578]"
                >
                  저장
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

            <h2 className="mb-6 text-xl font-semibold text-gray-900">닉네임 변경</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="2020202"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {newNickname && (
                <p className={`text-xs ${isNicknameValid ? "text-green-600" : "text-red-600"}`}>
                  {isNicknameValid ? "사용 가능한 닉네임입니다." : "닉네임은 2자 이상이어야 합니다."}
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
                disabled={!isNicknameValid}
                className="rounded-lg bg-[#5b7c99] px-6 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
              >
                저장
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

            <h2 className="mb-6 text-xl font-semibold text-gray-900">비밀번호 변경</h2>

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
                  <p className={`mt-1 text-xs ${isPasswordValid ? "text-green-600" : "text-orange-500"}`}>
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
                  <p className={`mt-1 text-xs ${isPasswordMatch ? "text-green-600" : "text-red-500"}`}>
                    {isPasswordMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
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

            <h2 className="mb-6 text-xl font-semibold text-gray-900">계정 삭제 확인</h2>

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