import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Save, X } from "lucide-react"

// 템플릿 내 플레이스홀더 타입 정의
interface TemplatePlaceholder {
  key: string
  description: string
  defaultValue: string
}

// 템플릿 문서 타입 정의
interface TemplateDocument {
  id: string
  name: string
  path: string
  content: string
  placeholders: TemplatePlaceholder[]
}

// 예시 템플릿 문서
// const sampleTemplate: TemplateDocument = {
//   id: "template-1",
//   name: "계약서_템플릿.docx",
//   path: "/documents/templates/계약서_템플릿.docx",
//   content: `
//     계약서

//     계약 번호: {{계약번호}}
//     계약일: {{계약일자}}

//     갑: {{갑_회사명}}
//     주소: {{갑_주소}}
//     대표자: {{갑_대표자}}

//     을: {{을_회사명}}
//     주소: {{을_주소}}
//     대표자: {{을_대표자}}

//     제1조 (목적)
//     본 계약은 {{계약목적}}을 위해 체결되었다.

//     제2조 (계약금액)
//     계약금액은 {{계약금액}}원으로 한다.

//     제3조 (계약기간)
//     본 계약의 유효기간은 {{계약시작일}}부터 {{계약종료일}}까지로 한다.
//   `,
//   placeholders: [
//     { key: "계약번호", description: "계약 고유 번호", defaultValue: "CT-2025-001" },
//     { key: "계약일자", description: "계약 체결 일자", defaultValue: "2025-05-04" },
//     { key: "갑_회사명", description: "갑 회사명", defaultValue: "주식회사 예시기업" },
//     { key: "갑_주소", description: "갑 회사 주소", defaultValue: "서울시 강남구 테헤란로 123" },
//     { key: "갑_대표자", description: "갑 회사 대표자명", defaultValue: "홍길동" },
//     { key: "을_회사명", description: "을 회사명", defaultValue: "" },
//     { key: "을_주소", description: "을 회사 주소", defaultValue: "" },
//     { key: "을_대표자", description: "을 회사 대표자명", defaultValue: "" },
//     { key: "계약목적", description: "계약의 목적", defaultValue: "상품 공급" },
//     { key: "계약금액", description: "계약 금액(숫자만 입력)", defaultValue: "10,000,000" },
//     { key: "계약시작일", description: "계약 시작일", defaultValue: "2025-05-10" },
//     { key: "계약종료일", description: "계약 종료일", defaultValue: "2026-05-09" },
//   ],
// }

// 템플릿 치환 모달 컴포넌트
interface TemplateReplacementModalProps {
  isOpen: boolean
  onClose: () => void
  template: TemplateDocument
  onApply: (replacedContent: string, values: Record<string, string>) => void
}

export default function TemplateReplacementModal({
  isOpen,
  onClose,
  template,
  onApply,
}: TemplateReplacementModalProps) {
  // 플레이스홀더 값 상태
  const [values, setValues] = useState<Record<string, string>>({})
  // 미리보기 내용
  const [previewContent, setPreviewContent] = useState("")
  // 현재 탭
  const [activeTab, setActiveTab] = useState("edit")

  // 템플릿이 변경되면 기본값으로 초기화
  useEffect(() => {
    const initialValues: Record<string, string> = {}
    template.placeholders.forEach((placeholder) => {
      initialValues[placeholder.key] = placeholder.defaultValue
    })
    setValues(initialValues)
  }, [template])

  // 값이 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    updatePreview()
  }, [values])

  // 입력값 변경 핸들러
  const handleValueChange = (key: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // 미리보기 업데이트
  const updatePreview = () => {
    let content = template.content
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g")
      content = content.replace(regex, value || `{{${key}}}`)
    })
    setPreviewContent(content)
  }

  // 적용 버튼 핸들러
  const handleApply = () => {
    onApply(previewContent, values)
    onClose()
  }

  // 모든 필드가 채워졌는지 확인
  const allFieldsFilled = () => {
    return template.placeholders.every(
      (placeholder) => values[placeholder.key] && values[placeholder.key].trim() !== "",
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            템플릿 문서 치환 - {template.name}
          </DialogTitle>
          <DialogDescription>템플릿 내 플레이스홀더를 원하는 값으로 치환하여 새 문서를 생성합니다.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-2 w-[200px]">
            <TabsTrigger value="edit">입력</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {template.placeholders.map((placeholder) => (
                <div key={placeholder.key} className="space-y-2">
                  <Label htmlFor={placeholder.key} className="flex items-center">
                    {placeholder.key}
                    <span className="ml-2 text-xs text-gray-500">({placeholder.description})</span>
                  </Label>
                  <Input
                    id={placeholder.key}
                    value={values[placeholder.key] || ""}
                    onChange={(e) => handleValueChange(placeholder.key, e.target.value)}
                    placeholder={placeholder.description}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-auto">
            <div className="border rounded-md p-4 whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
              {previewContent}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center pt-2">
          <div className="text-sm text-gray-500">
            {allFieldsFilled() ? (
              <span className="text-green-600">모든 필드가 입력되었습니다</span>
            ) : (
              <span className="text-amber-600">일부 필드가 입력되지 않았습니다</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              취소
            </Button>
            <Button onClick={handleApply} disabled={!allFieldsFilled()}>
              <Save className="mr-2 h-4 w-4" />
              적용
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
