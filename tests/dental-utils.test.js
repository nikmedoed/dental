import test from "node:test";
import assert from "node:assert/strict";
import {
  dentalStatistics,
  toothStateByTooth,
  toothEntries,
  sortEvents,
  formatDate,
  validateBackup,
} from "../src/lib/dental-utils.js";
const e = (id, date, kind, status, tooth = 16, extra = {}) => ({
  id,
  date,
  kind,
  status,
  tooth,
  title: id,
  ...extra,
});
test("all 32 positions counted once, unrecorded teeth are unknown", () => {
  const groups = dentalStatistics([]);
  assert.equal(groups.find((g) => g.key === "unknown").teeth.length, 32);
  assert.equal(groups.find((g) => g.key === "healthy").teeth.length, 0);
});
test("treatment history and current problems form separate groups", () => {
  const events = [
    e("a", "2026-01-01", "filling", "treated"),
    e("b", "2026-02-01", "diagnosis", "issue"),
    e("c", "2026-02-01", "diagnosis", "issue", 17),
    e("d", "2026-02-01", "diagnosis", "healthy", 18),
    e("e", "2026-02-01", "filling", "treated", 21),
    e("f", "2026-02-01", "extraction", "missing", 22),
  ];
  const groups = dentalStatistics(events);
  for (const [key, tooth] of [
    ["treated-issue", 16],
    ["untreated-issue", 17],
    ["healthy", 18],
    ["treated", 21],
    ["missing", 22],
  ])
    assert.deepEqual(groups.find((g) => g.key === key).teeth, [tooth]);
  assert.equal(new Set(groups.flatMap((g) => g.teeth)).size, 32);
  assert.equal(groups.flatMap((g) => g.teeth).length, 32);
});
test("resolving complaint preserves clinical issue and earlier treatment", () => {
  const events = [
    e("a", "2026-01-01", "filling", "treated"),
    e("b", "2026-02-01", "diagnosis", "issue"),
    e("c", "2026-03-01", "complaint", "complaint"),
    e("d", "2026-04-01", "complaint_resolved", "resolved"),
  ];
  const state = toothStateByTooth(events)[16];
  assert.equal(state.condition, "issue");
  assert.equal(state.hasTreatment, true);
  assert.equal(state.complaintActive, false);
});
test("hygiene does not turn unknown teeth into treated or clear issues", () => {
  assert.equal(
    toothStateByTooth([e("a", "2026-01-01", "hygiene", "treated")])[16]
      .hasTreatment,
    false,
  );
  assert.equal(
    toothStateByTooth([
      e("a", "2026-01-01", "diagnosis", "issue"),
      e("b", "2026-02-01", "hygiene", "treated"),
    ])[16].condition,
    "issue",
  );
});
test("same-day ordering uses creation timestamp, not cloud document order", () => {
  const a = e("a", "2026-01-01", "complaint", "complaint", 16, {
    createdAt: "2026-01-01T09:00:00Z",
  });
  const b = e("b", "2026-01-01", "complaint_resolved", "resolved", 16, {
    createdAt: "2026-01-01T10:00:00Z",
  });
  assert.equal(sortEvents([a, b])[0].id, "b");
  assert.equal(toothStateByTooth([a, b])[16].complaintActive, false);
});
test("history-only entries cannot alter current state", () => {
  const entries = [
    e("a", "2026-01-01", "diagnosis", "healthy"),
    e("b", "2026-02-01", "diagnosis", "issue", 16, { affectsStatus: false }),
  ];
  assert.equal(toothStateByTooth(entries)[16].condition, "healthy");
  assert.equal(toothEntries(entries, 16).length, 2);
});
test("legacy string tooth numbers and missing surfaces render safely", () => {
  const result = toothEntries(
    [
      {
        id: "x",
        date: "2026-01-01",
        items: [{ tooth: "16", status: "healthy" }],
      },
    ],
    16,
  );
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].surfaces, []);
});
test("latest structural transition wins, later symptom does not restore removed tooth", () => {
  const events = [
    e("a", "2026-01-01", "extraction", "missing"),
    e("b", "2026-02-01", "implant", "implant"),
    e("c", "2026-03-01", "complaint", "complaint"),
  ];
  assert.equal(toothStateByTooth(events)[16].structure, "implant");
  assert.equal(
    toothStateByTooth([
      ...events,
      e("d", "2026-04-01", "extraction", "missing"),
    ])[16].structure,
    "missing",
  );
});
test("invalid dates do not crash rendering and invalid imports are rejected", () => {
  assert.equal(formatDate("broken"), "Дата неизвестна");
  assert.equal(formatDate("2026-02-30"), "Дата неизвестна");
  assert.equal(formatDate("2020-00-00"), "2020 год");
  assert.throws(() =>
    validateBackup({ events: [e("a", "2026-02-30", "diagnosis", "healthy")] }),
  );
  assert.throws(() =>
    validateBackup({
      events: [e("a", "2026-02-01", "diagnosis", "healthy", 99)],
    }),
  );
  assert.doesNotThrow(() =>
    validateBackup({ events: [e("a", "2026-02-01", "diagnosis", "healthy")] }),
  );
});
