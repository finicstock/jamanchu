/**
 * Home - 자만추 랜딩 페이지
 * Design: Warm Afternoon Conversation - 건실한 만남
 * 따뜻한 크림 배경, Warm Coral + Sage Green 포인트
 */
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, FileText, Shield, Sparkles, ArrowRight, LogIn, LogOut, User, Settings, Bell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/hero-warm-UchKCieCyinfad4qZVoK5c.webp";
const CLONE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/clone-activity-warm-hhH8j4eLwaWyKQMeaVmVGy.webp";
const MATCH_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/match-warm-cZheKiyUqyEmwcHQVHfan9.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6 },
  }),
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI 클론 생성",
    desc: "내 성격과 가치관을 바탕으로 사전 궁합 탐색용 클론을 만듭니다",
    color: "bg-warm-coral-light text-warm-coral",
  },
  {
    icon: MessageSquare,
    title: "동의 기반 사전 대화",
    desc: "사람끼리 대화하기 전, AI 클론끼리 짧게 대화하며 어색함을 줄입니다",
    color: "bg-sage-light text-sage",
  },
  {
    icon: FileText,
    title: "케미스트리 리포트",
    desc: "대화 분석을 통해 상세한 호환성 보고서를 제공합니다",
    color: "bg-gold-light text-gold",
  },
  {
    icon: Shield,
    title: "안전한 만남",
    desc: "충분한 정보를 확인한 후에만 실제 대화를 시작합니다",
    color: "bg-sage-light text-sage",
  },
];

function NotificationBadge() {
  const { data: count } = trpc.notification.getUnreadCount.useQuery();
  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#E8725C] text-white text-[9px] font-bold flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "자만추 - AI 클론이 사전 궁합을 탐색하는 데이팅 앱";
  }, []);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 mx-auto rounded-full bg-warm-coral-light flex items-center justify-center animate-gentle-pulse">
            <Heart size={20} className="text-warm-coral" />
          </div>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Auth Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-foreground">자만추</span>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-light rounded-full">
                <User size={14} className="text-sage" />
                <span className="text-xs font-medium text-sage">{user?.name || '회원'}</span>
              </div>
              <button
                onClick={() => setLocation("/notifications")}
                className="relative flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell size={14} />
                <NotificationBadge />
              </button>
              <button
                onClick={() => setLocation("/mypage")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-coral-light text-warm-coral text-xs font-medium rounded-full hover:bg-[#f5d0c8] transition-colors"
              >
                <Heart size={12} />
                마이페이지
              </button>
              {user?.role === "admin" && (
                <button
                  onClick={() => setLocation("/admin")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Settings size={12} />
                  관리자
                </button>
              )}
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut size={12} />
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => { window.location.href = getLoginUrl(); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-warm-coral text-white text-xs font-semibold rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <LogIn size={12} />
              로그인 / 회원가입
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="따뜻한 카페에서의 만남"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/80 to-background" />
        </div>

        <div className="relative container pt-16 pb-12">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0} className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.85)', color: '#c0564a', backdropFilter: 'blur(4px)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-warm-coral animate-gentle-pulse" />
                건실한 만남을 위한 AI 매칭
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-display text-4xl font-bold leading-tight"
              style={{ color: '#2d2520', textShadow: '0 1px 8px rgba(255,255,255,0.8)' }}
            >
              진심이 통하는<br />
              <span className="text-warm-coral" style={{ textShadow: '0 1px 8px rgba(255,255,255,0.8)' }}>자연스러운 만남</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base leading-relaxed max-w-[320px]"
              style={{ color: '#4a4039', textShadow: '0 1px 6px rgba(255,255,255,0.7)' }}
            >
              AI 클론이 먼저 궁합을 탐색하고,
              사람끼리 대화할 만한 이유를 찾아줍니다.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex gap-3 pt-2">
              {isAuthenticated ? (
                <Button
                  onClick={() => setLocation("/clone-setup")}
                  className="h-12 px-6 gradient-coral text-white font-semibold rounded-full shadow-lg shadow-warm-coral/20 hover:shadow-xl hover:shadow-warm-coral/30 transition-all"
                >
                  클론 만들기
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => { window.location.href = getLoginUrl(); }}
                  className="h-12 px-6 gradient-coral text-white font-semibold rounded-full shadow-lg shadow-warm-coral/20 hover:shadow-xl hover:shadow-warm-coral/30 transition-all"
                >
                  시작하기
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              )}
              <Button
                onClick={() => setLocation("/dashboard")}
                variant="outline"
                className="h-12 px-6 rounded-full border-border bg-white/80 backdrop-blur-sm text-foreground font-medium hover:bg-white"
              >
                둘러보기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-8"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              어떻게 작동하나요?
            </h2>
            <p className="text-sm text-muted-foreground">
              세 단계로 진심이 통하는 상대를 만나보세요
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "클론 만들기",
                desc: "관심사, 가치관, 말하지 않을 정보를 입력하면 사전 탐색용 AI 클론이 만들어집니다.",
                img: null,
              },
              {
                step: "02",
                title: "클론이 대화하기",
                desc: "양쪽 사용자의 동의 범위 안에서 AI 클론이 짧은 사전 대화를 나눕니다.",
                img: CLONE_IMG,
              },
              {
                step: "03",
                title: "리포트 확인하기",
                desc: "대화 분석 결과를 확인한 뒤, 충분히 괜찮다고 느껴질 때 실제 대화를 신청하세요.",
                img: null,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i + 1}
                className="warm-card p-5"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <span className="font-display text-3xl font-bold text-warm-coral/30">
                      {item.step}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {item.img && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-40 object-cover" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center space-y-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              자만추만의 특별함
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 1}
                className="warm-card p-4 space-y-3"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Match Preview */}
      <section className="container py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-6"
        >
          <motion.div variants={fadeUp} custom={0} className="warm-card overflow-hidden">
            <img
              src={MATCH_IMG}
              alt="인연의 정원"
              className="w-full aspect-square object-cover"
            />
            <div className="p-5 space-y-3 text-center">
              <h3 className="font-display text-xl font-bold text-foreground">
                진짜 잘 맞는 사람을 만나세요
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                외모가 아닌 가치관, 성격, 대화 스타일로 매칭합니다.
                AI가 정리한 사전 궁합 리포트로 대화를 시작할 이유를 확인하세요.
              </p>
              <Button
                onClick={() => setLocation("/clone-setup")}
                className="h-11 px-6 gradient-coral text-white font-semibold rounded-full shadow-md"
              >
                <Heart size={16} className="mr-2" />
                무료로 시작하기
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t border-border">
        <div className="text-center space-y-2">
          <p className="font-display text-lg font-bold text-foreground">자만추</p>
          <p className="text-xs text-muted-foreground">
            AI 클론 기반 사전 궁합 탐색 · 자연스러운 만남을 추구합니다
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            AI매칭 · 가치관매칭 · 성격매칭 · 클론채팅 · 소개팅
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            &copy; 2025 자만추. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
