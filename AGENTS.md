<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-rules -->
# Project Purpose & Documentation Rule

## Purpose

This project is a **reference implementation** for partners integrating Meld's API. Every API integration pattern implemented here — especially those that go beyond the official documentation — must be documented so other developers can benefit.

## MANDATORY: Keep the Integration Guide Updated

**Every time you change API integration logic in this project, you MUST update `/Users/meld/code/MeldDemo/docs/INTEGRATION_GUIDE.md`.**

This includes:
- Changes to query parameters on any Meld API call
- New filtering, sorting, or prioritization logic on API results
- New API endpoints being used
- Non-obvious patterns or workarounds discovered through use
- Any behavior that differs from or extends the official documentation

The integration guide documents **what the official docs don't say** — operational knowledge from real usage. Keep it current.
<!-- END:project-rules -->
