# Chime / Hyprland workspace system

Implemented in React, Tailwind, Radix UI, Framer Motion, and Zustand. This is an original Arch/Hyprland-inspired rice, not an official Hyprland theme or an operating-system emulator. Actual application state drives every connection and workspace indicator.

## 1. Design decisions

- **Composition before decoration.** A top status bar, a master conversation tile, a chat tile, and a thin keybinding footer replace the navigation rail and single rounded app container.
- **Gaps define relationships.** Separate borders and a 12px divider distinguish independent panes. Nested content uses separators, not another floating card at every level.
- **Focus is explicit.** A cyan border follows keyboard focus inside a tile. Selection uses an accent fill and a visible marker. Moving the pointer does not steal focus.
- **Focus layout is a real mode.** The current chat can occupy the full workspace; returning to split preserves tile width and message draft.
- **Commands are discoverable.** The launcher exposes the same actions as buttons. Keys accelerate the interface; they are never the only way to operate it.
- **Technical chrome, readable messages.** Monospace describes structure; proportional text carries conversation. No fabricated CPU meters, latency numbers, uptime, shell access, or activity.
- **Restrained material.** One 8px blur on the top bar and floating dialogs. Opaque content tiles, solid colors, small corners, no ambient gradients or continuous decorative motion.

The architectural references are Hyprland’s [gaps, borders, and layout variables](https://wiki.hypr.land/Configuring/Basics/Variables/) and [key bindings and submaps](https://wiki.hypr.land/Configuring/Basics/Binds/). Their concepts are adapted to browser focus and accessible controls; the app does not capture the OS Super key.

## 2. Color tokens

Tokens live in `src/index.css`; Tailwind exposes them as `bg-surface`, `text-primary`, etc. Components must use tokens instead of literal hex values. Dark is the default for new users. Existing preferences and the system option remain supported.

| Role              | Dark      | Light     | Use                                     |
| ----------------- | --------- | --------- | --------------------------------------- |
| Background        | `#10131c` | `#edf1f7` | Workspace gaps                          |
| Surface           | `#171c28` | `#f8fafd` | Content tiles and dialogs               |
| Sidebar           | `#151a25` | `#f3f6fb` | Tile title bars / conversation panel    |
| Foreground        | `#d9e2f2` | `#243146` | Main text                               |
| Muted text        | `#a6b2c8` | `#53617a` | Metadata and supporting text            |
| Primary / focus   | `#7dcfff` | `#075e86` | Active commands and focus outlines      |
| Secondary         | `#bb9af7` | `#6844a3` | Workspace indices and structural labels |
| Accent background | `#203449` | `#dfecf5` | Selected rows and outgoing messages     |
| Decorative border | `#38445e` | `#bec9dc` | Tile grouping and separators            |
| Control boundary  | `#657797` | `#8090aa` | Inputs and outlined buttons             |
| Success           | `#9ece6a` | `#36712b` | Connected / online                      |
| Warning           | `#e0af68` | `#845615` | Reconnecting / offline                  |
| Error             | `#f7768e` | `#b32545` | Failed actions and validation           |

Cyan is reserved for the active path; violet describes structure. Status colors are paired with text or icons. This keeps dense chrome legible without turning every surface into an accent. Control borders are stronger than decorative borders: their base contrast against surface is approximately 3.76:1 dark and 3.10:1 light. Muted text is approximately 7.97:1 dark and 5.98:1 light on surface. Verify composed opacity and interaction states as well as base tokens before adding variants.

## 3. Typography, geometry, and spacing

Both fonts are self-hosted variable fonts; no external font request is required.

| Element                           | Typeface       | Size / line height | Weight  |
| --------------------------------- | -------------- | ------------------ | ------- |
| Workspace titles, bar, timestamps | JetBrains Mono | 10–12px / 16–20px  | 400–500 |
| Buttons, commands, section labels | JetBrains Mono | 12–14px / 20px     | 500     |
| Message text and descriptions     | Inter          | 14px / 22–24px     | 400     |
| Inputs on narrow windows          | Inter          | 16px / 24px        | 400     |
| Panel headings                    | JetBrains Mono | 18–24px / 24–32px  | 500     |
| Welcome headline                  | JetBrains Mono | 36–60px / 1.18     | 500     |

- Spacing scale: **2, 4, 6, 8, 10, 12, 16, 24, 32, 48px**. Prefer multiples of 4 inside content; 6/10px support compact window chrome.
- Shell padding: 10px desktop, 6px narrow, respecting safe-area insets. Vertical shell gaps: 10px / 6px.
- Tile titles: 36px. Title index, window name, optional mode hint use one shared component.
- Control radius: 4px; tile radius: 6px; media containers: up to 10px. Rounded corners do not imply a draggable OS window.
- Standard action height: 44px; compact actions: 36px; icon actions: 40px. Keep dense targets separated and use full row hit areas.
- Never shrink editable phone text below 16px; this prevents Safari input zoom. Long user text wraps; filenames and titles truncate with full accessible names or title text.

## 4. Tiling and responsive rules

```text
WorkspaceShell (100dvh)
├── Status bar: brand | workspace actions | connection | commands | appearance
├── Tile grid: minmax(240px, sidebar width) | 12px divider | minmax(0, 1fr)
│   ├── conversations [master]
│   └── message stream [stack]
└── Keybinding footer
```

- **≥768px:** split view. Conversation tile defaults to 304px; supports 240–420px, capped at 42vw so the message tile keeps room. The message tile consumes remaining space.
- **<768px:** one tile at a time. The conversation list is shown until a conversation is selected. Back and the Messages workspace action return to the list. Divider and footer are hidden. No horizontal page scrolling at 320px.
- **Focus mode:** hides the master tile and divider while a chat is selected. It is an application layout state, not browser fullscreen.
- Tiles declare `min-width: 0` and `min-height: 0`. List and message history scroll independently; the shell, headers, and composer stay in place.
- Drag the separator to resize. Pointer capture keeps dragging stable. DOM width updates are coalesced with `requestAnimationFrame`; the persisted width is written on release, not every pointer event.
- The separator supports Left/Right (16px), Home (minimum), End (available maximum), and double-click (default). A `ResizeObserver` updates its accessible range as the browser window changes.
- Layout and width persist in `chime-workspace`. They contain no message or account data. Invalid persisted widths are clamped. The launcher includes Reset layout.
- The welcome screen uses the same Tile primitive, with an asymmetric 2-column layout from 1024px; its supporting tiles stack on narrow windows.

## 5. Keyboard and focus contract

| Binding                                    | Action                                                    |
| ------------------------------------------ | --------------------------------------------------------- |
| Ctrl / Command K                           | Open command launcher, including while typing             |
| Alt Shift N                                | New message                                               |
| Alt Shift 1                                | Focus conversation search; restore split / return to list |
| Alt Shift 2                                | Focus selected conversation’s composer                    |
| Alt Shift F                                | Toggle split / focus layout                               |
| Alt Shift /                                | Open keyboard reference                                   |
| `/` outside editable fields                | Focus conversation search                                 |
| Tab / Shift Tab                            | Native forward / backward control order                   |
| Up / Down, Home / End in conversation rows | Move focus; Enter opens the focused conversation          |
| Up / Down in launcher                      | Move active option; Enter runs it                         |
| Escape                                     | Close the active Radix overlay                            |
| Enter in desktop composer                  | Send; Shift Enter inserts a new line                      |

Coarse-pointer devices use the visible Send action; Enter remains available for new lines. IME composition must never trigger send or workspace commands.

**Tab order:** skip link → status bar actions → conversation search/filter/list/actions → separator → chat header → message controls → composer. No positive tabindex. Programmatic pane targets use `tabIndex=-1`. Arrow navigation supplements native Tab; it does not silently open conversations.

Workspace bindings ignore text inputs, textareas, and editable regions, except the explicit launcher binding. They pause while a dialog or menu is active. OS/browser-reserved keys may be intercepted before the page receives them; every action therefore has a visible alternative. Do not add global Super, Ctrl+W, Ctrl+L, or browser navigation overrides.

Radix owns modal focus trapping, Escape, and normal focus restoration. Launcher execution suppresses restoring focus to its old trigger when focus must move to the selected action. Opening New message or Settings from the launcher creates one modal at a time. Resize controls expose separator role, orientation, controlled pane, current value, and bounds. Launcher uses a combobox with an active-descendant listbox; unavailable commands remain visible with an explanation.

## 6. React structure and ownership

```text
Appearance → Chime (Clerk) → App (session lifecycle)
  ├── AuthScreen → Tile / hosted SignIn / SignUp / InstallButton
  └── WorkspaceShell
        ├── Tile(conversations) → Sidebar → conversation rows
        ├── TileDivider
        ├── Tile(message stream) → ChatPanel → Conversation → Composer
        │                                                   └── AttachmentUpload
        ├── CommandLauncher
        └── Keyboard reference
      + lazy NewConversation / Settings / PWA notices
```

| Module                     | Responsibility                                                |
| -------------------------- | ------------------------------------------------------------- |
| `components/Workspace.jsx` | Shell, Tile, divider, command overlay, pane focus             |
| `lib/commands.js`          | Stable action IDs, labels, help text, shortcuts, availability |
| `stores/workspace.js`      | Persisted non-sensitive layout preferences                    |
| `stores/preferences.js`    | Persisted light/dark/system preference                        |
| `stores/chat.js`           | Existing session data, drafts, delivery, network, sockets     |
| `components/ui.jsx`        | Shared buttons, fields, avatars, Radix dialogs and menus      |
| `index.css`                | Tokens, breakpoints, shell geometry, reduced-motion policy    |

`Tile({ id, title, index, hint, className, children })` composes content through children; it does not fetch messages or contain feature logic. `WorkspaceShell({ conversations, chat, onNew, onSettings })` receives panes and intent callbacks. Feature components keep API details out of chrome. Use PascalCase components, `useX` hooks/stores, stable kebab-case DOM IDs, and semantic action IDs. Prefer shared variants over caller-specific shape or color overrides.

State scope: transient search, selection, and overlays stay local; shared layout lives in its small store; session data stays in the existing chat store. Use narrow Zustand selectors (or shallow grouping) to avoid rerendering the shell for every message/progress event. Fonts, connection indicators, and tile sizing must not depend on backend rendering.

## 7. Accessibility and production constraints

- WCAG AA target: 4.5:1 regular text, 3:1 meaningful UI boundaries and focus indicators. Supplement color with labels, shape, or state semantics. Use axe plus manual keyboard and screen-reader checks.
- Visible focus is 2px with an offset; the containing tile gains a cyan border. Never use hover to change focus. No hidden focusable pane in single-tile mode.
- Respect reduced motion; transitions default to 120–200ms and animate opacity/transform rather than full-page layout. No cursor animation or continuous decorative pulse. Respect reduced transparency with opaque panels.
- Errors retain the existing actionable upload messages, draft/file retry state, and network recovery. Layout switching must not unmount the active chat or erase the composer.
- Keep private messages, auth responses, and uploaded media out of service-worker caches. Only public app assets/fonts are precached; theme and tile sizing are the persisted preferences.
- Dynamic viewport units and safe-area padding are mandatory. Verify the on-screen keyboard on real mobile browsers; desktop viewport emulation is not a native installation test.
- Treat message content as text; React renders it without HTML injection. Preserve existing authenticated API and Socket.IO boundaries.
- Do not claim end-to-end encryption, delivery latency, or native OS integrations that the backend does not implement.

**Performance budgets (targets, not measurements):** command response within 100ms, resize work within a 16.7ms frame at 60Hz, no unexpected layout shifts on font loading, individual JS chunks under 500KB raw. Keep dialogs lazy, use local variable fonts, isolate list scrolling, avoid global blur, and retain cursor-based history pagination. Profile before introducing virtualization; if long sessions warrant it, preserve scroll anchors and accessible message history.

## 8. Validation and maintenance

Run `npm run lint`, `npm run build`, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm test` in `frontend`; run `npm test` in `backend` for the unaffected API contract.

Browser coverage includes existing auth states, text delivery, real local Socket.IO reconnection, attachments/progress/retry, offline/cache isolation, plus:

- Launcher opening from a draft, filtering, active option navigation, Escape, disabled actions, focus transfer, and opening account settings.
- Workspace shortcuts do not activate while typing; drafts survive launcher and layout changes.
- Arrow navigation changes row focus without selecting a conversation.
- Keyboard and pointer resizing, persisted width, focus layout, restoration, and narrowing a live split window to 600px.
- Desktop/tablet/phone screenshots, light and dark, and zero horizontal overflow.

Before shipping a new command: add registry metadata, preserve editable-field exclusions, provide a pointer route, and verify modal/focus behavior. Before adding a visual variant: use a token, verify both themes and contrast, check 320px and 200% zoom, and respect motion preferences. Test actual iOS/Android installation and screen readers on devices when available; do not substitute Chromium emulation for those checks.
