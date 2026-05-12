/**
 * CloneSetup - AI 클론 생성 및 설정
 * Design: Warm Afternoon Conversation - 건실한 만남
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

const ONBOARDING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/onboarding-warm-AuNCrEHrFzvfAzEhNQpq3E.webp";

const STEPS = [
  { id: 1, title: "기본 정보", icon: Heart },
  { id: 2, title: "컨텍스트", icon: Upload },
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
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => step > 1 ? setStep(step - 1) : setLocation("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-semibold text-foreground">
              클론 만들기
            </h1>
            <span className="text-xs text-muted-foreground">{step}/4</span>
          </div>
          <Progress value={(step / 4) * 100} className="h-1 mt-3 bg-muted" />
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
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    isActive
                      ? "bg-warm-coral text-white shadow-md shadow-warm-coral/20"
                      : isDone
                      ? "bg-sage text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <Check size={14} />
                  ) : (
                    <Icon size={14} />
                  )}
                </div>
                <span
                  className={`text-[9px] font-medium ${
                    isActive ? "text-warm-coral" : isDone ? "text-sage" : "text-muted-foreground"
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">기본 정보</h2>
                <p className="text-sm text-muted-foreground">클론의 기본 정보를 설정해주세요.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">닉네임</label>
                  <input
                    type="text"
                    placeholder="클론의 닉네임을 입력하세요"
                    className="w-full h-12 px-4 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:border-warm-coral focus:ring-2 focus:ring-warm-coral/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">나이</label>
                  <input
                    type="number"
                    placeholder="나이를 입력하세요"
                    className="w-full h-12 px-4 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:border-warm-coral focus:ring-2 focus:ring-warm-coral/10 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">성별</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["남성", "여성", "기타"].map((gender) => (
                      <button
                        key={gender}
                        className="h-12 border border-border rounded-xl text-muted-foreground hover:border-warm-coral hover:text-warm-coral hover:bg-warm-coral-light/50 transition-all text-sm font-medium"
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">관심 성별</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["남성", "여성", "모두"].map((pref) => (
                      <button
                        key={pref}
                        className="h-12 border border-border rounded-xl text-muted-foreground hover:border-sage hover:text-sage hover:bg-sage-light/50 transition-all text-sm font-medium"
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">컨텍스트 업로드</h2>
                <p className="text-sm text-muted-foreground">
                  AI 클론이 당신을 더 잘 이해할 수 있도록 정보를 제공하세요.
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
                    className="w-full warm-card p-4 flex items-center gap-4 text-left"
                    onClick={() => toast.info("데모 버전에서는 업로드가 지원되지 않습니다.")}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-light">
                      <item.icon size={18} className="text-sage" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                      <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Upload size={16} className="text-muted-foreground" />
                  </button>
                ))}
              </div>

              <div className="warm-card p-4 bg-sage-light/30 border-sage/20">
                <div className="flex items-start gap-3">
                  <Brain size={18} className="text-sage shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    업로드한 데이터는 AI 클론 학습에만 사용되며, 다른 사용자에게 공개되지 않습니다.
                    더 많은 컨텍스트를 제공할수록 클론의 정확도가 높아집니다.
                  </p>
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">성격 설정</h2>
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
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-warm-coral text-white shadow-sm"
                          : "bg-white border border-border text-muted-foreground hover:border-warm-coral/40 hover:text-warm-coral"
                      }`}
                    >
                      {trait}
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-border" />

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
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-sage text-white shadow-sm"
                          : "bg-white border border-border text-muted-foreground hover:border-sage/40 hover:text-sage"
                      }`}
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">클론 생성</h2>
                <p className="text-sm text-muted-foreground">
                  모든 준비가 완료되었습니다. AI 클론을 생성하세요.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={ONBOARDING_IMG}
                  alt="AI 클론 프로필"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                {isGenerating && (
                  <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <div className="flex items-center gap-2 text-warm-coral text-sm font-medium bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2">
                      <Brain size={16} className="animate-gentle-pulse" />
                      <span>페르소나 학습 중...</span>
                    </div>
                    <Progress value={67} className="h-1.5 bg-white/50" />
                  </div>
                )}
              </div>

              <div className="warm-card p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm">클론 요약</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">성격</span>
                    <span className="text-foreground font-medium">
                      {selectedTraits.length > 0 ? selectedTraits.join(", ") : "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">관심사</span>
                    <span className="text-foreground font-medium">
                      {selectedInterests.length > 0 ? selectedInterests.join(", ") : "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">컨텍스트</span>
                    <span className="text-muted-foreground">데모 데이터</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-[60px] left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-border">
        <div className="container py-3">
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="w-full h-13 gradient-coral text-white font-semibold text-base rounded-full shadow-lg shadow-warm-coral/20"
            >
              다음 단계
              <ChevronRight className="ml-2" size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-13 gradient-sage text-white font-semibold text-base rounded-full shadow-lg shadow-sage/20 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Brain size={18} className="mr-2 animate-gentle-pulse" />
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
