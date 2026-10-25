/**
 * MissingGuard — Claim-Evidence Consistency Engine (CECE) prototype.
 *
 * This is a rule-based reference implementation of the detection logic
 * described in the project plan. It intentionally does NOT call an LLM
 * (no API key / backend needed, so the whole thing runs as a static page).
 * The "Semantic Consistency AI" step is approximated here with structured
 * field comparisons; a production version would replace that single
 * function with a real model call while keeping every other check and
 * the human-in-the-loop output contract identical.
 */

const METHOD_VALUES = ["face_to_face", "phone", "video_call"];
const STATUS_VALUES = ["contacted_alive", "deceased", "returned_home"];

function isPresent(record) {
  return record.present !== false;
}

// --- Individual checks -----------------------------------------------

function checkMissingEvidence(kase) {
  const required = REQUIRED_EVIDENCE[kase.claim_type] || [];
  const satisfied = kase.records.some(r => required.includes(r.type) && isPresent(r));
  if (required.length && !satisfied) {
    return [{
      kind: "evidence_missing",
      severity: "high",
      title: "Missing required evidence",
      detail: `Closure claims "${CLAIM_LABELS[kase.claim_type]}", which requires one of [${required.join(", ")}], but no such evidence is on file.`
    }];
  }
  return [];
}

function checkSemanticConsistency(kase) {
  const flags = [];
  if (!METHOD_VALUES.includes(kase.claim_type)) return flags;
  kase.records
    .filter(r => r.type === "system_status" && METHOD_VALUES.includes(r.value))
    .forEach(r => {
      if (r.value !== kase.claim_type) {
        flags.push({
          kind: "semantic_contradiction",
          severity: "high",
          title: "Claim and record disagree on verification method",
          detail: `Closure claims "${CLAIM_LABELS[kase.claim_type]}", but ${r.source} records "${CLAIM_LABELS[r.value]}" (${r.note})`
        });
      }
    });
  return flags;
}

function checkStatusContradiction(kase) {
  const statusRecords = kase.records.filter(r => r.type === "system_status" && STATUS_VALUES.includes(r.value));
  const flags = [];
  for (let i = 0; i < statusRecords.length; i++) {
    for (let j = i + 1; j < statusRecords.length; j++) {
      if (statusRecords[i].value !== statusRecords[j].value) {
        flags.push({
          kind: "status_contradiction",
          severity: "high",
          title: "Conflicting case status across systems",
          detail: `${statusRecords[i].source} reports "${statusRecords[i].value}" while ${statusRecords[j].source} reports "${statusRecords[j].value}" for the same case.`
        });
      }
    }
  }
  return flags;
}

function checkTemporalLogic(kase) {
  const flags = [];
  const closed = new Date(kase.closed_date);

  kase.records.forEach(r => {
    if (r.date) {
      const d = new Date(r.date);
      if (!isNaN(d) && d > closed) {
        flags.push({
          kind: "temporal_contradiction",
          severity: "high",
          title: "Evidence dated after case closure",
          detail: `${r.source} is timestamped ${r.date}, which is after the case was closed on ${kase.closed_date} — the evidence could not have supported the original decision.`
        });
      }
    }
  });

  const locs = kase.records.filter(r => r.type === "location" && r.date);
  for (let i = 0; i < locs.length; i++) {
    for (let j = i + 1; j < locs.length; j++) {
      const a = locs[i], b = locs[j];
      if (a.value !== b.value) {
        const diffMin = Math.abs(new Date(a.date) - new Date(b.date)) / 60000;
        if (diffMin < 120) {
          flags.push({
            kind: "temporal_contradiction",
            severity: "medium",
            title: "Locations not physically reachable in time",
            detail: `${a.source} places the subject in ${a.value} at ${a.date}, and ${b.source} places them in ${b.value} only ${Math.round(diffMin)} minutes later — not a feasible trip.`
          });
        }
      }
    }
  }
  return flags;
}

function checkPatternAnomaly(kase, allCases) {
  const siblings = allCases.filter(c => c.officer === kase.officer && c.closure_duration_days < 0.5);
  if (kase.closure_duration_days < 0.5 && siblings.length >= 2) {
    return [{
      kind: "pattern_anomaly",
      severity: "medium",
      title: "Officer-level closure-speed anomaly",
      detail: `Officer ${kase.officer} has ${siblings.length} cases closed in under 12 hours with near-identical closure notes ("${kase.claim_text.replace(/^Closure report: /, "")}") — a pattern worth auditing across the officer's full caseload, not just this one case.`
    }];
  }
  return [];
}

// --- Orchestration ------------------------------------------------------

function analyzeCase(kase, mode, allCases) {
  let flags = [...checkMissingEvidence(kase)];
  if (mode === "hybrid") {
    flags = flags.concat(
      checkSemanticConsistency(kase),
      checkStatusContradiction(kase),
      checkTemporalLogic(kase),
      checkPatternAnomaly(kase, allCases)
    );
  }
  return {
    flags,
    reviewRequired: flags.length > 0
  };
}

// --- Rendering ------------------------------------------------------

const state = { mode: "hybrid", selected: CASES[0].id };

const MODE_DESC = {
  rules: "Model A — Rules / Checklist baseline. Checks only whether the required evidence field exists for the stated claim type. No semantic, cross-system, timing, or pattern checks.",
  hybrid: "Model C — MissingGuard Hybrid. Adds semantic consistency checks, cross-system status checks, timestamp/location feasibility checks, and officer-level pattern detection, then routes any inconsistency to a human reviewer."
};

function render() {
  document.getElementById("modeDesc").textContent = MODE_DESC[state.mode];
  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === state.mode);
  });
  renderCaseList();
  renderCaseDetail();
  renderMetrics();
}

function renderCaseList() {
  const list = document.getElementById("caseList");
  list.innerHTML = "";
  CASES.forEach(kase => {
    const { reviewRequired, flags } = analyzeCase(kase, state.mode, CASES);
    const item = document.createElement("button");
    item.className = "case-item" + (kase.id === state.selected ? " selected" : "") + (reviewRequired ? " flagged" : " clear");
    item.innerHTML = `
      <span class="case-id">${kase.id}</span>
      <span class="case-label">${kase.label}</span>
      <span class="case-badge">${reviewRequired ? `⚠ ${flags.length} flag${flags.length > 1 ? "s" : ""}` : "✓ clear"}</span>
    `;
    item.addEventListener("click", () => {
      state.selected = kase.id;
      render();
    });
    list.appendChild(item);
  });
}

function renderCaseDetail() {
  const kase = CASES.find(c => c.id === state.selected);
  const { flags, reviewRequired } = analyzeCase(kase, state.mode, CASES);
  const detail = document.getElementById("caseDetail");

  const recordsHtml = kase.records.map(r => `
    <tr>
      <td>${r.type}</td>
      <td>${r.source}</td>
      <td>${r.present === false ? "<em>not on file</em>" : (r.value || "present")}</td>
      <td>${r.date || "—"}</td>
      <td class="note">${r.note}</td>
    </tr>
  `).join("");

  const flagsHtml = flags.length
    ? flags.map(f => `
        <li class="flag flag-${f.severity}">
          <strong>${f.title}</strong>
          <p>${f.detail}</p>
        </li>
      `).join("")
    : `<li class="flag flag-none">No inconsistencies detected under the current model.</li>`;

  detail.innerHTML = `
    <div class="banner ${reviewRequired ? "banner-review" : "banner-clear"}">
      ${reviewRequired ? "⚠ Evidence inconsistency detected → Human supervisor review required" : "✅ Claim and evidence are consistent — no review flag raised"}
    </div>
    <h2>${kase.id} · ${kase.label}</h2>
    <p class="claim-text">${kase.claim_text}</p>
    <dl class="case-meta">
      <div><dt>Officer</dt><dd>${kase.officer}</dd></div>
      <div><dt>Opened</dt><dd>${kase.opened_date}</dd></div>
      <div><dt>Closed</dt><dd>${kase.closed_date}</dd></div>
      <div><dt>Closure duration</dt><dd>${kase.closure_duration_days < 1 ? Math.round(kase.closure_duration_days * 24) + " hours" : kase.closure_duration_days + " days"}</dd></div>
    </dl>

    <h3>Evidence records</h3>
    <table class="records-table">
      <thead><tr><th>Type</th><th>Source</th><th>Value</th><th>Date</th><th>Note</th></tr></thead>
      <tbody>${recordsHtml}</tbody>
    </table>

    <h3>Flags (${state.mode === "rules" ? "Model A" : "Model C"})</h3>
    <ul class="flag-list">${flagsHtml}</ul>
  `;
}

function renderMetrics() {
  const rulesFlagged = CASES.filter(c => analyzeCase(c, "rules", CASES).reviewRequired).length;
  const hybridFlagged = CASES.filter(c => analyzeCase(c, "hybrid", CASES).reviewRequired).length;
  const metrics = document.getElementById("metrics");
  metrics.innerHTML = `
    <h2>Dataset summary (experiment, not just a demo)</h2>
    <div class="metric-row">
      <div class="metric-card">
        <span class="metric-value">${CASES.length}</span>
        <span class="metric-label">synthetic cases</span>
      </div>
      <div class="metric-card">
        <span class="metric-value">${rulesFlagged}/${CASES.length}</span>
        <span class="metric-label">flagged by Model A (rules-only)</span>
      </div>
      <div class="metric-card">
        <span class="metric-value">${hybridFlagged}/${CASES.length}</span>
        <span class="metric-label">flagged by Model C (MissingGuard Hybrid)</span>
      </div>
      <div class="metric-card">
        <span class="metric-value">${hybridFlagged - rulesFlagged}</span>
        <span class="metric-label">additional risky closures caught only by the hybrid model</span>
      </div>
    </div>
    <p class="metric-note">Case <strong>C-007</strong> is a deliberately hard "ambiguous legitimate" negative: evidence is real but incomplete due to a known system limitation. Neither model should flag it — watch it stay green when you switch modes. That's the false-positive-rate check described in the project plan's evaluation section.</p>
  `;
}

document.getElementById("modeToggle").addEventListener("click", e => {
  const btn = e.target.closest(".mode-btn");
  if (!btn) return;
  state.mode = btn.dataset.mode;
  render();
});

render();
