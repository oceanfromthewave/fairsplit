export type ExpenseForSettlement = {
  amountCents: number;
  paidById: string;
  participantIds: string[];
};

/** Per-user net balance in cents: positive = should receive, negative = should pay. */
export function computeNetBalances(expenses: ExpenseForSettlement[]): Map<string, number> {
  const net = new Map<string, number>();

  const add = (id: string, delta: number) => {
    net.set(id, (net.get(id) ?? 0) + delta);
  };

  for (const e of expenses) {
    const ids = [...new Set(e.participantIds)].sort();
    const n = ids.length;
    if (n === 0 || e.amountCents <= 0) continue;

    const shares = splitCentsEqually(e.amountCents, n);
    for (let i = 0; i < n; i++) {
      const uid = ids[i]!;
      const share = shares[i]!;
      if (uid === e.paidById) {
        add(uid, e.amountCents - share);
      } else {
        add(uid, -share);
      }
    }
  }

  return net;
}

/** Split total cents across `count` people; sum always equals `total`. */
export function splitCentsEqually(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

export type MemberPaymentAdjustment = {
  fromUserId: string;
  toUserId: string;
  amountWon: number;
};

/** Apply recorded peer payments on top of expense-derived balances (same units as amounts). */
export function applyMemberPayments(
  baseNet: Map<string, number>,
  payments: MemberPaymentAdjustment[],
): Map<string, number> {
  const next = new Map(baseNet);
  for (const p of payments) {
    if (p.amountWon <= 0) continue;
    next.set(p.fromUserId, (next.get(p.fromUserId) ?? 0) + p.amountWon);
    next.set(p.toUserId, (next.get(p.toUserId) ?? 0) - p.amountWon);
  }
  return next;
}

export type Transfer = { fromId: string; toId: string; cents: number };

/** Greedy pairwise settlement (not minimal flow, but clear and deterministic). */
export function simplifyDebts(net: Map<string, number>): Transfer[] {
  const creditors: { id: string; cents: number }[] = [];
  const debtors: { id: string; cents: number }[] = [];

  for (const [id, v] of net) {
    if (v > 0) creditors.push({ id, cents: v });
    else if (v < 0) debtors.push({ id, cents: -v });
  }

  creditors.sort((a, b) => b.cents - a.cents);
  debtors.sort((a, b) => b.cents - a.cents);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const c = creditors[i]!;
    const d = debtors[j]!;
    const pay = Math.min(c.cents, d.cents);
    if (pay > 0) {
      transfers.push({ fromId: d.id, toId: c.id, cents: pay });
    }
    c.cents -= pay;
    d.cents -= pay;
    if (c.cents === 0) i++;
    if (d.cents === 0) j++;
  }

  return transfers;
}
