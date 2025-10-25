export interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime (exclusive)
  priority: number; // higher = more important
}

export interface ConflictInfo {
  existingId: string;
  overlapStart: string;
  overlapEnd: string;
}

export interface BookingDecision {
  conflicts: ConflictInfo[];
  accepted: Booking[]; // zero or more final segments of the candidate
}

/**
 * Decide how to place a candidate booking into a room with existing bookings.
 * Rules:
 * - Only consider same roomId.
 * - Intervals are half-open [start, end).
 * - If candidate.priority > existing.priority → candidate carves out overlap.
 * - If <= → candidate is rejected in that overlap.
 * - Return deterministic, non-overlapping accepted segments.
 */
export function evaluateBooking(existing: Booking[], candidate: Booking): BookingDecision {
  const cStart = Date.parse(candidate.start);
  const cEnd = Date.parse(candidate.end);
  if (isNaN(cStart) || isNaN(cEnd) || cStart >= cEnd)
    throw new Error("Invalid candidate times");

  // Filter to same room
  const relevant = existing.filter(e => e.roomId === candidate.roomId);

  // Detect conflicts (any overlap)
  const conflicts: ConflictInfo[] = [];
  for (const e of relevant) {
    const eStart = Date.parse(e.start);
    const eEnd = Date.parse(e.end);
    if (cStart < eEnd && cEnd > eStart) {
      const overlapStart = Math.max(cStart, eStart);
      const overlapEnd = Math.min(cEnd, eEnd);
      if (overlapStart < overlapEnd)
        conflicts.push({
          existingId: e.id,
          overlapStart: new Date(overlapStart).toISOString(),
          overlapEnd: new Date(overlapEnd).toISOString(),
        });
    }
  }

  // Build forbidden intervals where existing.priority >= candidate.priority
  const forbids: [number, number][] = [];
  for (const e of relevant) {
    if (e.priority >= candidate.priority) {
      const eStart = Date.parse(e.start);
      const eEnd = Date.parse(e.end);
      const s = Math.max(cStart, eStart);
      const t = Math.min(cEnd, eEnd);
      if (s < t) forbids.push([s, t]);
    }
  }

  // Merge forbidden intervals
  forbids.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const f of forbids) {
    if (!merged.length) {
      merged.push([...f]);
      continue;
    }
    const last = merged[merged.length - 1];
    if (f[0] > last[1]) merged.push([...f]);
    else last[1] = Math.max(last[1], f[1]);
  }

  // Subtract forbids from candidate window → accepted segments
  const accepted: Booking[] = [];
  let cursor = cStart, idx = 1;
  for (const [fs, fe] of merged) {
    if (cursor < fs) {
      accepted.push({
        id: `${candidate.id}:part:${idx++}`,
        roomId: candidate.roomId,
        title: candidate.title,
        start: new Date(cursor).toISOString(),
        end: new Date(fs).toISOString(),
        priority: candidate.priority,
      });
    }
    cursor = Math.max(cursor, fe);
  }
  if (cursor < cEnd) {
    accepted.push({
      id: `${candidate.id}:part:${idx++}`,
      roomId: candidate.roomId,
      title: candidate.title,
      start: new Date(cursor).toISOString(),
      end: new Date(cEnd).toISOString(),
      priority: candidate.priority,
    });
  }

  // Sort for determinism
  conflicts.sort((a, b) => a.existingId.localeCompare(b.existingId));
  accepted.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

  return { conflicts, accepted };
}
