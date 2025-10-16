# React Legacy Reference

This directory contains a one-to-one copy of the React SDK source tree under `src/react-legacy/src`. It is **not** part of the Vue build (see the exclusion in `tsconfig.app.json`).

## Why keep these files here?

- Provide a porting reference so the Vue implementation can follow the same folder layout, data flow, and naming as the React SDK. Open files from `src/react-legacy/src/...` to compare directly.
- Make it easier to migrate logic by comparing, extracting, or sharing modules without jumping between projects.
- Allow gradual conversion of utilities into framework-agnostic modules that can live in `shared/` and be imported by both frameworks.

## Migration workflow

1. Pick a feature (for example `methods/streamMethods`) and extract the framework-neutral pieces into `mediasfu-shared`.
2. Rewire the React code to consume the shared module.
3. Implement the Vue counterpart under `src/components` (mirroring the same folder/filename structure) using the shared logic.
4. Delete or mark the copied reference file once the Vue port is complete.

> ⚠️  Do not import files from `src/react-legacy` directly in Vue components. Treat them as documentation/templates only.
