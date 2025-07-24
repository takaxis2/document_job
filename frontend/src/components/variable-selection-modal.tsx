import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Check } from "lucide-react"

// 템플릿 변수 타입 정의
export interface TemplateVariable {
  key: string
  description: string
  category: string
}

// 사전 정의된 템플릿 변수들
export const predefinedVariables: TemplateVariable[] = [
  // 회사 정보
  { key: "{{회사명}}", description: "회사 이름", category: "회사 정보" },
  { key: "{{대표자명}}", description: "회사 대표자 이름", category: "회사 정보" },
  { key: "{{사업자번호}}", description: "사업자등록번호", category: "회사 정보" },
  { key: "{{법인번호}}", description: "법인등록번호", category: "회사 정보" },
  { key: "{{설립일}}", description: "회사 설립일", category: "회사 정보" },
  { key: "{{업종}}", description: "회사 업종", category: "회사 정보" },
  { key: "{{업태}}", description: "회사 업태", category: "회사 정보" },
  { key: "{{주소}}", description: "회사 주소", category: "회사 정보" },
  { key: "{{전화번호}}", description: "회사 대표 전화번호", category: "회사 정보" },
  { key: "{{팩스번호}}", description: "회사 팩스번호", category: "회사 정보" },
  { key: "{{이메일}}", description: "회사 대표 이메일", category: "회사 정보" },
  { key: "{{홈페이지}}", description: "회사 홈페이지 주소", category: "회사 정보" },

  // 거래처 정보
  { key: "{{거래처명}}", description: "거래처 이름", category: "거래처 정보" },
  { key: "{{거래처대표자}}", description: "거래처 대표자 이름", category: "거래처 정보" },
  { key: "{{거래처사업자번호}}", description: "거래처 사업자등록번호", category: "거래처 정보" },
  { key: "{{거래처주소}}", description: "거래처 주소", category: "거래처 정보" },
  { key: "{{거래처전화번호}}", description: "거래처 전화번호", category: "거래처 정보" },
  { key: "{{거래처팩스번호}}", description: "거래처 팩스번호", category: "거래처 정보" },
  { key: "{{거래처이메일}}", description: "거래처 이메일", category: "거래처 정보" },
  { key: "{{거래처담당자}}", description: "거래처 담당자 이름", category: "거래처 정보" },
  { key: "{{거래처담당자연락처}}", description: "거래처 담당자 연락처", category: "거래처 정보" },

  // 계약 정보
  { key: "{{계약번호}}", description: "계약 고유 번호", category: "계약 정보" },
  { key: "{{계약일자}}", description: "계약 체결 일자", category: "계약 정보" },
  { key: "{{계약시작일}}", description: "계약 시작일", category: "계약 정보" },
  { key: "{{계약종료일}}", description: "계약 종료일", category: "계약 정보" },
  { key: "{{계약금액}}", description: "계약 금액", category: "계약 정보" },
  { key: "{{계약목적}}", description: "계약의 목적", category: "계약 정보" },
  { key: "{{계약기간}}", description: "계약 유효 기간", category: "계약 정보" },
  { key: "{{계약담당자}}", description: "계약 담당자 이름", category: "계약 정보" },

  // 견적 정보
  { key: "{{견적번호}}", description: "견적서 번호", category: "견적 정보" },
  { key: "{{견적일자}}", description: "견적서 작성일", category: "견적 정보" },
  { key: "{{견적유효기간}}", description: "견적서 유효기간", category: "견적 정보" },
  { key: "{{견적금액}}", description: "견적 총액", category: "견적 정보" },
  { key: "{{납품기한}}", description: "납품 기한", category: "견적 정보" },
  { key: "{{결제조건}}", description: "결제 조건", category: "견적 정보" },

  // 인보이스 정보
  { key: "{{인보이스번호}}", description: "인보이스 번호", category: "인보이스 정보" },
  { key: "{{인보이스발행일}}", description: "인보이스 발행일", category: "인보이스 정보" },
  { key: "{{인보이스만기일}}", description: "인보이스 지불 만기일", category: "인보이스 정보" },
  { key: "{{인보이스금액}}", description: "인보이스 총액", category: "인보이스 정보" },
  { key: "{{세금계산서번호}}", description: "세금계산서 번호", category: "인보이스 정보" },

  // 기타 정보
  { key: "{{오늘날짜}}", description: "현재 날짜", category: "기타 정보" },
  { key: "{{담당자}}", description: "담당자 이름", category: "기타 정보" },
  { key: "{{담당자연락처}}", description: "담당자 연락처", category: "기타 정보" },
  { key: "{{담당자이메일}}", description: "담당자 이메일", category: "기타 정보" },
]

// 변수 선택 모달 컴포넌트
interface VariableSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectVariables: (variables: string[]) => void
  existingVariables: string[]
}

export default function VariableSelectionModal({
  isOpen,
  onClose,
  onSelectVariables,
  existingVariables,
}: VariableSelectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVariables, setSelectedVariables] = useState<string[]>([])
  const [customVariable, setCustomVariable] = useState("")

  // 카테고리 목록 추출
  const categories = Array.from(new Set(predefinedVariables.map((variable) => variable.category)))

  // 검색 및 카테고리 필터링
  const filteredVariables = predefinedVariables.filter((variable) => {
    // 카테고리 필터
    const matchesCategory = selectedCategory ? variable.category === selectedCategory : true

    // 검색어 필터
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      variable.key.toLowerCase().includes(searchLower) ||
      variable.description.toLowerCase().includes(searchLower)

    return matchesCategory && matchesSearch
  })

  // 모달이 열릴 때 이미 존재하는 변수들을 선택 상태로 설정
  useState(() => {
    if (isOpen) {
      setSelectedVariables(existingVariables)
    }
  })

  // 변수 선택 토글
  const toggleVariableSelection = (key: string) => {
    setSelectedVariables((prev) => {
      if (prev.includes(key)) {
        return prev.filter((item) => item !== key)
      } else {
        return [...prev, key]
      }
    })
  }

  // 사용자 정의 변수 추가
  const addCustomVariable = () => {
    if (!customVariable.trim()) return

    // 변수 형식 확인 및 수정
    let formattedVariable = customVariable.trim()
    if (!formattedVariable.startsWith("{{")) {
      formattedVariable = "{{" + formattedVariable
    }
    if (!formattedVariable.endsWith("}}")) {
      formattedVariable = formattedVariable + "}}"
    }

    // 이미 선택된 변수에 없는 경우에만 추가
    if (!selectedVariables.includes(formattedVariable)) {
      setSelectedVariables((prev) => [...prev, formattedVariable])
    }

    setCustomVariable("")
  }

  // 선택 완료
  const handleConfirm = () => {
    onSelectVariables(selectedVariables)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            템플릿 변수 선택
          </DialogTitle>
          <DialogDescription>문서에 사용할 템플릿 변수를 선택하세요.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="변수 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 카테고리 사이드바 */}
          <div className="w-1/4 border-r pr-4">
            <div
              className={`px-3 py-2 rounded-md cursor-pointer mb-1 ${
                selectedCategory === null
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              전체 보기
            </div>
            {categories.map((category) => (
              <div
                key={category}
                className={`px-3 py-2 rounded-md cursor-pointer mb-1 ${
                  selectedCategory === category
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </div>
            ))}
          </div>

          {/* 변수 목록 */}
          <div className="flex-1 pl-4">
            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="사용자 정의 변수 추가 (예: {{변수명}})"
                  value={customVariable}
                  onChange={(e) => setCustomVariable(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addCustomVariable} disabled={!customVariable.trim()}>
                  추가
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                사용자 정의 변수는 자동으로 {"{{"} 변수명 {"}}"} 형식으로 변환됩니다.
              </p>
            </div>

            <ScrollArea className="h-[40vh]">
              {filteredVariables.length > 0 ? (
                <div className="space-y-1">
                  {filteredVariables.map((variable) => (
                    <div
                      key={variable.key}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedVariables.includes(variable.key)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => toggleVariableSelection(variable.key)}
                    >
                      <Checkbox
                        checked={selectedVariables.includes(variable.key)}
                        className="mr-2"
                        onCheckedChange={() => toggleVariableSelection(variable.key)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{variable.key}</div>
                        <div className="text-sm text-gray-500">{variable.description}</div>
                      </div>
                      {selectedVariables.includes(variable.key) && <Check className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm ? (
                    <>
                      <Search className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>검색 결과가 없습니다</p>
                    </>
                  ) : (
                    <p>변수가 없습니다</p>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="pt-4 border-t mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">{selectedVariables.length}개 변수 선택됨</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button onClick={handleConfirm}>선택 완료</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
