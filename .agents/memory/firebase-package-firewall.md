---
name: Firebase package firewall
description: Why this project uses scoped Firebase web packages instead of the firebase umbrella package.
---

Use the scoped Firebase web packages directly rather than adding the `firebase` umbrella package.

**Why:** Clean installs of the umbrella package pulled vulnerable transitive archives that Replit's package firewall correctly blocked. Direct app/auth/firestore/storage/analytics packages preserve the web APIs without the unrelated dependency path.

**How to apply:** Keep Firebase imports on `@firebase/app`, `@firebase/auth`, `@firebase/firestore`, `@firebase/storage`, and `@firebase/analytics`. Do not reintroduce the umbrella dependency unless its dependency graph has been verified safe.