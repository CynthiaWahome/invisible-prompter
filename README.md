# clueless

Minimal Electron overlay that stays always on top and can toggle
`setContentProtection` to hide the window from supported screen
recorders while keeping it visible locally.

Aint no way i am paying 12 dollars for cluely so i built this

## Quick start

```bash
npm install
npm start
```

## Notes

- `setContentProtection` support varies by OS and recording apps.
- The UI is embedded directly in `main.ts` to keep the demo single-file.
