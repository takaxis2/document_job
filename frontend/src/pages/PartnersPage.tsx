import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Download } from "lucide-react"
import PartnerDetailModal, { type Partner } from "../components/partner-detail-modal.tsx"
import { useToast } from "../hooks/use-toast"

// 예시 거래처 데이터
const samplePartners: Partner[] = [
  {
    id: "1",
    name: "한국전자",
    businessNumber: "123-45-67890",
    representative: "김영수",
    contactPerson: "박지민",
    phone: "010-1234-5678",
    email: "contact@koreaelectronics.com",
    address: "서울시 서초구 서초대로 789",
    status: "active",
    industry: "manufacturing",
    lastTransaction: "2025-05-03",
    notes: "주요 전자제품 공급업체, 분기별 계약 갱신",
    createdAt: "2024-01-15",
    documents: [
      {
        id: "doc-1",
        name: "한국전자_공급계약서.pdf",
        type: "계약서",
        createdAt: "2025-05-03",
        size: "2.4 MB",
      },
      {
        id: "doc-2",
        name: "한국전자_5월납품견적.xlsx",
        type: "견적서",
        createdAt: "2025-05-01",
        size: "1.2 MB",
      },
    ],
    contacts: [
      {
        id: "contact-1",
        name: "박지민",
        position: "과장",
        department: "구매팀",
        phone: "010-1234-5678",
        email: "jimin.park@koreaelectronics.com",
        isPrimary: true,
      },
      {
        id: "contact-2",
        name: "이수진",
        position: "대리",
        department: "재무팀",
        phone: "010-2345-6789",
        email: "sujin.lee@koreaelectronics.com",
        isPrimary: false,
      },
    ],
    transactions: [
      {
        id: "trans-1",
        date: "2025-05-03",
        type: "계약 갱신",
        amount: 50000000,
        description: "2분기 공급 계약",
        status: "completed",
      },
      {
        id: "trans-2",
        date: "2025-04-15",
        type: "납품",
        amount: 12500000,
        description: "4월 정기 납품",
        status: "completed",
      },
    ],
  },
  // ... 다른 거래처 데이터들
]

export default function PartnersPage() {
  const { toast } = useToast()
  const [partners, setPartners] = useState<Partner[]>(samplePartners)
  const [statusFilter, setStatusFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [isPartnerDetailOpen, setIsPartnerDetailOpen] = useState(false)

  // 거래처 필터링
  const filteredPartners = partners.filter((partner) => {
    const matchesStatus = statusFilter === "all" || partner.status === statusFilter
    const matchesIndustry = industryFilter === "all" || partner.industry === industryFilter
    return matchesStatus && matchesIndustry
  })

  // 거래처 상세 정보 열기
  const handleOpenPartnerDetail = (partner: Partner) => {
    setSelectedPartner(partner)
    setIsPartnerDetailOpen(true)
  }

  // 거래처 정보 저장
  const handleSavePartner = (updatedPartner: Partner) => {
    setPartners(partners.map((partner) => (partner.id === updatedPartner.id ? updatedPartner : partner)))
    setSelectedPartner(updatedPartner)

    toast({
      title: "거래처 정보 저장됨",
      description: `${updatedPartner.name} 거래처 정보가 업데이트되었습니다.`,
    })
  }

  // 거래처 삭제
  const handleDeletePartner = (partnerId: string) => {
    setPartners(partners.filter((partner) => partner.id !== partnerId))
    setIsPartnerDetailOpen(false)
    setSelectedPartner(null)

    toast({
      title: "거래처 삭제됨",
      description: "거래처가 삭제되었습니다.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">거래처 관리</h1>
          <p className="text-muted-foreground">거래처 정보를 관리하고 상세 정보를 확인하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button>
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
                  <TableCell>{partner.contactPerson}</TableCell>
                  <TableCell>{partner.phone}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        partner.status === "active"
                          ? "bg-green-50 text-green-700"
                          : partner.status === "inactive"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
                      }
                    >
                      {partner.status === "active" ? "거래중" : partner.status === "inactive" ? "거래중단" : "검토중"}
                    </Badge>
                  </TableCell>
                  <TableCell>{partner.lastTransaction}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenPartnerDetail(partner)}>
                      상세
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

      {/* 거래처 상세 모달 */}
      <PartnerDetailModal
        isOpen={isPartnerDetailOpen}
        onClose={() => setIsPartnerDetailOpen(false)}
        partner={selectedPartner}
        onSave={handleSavePartner}
        onDelete={handleDeletePartner}
      />
    </div>
  )
}
