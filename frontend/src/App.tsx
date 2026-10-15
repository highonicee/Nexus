
import { useEffect, useRef, useState } from "react";
import "./App.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatResponse = {
  reply: string;
  conversation_id: string;
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getConversationId(): string {
  const key = "nexus-conversation-id";

  try {
    let id = sessionStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }

    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function formatMessage(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

function ProviderCards({ content }: { content: string }) {
  const rows = content
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
    )
    .filter(
      (cells) =>
        cells.length > 1 &&
        !cells.every((cell) => /^:?-{2,}:?$/.test(cell))
    );

  const headers = rows[0] ?? [];

  const providerRows = rows.slice(1).filter((row) => {
    const firstCell = row[0]?.toLowerCase() ?? "";
    return firstCell && !firstCell.includes("provider");
  });

  if (
    !headers.some((header) => /provider/i.test(header)) ||
    providerRows.length === 0
  ) {
    return null;
  }

  const indexOf = (pattern: RegExp) =>
    headers.findIndex((header) => pattern.test(header));

  const nameIndex = indexOf(/provider/i);
  const priceIndex = indexOf(/price|budget|cost/i);
  const serviceIndex = indexOf(/service/i);
  const cityIndex = indexOf(/city|location/i);
  const specialtyIndex = indexOf(/specialt|expertise/i);
  const ratingIndex = indexOf(/rating/i);

  return (
    <div className="provider-list">
      {providerRows.map((row, index) => (
        <article
          className="provider-card"
          key={`${row[0]}-${index}`}
        >
          <div className="provider-card-top">
            <div className="provider-monogram">
              {(row[nameIndex] ?? "N").charAt(0).toUpperCase()}
            </div>

            <div className="provider-heading">
              <h3>{row[nameIndex] ?? "Provider"}</h3>

              <p>
                {[row[serviceIndex], row[cityIndex]]
                  .filter(Boolean)
                  .join(" · ") || "Matching provider"}
              </p>
            </div>
          </div>

          {specialtyIndex >= 0 && (
            <p className="provider-specialties">
              {row[specialtyIndex]}
            </p>
          )}

          <div className="provider-card-bottom">
            {priceIndex >= 0 && (
              <div>
                <span className="field-label">PRICE</span>
                <strong>{row[priceIndex]}</strong>
              </div>
            )}

            {ratingIndex >= 0 && (
              <div className="rating">
                <span className="field-label">RATING</span>
                <strong>{row[ratingIndex]}</strong>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm Nexus. Tell me what service you're looking for, where you need it, and your budget. I'll help you find a match.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conversationId = useRef(getConversationId());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastFailedMessage = useRef("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  async function sendMessage(text = input) {
    const message = text.trim();

    if (!message || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: message },
    ]);

    setInput("");
    setError("");
    setLoading(true);
    lastFailedMessage.current = message;

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId.current,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Request failed (${response.status}). Please try again.`
        );
      }

      const data: ChatResponse = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply || "I couldn't generate a reply.",
        },
      ]);

      lastFailedMessage.current = "";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't connect to Nexus. Check that your backend is running."
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function startNewChat() {
    const newId = crypto.randomUUID();
    conversationId.current = newId;

    try {
      sessionStorage.setItem("nexus-conversation-id", newId);
    } catch {
      // Continue with the in-memory conversation ID.
    }

    setMessages([
      {
        role: "assistant",
        content:
          "Let's start fresh. What service do you need, in which city, and what's your budget?",
      },
    ]);

    setError("");
    setInput("");
    lastFailedMessage.current = "";
    inputRef.current?.focus();
  }

  const suggestions = [
    {
      label: "Wedding photographer",
      message:
        "Find a wedding photographer in Jaipur under 50000 rupees.",
    },
    {
      label: "Portrait photography",
      message:
        "Find a portrait photographer in Jaipur under 30000 rupees.",
    },
    {
      label: "Explore services",
      message:
        "What service providers can you help me find?",
    },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Nexus home">
          <span className="brand-mark" aria-hidden="true">
            <svg
              viewBox="0 0 40 40"
              width="40"
              height="40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1"
                y="1"
                width="38"
                height="38"
                rx="13"
                fill="#702D3C"
              />

              <path
                d="M11 27V13H15L25 23V13H29V27H25L15 17V27H11Z"
                fill="#FFF8ED"
              />

              <circle
                cx="30"
                cy="10"
                r="3"
                fill="#C9A66B"
              />
            </svg>
          </span>

          <span>Nexus</span>
        </a>

        <div className="topbar-right">
          <span className="status-dot" />

          <span className="status-label">
            YOUR SERVICE ASSISTANT
          </span>

          <button
            className="new-chat-button"
            onClick={startNewChat}
            type="button"
          >
            <span aria-hidden="true">＋</span> New chat
          </button>
        </div>
      </header>

      <main className="chat-layout">
        <section className="intro">
          <p className="eyebrow">
            LESS SEARCHING, BETTER MATCHING
          </p>

          <h1>
            Good things
            <br />
            <span>start here.</span>
          </h1>

          <p className="intro-copy">
            Tell us what you need. We'll help you find the right fit.
          </p>
        </section>

        <section
          className="chat-panel"
          aria-label="Nexus conversation"
        >
          <div className="chat-panel-header">
            <div className="assistant-avatar">N</div>

            <div>
              <h2>Your conversation</h2>
              <p>Powered by Nexus AI</p>
            </div>

            <span
              className="online-indicator"
              title="Ready"
              aria-label="Ready"
            />
          </div>

          <div className="messages" aria-live="polite">
            {messages.map((message, index) => {
              const isAssistant = message.role === "assistant";

              return (
                <div
                  className={`message-row ${
                    isAssistant ? "assistant-row" : "user-row"
                  }`}
                  key={`${index}-${message.role}`}
                >
                  {isAssistant && (
                    <div className="message-avatar">N</div>
                  )}

                  <div className="message-content">
                    <div
                      className={`message-bubble ${
                        isAssistant
                          ? "assistant-bubble"
                          : "user-bubble"
                      }`}
                    >
                      <p>{formatMessage(message.content)}</p>
                    </div>

                    {isAssistant && (
                      <ProviderCards content={message.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="message-row assistant-row">
                <div className="message-avatar">N</div>

                <div
                  className="typing-bubble"
                  aria-label="Nexus is thinking"
                >
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {error && (
              <div className="error-message" role="alert">
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => {
                    if (lastFailedMessage.current) {
                      void sendMessage(lastFailedMessage.current);
                    }
                  }}
                >
                  Try again
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => void sendMessage(suggestion.message)}
                disabled={loading}
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Tell Nexus what you're looking for..."
              aria-label="Your message"
              rows={2}
              maxLength={5000}
              disabled={loading}
            />

            <button
              className="send-button"
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <p className="composer-hint">
            Press Enter to send · Shift + Enter for a new line
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>THOUGHTFULLY BUILT</span>

        <span>
          Designed &amp; built by{" "}
          <strong className="creator-name">Ritika Yadav</strong>
        </span>
      </footer>
    </div>
  );
}
