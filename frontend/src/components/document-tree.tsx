import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import type React from "react"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCog,
  FileSpreadsheet,
  Download,
  Trash2,
  Copy,
  Move,
  CheckSquare,
  FileEdit,
  Plus,
  Save,
  ListFilter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import TemplateReplacementModal from "./template-replacement-modal"
import PresetSelectionModal from "./preset-selection-modal"
import PresetManagementModal from "./preset-management-modal"
import { useToast } from "@/hooks/use-toast"
import VariableSelectionModal from "./variable-selection-modal"
import { useFileStore } from "@/stores/fileStore"
// import { models } from "../../wailsjs/go/models"
import type { UIPresetModel } from "@/stores/presetStore"

// UI에서 치환 작업을 위해 사용하는 확장된 프리셋 아이템 타입
// interface UIReplacementItem extends models.PresetItem {
//   value: string;
// }

// 파일 타입에 따른 아이콘 매핑
const fileIcons: Record<string, React.ReactNode> = {
  default: <File className="h-4 w-4 text-gray-500" />,
  pdf: <FileText className="h-4 w-4 text-red-500" />,
  doc: <FileText className="h-4 w-4 text-blue-500" />,
  docx: <FileText className="h-4 w-4 text-blue-500" />,
  xls: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  xlsx: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  txt: <FileText className="h-4 w-4 text-gray-500" />,
  json: <FileCog className="h-4 w-4 text-yellow-500" />,
}

// 예시 프리셋 데이터
// const defaultPresets: ReplacementPreset[] = [
//   {
//     id: "preset-1",
//     name: "기본 회사 정보",
//     description: "회사명, 대표자, 사업자번호 등 기본 정보",
//     category: "회사 정보",
//     items: [
//       { key: "{{회사명}}", value: "주식회사 예시기업" },
//       { key: "{{대표자명}}", value: "홍길동" },
//       { key: "{{사업자번호}}", value: "123-45-67890" },
//       { key: "{{주소}}", value: "서울시 강남구 테헤란로 123" },
//       { key: "{{연락처}}", value: "02-1234-5678" },
//       { key: "{{이메일}}", value: "contact@example.com" },
//     ],
//   },
//   {
//     id: "preset-2",
//     name: "계약 기본 정보",
//     description: "계약일자, 계약금액 등 계약 관련 기본 정보",
//     category: "계약 정보",
//     items: [
//       { key: "{{계약번호}}", value: "CT-2025-001" },
//       { key: "{{계약일자}}", value: "2025-05-05" },
//       { key: "{{계약시작일}}", value: "2025-05-10" },
//       { key: "{{계약종료일}}", value: "2026-05-09" },
//       { key: "{{계약금액}}", value: "10,000,000" },
//       { key: "{{계약목적}}", value: "상품 공급 및 유지보수" },
//     ],
//   },
//   {
//     id: "preset-3",
//     name: "한국전자 거래처 정보",
//     description: "한국전자 거래처 관련 정보",
//     category: "거래처 정보",
//     items: [
//       { key: "{{거래처명}}", value: "한국전자 주식회사" },
//       { key: "{{거래처대표자}}", value: "김영수" },
//       { key: "{{거래처사업자번호}}", value: "234-56-78901" },
//       { key: "{{거래처주소}}", value: "서울시 서초구 서초대로 789" },
//       { key: "{{거래처연락처}}", value: "02-9876-5432" },
//       { key: "{{거래처담당자}}", value: "박지민" },
//       { key: "{{거래처담당자연락처}}", value: "010-1234-5678" },
//     ],
//   },
//   {
//     id: "preset-4",
//     name: "대한물산 거래처 정보",
//     description: "대한물산 거래처 관련 정보",
//     category: "거래처 정보",
//     items: [
//       { key: "{{거래처명}}", value: "대한물산 주식회사" },
//       { key: "{{거래처대표자}}", value: "이수진" },
//       { key: "{{거래처사업자번호}}", value: "345-67-89012" },
//       { key: "{{거래처주소}}", value: "경기도 성남시 분당구 판교로 456" },
//       { key: "{{거래처연락처}}", value: "031-8765-4321" },
//       { key: "{{거래처담당자}}", value: "정민호" },
//       { key: "{{거래처담당자연락처}}", value: "010-9876-5432" },
//     ],
//   },
//   {
//     id: "preset-5",
//     name: "견적서 기본 항목",
//     description: "견적서 관련 기본 항목",
//     category: "문서 유형",
//     items: [
//       { key: "{{견적번호}}", value: "QT-2025-001" },
//       { key: "{{견적일자}}", value: "2025-05-05" },
//       { key: "{{견적유효기간}}", value: "30일" },
//       { key: "{{납품기한}}", value: "2025-06-05" },
//       { key: "{{결제조건}}", value: "계약금 50%, 잔금 50%" },
//       { key: "{{담당자}}", value: "김영수" },
//     ],
//   },
// ]

// 파일 확장자에 따른 아이콘 가져오기
const getFileIcon = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase() || "default"
  return fileIcons[extension] || fileIcons.default
}

// 파일 시스템 항목 타입 정의
interface FileSystemItem {
  id: string
  name: string
  fileType: "file" | "folder" | string
  children?: FileSystemItem[]
  path: string
  size?: string // 굳이 필요한가?
  modified?: string // 굳이 필요한가?
  isTemplate?: boolean // 굳이 필요한가?
}

// 예시 데이터 - 실제로는 API 호출로 대체될 수 있음
// const sampleFileSystem: FileSystemItem[] = [
//   {
//     id: "1",
//     name: "계약서",
//     fileType: "folder",
//     path: "/documents/contracts",
//     children: [
//       {
//         id: "1-1",
//         name: "2025년 계약",
//         fileType: "folder",
//         path: "/documents/contracts/2025",
//         children: [
//           {
//             id: "1-1-1",
//             name: "한국전자_공급계약서.pdf",
//             fileType: "file",
//             path: "/documents/contracts/2025/한국전자_공급계약서.pdf",
//             size: "2.4 MB",
//             modified: "2025-05-03",
//           },
//           {
//             id: "1-1-2",
//             name: "대한물산_유지보수계약.docx",
//             fileType: "file",
//             path: "/documents/contracts/2025/대한물산_유지보수계약.docx",
//             size: "1.8 MB",
//             modified: "2025-05-02",
//           },
//         ],
//       },
//       {
//         id: "1-2",
//         name: "2024년 계약",
//         fileType: "folder",
//         path: "/documents/contracts/2024",
//         children: [
//           {
//             id: "1-2-1",
//             name: "성원기업_서비스계약.pdf",
//             fileType: "file",
//             path: "/documents/contracts/2024/성원기업_서비스계약.pdf",
//             size: "3.1 MB",
//             modified: "2024-12-15",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "2",
//     name: "견적서",
//     fileType: "folder",
//     path: "/documents/quotes",
//     children: [
//       {
//         id: "2-1",
//         name: "한국전자_5월납품견적.xlsx",
//         fileType: "file",
//         path: "/documents/quotes/한국전자_5월납품견적.xlsx",
//         size: "1.2 MB",
//         modified: "2025-05-01",
//       },
//       {
//         id: "2-2",
//         name: "대한물산_서비스견적.pdf",
//         fileType: "file",
//         path: "/documents/quotes/대한물산_서비스견적.pdf",
//         size: "0.8 MB",
//         modified: "2025-04-28",
//       },
//     ],
//   },
//   {
//     id: "3",
//     name: "인보이스",
//     fileType: "folder",
//     path: "/documents/invoices",
//     children: [
//       {
//         id: "3-1",
//         name: "4월 인보이스",
//         fileType: "folder",
//         path: "/documents/invoices/april",
//         children: [
//           {
//             id: "3-1-1",
//             name: "한국전자_4월인보이스.pdf",
//             fileType: "file",
//             path: "/documents/invoices/april/한국전자_4월인보이스.pdf",
//             size: "0.7 MB",
//             modified: "2025-04-30",
//           },
//           {
//             id: "3-1-2",
//             name: "대한물산_4월인보이스.pdf",
//             fileType: "file",
//             path: "/documents/invoices/april/대한물산_4월인보이스.pdf",
//             size: "0.6 MB",
//             modified: "2025-04-30",
//           },
//         ],
//       },
//       {
//         id: "3-2",
//         name: "3월 인보이스",
//         fileType: "folder",
//         path: "/documents/invoices/march",
//         children: [
//           {
//             id: "3-2-1",
//             name: "한국전자_3월인보이스.pdf",
//             fileType: "file",
//             path: "/documents/invoices/march/한국전자_3월인보이스.pdf",
//             size: "0.7 MB",
//             modified: "2025-03-31",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "4",
//     name: "템플릿",
//     fileType: "folder",
//     path: "/documents/templates",
//     children: [
//       {
//         id: "4-1",
//         name: "계약서_템플릿.docx",
//         fileType: "file",
//         path: "/documents/templates/계약서_템플릿.docx",
//         size: "0.5 MB",
//         modified: "2025-01-15",
//         isTemplate: true,
//       },
//       {
//         id: "4-2",
//         name: "견적서_템플릿.xlsx",
//         fileType: "file",
//         path: "/documents/templates/견적서_템플릿.xlsx",
//         size: "0.4 MB",
//         modified: "2025-01-15",
//         isTemplate: true,
//       },
//       {
//         id: "4-3",
//         name: "인보이스_템플릿.docx",
//         fileType: "file",
//         path: "/documents/templates/인보이스_템플릿.docx",
//         size: "0.3 MB",
//         modified: "2025-01-15",
//         isTemplate: true,
//       },
//     ],
//   },
// ]

// 트리 아이템 컴포넌트
const TreeItem = ({
  item,
  level = 0,
  expandedItems,
  toggleExpand,
  selectedItems,
  toggleSelectItem,
  selectRange,
  lastClickedItem,
  setLastClickedItem,
  onOpenTemplateModal,
}: {
  item: FileSystemItem
  level?: number
  expandedItems: Set<string>
  toggleExpand: (id: string) => void
  selectedItems: Set<string>
  toggleSelectItem: (id: string, multiSelect: boolean, rangeSelect: boolean) => void
  selectRange: (startId: string, endId: string) => void
  lastClickedItem: string | null
  setLastClickedItem: (id: string | null) => void
  onOpenTemplateModal: (item: FileSystemItem) => void
}) => {
  const isExpanded = expandedItems.has(item.id)
  const isSelected = selectedItems.has(item.id)

  const handleItemClick = (e: React.MouseEvent) => {
    if (item.fileType === "folder") {
      toggleExpand(item.id)
    }

    // Ctrl/Cmd 키를 누른 상태에서 클릭하면 다중 선택
    const multiSelect = e.ctrlKey || e.metaKey
    // Shift 키를 누른 상태에서 클릭하면 범위 선택
    const rangeSelect = e.shiftKey

    if (rangeSelect && lastClickedItem && item.fileType === "file") {
      selectRange(lastClickedItem, item.id)
    } else {
      toggleSelectItem(item.id, multiSelect, rangeSelect)
      if (item.fileType === "file") {
        setLastClickedItem(item.id)
      }
    }
  }

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSelectItem(item.id, true, false)
    if (item.fileType === "file") {
      setLastClickedItem(item.id)
    }
  }

  const handleOpenTemplateModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOpenTemplateModal(item)
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
          isSelected && "bg-blue-50 dark:bg-blue-900/20",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleItemClick}
      >
        {item.fileType === "file" && (
          <div className="mr-2" onClick={handleCheckboxChange}>
            <Checkbox checked={isSelected} />
          </div>
        )}

        {item.fileType === "folder" && (
          <div className="mr-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
        )}

        <div className="mr-2">
          {item.fileType === "folder" ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-500" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500" />
            )
          ) : (
            getFileIcon(item.name)
          )}
        </div>

        <span className="text-sm truncate flex-grow">{item.name}</span>

        {item.isTemplate && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-1"
            onClick={handleOpenTemplateModal}
            title="템플릿 치환"
          >
            <FileEdit className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {item.fileType === "folder" && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              expandedItems={expandedItems}
              toggleExpand={toggleExpand}
              selectedItems={selectedItems}
              toggleSelectItem={toggleSelectItem}
              selectRange={selectRange}
              lastClickedItem={lastClickedItem}
              setLastClickedItem={setLastClickedItem}
              onOpenTemplateModal={onOpenTemplateModal}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 선택된 파일 목록 컴포넌트
const SelectedFilesPanel = ({
  selectedFiles,
  clearSelection,
  handleBatchDownload,
}: {
  selectedFiles: FileSystemItem[]
  clearSelection: () => void
  handleBatchDownload: () => void
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (selectedFiles.length === 0) {
    return (
      <div className="p-6 text-center border rounded-md bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500">작업할 파일을 선택해주세요</div>
        <p className="text-xs text-gray-400 mt-2">
          Ctrl/Cmd 키를 누른 상태에서 클릭하여 여러 파일을 선택할 수 있습니다
        </p>
        <p className="text-xs text-gray-400 mt-1">Shift 키를 누른 상태에서 클릭하여 범위 선택이 가능합니다</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <CheckSquare className="h-4 w-4 mr-2" />
          <span className="font-medium">선택된 파일 ({selectedFiles.length}개)</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            선택 해제
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleCollapse}>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 max-h-[300px] overflow-auto">
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div key={file.id} className="flex items-center p-2 border rounded-md bg-white dark:bg-gray-950">
                {getFileIcon(file.name)}
                <span className="ml-2 text-sm truncate flex-grow">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">{file.size}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="default" size="sm" className="flex-1" onClick={handleBatchDownload}>
              <Download className="h-4 w-4 mr-2" /> 다운로드
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Copy className="h-4 w-4 mr-2" /> 복사
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Move className="h-4 w-4 mr-2" /> 이동
            </Button>
            <Button variant="destructive" size="sm" className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" /> 삭제
            </Button>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="p-2 flex flex-wrap gap-2 bg-white dark:bg-gray-950">
          <Button variant="default" size="sm" onClick={handleBatchDownload}>
            <Download className="h-4 w-4 mr-2" /> 다운로드
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" /> 복사
          </Button>
          <Button variant="outline" size="sm">
            <Move className="h-4 w-4 mr-2" /> 이동
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" /> 삭제
          </Button>
        </div>
      )}
    </div>
  )
}

// 문자열 치환 패널 컴포넌트
const StringReplacementPanel = ({
  selectedFiles,
}: {
  selectedFiles: FileSystemItem[]
}) => {
  const { toast } = useToast()

  // 프리셋 상태 관리
  const [presets, setPresets] = useState<UIPresetModel[]>([])

  // 변수 선택 모달 상태
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false)

  // 예시 치환 항목들
  const [replacements, setReplacements] = useState<Array<{ key: string; value: string }>>([
    { key: "{{회사명}}", value: "" },
    { key: "{{대표자명}}", value: "" },
    { key: "{{사업자번호}}", value: "" },
    { key: "{{주소}}", value: "" },
    { key: "{{연락처}}", value: "" },
    { key: "{{이메일}}", value: "" },
  ])

  // 모달 상태
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false)
  const [isPresetManagementModalOpen, setIsPresetManagementModalOpen] = useState(false)
  const [lastAppliedPreset, setLastAppliedPreset] = useState<string | null>(null)
  const [editingPreset, setEditingPreset] = useState<UIPresetModel | null>(null)

  // 치환 값 변경 핸들러
  const handleValueChange = (index: number, value: string) => {
    const newReplacements = [...replacements]
    newReplacements[index].value = value
    setReplacements(newReplacements)
  }

  // 치환 적용 핸들러
  const handleApplyReplacements = () => {
    if (selectedFiles.length === 0) return

    const filledReplacements = replacements.filter((item) => item.value.trim() !== "")
    if (filledReplacements.length === 0) {
      toast({
        title: "변환할 항목이 없습니다",
        description: "최소 하나 이상의 치환 항목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "문자열 치환 완료",
      description: `${selectedFiles.length}개 파일에 ${filledReplacements.length}개 항목이 치환되었습니다.`,
    })

    console.log(
      "적용된 치환:",
      replacements.filter((item) => item.value.trim() !== ""),
    )
  }

  // 새 치환 항목 추가
  const handleAddReplacement = () => {
    setReplacements([...replacements, { key: "", value: "" }])
  }

  // 변수 선택 핸들러
  const handleSelectVariables = (selectedVariables: string[]) => {
    // 이미 존재하는 키를 제외한 새 변수만 필터링
    const existingKeys = replacements.map((item) => item.key)
    const newVariables = selectedVariables.filter((variable) => !existingKeys.includes(variable))

    // 새 변수를 치환 항목에 추가
    if (newVariables.length > 0) {
      const newReplacements = [...replacements, ...newVariables.map((variable) => ({ key: variable, value: "" }))]
      setReplacements(newReplacements)

      toast({
        title: "변수 추가됨",
        description: `${newVariables.length}개의 변수가 추가되었습니다.`,
      })
    }
  }

  // 치환 항목 키 변경
  const handleKeyChange = (index: number, key: string) => {
    const newReplacements = [...replacements]
    newReplacements[index].key = key
    setReplacements(newReplacements)
  }

  // 치환 항목 삭제
  const handleRemoveReplacement = (index: number) => {
    const newReplacements = [...replacements]
    newReplacements.splice(index, 1)
    setReplacements(newReplacements)
  }

  // 프리셋 선택 핸들러
  const handleSelectPreset = (preset: UIPresetModel) => {
    // 기존 항목 중 프리셋에 없는 키를 가진 항목들
    // const existingItems = replacements.filter((item) => !preset.items.some((presetItem) => presetItem.key === item.key))

    // 프리셋 항목과 기존 항목 병합
    // const mergedItems = [...preset.items, ...existingItems]
    // 선댁된 프리셋이 기존걸 대체
    const mergedItems = [...preset.items]

    // 중복 제거
    const uniqueItems = mergedItems.reduce<Array<{ key: string; value: string }>>((acc, item) => {
      if (!acc.some((i) => i.key === item.key)) {
        acc.push(item)
      }
      return acc
    }, [])

    setReplacements(uniqueItems)
    setLastAppliedPreset(preset.name)
    setIsPresetModalOpen(false)

    toast({
      title: "프리셋 적용됨",
      description: `"${preset.name}" 프리셋이 적용되었습니다.`,
    })
  }

  // 새 프리셋 생성 핸들러
  const handleCreatePreset = () => {
    setEditingPreset(null)
    setIsPresetManagementModalOpen(true)
    setIsPresetModalOpen(false)
  }

  // 프리셋 수정 핸들러
  const handleEditPreset = (preset: UIPresetModel) => {
    setEditingPreset(preset)
    setIsPresetManagementModalOpen(true)
    setIsPresetModalOpen(false)
  }

  // 프리셋 삭제 핸들러
  const handleDeletePreset = (presetId: number) => {
    setPresets(presets.filter((preset) => preset.id !== presetId))
    toast({
      title: "프리셋 삭제됨",
      description: "프리셋이 삭제되었습니다.",
    })
  }

  // 프리셋 저장 핸들러
  const handleSavePreset = (preset: UIPresetModel) => {
    if (editingPreset) {
      // 기존 프리셋 수정
      setPresets(presets.map((p) => (p.id === preset.id ? preset : p)))
      toast({
        title: "프리셋 수정됨",
        description: `"${preset.name}" 프리셋이 수정되었습니다.`,
      })
    } else {
      // 새 프리셋 추가
      setPresets([...presets, preset])
      toast({
        title: "프리셋 생성됨",
        description: `"${preset.name}" 프리셋이 생성되었습니다.`,
      })
    }
  }

  // 현재 치환 항목으로 프리셋 생성
  const handleCreatePresetFromCurrent = () => {
    // 빈 항목 제거
    const validItems = replacements.filter((item) => item.key.trim() !== "")

    if (validItems.length === 0) {
      toast({
        title: "치환 항목이 없습니다",
        description: "최소 하나 이상의 치환 항목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 여기도 임시, 나중에 store에서 가져와야함
    setEditingPreset({
      id:111,
      name: "",
      description: "",
      items: validItems.map((item, index) => ({ key: item.key, value: item.value, id: index+999, preset_id:index+888, description:"temp"})),
    })
    setIsPresetManagementModalOpen(true)
  }

  // 카테고리 목록 추출
  // const categories = Array.from(new Set(presets.map((preset) => preset.category)))

  if (selectedFiles.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>문서를 선택하면 문자열 치환 옵션이 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="justify-between items-center mb-4">
        <h3 className="font-medium">문자열 치환</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPresetModalOpen(true)}>
            <ListFilter className="h-3 w-3 mr-1" /> 프리셋
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddReplacement}>
            <Plus className="h-3 w-3 mr-1" /> 항목 추가
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsVariableModalOpen(true)}>
            <Plus className="h-3 w-3 mr-1" /> 변수 선택
          </Button>
        </div>
      </div>

      {lastAppliedPreset && (
        <div className="mb-3 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-md dark:bg-blue-900/20 dark:text-blue-300">
          적용된 프리셋: {lastAppliedPreset}
        </div>
      )}

      <div className="space-y-3">
        {replacements.map((replacement, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              value={replacement.key}
              onChange={(e) => handleKeyChange(index, e.target.value)}
              placeholder="찾을 문자열"
              className="flex-1"
            />
            <span className="text-gray-500">→</span>
            <Input
              value={replacement.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              placeholder="변경할 문자열"
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => handleRemoveReplacement(index)} className="h-8 w-8">
              <Trash2 className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        ))}
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">
            {selectedFiles.length === 1
              ? `"${selectedFiles[0].name}" 파일에 적용됩니다.`
              : `선택된 ${selectedFiles.length}개 파일에 적용됩니다.`}
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleApplyReplacements}
              disabled={replacements.every((item) => item.value.trim() === "")}
            >
              <Save className="mr-2 h-4 w-4" />
              치환 적용하기
            </Button>
            <Button variant="outline" onClick={handleCreatePresetFromCurrent} title="현재 치환 항목을 프리셋으로 저장">
              프리셋 저장
            </Button>
          </div>
        </div>
      )}

      {/* 변수 선택 모달 */}
      <VariableSelectionModal
        isOpen={isVariableModalOpen}
        onClose={() => setIsVariableModalOpen(false)}
        onSelectVariables={handleSelectVariables}
        existingVariables={replacements.map((item) => item.key)}
      />

      {/* 프리셋 선택 모달 */}
      <PresetSelectionModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleSelectPreset}
        // presets={presets}
        onCreatePreset={handleCreatePreset}
        onEditPreset={handleEditPreset}
        onDeletePreset={handleDeletePreset}
      />

      {/* 프리셋 생성/수정 모달 */}
      <PresetManagementModal
        isOpen={isPresetManagementModalOpen}
        onClose={() => setIsPresetManagementModalOpen(false)}
        onSave={handleSavePreset}
        editingPreset={editingPreset}
        // existingCategories={categories}
      />
    </div>
  )
}

// 파일 크기 합계 계산
// const calculateTotalSize = (files: FileSystemItem[]): string => {
//   const totalSizeInMB = files.reduce((total, file) => {
//     const sizeStr = file.size || "0 MB"
//     const size = Number.parseFloat(sizeStr.replace(" MB", ""))
//     return total + size
//   }, 0)

//   return totalSizeInMB.toFixed(1) + " MB"
// }

// 파일 유형 목록 가져오기
// const getFileTypes = (files: FileSystemItem[]): string[] => {
//   const types = new Set<string>()
//   files.forEach((file) => {
//     const extension = file.name.split(".").pop()?.toLowerCase() || ""
//     if (extension) types.add(extension)
//   })
//   return Array.from(types)
// }

// 템플릿 샘플 데이터
const sampleTemplate = {
  content: "계약서 템플릿 내용: {companyName}과 {clientName}은 다음과 같이 계약을 체결한다.",
  placeholders: ["companyName", "clientName"],
}

// 메인 문서 트리 컴포넌트
export default function DocumentTree() {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(["1", "2", "3", "4"])) // 기본적으로 최상위 폴더는 열려있음
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [lastClickedItem, setLastClickedItem] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileSystemItem[]>([])
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<FileSystemItem | null>(null)
  const { fileSystem } = useFileStore()

  // 선택된 아이템 찾기
  const findItemById = (items: FileSystemItem[], id: string | null): FileSystemItem | null => {
    if (!id) return null

    for (const item of items) {
      if (item.id === id) return item

      if (item.children) {
        const found = findItemById(item.children, id)
        if (found) return found
      }
    }

    return null
  }

  // 모든 파일 아이템 가져오기
  const getAllFileItems = (items: FileSystemItem[]): FileSystemItem[] => {
    let files: FileSystemItem[] = []

    for (const item of items) {
      if (item.fileType === "file") {
        files.push(item)
      }

      if (item.children) {
        files = [...files, ...getAllFileItems(item.children)]
      }
    }

    return files
  }

  // 선택된 파일 업데이트
  useEffect(() => {
    const allFiles = getAllFileItems(fileSystem)
    const selected = allFiles.filter((file) => selectedItems.has(file.id))
    setSelectedFiles(selected)
  }, [selectedItems])

  // 폴더 확장/축소 토글
  const toggleExpand = (id: string) => {
    const newExpandedItems = new Set(expandedItems)
    if (newExpandedItems.has(id)) {
      newExpandedItems.delete(id)
    } else {
      newExpandedItems.add(id)
    }
    setExpandedItems(newExpandedItems)
  }

  // 아이템 선택 토글
  const toggleSelectItem = (id: string, multiSelect: boolean, rangeSelect: boolean) => {
    const item = findItemById(fileSystem, id)

    // 폴더는 선택하지 않음
    if (item?.fileType === "folder") {
      return
    }

    const newSelectedItems = new Set(selectedItems)

    if (!multiSelect && !rangeSelect) {
      // 일반 클릭: 기존 선택 해제하고 새로 선택
      newSelectedItems.clear()
      if (item?.fileType === "file") {
        newSelectedItems.add(id)
      }
    } else {
      // 다중 선택: 토글
      if (newSelectedItems.has(id)) {
        newSelectedItems.delete(id)
      } else if (item?.fileType === "file") {
        newSelectedItems.add(id)
      }
    }

    setSelectedItems(newSelectedItems)
  }

  // 범위 선택
  const selectRange = (startId: string, endId: string) => {
    const allFiles = getAllFileItems(fileSystem)
    const startIndex = allFiles.findIndex((file) => file.id === startId)
    const endIndex = allFiles.findIndex((file) => file.id === endId)

    if (startIndex === -1 || endIndex === -1) return

    const newSelectedItems = new Set(selectedItems)

    const start = Math.min(startIndex, endIndex)
    const end = Math.max(startIndex, endIndex)

    for (let i = start; i <= end; i++) {
      newSelectedItems.add(allFiles[i].id)
    }

    setSelectedItems(newSelectedItems)
  }

  // 선택 해제
  const clearSelection = () => {
    setSelectedItems(new Set())
    setLastClickedItem(null)
  }

  // 일괄 다운로드
  const handleBatchDownload = () => {
    console.log(
      "Downloading files:",
      selectedFiles.map((file) => file.path),
    )
    // 실제 구현에서는 파일 다운로드 로직 추가
    alert(`${selectedFiles.length}개 파일 다운로드를 시작합니다.`)
  }

  // 템플릿 모달 열기
  const handleOpenTemplateModal = (item: FileSystemItem) => {
    if (item.isTemplate) {
      setSelectedTemplate(item)
      setIsTemplateModalOpen(true)
    }
  }

  // 템플릿 치환 적용
  const handleApplyTemplateReplacement = (replacedContent: string, values: Record<string, string>) => {
    console.log("템플릿 치환 적용:", replacedContent)
    console.log("입력된 값:", values)

    // 실제 구현  => {
    console.log("템플릿 치환 적용:", replacedContent)
    console.log("입력된 값:", values)

    // 실제 구현에서는 새 문서 생성 로직 추가
    alert("템플릿 치환이 완료되었습니다. 새 문서가 생성되었습니다.")
  }

  // 검색 필터링
  const filterItems = (items: FileSystemItem[], term: string): FileSystemItem[] => {
    if (!term) return items

    return items.reduce<FileSystemItem[]>((filtered, item) => {
      if (item.name.toLowerCase().includes(term.toLowerCase())) {
        // 이름이 검색어를 포함하면 항목 추가
        filtered.push(item)
      } else if (item.children) {
        // 자식 항목 중 검색어를 포함하는 것이 있는지 확인
        const filteredChildren = filterItems(item.children, term)
        if (filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children: filteredChildren,
          })
        }
      }
      return filtered
    }, [])
  }

  const filteredFileSystem = filterItems(fileSystem, searchTerm)

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Input
          placeholder="파일 또는 폴더 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 선택된 파일 패널 */}
        <SelectedFilesPanel
          selectedFiles={selectedFiles}
          clearSelection={clearSelection}
          handleBatchDownload={handleBatchDownload}
        />

        {/* 파일 탐색기 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
          <div className="md:col-span-2 border rounded-md overflow-auto">
            <div className="p-2">
              {filteredFileSystem.length > 0 ? (
                filteredFileSystem.map((item) => (
                  <TreeItem
                    key={item.id}
                    item={item}
                    expandedItems={expandedItems}
                    toggleExpand={toggleExpand}
                    selectedItems={selectedItems}
                    toggleSelectItem={toggleSelectItem}
                    selectRange={selectRange}
                    lastClickedItem={lastClickedItem}
                    setLastClickedItem={setLastClickedItem}
                    onOpenTemplateModal={handleOpenTemplateModal}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">검색 결과가 없습니다</div>
              )}
            </div>
          </div>

          <div className="border rounded-md">
            <StringReplacementPanel selectedFiles={selectedFiles} />
          </div>
        </div>
      </div>

      {/* 템플릿 치환 모달 */}
      {selectedTemplate && (
        <TemplateReplacementModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          template={{
            id: selectedTemplate.id,
            name: selectedTemplate.name,
            path: selectedTemplate.path,
            content: sampleTemplate.content,
            placeholders: sampleTemplate.placeholders.map(name => ({
              key: name,
              name: name,
              description: "",
              defaultValue: "",
            })),
          }}
          onApply={handleApplyTemplateReplacement}
        />
      )}
    </div>
  )
}
