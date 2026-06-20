# Build Instructions

## Prerequisites

- Node.js v20.19.0 or compatible
- npm

## Build Steps

```bash
npm install
npm run typecheck
npm run build
```

## Expected Result

- TypeScript typecheck passes.
- Vite production build writes files to `dist/`.
- No raw prompt content is required for build.

## Troubleshooting

- If dependency installation fails, remove `node_modules/` and run `npm install` again.
- If TypeScript fails, inspect the reported source file and rerun `npm run typecheck`.