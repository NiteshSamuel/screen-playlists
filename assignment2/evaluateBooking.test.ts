import assert from "assert";
import { evaluateBooking, Booking } from "./evaluateBooking";

function at(min: number) {
  const base = Date.UTC(2025, 0, 1, 0, 0, 0);
  return new Date(base + min * 60_000).toISOString();
}
const mk = (id: string, room: string, s: number, e: number, p: number): Booking => ({
  id, roomId: room, title: id, start: at(s), end: at(e), priority: p
});

// 1) No overlap
(() => {
  const existing = [mk("e1", "r1", 0, 30, 1)];
  const cand = mk("c1", "r1", 30, 60, 1);
  const r = evaluateBooking(existing, cand);
  assert.equal(r.conflicts.length, 0);
  assert.equal(r.accepted.length, 1);
})();

// 2) Partial overlaps with various priorities
(() => {
  const existing = [
    mk("low", "r1", 0, 20, 0),
    mk("eq",  "r1", 20, 30, 1),
    mk("hi",  "r1", 30, 40, 2)
  ];
  const cand = mk("c2", "r1", 10, 50, 1);
  const r = evaluateBooking(existing, cand);
  // forbidden [20,40) → accepted [10,20) + [40,50)
  assert.deepStrictEqual(
    r.accepted.map(a => [a.start, a.end]),
    [[at(10), at(20)], [at(40), at(50)]]
  );
})();

// 3) Full overlap blocked
(() => {
  const existing = [mk("e", "r1", 0, 60, 2)];
  const cand = mk("c3", "r1", 10, 50, 1);
  const r = evaluateBooking(existing, cand);
  assert.equal(r.accepted.length, 0);
})();

// 4) Full overlap allowed (higher priority)
(() => {
  const existing = [mk("e", "r1", 0, 60, 1)];
  const cand = mk("c4", "r1", 10, 50, 2);
  const r = evaluateBooking(existing, cand);
  assert.equal(r.accepted.length, 1);
})();

// 5) Two overlaps
(() => {
  const existing = [
    mk("a", "r1", 10, 30, 2),
    mk("b", "r1", 40, 60, 2)
  ];
  const cand = mk("c5", "r1", 0, 100, 1);
  const r = evaluateBooking(existing, cand);
  assert.deepStrictEqual(
    r.accepted.map(a => [a.start, a.end]),
    [[at(0), at(10)], [at(30), at(40)], [at(60), at(100)]]
  );
})();

// 6) Edge adjacency (no overlap)
(() => {
  const existing = [mk("e", "r1", 60, 90, 1)];
  const cand = mk("c6", "r1", 30, 60, 1);
  const r = evaluateBooking(existing, cand);
  assert.equal(r.conflicts.length, 0);
  assert.equal(r.accepted.length, 1);
})();

console.log("✅ All tests passed");
