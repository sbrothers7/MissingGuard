/**
 * Synthetic missing-person case-closure dataset.
 * No real police records, case numbers, or personal data are used anywhere in this file.
 * Each case models a closure report ("claim") plus the evidence records attached to it.
 */

const CLAIM_LABELS = {
  face_to_face: "In-person (face-to-face) verification",
  phone: "Phone verification",
  video_call: "Video-call verification",
  deceased_confirmed: "Deceased — confirmed by coroner",
  returned_home: "Returned home — confirmed by family"
};

const REQUIRED_EVIDENCE = {
  face_to_face: ["biometric_id", "photo_id"],
  phone: ["call_log"],
  video_call: ["call_log", "photo_id"],
  deceased_confirmed: ["death_certificate", "coroner_report"],
  returned_home: ["family_confirmation", "biometric_id"]
};

const CASES = [
  {
    id: "C-001",
    label: "Headline case",
    officer: "OFC-07",
    claim_type: "face_to_face",
    claim_text: "Closure report: “Missing person was met in person and confirmed safe.”",
    opened_date: "2026-03-12",
    closed_date: "2026-03-14",
    closure_duration_days: 2,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "face_to_face", date: "2026-03-14", note: "Officer closure entry: in-person verification." },
      { type: "system_status", source: "Call Center Log B", value: "phone", date: "2026-03-13", note: "Call center record shows contact was by phone, not in person." },
      { type: "biometric_id", source: "Identity Verification System", present: false, date: null, note: "No biometric or photo ID check on file." },
      { type: "location", source: "GPS Ping (subject's phone)", value: "Seoul", date: "2026-03-13T22:00", note: "Last known ping before closure." },
      { type: "location", source: "Officer Closure Report", value: "Busan", date: "2026-03-13T23:30", note: "Officer reports meeting subject in Busan 90 minutes later." }
    ]
  },
  {
    id: "C-002",
    label: "Evidence missing",
    officer: "OFC-14",
    claim_type: "phone",
    claim_text: "Closure report: “Missing person contacted by phone and confirmed safe.”",
    opened_date: "2026-01-04",
    closed_date: "2026-01-05",
    closure_duration_days: 1,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "phone", date: "2026-01-05", note: "Officer closure entry: phone verification." },
      { type: "note", source: "Closure Notes", value: "Confirmed safe, closing case.", date: "2026-01-05", note: "No call log, recording, or carrier record attached." }
    ]
  },
  {
    id: "C-003",
    label: "Semantic contradiction",
    officer: "OFC-21",
    claim_type: "face_to_face",
    claim_text: "Closure report: “Missing person was met in person and confirmed safe.”",
    opened_date: "2026-02-01",
    closed_date: "2026-02-03",
    closure_duration_days: 2,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "face_to_face", date: "2026-02-03", note: "Officer closure entry: in-person verification." },
      { type: "photo_id", source: "Field Photo Upload", present: true, date: "2026-02-03", note: "Photo on file." },
      { type: "system_status", source: "Dispatch Radio Transcript", value: "video_call", date: "2026-02-03", note: "Transcript: “couldn't reach the address, did a video call instead.”" }
    ]
  },
  {
    id: "C-004",
    label: "Status contradiction",
    officer: "OFC-09",
    claim_type: "returned_home",
    claim_text: "Closure report: “Missing person returned home, confirmed by family.”",
    opened_date: "2026-04-10",
    closed_date: "2026-04-11",
    closure_duration_days: 1,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "contacted_alive", date: "2026-04-11", note: "Officer closure entry: subject alive and home." },
      { type: "family_confirmation", source: "Family Statement", present: true, date: "2026-04-11", note: "Family confirmation on file." },
      { type: "system_status", source: "Regional Missing-Persons Database", value: "deceased", date: "2026-04-11", note: "Separate system still lists subject as deceased, found same day." }
    ]
  },
  {
    id: "C-005",
    label: "Temporal contradiction",
    officer: "OFC-33",
    claim_type: "face_to_face",
    claim_text: "Closure report: “Missing person was met in person and confirmed safe.”",
    opened_date: "2026-05-01",
    closed_date: "2026-05-02",
    closure_duration_days: 1,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "face_to_face", date: "2026-05-02", note: "Officer closure entry: in-person verification." },
      { type: "biometric_id", source: "Identity Verification System", present: true, date: "2026-05-04", note: "Biometric check timestamped two days AFTER the case was already closed." }
    ]
  },
  {
    id: "C-006",
    label: "Pattern anomaly",
    officer: "OFC-11",
    claim_type: "phone",
    claim_text: "Closure report: “Confirmed safe. Closing case.”",
    opened_date: "2026-06-01",
    closed_date: "2026-06-01",
    closure_duration_days: 0.1,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "phone", date: "2026-06-01", note: "Officer closure entry: phone verification." },
      { type: "call_log", source: "Carrier Call Record", present: true, date: "2026-06-01", note: "Call log on file, duration 00:00:18." }
    ]
  },
  {
    id: "C-006b",
    label: "Pattern anomaly (sibling case)",
    officer: "OFC-11",
    claim_type: "phone",
    claim_text: "Closure report: “Confirmed safe. Closing case.”",
    opened_date: "2026-06-02",
    closed_date: "2026-06-02",
    closure_duration_days: 0.08,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "phone", date: "2026-06-02", note: "Officer closure entry: phone verification." },
      { type: "call_log", source: "Carrier Call Record", present: true, date: "2026-06-02", note: "Call log on file, duration 00:00:14." }
    ]
  },
  {
    id: "C-006c",
    label: "Pattern anomaly (sibling case)",
    officer: "OFC-11",
    claim_type: "phone",
    claim_text: "Closure report: “Confirmed safe. Closing case.”",
    opened_date: "2026-06-03",
    closed_date: "2026-06-03",
    closure_duration_days: 0.12,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "phone", date: "2026-06-03", note: "Officer closure entry: phone verification." },
      { type: "call_log", source: "Carrier Call Record", present: true, date: "2026-06-03", note: "Call log on file, duration 00:00:21." }
    ]
  },
  {
    id: "C-007",
    label: "Ambiguous legitimate (hard negative)",
    officer: "OFC-18",
    claim_type: "phone",
    claim_text: "Closure report: “Missing person contacted by phone and confirmed safe.”",
    opened_date: "2026-07-01",
    closed_date: "2026-07-04",
    closure_duration_days: 3,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "phone", date: "2026-07-04", note: "Officer closure entry: phone verification." },
      { type: "call_log", source: "Carrier Call Record", present: true, date: null, note: "Call confirmed by carrier, but exact timestamp field was never populated (known system limitation on this carrier's export format)." }
    ]
  },
  {
    id: "C-008",
    label: "Clean / consistent case",
    officer: "OFC-25",
    claim_type: "phone",
    claim_text: "Closure report: “Missing person contacted by phone and confirmed safe.”",
    opened_date: "2026-08-01",
    closed_date: "2026-08-03",
    closure_duration_days: 2,
    records: [
      { type: "system_status", source: "Case Management Log A", value: "phone", date: "2026-08-03", note: "Officer closure entry: phone verification." },
      { type: "call_log", source: "Carrier Call Record", present: true, date: "2026-08-03", note: "Call log on file, duration 00:04:12, matches closure date." },
      { type: "location", source: "GPS Ping (subject's phone)", value: "Daejeon", date: "2026-08-03T09:00", note: "Consistent with family's reported location." }
    ]
  }
];
