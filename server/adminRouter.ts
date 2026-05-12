/**
 * Admin Router - 관리자 전용 tRPC 프로시저
 * 사용자 관리, 통계, 결제 내역, 하트 부여 등 관리자 기능
 */
import { z } from "zod";
import { adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users, userHearts, heartTransactions } from "../drizzle/schema";
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

    // 하트 거래 기반 매출 집계
    const [revenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${heartTransactions.amount}), 0)` })
      .from(heartTransactions)
      .where(eq(heartTransactions.type, "purchase"));

    return {
      totalUsers: userCount?.count ?? 0,
      newUsersToday: newToday?.count ?? 0,
      totalMatches: 0,
      totalRevenue: revenueResult?.total ?? 0,
      activeClones: 0,
    };
  }),

  // 사용자 목록 조회 (하트 잔액 포함)
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

      // 각 사용자의 하트 잔액 조회
      const userIds = userList.map((u) => u.id);
      let heartsMap: Record<number, number> = {};
      if (userIds.length > 0) {
        const hearts = await db
          .select()
          .from(userHearts)
          .where(sql`${userHearts.userId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`);
        hearts.forEach((h) => {
          heartsMap[h.userId] = h.balance;
        });
      }

      return {
        users: userList.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          loginMethod: u.loginMethod,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
          heartBalance: heartsMap[u.id] ?? 0,
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

  // 하트 부여
  grantHearts: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        amount: z.number().min(1).max(10000),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // 대상 사용자 존재 검증
      const [targetUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!targetUser) {
        throw new Error("해당 사용자를 찾을 수 없습니다.");
      }

      // 현재 잔액 조회
      const [existing] = await db
        .select()
        .from(userHearts)
        .where(eq(userHearts.userId, input.userId))
        .limit(1);

      // 잔액 업데이트 + 거래 내역 기록 (순차 실행, 에러 시 throw)
      if (existing) {
        await db
          .update(userHearts)
          .set({ balance: existing.balance + input.amount })
          .where(eq(userHearts.userId, input.userId));
      } else {
        await db.insert(userHearts).values({
          userId: input.userId,
          balance: input.amount,
        });
      }

      await db.insert(heartTransactions).values({
        userId: input.userId,
        amount: input.amount,
        type: "admin_grant",
        description: input.description || `관리자가 하트 ${input.amount}개 부여`,
        adminId: ctx.user.id,
      });

      return {
        success: true,
        newBalance: (existing?.balance ?? 0) + input.amount,
      };
    }),

  // 특정 사용자의 하트 거래 내역 조회
  userHeartHistory: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { transactions: [], balance: 0 };

      const [heartRecord] = await db
        .select()
        .from(userHearts)
        .where(eq(userHearts.userId, input.userId))
        .limit(1);

      const transactions = await db
        .select()
        .from(heartTransactions)
        .where(eq(heartTransactions.userId, input.userId))
        .orderBy(desc(heartTransactions.createdAt))
        .limit(input.limit);

      return {
        balance: heartRecord?.balance ?? 0,
        transactions: transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          description: t.description,
          createdAt: t.createdAt,
        })),
      };
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

  // 결제 내역 (실제 결제 테이블 구현 전 - 빈 데이터 반환)
  payments: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async () => {
      return {
        payments: [] as Array<{
          id: number;
          userName: string;
          amount: number;
          method: string;
          product: string;
          status: string;
          date: Date;
        }>,
        total: 0,
        totalRevenue: 0,
      };
    }),

  // 매칭 현황 (실제 매칭 테이블 구현 전 - 빈 데이터 반환)
  matchStats: adminProcedure.query(async () => {
    return {
      activeChats: 0,
      completedReports: 0,
      pendingMatches: 0,
      averageCompatibility: 0,
      topTopics: [] as string[],
      dailyMatches: [] as Array<{ date: string; count: number }>,
    };
  }),
});
