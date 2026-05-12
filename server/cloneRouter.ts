import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { cloneProfiles, cloneChats, chemistryReports, notifications, userHearts, heartTransactions } from "../drizzle/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";

const MATCH_COST = 1; // 매칭 1회당 하트 소비

export const cloneRouter = router({
  // 클론 프로필 생성/업데이트
  saveProfile: protectedProcedure
    .input(z.object({
      nickname: z.string().min(1).max(50),
      gender: z.enum(["male", "female", "other"]),
      interestedIn: z.enum(["male", "female", "both"]),
      age: z.number().min(18).max(100),
      personality: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      values: z.string().optional(),
      lifestyle: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(cloneProfiles)
        .where(eq(cloneProfiles.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(cloneProfiles)
          .set({
            nickname: input.nickname,
            gender: input.gender,
            interestedIn: input.interestedIn,
            age: input.age,
            personality: input.personality ?? [],
            interests: input.interests ?? [],
            values: input.values ?? null,
            lifestyle: input.lifestyle ?? null,
          })
          .where(eq(cloneProfiles.userId, ctx.user.id));
      } else {
        await db.insert(cloneProfiles).values({
          userId: ctx.user.id,
          nickname: input.nickname,
          gender: input.gender,
          interestedIn: input.interestedIn,
          age: input.age,
          personality: input.personality ?? [],
          interests: input.interests ?? [],
          values: input.values ?? null,
          lifestyle: input.lifestyle ?? null,
          status: "active",
        });
      }

      return { success: true };
    }),

  // 내 클론 프로필 조회
  getMyClone: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(cloneProfiles)
      .where(eq(cloneProfiles.userId, ctx.user.id))
      .limit(1);

    return result[0] ?? null;
  }),

  // AI 클론 대화 시뮬레이션 시작
    startChat: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // 내 클론 프로필 확인
    const myClone = await db
      .select()
      .from(cloneProfiles)
      .where(eq(cloneProfiles.userId, ctx.user.id))
      .limit(1);
    if (!myClone.length) {
      throw new Error("클론 프로필을 먼저 생성해주세요.");
    }
    // 하트 잔액 확인 및 차감
    const heartsRow = await db
      .select()
      .from(userHearts)
      .where(eq(userHearts.userId, ctx.user.id))
      .limit(1);
    const currentBalance = heartsRow[0]?.balance ?? 0;
    if (currentBalance < MATCH_COST) {
      throw new Error(`하트가 부족합니다. (현재 ${currentBalance}개, 필요 ${MATCH_COST}개) 하트를 충전해주세요.`);
    }
    // 하트 차감
    await db
      .update(userHearts)
      .set({ balance: sql`${userHearts.balance} - ${MATCH_COST}` })
      .where(eq(userHearts.userId, ctx.user.id));
    // 거래 내역 기록
    await db.insert(heartTransactions).values({
      userId: ctx.user.id,
      amount: -MATCH_COST,
      type: "use_chat",
      description: "AI 매칭 대화 시작",
    });

    // 매칭 가능한 상대 클론 찾기 (성별 조건 매칭)
    const myProfile = myClone[0];
    const candidates = await db
      .select()
      .from(cloneProfiles)
      .where(
        and(
          eq(cloneProfiles.status, "active"),
        )
      )
      .limit(50);

    // 자신 제외 및 성별 조건 필터링
    const filtered = candidates.filter(c => {
      if (c.userId === ctx.user.id) return false;
      // 내가 관심 있는 성별과 상대 성별 매칭
      if (myProfile.interestedIn !== "both" && c.gender !== myProfile.interestedIn) return false;
      // 상대가 관심 있는 성별과 내 성별 매칭
      if (c.interestedIn !== "both" && myProfile.gender !== c.interestedIn) return false;
      return true;
    });

    if (!filtered.length) {
      // 매칭 실패 시 하트 환불
      await db
        .update(userHearts)
        .set({ balance: sql`${userHearts.balance} + ${MATCH_COST}` })
        .where(eq(userHearts.userId, ctx.user.id));
      await db.insert(heartTransactions).values({
        userId: ctx.user.id,
        amount: MATCH_COST,
        type: "refund",
        description: "매칭 상대 없음 - 하트 환불",
      });
      throw new Error("현재 매칭 가능한 상대가 없습니다. 하트는 환불되었습니다. 잠시 후 다시 시도해주세요.");
    }

    // 랜덤 매칭
    const partner = filtered[Math.floor(Math.random() * filtered.length)];

    // 대화 생성
    const systemPromptA = buildClonePrompt(myProfile);
    const systemPromptB = buildClonePrompt(partner);

    // LLM으로 대화 시뮬레이션 (5턴)
    const messages: Array<{ role: string; content: string; timestamp: number }> = [];
    let conversationContext = "";

    const topics = ["취미와 관심사", "가치관과 인생관", "일상과 라이프스타일", "미래 계획", "좋아하는 것들"];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    // 첫 인사
    const firstMsg = await invokeLLM({
      messages: [
        { role: "system", content: systemPromptA },
        { role: "user", content: `당신은 소개팅 자리에서 상대방을 처음 만났습니다. "${topic}"에 대해 자연스럽게 대화를 시작해주세요. 2-3문장으로 짧게 말해주세요.` },
      ],
    });
    const msgA1 = (firstMsg.choices[0]?.message?.content as string) ?? "안녕하세요! 만나서 반갑습니다.";
    messages.push({ role: myProfile.nickname, content: msgA1, timestamp: Date.now() });
    conversationContext += `${myProfile.nickname}: ${msgA1}\n`;

    // 4턴 더 대화
    for (let i = 0; i < 4; i++) {
      const isA = i % 2 === 1;
      const speaker = isA ? myProfile : partner;
      const prompt = isA ? systemPromptA : systemPromptB;

      const reply = await invokeLLM({
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `다음은 소개팅 대화입니다:\n${conversationContext}\n이 대화에 자연스럽게 응답해주세요. 2-3문장으로 짧게 말해주세요.` },
        ],
      });

      const content = (reply.choices[0]?.message?.content as string) ?? "네, 그렇군요!";
      messages.push({ role: speaker.nickname, content, timestamp: Date.now() + (i + 1) * 1000 });
      conversationContext += `${speaker.nickname}: ${content}\n`;
    }

    // 대화 저장
    await db.insert(cloneChats).values({
      userAId: ctx.user.id,
      userBId: partner.userId,
      status: "completed",
      messages: messages,
      totalMessages: messages.length,
      completedAt: new Date(),
    });

    // 최근 생성된 chat ID 가져오기
    const chatResult = await db
      .select()
      .from(cloneChats)
      .where(and(eq(cloneChats.userAId, ctx.user.id), eq(cloneChats.userBId, partner.userId)))
      .orderBy(desc(cloneChats.createdAt))
      .limit(1);

    const chatId = chatResult[0]?.id ?? 0;

    // 케미스트리 리포트 생성
    const reportPrompt = `다음은 두 사람의 소개팅 대화입니다:

${conversationContext}

A의 프로필: ${myProfile.nickname}, ${myProfile.age}세, 성격: ${(myProfile.personality as string[])?.join(", ")}, 관심사: ${(myProfile.interests as string[])?.join(", ")}
B의 프로필: ${partner.nickname}, ${partner.age}세, 성격: ${(partner.personality as string[])?.join(", ")}, 관심사: ${(partner.interests as string[])?.join(", ")}

이 대화를 분석하여 다음 JSON 형식으로 호환성 리포트를 작성해주세요:
{
  "overallScore": 0-100 사이의 전체 호환성 점수,
  "scores": [{"label": "가치관", "score": 0-100}, {"label": "대화 스타일", "score": 0-100}, {"label": "관심사", "score": 0-100}, {"label": "유머 감각", "score": 0-100}, {"label": "생활 방식", "score": 0-100}],
  "highlights": [{"topic": "주제", "insight": "인사이트", "sentiment": "positive/neutral/negative"}],
  "summary": "전체 요약 (3-4문장)"
}`;

    const reportResponse = await invokeLLM({
      messages: [
        { role: "system", content: "당신은 데이팅 호환성 분석 전문가입니다. JSON 형식으로만 응답하세요." },
        { role: "user", content: reportPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "chemistry_report",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallScore: { type: "integer", description: "전체 호환성 점수 0-100" },
              scores: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    score: { type: "integer" },
                  },
                  required: ["label", "score"],
                  additionalProperties: false,
                },
              },
              highlights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    insight: { type: "string" },
                    sentiment: { type: "string" },
                  },
                  required: ["topic", "insight", "sentiment"],
                  additionalProperties: false,
                },
              },
              summary: { type: "string" },
            },
            required: ["overallScore", "scores", "highlights", "summary"],
            additionalProperties: false,
          },
        },
      },
    });

    let reportData: {
      overallScore: number;
      scores: Array<{ label: string; score: number }>;
      highlights: Array<{ topic: string; insight: string; sentiment: string }>;
      summary: string;
    } | null = null;

    // 리포트 파싱 시도 (최대 2회)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const responseToUse = attempt === 0 ? reportResponse : await invokeLLM({
          messages: [
            { role: "system", content: "당신은 데이팅 호환성 분석 전문가입니다. JSON 형식으로만 응답하세요." },
            { role: "user", content: reportPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "chemistry_report",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  overallScore: { type: "integer", description: "전체 호환성 점수 0-100" },
                  scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        score: { type: "integer" },
                      },
                      required: ["label", "score"],
                      additionalProperties: false,
                    },
                  },
                  highlights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        topic: { type: "string" },
                        insight: { type: "string" },
                        sentiment: { type: "string" },
                      },
                      required: ["topic", "insight", "sentiment"],
                      additionalProperties: false,
                    },
                  },
                  summary: { type: "string" },
                },
                required: ["overallScore", "scores", "highlights", "summary"],
                additionalProperties: false,
              },
            },
          },
        });
        const parsed = JSON.parse((responseToUse.choices[0]?.message?.content as string) ?? "{}");
        if (parsed.overallScore && parsed.scores && parsed.summary) {
          reportData = parsed;
          break;
        }
      } catch {
        // retry on next attempt
      }
    }

    const reportFailed = !reportData;

    // 모든 시도 실패 시 실패 상태로 저장
    if (reportFailed) {
      reportData = {
        overallScore: 0,
        scores: [],
        highlights: [{ topic: "분석 실패", insight: "리포트 생성 중 오류가 발생했습니다. 다시 시도해주세요.", sentiment: "neutral" }],
        summary: "대화 분석 중 오류가 발생했습니다. 리포트 재생성을 요청해주세요.",
      };
    }

    // 리포트 저장 (reportFailed 분기에서 reportData가 할당되므로 null이 아님)
    const finalReport = reportData!;
    await db.insert(chemistryReports).values({
      chatId,
      userAId: ctx.user.id,
      userBId: partner.userId,
      overallScore: finalReport.overallScore,
      scores: finalReport.scores,
      highlights: finalReport.highlights,
      summary: finalReport.summary,
      status: reportFailed ? "failed" : "completed",
    });

    // 알림 생성 (양쪽 모두)
    await db.insert(notifications).values([
      {
        userId: ctx.user.id,
        type: "report_ready",
        title: "케미스트리 리포트 완성!",
        message: `${partner.nickname}님과의 대화 분석이 완료되었습니다. 호환성 점수: ${finalReport.overallScore}점`,
        metadata: { chatId, reportScore: finalReport.overallScore },
      },
      {
        userId: partner.userId,
        type: "match_found",
        title: "새로운 매칭 발견!",
        message: `${myProfile.nickname}님의 클론이 대화를 요청했습니다.`,
        metadata: { chatId },
      },
    ]);

    return {
      chatId,
      partnerNickname: partner.nickname,
      messages,
      report: finalReport,
    };
  }),

  // 내 대화 목록 조회
  getMyChats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const chats = await db
      .select()
      .from(cloneChats)
      .where(
        or(
          eq(cloneChats.userAId, ctx.user.id),
          eq(cloneChats.userBId, ctx.user.id)
        )
      )
      .orderBy(desc(cloneChats.createdAt))
      .limit(20);

    // 상대방 닉네임 가져오기
    const result = [];
    for (const chat of chats) {
      const partnerId = chat.userAId === ctx.user.id ? chat.userBId : chat.userAId;
      const partnerClone = await db
        .select()
        .from(cloneProfiles)
        .where(eq(cloneProfiles.userId, partnerId))
        .limit(1);

      result.push({
        id: chat.id,
        partnerNickname: partnerClone[0]?.nickname ?? "알 수 없음",
        status: chat.status,
        totalMessages: chat.totalMessages,
        messages: chat.messages,
        createdAt: chat.createdAt,
        completedAt: chat.completedAt,
      });
    }

    return result;
  }),

  // 리포트 조회
  getMyReports: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const reports = await db
      .select()
      .from(chemistryReports)
      .where(
        or(
          eq(chemistryReports.userAId, ctx.user.id),
          eq(chemistryReports.userBId, ctx.user.id)
        )
      )
      .orderBy(desc(chemistryReports.createdAt))
      .limit(20);

    const result = [];
    for (const report of reports) {
      const partnerId = report.userAId === ctx.user.id ? report.userBId : report.userAId;
      const partnerClone = await db
        .select()
        .from(cloneProfiles)
        .where(eq(cloneProfiles.userId, partnerId))
        .limit(1);

      result.push({
        id: report.id,
        chatId: report.chatId,
        partnerNickname: partnerClone[0]?.nickname ?? "알 수 없음",
        overallScore: report.overallScore,
        scores: report.scores,
        highlights: report.highlights,
        summary: report.summary,
        createdAt: report.createdAt,
      });
    }

    return result;
  }),

  // 채팅 상세 조회 (ID 기반)
  getChatById: protectedProcedure
    .input(z.object({ chatId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const chat = await db
        .select()
        .from(cloneChats)
        .where(
          and(
            eq(cloneChats.id, input.chatId),
            or(
              eq(cloneChats.userAId, ctx.user.id),
              eq(cloneChats.userBId, ctx.user.id)
            )
          )
        )
        .limit(1);

      if (!chat[0]) throw new Error("대화를 찾을 수 없습니다.");

      const c = chat[0];
      const partnerId = c.userAId === ctx.user.id ? c.userBId : c.userAId;
      const myClone = await db.select().from(cloneProfiles).where(eq(cloneProfiles.userId, ctx.user.id)).limit(1);
      const partnerClone = await db.select().from(cloneProfiles).where(eq(cloneProfiles.userId, partnerId)).limit(1);

      // 관련 리포트 조회
      const report = await db
        .select()
        .from(chemistryReports)
        .where(eq(chemistryReports.chatId, input.chatId))
        .limit(1);

      return {
        id: c.id,
        myNickname: myClone[0]?.nickname ?? "나",
        partnerNickname: partnerClone[0]?.nickname ?? "알 수 없음",
        status: c.status,
        totalMessages: c.totalMessages,
        messages: c.messages ?? [],
        createdAt: c.createdAt,
        completedAt: c.completedAt,
        reportId: report[0]?.id ?? null,
        reportScore: report[0]?.overallScore ?? null,
      };
    }),

  // 리포트 상세 조회 (ID 기반)
  getReportById: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const report = await db
        .select()
        .from(chemistryReports)
        .where(
          and(
            eq(chemistryReports.id, input.reportId),
            or(
              eq(chemistryReports.userAId, ctx.user.id),
              eq(chemistryReports.userBId, ctx.user.id)
            )
          )
        )
        .limit(1);

      if (!report[0]) throw new Error("리포트를 찾을 수 없습니다.");

      const r = report[0];
      const partnerId = r.userAId === ctx.user.id ? r.userBId : r.userAId;
      const myClone = await db.select().from(cloneProfiles).where(eq(cloneProfiles.userId, ctx.user.id)).limit(1);
      const partnerClone = await db.select().from(cloneProfiles).where(eq(cloneProfiles.userId, partnerId)).limit(1);

      // 관련 대화 정보
      const chat = await db
        .select()
        .from(cloneChats)
        .where(eq(cloneChats.id, r.chatId))
        .limit(1);

      return {
        id: r.id,
        chatId: r.chatId,
        myNickname: myClone[0]?.nickname ?? "나",
        partnerNickname: partnerClone[0]?.nickname ?? "알 수 없음",
        overallScore: r.overallScore,
        scores: r.scores ?? [],
        highlights: r.highlights ?? [],
        summary: r.summary ?? "",
        status: r.status,
        createdAt: r.createdAt,
        totalMessages: chat[0]?.totalMessages ?? 0,
      };
    }),
});

function buildClonePrompt(profile: {
  nickname: string;
  age: number;
  gender: string;
  personality: unknown;
  interests: unknown;
  values: string | null;
  lifestyle: string | null;
}): string {
  const personality = Array.isArray(profile.personality) ? profile.personality.join(", ") : "";
  const interests = Array.isArray(profile.interests) ? profile.interests.join(", ") : "";

  return `당신은 "${profile.nickname}"이라는 사람의 AI 클론입니다. 이 사람처럼 대화해주세요.

프로필:
- 나이: ${profile.age}세
- 성별: ${profile.gender === "male" ? "남성" : profile.gender === "female" ? "여성" : "기타"}
- 성격: ${personality || "친절하고 밝은 성격"}
- 관심사: ${interests || "다양한 분야에 관심"}
- 가치관: ${profile.values || "진실된 관계를 중요시함"}
- 라이프스타일: ${profile.lifestyle || "활동적이고 긍정적"}

대화 규칙:
- 자연스럽고 편안하게 대화하세요
- 2-3문장으로 짧게 답변하세요
- 상대방에게 관심을 보이며 질문도 해주세요
- 이 사람의 성격과 관심사에 맞게 대화하세요
- 한국어로 대화하세요`;
}
