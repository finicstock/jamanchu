import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TRPCError } from "@trpc/server";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user-123",
      email: "admin@jamanchu.app",
      name: "관리자",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "normal-user-456",
      email: "user@jamanchu.app",
      name: "일반유저",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("admin.stats", () => {
  it("allows admin to access stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.stats();
    expect(result).toHaveProperty("totalUsers");
    expect(result).toHaveProperty("totalMatches");
    expect(result).toHaveProperty("totalRevenue");
    expect(result).toHaveProperty("activeClones");
    expect(result).toHaveProperty("newUsersToday");
  });

  it("blocks non-admin users from stats", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.stats()).rejects.toThrow(TRPCError);
  });

  it("blocks unauthenticated users from stats", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.stats()).rejects.toThrow(TRPCError);
  });
});

describe("admin.matchStats", () => {
  it("allows admin to access match stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.matchStats();
    expect(result).toHaveProperty("activeChats");
    expect(result).toHaveProperty("completedReports");
    expect(result).toHaveProperty("pendingMatches");
    expect(result).toHaveProperty("averageCompatibility");
    expect(result).toHaveProperty("topTopics");
    expect(result).toHaveProperty("dailyMatches");
    expect(Array.isArray(result.dailyMatches)).toBe(true);
  });

  it("blocks non-admin users from match stats", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.matchStats()).rejects.toThrow(TRPCError);
  });
});

describe("admin.payments", () => {
  it("allows admin to access payment data", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.payments({ page: 1, limit: 20 });
    expect(result).toHaveProperty("payments");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("totalRevenue");
    expect(Array.isArray(result.payments)).toBe(true);
  });

  it("blocks non-admin users from payments", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.payments({ page: 1, limit: 20 })).rejects.toThrow(TRPCError);
  });
});
