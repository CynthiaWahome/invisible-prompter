# clueless

Minimal Electron overlay that stays always on top and can toggle
`setContentProtection` to hide the window from supported screen
recorders while keeping it visible locally.

aint no way i am paying 12 dollars for cluely so i built this

## Quick start

```bash
npm install
npm start
```

## Notes

- `setContentProtection` support varies by OS and recording apps.
- Main process lives in `src/main.ts`, renderer in `src/renderer`, and preload in `src/preload.ts`.
- Hotkeys: Ctrl+Shift+H hide/show, Ctrl+Shift+P toggle protection, Ctrl+Shift+A toggle auto-hide.
