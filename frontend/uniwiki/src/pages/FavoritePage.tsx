// src/pages/FavoritePage.tsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/** 문서 즐겨찾기 */
interface DocumentFavorite {
  documentId: number;
  documentTitle: string;
  universityName: string;
  documentUpdateAt: string; // ISO
}

/** 대학 즐겨찾기 */
interface UniversityFavorite {
  universityId: number;
  logoUrl: string;
  universityName: string;
}

type ViewMode = "documents" | "universities";

export default function FavoritePage() {
  const location = useLocation() as { state? : {tab?: ViewMode} };
  const initialView: ViewMode = location.state?.tab ?? "documents";
  const navigate = useNavigate();

  // 탭 상태
  const [view, setView] = useState<ViewMode>(initialView);

  // 문서 즐겨찾기
  const [docFavs, setDocFavs] = useState<DocumentFavorite[]>([]);
  const [docLoading, setDocLoading] = useState(true);

  // 학교 즐겨찾기
  const [univFavs, setUnivFavs] = useState<UniversityFavorite[]>([]);
  const [univLoading, setUnivLoading] = useState(false); // 최초엔 문서 탭이 기본

  // 공통: 인증 체크
  const ensureAuthed = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return null;
    }
    return accessToken;
  };

  // 날짜 포맷 (예: 2025-11-04T06:26:38.850Z → 2025-11-04 15:26)
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  // 문서 즐겨찾기 불러오기
  const fetchDocumentFavorites = async () => {
    const token = ensureAuthed();
    if (!token) return;

    setDocLoading(true);
    try {
      const resp = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/users/me/favorites/documents",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (resp.ok) {
        const data: DocumentFavorite[] = await resp.json();
        setDocFavs(data ?? []);
      } else if (resp.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        alert("즐겨찾기한 문서를 불러오지 못했습니다.");
      }
    } catch (e) {
      console.error("Fetch doc favorites error:", e);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setDocLoading(false);
    }
  };

  // 학교 즐겨찾기 불러오기
  const fetchUniversityFavorites = async () => {
    const token = ensureAuthed();
    if (!token) return;

    setUnivLoading(true);
    try {
      const resp = await fetch(
        "https://k13d104.p.ssafy.io/api/v1/users/me/favorites/universities",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (resp.ok) {
        const data: UniversityFavorite[] = await resp.json();
        setUnivFavs(data ?? []);
      } else if (resp.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        alert("즐겨찾기한 학교를 불러오지 못했습니다.");
      }
    } catch (e) {
      console.error("Fetch univ favorites error:", e);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setUnivLoading(false);
    }
  };

  // 최초: 문서 탭 로딩
  useEffect(() => {
    fetchDocumentFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 탭 전환 시 필요한 데이터만 로딩(이미 로딩된 건 재요청 X)
  useEffect(() => {
    if (view === "universities" && univFavs.length === 0 && !univLoading) {
      fetchUniversityFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // 문서 즐겨찾기 삭제
  const handleDeleteDocument = async (documentId: number) => {
    if (!window.confirm("즐겨찾기를 삭제하시겠습니까?")) return;

    const token = ensureAuthed();
    if (!token) return;

    try {
      const resp = await fetch(
        `https://k13d104.p.ssafy.io/api/v1/users/me/favorites/documents/${documentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (resp.ok) {
        setDocFavs((list) => list.filter((f) => f.documentId !== documentId));
        alert("즐겨찾기가 삭제되었습니다.");
      } else if (resp.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        alert("즐겨찾기 삭제에 실패했습니다.");
      }
    } catch (e) {
      console.error("Delete doc favorite error:", e);
      alert("서버와의 연결에 실패했습니다.");
    }
  };

  // 문서 이동
 const goDocument = (univName: string, title: string) =>
    navigate(
      `/univ/${encodeURIComponent(univName)}/docs/${encodeURIComponent(title)}`
    );

  // 학교 이동(라우팅 규칙에 맞게: /univ/:univName 사용 중이라 가정)
   const goUniversity = (u: UniversityFavorite) =>
   navigate(`/univ/${encodeURIComponent(u.universityName)}`, {
     state: { universityId: u.universityId, isFavorite: true } // ★ 선지식 전달
   });

  // 로딩 상태
  const isLoading =
    view === "documents" ? docLoading : univLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold text-gray-900">즐겨찾기</h1>

      {/* 탭 토글 */}
      <div className="mb-6 inline-flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "documents"
              ? "bg-uniwikicolor text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => setView("documents")}
        >
          문서
        </button>
        <div className="w-px bg-gray-300" />
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === "universities"
              ? "bg-uniwikicolor text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          onClick={() => setView("universities")}
        >
          학교
        </button>
      </div>

      {view === "documents" ? (
        <>
          {/* 헤더 */}
          <div className="mb-3 grid grid-cols-12 gap-6 border-b-2 border-gray-400 pb-3">
            <div className="col-span-3 text-base font-medium text-gray-900">
              문서명
            </div>
            <div className="col-span-3 text-base font-medium text-gray-900">
              학교명
            </div>
            <div className="col-span-4 text-base font-medium text-gray-900">
              문서 수정 시각
            </div>
            <div className="col-span-2" />
          </div>

          {/* 리스트 */}
          <div className="space-y-0">
            {docFavs.map((f) => (
              <div
                key={f.documentId}
                className="grid grid-cols-12 gap-6 border-b border-gray-200 py-4"
              >
                <div className="col-span-3">
                  <button
onClick={() => goDocument(f.universityName, f.documentTitle)}
className="text-left text-md text-uniwikicolor hover:underline cursor-pointer"

                  >
                    {f.documentTitle}
                  </button>
                </div>
                <div className="col-span-3">
                  <span className="text-sm">
                    {f.universityName}
                  </span>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-gray-600">
                    {formatDate(f.documentUpdateAt)}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <span
                    onClick={() => handleDeleteDocument(f.documentId)}
                    className="text-red-500 hover:underline cursor-pointer"
                  >
                    삭제
                  </span>
                </div>
              </div>
            ))}
          </div>

          {docFavs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              즐겨찾기한 문서가 없습니다.
            </div>
          )}
        </>
      ) : (
        <>
          {/* 학교 헤더 */}
          <div className="mb-3 grid grid-cols-12 gap-6 border-b-2 border-gray-400 pb-3">
            <div className="col-span-2 text-base font-medium text-gray-900">
              로고
            </div>
            <div className="col-span-10 text-base font-medium text-gray-900">
              학교명
            </div>
          </div>

          {/* 학교 리스트 */}
          <div className="space-y-0">
            {univFavs.map((u) => (
              <div
                key={u.universityId}
                className="grid grid-cols-12 gap-6 border-b border-gray-200 py-4 items-center"
              >
                <div className="col-span-2">
                  {u.logoUrl ? (
                    <img
                      src={u.logoUrl}
                      alt={`${u.universityName} 로고`}
                      onClick={() => goUniversity(u)}
                      className="h-10 w-auto object-contain cursor-pointer"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100" />
                  )}
                </div>
                <div className="col-span-10">
                  <button
                    onClick={() =>goUniversity(u)}
                    className="text-left text-sm text-uniwikicolor hover:underline cursor-pointer"
                  >
                    {u.universityName}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {univFavs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              즐겨찾기한 학교가 없습니다.
            </div>
          )}
        </>
      )}
    </div>
  );
}
