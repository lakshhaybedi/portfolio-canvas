import type { Tool } from "@/lib/tools";

// Simplified, hand-drawn marks rather than pixel-accurate trademarked logos —
// Figma's is the real overlapping-shape mark since it's simple geometry;
// everything else is a colored badge/glyph that reads as "that tool" at
// 14-16px without reproducing anyone's exact logo artwork.
export default function ToolIcon({ tool, size = 14 }: { tool: Tool; size?: number }) {
  switch (tool.icon) {
    case "figma":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 1a4 4 0 000 8h4V1H8z" fill="#F24E1E" />
          <path d="M4 9a4 4 0 014-4h4v8H8a4 4 0 01-4-4z" fill="#FF7262" />
          <path d="M4 17a4 4 0 014-4h4v4a4 4 0 11-8 0z" fill="#A259FF" />
          <path d="M12 1h4a4 4 0 110 8h-4V1z" fill="#1ABCFE" />
          <path d="M12 9h4a4 4 0 110 8 4 4 0 01-4-4V9z" fill="#0ACF83" />
        </svg>
      );
    case "face":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill={tool.color} />
          <circle cx="8.5" cy="10.5" r="1.4" fill="#3B2F00" />
          <circle cx="15.5" cy="10.5" r="1.4" fill="#3B2F00" />
          <path d="M7.5 14.5c1 1.6 3 2.4 4.5 2.4s3.5-.8 4.5-2.4" stroke="#3B2F00" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "asterisk":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <g stroke={tool.color} strokeWidth="2.6" strokeLinecap="round">
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="4.5" y1="7.5" x2="19.5" y2="16.5" />
            <line x1="19.5" y1="7.5" x2="4.5" y2="16.5" />
          </g>
        </svg>
      );
    case "gem":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="12,2 19,8 16,22 8,22 5,8" fill={tool.color} opacity="0.85" />
          <polygon points="12,2 19,8 12,11 5,8" fill={tool.color} />
        </svg>
      );
    case "diamond":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <polygon points="12,2 22,12 12,22 2,12" fill={tool.color} />
        </svg>
      );
    case "monogram":
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="1" y="1" width="22" height="22" rx="6" fill={tool.color} />
          <text
            x="12" y="16.5" textAnchor="middle"
            fontSize="11" fontWeight={700} fontFamily="'Space Grotesk', sans-serif"
            fill={tool.monoTextColor ?? "#FFFFFF"}
          >
            {tool.mono}
          </text>
        </svg>
      );
  }
}
