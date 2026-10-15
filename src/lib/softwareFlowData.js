// Canvas pages for the Software section: one board per app, its shipped
// screens laid out in reading order with a label above each. Unlike the
// client flow pages there's no user journey to draw arrows through, so these
// are plain labelled rows. Sizes are the screenshots' natural pixel
// dimensions; the layout scales each to a common row height.

const DIM = "rgba(237,234,212,0.5)";
const ROW_H = 300;
const GAP = 56;
const MAX_ROW_W = 1700;

function img(id, src, x, y, w, h, z) {
  return { id, type: "image", src, x, y, w, h, rotation: 0, z };
}

function text(id, str, x, y, w, h, fontSize, color, z = 50) {
  return { id, type: "text", text: str, x, y, w, h, rotation: 0, z, fontSize, color, fill: "transparent" };
}

function appPage(id, name, subtitle, dir, screens) {
  const els = [
    text(`${id}-title`, name, 60, 30, 1600, 44, 26, "#EDEAD4", 100),
    text(`${id}-subtitle`, subtitle, 60, 80, 1600, 28, 13, DIM, 100),
  ];
  let x = 60, y = 160;
  screens.forEach(([file, label, nw, nh], i) => {
    const w = Math.round((ROW_H * nw) / nh);
    if (x + w > MAX_ROW_W && x > 60) { x = 60; y += ROW_H + 90; }
    els.push(text(`${id}-lbl-${i}`, `${i + 1}. ${label}`, x, y - 30, Math.max(w, 160), 20, 12, DIM));
    els.push(img(`${id}-img-${i}`, `/case-studies/${dir}/${file}`, x, y, w, ROW_H, 10));
    x += w + GAP;
  });
  return { id: `${dir}-flow`, name, elements: els };
}

export function netmeterFlowPage() {
  return appPage("nm", "NetMeter: Screens", "A menu bar network monitor for macOS. All captures use the app's synthetic demo data.", "netmeter", [
    ["01-overview-dark.png", "Overview", 1700, 1267],
    ["02-menubar-panel.png", "Menu bar panel", 720, 1240],
    ["03-history.png", "History", 1700, 1267],
    ["04-network-editor.png", "Network editor", 720, 1240],
    ["05-menubar-settings.png", "Menu bar settings", 1160, 1856],
    ["06-overview-light.png", "Light mode", 1700, 1267],
  ]);
}

export function sunroofFlowPage() {
  return appPage("sr", "Sunroof: Screens", "Clipboard, files, notes and widgets on one shelf that opens from the top of the screen.", "sunroof", [
    ["01-shelf.png", "The shelf", 2200, 1262],
    ["03-widgets.png", "Widgets", 2200, 606],
    ["04-notes.png", "Notes", 1120, 940],
    ["05-settings.png", "Appearance", 1160, 776],
  ]);
}

export function docflowFlowPage() {
  return appPage("df", "DocFlow: Screens", "Read, edit, sign and redact PDFs on your Mac. The full state-by-state design lives in the SchnellPDF Figma file.", "docflow", [
    ["01-signature.png", "Sign", 1600, 1000],
    ["02-editor-dark.png", "Editor", 1600, 1000],
    ["03-dashboard.png", "Dashboard", 1600, 1000],
    ["04-onboarding.png", "Onboarding", 1600, 1000],
    ["05-editor-light.png", "Light mode", 1600, 1000],
  ]);
}

export function inspinFlowPage() {
  return appPage("is", "InSpin Survey Analysis: Screens", "A survey analysis tool for someone who isn't a data analyst. Frame exports from the Figma file; the data is synthetic.", "inspin", [
    ["01-overview.png", "Overview", 1440, 1024],
    ["02-privacy-setup.png", "Privacy setup", 1440, 1024],
    ["03-open-text-themes.png", "Open-text themes", 1440, 1024],
    ["04-nps.png", "NPS as a split", 1440, 1024],
    ["05-compare-heatmap.png", "Compare groups", 1440, 1024],
    ["06-small-group.png", "Small group warning", 1440, 1024],
    ["07-participants.png", "Participants", 1440, 1024],
    ["08-ask-ai-view.png", "Open this view", 1440, 1024],
    ["09-share-panel.png", "Share", 1440, 1024],
    ["10-sharing-people.png", "People and seats", 1440, 1024],
  ]);
}
