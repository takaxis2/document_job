import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Download } from "lucide-react"
import { usePartnerStore } from "../stores/partnerStore"
import type { Partner } from "../stores/partnerStore"
import { useToast } from "../hooks/use-toast"

export default function PartnersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const { partners, addPartner, loadPartnersFromDb } = usePartnerStore()
  const [statusFilter, setStatusFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")

  useEffect(() => {
    loadPartnersFromDb()
  }, [])

  // 거래처 필터링
  const filteredPartners = partners.filter((partner) => {
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter
    const matchesIndustry = industryFilter === "all" || partner.industry === industryFilter
    return matchesStatus && matchesIndustry
  })

  // 거래처 상세 정보 페이지로 이동
  const handleOpenPartnerDetail = (partner: Partner) => {
    navigate(`/partners/${partner.id}`)
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
    } catch (err) {
      toast({
        title: "등록 실패",
        description: "신규 거래처 등록 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">거래처 관리</h1>
          <p className="text-muted-foreground">거래처 정보를 관리하고 상세 정보를 확인하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreatePartner}>
            <Plus className="mr-2 h-4 w-4" /> 신규 거래처
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> 내보내기
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="거래 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">거래중</SelectItem>
            <SelectItem value="inactive">거래중단</SelectItem>
            <SelectItem value="pending">검토중</SelectItem>
          </SelectContent>
        </Select>

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="업종" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="manufacturing">제조업</SelectItem>
            <SelectItem value="service">서비스업</SelectItem>
            <SelectItem value="retail">유통업</SelectItem>
            <SelectItem value="it">IT</SelectItem>
            <SelectItem value="construction">건설업</SelectItem>
            <SelectItem value="finance">금융업</SelectItem>
            <SelectItem value="other">기타</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{`총 ${filteredPartners.length}개`}</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>거래처명</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>거래상태</TableHead>
                <TableHead>최근 거래일</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="font-medium">{partner.name}</TableCell>
                  <TableCell>{partner.businessNumber}</TableCell>
                  <TableCell>{partner.contactPerson || "-"}</TableCell>
                  <TableCell>{partner.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        partner.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : partner.status === "inactive"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {partner.status === "active" ? "거래중" : partner.status === "inactive" ? "거래중단" : "검토중"}
                    </Badge>
                  </TableCell>
                  <TableCell>{partner.lastTransaction}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenPartnerDetail(partner)}>
                      상세 정보
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filteredPartners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    검색 조건에 맞는 거래처가 없습니다.
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
