import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Download, Search, RefreshCw, ChevronRight } from "lucide-react"
import { usePartnerStore } from "../stores/partnerStore"
import type { Partner } from "../stores/partnerStore"
import { useToast } from "../hooks/use-toast"

export default function PartnersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const { partners, addPartner, loadPartnersFromDb } = usePartnerStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")

  useEffect(() => {
    loadPartnersFromDb()
  }, [loadPartnersFromDb])

  // 거래처 검색 및 필터링
  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesStatus = statusFilter === "all" || partner.status === statusFilter
      const matchesIndustry = industryFilter === "all" || partner.industry === industryFilter
      const q = searchQuery.trim().toLowerCase()
      const matchesQuery = 
        !q || 
        partner.name.toLowerCase().includes(q) ||
        partner.businessNumber.includes(q) ||
        (partner.representative && partner.representative.toLowerCase().includes(q)) ||
        (partner.contactPerson && partner.contactPerson.toLowerCase().includes(q))
      
      return matchesStatus && matchesIndustry && matchesQuery
    })
  }, [partners, statusFilter, industryFilter, searchQuery])

  // 거래처 상세 정보 페이지로 이동
  const handleOpenPartnerDetail = (partner: Partner) => {
    navigate(`/partners/${partner.id}`)
  }

  // CSV 파일 내보내기
  const handleExportCsv = () => {
    if (filteredPartners.length === 0) {
      toast({
        title: "내보낼 데이터 없음",
        description: "현재 필터링된 거래처 목록이 없습니다.",
      })
      return
    }

    const headers = ["거래처명", "사업자번호", "대표자", "담당자", "연락처", "이메일", "상태", "업종", "최근거래일"]
    const rows = filteredPartners.map(p => [
      `"${p.name || ""}"`,
      `"${p.businessNumber || ""}"`,
      `"${p.representative || ""}"`,
      `"${p.contactPerson || ""}"`,
      `"${p.phone || ""}"`,
      `"${p.email || ""}"`,
      `"${p.status === "active" ? "거래중" : p.status === "inactive" ? "거래중단" : "검토중"}"`,
      `"${p.industry || ""}"`,
      `"${p.lastTransaction || ""}"`
    ])

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `partners_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "내보내기 완료",
      description: `${filteredPartners.length}건의 거래처 정보를 CSV 파일로 다운로드했습니다.`,
    })
  }

  // 신규 거래처 추가 핸들러
  const handleCreatePartner = async () => {
    const newPartner: Partner = {
      id: "0",
      name: "신규 거래처",
      businessNumber: "000-00-00000",
      representative: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      status: "pending",
      industry: "other",
      lastTransaction: "-",
      notes: "새로 등록된 거래처입니다.",
      createdAt: new Date().toISOString().split("T")[0],
      documents: [],
      contacts: [],
      transactions: [],
      facilities: []
    }
    
    try {
      const realId = await addPartner(newPartner)
      navigate(`/partners/${realId}`)
      toast({
        title: "신규 거래처 임시 등록",
        description: "상세 정보 페이지에서 거래처 정보를 입력하고 저장해주세요.",
      })
    } catch {
      toast({
        title: "등록 실패",
        description: "신규 거래처 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-3">
      {/* Desktop Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-border gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">거래처 관리</h1>
          <p className="text-xs text-muted-foreground">거래처 마스터 정보, 사업장 시설 및 관리 담당자를 확인하고 수정합니다.</p>
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
            variant="outline" 
            size="sm" 
            className="h-8 text-xs" 
            onClick={handleExportCsv}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> 
            CSV 내보내기
          </Button>
          <Button 
            size="sm" 
            className="h-8 text-xs" 
            onClick={handleCreatePartner}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> 
            신규 거래처 등록
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-md border border-border">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="거래처명, 사업자번호, 대표자 검색..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="거래 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="active">거래중</SelectItem>
            <SelectItem value="inactive">거래중단</SelectItem>
            <SelectItem value="pending">검토중</SelectItem>
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="업종 분류" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 업종</SelectItem>
            <SelectItem value="manufacturing">제조업</SelectItem>
            <SelectItem value="service">서비스업</SelectItem>
            <SelectItem value="retail">유통업</SelectItem>
            <SelectItem value="it">IT/소프트웨어</SelectItem>
            <SelectItem value="construction">건설업</SelectItem>
            <SelectItem value="finance">금융업</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto text-xs text-muted-foreground pr-1">
          조회 결과 <span className="font-semibold text-foreground">{filteredPartners.length}</span>건
        </div>
      </div>

      {/* Desktop Data Table */}
      <Card className="rounded-md border border-border bg-card p-0 shadow-none overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 border-b border-border">
                <TableHead className="h-8 text-xs font-semibold">거래처명</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-32">사업자번호</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-24">대표자</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-28">담당자</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-32">연락처</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-24 text-center">거래상태</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-28">최근거래일</TableHead>
                <TableHead className="h-8 text-xs font-semibold w-24 text-right pr-4">상세보기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow 
                  key={partner.id}
                  className="text-xs cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => handleOpenPartnerDetail(partner)}
                >
                  <TableCell className="py-2.5 font-medium text-foreground">
                    <div className="flex items-center space-x-1.5">
                      <span>{partner.name}</span>
                      {partner.facilities && partner.facilities.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal text-muted-foreground">
                          시설 {partner.facilities.length}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 font-mono text-muted-foreground">
                    {partner.businessNumber}
                  </TableCell>
                  <TableCell className="py-2.5 text-muted-foreground">
                    {partner.representative || "-"}
                  </TableCell>
                  <TableCell className="py-2.5 text-foreground">
                    {partner.contactPerson || "-"}
                  </TableCell>
                  <TableCell className="py-2.5 text-muted-foreground font-mono">
                    {partner.phone || "-"}
                  </TableCell>
                  <TableCell className="py-2.5 text-center">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${
                      partner.status === "active"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : partner.status === "inactive"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    }`}>
                      {partner.status === "active" ? "거래중" : partner.status === "inactive" ? "거래중단" : "검토중"}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-muted-foreground font-mono">
                    {partner.lastTransaction}
                  </TableCell>
                  <TableCell className="py-2.5 text-right pr-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenPartnerDetail(partner)
                      }}
                    >
                      상세 <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredPartners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-xs">
                    조건에 부합하는 거래처가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
