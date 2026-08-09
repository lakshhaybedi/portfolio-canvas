// Tools grouped by how they actually show up in the work: pixel/vector
// design tools, then the local-first AI stack (offline models plus the
// repo/code tooling that goes with them), then day-to-day knowledge tools.
// `color` drives both the hover tint and the icon fill in ToolIcon.tsx.

export type ToolIconType = "figma" | "monogram" | "face" | "asterisk" | "diamond" | "gem";

export type Tool = {
  name: string;
  color: string;
  icon: ToolIconType;
  mono?: string;
  monoTextColor?: string;
};

export type ToolGroup = {
  label: string;
  tools: Tool[];
};

export const TOOL_GROUPS: ToolGroup[] = [
  {
    label: "Design & Prototyping",
    tools: [
      { name: "Figma", color: "#F24E1E", icon: "figma" },
      { name: "Axure RP", color: "#D8402C", icon: "monogram", mono: "Rp", monoTextColor: "#FFFFFF" },
      { name: "Adobe XD", color: "#FF2BC2", icon: "monogram", mono: "Xd", monoTextColor: "#FFFFFF" },
      { name: "Penpot", color: "#00E6BF", icon: "monogram", mono: "Pt", monoTextColor: "#04201B" },
      { name: "Photoshop", color: "#31A8FF", icon: "monogram", mono: "Ps", monoTextColor: "#FFFFFF" },
      { name: "Illustrator", color: "#FF9A00", icon: "monogram", mono: "Ai", monoTextColor: "#3B1D00" },
      { name: "Affinity", color: "#2A7DE1", icon: "monogram", mono: "Af", monoTextColor: "#FFFFFF" },
      { name: "Sketch", color: "#FDAD00", icon: "diamond" },
    ],
  },
  {
    label: "AI & Local LLM",
    tools: [
      { name: "Claude Code", color: "#D97757", icon: "asterisk" },
      { name: "Ollama", color: "#D4A373", icon: "monogram", mono: "OL", monoTextColor: "#2B1B0E" },
      { name: "LM Studio", color: "#6C5CE7", icon: "monogram", mono: "LM", monoTextColor: "#FFFFFF" },
      { name: "Hugging Face", color: "#FFD21E", icon: "face" },
      { name: "GitHub", color: "#EDEAD4", icon: "monogram", mono: "gh", monoTextColor: "#14140F" },
    ],
  },
  {
    label: "Productivity",
    tools: [
      { name: "Obsidian", color: "#9C5FFF", icon: "gem" },
      { name: "Notion", color: "#EDEAD4", icon: "monogram", mono: "N", monoTextColor: "#14140F" },
      { name: "VS Code", color: "#0098FF", icon: "monogram", mono: "VS", monoTextColor: "#FFFFFF" },
    ],
  },
];
