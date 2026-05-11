/**
 * Dashboard - AI 클론 활동 대시보드
 * Design: Night Walker - Neo-Brutalism + Soft Dark UI
 * 클론 상태, 진행 중인 채팅, 매칭 카드 리스트
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import MobileNav from "@/components/MobileNav";
import { Activity, MessageSquare, Eye, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const MOCK_MATCHES = [
  {
    id: 1,
    nickname: "별빛산책자",
    compatibility: 92,
    status: "채팅 완료",
    topics: ["여행", "음악", "요리"],
    lastChat: "2시간 전",
    photoLocked: true,
  },
  {
    id: 2,
    nickname: "도시의밤",
    compatibility: 87,
    status: "채팅 중",
    topics: ["영화", "독서", "카페"],
    lastChat: "진행 중",
    photoLocked: true,
  },
  {
    id: 3,
    nickname: "새벽감성",
    compatibility: 84,
    status: "채팅 완료",
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
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[oklch(0.22_0.005_260)] bg-background/95 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-foreground tracking-wide">자만추</h1>
              <p className="text-xs text-muted-foreground">AI 클론 대시보드</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-neon-mint animate-pulse-neon" />
              <span className="text-xs text-neon-mint font-medium">클론 활동 중</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        {/* Clone Status Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="brutal-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-neon-mint bg-neon-mint/10">
                <Activity size={20} className="text-neon-mint" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">나의 클론</h3>
                <p className="text-xs text-muted-foreground">학습 완료 · 탐색 중</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-3xl text-neon-mint neon-text-mint">47</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">대화 완료</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">오늘의 탐색 진행률</span>
              <span className="text-neon-mint font-medium">73%</span>
            </div>
            <Progress value={73} className="h-2 bg-[oklch(0.18_0.005_260)]" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { label: "총 매칭", value: "12", color: "text-neon-mint" },
              { label: "리포트", value: "8", color: "text-neon-pink" },
              { label: "대기 중", value: "4", color: "text-foreground/60" },
            ].map((stat) => (
              <div key={stat.label} className="text-center border-2 border-[oklch(0.22_0.005_260)] p-2">
                <span className={`font-display text-2xl ${stat.color}`}>{stat.value}</span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
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
            <h2 className="font-display text-xl text-foreground tracking-wide">MATCHES</h2>
            <span className="text-xs text-muted-foreground">{MOCK_MATCHES.length}명 발견</span>
          </motion.div>

          {MOCK_MATCHES.map((match, i) => (
            <motion.div
              key={match.id}
              variants={fadeUp}
              custom={i + 2}
              className="brutal-card p-4 space-y-3"
              onClick={() => setLocation("/report")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar placeholder */}
                  <div className="relative h-12 w-12 border-2 border-[oklch(0.3_0.005_260)] bg-[oklch(0.15_0.005_260)] flex items-center justify-center overflow-hidden">
                    {match.photoLocked ? (
                      <Lock size={16} className="text-muted-foreground" />
                    ) : (
                      <Eye size={16} className="text-neon-mint" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{match.nickname}</h3>
                    <p className="text-[10px] text-muted-foreground">{match.lastChat}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-display text-2xl ${
                      match.compatibility >= 90
                        ? "text-neon-mint neon-text-mint"
                        : match.compatibility >= 85
                        ? "text-neon-pink"
                        : "text-foreground/60"
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
                      className="text-[10px] px-2 py-0.5 border border-[oklch(0.3_0.005_260)] text-muted-foreground"
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
                    match.status === "채팅 중"
                      ? "bg-neon-mint animate-pulse-neon"
                      : match.status === "채팅 완료"
                      ? "bg-neon-pink"
                      : "bg-muted-foreground"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
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
            className="h-14 border-2 border-neon-mint/30 text-neon-mint hover:bg-neon-mint/10 hover:border-neon-mint font-medium"
            style={{ borderRadius: "2px" }}
          >
            <MessageSquare size={16} className="mr-2" />
            채팅 로그
          </Button>
          <Button
            onClick={() => setLocation("/pricing")}
            variant="outline"
            className="h-14 border-2 border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 hover:border-neon-pink font-medium"
            style={{ borderRadius: "2px" }}
          >
            <Eye size={16} className="mr-2" />
            사진 잠금해제
          </Button>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
