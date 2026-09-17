import React, { useEffect, useRef, useState, memo } from "react";
import {
  Bot,
  Check,
  Info,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Trash2,
  User,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

const getAiUrl = (endpoint) => {
  const baseUrl = api.defaults.baseURL || "";
  return baseUrl.startsWith("http")
    ? `${baseUrl.replace(/\/$/, "")}${endpoint}`
    : `/api${endpoint}`;
};

const QUICK_PROMPTS = [
  "🥝 What are the health benefits & best timing for kiwi?",
  "🩸 Best low-glycemic fruits that don't spike blood sugar?",
  "💪 What fruits should I pair with post-workout protein?",
  "🌿 Natural anti-inflammatory fruits for joint health?",
  "🥭 What fruits are in season right now in India?"
];

// Clean formatting helper for error messages
function formatErrorMessage(raw) {
  if (!raw) return "Unable to reach Fruitora AI. Please check your connection and try again.";
  const lower = String(raw).toLowerCase();
  if (
    lower.includes("fetch failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("timeout") ||
    lower.includes("network") ||
    lower.includes("und_err")
  ) {
    return "A temporary network timeout occurred while communicating with the AI service. Please verify your connection and tap Retry.";
  }
  return raw;
}

// Memoized custom markdown renderer for maximum streaming performance (zero main-thread stalls)
const FormattedMessage = memo(function FormattedMessage({ text }) {
  if (!text) return null;

  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-3 leading-relaxed text-[15px]">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n");
        const isList = lines.length > 1 && lines.every((l) => /^\s*([*\-•]|\d+\.)\s+/.test(l.trim()) || l.trim() === "");

        if (isList) {
          return (
            <ul key={pIdx} className="list-none space-y-1.5 pl-1 my-2">
              {lines.filter((l) => l.trim()).map((line, lIdx) => {
                const cleaned = line.replace(/^\s*([*\-•]|\d+\.)\s+/, "");
                return (
                  <li key={lIdx} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1F3D1F]" />
                    <span className="flex-1">{renderInline(cleaned)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        if (para.startsWith("### ")) {
          return (
            <h4 key={pIdx} className="font-bold text-[#141814] text-base mt-3 mb-1">
              {renderInline(para.replace(/^###\s+/, ""))}
            </h4>
          );
        }
        if (para.startsWith("## ")) {
          return (
            <h3 key={pIdx} className="font-extrabold text-[#141814] text-lg mt-4 mb-1">
              {renderInline(para.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        return (
          <p key={pIdx} className="text-[#2C332B]">
            {renderInline(para)}
          </p>
        );
      })}
    </div>
  );
});

// Inline formatting: **bold**, *italic*, `code`
function renderInline(str) {
  if (!str) return null;
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-[#141814]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#555E53]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={idx} className="rounded bg-[#EBECE5] px-1.5 py-0.5 text-xs font-mono text-[#1F3D1F]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function ChatAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);

  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const streamTextRef = useRef("");

  // Fast scroll to bottom without forcing expensive layout reflows
  const scrollToBottom = (smooth = false) => {
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      if (smooth) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }
  };

  // Load chat history
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setHistoryLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("fruitora_token");

      if (token && user) {
        try {
          const res = await fetch(getAiUrl("/ai/history"), {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted && Array.isArray(data.messages)) {
              setMessages(data.messages);
            }
          }
        } catch (err) {
          console.warn("Could not fetch remote chat history:", err);
        }
      } else {
        try {
          const cached = sessionStorage.getItem("fruitora_guest_chat");
          if (cached && isMounted) {
            setMessages(JSON.parse(cached));
          }
        } catch (e) {}
      }

      if (isMounted) setHistoryLoading(false);
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Save guest chat to sessionStorage
  useEffect(() => {
    if (!user && messages.length > 0) {
      try {
        sessionStorage.setItem("fruitora_guest_chat", JSON.stringify(messages));
      } catch (e) {}
    }
  }, [messages, user]);

  const clearChat = async () => {
    if (isStreaming) {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
      setIsThinking(false);
    }

    const token = localStorage.getItem("fruitora_token");
    if (token && user) {
      try {
        await fetch(getAiUrl("/ai/history"), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.warn("Could not delete remote chat history", e);
      }
    } else {
      sessionStorage.removeItem("fruitora_guest_chat");
    }

    setMessages([]);
    setErrorMsg("");
    setLastPrompt("");
  };

  const handleSend = async (textToSend) => {
    const promptText = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!promptText || isStreaming) return;

    setLastPrompt(promptText);
    setInput("");
    setErrorMsg("");
    streamTextRef.current = "";

    const userMessage = {
      id: "usr-" + Date.now(),
      role: "user",
      content: promptText,
      createdAt: new Date().toISOString()
    };

    const tempBotMessage = {
      id: "bot-" + Date.now(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage, tempBotMessage]);
    setIsThinking(true);
    setIsStreaming(true);

    setTimeout(() => scrollToBottom(true), 30);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const token = localStorage.getItem("fruitora_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let rafId = null;
    const flushText = () => {
      const text = streamTextRef.current;
      setMessages((prev) => {
        if (!prev.length) return prev;
        const lastIdx = prev.length - 1;
        if (prev[lastIdx].role === "assistant" && prev[lastIdx].content !== text) {
          const next = [...prev];
          next[lastIdx] = { ...next[lastIdx], content: text };
          return next;
        }
        return prev;
      });
      scrollToBottom(false);
    };

    const scheduleFlush = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          flushText();
        });
      }
    };

    try {
      const response = await fetch(getAiUrl("/ai/chat"), {
        method: "POST",
        headers,
        body: JSON.stringify({ message: promptText }),
        signal: abortController.signal
      });

      if (!response.ok) {
        let errText = "Failed to communicate with Fruitora AI.";
        try {
          const errJson = await response.json();
          errText = errJson.error || errJson.message || errText;
        } catch (e) {}
        throw new Error(errText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const jsonStr = trimmed.replace(/^data:\s*/, "");
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === "token") {
              setIsThinking(false);
              streamTextRef.current += data.text;
              scheduleFlush();
            } else if (data.type === "error") {
              setErrorMsg(formatErrorMessage(data.message));
            } else if (data.type === "done") {
              if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
              }
              flushText();
              setIsStreaming(false);
              setIsThinking(false);
            }
          } catch {
            // ignore partial SSE json chunk
          }
        }
      }

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      flushText();
    } catch (err) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (err.name !== "AbortError") {
        console.error("AI Chat error:", err);
        const friendlyMsg = formatErrorMessage(err.message);
        setErrorMsg(friendlyMsg);

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant" && !updated[lastIdx].content) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: "I ran into a temporary connection issue reaching the AI service. Please tap Retry below or check your network."
            };
          }
          return updated;
        });
      }
    } finally {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      setIsStreaming(false);
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[740px] max-h-[82vh] bg-[#FAF9F5] rounded-[2rem] border border-[#E8E6DD] shadow-sm overflow-hidden">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-[#EBE8DF]">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1F3D1F] text-[#E2ECDC] shadow-sm">
            <Sparkles size={22} className="animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#141814]">Fruitora AI Nutritionist</h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#E2ECDC] px-2.5 py-0.5 text-[11px] font-semibold text-[#1F3D1F]">
                <Zap size={11} />
                Ultra-Fast RAG
              </span>
            </div>
            <p className="text-xs text-[#6B7569]">
              {user ? (
                <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                  <Check size={12} />
                  Personalized for {user.name} (profile & health goals active)
                </span>
              ) : (
                <span className="text-[#7C8579]">
                  Guest mode (general fruit nutrition) •{" "}
                  <Link to="/auth/login" className="text-[#1F3D1F] font-medium hover:underline">
                    Sign in to personalize
                  </Link>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              disabled={isStreaming}
              title="Clear conversation history"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7C8579] hover:text-red-700 hover:bg-red-50 transition border border-transparent hover:border-red-200 disabled:opacity-50"
            >
              <Trash2 size={13} />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-5 scroll-smooth"
      >
        {historyLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1F3D1F] border-t-transparent mb-3" />
            <p className="text-sm text-[#7C8579]">Loading your nutrition assistant...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4 max-w-lg mx-auto">
            <div className="h-16 w-16 rounded-3xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center mb-5 shadow-sm">
              <Bot size={34} />
            </div>
            <h3 className="text-xl font-black text-[#141814] mb-2">
              Hello! I'm your Fruitora AI Assistant.
            </h3>
            <p className="text-sm text-[#656E62] leading-relaxed mb-6">
              Ask me anything about fruit nutrition, health benefits, dietary pairing, and recipes.
              {user ? " I incorporate your saved health profile and favorites into every answer!" : ""}
            </p>

            {/* Starter Quick Prompts */}
            <div className="w-full text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-[#868F83] mb-3 text-center">
                Suggested Topics
              </p>
              <div className="flex flex-col gap-2">
                {QUICK_PROMPTS.map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(promptText)}
                    className="text-left text-xs sm:text-sm font-medium text-[#1F3D1F] bg-white hover:bg-[#EBECE5]/80 border border-[#E5E3D8] hover:border-[#CBD3C8] rounded-2xl p-3 sm:px-4 sm:py-3 transition shadow-2xs hover:shadow-sm"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            const isLastBot = !isUser && index === messages.length - 1;

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-[#E2ECDC] text-[#1F3D1F] grid place-items-center mt-1 text-xs shadow-2xs font-bold">
                    <Bot size={17} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-[1.75rem] px-5 py-3.5 shadow-2xs ${
                    isUser
                      ? "bg-[#1F3D1F] text-white rounded-tr-sm font-normal"
                      : "bg-white border border-[#EBE8DF] text-[#141814] rounded-tl-sm"
                  }`}
                >
                  {isUser ? (
                    <p className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div>
                      {msg.content ? (
                        <FormattedMessage text={msg.content} />
                      ) : isThinking && isLastBot ? (
                        <div className="flex items-center gap-2 py-1 text-sm text-[#7C8579]">
                          <span className="inline-block h-2 w-2 rounded-full bg-[#1F3D1F] animate-ping" />
                          <span>Consulting Fruitora's nutrition intelligence...</span>
                        </div>
                      ) : null}

                      {/* Real-time typing cursor */}
                      {isStreaming && isLastBot && msg.content && (
                        <span className="inline-block w-2 h-4 ml-1 bg-[#1F3D1F] animate-pulse rounded-sm align-middle" />
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-8 w-8 shrink-0 rounded-xl bg-[#1F3D1F] text-white grid place-items-center mt-1 text-xs shadow-2xs font-semibold">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Global error banner if present */}
        {errorMsg && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 p-4 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Info size={17} className="shrink-0 text-amber-700 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Connection Notice</p>
                <p className="text-amber-800 mt-0.5">{errorMsg}</p>
              </div>
            </div>
            {lastPrompt && !isStreaming && (
              <button
                onClick={() => handleSend(lastPrompt)}
                className="flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white text-xs font-semibold shadow-xs transition"
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Input & Controls Footer */}
      <div className="p-4 sm:p-5 bg-white border-t border-[#EBE8DF]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder={
              user
                ? "Ask about fruit benefits, pairings, recipes for your health goals..."
                : "Ask about vitamins, sugar levels, pairing, or benefits..."
            }
            className="w-full bg-[#FAF9F5] hover:bg-white focus:bg-white text-[#141814] placeholder:text-[#8C9589] text-sm sm:text-[15px] rounded-full pl-5 pr-28 py-3.5 border border-[#E2E0D5] focus:border-[#1F3D1F] focus:ring-2 focus:ring-[#1F3D1F]/15 outline-none transition shadow-inner"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopStreaming}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
              >
                <Square size={12} fill="currentColor" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-10 w-10 rounded-full bg-[#1F3D1F] hover:bg-[#162E16] text-white disabled:opacity-30 disabled:hover:bg-[#1F3D1F] grid place-items-center transition shadow-sm"
                title="Send message"
              >
                <Send size={16} className="-ml-0.5" />
              </button>
            )}
          </div>
        </form>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#868F83] px-2">
          <span>RAG-powered by Fruitora & Groq Llama 3.3</span>
          <span>For informational nutrition guidance only</span>
        </div>
      </div>
    </div>
  );
}
