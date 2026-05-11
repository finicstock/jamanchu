/**
 * ChatLog - AI 클론 간 채팅 로그
 * Design: Night Walker - Neo-Brutalism + Soft Dark UI
 * 타이핑 커서 효과, 네온 채팅 버블
 */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import MobileNav from "@/components/MobileNav";
import { Lock, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatMessage {
  id: number;
  sender: "my-clone" | "their-clone";
  text: string;
  timestamp: string;
}

const MOCK_CHAT: ChatMessage[] = [
  { id: 1, sender: "my-clone", text: "안녕하세요! 프로필 보니까 여행을 좋아하시는 것 같은데, 최근에 어디 다녀오셨어요?", timestamp: "23:14" },
  { id: 2, sender: "their-clone", text: "네! 지난달에 제주도 다녀왔어요. 성산일출봉이 정말 좋았어요 ☺️ 혹시 제주도 가보셨어요?", timestamp: "23:14" },
  { id: 3, sender: "my-clone", text: "제주도 좋죠! 저는 작년에 갔었는데 올레길 걸으면서 힐링했어요. 성산일출봉은 일출 보셨어요?", timestamp: "23:15" },
  { id: 4, sender: "their-clone", text: "네 새벽에 일어나서 봤는데 진짜 감동이었어요... 그런 자연 앞에서 작아지는 느낌 좋아하시나요?", timestamp: "23:16" },
  { id: 5, sender: "my-clone", text: "완전 공감해요. 저도 자연 속에 있으면 마음이 편해지는 타입이에요. 산도 좋아하고 바다도 좋아하고.", timestamp: "23:16" },
  { id: 6, sender: "their-clone", text: "오 저도요! 그러면 혹시 등산도 하세요? 최근에 북한산 갔었는데 단풍이 예뻤어요.", timestamp: "23:17" },
  { id: 7, sender: "my-clone", text: "등산 좋아해요! 북한산은 코스가 다양해서 좋더라고요. 어떤 코스로 가셨어요?", timestamp: "23:18" },
  { id: 8, sender: "their-clone", text: "백운대 코스로 갔어요. 힘들었지만 정상에서 보는 풍경이 최고였어요. 같이 가면 재밌을 것 같은데 😊", timestamp: "23:19" },
];

const LOCKED_MESSAGES: ChatMessage[] = [
  { id: 9, sender: "my-clone", text: "그러면 혹시 음악 취향은 어떠세요? 저는 인디 음악을 많이 들어요.", timestamp: "23:20" },
  { id: 10, sender: "their-clone", text: "저도 인디 좋아해요! 최근에 들은 앨범이...", timestamp: "23:21" },
];

export default function ChatLog() {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [showLocked, setShowLocked] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate messages appearing one by one
    MOCK_CHAT.forEach((msg, i) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg]);
      }, i * 400);
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[oklch(0.22_0.005_260)] bg-background/95 backdrop-blur-xl">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg text-foreground tracking-wide">CHAT LOG</h1>
              <p className="text-[10px] text-muted-foreground">나의 클론 × 별빛산책자의 클론</p>
            </div>
            <div className="flex items-center gap-2 border-2 border-neon-mint/30 bg-neon-mint/5 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-neon-mint animate-pulse-neon" />
              <span className="text-[10px] text-neon-mint font-medium tracking-wider uppercase">92% 일치</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="container py-4 space-y-3">
        {/* Date Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-[oklch(0.22_0.005_260)]" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">오늘 밤 23:14</span>
          <div className="flex-1 h-px bg-[oklch(0.22_0.005_260)]" />
        </div>

        {visibleMessages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.sender === "my-clone" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] space-y-1 ${msg.sender === "my-clone" ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2 px-1">
                <span className={`text-[9px] uppercase tracking-wider font-medium ${
                  msg.sender === "my-clone" ? "text-neon-mint" : "text-neon-pink"
                }`}>
                  {msg.sender === "my-clone" ? "나의 클론" : "상대 클론"}
                </span>
                <span className="text-[9px] text-muted-foreground">{msg.timestamp}</span>
              </div>
              <div
                className={`px-4 py-3 border-2 ${
                  msg.sender === "my-clone"
                    ? "border-neon-mint/30 bg-neon-mint/5"
                    : "border-neon-pink/30 bg-neon-pink/5"
                }`}
                style={{ borderRadius: "2px" }}
              >
                <p className="text-sm text-foreground/90 leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Locked Messages */}
        {visibleMessages.length >= MOCK_CHAT.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-neon-pink/30" />
              <Lock size={12} className="text-neon-pink" />
              <span className="text-[10px] text-neon-pink uppercase tracking-wider">잠긴 대화</span>
              <div className="flex-1 h-px bg-neon-pink/30" />
            </div>

            {LOCKED_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "my-clone" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[80%]">
                  <div
                    className="px-4 py-3 border-2 border-[oklch(0.22_0.005_260)] bg-[oklch(0.12_0.005_260)] relative overflow-hidden"
                    style={{ borderRadius: "2px" }}
                  >
                    <p className="text-sm text-foreground/20 leading-relaxed blur-sm select-none">
                      {msg.text}
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="brutal-card p-4 text-center space-y-3 border-neon-pink/20">
              <Lock size={24} className="text-neon-pink mx-auto" />
              <div>
                <h3 className="font-bold text-foreground text-sm">전체 대화를 확인하세요</h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  이 대화에는 총 23개의 메시지가 더 있습니다
                </p>
              </div>
              <Button
                onClick={() => toast.info("프리미엄 기능입니다. 상점에서 하트를 구매해주세요.")}
                className="h-10 px-6 bg-neon-pink text-foreground font-bold text-sm border-2 border-neon-pink hover:bg-neon-pink/90 neon-glow-pink"
                style={{ borderRadius: "2px" }}
              >
                <Sparkles size={14} className="mr-2" />
                50 하트로 잠금 해제
              </Button>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Scroll to bottom FAB */}
      <button
        onClick={() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" })}
        className="fixed bottom-[76px] right-4 z-30 h-10 w-10 flex items-center justify-center border-2 border-[oklch(0.3_0.005_260)] bg-background/90 backdrop-blur-sm hover:border-neon-mint transition-colors"
        style={{ borderRadius: "2px" }}
      >
        <ChevronDown size={18} className="text-foreground/60" />
      </button>

      <MobileNav />
    </div>
  );
}
