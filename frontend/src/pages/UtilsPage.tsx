import { useState, useEffect } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog"
import { useToast } from "../hooks/use-toast"
import { 
  CheckCircle2, 
  XCircle, 
  Copy, 
  FileText, 
  Mail, 
  Calculator, 
  Hash,
  ArrowRight,
  FileSpreadsheet,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowLeft
} from "lucide-react"

// Wails bindings
import { 
  SelectExcelFile, 
  ValidateInvoiceExcel,
  GetInvoiceTargets,
  CreateInvoiceTemplate,
  GetAllInvoiceTemplates,
  UpdateInvoiceTemplate,
  DeleteInvoiceTemplate
} from "../../wailsjs/go/document/Document"

type ModalType = "biznum" | "vat" | "contacts" | "template" | "invoice_check" | null

export default function UtilsPage() {
  const { toast } = useToast()
  
  // 모달 제어 상태
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  
  // 1. 사업자번호 검증기 상태
  const [bizNumber, setBizNumber] = useState("")
  const [bizValidation, setBizValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: "" })

  // 2. 연락처 추출기 상태
  const [rawText, setRawText] = useState("")
  const [extractedEmails, setExtractedEmails] = useState<string[]>([])
  const [extractedPhones, setExtractedPhones] = useState<string[]>([])

  // 3. 계산기 상태
  const [calcMode, setCalcMode] = useState<"supply" | "total">("supply")
  const [calcInput, setCalcInput] = useState("")
  const [calcResults, setCalcResults] = useState({
    supply: 0,
    vat: 0,
    total: 0
  })

  // 4. 변수 추출기 상태
  const [templateText, setTemplateText] = useState("")
  const [extractedVars, setExtractedVars] = useState<string[]>([])

  // 5. 세금계산서 검증기 상태
  const [invoiceFile, setInvoiceFile] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeReportTab, setActiveReportTab] = useState<"errors" | "missing">("errors")
  const [validationReport, setValidationReport] = useState<{
    total_rows: number;
    valid_rows_count: number;
    error_rows_count: number;
    items: Array<{
      row_index: number;
      business_number: string;
      company_name: string;
      representative: string;
      email: string;
      supply_value: number;
      tax_value: number;
      errors: string[];
    }>;
    missing_partners: Array<{
      facility_id: number;
      target_id: string;
      partner_name: string;
      facility_name: string;
      company_name: string;
      business_number: string;
      email: string;
    }>;
  } | null>(null)

  // 템플릿 관리 상태
  const [invoiceTargets, setInvoiceTargets] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("all")
  
  const [isEditorMode, setIsEditorMode] = useState(false)
  const [editTemplateId, setEditTemplateId] = useState<number | null>(null)
  const [editTemplateName, setEditTemplateName] = useState("")
  const [editTemplateDesc, setEditTemplateDesc] = useState("")
  const [editSelectedTargetIds, setEditSelectedTargetIds] = useState<Set<string>>(new Set())
  const [facilitySearch, setFacilitySearch] = useState("")

  const loadFacilitiesAndTemplates = async () => {
    try {
      const targets = await GetInvoiceTargets()
      const validTargets = (targets || []).filter((t: any) => t.business_number && t.business_number.trim() !== "")
      setInvoiceTargets(validTargets)

      const tmpls = await GetAllInvoiceTemplates()
      setTemplates(tmpls || [])
    } catch (err) {
      console.error("데이터 로드 실패:", err)
    }
  }

  useEffect(() => {
    if (activeModal === "invoice_check") {
      loadFacilitiesAndTemplates()
      setInvoiceFile(null)
      setValidationReport(null)
      setSelectedTemplateId("all")
      setIsEditorMode(false)
    }
  }, [activeModal])

  const handleSelectExcelFile = async () => {
    console.log("handleSelectExcelFile: 클릭됨");
    try {
      console.log("handleSelectExcelFile: SelectExcelFile() 바인딩 함수 호출 시도...");
      const path = await SelectExcelFile()
      console.log("handleSelectExcelFile: 응답 결과 경로 =", path);
      if (path) {
        setInvoiceFile(path)
        setValidationReport(null)
      }
    } catch (err: any) {
      console.error("handleSelectExcelFile 오류 발생:", err);
      toast({
        title: "오류",
        description: `파일 선택 중 오류가 발생했습니다: ${err.message || err}`,
        variant: "destructive"
      })
    }
  }

  const handleAnalyzeExcelFile = async () => {
    console.log("handleAnalyzeExcelFile: 클릭됨, 대상 파일 =", invoiceFile);
    if (!invoiceFile) {
      toast({
        title: "오류",
        description: "먼저 검증할 엑셀 파일을 선택해주세요.",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    try {
      console.log("handleAnalyzeExcelFile: ValidateInvoiceExcel() 바인딩 함수 호출 시도...");
      const report = await ValidateInvoiceExcel(invoiceFile)
      console.log("handleAnalyzeExcelFile: 분석 완료 결과 =", report);
      setValidationReport(report)
      toast({
        title: "검증 완료",
        description: `검증을 마쳤습니다. (오류 행: ${report.error_rows_count}건, 누락 거래처: ${report.missing_partners?.length || 0}건)`
      })
    } catch (err: any) {
      console.error("handleAnalyzeExcelFile 오류 발생:", err);
      toast({
        title: "분석 오류",
        description: `엑셀 파일 분석 중 오류가 발생했습니다: ${err.message || err}`,
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 템플릿 저장 함수
  const handleSaveTemplate = async () => {
    if (!editTemplateName.trim()) {
      toast({
        title: "오류",
        description: "템플릿 이름을 입력해 주세요.",
        variant: "destructive"
      })
      return
    }

    if (editSelectedTargetIds.size === 0) {
      toast({
        title: "오류",
        description: "최소 한 개 이상의 거래처를 선택해 주세요.",
        variant: "destructive"
      })
      return
    }

    try {
      const targetIdsArray = Array.from(editSelectedTargetIds)
      const templateData = {
        id: editTemplateId || 0,
        name: editTemplateName,
        description: editTemplateDesc,
        target_ids: targetIdsArray,
        created_at: new Date()
      }

      if (editTemplateId) {
        await UpdateInvoiceTemplate(templateData as any)
        toast({ title: "저장 완료", description: "템플릿이 성공적으로 수정되었습니다." })
      } else {
        await CreateInvoiceTemplate(templateData as any)
        toast({ title: "저장 완료", description: "템플릿이 성공적으로 생성되었습니다." })
      }

      setIsEditorMode(false)
      loadFacilitiesAndTemplates()
    } catch (err: any) {
      console.error("템플릿 저장 실패:", err)
      toast({
        title: "저장 실패",
        description: `템플릿 저장 중 오류가 발생했습니다: ${err.message || err}`,
        variant: "destructive"
      })
    }
  }

  // 템플릿 삭제 함수
  const handleDeleteTemplate = async (id: number) => {
    if (!confirm("정말 이 템플릿을 삭제하시겠습니까?")) return
    try {
      await DeleteInvoiceTemplate(id)
      toast({ title: "삭제 완료", description: "템플릿이 삭제되었습니다." })
      loadFacilitiesAndTemplates()
      if (selectedTemplateId === String(id)) {
        setSelectedTemplateId("all")
      }
    } catch (err: any) {
      console.error("템플릿 삭제 실패:", err)
      toast({
        title: "삭제 실패",
        description: `템플릿 삭제 중 오류가 발생했습니다: ${err.message || err}`,
        variant: "destructive"
      })
    }
  }

  // 템플릿 편집 모드 진입
  const handleEditTemplate = (template: any) => {
    setEditTemplateId(template.id)
    setEditTemplateName(template.name)
    setEditTemplateDesc(template.description || "")
    setEditSelectedTargetIds(new Set(template.target_ids || []))
    setFacilitySearch("")
    setIsEditorMode(true)
  }

  // 템플릿 새 작성 모드 진입
  const handleNewTemplate = () => {
    setEditTemplateId(null)
    setEditTemplateName("")
    setEditTemplateDesc("")
    setEditSelectedTargetIds(new Set())
    setFacilitySearch("")
    setIsEditorMode(true)
  }

  const toggleTargetSelection = (id: string) => {
    const next = new Set(editSelectedTargetIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setEditSelectedTargetIds(next)
  }


  // --- 1. 사업자번호 검증 알고리즘 ---
  const validateBizNumber = (numStr: string) => {
    const cleanNum = numStr.replace(/[^0-9]/g, "")
    
    if (cleanNum.length !== 10) {
      setBizValidation({
        isValid: false,
        message: "사업자등록번호는 10자리 숫자여야 합니다."
      })
      return
    }

    const keys = [1, 3, 7, 1, 3, 7, 1, 3, 5]
    let sum = 0
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanNum[i]) * keys[i]
    }
    
    const lastKeyProduct = parseInt(cleanNum[8]) * 5
    sum += Math.floor(lastKeyProduct / 10)
    
    const checkDigit = (10 - (sum % 10)) % 10
    const matched = checkDigit === parseInt(cleanNum[9])

    if (matched) {
      setBizValidation({
        isValid: true,
        message: "유효한 사업자등록번호 형식입니다."
      })
    } else {
      setBizValidation({
        isValid: false,
        message: "유효하지 않은 사업자등록번호 체크섬입니다. 입력값을 다시 확인해주세요."
      })
    }
  }

  // --- 2. 연락처 추출 기능 ---
  const handleExtractContacts = () => {
    if (!rawText.trim()) {
      toast({
        title: "오류",
        description: "추출할 텍스트를 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = Array.from(new Set(rawText.match(emailRegex) || []))

    const phoneRegex = /(01[016789][-.\s]?\d{3,4}[-.\s]?\d{4})|(0[2-6][1-5]?[-.\s]?\d{3,4}[-.\s]?\d{4})/g
    const phones = Array.from(new Set(rawText.match(phoneRegex) || []))

    setExtractedEmails(emails)
    setExtractedPhones(phones)

    toast({
      title: "추출 완료",
      description: `이메일 ${emails.length}건, 연락처 ${phones.length}건을 발견했습니다.`
    })
  }

  // --- 3. 공급가액 / 부가세 정산 계산 ---
  const handleCalculate = (value: string, mode: "supply" | "total") => {
    setCalcInput(value)
    const num = parseFloat(value.replace(/[^0-9.]/g, "")) || 0

    if (mode === "supply") {
      const vat = Math.floor(num * 0.1)
      setCalcResults({
        supply: num,
        vat: vat,
        total: num + vat
      })
    } else {
      const supply = Math.round(num / 1.1)
      const vat = num - supply
      setCalcResults({
        supply: supply,
        vat: vat,
        total: num
      })
    }
  }

  // --- 4. 템플릿 변수 추출 기능 ---
  const handleExtractVariables = () => {
    if (!templateText.trim()) {
      toast({
        title: "오류",
        description: "추출할 템플릿 내용을 입력해주세요.",
        variant: "destructive"
      })
      return
    }

    const varRegex = /\{\{([^}]+)\}\}/g
    const matches: string[] = []
    let match
    
    // eslint-disable-next-line no-cond-assign
    while ((match = varRegex.exec(templateText)) !== null) {
      matches.push(match[1].trim())
    }

    const uniqueVars = Array.from(new Set(matches))
    setExtractedVars(uniqueVars)

    toast({
      title: "추출 완료",
      description: `중괄호 변수 {{...}} ${uniqueVars.length}건을 추출했습니다.`
    })
  }

  const copyToClipboard = (text: string, subject: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "복사 완료",
      description: `${subject} 내용이 클립보드에 복사되었습니다.`
    })
  }

  // 각 도구별 카드 정보 구성 (데스크탑 깔끔한 스타일)
  const tools = [
    {
      id: "biznum" as ModalType,
      title: "사업자번호 검증",
      description: "국세청 알고리즘 기반 사업자등록번호 형식과 체크섬 유효성을 진단합니다.",
      icon: Hash,
      badge: "유효성 검사"
    },
    {
      id: "vat" as ModalType,
      title: "부가세 / 공급가 계산기",
      description: "합계금액 입력 시 공급가액과 부가세를 자동으로 역산하거나, 공급가 기준 합계를 계산합니다.",
      icon: Calculator,
      badge: "세무 계산"
    },
    {
      id: "contacts" as ModalType,
      title: "연락처 / 이메일 추출기",
      description: "문서나 본문 텍스트에서 전화번호 및 이메일 주소를 정규식으로 파싱하여 추출합니다.",
      icon: Mail,
      badge: "데이터 추출"
    },
    {
      id: "template" as ModalType,
      title: "템플릿 변수 추출",
      description: "한글 또는 워드 서식 파일의 중괄호 치환 기호 {{변수}}를 탐색하여 키 목록으로 정리합니다.",
      icon: FileText,
      badge: "서식 파싱"
    },
    {
      id: "invoice_check" as ModalType,
      title: "세금계산서 일괄 발행 검증",
      description: "홈택스 세금계산서 일괄발행용 엑셀 파일을 분석하여 등록 거래처 누락 및 사업자번호/세액을 검증합니다.",
      icon: FileSpreadsheet,
      badge: "엑셀 분석"
    }
  ]

  return (
    <div className="space-y-4">
      {/* Desktop Header */}
      <div className="flex justify-between items-center pb-2.5 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            업무 유틸리티 도구
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            세금계산서 일괄 검증, 사업자번호 유효성 진단, 부가세 역산 및 서식 변수 추출 도구 모음입니다.
          </p>
        </div>
      </div>

      {/* 도구 선택 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card 
              key={tool.id} 
              className="cursor-pointer border border-border bg-card hover:bg-muted/30 hover:border-border/80 transition-colors shadow-none rounded-md"
              onClick={() => setActiveModal(tool.id)}
            >
              <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded bg-muted/70 text-foreground border border-border/60 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
                    {tool.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-foreground">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
                  <span>도구 열기</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* --- 다이얼로그 모달 처리 --- */}
      
      {/* 1. 사업자번호 검증 모달 */}
      <Dialog open={activeModal === "biznum"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-blue-500" />
              사업자등록번호 유효성 검증
            </DialogTitle>
            <DialogDescription>
              국세청 알고리즘에 기반하여 입력하신 번호의 체크섬을 실시간으로 확인합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="숫자 10자리 입력 (예: 123-45-67890)"
                  value={bizNumber}
                  onChange={(e) => {
                    setBizNumber(e.target.value)
                    setBizValidation({ isValid: null, message: "" })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      validateBizNumber(bizNumber)
                    }
                  }}
                />
              </div>
              <Button onClick={() => validateBizNumber(bizNumber)}>검사</Button>
            </div>

            {bizValidation.isValid !== null && (
              <div className={`p-4 border rounded-md flex items-start gap-3 ${
                bizValidation.isValid ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/50 dark:text-green-300" : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-300"
              }`}>
                {bizValidation.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-sm">
                    {bizValidation.isValid ? "정상 사업자번호 형식" : "조회 오류"}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">{bizValidation.message}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. 부가세/공급가 계산기 모달 */}
      <Dialog open={activeModal === "vat"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-500" />
              부가세 / 공급가액 계산기
            </DialogTitle>
            <DialogDescription>
              금액 입력 시 세금계산서 정산에 필요한 부가세(10%)와 공급가액을 역산하거나 정산 계산합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-md">
              <Button 
                variant={calcMode === "supply" ? "secondary" : "ghost"}
                onClick={() => {
                  setCalcMode("supply")
                  handleCalculate(calcInput, "supply")
                }}
                className="flex-1 text-xs h-8"
              >
                공급가액 입력 ➔ 합계
              </Button>
              <Button 
                variant={calcMode === "total" ? "secondary" : "ghost"}
                onClick={() => {
                  setCalcMode("total")
                  handleCalculate(calcInput, "total")
                }}
                className="flex-1 text-xs h-8"
              >
                합계액 입력 ➔ 공급가/세액 역산
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calc-input" className="text-xs">
                {calcMode === "supply" ? "공급가액 입력 (원)" : "합계금액(공급가+부가세) 입력 (원)"}
              </Label>
              <div className="relative">
                <Input
                  id="calc-input"
                  type="text"
                  placeholder="숫자 입력"
                  value={calcInput}
                  onChange={(e) => handleCalculate(e.target.value, calcMode)}
                />
                {calcInput && (
                  <button 
                    onClick={() => {
                      setCalcInput("")
                      setCalcResults({ supply: 0, vat: 0, total: 0 })
                    }}
                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-655"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            <div className="border rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50 space-y-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">공급가액:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{calcResults.supply.toLocaleString()} 원</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-gray-400 hover:text-blue-600"
                    onClick={() => copyToClipboard(String(calcResults.supply), "공급가액")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-dashed">
                <span className="text-gray-500 font-medium">부가가치세 (10%):</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{calcResults.vat.toLocaleString()} 원</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-gray-400 hover:text-blue-600"
                    onClick={() => copyToClipboard(String(calcResults.vat), "부가세")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-t font-semibold text-base text-blue-600 dark:text-blue-400">
                <span>합계액:</span>
                <div className="flex items-center gap-2">
                  <span>{calcResults.total.toLocaleString()} 원</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-blue-500 hover:text-blue-700"
                    onClick={() => copyToClipboard(String(calcResults.total), "합계액")}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. 연락처/이메일 추출기 모달 */}
      <Dialog open={activeModal === "contacts"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-violet-500" />
              텍스트 내 이메일 & 연락처 추출
            </DialogTitle>
            <DialogDescription>
              게시글이나 문서 내용 등 불규칙하게 작성된 텍스트에서 이메일 및 전화번호 패턴을 자동 추출합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="raw-text" className="text-xs">분석할 본문 텍스트</Label>
              <Textarea
                id="raw-text"
                placeholder="여기에 글을 붙여넣으세요..."
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExtractContacts}>정보 추출</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setRawText("")
                  setExtractedEmails([])
                  setExtractedPhones([])
                }}
              >
                비우기
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
              {/* 이메일 결과 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>이메일 ({extractedEmails.length})</span>
                  {extractedEmails.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(extractedEmails.join("\n"), "이메일 전체")}
                      className="text-xs text-blue-600 h-7"
                    >
                      전체 복사
                    </Button>
                  )}
                </h4>
                <div className="border rounded bg-gray-50 dark:bg-gray-900 p-2.5 min-h-[100px] max-h-[180px] overflow-y-auto space-y-1 text-xs">
                  {extractedEmails.length > 0 ? (
                    extractedEmails.map((email) => (
                      <div key={email} className="flex justify-between items-center hover:bg-white dark:hover:bg-gray-950 p-1 px-1.5 rounded transition-colors group">
                        <span className="font-mono">{email}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                          onClick={() => copyToClipboard(email, "이메일")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs block text-center py-6">검색된 정보 없음</span>
                  )}
                </div>
              </div>

              {/* 연락처 결과 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>전화번호 ({extractedPhones.length})</span>
                  {extractedPhones.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(extractedPhones.join("\n"), "전화번호 전체")}
                      className="text-xs text-blue-600 h-7"
                    >
                      전체 복사
                    </Button>
                  )}
                </h4>
                <div className="border rounded bg-gray-50 dark:bg-gray-900 p-2.5 min-h-[100px] max-h-[180px] overflow-y-auto space-y-1 text-xs">
                  {extractedPhones.length > 0 ? (
                    extractedPhones.map((phone) => (
                      <div key={phone} className="flex justify-between items-center hover:bg-white dark:hover:bg-gray-950 p-1 px-1.5 rounded transition-colors group">
                        <span className="font-mono">{phone}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                          onClick={() => copyToClipboard(phone, "전화번호")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs block text-center py-6">검색된 정보 없음</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 4. 템플릿 변수 추출기 모달 */}
      <Dialog open={activeModal === "template"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              템플릿 중괄호 변수 {"{{변수}}"} 검출
            </DialogTitle>
            <DialogDescription>
              양식 내의 이중 중괄호 치환 대상 변수들을 파싱하여 정리합니다. (예: '{"{{변수명}}"}' ➔ '변수명')
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="template-text" className="text-xs">문서 서식 텍스트</Label>
              <Textarea
                id="template-text"
                placeholder="예시: 안녕하십니까 {{거래처명}} 귀하, 오는 {{계약일자}}부로 계약을..."
                rows={5}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExtractVariables}>치환 변수 분석</Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setTemplateText("")
                  setExtractedVars([])
                }}
              >
                비우기
              </Button>
            </div>

            <div className="space-y-2 pt-3 border-t">
              <h4 className="font-semibold text-xs flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>추출 결과 ({extractedVars.length})</span>
                {extractedVars.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(extractedVars.join(", "), "치환 키 전체")}
                    className="text-xs text-blue-600 h-7"
                  >
                    쉼표 구분 복사
                  </Button>
                )}
              </h4>
              <div className="border rounded bg-gray-50 dark:bg-gray-900 p-3 min-h-[100px] max-h-[220px] overflow-y-auto">
                {extractedVars.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {extractedVars.map((v) => (
                      <span 
                        key={v} 
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-1 rounded font-medium dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50"
                      >
                        {v}
                        <button
                          onClick={() => copyToClipboard(`{{${v}}}`, "변수 괄호 포맷")}
                          className="text-blue-500 hover:text-blue-700 ml-1 flex items-center"
                          title="복사하기"
                        >
                          <Copy className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs block text-center py-8">
                    검출된 변수가 없습니다.
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* 5. 세금계산서 일괄 발행 검증 모달 */}
      <Dialog open={activeModal === "invoice_check"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {isEditorMode ? (
            // 템플릿 에디터 화면
            <div className="space-y-5 py-2">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditorMode(false)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <DialogTitle className="text-xl font-bold">
                    {editTemplateId ? "발행 템플릿 수정" : "새 발행 템플릿 작성"}
                  </DialogTitle>
                </div>
                <DialogDescription>
                  세금계산서 일괄 발행 비교 기준이 되는 기본 거래처 그룹을 정의합니다.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-name" className="text-sm font-semibold">템플릿 이름 *</Label>
                    <Input 
                      id="tpl-name" 
                      placeholder="예: 기본 매월 발행, 상반기 정산 등" 
                      value={editTemplateName}
                      onChange={(e) => setEditTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tpl-desc" className="text-sm font-semibold">설명</Label>
                    <Input 
                      id="tpl-desc" 
                      placeholder="템플릿의 용도나 특징을 적어주세요." 
                      value={editTemplateDesc}
                      onChange={(e) => setEditTemplateDesc(e.target.value)}
                    />
                  </div>
                </div>

                {/* 거래처 선택 목록 */}
                <div className="border rounded-lg p-4 bg-gray-50/50 dark:bg-gray-900/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      발행 대상 거래처 선택 ({editSelectedTargetIds.size}개 선택됨)
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => setEditSelectedTargetIds(new Set(invoiceTargets.map(t => t.id)))}
                      >
                        전체 선택
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => setEditSelectedTargetIds(new Set())}
                      >
                        전체 해제
                      </Button>
                    </div>
                  </div>

                  <Input 
                    placeholder="거래처명, 시설명 또는 사업자번호 검색..." 
                    value={facilitySearch}
                    onChange={(e) => setFacilitySearch(e.target.value)}
                    className="h-9 text-sm"
                  />

                  <div className="border rounded bg-white dark:bg-gray-950 max-h-[300px] overflow-y-auto divide-y">
                    {invoiceTargets.filter(t => {
                      const query = facilitySearch.toLowerCase();
                      return (
                        t.name.toLowerCase().includes(query) ||
                        (t.partner_name && t.partner_name.toLowerCase().includes(query)) ||
                        (t.company_name && t.company_name.toLowerCase().includes(query)) ||
                        t.business_number.includes(query)
                      );
                    }).map((target) => {
                      const isSelected = editSelectedTargetIds.has(target.id);
                      return (
                        <div 
                          key={target.id} 
                          className="flex items-center gap-3 p-2.5 px-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() => toggleTargetSelection(target.id)}
                        >
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => {}} // onClick으로 일괄 제어
                            className="rounded border-gray-300 h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-sm truncate">
                                {target.type === "facility" && target.partner_name ? `[${target.partner_name}] ` : ""}
                                {target.name}
                              </span>
                              <span className="text-xs text-gray-400 font-mono shrink-0">{target.business_number}</span>
                            </div>
                            {target.company_name && target.company_name !== target.name && (
                              <div className="text-xs text-gray-400">상호명: {target.company_name}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {invoiceTargets.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm">
                        시스템에 등록된 유효한 사업장(사업자번호 보유 시설/거래처)이 없습니다.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="outline" onClick={() => setIsEditorMode(false)}>취소</Button>
                  <Button onClick={handleSaveTemplate} className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1">
                    <Save className="h-4 w-4" />
                    저장하기
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // 표준 검증 화면
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <FileSpreadsheet className="h-5.5 w-5.5 text-rose-500" />
                  세금계산서 일괄 발행 검증 및 누락 확인
                </DialogTitle>
                <DialogDescription>
                  기본 템플릿(그룹)을 정해 비교하거나, 홈택스 일괄발행 엑셀 파일(.xlsx)을 불러와 누락 여부 및 입력 데이터 오류를 실시간 검증합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-2">
                {/* 1단계: 비교 기준 템플릿 선택 */}
                <div className="border rounded-lg p-5 bg-gray-50/50 dark:bg-gray-900/50 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 block">비교 기준 (기본 템플릿)</Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => {
                          setSelectedTemplateId(e.target.value);
                          setValidationReport(null);
                        }}
                        className="flex-1 min-w-[200px] max-w-sm rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
                      >
                        <option value="all">전체 등록 거래처 대조 (기본)</option>
                        {templates.map(t => (
                          <option key={t.id} value={String(t.id)}>{t.name} ({t.target_ids?.length || 0}개처)</option>
                        ))}
                      </select>
                      <Button variant="outline" size="sm" onClick={handleNewTemplate} className="flex items-center gap-1 h-9 text-xs">
                        <Plus className="h-3.5 w-3.5" />
                        템플릿 추가
                      </Button>
                      {selectedTemplateId !== "all" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              const t = templates.find(item => String(item.id) === selectedTemplateId);
                              if (t) handleEditTemplate(t);
                            }}
                            className="flex items-center gap-1 h-9 text-xs"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            수정
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteTemplate(Number(selectedTemplateId))}
                            className="flex items-center gap-1 h-9 text-xs text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            삭제
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2단계: 파일 선택 및 분석 실행 영역 */}
                <div className="border rounded-lg p-5 bg-gray-50/50 dark:bg-gray-900/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-gray-500 block">검증 대상 엑셀 파일</span>
                      <div className="text-sm font-medium font-mono text-gray-800 dark:text-gray-200 truncate max-w-lg">
                        {invoiceFile ? invoiceFile : "선택된 파일이 없습니다."}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" onClick={handleSelectExcelFile} disabled={isAnalyzing}>
                        {invoiceFile ? "파일 변경" : "엑셀 파일 선택"}
                      </Button>
                      <Button 
                        onClick={handleAnalyzeExcelFile} 
                        disabled={!invoiceFile || isAnalyzing}
                        className="bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            분석 중...
                          </>
                        ) : "검증 실행"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 검증 보고서 대시보드 */}
                {validationReport && (() => {
                  const currentTemplate = templates.find(t => String(t.id) === selectedTemplateId);
                  const targetIds = currentTemplate ? new Set(currentTemplate.target_ids || []) : null;

                  // 템플릿에 따라 필터링된 누락 거래처 리스트
                  const displayMissingPartners = validationReport.missing_partners 
                    ? (targetIds 
                        ? validationReport.missing_partners.filter(p => targetIds.has(p.target_id))
                        : validationReport.missing_partners)
                    : [];

                  // 템플릿에 따라 템플릿 외 거래처 포함 경고를 주입한 아이템들
                  const displayItems = validationReport.items 
                    ? (targetIds 
                        ? validationReport.items.map(item => {
                            const cleanBiz = item.business_number.replace(/[^0-9]/g, "");
                            const matchedTarget = invoiceTargets.find(t => t.business_number.replace(/[^0-9]/g, "") === cleanBiz);
                            const extraErrors = [...item.errors];
                            if (matchedTarget && !targetIds.has(matchedTarget.id)) {
                              // 중복 메시지 예방
                              const msg = `경고: 이 거래처는 템플릿('${currentTemplate.name}') 발행 대상이 아닙니다.`;
                              if (!extraErrors.includes(msg)) {
                                extraErrors.push(msg);
                              }
                            }
                            return {
                              ...item,
                              errors: extraErrors
                            };
                          })
                        : validationReport.items)
                    : [];

                  const errorRowsCount = displayItems.filter(item => item.errors && item.errors.length > 0).length;
                  const validRowsCount = displayItems.length - errorRowsCount;

                  return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* 요약 카드 */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-105 dark:border-gray-800">
                          <span className="text-xs text-gray-500 font-medium">총 파싱 행 수</span>
                          <div className="text-2xl font-bold mt-1 font-mono">{validationReport.total_rows}행</div>
                        </div>
                        <div className="bg-green-50/40 border-green-100 dark:bg-green-950/10 dark:border-green-900/30 p-4 rounded-lg border text-green-700 dark:text-green-400">
                          <span className="text-xs font-medium opacity-80">정상 레코드</span>
                          <div className="text-2xl font-bold mt-1 font-mono">{validRowsCount}행</div>
                        </div>
                        <div className={`p-4 rounded-lg border ${
                          errorRowsCount > 0 
                            ? "bg-red-50/45 border-red-100 dark:bg-red-950/10 dark:border-red-900/30 text-red-700 dark:text-red-400"
                            : "bg-gray-50 dark:bg-gray-900/40 border-gray-105 dark:border-gray-800 text-gray-500"
                        }`}>
                          <span className="text-xs font-medium opacity-80">오류 의심 행</span>
                          <div className="text-2xl font-bold mt-1 font-mono">{errorRowsCount}건</div>
                        </div>
                        <div className={`p-4 rounded-lg border ${
                          displayMissingPartners.length > 0 
                            ? "bg-amber-50/45 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30 text-amber-700 dark:text-amber-400"
                            : "bg-gray-50 dark:bg-gray-900/40 border-gray-105 dark:border-gray-800 text-gray-500"
                        }`}>
                          <span className="text-xs font-medium opacity-80">누락 거래처(템플릿 대비)</span>
                          <div className="text-2xl font-bold mt-1 font-mono">{displayMissingPartners.length}개처</div>
                        </div>
                      </div>

                      {/* 탭 네비게이션 */}
                      <div className="flex border-b">
                        <button
                          onClick={() => setActiveReportTab("errors")}
                          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                            activeReportTab === "errors"
                              ? "border-rose-600 text-rose-600 border-rose-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          엑셀 데이터 오류 검증 ({errorRowsCount})
                        </button>
                        <button
                          onClick={() => setActiveReportTab("missing")}
                          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                            activeReportTab === "missing"
                              ? "border-amber-600 text-amber-600 border-amber-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          누락된 거래처 목록 ({displayMissingPartners.length})
                        </button>
                      </div>

                      {/* 탭 본문 1: 에러 목록 */}
                      {activeReportTab === "errors" && (
                        <div className="space-y-4">
                          <div className="text-xs text-muted-foreground">
                            * 사업자등록번호 유효성(체크섬), 공급가액 및 세액 불일치(10%), 이메일 누락, 그리고 선택한 템플릿에 제외된 거래처 포함 여부를 검출합니다.
                          </div>
                          <div className="border rounded-md overflow-hidden max-h-[350px] overflow-y-auto">
                            <table className="w-full text-sm text-left border-collapse">
                              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b font-medium text-gray-500 z-10">
                                <tr>
                                  <th className="p-3 w-16 text-center">행</th>
                                  <th className="p-3 w-36">사업자번호</th>
                                  <th className="p-3">상호 (대표자)</th>
                                  <th className="p-3 w-40 text-right">공급가액 / 세액</th>
                                  <th className="p-3">검증 결과</th>
                                </tr>
                              </thead>
                              <tbody>
                                {displayItems && displayItems.length > 0 ? (
                                  displayItems.map((item, idx) => {
                                    const hasError = item.errors && item.errors.length > 0;
                                    return (
                                      <tr key={idx} className={`border-b transition-colors ${
                                        hasError 
                                          ? "bg-red-50/5 hover:bg-red-50/10 dark:bg-red-950/5 dark:hover:bg-red-950/10" 
                                          : "hover:bg-gray-50/50 dark:hover:bg-gray-900/30"
                                      }`}>
                                        <td className="p-3 font-mono text-center font-medium text-gray-400">{item.row_index}</td>
                                        <td className="p-3 font-mono">{item.business_number || "-"}</td>
                                        <td className="p-3">
                                          <div className="font-semibold">{item.company_name || "-"}</div>
                                          <div className="text-xs text-gray-400">{item.representative ? `${item.representative} 대표` : ""}</div>
                                        </td>
                                        <td className="p-3 text-right font-mono">
                                          <div>{item.supply_value.toLocaleString()}원</div>
                                          <div className="text-xs text-gray-400">{item.tax_value.toLocaleString()}원</div>
                                        </td>
                                        <td className="p-3">
                                          {hasError ? (
                                            <div className="space-y-1">
                                              {item.errors.map((err, errIdx) => (
                                                <div key={errIdx} className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 leading-normal">
                                                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-red-500" />
                                                  <span>{err}</span>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded">
                                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                              정상
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="text-center p-8 text-gray-400">검증된 레코드가 없습니다.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* 탭 본문 2: 누락 목록 */}
                      {activeReportTab === "missing" && (
                        <div className="space-y-4">
                          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3.5 rounded text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                            <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                            <div>
                              선택한 발행 기준 템플릿(<strong>{currentTemplate ? currentTemplate.name : "전체 거래처"}</strong>)에 속해 있으나, <strong>이번 세금계산서 엑셀 파일 내에 사업자등록번호가 누락된 목록</strong>입니다.
                            </div>
                          </div>
                          
                          <div className="border rounded-md overflow-hidden max-h-[350px] overflow-y-auto">
                            <table className="w-full text-sm text-left border-collapse">
                              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b font-medium text-gray-500 z-10">
                                <tr>
                                  <th className="p-3">소속 파트너</th>
                                  <th className="p-3">시설/거래처명 (DB등록명)</th>
                                  <th className="p-3 w-40">사업자등록번호</th>
                                  <th className="p-3">수신 이메일</th>
                                  <th className="p-3 w-20 text-center">동작</th>
                                </tr>
                              </thead>
                              <tbody>
                                {displayMissingPartners && displayMissingPartners.length > 0 ? (
                                  displayMissingPartners.map((fac, idx) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                      <td className="p-3 font-medium">{fac.partner_name}</td>
                                      <td className="p-3">
                                        <div className="font-semibold">{fac.facility_name}</div>
                                        {fac.company_name && fac.company_name !== fac.facility_name && (
                                          <div className="text-xs text-gray-400">상호명: {fac.company_name}</div>
                                        )}
                                      </td>
                                      <td className="p-3 font-mono">{fac.business_number}</td>
                                      <td className="p-3 font-mono text-xs">{fac.email || <span className="text-red-500">이메일 없음</span>}</td>
                                      <td className="p-3 text-center">
                                        {fac.email ? (
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-gray-400 hover:text-blue-600"
                                            onClick={() => copyToClipboard(fac.email, "이메일")}
                                            title="이메일 복사"
                                          >
                                            <Copy className="h-3.5 w-3.5" />
                                          </Button>
                                        ) : "-"}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="text-center p-10">
                                      <div className="flex flex-col items-center justify-center text-green-600 dark:text-green-400 space-y-2">
                                        <CheckCircle2 className="h-10 w-10 text-green-500 animate-bounce" />
                                        <span className="font-semibold text-sm">축하합니다! 누락된 거래처가 존재하지 않습니다.</span>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
