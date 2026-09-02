# dockMore. — Product Documentation

**One dashboard for all your clouds.**

---

## 1. Overview

dockMore is a multi-cloud storage aggregator. It connects a user's Google Drive, OneDrive, Dropbox, and MEGA accounts — including multiple accounts from the same provider — into a single unified dashboard. From dockMore, a user can see how much total storage they have across every account, browse and search all their files in one place, preview and download files, and move files directly between providers without the file ever touching their own device.

dockMore does not replace any provider's storage — it sits on top of the provider APIs as an aggregation and orchestration layer. No files are permanently stored on dockMore's own infrastructure; the underlying clouds remain the source of truth.

---

## 2. Problem Statement

Most people accumulate cloud storage across several accounts over time — a personal Google Drive, a college or work OneDrive, an old Dropbox account, maybe a MEGA account kept around for its generous free tier. This creates three recurring problems:

1. **No single view of total storage** — a user has to check 4-5 different apps to know how much space they actually have or where their files are.
2. **No cross-cloud search** — finding a specific file means guessing which provider it's in and searching there individually.
3. **No easy way to move files between providers** — moving a file from one cloud to another requires downloading it locally, then re-uploading it, which is slow and clunky for large files.

dockMore solves all three by acting as a single control layer over every connected account.

---

## 3. Feasibility Notes

This section documents what is technically confirmed feasible and any important caveats, so scope decisions are made with accurate expectations.

### 3.1 Listing files across connected accounts
**Feasible — standard.** Every major provider (Google Drive, OneDrive/Microsoft Graph, Dropbox) exposes a file-listing API once a user completes OAuth. This is the most straightforward part of the system.

### 3.2 Accessing and previewing files "inside" dockMore
**Feasible, via a proxy/stream layer — not permanent hosting.** dockMore's backend requests file content from the provider's API on demand and streams it through to the user's browser for preview or download. Files are not permanently stored on dockMore's own servers. This is architecturally the same approach Google Drive's own web viewer uses internally.

### 3.3 Cloud-to-cloud transfer without the user downloading
**Feasible, with an important clarification.** The file does pass through dockMore's backend server — it is downloaded from the source provider and streamed to the destination provider. What the user experiences as "no download" is accurate from their perspective: the file bytes never reach the user's browser or local device. But this means:
- The backend must stream data (pipe source → destination) rather than fully buffering it in memory, or large files will crash the server.
- The backend needs adequate bandwidth, since it is genuinely moving the data, not just issuing an instruction between two providers that talk to each other directly (most providers don't support that).
- Transfer speed is bounded by the backend's network throughput in both directions simultaneously.

### 3.4 Summary
All three core capabilities are technically sound and used in production by comparable products. The main engineering risk is not "can this be done" but "can this be done reliably at scale" — specifically around OAuth token lifecycle management, provider rate limits, and safe streaming of large files. These are addressed in Section 6 (Non-Functional Requirements).

---

## 4. Feature Set

### 4.1 v1 — Core Features

| Feature | Description |
|---|---|
| **Multi-account connection** | Connect multiple accounts from the same provider (e.g. two separate Google Drive accounts) alongside OneDrive, Dropbox, and MEGA, via OAuth. |
| **Unified storage dashboard** | Total, used, and free storage combined across every connected account, with per-provider and per-account breakdowns and visual charts. |
| **Unified file explorer** | Browse every connected account's files in one interface, with provider/account filters, grid and list view modes, and folder navigation. |
| **Global search** | Search file names across every connected cloud account simultaneously. |
| **File preview** | View supported file types (images, PDFs, video) directly inside dockMore via the proxy/stream layer, without opening the provider's own viewer. |
| **Upload / download** | Transfer files in and out of dockMore-connected accounts, with resumable/chunked handling for large files so uploads survive interrupted connections. |
| **Basic file operations** | Rename, delete, move, and create folders from a single interface, regardless of which provider a file lives on. |
| **Cloud-to-cloud transfer** | Move or copy a file directly from one connected provider to another (e.g. Google Drive → Dropbox) by streaming it through the backend — the user's device never receives the file. |
| **Cloud Accounts management** | View connection status (active / expired / revoked) for every account, last synced time, and manually trigger a re-sync or disconnect an account. |
| **Activity log** | A chronological record of actions taken across all connected accounts (uploads, deletes, moves, transfers, connections). |

### 4.2 Phase 2 — Near-Term Additions

These extend naturally from the v1 architecture and are strong candidates for the release immediately following v1.

| Feature | Description |
|---|---|
| **Bulk/multi-select transfer** | Select multiple files across different accounts and transfer them all to one destination in a single batch operation. |
| **Duplicate file finder** | Detect files that exist identically (by name and/or content hash) across multiple connected accounts. |
| **Unified trash** | View and restore recently deleted files from every connected account in one place, where the provider's API supports it. |
| **Universal share links** | Generate a single dockMore-hosted link for a file, regardless of which underlying cloud it lives on. |
| **Storage optimization suggestions** | Surface recommendations such as "Google Drive #1 is 94% full, OneDrive has 3GB free — move your largest files?" |

### 4.3 Phase 3 — Future / AI Layer

Treated as a separate service track, not bolted onto the core product, given the additional infrastructure (embeddings, content extraction, indexing pipeline) it requires.

| Feature | Description |
|---|---|
| **AI semantic search** | Natural-language file search (e.g. "find my blockchain hackathon presentation") across all connected accounts. |
| **Chat with your files** | RAG-based conversational interface over the content of a user's connected clouds. |
| **AI auto-organization** | Suggested folder structures and file groupings based on content and naming patterns. |
| **Smart upload destination** | Automatically recommend or select the best account to upload a file to, based on free space and file type. |
| **Scheduled/automatic backup** | Recurring, automated copying of a folder from one provider to another on a defined schedule. |

---

## 5. User Flows

### 5.1 Connecting an account
1. User clicks "+ Add" in the Cloud Accounts sidebar section or the full Cloud Accounts page.
2. User selects a provider (Google Drive, OneDrive, Dropbox, MEGA).
3. User is redirected to that provider's OAuth consent screen.
4. On approval, the provider redirects back to dockMore with an authorization code.
5. dockMore's backend exchanges the code for access and refresh tokens, encrypts them, and stores the new account record.
6. The account appears in the sidebar and Cloud Accounts page, and an initial sync begins.

### 5.2 Browsing and previewing a file
1. User navigates to All Files or Home's Recent section.
2. User clicks a file.
3. dockMore's backend requests the file content from the owning provider's API.
4. If the file type is previewable (image, PDF, video), it streams directly into an in-app viewer.
5. If not previewable, the user is offered a direct download instead.

### 5.3 Transferring a file between clouds
1. User selects a file (or multiple files) in All Files.
2. User chooses "Transfer" and selects a destination account from a different provider.
3. dockMore's backend opens a read stream from the source provider and a write/upload session to the destination provider, piping data between them in chunks.
4. Progress is reported back to the user in real time via the Transfers page.
5. On completion, the file exists on the destination provider; the source file remains untouched unless the user explicitly chose "Move" instead of "Copy."

### 5.4 Reconnecting an expired account
1. dockMore's background sync detects a token refresh failure (e.g. `invalid_grant`).
2. The account's status is updated to "Expired" and surfaced in the Cloud Accounts page and sidebar.
3. User clicks "Reconnect" on that account, repeating the OAuth flow from 5.1.
4. On success, status returns to "Active" and sync resumes.

---

## 6. Non-Functional Requirements

These are the engineering constraints that determine whether the feature set in Section 4 works reliably rather than just in a demo.

### 6.1 OAuth token lifecycle
- Access and refresh tokens are encrypted at rest.
- Tokens are refreshed proactively (before expiry), not reactively (after a failed call), to avoid race conditions across concurrent requests.
- Revoked or expired tokens are detected and surfaced to the user rather than causing silent background failures.

### 6.2 Rate limiting
- All provider API calls are routed through a job queue with per-account rate limiting, since each provider enforces its own throttling (e.g. Google Drive's per-user request quota, Dropbox and Microsoft Graph's dynamic 429 responses).
- Fan-out requests (e.g. listing files across 5 accounts) are issued per-account in parallel rather than sequentially, so one slow or throttled provider doesn't block the others.

### 6.3 Large file streaming
- Uploads and downloads use provider-specific resumable/chunked session APIs for files above a size threshold (roughly 10-50MB), not naive single-request uploads.
- Cloud-to-cloud transfers stream data directly (source → backend → destination) using backpressure-aware streaming, never fully buffering a file in server memory.
- Partial transfer failures are either resumed (where the destination provider supports resumable sessions) or cleaned up (deleting the partial upload) rather than left as orphaned incomplete files.

### 6.4 Data retention
- dockMore does not permanently store user file content. Files are streamed on demand for preview, download, and transfer, and are not retained on dockMore's infrastructure afterward.
- Cached metadata (filenames, sizes, modified dates) may be stored locally to make the UI fast, refreshed via periodic background sync rather than a live API call on every page load.

---

## 7. Technical Architecture Summary

### 7.1 Provider abstraction
Every cloud provider is implemented against a single shared interface, so adding a new provider means implementing that interface rather than modifying the rest of the application:

```
CloudProvider
 ├── listFiles()
 ├── uploadFile()
 ├── downloadFile()
 ├── deleteFile()
 ├── createFolder()
 └── getStorageInfo()
```

### 7.2 Stack
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js / API routes
- **Database:** PostgreSQL (via Supabase)
- **Job queue:** Redis + BullMQ, for background account syncing and rate-limited provider calls
- **AI layer (Phase 3, separate service):** Python microservice, pgvector for embeddings, content extraction pipeline for PDFs/DOCX/PPTX

### 7.3 Build order
1. Google Drive, fully working end-to-end (OAuth, listing, upload/download, storage stats)
2. Multi-account support for Google Drive
3. Unified dashboard and file explorer
4. Second provider (OneDrive) — validates the abstraction layer holds up against a genuinely different API shape
5. Third provider (Dropbox)
6. Cloud-to-cloud transfer
7. Cloud Accounts management and Activity log
8. Phase 2 features (bulk transfer, duplicate finder, unified trash, share links, optimization suggestions)
9. Phase 3 AI layer, as a separate track

---

## 8. Glossary

| Term | Definition |
|---|---|
| **Provider** | A cloud storage service dockMore connects to (Google Drive, OneDrive, Dropbox, MEGA). |
| **Account** | A single authenticated connection to one provider — a user may have multiple accounts per provider. |
| **Transfer** | The act of moving or copying a file from one connected account to a different provider's account. |
| **Sync** | A background process that refreshes dockMore's cached view of a provider account's files and storage stats. |
| **Stream** | Data passed through the backend in chunks rather than loaded fully into memory, used for previews, downloads, and transfers. |

---

*Document version 1.0 — reflects current v1 scope and Phase 2/3 planning as of this writing.*
