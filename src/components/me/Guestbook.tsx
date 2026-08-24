"use client";

import { useEffect, useState } from "react";
import { clean, hasProfanity } from "@/lib/profanity";

// Entries live in localStorage, so they persist for the visitor who wrote
// them but are not shared between visitors — this site is a static export
// with no backend to hold them. Making them public needs a hosted store
// (Supabase/Firebase free tier both work from a static page); the component
// is written so only `load`/`save` would change.
const KEY = "otc-guestbook-v1";
const MAX_NAME = 24;
const MAX_MSG = 200;

type Entry = { id: string; name: string; msg: string; at: number };

const SEED: Entry[] = [
  { id: "seed-1", name: "webmaster", msg: "first!! welcome 2 my guestbook, be nice :-)", at: Date.now() - 864e5 * 3 },
];

const load = (): Entry[] => {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : SEED;
  } catch { return SEED; }
};

const save = (entries: Entry[]) => {
  try { window.localStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* private mode */ }
};

const when = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function Guestbook() {
  // Seeded on the client only — reading localStorage during render would
  // desync the static prerender and hydrate into a mismatch.
  const [entries, setEntries] = useState<Entry[]>(SEED);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [warn, setWarn] = useState<string | null>(null);

  useEffect(() => { setEntries(load()); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim().slice(0, MAX_NAME);
    const m = msg.trim().slice(0, MAX_MSG);
    if (!n || !m) { setWarn("name and message are both required!"); return; }
    if (hasProfanity(n)) { setWarn("that name won't fly. keep it friendly!"); return; }

    // Messages get masked rather than rejected — a rejected post usually just
    // gets retyped, a masked one still reads as a message.
    const flagged = hasProfanity(m);
    const next = [{ id: crypto.randomUUID(), name: n, msg: flagged ? clean(m) : m, at: Date.now() }, ...entries].slice(0, 50);
    setEntries(next);
    save(next);
    setName(""); setMsg("");
    setWarn(flagged ? "posted — but we bleeped a word or two ;-)" : null);
  };

  return (
    <div style={{ padding: 14, fontFamily: "'Tahoma','Geneva',sans-serif" }}>
      <form onSubmit={submit} style={{ display: "grid", gap: 6, marginBottom: 12 }}>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME} placeholder="ur name"
          aria-label="Your name"
          style={inputStyle}
        />
        <textarea
          value={msg} onChange={(e) => setMsg(e.target.value)}
          maxLength={MAX_MSG} rows={3} placeholder="leave a message…"
          aria-label="Your message"
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="submit" style={{
            border: "2px outset #C8C8D8", background: "#D6D6D6", color: "#101010",
            fontSize: 11, fontWeight: 700, padding: "4px 14px", cursor: "pointer",
            fontFamily: "inherit",
          }}>
            SIGN IT!
          </button>
          <span style={{ fontSize: 9, color: "#2A4A80" }}>{MAX_MSG - msg.length} chars left</span>
        </div>
        {warn && (
          <div style={{ fontSize: 10, color: "#B00000", fontWeight: 700 }}>{warn}</div>
        )}
      </form>

      <div style={{ display: "grid", gap: 6, maxHeight: 260, overflowY: "auto" }}>
        {entries.map((en) => (
          <div key={en.id} style={{
            background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.8)",
            padding: "6px 8px", fontSize: 11, color: "#0A1A3A",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <strong style={{ color: "#0000CC" }}>{en.name}</strong>
              <span style={{ fontSize: 9, color: "#5A6A8A", flexShrink: 0 }}>{when(en.at)}</span>
            </div>
            <div style={{ marginTop: 2, wordBreak: "break-word" }}>{en.msg}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9, color: "#2A4A80", marginTop: 8, lineHeight: 1.5 }}>
        entries are saved in ur browser only — no server, no tracking.
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "2px inset #B8B8C8",
  background: "#FFFFFF",
  padding: "4px 6px",
  fontSize: 11,
  fontFamily: "inherit",
  color: "#101010",
  width: "100%",
  boxSizing: "border-box",
};
