# 🧮 Assignment 2 – Meeting Room Conflict Resolver

## 📘 Overview

This assignment implements a **pure TypeScript utility function** that resolves conflicts between room bookings.
It determines whether a new booking can be accepted, partially accepted, or rejected when overlapping with existing bookings.

No API, database, or UI — just a deterministic, testable algorithm.

---

## 🧠 Problem Definition

### Booking Data Model

```ts
export interface Booking {
  id: string;
  roomId: string;
  title: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime (exclusive)
  priority: number; // higher number = more important
}

export interface ConflictInfo {
  existingId: string;
  overlapStart: string;
  overlapEnd: string;
}

export interface BookingDecision {
  conflicts: ConflictInfo[];
  accepted: Booking[]; // zero or more accepted segments of the candidate
}
```

---

## ⚙️ Function Signature

```ts
export function evaluateBooking(existing: Booking[], candidate: Booking): BookingDecision;
```

### Rules

* Only consider bookings for the same `roomId`.
* Intervals are half-open: `[start, end)`.
* **Overlap rule**:

  * If `candidate.priority > existing.priority`: candidate can “carve out” overlap.
  * If `candidate.priority <= existing.priority`: overlap portion is **rejected**.
* Output must be **deterministic** (same input → same output).
* `accepted` must contain **no overlaps**.

---

## 🧩 Implementation Summary

* Filters only relevant existing bookings (same room).
* Detects and reports overlaps.
* Builds "forbidden intervals" where existing bookings block the candidate.
* Subtracts forbidden ranges from candidate window to get accepted segments.
* Merges contiguous segments and returns a deterministic result.

📄 File: [`evaluateBooking.ts`](./evaluateBooking.ts)

---

## 🧪 Test Coverage

📄 File: [`evaluateBooking.test.ts`](./evaluateBooking.test.ts)

| # | Test Case                 | Description                                      |
| - | ------------------------- | ------------------------------------------------ |
| 1 | **No overlap**            | Candidate does not intersect existing booking    |
| 2 | **Partial overlap**       | Candidate has mixed priorities vs existing       |
| 3 | **Full overlap (lower)**  | Candidate fully rejected                         |
| 4 | **Full overlap (higher)** | Candidate fully accepted                         |
| 5 | **Two overlaps**          | Candidate split into multiple accepted segments  |
| 6 | **Edge adjacency**        | Candidate ends when existing starts — no overlap |

---

## 🧱 Folder Structure

```
assignment2/
├── evaluateBooking.ts
├── evaluateBooking.test.ts
└── README.md
```

---

## 🧰 Setup Instructions

### 1️⃣ Install Node + Dependencies

```bash
npm init -y
npm install typescript ts-node @types/node --save-dev
```

### 2️⃣ Create a TypeScript Config

```bash
npx tsc --init
```

*(You can keep defaults or use the one below)*

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## ▶️ Running Tests

### Option 1 — Directly with ts-node

```bash
npx ts-node evaluateBooking.test.ts
```

### Option 2 — Using npm script

Add this to your `package.json`:

```json
"scripts": {
  "test": "ts-node evaluateBooking.test.ts"
}
```

Then run:

```bash
npm test
```

✅ Expected Output:

```
✅ All tests passed
```

---

## ⚡ Example Result

**Input:**

```json
{
  "existing": [
    { "id": "A", "roomId": "R1", "start": "2025-01-01T10:00:00Z", "end": "2025-01-01T11:00:00Z", "priority": 2 }
  ],
  "candidate": {
    "id": "B",
    "roomId": "R1",
    "start": "2025-01-01T10:30:00Z",
    "end": "2025-01-01T11:30:00Z",
    "priority": 1
  }
}
```

**Output:**

```json
{
  "conflicts": [
    {
      "existingId": "A",
      "overlapStart": "2025-01-01T10:30:00.000Z",
      "overlapEnd": "2025-01-01T11:00:00.000Z"
    }
  ],
  "accepted": [
    {
      "id": "B:part:1",
      "roomId": "R1",
      "title": "B",
      "start": "2025-01-01T11:00:00.000Z",
      "end": "2025-01-01T11:30:00.000Z",
      "priority": 1
    }
  ]
}
```

---

## 🧩 Decisions Log

| Area              | Decision                        | Reason                           |
| ----------------- | ------------------------------- | -------------------------------- |
| **Language**      | TypeScript                      | Strong typing and clarity        |
| **Date Handling** | Native `Date.parse`             | Simple and reliable for ISO      |
| **Testing**       | Node `assert` + ts-node         | Lightweight and no external deps |
| **Design**        | Pure function (no side effects) | Deterministic and reusable       |
| **Performance**   | O(N log N) merge process        | Efficient for small N bookings   |

---

## ✅ Deliverables

* `evaluateBooking.ts` — algorithm
* `evaluateBooking.test.ts` — tests
* `README.md` — setup, explanation, and usage

---

**Developed by:** *Nitesh Samuel*
📅 **Assignment 2:** Meeting Room Conflict Resolver
🛠️ **Stack:** TypeScript • Node.js • Pure Functional Logic
