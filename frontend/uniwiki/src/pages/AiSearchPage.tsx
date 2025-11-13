// src/pages/AiSearchPage.tsx

import { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  BookOpen,
  GraduationCap,
  Library,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SearchResult {
  answer: string;
  relatedDocs: Array<{
    title: string;
    university: string;
    category: string;
    snippet: string;
  }>;
}

export default function AiSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  // 이 페이지가 "뒤로가기"로 돌아왔을 때만 한번 복원하기 위한 플래그
  const [hydrated, setHydrated] = useState(false);

  // 🔹 히스토리의 location.state에 저장해둔 검색 상태 복원
  useEffect(() => {
    if (hydrated) return;

    const state = location.state as any;
    const aiState = state?.aiSearch;
    if (aiState) {
      setQuery(aiState.query ?? "");
      setLastQuestion(aiState.lastQuestion ?? "");
      setResult(aiState.result ?? null);
    }

    setHydrated(true);
  }, [location.state, hydrated]);

  const exampleQuestions = [
    {
      category: "학과",
      icon: "🏫",
      question: "컴퓨터공학과에서 필수로 들어야 하는 전공과목은?",
    },
    {
      category: "강의",
      icon: "📘",
      question: "데이터베이스 강의 난이도와 평가 방식이 궁금해",
    },
    {
      category: "시설",
      icon: "🏢",
      question: "도서관 24시간 열람실 이용 방법 알려줘",
    },
    {
      category: "학교",
      icon: "🏛️",
      question: "장학금 신청 자격과 절차는 어떻게 되나요?",
    },
  ];

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setLastQuestion(trimmed);

    try {
      const res = await fetch(
        `https://k13d104.p.ssafy.io/api/v1/search/rag?question=${encodeURIComponent(
          trimmed
        )}`,
        { method: "GET", headers: { Accept: "*/*" } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const searchResult: SearchResult = {
        answer: data.answer,
        relatedDocs: (data.sources || []).map((doc: any) => ({
          title: doc.title,
          university: doc.universityName,
          category: doc.category || "기타",
          snippet: doc.preview,
        })),
      };

      setResult(searchResult);

      // 🔹 현재 히스토리 엔트리에 검색 상태 저장 (뒤로가기 복원용)
      navigate("/ai-search", {
        replace: true,
        state: {
          aiSearch: {
            query: trimmed,
            lastQuestion: trimmed,
            result: searchResult,
          },
        },
      });
    } catch (error) {
      console.error("RAG 검색 실패:", error);
      const fallback: SearchResult = {
        answer:
          "죄송합니다. 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        relatedDocs: [],
      };
      setResult(fallback);

      // 에러인 경우도 동일하게 상태 저장
      navigate("/ai-search", {
        replace: true,
        state: {
          aiSearch: {
            query: trimmed,
            lastQuestion: trimmed,
            result: fallback,
          },
        },
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleExampleClick = (q: string) => {
    setQuery(q);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        {/* 헤더 영역 */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-uniwikicolor mb-6 shadow-lg">
            <Sparkles size={36} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            대학 생활, AI에게 물어보세요
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            학과, 강의, 시설, 학사 일정 등 궁금한 모든 것을 자연어로 질문하세요
          </p>
        </div>

        {/* 검색창 */}
        <section className="w-full max-w-3xl mx-auto mb-10">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="무엇이든 물어보세요"
              disabled={isSearching}
              className="w-full rounded-full border-2 border-gray-300 bg-white py-4 px-6 pr-14 text-base shadow-sm outline-none focus:border-uniwikicolor focus:ring-2 focus:ring-uniwikicolor/20 disabled:bg-gray-50 transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-uniwikicolor p-2.5 text-white hover:bg-uniwikicolor_hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} />
            </button>
          </div>

          {isSearching && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-uniwikicolor animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-uniwikicolor animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-uniwikicolor animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </section>

        {/* 예시 질문 카드 (결과 없을 때만) */}
        {!result && (
          <section className="w-full max-w-3xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={20} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                이런 질문을 해보세요
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQuestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(item.question)}
                  className="group text-left rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-uniwikicolor"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        {item.category}
                      </div>
                      <p className="text-sm text-gray-800 font-medium leading-relaxed group-hover:text-uniwikicolor">
                        {item.question}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* AI 결과 영역 */}
        {result && (
          <section className="w-full max-w-3xl mx-auto space-y-6 mb-14">
           

            {/* AI 요약 답변 */}
            <div className="rounded-2xl bg-white border border-uniwikicolor/40 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-uniwikicolor flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  AI 요약 답변
                </h3>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </p>
            </div>

            {/* 참고 문서 */}
            {result.relatedDocs.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-uniwikicolor" />
                  참고할 만한 문서
                </h3>
                <div className="space-y-3">
                  {result.relatedDocs.map((doc, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        navigate(
                          `/univ/${encodeURIComponent(
                            doc.university
                          )}/docs/${encodeURIComponent(doc.title)}`,
                          { state: { from: "ai-search" } }
                        )
                      }
                      className="w-full text-left bg-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-200 hover:border-uniwikicolor"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {doc.title}
                        </h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex-shrink-0">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {doc.university}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {doc.snippet}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 특징 소개 (맨 아래, 결과 없을 때만) */}
        {!result && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mt-4">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-3">
                <Library size={24} className="text-uniwikicolor" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                전국 대학 정보
              </h4>
              <p className="text-sm text-gray-600">
                여러 대학의 문서를 통합 검색하여 답변합니다
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-3">
                <GraduationCap size={24} className="text-uniwikicolor" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                학생 중심 답변
              </h4>
              <p className="text-sm text-gray-600">
                학생들이 작성한 실제 경험을 바탕으로 답변합니다
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-3">
                <BookOpen size={24} className="text-uniwikicolor" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                관련 문서 제공
              </h4>
              <p className="text-sm text-gray-600">
                답변과 함께 참고할 수 있는 문서를 제공합니다
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
