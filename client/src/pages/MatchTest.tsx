import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  ArrowRight,
  ChevronLeft,
  Heart,
  RefreshCcw,
  Share2,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const MATCH_TEST_DRAFT_KEY = "jamanchu.matchTestDraft";

const GENDERS = ["남성", "여성", "기타"] as const;
const PREFS = ["남성", "여성", "모두"] as const;
const TRAITS = [
  "다정한",
  "대화가 잘 통하는",
  "성실한",
  "유머 있는",
  "차분한",
  "활동적인",
  "감성적인",
  "독립적인",
];
const INTERESTS = [
  "카페",
  "여행",
  "영화",
  "음악",
  "운동",
  "독서",
  "요리",
  "산책",
];
const DEAL_BREAKERS = [
  "흡연",
  "연락 빈도 차이",
  "결혼관 차이",
  "종교 차이",
  "장거리",
  "생활 리듬 차이",
];

const genderMap = {
  남성: "male",
  여성: "female",
  기타: "other",
} as const;

const prefMap = {
  남성: "male",
  여성: "female",
  모두: "both",
} as const;

type MatchResult = {
  overallPercent: number;
  ageBandPercent: number;
  estimatedPeople: number;
  label: string;
  description: string;
  score: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function percentLabel(percent: number) {
  if (percent < 1) return "매우 희귀한 조건";
  if (percent < 5) return "정교한 취향";
  if (percent < 15) return "찾아볼 만한 조건";
  return "넓은 매칭 풀";
}

function resultDescription(percent: number) {
  if (percent < 1) {
    return "조건이 꽤 선명합니다. 대신 클론이 먼저 대화해보면 놓치기 쉬운 예외를 발견하기 좋습니다.";
  }
  if (percent < 5) {
    return "아무나 만나기보다는 결이 맞는 사람을 천천히 찾는 쪽에 가깝습니다.";
  }
  if (percent < 15) {
    return "충분히 현실적인 조건입니다. 관심사와 대화 스타일을 더 넣으면 추천 품질이 좋아집니다.";
  }
  return "매칭 풀이 넓은 편입니다. 핵심 가치관을 조금 더 좁히면 리포트가 더 날카로워집니다.";
}

export default function MatchTest() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("28");
  const [gender, setGender] = useState<(typeof GENDERS)[number] | null>(null);
  const [interestedIn, setInterestedIn] = useState<
    (typeof PREFS)[number] | null
  >(null);
  const [ageMin, setAgeMin] = useState("25");
  const [ageMax, setAgeMax] = useState("34");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [dealBreakers, setDealBreakers] = useState<string[]>([]);
  const [intention, setIntention] = useState("진지한 만남");
  const [result, setResult] = useState<MatchResult | null>(null);

  const normalizedAge = clamp(Number(age) || 28, 18, 80);
  const normalizedAgeMin = clamp(Number(ageMin) || 18, 18, 80);
  const normalizedAgeMax = clamp(
    Math.max(Number(ageMax) || 80, normalizedAgeMin),
    18,
    80
  );

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(gender && normalizedAge >= 18);
    if (step === 2) return Boolean(interestedIn);
    return selectedTraits.length > 0 || selectedInterests.length > 0;
  }, [
    gender,
    interestedIn,
    normalizedAge,
    selectedInterests.length,
    selectedTraits.length,
    step,
  ]);

  const toggle = (
    value: string,
    values: string[],
    setter: (next: string[]) => void,
    max = 5
  ) => {
    if (values.includes(value)) {
      setter(values.filter(item => item !== value));
      return;
    }
    if (values.length >= max) {
      toast.info(`${max}개까지 선택할 수 있어요.`);
      return;
    }
    setter([...values, value]);
  };

  const calculateResult = () => {
    const ageRangeWidth = normalizedAgeMax - normalizedAgeMin + 1;
    const ageFit = clamp(ageRangeWidth / 43, 0.08, 0.86);
    const genderFit = interestedIn === "모두" ? 0.92 : 0.48;
    const traitFit = Math.pow(0.78, selectedTraits.length);
    const interestFit = Math.pow(0.86, selectedInterests.length);
    const dealBreakerFit = Math.pow(0.8, dealBreakers.length);
    const intentionFit =
      intention === "결혼까지 생각"
        ? 0.7
        : intention === "진지한 만남"
          ? 0.82
          : 0.94;

    const raw =
      genderFit *
      ageFit *
      traitFit *
      interestFit *
      dealBreakerFit *
      intentionFit *
      100;
    const overallPercent = clamp(raw, 0.08, 42);
    const ageBandPercent = clamp(overallPercent / ageFit, 0.2, 58);
    const score = Math.round(100 - clamp(overallPercent, 0, 40) * 1.8);

    setResult({
      overallPercent: Number(overallPercent.toFixed(2)),
      ageBandPercent: Number(ageBandPercent.toFixed(2)),
      estimatedPeople: Math.max(
        1,
        Math.round(51_700_000 * (overallPercent / 100))
      ),
      label: percentLabel(overallPercent),
      description: resultDescription(overallPercent),
      score,
    });
  };

  const handleNext = () => {
    if (!canGoNext) {
      toast.info("필수 항목을 먼저 선택해주세요.");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    calculateResult();
  };

  const saveDraftAndStart = () => {
    const values = [
      `매칭률 테스트 결과: 전체 인구 기준 약 ${result?.overallPercent}%`,
      `선호 나이대: ${normalizedAgeMin}-${normalizedAgeMax}세`,
      `선호 성별: ${interestedIn ?? "미선택"}`,
      `선호 성향: ${selectedTraits.join(", ") || "미선택"}`,
      `공통 관심사 후보: ${selectedInterests.join(", ") || "미선택"}`,
      `중요하게 보는 조건: ${dealBreakers.join(", ") || "미선택"}`,
      `만남 의도: ${intention}`,
    ].join("\n");

    localStorage.setItem(
      MATCH_TEST_DRAFT_KEY,
      JSON.stringify({
        nickname: nickname.trim(),
        age: normalizedAge,
        gender: gender ? genderMap[gender] : undefined,
        interestedIn: interestedIn ? prefMap[interestedIn] : undefined,
        personality: selectedTraits,
        interests: selectedInterests,
        values,
      })
    );
    setLocation("/clone-setup");
  };

  const shareResult = async () => {
    if (!result) return;
    const text = `내 자만추 매칭률은 전체 인구 기준 약 ${result.overallPercent}% (${result.label})래. 너도 테스트해봐: ${window.location.origin}/match-test`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "자만추 매칭률 테스트", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("공유 문구를 복사했습니다.");
      }
    } catch {
      toast.error("공유를 완료하지 못했습니다.");
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background pb-10">
        <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-xl">
          <div className="container flex items-center justify-between py-3">
            <button
              onClick={() => setResult(null)}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              aria-label="테스트로 돌아가기"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="font-display text-base font-bold text-foreground">
              매칭률 테스트
            </p>
            <button
              onClick={shareResult}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              aria-label="결과 공유하기"
            >
              <Share2 size={17} />
            </button>
          </div>
        </header>

        <main className="container py-6 space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="warm-card overflow-hidden text-center"
          >
            <div className="bg-gradient-to-br from-warm-coral-light via-white to-sage-light p-6 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                <Target size={28} className="text-warm-coral" />
              </div>
              <div>
                <p className="text-xs font-semibold text-warm-coral">
                  자만추 추정 매칭 풀
                </p>
                <h1 className="mt-2 font-display text-5xl font-bold text-foreground">
                  {result.overallPercent}%
                </h1>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {result.label}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.description}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-warm-light p-4 text-left">
                  <Users size={16} className="mb-2 text-sage" />
                  <p className="text-[10px] text-muted-foreground">
                    선호 나이대 안에서는
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {result.ageBandPercent}%
                  </p>
                </div>
                <div className="rounded-2xl bg-warm-light p-4 text-left">
                  <Heart size={16} className="mb-2 text-warm-coral" />
                  <p className="text-[10px] text-muted-foreground">
                    예상 후보 규모
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {result.estimatedPeople.toLocaleString("ko-KR")}명
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">
                    조건 선명도
                  </p>
                  <p className="text-xs font-bold text-warm-coral">
                    {result.score}점
                  </p>
                </div>
                <Progress value={result.score} className="mt-3 h-2" />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  실제 통계가 아닌 테스트 응답 기반 추정치입니다. 자만추는 이
                  조건을 클론의 사전 대화와 리포트에 활용합니다.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={saveDraftAndStart}
                  className="h-12 w-full rounded-full bg-warm-coral text-white hover:bg-warm-coral/90"
                >
                  지금 조건 그대로 클론 데이팅 시작할래요
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button
                  onClick={() => {
                    setResult(null);
                    setStep(1);
                  }}
                  variant="outline"
                  className="h-11 w-full rounded-full bg-white"
                >
                  <RefreshCcw size={15} className="mr-2" />
                  조건 다시 해보기
                </Button>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-xl">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : setLocation("/"))}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              aria-label="뒤로가기"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="font-display text-base font-bold text-foreground">
              매칭률 테스트
            </p>
            <span className="text-xs text-muted-foreground">{step}/3</span>
          </div>
          <Progress value={(step / 3) * 100} className="mt-2 h-1.5" />
        </div>
      </header>

      <main className="container py-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          {step === 1 && (
            <>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-coral-light px-3 py-1 text-xs font-semibold text-warm-coral">
                  <Sparkles size={12} />
                  가입 없이 1분 테스트
                </span>
                <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
                  나와 맞는 사람은
                  <br />
                  얼마나 있을까요?
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  내 기본 정보와 선호 조건을 바탕으로 자만추식 추정 매칭 풀을
                  계산해볼게요.
                </p>
              </div>

              <div className="warm-card p-4 space-y-4">
                <label className="space-y-1.5 block">
                  <span className="text-xs font-medium text-foreground">
                    닉네임
                  </span>
                  <input
                    value={nickname}
                    onChange={event => setNickname(event.target.value)}
                    placeholder="결과 저장용 닉네임"
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-warm-coral"
                  />
                </label>

                <label className="space-y-1.5 block">
                  <span className="text-xs font-medium text-foreground">
                    나이
                  </span>
                  <input
                    type="number"
                    min={18}
                    max={80}
                    value={age}
                    onChange={event => setAge(event.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-warm-coral"
                  />
                </label>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">성별</p>
                  <div className="grid grid-cols-3 gap-2">
                    {GENDERS.map(item => (
                      <button
                        key={item}
                        onClick={() => setGender(item)}
                        className={`h-11 rounded-xl border text-sm font-medium transition ${
                          gender === item
                            ? "border-warm-coral bg-warm-coral text-white"
                            : "border-border bg-white text-foreground"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  어떤 사람을 원하나요?
                </h1>
                <p className="text-sm text-muted-foreground">
                  조건이 좁을수록 매칭 풀은 작아지고, 리포트는 더 선명해져요.
                </p>
              </div>

              <div className="warm-card p-4 space-y-5">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">
                    선호 성별
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {PREFS.map(item => (
                      <button
                        key={item}
                        onClick={() => setInterestedIn(item)}
                        className={`h-11 rounded-xl border text-sm font-medium transition ${
                          interestedIn === item
                            ? "border-sage bg-sage text-white"
                            : "border-border bg-white text-foreground"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1.5 block">
                    <span className="text-xs font-medium text-foreground">
                      최소 나이
                    </span>
                    <input
                      type="number"
                      min={18}
                      max={80}
                      value={ageMin}
                      onChange={event => setAgeMin(event.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-sage"
                    />
                  </label>
                  <label className="space-y-1.5 block">
                    <span className="text-xs font-medium text-foreground">
                      최대 나이
                    </span>
                    <input
                      type="number"
                      min={18}
                      max={80}
                      value={ageMax}
                      onChange={event => setAgeMax(event.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-sage"
                    />
                  </label>
                </div>

                <label className="space-y-1.5 block">
                  <span className="text-xs font-medium text-foreground">
                    만남 의도
                  </span>
                  <select
                    value={intention}
                    onChange={event => setIntention(event.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-sage"
                  >
                    <option>가볍게 알아가기</option>
                    <option>진지한 만남</option>
                    <option>결혼까지 생각</option>
                  </select>
                </label>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  마지막으로 결을 맞춰볼게요
                </h1>
                <p className="text-sm text-muted-foreground">
                  성향과 관심사는 나중에 클론 생성 화면에 그대로 가져갈 수
                  있어요.
                </p>
              </div>

              <div className="space-y-4">
                <ChoiceBlock
                  title="선호하는 성향"
                  items={TRAITS}
                  values={selectedTraits}
                  onSelect={item =>
                    toggle(item, selectedTraits, setSelectedTraits, 5)
                  }
                />
                <ChoiceBlock
                  title="함께 나누고 싶은 관심사"
                  items={INTERESTS}
                  values={selectedInterests}
                  onSelect={item =>
                    toggle(item, selectedInterests, setSelectedInterests, 5)
                  }
                />
                <ChoiceBlock
                  title="중요하게 보는 조건"
                  items={DEAL_BREAKERS}
                  values={dealBreakers}
                  onSelect={item =>
                    toggle(item, dealBreakers, setDealBreakers, 4)
                  }
                />
              </div>
            </>
          )}
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur-xl">
        <div className="container py-3">
          <Button
            onClick={handleNext}
            className="h-12 w-full rounded-full bg-warm-coral text-white hover:bg-warm-coral/90"
          >
            {step === 3 ? "내 매칭률 보기" : "다음"}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChoiceBlock({
  title,
  items,
  values,
  onSelect,
}: {
  title: string;
  items: string[];
  values: string[];
  onSelect: (item: string) => void;
}) {
  return (
    <section className="warm-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{values.length}개</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map(item => {
          const selected = values.includes(item);
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                selected
                  ? "border-warm-coral bg-warm-coral text-white"
                  : "border-border bg-white text-foreground"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </section>
  );
}
