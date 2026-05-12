/**
 * NotFound - 404 페이지
 * Design: Warm Afternoon Conversation - 건실한 만남
 */
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container text-center space-y-6 py-12">
        <div className="space-y-2">
          <span className="font-display text-8xl font-bold text-warm-coral/30">404</span>
          <h1 className="font-display text-2xl font-bold text-foreground">
            페이지를 찾을 수 없어요
          </h1>
          <p className="text-sm text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
        </div>

        <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
          <Button
            onClick={() => setLocation("/")}
            className="h-12 gradient-coral text-white font-semibold rounded-full shadow-md"
          >
            <Home size={16} className="mr-2" />
            홈으로 돌아가기
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="h-12 rounded-full border-border bg-white text-foreground font-medium"
          >
            <ArrowLeft size={16} className="mr-2" />
            이전 페이지
          </Button>
        </div>
      </div>
    </div>
  );
}
