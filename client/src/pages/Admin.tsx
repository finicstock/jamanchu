/**
 * Admin Dashboard - 자만추 관리자 페이지
 * 네이버 프리미엄 콘텐츠 관리자 스타일 디자인
 * 깔끔한 사이드바 + 통계 카드 + 데이터 테이블 + 하트 부여
 */
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  CreditCard,
  Heart,
  Activity,
  TrendingUp,
  Search,
  LayoutDashboard,
  UserCog,
  Receipt,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Gift,
  X,
  Clock,
  ArrowLeft,
} from "lucide-react";

type AdminTab = "overview" | "users" | "payments" | "matches";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);

  // Auth gate
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border p-8 max-w-sm w-full text-center space-y-4">
          <div className="h-12 w-12 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">접근 권한 없음</h2>
          <p className="text-sm text-gray-500">
            관리자 계정으로 로그인해야 합니다.
          </p>
          {!isAuthenticated ? (
            <Button
              onClick={() => { window.location.href = getLoginUrl(); }}
              className="w-full"
            >
              로그인
            </Button>
          ) : (
            <Button
              onClick={() => { window.location.href = "/"; }}
              variant="outline"
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          )}
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "overview" as AdminTab, icon: LayoutDashboard, label: "대시보드" },
    { id: "users" as AdminTab, icon: UserCog, label: "사용자 관리" },
    { id: "payments" as AdminTab, icon: Receipt, label: "결제 내역" },
    { id: "matches" as AdminTab, icon: BarChart3, label: "매칭 현황" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-100">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft size={14} className="text-gray-400" />
            <span className="font-bold text-base text-gray-900">자만추</span>
          </a>
          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-gray-900 text-white rounded font-medium">ADMIN</span>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-3 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                activeTab === item.id
                  ? "bg-gray-900 text-white font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.name || "관리자"}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email || ""}</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="로그아웃"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60">
        <div className="p-6">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "users" && (
            <UsersTab
              search={userSearch}
              setSearch={setUserSearch}
              page={userPage}
              setPage={setUserPage}
            />
          )}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "matches" && <MatchesTab />}
        </div>
      </main>
    </div>
  );
}

// ============ Overview Tab ============
function OverviewTab() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();
  const { data: recentUsers } = trpc.admin.recentUsers.useQuery();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const statCards = [
    { label: "전체 가입자", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "오늘 가입", value: stats?.newUsersToday ?? 0, icon: TrendingUp, color: "bg-green-50 text-green-600" },
    { label: "총 매칭 수", value: stats?.totalMatches ?? 0, icon: Heart, color: "bg-pink-50 text-pink-600" },
    { label: "활성 클론", value: stats?.activeClones ?? 0, icon: Activity, color: "bg-purple-50 text-purple-600" },
    { label: "총 매출", value: `₩${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: CreditCard, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">자만추 서비스 전체 현황을 확인하세요.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={16} />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">최근 가입자</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">이름</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">이메일</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">역할</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">가입일</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers?.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-900">{u.name || "-"}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{u.email || "-"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === "admin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {u.role === "admin" ? "관리자" : "일반"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
              {(!recentUsers || recentUsers.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                    가입자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ Heart Grant Modal ============
function HeartGrantModal({
  userId,
  userName,
  currentBalance,
  onClose,
}: {
  userId: number;
  userName: string;
  currentBalance: number;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState(0);

  const grantHearts = trpc.admin.grantHearts.useMutation();
  const { data: history } = trpc.admin.userHeartHistory.useQuery({ userId, limit: 10 });
  const utils = trpc.useUtils();

  const handleGrant = async () => {
    const num = parseInt(amount);
    if (!num || num < 1) return;
    setIsGranting(true);
    try {
      const result = await grantHearts.mutateAsync({
        userId,
        amount: num,
        description: description || undefined,
      });
      setNewBalance(result.newBalance);
      setSuccess(true);
      utils.admin.listUsers.invalidate();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGranting(false);
    }
  };

  const quickAmounts = [1, 5, 10, 30, 50, 100];

  const typeLabel: Record<string, string> = {
    admin_grant: "관리자 부여",
    purchase: "구매",
    use_chat: "채팅 사용",
    use_report: "리포트 열람",
    use_photo: "사진 열람",
    refund: "환불",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">하트 부여</h3>
            <p className="text-xs text-gray-500 mt-0.5">{userName}님에게 하트를 부여합니다</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {success ? (
          /* Success State */
          <div className="p-6 text-center space-y-4">
            <div className="h-14 w-14 mx-auto bg-green-50 rounded-full flex items-center justify-center">
              <Heart size={24} className="text-green-500 fill-green-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">부여 완료!</p>
              <p className="text-sm text-gray-500 mt-1">
                {userName}님에게 하트 <span className="font-bold text-pink-500">{amount}개</span>를 부여했습니다.
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                현재 잔액: <span className="font-bold text-gray-900">{newBalance}개</span>
              </p>
            </div>
            <Button onClick={onClose} className="w-full">확인</Button>
          </div>
        ) : (
          /* Grant Form */
          <div className="p-6 space-y-5">
            {/* Current Balance */}
            <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
              <Heart size={18} className="text-pink-500 fill-pink-500" />
              <div>
                <p className="text-xs text-pink-600">현재 보유 하트</p>
                <p className="text-lg font-bold text-pink-700">{currentBalance}개</p>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">부여할 하트 수</label>
              <Input
                type="number"
                placeholder="수량 입력"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                max={10000}
                className="h-10"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      amount === String(q)
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {q}개
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">사유 (선택)</label>
              <Input
                placeholder="예: 이벤트 당첨, 불편 보상 등"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Grant Button */}
            <Button
              onClick={handleGrant}
              disabled={!amount || parseInt(amount) < 1 || isGranting}
              className="w-full h-10 bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isGranting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  처리 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gift size={14} />
                  하트 {amount || 0}개 부여하기
                </span>
              )}
            </Button>

            {/* Transaction History */}
            {history && history.transactions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Clock size={12} />
                  최근 거래 내역
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {history.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {typeLabel[t.type] || t.type}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(t.createdAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ${t.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                        {t.amount > 0 ? "+" : ""}{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Users Tab ============
function UsersTab({
  search,
  setSearch,
  page,
  setPage,
}: {
  search: string;
  setSearch: (s: string) => void;
  page: number;
  setPage: (p: number) => void;
}) {
  const { data, isLoading } = trpc.admin.listUsers.useQuery({
    page,
    limit: 20,
    search: search || undefined,
  });
  const updateRole = trpc.admin.updateUserRole.useMutation();
  const utils = trpc.useUtils();

  // Heart grant modal state
  const [heartModal, setHeartModal] = useState<{
    userId: number;
    userName: string;
    balance: number;
  } | null>(null);

  const handleRoleChange = async (userId: number, newRole: "user" | "admin") => {
    await updateRole.mutateAsync({ userId, role: newRole });
    utils.admin.listUsers.invalidate();
    utils.admin.recentUsers.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-sm text-gray-500 mt-1">전체 {data?.total ?? 0}명의 사용자</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="이름 또는 이메일로 검색..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-9 h-9 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">이름</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">이메일</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">역할</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">하트</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">가입일</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">최근 접속</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">작업</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                    로딩 중...
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                data?.users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400">#{u.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-900 font-medium">{u.name || "-"}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{u.email || "-"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === "admin" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {u.role === "admin" ? "관리자" : "일반"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-sm">
                        <Heart size={12} className="text-pink-500 fill-pink-500" />
                        <span className="font-medium text-gray-900">{u.heartBalance}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(u.lastSignedIn).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setHeartModal({ userId: u.id, userName: u.name || "사용자", balance: u.heartBalance })}
                          className="text-xs px-2.5 py-1 rounded-md font-medium bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors flex items-center gap-1"
                        >
                          <Gift size={10} />
                          하트 부여
                        </button>
                        <button
                          onClick={() => handleRoleChange(u.id, u.role === "admin" ? "user" : "admin")}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                            u.role === "admin"
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          {u.role === "admin" ? "일반으로" : "관리자로"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > data.limit && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {(page - 1) * data.limit + 1} - {Math.min(page * data.limit, data.total)} / {data.total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * data.limit >= data.total}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Heart Grant Modal */}
      {heartModal && (
        <HeartGrantModal
          userId={heartModal.userId}
          userName={heartModal.userName}
          currentBalance={heartModal.balance}
          onClose={() => setHeartModal(null)}
        />
      )}
    </div>
  );
}

// ============ Payments Tab ============
function PaymentsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = trpc.admin.payments.useQuery({ page, limit: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">결제 내역</h1>
        <p className="text-sm text-gray-500 mt-1">
          총 매출: <span className="font-semibold text-gray-900">₩{(data?.totalRevenue ?? 0).toLocaleString()}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">사용자</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">상품</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">금액</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">결제 수단</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">상태</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">일시</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">로딩 중...</td>
                </tr>
              ) : !data?.payments.length ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <CreditCard size={18} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">결제 내역이 없습니다</p>
                      <p className="text-xs text-gray-400">결제가 발생하면 여기에 표시됩니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400">#{p.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-900 font-medium">{p.userName}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{p.product}</td>
                    <td className="px-5 py-3 text-sm text-gray-900 font-medium">₩{p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "완료" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(p.date).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ Matches Tab ============
function MatchesTab() {
  const { data, isLoading } = trpc.admin.matchStats.useQuery();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const matchCards = [
    { label: "진행 중 대화", value: data?.activeChats ?? 0, color: "bg-blue-50 text-blue-600" },
    { label: "완료된 리포트", value: data?.completedReports ?? 0, color: "bg-green-50 text-green-600" },
    { label: "대기 중 매칭", value: data?.pendingMatches ?? 0, color: "bg-amber-50 text-amber-600" },
    { label: "평균 일치도", value: `${data?.averageCompatibility ?? 0}%`, color: "bg-pink-50 text-pink-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">매칭 현황</h1>
        <p className="text-sm text-gray-500 mt-1">AI 클론 매칭 및 대화 현황을 모니터링합니다.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {matchCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Content or Empty State */}
      {!data?.dailyMatches.length && !data?.topTopics.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <BarChart3 size={22} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">매칭 데이터가 없습니다</p>
            <p className="text-xs text-gray-400">사용자들이 클론을 만들고 매칭이 시작되면<br />여기에 통계가 표시됩니다.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Daily Matches Chart (Simple bar) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">일별 매칭 추이</h3>
            {data?.dailyMatches.length ? (
              <div className="flex items-end gap-3 h-40">
                {data.dailyMatches.map((d) => {
                  const maxCount = Math.max(...(data.dailyMatches.map(x => x.count) ?? [1]));
                  const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-600 font-medium">{d.count}</span>
                      <div
                        className="w-full bg-gray-900 rounded-t-md transition-all"
                        style={{ height: `${height}%`, minHeight: "4px" }}
                      />
                      <span className="text-[10px] text-gray-400">{d.date}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">데이터가 없습니다.</p>
            )}
          </div>
          {/* Top Topics */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">인기 대화 주제</h3>
            {data?.topTopics.length ? (
              <div className="flex flex-wrap gap-2">
                {data.topTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">데이터가 없습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============ Loading Skeleton ============
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="h-8 w-8 bg-gray-100 rounded-lg" />
            <div className="h-5 w-16 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
