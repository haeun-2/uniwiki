import React, { useMemo, useState, useCallback } from "react";
import { Outlet, NavLink, ScrollRestoration, useLocation } from "react-router-dom";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

type TocItem = { id: string; label: string };

type MenuNode = {
  label: string;
  path: string;
  children?: MenuNode[];
};

const MENU: MenuNode[] = [
  {
    label: "메뉴 바",
    path: "/tutorial/menu_bar",
    children: [
      { label: "AI 검색 페이지", path: "/tutorial/menu_bar/ai_search" },
      { label: "내 정보", path: "/tutorial/menu_bar/my_page" },
    ],
  }, 
  {
    label: "전체 메인 페이지",
    path: "/tutorial/main",
    children: [
      {
        label: "학교 메인 페이지",
        path: "/tutorial/main/univ_main",
        children: [
          {
            label: "문서 열람 페이지",
            path: "/tutorial/main/univ_main/document",
            children: [
              {
                label: "토론 페이지",
                path: "/tutorial/main/univ_main/document/discussion",
                children: [
                  {
                    label: "진행 중인 토론",
                    path: "/tutorial/main/univ_main/document/discussion/discussion_now",
                  },
                ],
              },
            ],
          },
          {
            label: "문서 역사 페이지",
            path: "/tutorial/main/univ_main/document/history",
          },
        ],
      },
    ],
  }
];

export default function TutorialLayout() {
  const location = useLocation();
  const [toc, setToc] = useState<TocItem[]>([])

  // 현재 경로 기준으로 트리 활성/확장 판단
  const isActivePath = useCallback((current: string, target: string) => {
    if (current === target) return true;
    const normTarget = target.endsWith("/") ? target.slice(0, -1) : target;
    const normCurrent = current.endsWith("/") ? current.slice(0, -1) : current;
    return normCurrent.startsWith(normTarget + "/");
  }, []);

  const expandedPaths = useMemo(() => {
    const result = new Set<string>();
    const visit = (node: MenuNode, parents: string[]) => {
      if (isActivePath(location.pathname, node.path)) {
        parents.forEach(p => result.add(p));
        result.add(node.path);
      }
      node.children?.forEach(child => visit(child, [...parents, node.path]));
    };

    MENU.forEach(n => visit(n, []));
    return result;
  }, [location.pathname, isActivePath]);

  // 현재 경로와 가장 잘 맞는(가장 깊은) MenuNode의 path
  const activeNodePath = useMemo(() => {
    let best: string | null = null;

    const visit = (node: MenuNode) => {
      if (isActivePath(location.pathname, node.path)) {
        if (!best || node.path.length > best.length) {
          best = node.path;
        }
      }
      node.children?.forEach(visit);
    };

    MENU.forEach(visit);
    return best;
  }, [location.pathname, isActivePath]);

  const handleAnchor = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex flex-1 w-full max-w-6xl mx-auto px-4 py-8 gap-8">
        {/* 좌측 트리 메뉴 + 목차 */}
        <aside className="w-64 flex-shrink-0 h-max sticky top-8 self-start">
          <nav
            aria-label="튜토리얼 메뉴"
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <ul role="tree" className="space-y-1">
              {MENU.map((node) => (
                <TreeItem
                  key={node.path}
                  node={node}
                  level={0}
                  expandedPaths={expandedPaths}
                  isActivePath={(p) => isActivePath(location.pathname, p)}
                  activeNodePath={activeNodePath}
                  toc={toc}
                  onTocClick={handleAnchor}
                />
              ))}
            </ul>
          </nav>
        </aside>

        {/* 우측 본문 */}
        <section className="flex-1 min-w-0">
          <Outlet context={{ setToc }} />
        </section>
      </main>

      <Footer />
      <ScrollRestoration getKey={(location) => location.pathname} />
    </div>
  );
}

function TreeItem({
  node,
  level,
  expandedPaths,
  isActivePath,
  activeNodePath,
  toc,
  onTocClick,
}: {
  node: MenuNode;
  level: number;
  expandedPaths: Set<string>;
  isActivePath: (path: string) => boolean;
  activeNodePath: string | null;
  toc: TocItem[];
  onTocClick: (e: React.MouseEvent, id: string) => void;
}) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const expanded = expandedPaths.has(node.path);
  const paddingLeft = level * 8;
  const isSelfActiveNode = activeNodePath === node.path;

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className="relative"
        style={{ paddingLeft }}
      >
        <NavLink
          to={node.path}
          className={({ isActive }) =>
            [
              "block rounded-2xl ps-2 py-2 text-md transition",
              (isActive || isActivePath(node.path))
                ? "text-uniwikicolor"
                : "text-gray-700 hover:text-uniwikicolor hover:bg-gray-50",
            ].join(" ")
          }
        >
          {node.label}
        </NavLink>
      </div>

      {/* 현재 페이지에 해당하는 MenuNode 바로 아래에 목차 표시 */}
      {isSelfActiveNode && toc.length > 0 && (
        <div
          className="ps-2 py-1 border-l border-gray-200"
          style={{ marginLeft: paddingLeft + 20 }}  
        >
          <ul className="space-y-1">
            {toc.map((t) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  onClick={(e) => onTocClick(e, t.id)}
                  className="block text-sm ps-2 py-1 rounded-2xl text-gray-700 hover:text-uniwikicolor hover:bg-gray-50 hover:underline"
                >
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasChildren && expanded && (
        <ul className="mt-1 space-y-1">
          {node.children!.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              expandedPaths={expandedPaths}
              isActivePath={isActivePath}
              activeNodePath={activeNodePath}
              toc={toc}
              onTocClick={onTocClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
