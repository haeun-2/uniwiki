import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

// 시간 표시 유틸
const timeAgo = (iso: string) => {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "방금 전";
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    const day = Math.floor(h / 24);
    if (day < 7) return `${day}일 전`;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
};

interface RecentEditItem {
  documentTitle: string;
  updatedAt: string;
}

type Props = {
  univName?: string;
};

export default function RecentEdit({ univName: propUnivName }: Props) {
  const { univName: paramUnivName } = useParams();
  const location = useLocation();

  // 1) 우선 location.state.universityId 사용
  const stateUnivId = useMemo(() => {
    const s = (location as any)?.state;
    return typeof s?.universityId === "number" ? s.universityId : undefined;
  }, [location]);

  // 2) 이름 후보: prop → params (둘 다 없으면 빈 문자열)
  const effectiveUnivName = useMemo(() => {
    return propUnivName ?? (paramUnivName ? decodeURIComponent(paramUnivName) : "");
  }, [propUnivName, paramUnivName]);

  const [universityId, setUniversityId] = useState<number | undefined>(stateUnivId);
  const [recentEdits, setRecentEdits] = useState<RecentEditItem[]>([]);
  const [loading, setLoading] = useState(false);

  // universityId가 없다면 이름으로 id resolve
  useEffect(() => {
    let mounted = true;
    if (stateUnivId) {
      setUniversityId(stateUnivId);
      return;
    }
    if (!effectiveUnivName) return;

    (async () => {
      try {
        setLoading(true);
        // 이름 → id 매핑(전체 목록 조회 후 정확 일치)
        const res = await fetch("https://k13d104.p.ssafy.io/api/v1/universities", {
          headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list: Array<{ universityId: number; universityName: string }> = await res.json();
        const found = list.find(u => u.universityName === effectiveUnivName);
        if (mounted) setUniversityId(found?.universityId);
      } catch (e) {
        console.error("대학 ID 조회 실패:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [stateUnivId, effectiveUnivName]);

  // 최근 수정 문서 조회
  useEffect(() => {
    let mounted = true;
    if (!universityId) return;

    (async () => {
      try {
        setLoading(true);
        const token =
          sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken") || "";

        const res = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/documents/recent?universityId=${universityId}`,
          {
            method: "GET",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              Accept: "*/*",
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RecentEditItem[] = await res.json();
        if (mounted) setRecentEdits(data ?? []);
      } catch (e) {
        console.error("최근 수정 문서 조회 실패:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [universityId]);

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-800">최근 수정된 문서</h2>

      {loading && <p className="text-xs text-gray-500">로딩 중…</p>}

      <ul className="space-y-2 text-sm text-gray-700">
        {recentEdits.slice(0, 10).map((item, idx) => (
          <li key={idx}>
            <Link
              to={`/univ/${encodeURIComponent(effectiveUnivName)}/docs/${encodeURIComponent(
                item.documentTitle
              )}`}
              className="group truncate flex justify-between"
              title={item.documentTitle}
            >
              <span className="group-hover:underline">{item.documentTitle}</span>
              <span className="text-xs text-gray-400">{timeAgo(item.updatedAt)}</span>
            </Link>
          </li>
        ))}
        {!loading && recentEdits.length === 0 && (
          <li className="text-xs text-gray-400">표시할 항목이 없습니다.</li>
        )}
      </ul>
    </aside>
  );
}
