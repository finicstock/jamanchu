import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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
 */
export const heartTransactions = mysqlTable("heart_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["admin_grant", "purchase", "use_chat", "use_report", "use_photo", "refund"]).notNull(),
  description: text("description"),
  adminId: int("adminId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HeartTransaction = typeof heartTransactions.$inferSelect;

/**
 * AI 클론 프로필 테이블
 * 사용자가 생성한 AI 클론의 설정 정보
 */
export const cloneProfiles = mysqlTable("clone_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]).notNull(),
  interestedIn: mysqlEnum("interestedIn", ["male", "female", "both"]).notNull(),
  age: int("age").notNull(),
  personality: json("personality").$type<string[]>(), // 성격 특성 배열
  interests: json("interests").$type<string[]>(), // 관심사 배열
  values: text("values"), // 가치관 자유 텍스트
  lifestyle: text("lifestyle"), // 라이프스타일 설명
  status: mysqlEnum("status", ["active", "paused", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  uniqueIndex("clone_profiles_userId_unique").on(table.userId),
]);

export type CloneProfile = typeof cloneProfiles.$inferSelect;

/**
 * AI 클론 대화 테이블
 * 두 클론 간의 대화 세션
 */
export const cloneChats = mysqlTable("clone_chats", {
  id: int("id").autoincrement().primaryKey(),
  userAId: int("userAId").notNull(), // 클론 A의 소유자
  userBId: int("userBId").notNull(), // 클론 B의 소유자
  status: mysqlEnum("status", ["in_progress", "completed", "failed"]).default("in_progress").notNull(),
  messages: json("messages").$type<Array<{ role: string; content: string; timestamp: number }>>(),
  totalMessages: int("totalMessages").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type CloneChat = typeof cloneChats.$inferSelect;

/**
 * 케미스트리 리포트 테이블
 * 대화 완료 후 생성되는 호환성 분석 리포트
 */
export const chemistryReports = mysqlTable("chemistry_reports", {
  id: int("id").autoincrement().primaryKey(),
  chatId: int("chatId").notNull(), // 관련 대화 ID
  userAId: int("userAId").notNull(),
  userBId: int("userBId").notNull(),
  overallScore: int("overallScore").notNull(), // 전체 호환성 점수 (0-100)
  scores: json("scores").$type<Array<{ label: string; score: number }>>(), // 항목별 점수
  highlights: json("highlights").$type<Array<{ topic: string; insight: string; sentiment: string }>>(),
  summary: text("summary"), // AI가 생성한 요약
  status: mysqlEnum("status", ["completed", "failed", "pending"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChemistryReport = typeof chemistryReports.$inferSelect;

/**
 * 알림 테이블
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["match_found", "report_ready", "heart_received", "chat_request", "system"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(), // 0: unread, 1: read
  metadata: json("metadata").$type<Record<string, unknown>>(), // 추가 데이터 (링크 등)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
