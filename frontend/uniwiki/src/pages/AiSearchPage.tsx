// src/pages/AiSearchPage.tsx

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, BookOpen, GraduationCap, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'ai', content: string }>>([]);

  // ✅ 대화 메시지 스크롤 컨테이너 ref
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // ✅ 대화 화면일 때만 Footer 숨김 (html에 클래스 토글)
  useEffect(() => {
    const root = document.documentElement; // <html>
    if (chatHistory.length > 0) {
      root.classList.add("chat-active");
    } else {
      root.classList.remove("chat-active");
    }
    return () => root.classList.remove("chat-active");
  }, [chatHistory.length]);

  // ✅ 새 메시지/로딩 변화 때 자동으로 맨 아래로 스크롤
  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    // 다음 프레임에 스크롤 (콘텐츠 렌더 완료 후)
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [chatHistory, isSearching, result]);

  const exampleQuestions = [
    { category: "학과", icon: "🏫", question: "컴퓨터공학과에서 필수로 들어야 하는 전공과목은?" },
    { category: "강의", icon: "📘", question: "데이터베이스 강의 난이도와 평가 방식이 궁금해" },
    { category: "시설", icon: "🏢", question: "도서관 24시간 열람실 이용 방법 알려줘" },
    { category: "학교", icon: "🏛️", question: "장학금 신청 자격과 절차는 어떻게 되나요?" },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setChatHistory(prev => [...prev, { type: 'user', content: query }]);

    try {
      const res = await fetch(
        `https://k13d104.p.ssafy.io/api/v1/search/rag?question=${encodeURIComponent(query)}`,
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

      setChatHistory(prev => [...prev, { type: 'ai', content: searchResult.answer }]);
      setResult(searchResult);
    } catch (error) {
      console.error("RAG 검색 실패:", error);
      const errorMessage = "죄송합니다. 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setChatHistory(prev => [...prev, { type: 'ai', content: errorMessage }]);
      setResult(null);
    } finally {
      setIsSearching(false);
      setQuery("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleExampleClick = (question: string) => {
    setQuery(question);
  };

  return (
    // ✅ 전체 화면을 컬럼 레이아웃으로: 위(main)=스크롤, 아래(입력창)=고정
    <div className="min-h-dvh bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* 메인 콘텐츠 (대화면일 때 flex-1) */}
      <main className={`mx-auto w-full max-w-4xl px-4 ${chatHistory.length > 0 ? 'flex-1 flex flex-col' : ''}`}>
        {chatHistory.length === 0 ? (
          // ───────────────── 초기 화면 ─────────────────
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-uniwikicolor mb-6 shadow-lg">
                <Sparkles size={36} className="text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">대학 생활, AI에게 물어보세요</h2>
              <p className="text-gray-600 text-lg">학과, 강의, 시설, 학사 일정 등 궁금한 모든 것을 자연어로 질문하세요</p>
            </div>

            {/* 중앙 검색창 */}
            <div className="w-full max-w-3xl mb-12">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
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
            </div>

            {/* 예시 질문 카드 */}
            <div className="w-full max-w-3xl mb-12">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">이런 질문을 해보세요</h3>
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
                        <div className="text-xs font-medium text-gray-500 mb-1">{item.category}</div>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed group-hover:text-uniwikicolor">
                          {item.question}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 특징 소개 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-3">
                  <Library size={24} className="text-uniwikicolor" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">전국 대학 정보</h4>
                <p className="text-sm text-gray-600">여러 대학의 문서를 통합 검색하여 답변합니다</p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-3">
                  <GraduationCap size={24} className="text-uniwikicolor" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">학생 중심 답변</h4>
                <p className="text-sm text-gray-600">학생들이 작성한 실제 경험을 바탕으로 답변합니다</p>
              </div>
              <div className="text-center p-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-3">
                  <BookOpen size={24} className="text-uniwikicolor" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">관련 문서 제공</h4>
                <p className="text-sm text-gray-600">답변과 함께 참고할 수 있는 문서를 제공합니다</p>
              </div>
            </div>
          </div>
        ) : (
          // ───────────────── 대화 화면 ─────────────────
          <>
            {/* ✅ 메시지 영역: 고정 높이 스크롤 */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto pt-8 pb-6 space-y-6"
            >
              {chatHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {chat.type === 'ai' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-uniwikicolor flex items-center justify-center">
                      <Sparkles size={20} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                      chat.type === 'user'
                        ? 'bg-uniwikicolor text-white'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">
                      {chat.content}
                    </p>
                  </div>
                  {chat.type === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                  )}
                </div>
              ))}

              {/* 로딩 중 */}
              {isSearching && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-uniwikicolor flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-uniwikicolor animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-uniwikicolor animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-uniwikicolor animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}

              {/* 관련 문서 */}
              {result && result.relatedDocs.length > 0 && (
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
                            `/univ/${encodeURIComponent(doc.university)}/docs/${encodeURIComponent(doc.title)}`
                          )
                        }
                        className="w-full text-left bg-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-200 hover:border-uniwikicolor"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{doc.title}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex-shrink-0">
                            {doc.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{doc.university}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{doc.snippet}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 하단 고정 입력창 - 대화 시작 후에만 표시 */}
      {chatHistory.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 bg-white backdrop-blur-md border-t border-gray-200 z-50">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <div className="relative flex items-center gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="유니위키에 대해 무엇이든 물어보세요..."
                disabled={isSearching}
                className="flex-1 rounded-full border-2 border-gray-300 bg-white py-3 px-6 pr-14 text-sm outline-none focus:border-uniwikicolor focus:ring-2 focus:ring-uniwikicolor/20 disabled:bg-gray-50 transition-all"
              />
              <button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-uniwikicolor p-2.5 text-white hover:bg-uniwikicolor_hover disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              AI가 제공하는 정보는 참고용이며, 공식 문서를 함께 확인하시기 바랍니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
