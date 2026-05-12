import { useMemo, useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  ArrowRight,
  Brain,
  ChevronLeft,
  FileText,
  Heart,
  Link as LinkIcon,
  MessageCircle,
  RefreshCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const MATCH_TEST_DRAFT_KEY = "jamanchu.matchTestDraft";
const MAX_KAKAO_FILE_BYTES = 1024 * 1024;
const MAX_CONTEXT_CHARS = 7000;

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

type KakaoContext = {
  name: string;
  size: number;
  messageCount: number;
  speakerCount: number;
  excerpt: string;
  keywords: string[];
  warmthScore: number;
  responseRhythm: number;
};

type MatchResult = {
  overallPercent: number;
  ageBandPercent: number;
  estimatedPeople: number;
  label: string;
  description: string;
  score: number;
  aiSignals: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function normalizeSocialUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function inferSocialPlatform(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host.includes("instagram.com")) return "Instagram";
  if (host.includes("youtube.com") || host.includes("youtu.be"))
    return "YouTube";
  if (host.includes("x.com") || host.includes("twitter.com")) return "X";
  if (host.includes("linkedin.com")) return "LinkedIn";
  if (host.includes("tistory.com")) return "Tistory";
  if (host.includes("naver.com")) return "Naver";
  if (host.includes("brunch.co.kr")) return "Brunch";
  return host;
}

function redactSensitiveText(text: string) {
  return text
    .replace(/010[-.\s]?\d{4}[-.\s]?\d{4}/g, "[연락처]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[이메일]");
}

function parseKakaoLine(line: string) {
  const bracketMatch = line.match(/^\[([^\]]{1,40})\]\s*\[[^\]]+\]\s*(.+)$/);
  if (bracketMatch) {
    return { speaker: bracketMatch[1].trim(), message: bracketMatch[2].trim() };
  }

  const commaMatch = line.match(/^\d{4}\..*?,\s*([^:]{1,40})\s*:\s*(.+)$/);
  if (commaMatch) {
    return { speaker: commaMatch[1].trim(), message: commaMatch[2].trim() };
  }

  return null;
}

function pickKeywords(text: string) {
  const stopWords = new Set([
    "그리고",
    "근데",
    "진짜",
    "오늘",
    "내일",
    "그냥",
    "나는",
    "너무",
    "ㅋㅋ",
    "ㅎㅎ",
    "이거",
    "저거",
  ]);
  const counts = new Map<string, number>();
  for (const token of text
    .replace(/[^A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, " ")
    .split(/\s+/)
    .map(item => item.trim())
    .filter(item => item.length >= 2 && !stopWords.has(item))) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([keyword]) => keyword);
}

function analyzeKakaoText(fileName: string, size: number, rawText: string) {
  const normalized = redactSensitiveText(rawText)
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
  const lines = normalized
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
  const speakers = new Map<string, string>();
  const messages: string[] = [];

  for (const line of lines) {
    const parsed = parseKakaoLine(line);
    if (!parsed) continue;
    if (!speakers.has(parsed.speaker)) {
      speakers.set(parsed.speaker, `화자${speakers.size + 1}`);
    }
    messages.push(`${speakers.get(parsed.speaker)}: ${parsed.message}`);
  }

  const source = messages.length >= 5 ? messages : lines;
  const joined = source.join("\n");
  const livelyMarks = (joined.match(/[!?~ㅋㅎ😊🙂😄]/g) ?? []).length;
  const warmthScore = clamp(
    Math.round((livelyMarks / Math.max(source.length, 1)) * 120),
    12,
    96
  );
  const averageLength =
    source.reduce((sum, line) => sum + line.length, 0) /
    Math.max(source.length, 1);
  const responseRhythm = clamp(
    Math.round(100 - Math.abs(averageLength - 28)),
    25,
    94
  );

  return {
    name: fileName,
    size,
    messageCount: source.length,
    speakerCount: Math.max(speakers.size, 1),
    excerpt: joined.slice(0, MAX_CONTEXT_CHARS),
    keywords: pickKeywords(joined),
    warmthScore,
    responseRhythm,
  } satisfies KakaoContext;
}

function percentLabel(percent: number) {
  if (percent < 1) return "희귀한 취향의 소유자";
  if (percent < 5) return "정교하게 맞는 사람을 찾는 타입";
  if (percent < 15) return "현실적으로 찾아볼 만한 타입";
  return "매칭 풀이 넓은 타입";
}

function resultDescription(percent: number) {
  if (percent < 1) {
    return "대화 결이 꽤 선명해서 아무나 맞기보다는 예외적으로 잘 맞는 사람을 찾는 쪽에 가깝습니다.";
  }
  if (percent < 5) {
    return "취향과 대화 리듬이 뚜렷합니다. 클론이 먼저 대화해보면 낭비되는 대화를 많이 줄일 수 있어요.";
  }
  if (percent < 15) {
    return "조건은 선명하지만 현실적인 편입니다. SNS 활동과 카톡 말투를 같이 보면 추천 품질이 좋아집니다.";
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
  const [intention, setIntention] = useState("진지한 만남");
  const [socialUrl, setSocialUrl] = useState("");
  const [socialNote, setSocialNote] = useState("");
  const [kakaoContext, setKakaoContext] = useState<KakaoContext | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const normalizedAge = clamp(Number(age) || 28, 18, 80);
  const normalizedAgeMin = clamp(Number(ageMin) || 18, 18, 80);
  const normalizedAgeMax = clamp(
    Math.max(Number(ageMax) || 80, normalizedAgeMin),
    18,
    80
  );
  const normalizedSocialUrl = useMemo(
    () => normalizeSocialUrl(socialUrl),
    [socialUrl]
  );

  const canGoNext = useMemo(() => {
    if (step === 1) return Boolean(kakaoContext && normalizedSocialUrl);
    if (step === 2)
      return Boolean(gender && interestedIn && normalizedAge >= 18);
    return selectedTraits.length > 0 || selectedInterests.length > 0;
  }, [
    gender,
    interestedIn,
    kakaoContext,
    normalizedAge,
    normalizedSocialUrl,
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

  const handleKakaoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt")) {
      toast.error("카카오톡 대화는 txt 파일로 업로드해주세요.");
      return;
    }
    if (file.size > MAX_KAKAO_FILE_BYTES) {
      toast.error(
        `파일은 ${formatFileSize(MAX_KAKAO_FILE_BYTES)} 이하로 올려주세요.`
      );
      return;
    }

    try {
      setIsAnalyzing(true);
      const text = await file.text();
      if (!text.trim()) {
        toast.error("읽을 수 있는 대화 내용이 없습니다.");
        return;
      }
      const analyzed = analyzeKakaoText(file.name, file.size, text);
      setKakaoContext(analyzed);
      toast.success("카카오톡 대화 분석이 완료되었습니다.");
    } catch {
      toast.error("파일을 읽지 못했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateResult = () => {
    if (!kakaoContext || !normalizedSocialUrl) return;
    const ageRangeWidth = normalizedAgeMax - normalizedAgeMin + 1;
    const ageFit = clamp(ageRangeWidth / 43, 0.08, 0.86);
    const genderFit = interestedIn === "모두" ? 0.92 : 0.48;
    const traitFit = Math.pow(0.78, selectedTraits.length);
    const interestFit = Math.pow(0.86, selectedInterests.length);
    const contextDepth = clamp(kakaoContext.messageCount / 600, 0.28, 1);
    const rhythmRarity = clamp(
      1 - kakaoContext.responseRhythm / 180,
      0.35,
      0.82
    );
    const socialSpecificity = socialNote.trim().length > 20 ? 0.82 : 0.92;
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
      rhythmRarity *
      socialSpecificity *
      intentionFit *
      (1.08 - contextDepth * 0.18) *
      100;
    const overallPercent = clamp(raw, 0.05, 38);
    const ageBandPercent = clamp(overallPercent / ageFit, 0.2, 54);
    const score = Math.round(
      clamp(
        48 +
          kakaoContext.warmthScore * 0.24 +
          kakaoContext.responseRhythm * 0.18 +
          selectedTraits.length * 3 +
          selectedInterests.length * 2,
        52,
        98
      )
    );

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
      aiSignals: [
        `카톡 ${kakaoContext.messageCount.toLocaleString("ko-KR")}개 메시지에서 대화 리듬을 추출`,
        `${inferSocialPlatform(normalizedSocialUrl)} 활동 링크로 공개 관심사를 보강`,
        kakaoContext.keywords.length
          ? `자주 등장한 키워드: ${kakaoContext.keywords.slice(0, 4).join(", ")}`
          : "짧은 대화에서도 말투와 반응 패턴을 우선 반영",
      ],
    });
  };

  const handleNext = () => {
    if (!canGoNext) {
      if (step === 1) {
        toast.info("SNS 링크와 카카오톡 txt 파일을 모두 넣어주세요.");
        return;
      }
      toast.info("필수 항목을 먼저 선택해주세요.");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setIsAnalyzing(true);
    window.setTimeout(() => {
      calculateResult();
      setIsAnalyzing(false);
    }, 900);
  };

  const saveDraftAndStart = () => {
    if (!result || !kakaoContext || !normalizedSocialUrl) return;
    const values = [
      `AI 매칭률 테스트 결과: 전체 인구 기준 약 ${result.overallPercent}%`,
      `SNS 링크: ${normalizedSocialUrl}`,
      socialNote.trim() ? `SNS 참고 메모: ${socialNote.trim()}` : "",
      `카카오톡 분석: 메시지 ${kakaoContext.messageCount}개, 화자 ${kakaoContext.speakerCount}명, 대화 온도 ${kakaoContext.warmthScore}점, 반응 리듬 ${kakaoContext.responseRhythm}점`,
      kakaoContext.keywords.length
        ? `대화 키워드: ${kakaoContext.keywords.join(", ")}`
        : "",
      `선호 나이대: ${normalizedAgeMin}-${normalizedAgeMax}세`,
      `선호 성별: ${interestedIn ?? "미선택"}`,
      `선호 성향: ${selectedTraits.join(", ") || "미선택"}`,
      `공통 관심사 후보: ${selectedInterests.join(", ") || "미선택"}`,
      `만남 의도: ${intention}`,
      `카카오톡 발췌:\n${kakaoContext.excerpt}`,
    ]
      .filter(Boolean)
      .join("\n\n");

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
    const text = `AI가 내 카톡/SNS를 분석한 자만추 매칭률: 전체 인구 기준 약 ${result.overallPercent}% (${result.label}). 너도 해봐: ${window.location.origin}/match-test`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "AI 매칭률 테스트", text });
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
              AI 매칭률 결과
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
                <Brain size={30} className="text-warm-coral" />
              </div>
              <div>
                <p className="text-xs font-semibold text-warm-coral">
                  AI가 카톡/SNS로 추정한 매칭 풀
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
                <MetricCard
                  icon={Users}
                  label="선호 나이대 안에서는"
                  value={`${result.ageBandPercent}%`}
                />
                <MetricCard
                  icon={Heart}
                  label="예상 후보 규모"
                  value={`${result.estimatedPeople.toLocaleString("ko-KR")}명`}
                />
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">
                    AI 대화 적합도
                  </p>
                  <p className="text-xs font-bold text-warm-coral">
                    {result.score}점
                  </p>
                </div>
                <Progress value={result.score} className="mt-3 h-2" />
                <div className="mt-3 space-y-2">
                  {result.aiSignals.map(signal => (
                    <div key={signal} className="flex items-start gap-2">
                      <Sparkles
                        size={13}
                        className="mt-0.5 shrink-0 text-warm-coral"
                      />
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {signal}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/80">
                  실제 인구 통계가 아닌 업로드된 대화/SNS와 설문 응답 기반의
                  재미용 추정치입니다. 원문은 이 브라우저에서만 분석됩니다.
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
                  다시 분석하기
                </Button>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
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
              AI 매칭률 테스트
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
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-coral-light px-3 py-1 text-xs font-semibold text-warm-coral">
                  <Wand2 size={12} />
                  카톡/SNS 기반 AI 분석
                </span>
                <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
                  AI가 내 대화 결을 읽고
                  <br />
                  매칭률을 계산해요
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  단순 설문이 아니라 카카오톡 대화 txt와 공개 SNS 링크를 함께
                  분석해 나와 맞을 사람의 희소성을 추정합니다.
                </p>
              </div>

              <div className="space-y-4">
                <section className="warm-card p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-coral-light text-warm-coral">
                        <FileText size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          카카오톡 대화 txt
                        </p>
                        <p className="text-[10px] text-warm-coral">필수</p>
                      </div>
                    </div>
                    {kakaoContext && (
                      <button
                        onClick={() => setKakaoContext(null)}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
                        aria-label="파일 삭제"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {kakaoContext ? (
                    <div className="rounded-2xl border border-sage/30 bg-sage-light/40 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck
                          size={18}
                          className="mt-0.5 shrink-0 text-sage"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {kakaoContext.name}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            메시지{" "}
                            {kakaoContext.messageCount.toLocaleString("ko-KR")}
                            개, 화자 {kakaoContext.speakerCount}명,{" "}
                            {formatFileSize(kakaoContext.size)} 분석 완료
                          </p>
                          {kakaoContext.keywords.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {kakaoContext.keywords
                                .slice(0, 4)
                                .map(keyword => (
                                  <span
                                    key={keyword}
                                    className="rounded-full bg-white px-2 py-1 text-[10px] text-sage"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="block cursor-pointer rounded-2xl border border-dashed border-warm-coral/50 bg-white p-5 text-center transition hover:bg-warm-coral-light/20">
                      <UploadCloud
                        size={30}
                        className="mx-auto mb-2 text-warm-coral"
                      />
                      <p className="text-sm font-semibold text-foreground">
                        txt 파일 업로드
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        원문은 서버에 저장하지 않고 테스트용 신호만 추출합니다.
                      </p>
                      <input
                        type="file"
                        accept=".txt,text/plain"
                        onChange={handleKakaoUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="rounded-2xl bg-warm-light p-3">
                    <p className="text-xs font-semibold text-foreground">
                      카카오톡 txt 내려받는 법
                    </p>
                    <ol className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
                      <li>1. 분석할 카카오톡 채팅방을 엽니다.</li>
                      <li>2. 우측 상단 메뉴(≡)에서 설정(톱니)을 누릅니다.</li>
                      <li>
                        3. 대화 내용 내보내기에서 텍스트만 보내기를 선택합니다.
                      </li>
                      <li>4. 저장된 txt 파일을 여기서 업로드합니다.</li>
                    </ol>
                  </div>
                </section>

                <section className="warm-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-light text-sage">
                      <LinkIcon size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        공개 SNS 링크
                      </p>
                      <p className="text-[10px] text-warm-coral">필수</p>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={socialUrl}
                    onChange={event => setSocialUrl(event.target.value)}
                    placeholder="인스타그램, 블로그, 유튜브, 링크드인 등"
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-sage"
                  />
                  <textarea
                    value={socialNote}
                    onChange={event => setSocialNote(event.target.value)}
                    placeholder="AI가 참고했으면 하는 공개 활동, 취향, 콘텐츠 방향을 적어주세요."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-white px-3 py-3 text-sm outline-none focus:border-sage"
                  />
                  {normalizedSocialUrl && (
                    <p className="text-[11px] text-sage">
                      {inferSocialPlatform(normalizedSocialUrl)} 링크로
                      인식했어요.
                    </p>
                  )}
                </section>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  기본 조건을 맞춰볼게요
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI 분석 결과에 최소한의 선호 조건을 더해 매칭 풀을 좁힙니다.
                </p>
              </div>

              <div className="warm-card p-4 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1.5 block">
                    <span className="text-xs font-medium text-foreground">
                      닉네임
                    </span>
                    <input
                      value={nickname}
                      onChange={event => setNickname(event.target.value)}
                      placeholder="결과 저장용"
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
                </div>

                <ChoiceGrid
                  title="나의 성별"
                  items={GENDERS}
                  value={gender}
                  onSelect={setGender}
                  accent="coral"
                />
                <ChoiceGrid
                  title="선호 성별"
                  items={PREFS}
                  value={interestedIn}
                  onSelect={setInterestedIn}
                  accent="sage"
                />

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
                  AI가 볼 힌트를 더 주세요
                </h1>
                <p className="text-sm text-muted-foreground">
                  선택한 힌트는 카톡/SNS 분석 결과와 함께 클론 생성 화면으로
                  넘어갑니다.
                </p>
              </div>

              <div className="space-y-4">
                <ChoiceBlock
                  title="나와 잘 맞는 성향"
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
                <section className="warm-card p-4">
                  <div className="flex items-start gap-3">
                    <MessageCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-warm-coral"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        AI 분석 준비 완료
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        카톡 말투, SNS 관심사, 선호 조건을 합쳐 추정 매칭률을
                        계산합니다. 다음 화면에서 공유 가능한 결과 카드를 확인할
                        수 있어요.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}
        </motion.div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur-xl">
        <div className="container py-3">
          <Button
            onClick={handleNext}
            disabled={isAnalyzing}
            className="h-12 w-full rounded-full bg-warm-coral text-white hover:bg-warm-coral/90 disabled:opacity-70"
          >
            {isAnalyzing ? (
              <>
                <Brain size={16} className="mr-2 animate-gentle-pulse" />
                AI가 분석 중...
              </>
            ) : (
              <>
                {step === 3 ? "AI 매칭률 보기" : "다음"}
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-warm-light p-4 text-left">
      <Icon size={16} className="mb-2 text-sage" />
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function ChoiceGrid<T extends string>({
  title,
  items,
  value,
  onSelect,
  accent,
}: {
  title: string;
  items: readonly T[];
  value: T | null;
  onSelect: (item: T) => void;
  accent: "coral" | "sage";
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-foreground">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {items.map(item => {
          const selected = value === item;
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`h-11 rounded-xl border text-sm font-medium transition ${
                selected
                  ? accent === "coral"
                    ? "border-warm-coral bg-warm-coral text-white"
                    : "border-sage bg-sage text-white"
                  : "border-border bg-white text-foreground"
              }`}
            >
              {item}
            </button>
          );
        })}
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
