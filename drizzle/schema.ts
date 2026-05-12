import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 사용자 하트 잔액 테이블
 * 각 사용자의 하트 보유량을 추적 (userId는 unique)
 */
export const userHearts = mysqlTable("user_hearts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  balance: int("balance").notNull().default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("user_hearts_userId_unique").on(table.userId),
]);

export type UserHeart = typeof userHearts.$inferSelect;

/**
 * 하트 거래 내역 테이블
 * 하트 부여, 사용, 구매 등 모든 거래를 기록
 */
export const heartTransactions = mysqlTable("heart_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // 양수: 부여/구매, 음수: 사용
  type: mysqlEnum("type", ["admin_grant", "purchase", "use_chat", "use_report", "use_photo", "refund"]).notNull(),
  description: text("description"),
  adminId: int("adminId"), // 관리자가 부여한 경우 관리자 ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HeartTransaction = typeof heartTransactions.$inferSelect;
