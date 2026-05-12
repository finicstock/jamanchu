/**
 * Report - 케미스트리 리포트
 * 목록 뷰 + 상세 뷰 (동적 라우팅)
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { motion } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import {
  Heart,
  Sparkles,
  ChevronLeft,
  FileText,
  Loader2,
  AlertCircle,
  MessageSquare,
  Star,
  TrendingUp,
  Ban,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import LoginModal from "@/components/LoginModal";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── 타입 정의 ───
type ScoreItem = { label: string; score: number };
type HighlightItem = { topic: string; insight: string; sentiment: string };

// ─── 레이더 차트 (SVG) ───
function RadarChart({ scores }: { scores: ScoreItem[] }) {
  const size = 240;
  const center = size / 2;
  const maxRadius = 90;
  const levels = 5;
  const count = scores.length;

  if (count === 0) return null;

  const getPoint = (index: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const dataPoints = scores.map((s, i) =>
    getPoint(i, (s.score / 100) * maxRadius)
  );
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[260px] mx-auto"
    >
      {/* 배경 그리드 */}
      {Array.from({ length: levels }).map((_, level) => {
        const r = maxRadius * ((level + 1) / levels);
        const points = Array.from({ length: count }).map((_, i) =>
          getPoint(i, r)
        );
        const path =
          points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ") + " Z";
        return (
          <path
            key={level}
            d={path}
            fill="none"
            stroke="#E8E0D8"
            strokeWidth={level === levels - 1 ? 1.5 : 0.5}
            opacity={0.6}
          />
        );
      })}

      {/* 축 라인 */}
      {scores.map((_, i) => {
        const p = getPoint(i, maxRadius);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#E8E0D8"
            strokeWidth={0.5}
            opacity={0.5}
          />
        );
      })}

      {/* 데이터 영역 */}
      <path
        d={dataPath}
        fill="rgba(232, 114, 92, 0.15)"
        stroke="#E8725C"
        strokeWidth={2}
      />

      {/* 데이터 포인트 */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#E8725C"
          stroke="white"
          strokeWidth={2}
        />
      ))}

      {/* 라벨 */}
      {scores.map((s, i) => {
        const labelPoint = getPoint(i, maxRadius + 22);
        return (
          <text
            key={i}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
            fontSize={10}
            fontWeight={600}
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── 점수 바 ───
function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-gradient-to-r from-[#E8725C] to-[#FF9A76]";
    if (s >= 60) return "bg-gradient-to-r from-[#7BA68C] to-[#A8D5BA]";
    if (s >= 40) return "bg-gradient-to-r from-yellow-400 to-yellow-300";
    return "bg-gradient-to-r from-gray-400 to-gray-300";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs font-bold text-warm-coral">{score}점</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${getColor(score)}`}
        />
      </div>
    </div>
  );
}

// ─── 리포트 목록 뷰 ───
function ReportListView() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { data: reports, isLoading } = trpc.clone.getMyReports.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginModal
          isOpen={true}
          onClose={() => setLocation("/")}
          message="리포트를 확인하려면 로그인이 필요합니다."
        />
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-warm-coral" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-foreground">
                케미스트리 리포트
              </h1>
              <p className="text-[11px] text-muted-foreground">
                AI 클론이 분석한 호환성 보고서
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {reports?.length ?? 0}개의 리포트
            </span>
          </div>
        </div>
      </header>

      <div className="container py-5">
        {reports && reports.length > 0 ? (
          <div className="space-y-3">
            {reports.map((report, i) => (
              <motion.button
                key={report.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                onClick={() => setLocation(`/report/${report.id}`)}
                className="w-full warm-card p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${report.status === "failed" ? "bg-gray-100" : "bg-gradient-to-br from-[#E8725C] to-[#FF9A76]"}`}
                  >
                    <span
                      className={`text-sm font-bold ${report.status === "failed" ? "text-gray-500" : "text-white"}`}
                    >
                      {report.status === "failed" ? "!" : report.overallScore}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {report.partnerNickname}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={10}
                            className={
                              report.status !== "failed" &&
                              idx < Math.round(report.overallScore / 20)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {report.status === "failed"
                        ? "리포트 생성 실패로 하트가 환불되었습니다."
                        : (report.summary ?? "리포트 요약을 확인하세요")}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString(
                            "ko-KR",
                            { month: "long", day: "numeric" }
                          )
                        : ""}
                    </p>
                  </div>
                  <ChevronLeft
                    size={16}
                    className="text-muted-foreground rotate-180 shrink-0"
                  />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="warm-card p-8 text-center space-y-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-light mx-auto">
              <FileText size={28} className="text-warm-coral" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-lg font-bold text-foreground">
                아직 리포트가 없어요
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI 클론이 대화를 완료하면
                <br />
                케미스트리 리포트가 자동으로 생성됩니다.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setLocation("/clone-setup")}
                className="bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full px-6"
              >
                <Sparkles size={16} className="mr-2" />
                클론 만들기
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

// ─── 리포트 상세 뷰 ───
function ReportDetailView({ reportId }: { reportId: number }) {
  const [, setLocation] = useLocation();

  const {
    data: report,
    isLoading,
    error,
  } = trpc.clone.getReportById.useQuery({ reportId }, { retry: false });
  const safetyActionMutation = trpc.clone.submitSafetyAction.useMutation({
    onSuccess: data => {
      const label =
        data.action === "report"
          ? "신고"
          : data.action === "block"
            ? "차단"
            : "동의 철회";
      toast.success(`${label}이 접수되었습니다.`);
    },
    onError: err => {
      toast.error("안전 조치 실패", { description: err.message });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-warm-coral" size={32} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
          <div className="container py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation("/report")}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <ChevronLeft size={18} className="text-foreground" />
              </button>
              <h1 className="font-semibold text-foreground">
                케미스트리 리포트
              </h1>
            </div>
          </div>
        </header>
        <div className="container py-12">
          <div className="warm-card p-8 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-red-400" />
            <p className="text-sm text-muted-foreground">
              {error?.message ?? "리포트를 불러올 수 없습니다."}
            </p>
            <Button
              onClick={() => setLocation("/report")}
              variant="outline"
              className="rounded-full"
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  const scores: ScoreItem[] = Array.isArray(report.scores)
    ? (report.scores as ScoreItem[])
    : [];
  const highlights: HighlightItem[] = Array.isArray(report.highlights)
    ? (report.highlights as HighlightItem[])
    : [];

  const getScoreLabel = (score: number) => {
    if (score >= 85)
      return { text: "환상의 케미", color: "text-red-500", bg: "bg-red-50" };
    if (score >= 70)
      return {
        text: "좋은 케미",
        color: "text-orange-500",
        bg: "bg-orange-50",
      };
    if (score >= 55)
      return {
        text: "보통 케미",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    return { text: "아쉬운 케미", color: "text-gray-500", bg: "bg-gray-50" };
  };

  const reportFailed = report.status === "failed";
  const label = reportFailed
    ? { text: "생성 실패", color: "text-gray-500", bg: "bg-gray-50" }
    : getScoreLabel(report.overallScore);

  const handleSafetyAction = (
    action: "report" | "block" | "withdraw_consent",
    reason: string
  ) => {
    safetyActionMutation.mutate({
      targetUserId: report.partnerUserId,
      chatId: report.chatId,
      action,
      reason,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation("/report")}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ChevronLeft size={18} className="text-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {report.partnerNickname}님과의 리포트
              </p>
              <p className="text-[10px] text-muted-foreground">
                {report.createdAt
                  ? new Date(report.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </p>
            </div>
            <Button
              onClick={() => setLocation(`/chat-log/${report.chatId}`)}
              size="sm"
              variant="outline"
              className="rounded-full text-xs h-8 px-3"
            >
              <MessageSquare size={12} className="mr-1" />
              대화 보기
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-5 space-y-5">
        {/* 종합 점수 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="warm-card p-6 text-center space-y-4"
        >
          <div className="relative inline-block">
            <div
              className={`h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-lg ${reportFailed ? "bg-gray-100" : "bg-gradient-to-br from-[#E8725C] to-[#FF9A76]"}`}
            >
              <span
                className={`text-3xl font-bold ${reportFailed ? "text-gray-500" : "text-white"}`}
              >
                {reportFailed ? "!" : report.overallScore}
              </span>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${label.color} ${label.bg}`}
              >
                {label.text}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <h2 className="font-display text-lg font-bold text-foreground">
              {report.myNickname}{" "}
              <Heart
                size={16}
                className="inline text-warm-coral fill-warm-coral mx-1"
              />{" "}
              {report.partnerNickname}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {report.totalMessages}개의 대화를 기반으로 분석되었습니다
            </p>
          </div>

          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                size={18}
                className={
                  !reportFailed && idx < Math.round(report.overallScore / 20)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-200"
                }
              />
            ))}
          </div>
        </motion.div>

        {reportFailed && (
          <div className="warm-card p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-gray-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              리포트 생성에 실패해 사용한 하트가 환불되었습니다. 대화 기록은
              남아 있으니 잠시 후 다시 시도해주세요.
            </p>
          </div>
        )}

        {/* 레이더 차트 */}
        {!reportFailed && scores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="warm-card p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-warm-coral" />
              <h3 className="text-sm font-semibold text-foreground">
                호환성 분석
              </h3>
            </div>
            <RadarChart scores={scores} />
          </motion.div>
        )}

        {/* 항목별 점수 바 차트 */}
        {scores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="warm-card p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Star size={16} className="text-warm-coral" />
              <h3 className="text-sm font-semibold text-foreground">
                항목별 점수
              </h3>
            </div>
            <div className="space-y-3">
              {scores.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                >
                  <ScoreBar label={s.label} score={s.score} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI 요약 */}
        {report.summary && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="warm-card p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-warm-coral" />
              <h3 className="text-sm font-semibold text-foreground">
                AI 분석 요약
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {report.summary}
            </p>
          </motion.div>
        )}

        {/* 하이라이트 */}
        {highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="warm-card p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-warm-coral" />
              <h3 className="text-sm font-semibold text-foreground">
                대화 하이라이트
              </h3>
            </div>
            <div className="space-y-2.5">
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-warm-light/50"
                >
                  <div className="h-5 w-5 rounded-full bg-warm-coral/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-warm-coral">
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {h.topic}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                      {h.insight}
                    </p>
                    <span
                      className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full ${
                        h.sentiment === "positive"
                          ? "bg-green-50 text-green-600"
                          : h.sentiment === "negative"
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {h.sentiment === "positive"
                        ? "긍정적"
                        : h.sentiment === "negative"
                          ? "부정적"
                          : "중립"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="warm-card p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-sage" />
            <h3 className="text-sm font-semibold text-foreground">안전 조치</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              className="rounded-full bg-white px-2 text-xs"
              disabled={safetyActionMutation.isPending}
              onClick={() =>
                handleSafetyAction("report", "부적절한 대화 또는 프로필")
              }
            >
              <ShieldAlert size={13} className="mr-1" />
              신고
            </Button>
            <Button
              variant="outline"
              className="rounded-full bg-white px-2 text-xs"
              disabled={safetyActionMutation.isPending}
              onClick={() => handleSafetyAction("block", "다시 매칭 제외")}
            >
              <Ban size={13} className="mr-1" />
              차단
            </Button>
            <Button
              variant="outline"
              className="rounded-full bg-white px-2 text-xs"
              disabled={safetyActionMutation.isPending}
              onClick={() =>
                handleSafetyAction("withdraw_consent", "후속 진행 동의 철회")
              }
            >
              <RotateCcw size={13} className="mr-1" />
              동의 철회
            </Button>
          </div>
        </motion.div>

        {/* 대화 보기 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="warm-card p-5 text-center space-y-3"
        >
          <p className="text-sm text-muted-foreground">
            이 리포트의 원본 대화가 궁금하신가요?
          </p>
          <Button
            onClick={() => setLocation(`/chat-log/${report.chatId}`)}
            className="bg-warm-coral hover:bg-warm-coral/90 text-white rounded-full px-6"
          >
            <MessageSquare size={14} className="mr-1.5" />
            대화 로그 보기
          </Button>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}

// ─── 메인 라우터 ───
export default function Report() {
  const [matchDetail, params] = useRoute("/report/:id");

  if (matchDetail && params?.id) {
    const reportId = parseInt(params.id, 10);
    if (!isNaN(reportId)) {
      return <ReportDetailView reportId={reportId} />;
    }
  }

  return <ReportListView />;
}
