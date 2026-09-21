# Changelog

## 1.2.0 — 2026-09-21

- Added person-aware background blur to the classic and modern background modals.
- Uses the shared compositor and stable `"blur"` state so modal, hybrid, and headless integrations follow one virtual-background contract.
- Requires `mediasfu-shared` 1.2.3 or later for blur helpers and consume-socket lifecycle cleanup.

## 1.1.3 — 2026-09-16

- Requires `mediasfu-shared` 1.2.2 or later. That release reports the room layout to the recording service as soon as a recording starts, instead of waiting for the next participant or screen change.
