/**
 * CloneSetup - AI 클론 생성 및 설정
 * Design: Night Walker - Neo-Brutalism + Soft Dark UI
 * 단계별 온보딩, 컨텍스트 업로드, 페르소나 설정
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import MobileNav from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  MessageCircle,
  Heart,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Brain,
} from "lucide-react";
import { toast } from "sonner";

const PERSONA_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/onboarding-persona-BGieyYgQjHQE5VWMBPsxws.webp";

const STEPS = [
  { id: 1, title: "기본 정보", icon: Heart },
  { id: 2, title: "컨텍스트 업로드", icon: Upload },
  { id: 3, title: "성격 설정", icon: MessageCircle },
  { id: 4, title: "클론 생성", icon: Sparkles },
];

const PERSONALITY_TRAITS = [
  "유머러스", "진지함", "모험적", "차분함", "열정적",
  "지적", "감성적", "현실적", "낙관적", "신중함",
  "외향적", "내향적", "창의적", "분석적", "따뜻함",
];

const INTERESTS = [
  "여행", "음악", "영화", "독서", "요리",
  "운동", "카페", "사진", "반려동물", "게임",
  "미술", "와인", "등산", "캠핑", "테크",
];

export default function CloneSetup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : prev.length < 5 ? [...prev, trait] : prev
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : prev.length < 7 ? [...prev, interest] : prev
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("AI 클론이 생성되었습니다!", {
        description: "클론이 지금부터 활동을 시작합니다.",
      });
      setLocation("/dashboard");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[oklch(0.22_0.005_260)] bg-background/95 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => step > 1 ? setStep(step - 1) : setLocation("/")} className="text-foreground/60 hover:text-foreground transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-display text-lg text-foreground tracking-wide">
              CLONE SETUP
            </h1>
            <span className="text-xs text-muted-foreground">{step}/4</span>
          </div>
          <Progress value={(step / 4) * 100} className="h-1 mt-3 bg-[oklch(0.18_0.005_260)]" />
        </div>
      </header>

      {/* Step Indicators */}
      <div className="container py-4">
        <div className="flex justify-between">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-8 w-8 items-center justify-center border-2 transition-all ${
                    isActive
                      ? "border-neon-mint bg-neon-mint/10"
                      : isDone
                      ? "border-neon-mint bg-neon-mint/20"
                      : "border-[oklch(0.3_0.005_260)] bg-transparent"
                  }`}
                >
                  {isDone ? (
                    <Check size={14} className="text-neon-mint" />
                  ) : (
                    <Icon
                      size={14}
                      className={isActive ? "text-neon-mint" : "text-muted-foreground"}
                    />
                  )}
                </div>
                <span
                  className={`text-[9px] tracking-wider uppercase ${
                    isActive ? "text-neon-mint" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="container py-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-3xl text-foreground mb-2">BASIC INFO</h2>
                <p className="text-sm text-muted-foreground">클론의 기본 정보를 설정해주세요.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">닉네임</label>
                  <input
                    type="text"
                    placeholder="클론의 닉네임을 입력하세요"
                    className="w-full h-12 px-4 bg-[oklch(0.14_0.005_260)] border-2 border-[oklch(0.25_0.005_260)] text-foreground placeholder:text-muted-foreground focus:border-neon-mint focus:outline-none transition-colors"
                    style={{ borderRadius: "2px" }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">나이</label>
                  <input
                    type="number"
                    placeholder="나이를 입력하세요"
                    className="w-full h-12 px-4 bg-[oklch(0.14_0.005_260)] border-2 border-[oklch(0.25_0.005_260)] text-foreground placeholder:text-muted-foreground focus:border-neon-mint focus:outline-none transition-colors"
                    style={{ borderRadius: "2px" }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">성별</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["남성", "여성", "기타"].map((gender) => (
                      <button
                        key={gender}
                        className="h-12 border-2 border-[oklch(0.25_0.005_260)] text-foreground/60 hover:border-neon-mint hover:text-neon-mint transition-all text-sm font-medium"
                        style={{ borderRadius: "2px" }}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">관심 성별</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["남성", "여성", "모두"].map((pref) => (
                      <button
                        key={pref}
                        className="h-12 border-2 border-[oklch(0.25_0.005_260)] text-foreground/60 hover:border-neon-pink hover:text-neon-pink transition-all text-sm font-medium"
                        style={{ borderRadius: "2px" }}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-3xl text-foreground mb-2">CONTEXT UPLOAD</h2>
                <p className="text-sm text-muted-foreground">
                  AI 클론이 당신을 더 잘 이해할 수 있도록 컨텍스트를 업로드하세요.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "카카오톡 대화 내역", desc: "txt 파일로 내보내기", icon: MessageCircle },
                  { label: "자기소개 텍스트", desc: "자유롭게 작성", icon: Upload },
                  { label: "SNS 프로필", desc: "인스타그램, 트위터 등", icon: Sparkles },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full brutal-card p-4 flex items-center gap-4 text-left hover:border-neon-mint/50 transition-colors"
                    onClick={() => toast.info("데모 버전에서는 업로드가 지원되지 않습니다.")}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-neon-mint/30 bg-neon-mint/5">
                      <item.icon size={18} className="text-neon-mint" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{item.label}</h3>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Upload size={16} className="ml-auto text-muted-foreground" />
                  </button>
                ))}
              </div>

              <div className="brutal-card p-4 border-neon-mint/20">
                <div className="flex items-start gap-3">
                  <Brain size={18} className="text-neon-mint shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      업로드한 데이터는 AI 클론 학습에만 사용되며, 다른 사용자에게 공개되지 않습니다. 
                      더 많은 컨텍스트를 제공할수록 클론의 정확도가 높아집니다.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-3xl text-foreground mb-2">PERSONALITY</h2>
                <p className="text-sm text-muted-foreground">
                  성격 특성을 선택하세요 (최대 5개)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map((trait) => {
                  const isSelected = selectedTraits.includes(trait);
                  return (
                    <button
                      key={trait}
                      onClick={() => toggleTrait(trait)}
                      className={`px-3 py-2 border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-neon-mint bg-neon-mint/10 text-neon-mint"
                          : "border-[oklch(0.25_0.005_260)] text-foreground/50 hover:border-foreground/30"
                      }`}
                      style={{ borderRadius: "2px" }}
                    >
                      {trait}
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-[oklch(0.22_0.005_260)]" />

              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  관심사를 선택하세요 (최대 7개)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-2 border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-neon-pink bg-neon-pink/10 text-neon-pink"
                          : "border-[oklch(0.25_0.005_260)] text-foreground/50 hover:border-foreground/30"
                      }`}
                      style={{ borderRadius: "2px" }}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-3xl text-foreground mb-2">CREATE CLONE</h2>
                <p className="text-sm text-muted-foreground">
                  모든 준비가 완료되었습니다. AI 클론을 생성하세요.
                </p>
              </div>

              <div className="relative overflow-hidden border-2 border-[oklch(0.22_0.005_260)]" style={{ borderRadius: "2px" }}>
                <img
                  src={PERSONA_IMG}
                  alt="AI 클론"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  {isGenerating && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-neon-mint text-sm font-medium">
                        <Brain size={16} className="animate-pulse" />
                        <span>페르소나 학습 중...</span>
                        <span className="animate-typing-cursor">|</span>
                      </div>
                      <Progress value={67} className="h-1 bg-[oklch(0.18_0.005_260)]" />
                    </div>
                  )}
                </div>
              </div>

              <div className="brutal-card p-4 space-y-3">
                <h3 className="font-bold text-foreground text-sm">클론 요약</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">성격</span>
                    <span className="text-foreground">
                      {selectedTraits.length > 0 ? selectedTraits.join(", ") : "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">관심사</span>
                    <span className="text-foreground">
                      {selectedInterests.length > 0 ? selectedInterests.join(", ") : "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">컨텍스트</span>
                    <span className="text-foreground/50">데모 데이터</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-[68px] left-0 right-0 z-30 border-t-2 border-[oklch(0.22_0.005_260)] bg-background/95 backdrop-blur-xl">
        <div className="container py-3">
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="w-full h-14 bg-neon-mint text-background font-bold text-base tracking-wide border-2 border-neon-mint hover:bg-neon-mint/90 neon-glow-mint transition-all"
              style={{ borderRadius: "2px" }}
            >
              다음 단계
              <ChevronRight className="ml-2" size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-14 bg-neon-pink text-foreground font-bold text-base tracking-wide border-2 border-neon-pink hover:bg-neon-pink/90 neon-glow-pink transition-all disabled:opacity-50"
              style={{ borderRadius: "2px" }}
            >
              {isGenerating ? (
                <>
                  <Brain size={18} className="mr-2 animate-pulse" />
                  클론 생성 중...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  AI 클론 생성하기
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
