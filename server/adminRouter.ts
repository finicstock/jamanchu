/**
 * Admin Router - 관리자 전용 tRPC 프로시저
 * 사용자 관리, 통계, 결제 내역 등 관리자 기능
 */
import { z } from "zod";
import { adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq, desc, sql, like, or } from "drizzle-orm";

export const adminRouter = router({
  // 전체 통계 조회
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalUsers: 0,
        newUsersToday: 0,
        totalMatches: 0,
        totalRevenue: 0,
        activeClones: 0,
      };
    }

    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [newToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${today}`);

    return {
      totalUsers: userCount?.count ?? 0,
      newUsersToday: newToday?.count ?? 0,
      // Mock data for features not yet backed by tables
      totalMatches: 156,
      totalRevenue: 2450000,
      activeClones: Math.floor((userCount?.count ?? 0) * 0.7),
    };
  }),

  // 사용자 목록 조회
  listUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { users: [], total: 0, page: input.page, limit: input.limit };
      }

      const offset = (input.page - 1) * input.limit;

      let query = db.select().from(users);
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(users);

      if (input.search) {
        const searchPattern = `%${input.search}%`;
        const searchCondition = or(
          like(users.name, searchPattern),
          like(users.email, searchPattern)
        );
        query = query.where(searchCondition) as typeof query;
        countQuery = countQuery.where(searchCondition) as typeof countQuery;
      }

      const [totalResult] = await countQuery;
      const userList = await query
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(offset);

      return {
        users: userList.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          loginMethod: u.loginMethod,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
        })),
        total: totalResult?.count ?? 0,
        page: input.page,
        limit: input.limit,
      };
    }),

  // 사용자 역할 변경
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  // 최근 가입자 목록
  recentUsers: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    return result.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      lastSignedIn: u.lastSignedIn,
    }));
  }),

  // Mock: 결제 내역 (실제 결제 테이블 구현 전 목업)
  payments: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      // Mock payment data
      const mockPayments = [
        { id: 1, userName: "별빛산책자", amount: 9900, method: "카카오페이", product: "하트 10개", status: "완료", date: new Date("2026-05-11T14:30:00") },
        { id: 2, userName: "도시의밤", amount: 29900, method: "토스페이", product: "프리미엄 구독", status: "완료", date: new Date("2026-05-11T12:15:00") },
        { id: 3, userName: "커피향기", amount: 4900, method: "카드결제", product: "하트 5개", status: "완료", date: new Date("2026-05-11T10:00:00") },
        { id: 4, userName: "바다소리", amount: 9900, method: "구글페이", product: "하트 10개", status: "완료", date: new Date("2026-05-10T22:45:00") },
        { id: 5, userName: "숲속여행", amount: 29900, method: "토스페이", product: "프리미엄 구독", status: "완료", date: new Date("2026-05-10T18:30:00") },
        { id: 6, userName: "하늘빛", amount: 4900, method: "카카오페이", product: "하트 5개", status: "환불", date: new Date("2026-05-10T15:00:00") },
        { id: 7, userName: "달빛정원", amount: 49900, method: "카드결제", product: "하트 50개", status: "완료", date: new Date("2026-05-10T11:20:00") },
        { id: 8, userName: "봄날의꿈", amount: 9900, method: "카카오페이", product: "하트 10개", status: "완료", date: new Date("2026-05-09T20:10:00") },
      ];

      return {
        payments: mockPayments.slice((input.page - 1) * input.limit, input.page * input.limit),
        total: mockPayments.length,
        totalRevenue: mockPayments.filter(p => p.status === "완료").reduce((sum, p) => sum + p.amount, 0),
      };
    }),

  // Mock: 매칭 현황
  matchStats: adminProcedure.query(async () => {
    return {
      activeChats: 42,
      completedReports: 89,
      pendingMatches: 23,
      averageCompatibility: 78.5,
      topTopics: ["여행", "음악", "영화", "요리", "독서"],
      dailyMatches: [
        { date: "05/06", count: 12 },
        { date: "05/07", count: 18 },
        { date: "05/08", count: 15 },
        { date: "05/09", count: 22 },
        { date: "05/10", count: 19 },
        { date: "05/11", count: 25 },
        { date: "05/12", count: 21 },
      ],
    };
  }),
});
