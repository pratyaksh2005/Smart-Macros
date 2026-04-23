import { useState, useEffect, useRef } from "react";

type ChatMessage = {
  id: string;
  sender: "PATIENT" | "CLINICIAN";
  text: string;
  timestamp: string;
};

export default function MessagesTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => JSON.parse(localStorage.getItem("sm_messages") || "[]"));
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync to database
  useEffect(() => {
    localStorage.setItem("sm_messages", JSON.stringify(messages));
  }, [messages]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "PATIENT",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  }

  return (
    <div className="card" style={{ padding: "0", display: "flex", flexDirection: "column", height: "65vh", overflow: "hidden" }}>
      <div style={{ padding: "20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
        <h3 style={{ margin: 0, color: "#0f172a" }}>Secure Clinical Inbox</h3>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>Direct connection to your assigned primary care physician.</p>
      </div>

      <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#fff" }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "40px" }}>No secure messages yet.</div>
        ) : (
          messages.map((msg) => {
            const isPatient = msg.sender === "PATIENT";
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isPatient ? "flex-end" : "flex-start" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px", fontWeight: "bold" }}>
                  {isPatient ? "You" : "Dr. Clinician"} • {msg.timestamp}
                </span>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    backgroundColor: isPatient ? "#2563eb" : "#f1f5f9",
                    color: isPatient ? "#fff" : "#0f172a",
                    maxWidth: "75%",
                    borderBottomRightRadius: isPatient ? "2px" : "12px",
                    borderBottomLeftRadius: isPatient ? "12px" : "2px",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: "16px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "12px", backgroundColor: "#f8fafc" }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a secure message to your clinician..."
          style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
        />
        <button type="submit" className="btn-primary" style={{ padding: "0 24px", borderRadius: "8px" }}>
          Send
        </button>
      </form>
    </div>
  );
}
