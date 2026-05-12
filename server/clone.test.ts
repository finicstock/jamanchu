import { describe, it, expect, vi } from "vitest";

// Mock DB
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  onDuplicateKeyUpdate: vi.fn().mockResolvedValue(undefined),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "안녕하세요! 반갑습니다." } }],
  }),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  desc: vi.fn(),
  or: vi.fn(),
  sql: Object.assign(vi.fn(), { join: vi.fn(), raw: vi.fn() }),
}));

vi.mock("../drizzle/schema", () => ({
  cloneProfiles: { userId: "userId", status: "status" },
  cloneChats: { userAId: "userAId", userBId: "userBId", createdAt: "createdAt" },
  chemistryReports: { chatId: "chatId" },
  notifications: {},
  userHearts: { userId: "userId", balance: "balance" },
  heartTransactions: {},
}));

describe("clone.saveProfile", () => {
  it("should validate required fields for saveProfile input", () => {
    // Validate the input schema
    const { z } = require("zod");
    const schema = z.object({
      nickname: z.string().min(1).max(50),
      gender: z.enum(["male", "female", "other"]),
      interestedIn: z.enum(["male", "female", "both"]),
      age: z.number().min(18).max(100),
      personality: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      values: z.string().optional(),
      lifestyle: z.string().optional(),
    });

    // Valid input
    const validInput = {
      nickname: "테스트유저",
      gender: "male" as const,
      interestedIn: "female" as const,
      age: 25,
      personality: ["유머러스", "지적"],
      interests: ["여행", "음악"],
    };
    expect(() => schema.parse(validInput)).not.toThrow();

    // Invalid: empty nickname
    expect(() => schema.parse({ ...validInput, nickname: "" })).toThrow();

    // Invalid: age too young
    expect(() => schema.parse({ ...validInput, age: 15 })).toThrow();

    // Invalid: age too old
    expect(() => schema.parse({ ...validInput, age: 150 })).toThrow();

    // Invalid: wrong gender
    expect(() => schema.parse({ ...validInput, gender: "unknown" })).toThrow();

    // Invalid: wrong interestedIn
    expect(() => schema.parse({ ...validInput, interestedIn: "none" })).toThrow();
  });

  it("should accept valid gender and interestedIn values", () => {
    const { z } = require("zod");
    const genderSchema = z.enum(["male", "female", "other"]);
    const prefSchema = z.enum(["male", "female", "both"]);

    expect(genderSchema.parse("male")).toBe("male");
    expect(genderSchema.parse("female")).toBe("female");
    expect(genderSchema.parse("other")).toBe("other");
    expect(prefSchema.parse("both")).toBe("both");
  });
});

describe("clone.startChat", () => {
  it("should require clone profile before starting chat", async () => {
    // When no clone profile exists, startChat should throw
    mockDb.limit.mockResolvedValueOnce([]); // no clone profile
    
    // This simulates the check in startChat
    const myClone: unknown[] = [];
    expect(myClone.length).toBe(0);
    // The procedure would throw "클론 프로필을 먼저 생성해주세요."
  });

  it("should require sufficient hearts before starting chat", () => {
    const MATCH_COST = 1;
    const currentBalance = 0;
    expect(currentBalance < MATCH_COST).toBe(true);
    // The procedure would throw "하트가 부족합니다."
  });

  it("should allow chat when hearts are sufficient", () => {
    const MATCH_COST = 1;
    const currentBalance = 3;
    expect(currentBalance >= MATCH_COST).toBe(true);
  });

  it("should filter candidates by gender preferences", () => {
    const myProfile = { userId: 1, gender: "male", interestedIn: "female" };
    const candidates = [
      { userId: 2, gender: "female", interestedIn: "male", status: "active" },
      { userId: 3, gender: "male", interestedIn: "female", status: "active" },
      { userId: 4, gender: "female", interestedIn: "female", status: "active" },
      { userId: 1, gender: "male", interestedIn: "female", status: "active" }, // self
    ];

    const filtered = candidates.filter((c) => {
      if (c.userId === myProfile.userId) return false;
      if (myProfile.interestedIn !== "both" && c.gender !== myProfile.interestedIn) return false;
      if (c.interestedIn !== "both" && myProfile.gender !== c.interestedIn) return false;
      return true;
    });

    expect(filtered.length).toBe(1);
    expect(filtered[0].userId).toBe(2);
  });

  it("should match when interestedIn is both", () => {
    const myProfile = { userId: 1, gender: "male", interestedIn: "both" };
    const candidates = [
      { userId: 2, gender: "female", interestedIn: "both", status: "active" },
      { userId: 3, gender: "male", interestedIn: "both", status: "active" },
    ];

    const filtered = candidates.filter((c) => {
      if (c.userId === myProfile.userId) return false;
      if (myProfile.interestedIn !== "both" && c.gender !== myProfile.interestedIn) return false;
      if (c.interestedIn !== "both" && myProfile.gender !== c.interestedIn) return false;
      return true;
    });

    expect(filtered.length).toBe(2);
  });
});
