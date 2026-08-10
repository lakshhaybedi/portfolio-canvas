import type { Tool } from "@/lib/tools";

// "path" entries render the real brand mark (see the PATHS map + comment in
// tools.ts for sourcing/licensing). Figma's is also the real mark, drawn as
// separate shapes rather than a single path since that's how it's
// constructed. "monogram" is the fallback for brands with no open-licensed
// mark available — a colored badge, not a reproduction of anyone's logo.
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
    case "path":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d={tool.path} fill={tool.color} />
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
