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

/**
 * Authorization 헤더 생성 + 추가 헤더 병합
 * - extra가 있으면 여기에 Authorization을 얹어서 반환
 */
export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  const base: Record<string, string> = {};

  if (token) {
    base["Authorization"] = `Bearer ${token}`;
  }

  if (!extra) {
    return base;
  }

  // Headers 객체인 경우
  if (extra instanceof Headers) {
    extra.forEach((v, k) => {
      base[k] = v as string;
    });
    return base;
  }

  // [key, value][] 배열인 경우
  if (Array.isArray(extra)) {
    for (const [k, v] of extra) {
      base[k] = v as string;
    }
    return base;
  }

  // 일반 객체인 경우
  return { ...base, ...(extra as Record<string, string>) };
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

/**
 * 공용 fetch 도우미
 * - Authorization 헤더 자동 부착
 * - init.headers와 병합
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const mergedHeaders = authHeaders(init.headers as HeadersInit | undefined);

  return fetch(input, {
    ...init,
    headers: mergedHeaders,
  });
}
