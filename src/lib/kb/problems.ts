// The problems inside one merged ticket. A problem is a cause (causes.ts), except that reports the
// desk read as a one-day move (desk-notes.json) are a different bug: the date is off by a day, not
// flipped. They are counted there, not under the cause their tenant would give them.
import { causeOf, uniqueById, type Cause, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

export type Problem = 'parser' | 'hint' | 'one-day-move' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
};

export function problemOf(r: Report, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day-move';
  const cause: Cause | null = causeOf(r, tenantOf(r));
  return cause ?? 'unplaced';
}

// `raw` is the export as it came: pages overlap, so the same id can come twice.
export function splitTicket(raw: Report[], ticket: number, oneDayMove: readonly string[]) {
  const unique = uniqueById(raw);
  const merged = unique.filter((r) => r.mergedInto === ticket);
  const byProblem = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, oneDayMove);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  const groups: ProblemGroup[] = [...byProblem.entries()]
    .map(([problem, reports]) => {
      const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports,
        tenants: [...new Set(reports.map((r) => r.tenant))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { exportedRows: raw.length, duplicates: raw.length - unique.length, merged: merged.length, groups };
}
