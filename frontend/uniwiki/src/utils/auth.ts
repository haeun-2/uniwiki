// src/utils/auth.ts
export type Role = "ADMIN" | "USER" | "";

const AUTH_KEYS = [
  "accessToken",
  "refreshToken",
  "nickName",
  "nickname",
  "userNickname",
  "username",
  "name",
  "role",
  "universityId",
  "userId",
  "userID",
  "memberId",
  "id",
] as const;

const AUTH_OBJ_KEYS = ["user", "profile", "me"] as const;

// accessToken 가져오기
export function getAccessToken(): string {
  try {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken") ||
      ""
    );
  } catch {
    return "";
  }
}

// Authorization 헤더 생성
export function authHeaders(): Record<string, string> {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// 토큰/유저 정보 읽기 (필요하면 사용)
export function getStoredAuth(): { isLoggedIn: boolean; role: Role } {
  try {
    const accessToken = getAccessToken();
    const role = (
      localStorage.getItem("role") ||
      sessionStorage.getItem("role") ||
      ""
    ).toUpperCase() as Role;

    return {
      isLoggedIn: !!accessToken,
      role: role || "",
    };
  } catch {
    return { isLoggedIn: false, role: "" };
  }
}

export function isAdmin() {
  return getStoredAuth().role === "ADMIN";
}

// ✅ 토큰 만료/로그아웃 시 호출: 스토리지 정리 + 상태 변경 이벤트
export function clearAuthStorage() {
  try {
    AUTH_KEYS.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    AUTH_OBJ_KEYS.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  } catch {
    // ignore
  }

  try {
    // 헤더 등에서 로그인 상태 다시 읽게끔
    window.dispatchEvent(new Event("uniwiki:auth-changed"));
  } catch {
    // ignore
  }
}
