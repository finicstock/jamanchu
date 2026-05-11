import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container text-center space-y-6">
        <h1 className="font-display text-8xl text-neon-pink neon-text-pink">404</h1>
        <p className="text-foreground/60">페이지를 찾을 수 없습니다</p>
        <Button
          onClick={() => setLocation("/")}
          className="h-12 px-8 bg-neon-mint text-background font-bold border-2 border-neon-mint hover:bg-neon-mint/90 neon-glow-mint"
          style={{ borderRadius: "2px" }}
        >
          <Home size={16} className="mr-2" />
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
