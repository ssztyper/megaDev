// The problems inside one merged ticket. A problem is a cause (causes.ts). Reports the desk read as a
// one-day move (desk-notes.json) are counted where they are filed, under their cause, and footnoted:
// that is how the desk counts, as exported.
import { causeOf, uniqueById, type Cause, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

export type Problem = Cause | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  readAsMove: number;
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
};

export function problemOf(r: Report): Problem {
  const cause: Cause | null = causeOf(r, tenantOf(r));
  return cause ?? 'unplaced';
}

// `raw` is the export as it came: pages overlap, so the same id can come twice.
export function splitTicket(raw: Report[], ticket: number, oneDayMove: readonly string[]) {
  const unique = uniqueById(raw);
  const merged = unique.filter((r) => r.mergedInto === ticket);
  const byProblem = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  const groups: ProblemGroup[] = [...byProblem.entries()]
    .map(([problem, reports]) => {
      const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports,
        readAsMove: reports.filter((r) => oneDayMove.includes(r.id)).length,
        tenants: [...new Set(reports.map((r) => r.tenant))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { exportedRows: raw.length, duplicates: raw.length - unique.length, merged: merged.length, groups };
}
