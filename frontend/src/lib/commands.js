// Shared by the launcher, shortcut handler, and shortcut reference.
export const COMMANDS = [
  {
    id: "new",
    label: "New message",
    detail: "Open the contact picker",
    shortcut: "Alt Shift N",
    code: "KeyN",
  },
  {
    id: "conversations",
    label: "Focus conversations",
    detail: "Go to the conversation search",
    shortcut: "Alt Shift 1",
    code: "Digit1",
  },
  {
    id: "compose",
    label: "Focus message",
    detail: "Go to the active message composer",
    shortcut: "Alt Shift 2",
    code: "Digit2",
    needsChat: true,
  },
  {
    id: "layout",
    label: "Toggle focus layout",
    detail: "Expand the chat tile or restore the split",
    shortcut: "Alt Shift F",
    code: "KeyF",
    needsChat: true,
  },
  {
    id: "settings",
    label: "Account and appearance",
    detail: "Profile, theme, and installation",
  },
  {
    id: "reset",
    label: "Reset layout",
    detail: "Restore the default tile sizes",
  },
  {
    id: "help",
    label: "Keyboard shortcuts",
    detail: "View the workspace key bindings",
    shortcut: "Alt Shift /",
    code: "Slash",
  },
];
