import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { userHearts, heartTransactions, cloneProfiles, notifications } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const profileRouter = router({
  // 마이페이지 전체 정보 조회
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const userId = ctx.user.id;

    // 하트 잔액
    const heartsResult = await db
      .select()
      .from(userHearts)
      .where(eq(userHearts.userId, userId))
      .limit(1);
    const heartBalance = heartsResult[0]?.balance ?? 0;

    // 최근 하트 거래 내역 (최근 10건)
    const recentTransactions = await db
      .select()
      .from(heartTransactions)
      .where(eq(heartTransactions.userId, userId))
      .orderBy(desc(heartTransactions.createdAt))
      .limit(10);

    // 클론 프로필
    const cloneResult = await db
      .select()
      .from(cloneProfiles)
      .where(eq(cloneProfiles.userId, userId))
      .limit(1);
    const clone = cloneResult[0] ?? null;

    // 읽지 않은 알림 수
    const unreadNotifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));
    const unreadCount = unreadNotifs.filter(n => n.isRead === 0).length;

    return {
      user: {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        role: ctx.user.role,
        createdAt: ctx.user.createdAt,
        lastSignedIn: ctx.user.lastSignedIn,
      },
      hearts: {
        balance: heartBalance,
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          description: t.description,
          createdAt: t.createdAt,
        })),
      },
      clone: clone ? {
        id: clone.id,
        nickname: clone.nickname,
        gender: clone.gender,
        interestedIn: clone.interestedIn,
        age: clone.age,
        personality: clone.personality,
        interests: clone.interests,
        status: clone.status,
        createdAt: clone.createdAt,
      } : null,
      unreadNotifications: unreadCount,
    };
  }),
});
