/**
 * CloneSetup - AI 클론 생성 및 설정
 * Design: Warm Afternoon Conversation - 건실한 만남
 * 실제 tRPC saveProfile 연동
 */
import { useState, type ChangeEvent } from "react";
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
  ShieldCheck,
  Link as LinkIcon,
  Wand2,
  Copy,
  X,
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
  "유머러스",
  "진지함",
  "모험적",
  "차분함",
  "열정적",
  "지적",
  "감성적",
  "현실적",
  "낙관적",
  "신중함",
  "외향적",
  "내향적",
  "창의적",
  "분석적",
  "따뜻함",
];

const INTERESTS = [
  "여행",
  "음악",
  "영화",
  "독서",
  "요리",
  "운동",
  "카페",
  "사진",
  "반려동물",
  "게임",
  "미술",
  "와인",
  "등산",
  "캠핑",
  "테크",
];

const GENDER_MAP: Record<string, "male" | "female" | "other"> = {
  남성: "male",
  여성: "female",
  기타: "other",
};

const PREF_MAP: Record<string, "male" | "female" | "both"> = {
  남성: "male",
  여성: "female",
  모두: "both",
};

type ContextFile = {
  id: string;
  name: string;
  size: number;
  kind: "kakao" | "text";
  summary: string;
  excerpt: string;
  charCount: number;
};

type SocialContextLink = {
  id: string;
  url: string;
  platform: string;
  note: string;
};

const MAX_CONTEXT_FILES = 5;
const MAX_SOCIAL_LINKS = 5;
const MAX_CONTEXT_FILE_BYTES = 512 * 1024;
const MAX_CONTEXT_CHARS_PER_FILE = 5000;
const MAX_TOTAL_CONTEXT_CHARS = 12000;
const SUPPORTED_CONTEXT_EXTENSIONS = [".txt", ".md", ".json", ".csv"];

const SELF_INTRO_ASSIST_PROMPT =
  "다음 정보를 바탕으로 데이팅 앱용 자기소개를 500자 이하로 따뜻하고 과장 없이 써줘. 말투는 담백하게, 가치관/취향/관계에서 중요하게 보는 점을 포함해줘.";
const PRIVACY_ASSIST_PROMPT =
  "AI 클론이 대화에서 말하지 않아야 할 정보 목록을 정리해줘. 연락처, 직장명, 가족 정보, 정확한 동네, 과거 연애사, 민감한 사건처럼 보호할 항목을 짧은 체크리스트로 만들어줘.";
const SELF_INTRO_EXAMPLE =
  "처음엔 조용하지만 편해지면 농담도 잘하는 편이에요. 주말에는 카페에서 책을 읽거나 가볍게 걷는 시간을 좋아하고, 서로의 생활 리듬을 존중하는 관계를 중요하게 생각합니다. 대화가 잘 통하고 작은 약속을 성실하게 지키는 사람에게 호감을 느껴요.";
const PRIVACY_BOUNDARY_EXAMPLE =
  "정확한 직장명, 연락처, 가족 정보, 사는 동네의 세부 위치, 과거 연애사, 경제 상황은 말하지 않기. 실제 만남이나 연락처 교환은 리포트 확인 후 내가 직접 결정하기.";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function isSupportedContextFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return SUPPORTED_CONTEXT_EXTENSIONS.some(ext => lowerName.endsWith(ext));
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

function summarizeContextFile(
  fileName: string,
  rawText: string
): Omit<ContextFile, "id" | "name" | "size"> {
  const normalized = redactSensitiveText(rawText)
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim();
  const lines = normalized
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
  const speakerAliases = new Map<string, string>();
  const kakaoMessages: string[] = [];

  for (const line of lines) {
    const parsed = parseKakaoLine(line);
    if (!parsed) continue;

    if (!speakerAliases.has(parsed.speaker)) {
      speakerAliases.set(parsed.speaker, `화자${speakerAliases.size + 1}`);
    }
    kakaoMessages.push(
      `${speakerAliases.get(parsed.speaker)}: ${parsed.message}`
    );
  }

  const isKakao = kakaoMessages.length >= 5;
  const excerptSource = isKakao ? kakaoMessages : lines;
  const excerpt = excerptSource.join("\n").slice(0, MAX_CONTEXT_CHARS_PER_FILE);
  const summary = isKakao
    ? `카카오톡 대화로 보이는 파일입니다. 메시지 ${kakaoMessages.length}개, 화자 ${speakerAliases.size}명, 원문 이름은 익명화했습니다.`
    : `텍스트 컨텍스트 파일입니다. ${lines.length}줄, ${normalized.length}자를 클론 학습 참고용으로 읽었습니다.`;

  return {
    kind: isKakao ? "kakao" : "text",
    summary: `${fileName}: ${summary}`,
    excerpt,
    charCount: normalized.length,
  };
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
  const [privacyBoundaries, setPrivacyBoundaries] = useState("");
  const [contextFiles, setContextFiles] = useState<ContextFile[]>([]);
  const [socialUrl, setSocialUrl] = useState("");
  const [socialNote, setSocialNote] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialContextLink[]>([]);
  const [acceptedAiConsent, setAcceptedAiConsent] = useState(false);
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
    onError: err => {
      setIsGenerating(false);
      toast.error("클론 생성에 실패했습니다.", {
        description: err.message,
      });
    },
  });

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : prev.length < 5
          ? [...prev, trait]
          : prev
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
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

  const handleContextFileUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = MAX_CONTEXT_FILES - contextFiles.length;
    if (remainingSlots <= 0) {
      toast.error(
        `컨텍스트 파일은 최대 ${MAX_CONTEXT_FILES}개까지 추가할 수 있습니다.`
      );
      return;
    }

    const filesToRead = selectedFiles.slice(0, remainingSlots);
    const nextFiles: ContextFile[] = [];

    for (const file of filesToRead) {
      if (!isSupportedContextFile(file)) {
        toast.error(`${file.name}은 지원하지 않는 파일 형식입니다.`);
        continue;
      }
      if (file.size > MAX_CONTEXT_FILE_BYTES) {
        toast.error(
          `${file.name}은 ${formatFileSize(MAX_CONTEXT_FILE_BYTES)} 이하로 업로드해주세요.`
        );
        continue;
      }

      try {
        const text = await file.text();
        if (!text.trim()) {
          toast.error(`${file.name}에 읽을 수 있는 텍스트가 없습니다.`);
          continue;
        }
        nextFiles.push({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          name: file.name,
          size: file.size,
          ...summarizeContextFile(file.name, text),
        });
      } catch {
        toast.error(`${file.name}을 읽지 못했습니다.`);
      }
    }

    if (nextFiles.length > 0) {
      setContextFiles(prev => [...prev, ...nextFiles]);
      toast.success(`${nextFiles.length}개 파일을 컨텍스트에 추가했습니다.`);
    }
  };

  const removeContextFile = (id: string) => {
    setContextFiles(prev => prev.filter(file => file.id !== id));
  };

  const addSocialLink = () => {
    if (socialLinks.length >= MAX_SOCIAL_LINKS) {
      toast.error(
        `SNS 링크는 최대 ${MAX_SOCIAL_LINKS}개까지 추가할 수 있습니다.`
      );
      return;
    }

    const normalizedUrl = normalizeSocialUrl(socialUrl);
    if (!normalizedUrl) {
      toast.error("올바른 SNS 또는 블로그 링크를 입력해주세요.");
      return;
    }
    if (socialLinks.some(link => link.url === normalizedUrl)) {
      toast.error("이미 추가한 링크입니다.");
      return;
    }

    setSocialLinks(prev => [
      ...prev,
      {
        id: `${normalizedUrl}-${crypto.randomUUID()}`,
        url: normalizedUrl,
        platform: inferSocialPlatform(normalizedUrl),
        note: socialNote.trim(),
      },
    ]);
    setSocialUrl("");
    setSocialNote("");
    toast.success("SNS 링크를 컨텍스트에 추가했습니다.");
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== id));
  };

  const buildUploadedContext = () => {
    const joined = contextFiles
      .map(file =>
        [
          `[${file.kind === "kakao" ? "카카오톡 대화" : "텍스트 자료"}] ${file.name}`,
          file.summary,
          file.excerpt ? `발췌:\n${file.excerpt}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n\n");

    return joined.slice(0, MAX_TOTAL_CONTEXT_CHARS);
  };

  const buildSocialContext = () => {
    return socialLinks
      .map(
        link =>
          `[SNS 링크] ${link.platform}\nURL: ${link.url}\n참고 메모: ${link.note || "공개 프로필의 관심사, 말투, 활동 주제를 참고"}`
      )
      .join("\n\n")
      .slice(0, 3000);
  };

  const copyAssistPrompt = async (prompt: string, label: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success(`${label} 프롬프트를 복사했습니다.`);
    } catch {
      toast.error("프롬프트 복사에 실패했습니다.");
    }
  };

  const handleGenerate = () => {
    if (!selectedGender || !selectedPref) {
      toast.error("기본 정보를 모두 입력해주세요.");
      return;
    }
    if (!acceptedAiConsent) {
      toast.error("AI 클론 운영 원칙에 동의해주세요.");
      return;
    }
    const lifestyleNotes = privacyBoundaries.trim()
      ? `공개 금지/주의 정보: ${privacyBoundaries.trim()}`
      : undefined;
    const uploadedContext = buildUploadedContext();
    const socialContext = buildSocialContext();
    const profileValues = [
      selfIntro.trim(),
      socialContext ? `SNS 링크 컨텍스트:\n${socialContext}` : "",
      uploadedContext ? `업로드 컨텍스트:\n${uploadedContext}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    setIsGenerating(true);
    saveProfileMutation.mutate({
      nickname: nickname.trim(),
      gender: GENDER_MAP[selectedGender],
      interestedIn: PREF_MAP[selectedPref],
      age: parseInt(age),
      personality: selectedTraits,
      interests: selectedInterests,
      values: profileValues || undefined,
      lifestyle: lifestyleNotes,
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
            <h1 className="font-display font-bold text-foreground">
              클론 만들기
            </h1>
            <span className="text-xs text-muted-foreground">{step}/4</span>
          </div>
          <Progress value={(step / 4) * 100} className="mt-2 h-1.5 bg-muted" />
        </div>
      </header>

      {/* Step Indicator */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {STEPS.map(s => (
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
                {s.id < step ? <Check size={16} /> : <s.icon size={16} />}
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
                    onChange={e => {
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
                    onChange={e => {
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
                    {["남성", "여성", "기타"].map(gender => {
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
                    {["남성", "여성", "모두"].map(pref => {
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
                  AI 클론이 당신을 더 잘 이해할 수 있도록 자기소개를
                  작성해주세요.
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
                  onChange={e => setSelfIntro(e.target.value)}
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

              <div className="warm-card p-4 space-y-3 bg-warm-coral-light/25 border-warm-coral/20">
                <div className="flex items-start gap-3">
                  <Wand2
                    size={17}
                    className="mt-0.5 shrink-0 text-warm-coral"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      LLM으로 초안 만들기
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      아래 문장을 ChatGPT 같은 LLM에 넣고, 나온 결과를 다듬어
                      붙여넣으면 훨씬 쉽게 작성할 수 있습니다.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-xs leading-relaxed text-foreground">
                  {SELF_INTRO_ASSIST_PROMPT}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      copyAssistPrompt(SELF_INTRO_ASSIST_PROMPT, "자기소개")
                    }
                    className="h-10 rounded-full bg-white"
                  >
                    <Copy size={13} className="mr-1" />
                    프롬프트 복사
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelfIntro(SELF_INTRO_EXAMPLE)}
                    className="h-10 rounded-full bg-white"
                  >
                    예시 적용
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <LinkIcon size={12} className="text-warm-coral" />
                    SNS 링크 컨텍스트
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {socialLinks.length}/{MAX_SOCIAL_LINKS}
                  </span>
                </div>
                <div className="warm-card p-3 space-y-3">
                  <input
                    type="url"
                    value={socialUrl}
                    onChange={e => setSocialUrl(e.target.value)}
                    placeholder="인스타그램, 블로그, 유튜브, 링크드인 등 공개 링크"
                    className="w-full h-11 px-3 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-warm-coral focus:ring-2 focus:ring-warm-coral/10 focus:outline-none"
                  />
                  <textarea
                    value={socialNote}
                    onChange={e => setSocialNote(e.target.value)}
                    placeholder="이 링크에서 참고할 점을 적어주세요. 예: 여행 사진이 많음, 글투가 담백함, 일상 루틴이 잘 드러남"
                    maxLength={240}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-warm-coral focus:ring-2 focus:ring-warm-coral/10 focus:outline-none resize-none"
                  />
                  <Button
                    type="button"
                    onClick={addSocialLink}
                    variant="outline"
                    className="h-10 w-full rounded-full"
                  >
                    <LinkIcon size={14} className="mr-2" />
                    링크 추가
                  </Button>
                </div>
                {socialLinks.length > 0 && (
                  <div className="space-y-2">
                    {socialLinks.map(link => (
                      <div
                        key={link.id}
                        className="rounded-xl border border-border bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {link.platform}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {link.url}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSocialLink(link.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={`${link.platform} 링크 제거`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {link.note && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                            {link.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Upload size={12} className="text-sage" />
                    컨텍스트 파일
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    {contextFiles.length}/{MAX_CONTEXT_FILES}
                  </span>
                </div>
                <label className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-sage/40 bg-sage-light/20 px-4 py-5 text-center transition-colors hover:border-sage hover:bg-sage-light/40">
                  <Upload size={22} className="text-sage" />
                  <span className="text-sm font-semibold text-foreground">
                    txt, md, json, csv 업로드
                  </span>
                  <span className="text-xs text-muted-foreground">
                    카카오톡 대화 txt와 클론 참고 자료를 추가할 수 있습니다
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.json,.csv,text/plain,application/json,text/markdown,text/csv"
                    onChange={handleContextFileUpload}
                    className="hidden"
                  />
                </label>
                {contextFiles.length > 0 && (
                  <div className="space-y-2">
                    {contextFiles.map(file => (
                      <div
                        key={file.id}
                        className="rounded-xl border border-border bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <FileText
                                size={14}
                                className="shrink-0 text-sage"
                              />
                              <p className="truncate text-sm font-semibold text-foreground">
                                {file.name}
                              </p>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {file.kind === "kakao"
                                ? "카카오톡 대화"
                                : "텍스트 자료"}{" "}
                              · {formatFileSize(file.size)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeContextFile(file.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={`${file.name} 제거`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {file.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-sage" />
                  클론이 말하지 않을 정보 (선택사항)
                </label>
                <textarea
                  value={privacyBoundaries}
                  onChange={e => setPrivacyBoundaries(e.target.value)}
                  placeholder="예: 직장명, 연락처, 가족 정보, 과거 연애사처럼 AI 클론이 대화에서 언급하지 않았으면 하는 내용을 적어주세요."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground/50 focus:border-sage focus:ring-2 focus:ring-sage/10 focus:outline-none transition-all resize-none leading-relaxed"
                />
                <div className="flex justify-end">
                  <span className="text-[10px] text-muted-foreground">
                    {privacyBoundaries.length}/500
                  </span>
                </div>
              </div>

              <div className="warm-card p-4 space-y-3 bg-sage-light/25 border-sage/20">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={17}
                    className="mt-0.5 shrink-0 text-sage"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      말하지 않을 정보도 LLM으로 정리하기
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      민감정보를 직접 떠올리기 어렵다면 아래 요청문으로 보호
                      범위를 먼저 정리해보세요.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-xs leading-relaxed text-foreground">
                  {PRIVACY_ASSIST_PROMPT}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      copyAssistPrompt(PRIVACY_ASSIST_PROMPT, "공개 금지 정보")
                    }
                    className="h-10 rounded-full bg-white"
                  >
                    <Copy size={13} className="mr-1" />
                    프롬프트 복사
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setPrivacyBoundaries(PRIVACY_BOUNDARY_EXAMPLE)
                    }
                    className="h-10 rounded-full bg-white"
                  >
                    예시 적용
                  </Button>
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
                {PERSONALITY_TRAITS.map(trait => {
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
                {INTERESTS.map(interest => {
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
                  {socialLinks.length > 0 && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-muted-foreground">SNS 링크</span>
                      <p className="text-foreground font-medium mt-1 line-clamp-2">
                        {socialLinks.map(link => link.platform).join(", ")}
                      </p>
                    </div>
                  )}
                  {contextFiles.length > 0 && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-muted-foreground">
                        업로드 컨텍스트
                      </span>
                      <p className="text-foreground font-medium mt-1 line-clamp-2">
                        {contextFiles.map(file => file.name).join(", ")}
                      </p>
                    </div>
                  )}
                  {privacyBoundaries && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-muted-foreground">
                        공개 금지/주의 정보
                      </span>
                      <p className="text-foreground font-medium mt-1 line-clamp-2">
                        {privacyBoundaries}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAcceptedAiConsent(value => !value)}
                className={`w-full warm-card p-4 flex items-start gap-3 text-left transition-all ${
                  acceptedAiConsent ? "border-sage bg-sage-light/30" : ""
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    acceptedAiConsent
                      ? "border-sage bg-sage text-white"
                      : "border-border bg-white"
                  }`}
                >
                  {acceptedAiConsent && <Check size={13} />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    AI 클론 운영 원칙에 동의합니다
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    클론은 실제 만남이나 연락을 대신 결정하지 않고, 동의한 범위
                    안에서 사전 궁합 탐색과 리포트 생성을 위해서만 대화합니다.
                  </p>
                </div>
              </button>
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
              disabled={
                isGenerating ||
                saveProfileMutation.isPending ||
                !acceptedAiConsent
              }
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
