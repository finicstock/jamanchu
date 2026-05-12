/**
 * CloneSetup - AI 클론 생성 및 설정
 * Design: Warm Afternoon Conversation - 건실한 만남
 * 실제 tRPC saveProfile 연동
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
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import LoginModal from "@/components/LoginModal";

const ONBOARDING_IMG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663648339158/d5GvYzQcaxufDRxQjQ2CSo/onboarding-warm-AuNCrEHrFzvfAzEhNQpq3E.webp";

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

const GENDER_MAP: Record<string, "male" | "female" | "other"> = {
  "남성": "male",
  "여성": "female",
  "기타": "other",
};

const PREF_MAP: Record<string, "male" | "female" | "both"> = {
  "남성": "male",
  "여성": "female",
  "모두": "both",
};

export default function CloneSetup() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedPref, setSelectedPref] = useState<string | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selfIntro, setSelfIntro] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const saveProfileMutation = trpc.clone.saveProfile.useMutation({
    onSuccess: () => {
      setIsGenerating(false);
      toast.success("AI 클론이 생성되었습니다!", {
        description: "대시보드에서 매칭을 시작해보세요.",
      });
      setLocation("/dashboard");
    },
    onError: (err) => {
      setIsGenerating(false);
      toast.error("클론 생성에 실패했습니다.", {
        description: err.message,
      });
    },
  });

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) =>
      prev.includes(trait)
        ? prev.filter((t) => t !== trait)
        : prev.length < 5
          ? [...prev, trait]
          : prev
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 7
          ? [...prev, interest]
          : prev
    );
  };

  // 단계별 유효성 검증
  const validateStep = (targetStep: number): boolean => {
    setValidationError(null);
    if (targetStep > 1) {
      if (!nickname.trim()) {
        setValidationError("닉네임을 입력해주세요.");
        return false;
      }
      if (!age || parseInt(age) < 18 || parseInt(age) > 100) {
        setValidationError("나이를 올바르게 입력해주세요 (18~100세).");
        return false;
      }
      if (!selectedGender) {
        setValidationError("성별을 선택해주세요.");
        return false;
      }
      if (!selectedPref) {
        setValidationError("관심 성별을 선택해주세요.");
        return false;
      }
    }
    if (targetStep > 3) {
      if (selectedTraits.length === 0) {
        setValidationError("성격 특성을 최소 1개 이상 선택해주세요.");
        return false;
      }
      if (selectedInterests.length === 0) {
        setValidationError("관심사를 최소 1개 이상 선택해주세요.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step + 1)) {
      setStep(step + 1);
    }
  };

  const handleGenerate = () => {
    if (!selectedGender || !selectedPref) {
      toast.error("기본 정보를 모두 입력해주세요.");
      return;
    }
    setIsGenerating(true);
    saveProfileMutation.mutate({
      nickname: nickname.trim(),
      gender: GENDER_MAP[selectedGender],
      interestedIn: PREF_MAP[selectedPref],
      age: parseInt(age),
      personality: selectedTraits,
      interests: selectedInterests,
      values: selfIntro.trim() || undefined,
      lifestyle: undefined,
    });
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoginModal
          isOpen={true}
          onClose={() => setLocation("/")}
          message="클론을 만들려면 로그인이 필요합니다."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-border">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : setLocation("/"))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="font-display font-bold text-foreground">클론 만들기</h1>
            <span className="text-xs text-muted-foreground">{step}/4</span>
          </div>
          <Progress
            value={(step / 4) * 100}
            className="mt-2 h-1.5 bg-muted"
          />
        </div>
      </header>

      {/* Step Indicator */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  s.id < step
                    ? "bg-sage text-white"
                    : s.id === step
                      ? "bg-warm-coral text-white shadow-md shadow-warm-coral/20"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {s.id < step ? (
                  <Check size={16} />
                ) : (
                  <s.icon size={16} />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  s.id === step ? "text-warm-coral" : "text-muted-foreground"
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="container pb-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200"
          >
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{validationError}</p>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div className="container py-2">
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                  기본 정보
                </h2>
                <p className="text-sm text-muted-foreground">
                  클론의 기본 정보를 설정해주세요.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    닉네임 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="클론의 닉네임을 입력하세요"
                    maxLength={50}
                    className="w-full h-12 px-4 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:border-warm-coral focus:ring-2 focus:ring-warm-coral/10 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    나이 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      setValidationError(null);
                    }}
                    placeholder="나이를 입력하세요"
                    min={18}
                    max={100}
                    className="w-full h-12 px-4 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:border-warm-coral focus:ring-2 focus:ring-warm-coral/10 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    성별 <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["남성", "여성", "기타"].map((gender) => {
                      const isSelected = selectedGender === gender;
                      return (
                        <button
                          key={gender}
                          onClick={() => {
                            setSelectedGender(gender);
                            setValidationError(null);
                          }}
                          className={`h-12 rounded-xl text-sm font-medium transition-all border-2 ${
                            isSelected
                              ? "border-warm-coral bg-warm-coral text-white shadow-md shadow-warm-coral/20"
                              : "border-border bg-white text-muted-foreground hover:border-warm-coral/40 hover:text-warm-coral"
                          }`}
                        >
                          {isSelected && (
                            <Check size={14} className="inline mr-1" />
                          )}
                          {gender}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    관심 성별 <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["남성", "여성", "모두"].map((pref) => {
                      const isSelected = selectedPref === pref;
                      return (
                        <button
                          key={pref}
                          onClick={() => {
                            setSelectedPref(pref);
                            setValidationError(null);
                          }}
                          className={`h-12 rounded-xl text-sm font-medium transition-all border-2 ${
                            isSelected
                              ? "border-sage bg-sage text-white shadow-md shadow-sage/20"
                              : "border-border bg-white text-muted-foreground hover:border-sage/40 hover:text-sage"
                          }`}
                        >
                          {isSelected && (
                            <Check size={14} className="inline mr-1" />
                          )}
                          {pref}
                        </button>
                      );
                    })}
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                  자기소개
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI 클론이 당신을 더 잘 이해할 수 있도록 자기소개를 작성해주세요.
                </p>
              </div>

              {/* 자기소개 텍스트 입력 */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <FileText size={12} className="text-warm-coral" />
                  자기소개 (선택사항)
                </label>
                <textarea
                  value={selfIntro}
                  onChange={(e) => setSelfIntro(e.target.value)}
                  placeholder="자유롭게 자신을 소개해주세요. 예: 저는 여행을 좋아하고, 주말에는 카페에서 책을 읽는 걸 즐깁니다. 유머 감각이 좋은 사람을 좋아하고, 서로 존중하는 관계를 추구합니다."
                  maxLength={1000}
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:border-warm-coral focus:ring-2 focus:ring-warm-coral/10 focus:outline-none transition-all resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    자기소개를 작성하면 더 정확한 AI 클론이 만들어집니다.
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {selfIntro.length}/1000
                  </span>
                </div>
              </div>

              {/* 작성 팁 */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">작성 팁</p>
                <div className="space-y-2">
                  {[
                    "평소 대화 스타일이나 말투를 자연스럽게 적어주세요",
                    "좋아하는 것, 싫어하는 것을 구체적으로 적으면 좋아요",
                    "연애에서 중요하게 생각하는 가치관을 적어주세요",
                    "취미나 일상을 공유하면 클론이 더 자연스러워져요",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-4 w-4 rounded-full bg-sage/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[8px] font-bold text-sage">
                          {i + 1}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="warm-card p-4 bg-sage-light/30 border-sage/20">
                <div className="flex items-start gap-3">
                  <Brain size={18} className="text-sage shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/70 leading-relaxed">
                    작성한 자기소개는 AI 클론 학습에만 사용되며, 다른 사용자에게
                    공개되지 않습니다. 더 많은 정보를 제공할수록 클론의 정확도가
                    높아집니다.
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                  성격 설정
                </h2>
                <p className="text-sm text-muted-foreground">
                  성격 특성을 선택하세요 (최소 1개, 최대 5개){" "}
                  <span className="text-red-400">*</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map((trait) => {
                  const isSelected = selectedTraits.includes(trait);
                  return (
                    <button
                      key={trait}
                      onClick={() => {
                        toggleTrait(trait);
                        setValidationError(null);
                      }}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-warm-coral text-white shadow-sm"
                          : "bg-white border border-border text-muted-foreground hover:border-warm-coral/40 hover:text-warm-coral"
                      }`}
                    >
                      {isSelected && (
                        <Check size={12} className="inline mr-1" />
                      )}
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
                      {isSelected && (
                        <Check size={12} className="inline mr-1" />
                      )}
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                  클론 생성
                </h2>
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
                      <span>AI 클론 생성 중...</span>
                    </div>
                    <Progress value={67} className="h-1.5 bg-white/50" />
                  </div>
                )}
              </div>
              <div className="warm-card p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm">
                  클론 요약
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">닉네임</span>
                    <span className="text-foreground font-medium">
                      {nickname || "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">나이</span>
                    <span className="text-foreground font-medium">
                      {age ? `${age}세` : "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">성별</span>
                    <span className="text-foreground font-medium">
                      {selectedGender || "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">관심 성별</span>
                    <span className="text-foreground font-medium">
                      {selectedPref || "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">성격</span>
                    <span className="text-foreground font-medium">
                      {selectedTraits.length > 0
                        ? selectedTraits.join(", ")
                        : "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">관심사</span>
                    <span className="text-foreground font-medium">
                      {selectedInterests.length > 0
                        ? selectedInterests.join(", ")
                        : "미설정"}
                    </span>
                  </div>
                  {selfIntro && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-muted-foreground">자기소개</span>
                      <p className="text-foreground font-medium mt-1 line-clamp-2">
                        {selfIntro}
                      </p>
                    </div>
                  )}
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
              onClick={handleNext}
              className="w-full h-13 gradient-coral text-white font-semibold text-base rounded-full shadow-lg shadow-warm-coral/20"
            >
              다음 단계
              <ChevronRight className="ml-2" size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || saveProfileMutation.isPending}
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
