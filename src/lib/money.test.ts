import { describe, expect, it } from "vitest";
import { parseWonInput } from "@/lib/money";

describe("parseWonInput", () => {
  it("parses whole won", () => {
    expect(parseWonInput("12000")).toBe(12000);
    expect(parseWonInput("1")).toBe(1);
  });
  it("allows comma separators", () => {
    expect(parseWonInput("12,000")).toBe(12000);
  });
  it("rejects invalid", () => {
    expect(parseWonInput("")).toBeNull();
    expect(parseWonInput("12.5")).toBeNull();
    expect(parseWonInput("abc")).toBeNull();
  });
});
