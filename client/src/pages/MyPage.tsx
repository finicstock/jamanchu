/**
 * MyPage - 마이페이지
 * 프로필, 하트 잔액, 클론 상태, 거래 내역
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import {
  Heart,
  User,
  Bot,
  Clock,
  ArrowLeft,
  Gift,
  ShoppingCart,
  MessageCircle,
  FileText,
  Image,
  RotateCcw,
  Crown,
  Sparkles,
  Calendar,
  Mail,
  Shield,
} from "lucide-react";

export default function MyPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.profile.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-gray-200" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const typeLabels: Record<string, { label: string; icon: typeof Heart }> = {
    admin_grant: { label: "관리자 지급", icon: Gift },
    purchase: { label: "구매", icon: ShoppingCart },
    use_chat: { label: "채팅 열람", icon: MessageCircle },
    use_report: { label: "리포트 열람", icon: FileText },
    use_photo: { label: "사진 열람", icon: Image },
    refund: { label: "환불", icon: RotateCcw },
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-base font-bold text-gray-900">마이페이지</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Profile Card */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#E8725C] to-[#FF9A76] flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{profile?.user.name ?? "사용자"}</h2>
                {profile?.user.role === "admin" && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full flex items-center gap-0.5">
                    <Crown size={10} /> 관리자
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Mail size={12} /> {profile?.user.email ?? "이메일 없음"}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar size={12} />
              <span>가입: {profile?.user.createdAt ? new Date(profile.user.createdAt).toLocaleDateString("ko-KR") : "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>최근 접속: {profile?.user.lastSignedIn ? new Date(profile.user.lastSignedIn).toLocaleDateString("ko-KR") : "-"}</span>
            </div>
          </div>
        </section>

        {/* Hearts Card */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Heart size={16} className="text-[#E8725C]" fill="#E8725C" /> 하트 잔액
            </h3>
            <button
              onClick={() => setLocation("/pricing")}
              className="text-xs text-[#E8725C] font-medium hover:underline"
            >
              충전하기 →
            </button>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-gray-900">{profile?.hearts.balance ?? 0}</span>
            <span className="text-sm text-gray-500">하트</span>
          </div>

          {/* Recent Transactions */}
          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-xs font-semibold text-gray-500 mb-2">최근 거래 내역</h4>
            {profile?.hearts.recentTransactions.length ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {profile.hearts.recentTransactions.map((t: { id: number; amount: number; type: string; description: string | null; createdAt: Date | null }) => {
                  const typeInfo = typeLabels[t.type] ?? { label: t.type, icon: Heart };
                  const IconComp = typeInfo.icon;
                  const isPositive = t.amount > 0;
                  return (
                    <div key={t.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center ${isPositive ? "bg-green-50" : "bg-red-50"}`}>
                          <IconComp size={13} className={isPositive ? "text-green-500" : "text-red-500"} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">{typeInfo.label}</p>
                          <p className="text-[10px] text-gray-400">
                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString("ko-KR") : ""}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
                        {isPositive ? "+" : ""}{t.amount}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">거래 내역이 없습니다.</p>
            )}
          </div>
        </section>

        {/* Clone Status Card */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Bot size={16} className="text-[#7BA68C]" /> 내 클론
            </h3>
            {profile?.clone && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                profile.clone.status === "active" ? "bg-green-50 text-green-600" :
                profile.clone.status === "paused" ? "bg-amber-50 text-amber-600" :
                "bg-gray-100 text-gray-500"
              }`}>
                {profile.clone.status === "active" ? "활동 중" :
                 profile.clone.status === "paused" ? "일시정지" : "비활성"}
              </span>
            )}
          </div>

          {profile?.clone ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7BA68C] to-[#A8D5BA] flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{profile.clone.nickname}</p>
                  <p className="text-xs text-gray-500">
                    {profile.clone.age}세 · {profile.clone.gender === "male" ? "남성" : profile.clone.gender === "female" ? "여성" : "기타"}
                    {" · "}
                    {profile.clone.interestedIn === "male" ? "남성에 관심" : profile.clone.interestedIn === "female" ? "여성에 관심" : "모두에 관심"}
                  </p>
                </div>
              </div>
              {profile.clone.personality && profile.clone.personality.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">성격</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.clone.personality.map((p: string) => (
                      <span key={p} className="px-2 py-0.5 bg-[#FBF7F0] text-gray-600 text-[10px] rounded-full">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.clone.interests && profile.clone.interests.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-400 mb-1">관심사</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.clone.interests.map((i: string) => (
                      <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded-full">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setLocation("/clone-setup")}
                className="w-full mt-2 py-2 text-xs text-[#7BA68C] font-medium border border-[#7BA68C] rounded-lg hover:bg-green-50 transition"
              >
                클론 설정 수정
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Bot size={22} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">아직 클론이 없습니다</p>
              <p className="text-xs text-gray-400 mt-1">클론을 만들면 자동으로 매칭이 시작됩니다.</p>
              <button
                onClick={() => setLocation("/clone-setup")}
                className="mt-4 px-6 py-2.5 bg-[#7BA68C] text-white text-sm font-medium rounded-lg hover:bg-[#6B9A7C] transition"
              >
                클론 만들기
              </button>
            </div>
          )}
        </section>

        {/* Security Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
            <Shield size={16} className="text-gray-500" /> 계정 보안
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-600">로그인 방식</span>
              <span className="text-xs font-medium text-gray-900">Manus OAuth</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-600">계정 상태</span>
              <span className="text-xs font-medium text-green-600">정상</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
