# clueeless

Minimal Electron overlay that stays always on top, includes Share Guard
and content protection toggles, and now adds a prompt-based AI assistant
panel inside the overlay.

aint no way i am paying 12 dollars for cluely so i built this

## Quick start

```bash
npm install
npm start
```

## AI config

The assistant uses environment variables so you can point it at your own AI server.

Required:

- `CLUEELESS_AI_ENDPOINT` - URL for the AI server.
- `CLUEELESS_AI_MODEL` - model name.

Optional:

- `CLUEELESS_AI_PROVIDER` - `ollama` (default) or `openai-compatible`.
- `CLUEELESS_AI_API_KEY` - bearer token for providers that need it.
- `CLUEELESS_AI_SYSTEM` - system prompt.
- `CLUEELESS_AI_TIMEOUT_MS` - request timeout in ms (default 30000).

Notes:

- `ollama` uses the `/api/generate` endpoint and expects a JSON response with `response`.
- `openai-compatible` uses the `/v1/chat/completions` style payload and expects `choices[0].message.content`.

## Screen-capture protection

`setContentProtection` is **best-effort and OS-dependent — it is not guaranteed invisibility.**
There is no API on any platform that guarantees a window is hidden from all capture.
The app detects what your platform can actually deliver and reports it in the
"Capture Shield" row, fails loudly when protection can't be applied, and logs the
support level to the console on startup.

What the levels mean:

- **SUPPORTED** (`full`) — window is excluded from the captured frame.
  - Windows 10 build 19041+ (version 2004) via `WDA_EXCLUDEFROMCAPTURE`.
  - macOS via `NSWindowSharingNone`.
- **WEAK** (`weak`) — older Windows only blanks the window during capture
  (`WDA_MONITOR`). Upgrade to build 19041+ for true exclusion.
- **UNSUPPORTED** (`none`) — e.g. Linux. The overlay **will** appear in captures.

Even at SUPPORTED level, this does **not** stop:

- a phone or second camera pointed at the screen,
- a hardware HDMI/capture card (it grabs the signal after the GPU),
- some capture paths that bypass the OS compositor, or
- kernel-level / whole-display proctoring software, which may also flag the mere
  presence of an unknown process.

## Notes

- Main process lives in `src/main.ts`, renderer in `src/renderer`, and preload in `src/preload.ts`.
- Hotkeys: Ctrl+Shift+H hide/show, Ctrl+Shift+P toggle protection, Ctrl+Shift+A toggle auto-hide.
