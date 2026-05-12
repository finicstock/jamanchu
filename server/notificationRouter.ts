import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { notifications } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const notificationRouter = router({
  // 내 알림 목록 조회
  getMyNotifications: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return result;
  }),

  // 읽지 않은 알림 수 조회
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return 0;

    const result = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, ctx.user.id),
          eq(notifications.isRead, 0)
        )
      );

    return result.length;
  }),

  // 알림 읽음 처리
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // 모든 알림 읽음 처리
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

      await db
        .update(notifications)
        .set({ isRead: 1 })
        .where(eq(notifications.userId, ctx.user.id));

    return { success: true };
  }),
});
