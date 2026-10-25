# MissingGuard

**A Human-in-the-Loop AI safeguard that cross-checks missing-person case-closure claims against the evidence on file.**

> "AI should not decide when a missing-person search ends. It should make sure the evidence supports the decision."

Built for SXSW.

## The problem

A review of one officer's closures in a real missing-person case-closure audit (Jeju, South Korea, 2025–26) found that, beyond the original falsified-closure case, 25 additional closures were suspected of the same pattern across 298 reviewed cases over ~16 months — cases closed without confirming the subject's identity, cases where a different cause was logged despite the subject's actual location being known, and missing-persons profile entries that were never filled in or were deleted.

The common thread was not just "no one signed off" — it's that **nothing automatically checked whether the records a case relied on were even consistent with each other.**

## What MissingGuard does

MissingGuard does not decide whether a case should be closed, and it does not judge whether an officer lied. It performs one narrow job:

1. **Claim Extractor** — reads the closure report and identifies the central claim (e.g. "confirmed in person", "confirmed by phone").
2. **Evidence Mapper** — gathers the records that should back that claim: identity verification, call logs, photos, location/time data, related system entries.
3. **Semantic Consistency check** — do independent natural-language records actually agree with the claim?
4. **Missing-Evidence check** — does the evidence the claim depends on actually exist?
5. **Temporal / Logical check** — are the dates, times, locations, and case status mutually possible?
6. **Pattern Anomaly check** — unusually fast closures, repeated boilerplate language, or deletions clustered around one officer or time window.
7. **Human Review** — MissingGuard never renders a verdict. It surfaces the specific conflicting records and routes the case to a human supervisor.

## This prototype

This repo is a **static, dependency-free web prototype** of the detection engine (`Claim-Evidence Consistency Engine`, CECE) running against a synthetic dataset. Open `index.html` directly, or visit the GitHub Pages link below — there's no backend, build step, or API key required.

**[Live demo →](https://sbrothers7.github.io/MissingGuard/)**

It includes 10 synthetic cases (no real police data or personal information) covering every error type from the project plan — evidence missing, semantic contradiction, status contradiction, temporal contradiction, officer-level pattern anomaly, a deliberately *hard* ambiguous-but-legitimate negative case, and a clean case — plus a toggle between two of the three models described below, so you can see what the extra checks actually buy you.

This is framed as an **experiment, not just an app** — see Section 7 of the project plan: the real question isn't "can you build a screen," it's "which detection approach actually catches dangerous closures without drowning reviewers in false positives." The prototype compares:

| Model | What it checks |
|---|---|
| A. Rules / Checklist | Required-field baseline only, no AI — "is the evidence present at all?" |
| B. LLM-only | *(roadmap — see below)* Hand the full case record to an LLM and ask if anything looks wrong |
| **C. MissingGuard Hybrid** | Rules + evidence retrieval + semantic consistency + anomaly detection |

The evaluation metrics that matter most are **Recall** and **False Negative Rate** — a system like this is only useful if it doesn't miss the dangerous closures, since a missed case here means a missing person stays missing.

### Note on the current implementation

The "Semantic Consistency" step in this prototype is implemented with structured field comparisons (not a live LLM call), so the whole demo can run as a static page with zero backend and zero API cost. The project plan's roadmap replaces that one function with a real model (Model B / C comparison) once the dataset scales to 500–1,000 synthetic cases — every other check, and the human-in-the-loop output contract, stays the same.

## Project structure

```
index.html        — page shell
assets/style.css  — styling
assets/data.js    — synthetic case dataset (CASES, CLAIM_LABELS, REQUIRED_EVIDENCE)
assets/app.js     — the CECE rule engine + UI rendering
```

## Running locally

No build step needed:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## AI ethics commitments

- MissingGuard never auto-closes or auto-reopens a case — the final decision always stays with a human.
- MissingGuard never accuses an officer of lying — it only shows where records and evidence disagree.
- Only synthetic data is used in this prototype; no real personal information.
- Every flag ships with an explanation of which records conflict and why — not just a risk score.
- The default action on a flag is "request human review," never automatic blocking.

## Roadmap

See the full project plan for the development timeline: synthetic dataset scale-up to 500–1,000 cases, Model A/B/C comparison experiment with Precision/Recall/F1/FPR/FNR per error type, and UI/explainability improvements ahead of the final presentation.
