import { describe, expect, it } from "vitest";
import {
  applyMemberPayments,
  computeNetBalances,
  simplifyDebts,
  splitCentsEqually,
} from "@/lib/settlement";

describe("splitCentsEqually", () => {
  it("distributes remainder", () => {
    expect(splitCentsEqually(100, 3)).toEqual([34, 33, 33]);
    expect(splitCentsEqually(5, 2)).toEqual([3, 2]);
  });
});

describe("computeNetBalances", () => {
  it("balances a simple two-person split", () => {
    const net = computeNetBalances([
      { amountCents: 10000, paidById: "a", participantIds: ["a", "b"] },
    ]);
    expect(net.get("a")).toBe(5000);
    expect(net.get("b")).toBe(-5000);
  });

  it("handles multiple expenses", () => {
    const net = computeNetBalances([
      { amountCents: 100, paidById: "a", participantIds: ["a", "b"] },
      { amountCents: 100, paidById: "b", participantIds: ["a", "b"] },
    ]);
    expect(net.get("a")).toBe(0);
    expect(net.get("b")).toBe(0);
  });
});

describe("simplifyDebts", () => {
  it("produces minimal transfers", () => {
    const net = new Map<string, number>([
      ["a", 5000],
      ["b", -5000],
    ]);
    expect(simplifyDebts(net)).toEqual([{ fromId: "b", toId: "a", cents: 5000 }]);
  });
});

describe("applyMemberPayments", () => {
  it("reduces balances after a recorded payment", () => {
    const base = new Map<string, number>([
      ["a", 5000],
      ["b", -5000],
    ]);
    const adjusted = applyMemberPayments(base, [{ fromUserId: "b", toUserId: "a", amountWon: 5000 }]);
    expect(adjusted.get("a")).toBe(0);
    expect(adjusted.get("b")).toBe(0);
  });
});
