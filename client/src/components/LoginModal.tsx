/**
 * LoginModal - 로그인 안내 모달
 * 비로그인 사용자가 보호된 기능에 접근할 때 표시
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginModal({ isOpen, onClose, message }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Illustration */}
            <div className="bg-gradient-to-br from-warm-coral-light to-sage-light p-8 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                <Heart size={28} className="text-warm-coral fill-warm-coral" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-center">
              <h3 className="font-display text-xl font-bold text-foreground">
                로그인이 필요합니다
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {message || "이 기능을 이용하려면 로그인이 필요합니다. 간편하게 가입하고 AI 클론을 만들어보세요."}
              </p>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => { window.location.href = getLoginUrl(); }}
                  className="w-full h-12 gradient-coral text-white font-semibold rounded-full shadow-md shadow-warm-coral/20"
                >
                  <LogIn size={16} className="mr-2" />
                  로그인 / 회원가입
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full h-10 text-muted-foreground text-sm"
                >
                  나중에 할게요
                </Button>
              </div>

              <div className="flex items-center gap-2 justify-center pt-2">
                <Shield size={12} className="text-sage" />
                <span className="text-[10px] text-muted-foreground">
                  개인정보는 안전하게 보호됩니다
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
