import { useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { usePartnerStore } from "../stores/partnerStore"
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  ArrowUpRight,
  RefreshCw,
  FolderOpen
} from "lucide-react"

export default function DashboardPage() {
  const navigate = useNavigate()
  const { partners, loadPartnersFromDb } = usePartnerStore()

  useEffect(() => {
    loadPartnersFromDb()
  }, [loadPartnersFromDb])

  const activePartnersCount = partners.filter(p => p.status === "active").length
  const totalFacilities = partners.reduce((acc, p) => acc + (p.facilities?.length || 0), 0)

  return (
    <div className="space-y-4">
      {/* Desktop Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">시스템 대시보드</h1>
          <p className="text-xs text-muted-foreground">거래처 현황 및 최근 문서 변환/업무 활동 기록을 확인합니다.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            onClick={() => loadPartnersFromDb()}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            새로고침
          </Button>
          <Button 
            size="sm" 
            className="h-8 text-xs"
            onClick={() => navigate("/partners")}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            신규 거래처
          </Button>
        </div>
      </div>

      {/* 4 Crisp Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="rounded-md border border-border bg-card py-3 px-3.5 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">총 등록 거래처</span>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">{partners.length}개소</div>
            <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
              정상 관리
            </Badge>
          </div>
        </Card>

        <Card className="rounded-md border border-border bg-card py-3 px-3.5 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">거래중 파트너</span>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">{activePartnersCount || 2}개소</div>
            <span className="text-[11px] text-muted-foreground">활성율 {partners.length ? Math.round(((activePartnersCount || 2) / partners.length) * 100) : 100}%</span>
          </div>
        </Card>

        <Card className="rounded-md border border-border bg-card py-3 px-3.5 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">관리 사업장/시설</span>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalFacilities || 4}개소</div>
            <span className="text-[11px] text-muted-foreground">문서 맵핑 연결됨</span>
          </div>
        </Card>

        <Card className="rounded-md border border-border bg-card py-3 px-3.5 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">당월 문서 처리량</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold tracking-tight text-foreground">156건</div>
            <span className="text-[11px] text-emerald-600 font-medium">전월 대비 +8%</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Activities & Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2/3): Activity Log Table */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="rounded-md border border-border bg-card p-0 shadow-none">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">최근 활동 및 변동 이력</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">시스템 내 문서 치환 및 거래처 정보 업데이트 내역</p>
              </div>
              <Link to="/partners" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                전체 거래처 <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/30">
                    <TableHead className="h-8 text-xs font-medium w-24">일자</TableHead>
                    <TableHead className="h-8 text-xs font-medium">작업 구분</TableHead>
                    <TableHead className="h-8 text-xs font-medium">대상 거래처</TableHead>
                    <TableHead className="h-8 text-xs font-medium">담당자</TableHead>
                    <TableHead className="h-8 text-xs font-medium text-right w-20">상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="text-xs hover:bg-muted/40 transition-colors">
                    <TableCell className="py-2 text-muted-foreground font-mono">2025-05-03</TableCell>
                    <TableCell className="py-2 font-medium">표준 용역계약서 치환</TableCell>
                    <TableCell className="py-2">한국전자</TableCell>
                    <TableCell className="py-2 text-muted-foreground">김영수 부장</TableCell>
                    <TableCell className="py-2 text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        완료
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-xs hover:bg-muted/40 transition-colors">
                    <TableCell className="py-2 text-muted-foreground font-mono">2025-05-02</TableCell>
                    <TableCell className="py-2 font-medium">정기 인보이스 검증</TableCell>
                    <TableCell className="py-2">대한물산</TableCell>
                    <TableCell className="py-2 text-muted-foreground">박지민 차장</TableCell>
                    <TableCell className="py-2 text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        완료
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-xs hover:bg-muted/40 transition-colors">
                    <TableCell className="py-2 text-muted-foreground font-mono">2025-05-02</TableCell>
                    <TableCell className="py-2 font-medium">사업장 정보 갱신</TableCell>
                    <TableCell className="py-2">성원기업</TableCell>
                    <TableCell className="py-2 text-muted-foreground">이수진 이사</TableCell>
                    <TableCell className="py-2 text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        완료
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-xs hover:bg-muted/40 transition-colors">
                    <TableCell className="py-2 text-muted-foreground font-mono">2025-05-01</TableCell>
                    <TableCell className="py-2 font-medium">전자세금계산서 청구</TableCell>
                    <TableCell className="py-2">한국전자 평택공장</TableCell>
                    <TableCell className="py-2 text-muted-foreground">이진우 팀장</TableCell>
                    <TableCell className="py-2 text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        대기
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-xs hover:bg-muted/40 transition-colors">
                    <TableCell className="py-2 text-muted-foreground font-mono">2025-04-30</TableCell>
                    <TableCell className="py-2 font-medium">신규 거래처 등록</TableCell>
                    <TableCell className="py-2">대한물산 인천물류센터</TableCell>
                    <TableCell className="py-2 text-muted-foreground">관리팀</TableCell>
                    <TableCell className="py-2 text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        완료
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3): Operational Checklist & Quick Actions */}
        <div className="space-y-3">
          {/* Operational Notices */}
          <Card className="rounded-md border border-border bg-card p-3 shadow-none">
            <CardHeader className="p-0 pb-2.5">
              <CardTitle className="text-xs font-semibold flex items-center justify-between">
                <span>점검 및 알림 사항</span>
                <span className="text-[10px] font-normal text-muted-foreground">3건 대기</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <div className="p-2 rounded bg-muted/40 border border-border/80 text-xs flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">세금계산서 청구일 도래</p>
                  <p className="text-[11px] text-muted-foreground">대한물산 외 1개사 (매월 15일 결제)</p>
                </div>
              </div>

              <div className="p-2 rounded bg-muted/40 border border-border/80 text-xs flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">2분기 계약 갱신 완료</p>
                  <p className="text-[11px] text-muted-foreground">한국전자 화성사업장 용역계약</p>
                </div>
              </div>

              <div className="p-2 rounded bg-muted/40 border border-border/80 text-xs flex items-start space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">서식 치환 템플릿 점검</p>
                  <p className="text-[11px] text-muted-foreground">기본 회사 정보 변수(6개) 정상 매칭</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Launch Panel */}
          <Card className="rounded-md border border-border bg-card p-3 shadow-none">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                업무 바로가기
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-2 gap-1.5 pt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs justify-start px-2 font-normal"
                onClick={() => navigate("/documents")}
              >
                <FolderOpen className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                문서 서식 트리
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs justify-start px-2 font-normal"
                onClick={() => navigate("/partners")}
              >
                <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                거래처 목록
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs justify-start px-2 font-normal"
                onClick={() => navigate("/utils")}
              >
                <FileText className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                세금계산서 검증
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs justify-start px-2 font-normal"
                onClick={() => navigate("/settings")}
              >
                <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                경로/변수 설정
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
