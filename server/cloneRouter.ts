import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import {
  cloneProfiles,
  cloneChats,
  chemistryReports,
  notifications,
  userHearts,
  heartTransactions,
  safetyActions,
} from "../drizzle/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";

const MATCH_COST = 1; // 매칭 1회당 하트 소비

type CloneChatMessage = {
  role: "user_a" | "user_b";
  displayName: string;
  content: string;
  timestamp: number;
};

type ChemistryReportData = {
  overallScore: number;
  scores: Array<{ label: string; score: number }>;
  highlights: Array<{ topic: string; insight: string; sentiment: string }>;
  summary: string;
};

type CloneProfileRecord = typeof cloneProfiles.$inferSelect;

type MatchCandidate = {
  profile: CloneProfileRecord;
  score: number;
  reasons: string[];
};

type ConversationDraft = {
  topic: string;
  messages: Array<{ role: "user_a" | "user_b"; content: string }>;
};

const TOP_MATCH_POOL_SIZE = 8;
const CONVERSATION_TURN_COUNT = 5;
const PROFILE_CONTEXT_LIMIT = 900;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function compactText(
  value: string | null | undefined,
  limit = PROFILE_CONTEXT_LIMIT
) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function overlapScore(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0;
  const left = new Set(a.map(item => item.toLowerCase()));
  const right = new Set(b.map(item => item.toLowerCase()));
  const leftItems = Array.from(left);
  const intersection = leftItems.filter(item => right.has(item)).length;
  const union = new Set(leftItems.concat(Array.from(right))).size;
  return union === 0 ? 0 : intersection / union;
}

function tokenizeProfileText(value: string | null | undefined) {
  return compactText(value, 1200)
    .toLowerCase()
    .split(/[\s,.;:!?()[\]{}'"“”‘’]+/)
    .filter(token => token.length >= 2)
    .slice(0, 80);
}

function profileCompleteness(profile: CloneProfileRecord) {
  let score = 0;
  if (asStringArray(profile.personality).length >= 3) score += 25;
  if (asStringArray(profile.interests).length >= 3) score += 25;
  if (compactText(profile.values, 80).length >= 40) score += 30;
  if (compactText(profile.lifestyle, 80).length >= 20) score += 20;
  return score;
}

function scoreCandidate(
  myProfile: CloneProfileRecord,
  candidate: CloneProfileRecord
): MatchCandidate {
  const myInterests = asStringArray(myProfile.interests);
  const candidateInterests = asStringArray(candidate.interests);
  const myTraits = asStringArray(myProfile.personality);
  const candidateTraits = asStringArray(candidate.personality);
  const sharedInterests = myInterests.filter(item =>
    candidateInterests.includes(item)
  );
  const sharedTraits = myTraits.filter(item => candidateTraits.includes(item));
  const valuesOverlap = overlapScore(
    tokenizeProfileText(myProfile.values),
    tokenizeProfileText(candidate.values)
  );
  const ageGap = Math.abs((myProfile.age ?? 0) - (candidate.age ?? 0));
  const ageScore = Math.max(0, 1 - Math.min(ageGap, 15) / 15);
  const completenessScore =
    (profileCompleteness(myProfile) + profileCompleteness(candidate)) / 200;

  const score =
    28 +
    overlapScore(myInterests, candidateInterests) * 26 +
    overlapScore(myTraits, candidateTraits) * 14 +
    valuesOverlap * 16 +
    ageScore * 10 +
    completenessScore * 12;

  const reasons = [
    sharedInterests.length
      ? `공통 관심사 ${sharedInterests.slice(0, 3).join(", ")}`
      : "",
    sharedTraits.length
      ? `비슷한 성향 ${sharedTraits.slice(0, 2).join(", ")}`
      : "",
    valuesOverlap > 0.12 ? "가치관 텍스트 유사도" : "",
    ageGap <= 5 ? "가까운 연령대" : "",
    profileCompleteness(candidate) >= 75 ? "충실한 프로필" : "",
  ].filter(Boolean);

  return {
    profile: candidate,
    score: Math.round(Math.max(0, Math.min(100, score))),
    reasons,
  };
}

function selectWeightedCandidate(candidates: MatchCandidate[]) {
  const pool = candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_MATCH_POOL_SIZE);
  const totalWeight = pool.reduce(
    (sum, item) => sum + Math.max(1, item.score - 35),
    0
  );
  let cursor = Math.random() * totalWeight;

  for (const item of pool) {
    cursor -= Math.max(1, item.score - 35);
    if (cursor <= 0) return item;
  }

  return pool[0];
}

function buildCompactProfileCard(profile: CloneProfileRecord) {
  const personality = asStringArray(profile.personality).slice(0, 6).join(", ");
  const interests = asStringArray(profile.interests).slice(0, 8).join(", ");
  return [
    `닉네임: ${profile.nickname}`,
    `나이/성별: ${profile.age}세 / ${profile.gender}`,
    `성격: ${personality || "미입력"}`,
    `관심사: ${interests || "미입력"}`,
    `가치관/컨텍스트 요약: ${compactText(profile.values) || "미입력"}`,
    `주의 정보: ${compactText(profile.lifestyle, 360) || "없음"}`,
  ].join("\n");
}

function fallbackConversation(
  myProfile: CloneProfileRecord,
  partner: CloneProfileRecord
): CloneChatMessage[] {
  const now = Date.now();
  return [
    {
      role: "user_a",
      displayName: myProfile.nickname,
      content:
        "안녕하세요. 프로필을 보니 관심사가 꽤 자연스럽게 이어질 것 같아서 반가웠어요.",
      timestamp: now,
    },
    {
      role: "user_b",
      displayName: partner.nickname,
      content:
        "저도 반가워요. 부담 없이 서로의 일상과 좋아하는 것부터 이야기해보면 좋겠어요.",
      timestamp: now + 1000,
    },
    {
      role: "user_a",
      displayName: myProfile.nickname,
      content:
        "좋아요. 저는 대화가 편안하게 오가는 사람에게 끌리는 편이에요. 요즘 가장 즐겁게 하는 일이 있나요?",
      timestamp: now + 2000,
    },
    {
      role: "user_b",
      displayName: partner.nickname,
      content:
        "최근에는 작은 루틴을 지키는 게 좋더라고요. 서로의 속도를 존중하는 대화가 잘 맞을 것 같아요.",
      timestamp: now + 3000,
    },
    {
      role: "user_a",
      displayName: myProfile.nickname,
      content:
        "그런 결이 좋네요. 실제 대화로 이어진다면 편하게 취향과 가치관을 더 나눠보고 싶어요.",
      timestamp: now + 4000,
    },
  ];
}

function normalizeConversationDraft(
  draft: unknown,
  myProfile: CloneProfileRecord,
  partner: CloneProfileRecord
): CloneChatMessage[] {
  if (!draft || typeof draft !== "object" || !("messages" in draft)) {
    return fallbackConversation(myProfile, partner);
  }

  const rawMessages = Array.isArray((draft as ConversationDraft).messages)
    ? (draft as ConversationDraft).messages
    : [];
  const normalized = rawMessages
    .filter(message => message.role === "user_a" || message.role === "user_b")
    .slice(0, CONVERSATION_TURN_COUNT)
    .map((message, index) => ({
      role: message.role,
      displayName:
        message.role === "user_a" ? myProfile.nickname : partner.nickname,
      content:
        compactText(message.content, 260) ||
        "좋아요. 조금 더 이야기해보고 싶어요.",
      timestamp: Date.now() + index * 1000,
    }));

  return normalized.length >= 3
    ? normalized
    : fallbackConversation(myProfile, partner);
}

export const cloneRouter = router({
  // 클론 프로필 생성/업데이트
  saveProfile: protectedProcedure
    .input(
      z.object({
        nickname: z.string().min(1).max(50),
        gender: z.enum(["male", "female", "other"]),
        interestedIn: z.enum(["male", "female", "both"]),
        age: z.number().min(18).max(100),
        personality: z.array(z.string()).optional(),
        interests: z.array(z.string()).optional(),
        values: z.string().max(16000).optional(),
        lifestyle: z.string().max(1000).optional(),
      })
    )
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

  setMyCloneStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "paused"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(cloneProfiles)
        .set({ status: input.status })
        .where(eq(cloneProfiles.userId, ctx.user.id));

      return { success: true, status: input.status };
    }),

  submitSafetyAction: protectedProcedure
    .input(
      z.object({
        targetUserId: z.number().int().positive(),
        chatId: z.number().int().positive().optional(),
        action: z.enum(["report", "block", "withdraw_consent"]),
        reason: z.string().max(120).optional(),
        note: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (input.targetUserId === ctx.user.id) {
        throw new Error("자기 자신에게는 안전 조치를 적용할 수 없습니다.");
      }

      const target = await db
        .select()
        .from(cloneProfiles)
        .where(eq(cloneProfiles.userId, input.targetUserId))
        .limit(1);
      if (!target.length) {
        throw new Error("대상 클론을 찾을 수 없습니다.");
      }

      if (input.chatId) {
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

        const currentChat = chat[0];
        if (
          !currentChat ||
          (currentChat.userAId !== input.targetUserId &&
            currentChat.userBId !== input.targetUserId)
        ) {
          throw new Error("안전 조치를 적용할 대화를 확인할 수 없습니다.");
        }
      }

      await db.insert(safetyActions).values({
        reporterUserId: ctx.user.id,
        targetUserId: input.targetUserId,
        chatId: input.chatId ?? null,
        action: input.action,
        reason: input.reason ?? null,
        note: input.note ?? null,
      });

      const labels = {
        report: "신고",
        block: "차단",
        withdraw_consent: "동의 철회",
      } as const;

      await db.insert(notifications).values({
        userId: ctx.user.id,
        type: "system",
        title: `${labels[input.action]} 접수 완료`,
        message:
          input.action === "report"
            ? "신고가 접수되었습니다. 검토 전까지 필요하면 상대를 차단할 수 있습니다."
            : "이 상대는 이후 AI 사전 매칭 후보에서 제외됩니다.",
        metadata: {
          chatId: input.chatId ?? null,
          targetUserId: input.targetUserId,
          action: input.action,
        },
      });

      return { success: true, action: input.action };
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
      throw new Error(
        `하트가 부족합니다. (현재 ${currentBalance}개, 필요 ${MATCH_COST}개) 하트를 충전해주세요.`
      );
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
    let heartCharged = true;
    const refundHeart = async (description: string) => {
      if (!heartCharged) return;
      await db
        .update(userHearts)
        .set({ balance: sql`${userHearts.balance} + ${MATCH_COST}` })
        .where(eq(userHearts.userId, ctx.user.id));
      await db.insert(heartTransactions).values({
        userId: ctx.user.id,
        amount: MATCH_COST,
        type: "refund",
        description,
      });
      heartCharged = false;
    };

    try {
      // 매칭 가능한 상대 클론 찾기 (Bumble식 후보 랭킹 참고: 선호 조건, 공통 관심사, 프로필 충실도)
      const myProfile = myClone[0];
      const candidates = await db
        .select()
        .from(cloneProfiles)
        .where(and(eq(cloneProfiles.status, "active")))
        .limit(80);

      const safetyRows = await db
        .select()
        .from(safetyActions)
        .where(
          or(
            eq(safetyActions.reporterUserId, ctx.user.id),
            eq(safetyActions.targetUserId, ctx.user.id)
          )
        );
      const excludedUserIds = new Set<number>();
      for (const action of safetyRows) {
        if (action.action !== "block" && action.action !== "withdraw_consent") {
          continue;
        }
        if (action.reporterUserId === ctx.user.id) {
          excludedUserIds.add(action.targetUserId);
        }
        if (action.targetUserId === ctx.user.id) {
          excludedUserIds.add(action.reporterUserId);
        }
      }

      const filtered = candidates.filter(c => {
        if (c.userId === ctx.user.id) return false;
        if (excludedUserIds.has(c.userId)) return false;
        if (
          myProfile.interestedIn !== "both" &&
          c.gender !== myProfile.interestedIn
        )
          return false;
        if (c.interestedIn !== "both" && myProfile.gender !== c.interestedIn)
          return false;
        return true;
      });

      if (!filtered.length) {
        await refundHeart("매칭 상대 없음 - 하트 환불");
        throw new Error(
          "현재 매칭 가능한 상대가 없습니다. 하트는 환불되었습니다. 잠시 후 다시 시도해주세요."
        );
      }

      const rankedCandidates = filtered.map(candidate =>
        scoreCandidate(myProfile, candidate)
      );
      const selectedMatch = selectWeightedCandidate(rankedCandidates);
      const partner = selectedMatch.profile;

      // 비용 절감: 후보별 LLM 호출 없이 규칙 기반으로 상대를 고르고, 전체 5턴 대화를 단일 JSON 호출로 생성한다.
      const conversationResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "당신은 AI 클론 간 사전 궁합 대화를 작성합니다. 원문 컨텍스트, 제3자 이름, 연락처, 사적 사건을 그대로 노출하지 말고 말투와 관심사만 반영하세요. 실제 만남 약속이나 관계 확정은 하지 않습니다.",
          },
          {
            role: "user",
            content: `두 클론이 처음 만난 상황에서 짧은 사전 대화 ${CONVERSATION_TURN_COUNT}턴을 JSON으로 작성하세요. 각 메시지는 1-2문장, 한국어, 부담 없는 톤이어야 합니다.

A 프로필:
${buildCompactProfileCard(myProfile)}

B 프로필:
${buildCompactProfileCard(partner)}

규칙 기반 매칭 점수: ${selectedMatch.score}
매칭 이유: ${selectedMatch.reasons.join(", ") || "기본 선호 조건 충족"}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "clone_conversation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                topic: { type: "string" },
                messages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      role: { type: "string", enum: ["user_a", "user_b"] },
                      content: { type: "string" },
                    },
                    required: ["role", "content"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["topic", "messages"],
              additionalProperties: false,
            },
          },
        },
      });

      let conversationDraft: unknown = null;
      try {
        conversationDraft = JSON.parse(
          (conversationResponse.choices[0]?.message?.content as string) ?? "{}"
        );
      } catch {
        conversationDraft = null;
      }

      const messages = normalizeConversationDraft(
        conversationDraft,
        myProfile,
        partner
      );
      const conversationContext = messages
        .map(message => `${message.displayName}: ${message.content}`)
        .join("\n");

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
        .where(
          and(
            eq(cloneChats.userAId, ctx.user.id),
            eq(cloneChats.userBId, partner.userId)
          )
        )
        .orderBy(desc(cloneChats.createdAt))
        .limit(1);

      const chatId = chatResult[0]?.id ?? 0;

      // 케미스트리 리포트 생성
      const reportPrompt = `다음은 두 사람의 소개팅 대화입니다:

${conversationContext}

A의 프로필:
${buildCompactProfileCard(myProfile)}

B의 프로필:
${buildCompactProfileCard(partner)}

규칙 기반 사전 매칭 점수: ${selectedMatch.score}
매칭 이유: ${selectedMatch.reasons.join(", ") || "기본 선호 조건 충족"}

이 대화를 분석하여 다음 JSON 형식으로 호환성 리포트를 작성해주세요:
{
  "overallScore": 0-100 사이의 전체 호환성 점수,
  "scores": [{"label": "가치관", "score": 0-100}, {"label": "대화 스타일", "score": 0-100}, {"label": "관심사", "score": 0-100}, {"label": "유머 감각", "score": 0-100}, {"label": "생활 방식", "score": 0-100}],
  "highlights": [{"topic": "주제", "insight": "인사이트", "sentiment": "positive/neutral/negative"}],
  "summary": "전체 요약 (3-4문장)"
}`;

      const reportResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "당신은 AI 사전 대화 기반 궁합 리포트 작성자입니다. 실제 관계의 성공을 단정하지 말고, 관찰된 대화와 프로필에서 나온 가능성과 주의점을 JSON 형식으로만 응답하세요.",
          },
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
                overallScore: {
                  type: "integer",
                  description: "전체 호환성 점수 0-100",
                },
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

      let reportData: ChemistryReportData | null = null;
      try {
        const parsed = JSON.parse(
          (reportResponse.choices[0]?.message?.content as string) ?? "{}"
        );
        if (
          Number.isInteger(parsed.overallScore) &&
          Array.isArray(parsed.scores) &&
          Array.isArray(parsed.highlights) &&
          typeof parsed.summary === "string"
        ) {
          reportData = parsed;
        }
      } catch {
        reportData = null;
      }

      const reportFailed = !reportData;

      // 모든 시도 실패 시 실패 상태로 저장
      if (reportFailed) {
        reportData = {
          overallScore: 0,
          scores: [],
          highlights: [
            {
              topic: "분석 실패",
              insight: "리포트 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
              sentiment: "neutral",
            },
          ],
          summary:
            "대화 분석 중 오류가 발생했습니다. 리포트 재생성을 요청해주세요.",
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

      if (reportFailed) {
        await refundHeart("리포트 생성 실패 - 하트 환불");
      }

      // 알림 생성 (양쪽 모두)
      await db.insert(notifications).values([
        {
          userId: ctx.user.id,
          type: reportFailed ? "system" : "report_ready",
          title: reportFailed
            ? "리포트 생성이 지연되었습니다"
            : "케미스트리 리포트 완성!",
          message: reportFailed
            ? `${partner.nickname}님과의 대화는 저장됐지만 리포트 생성에 실패해 하트를 환불했습니다.`
            : `${partner.nickname}님과의 대화 분석이 완료되었습니다. 호환성 점수: ${finalReport.overallScore}점`,
          metadata: {
            chatId,
            reportScore: finalReport.overallScore,
            reportStatus: reportFailed ? "failed" : "completed",
          },
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
        report: {
          ...finalReport,
          status: reportFailed ? "failed" : "completed",
        },
        charged: !reportFailed,
      };
    } catch (error) {
      if (!heartCharged && error instanceof Error) {
        throw error;
      }
      await refundHeart("AI 매칭 대화 생성 실패 - 하트 환불");
      const reason = error instanceof Error ? error.message : "알 수 없는 오류";
      throw new Error(
        `AI 매칭 대화 생성에 실패했습니다. 하트는 환불되었습니다. ${reason}`
      );
    }
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
      const partnerId =
        chat.userAId === ctx.user.id ? chat.userBId : chat.userAId;
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
      const partnerId =
        report.userAId === ctx.user.id ? report.userBId : report.userAId;
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
        status: report.status,
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
      const myClone = await db
        .select()
        .from(cloneProfiles)
        .where(eq(cloneProfiles.userId, ctx.user.id))
        .limit(1);
      const partnerClone = await db
        .select()
        .from(cloneProfiles)
        .where(eq(cloneProfiles.userId, partnerId))
        .limit(1);

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
        reportStatus: report[0]?.status ?? null,
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
      const myClone = await db
        .select()
        .from(cloneProfiles)
        .where(eq(cloneProfiles.userId, ctx.user.id))
        .limit(1);
      const partnerClone = await db
        .select()
        .from(cloneProfiles)
        .where(eq(cloneProfiles.userId, partnerId))
        .limit(1);

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
        partnerUserId: partnerId,
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
  const personality = Array.isArray(profile.personality)
    ? profile.personality.join(", ")
    : "";
  const interests = Array.isArray(profile.interests)
    ? profile.interests.join(", ")
    : "";

  return `당신은 "${profile.nickname}"이라는 사람의 AI 클론입니다. 사용자가 동의한 사전 궁합 탐색 범위 안에서만 이 사람의 대화 성향을 참고해 응답하세요.

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
- 사용자가 직접 말하지 않은 사실, 연락처, 주소, 직장명, 민감한 개인정보를 지어내거나 공개하지 마세요
- 업로드된 대화/파일 컨텍스트는 말투, 관심사, 가치관 참고용입니다. 원문, 제3자 이름, 연락처, 사적 사건을 그대로 노출하지 마세요
- 실제 만남 약속, 고백, 관계 확정처럼 사용자의 직접 동의가 필요한 결정을 대신하지 마세요
- 상대가 민감한 정보나 실제 연락을 요구하면 "리포트 확인 후 당사자끼리 결정할 수 있다"는 방향으로 부드럽게 안내하세요
- 이 대화는 인간 대화 전 사전 궁합을 보기 위한 AI 시뮬레이션임을 전제로 하세요
- 한국어로 대화하세요`;
}
