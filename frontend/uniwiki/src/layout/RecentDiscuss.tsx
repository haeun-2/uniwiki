import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";

type Props = {
  univName?: string;
};

type UniversityBrief = { universityId: number; universityName: string };

interface RecentDiscussion {
  discussionId: number;
  discussionTitle: string;
  documentId: number;
  documentTitle: string;
}



export default function RecentDiscuss({ univName: propUnivName }: Props) {
  const { univName: paramUnivName } = useParams();
  const location = useLocation();

  const stateUnivId = useMemo(() => {
    const s = (location as any)?.state;
    return typeof s?.universityId === "number" ? s.universityId : undefined;
  }, [location]);

  const effectiveUnivName = useMemo(() => {
    return propUnivName ?? (paramUnivName ? decodeURIComponent(paramUnivName) : "");
  }, [propUnivName, paramUnivName]);

  const [universityId, setUniversityId] = useState<number | undefined>(stateUnivId);
  const [items, setItems] = useState<RecentDiscussion[]>([]);
  const [loading, setLoading] = useState(false);

  // universityId 없으면 이름으로 resolve
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
        const res = await fetch("https://k13d104.p.ssafy.io/api/v1/universities", {
          headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list: UniversityBrief[] = await res.json();
        const found = list.find((u) => u.universityName === effectiveUnivName);
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

  // 최근 토론 목록 조회 (엔드포인트 확정 후 교체)
  useEffect(() => {
    let mounted = true;
    if (!universityId) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/discussions/recent?university=${universityId}`,
          { headers: { accept: "*/*" } }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: RecentDiscussion[] = await res.json();
        if (mounted) setItems(data ?? []);
      } catch (e) {
        console.error("최근 토론 조회 실패:", e);
        if (mounted) setItems([]);
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
      <h2 className="mb-4 text-sm font-semibold text-gray-800">최근 토론</h2>

      {loading && <p className="text-xs text-gray-500">로딩 중…</p>}

      <ul className="space-y-2 text-sm text-gray-700">
        {items.slice(0, 10).map((d) => (
          <li key={d.discussionId} className="flex flex-col">
            <Link
              className="truncate flex justify-between hover:underline"
              to={`/univ/${encodeURIComponent(effectiveUnivName)}/docs/${encodeURIComponent(d.documentTitle)}/discussions/${d.discussionId}`}
            >
              <span>{d.discussionTitle}</span>
              <span className="text-xs text-gray-400">{d.documentTitle}</span>
            </Link>
          </li>
        ))}
        {!loading && items.length === 0 && (
          <li className="text-xs text-gray-400">표시할 항목이 없습니다.</li>
        )}
      </ul>
    </aside>
  );
}
