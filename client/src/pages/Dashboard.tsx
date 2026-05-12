/**
 * Dashboard - AI 클론 활동 대시보드
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import MobileNav from "@/components/MobileNav";
import { Activity, MessageSquare, Eye, Lock, ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const MOCK_MATCHES = [
  {
    id: 1,
    nickname: "별빛산책자",
    compatibility: 92,
    status: "리포트 완료",
    topics: ["여행", "음악", "요리"],
    lastChat: "2시간 전",
    photoLocked: true,
  },
  {
    id: 2,
    nickname: "도시의밤",
    compatibility: 87,
    status: "대화 중",
    topics: ["영화", "독서", "카페"],
    lastChat: "진행 중",
    photoLocked: true,
  },
  {
    id: 3,
    nickname: "새벽감성",
    compatibility: 84,
    status: "리포트 완료",
    topics: ["운동", "음악", "반려동물"],
    lastChat: "5시간 전",
    photoLocked: false,
  },
  {
    id: 4,
    nickname: "커피한잔",
    compatibility: 79,
    status: "대기 중",
    topics: ["카페", "사진", "여행"],
    lastChat: "대기 중",
    photoLocked: true,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">자만추</h1>
              <p className="text-xs text-muted-foreground">AI 클론이 활동 중이에요</p>
            </div>
            <div className="flex items-center gap-2 badge-sage">
              <span className="h-1.5 w-1.5 rounded-full bg-sage animate-gentle-pulse" />
              <span className="text-xs font-medium">활동 중</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-5 space-y-5">
        {/* Clone Status Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="warm-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-warm-coral-light">
                <Activity size={20} className="text-warm-coral" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">나의 클론</h3>
                <p className="text-xs text-muted-foreground">학습 완료 · 탐색 중</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-warm-coral">47</span>
              <p className="text-[10px] text-muted-foreground">대화 완료</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">오늘의 탐색 진행률</span>
              <span className="text-sage font-medium">73%</span>
            </div>
            <Progress value={73} className="h-2 bg-muted" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { label: "총 매칭", value: "12", color: "text-warm-coral" },
              { label: "리포트", value: "8", color: "text-sage" },
              { label: "대기 중", value: "4", color: "text-gold" },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-muted/50 rounded-xl p-2.5">
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Matches List */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <motion.div variants={fadeUp} custom={1} className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">매칭 결과</h2>
            <span className="text-xs text-muted-foreground">{MOCK_MATCHES.length}명 발견</span>
          </motion.div>

          {MOCK_MATCHES.map((match, i) => (
            <motion.div
              key={match.id}
              variants={fadeUp}
              custom={i + 2}
              className="warm-card p-4 space-y-3 active:scale-[0.98] transition-transform"
              onClick={() => setLocation("/report")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-warm-coral-light to-sage-light flex items-center justify-center overflow-hidden">
                    {match.photoLocked ? (
                      <Lock size={16} className="text-muted-foreground" />
                    ) : (
                      <Eye size={16} className="text-sage" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{match.nickname}</h3>
                    <p className="text-[11px] text-muted-foreground">{match.lastChat}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-2xl font-bold ${
                      match.compatibility >= 90
                        ? "text-warm-coral"
                        : match.compatibility >= 85
                        ? "text-sage"
                        : "text-gold"
                    }`}
                  >
                    {match.compatibility}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {match.topics.map((topic) => (
                    <span
                      key={topic}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    match.status === "대화 중"
                      ? "bg-sage animate-gentle-pulse"
                      : match.status === "리포트 완료"
                      ? "bg-warm-coral"
                      : "bg-muted-foreground"
                  }`}
                />
                <span className="text-[11px] text-muted-foreground">
                  {match.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            onClick={() => setLocation("/chat-log")}
            variant="outline"
            className="h-14 rounded-xl border-border bg-white text-foreground font-medium hover:bg-sage-light hover:text-sage hover:border-sage/30 transition-all"
          >
            <MessageSquare size={16} className="mr-2" />
            채팅 로그
          </Button>
          <Button
            onClick={() => setLocation("/pricing")}
            variant="outline"
            className="h-14 rounded-xl border-border bg-white text-foreground font-medium hover:bg-warm-coral-light hover:text-warm-coral hover:border-warm-coral/30 transition-all"
          >
            <Heart size={16} className="mr-2" />
            하트 충전
          </Button>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
