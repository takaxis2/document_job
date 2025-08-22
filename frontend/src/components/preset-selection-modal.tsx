import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ListFilter, Search, Edit, Trash2, Plus, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { UIPresetModel } from "../stores/presetStore"

// 치환 항목 타입 정의
export interface ReplacementItem {
  key: string
  value: string
}

// 프리셋 타입 정의
// export interface ReplacementPreset {
//   id: string
//   name: string
//   description: string
//   category: string
//   items: ReplacementItem[]
// }

// 프리셋 선택 모달 컴포넌트
interface PresetSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPreset: (preset: UIPresetModel) => void
  presets: UIPresetModel[]
  onCreatePreset: () => void
  onEditPreset: (preset: UIPresetModel) => void
  onDeletePreset: (presetId: number) => void
}

export default function PresetSelectionModal({
  isOpen,
  onClose,
  onSelectPreset,
  presets,
  onCreatePreset,
  onEditPreset,
  onDeletePreset,
}: PresetSelectionModalProps) {
  // const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [presetToDelete, setPresetToDelete] = useState<number | null>(null)

  // 카테고리 목록 추출
  // const categories = Array.from(new Set(presets.map((preset) => preset.category)))

  // 검색 및 카테고리 필터링
  const filteredPresets = presets.filter((preset) => {
    // 카테고리 필터
    // const matchesCategory = selectedCategory ? preset.category === selectedCategory : true

    // 검색어 필터
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      searchTerm === "" ||
      preset.name.toLowerCase().includes(searchLower) ||
      preset.description.toLowerCase().includes(searchLower) ||
      preset.items.some(
        (item) => item.key.toLowerCase().includes(searchLower) 
        // || item.value.toLowerCase().includes(searchLower),
      )
      

    // return matchesCategory && matchesSearch
    return matchesSearch
  })

  // 삭제 확인 다이얼로그 열기
  const handleDeleteClick = (e: React.MouseEvent, presetId: number) => {
    e.stopPropagation()
    setPresetToDelete(presetId)
  }

  // 삭제 확인
  const confirmDelete = () => {
    if (presetToDelete) {
      onDeletePreset(presetToDelete)
      setPresetToDelete(null)
    }
  }

  // 수정 버튼 클릭
  const handleEditClick = (e: React.MouseEvent, preset: UIPresetModel) => {
    e.stopPropagation()
    onEditPreset(preset)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ListFilter className="mr-2 h-5 w-5" />
              프리셋 선택
            </DialogTitle>
            <DialogDescription>미리 정의된 치환 항목 세트를 선택하여 적용합니다.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 my-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="프리셋 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={onCreatePreset}>
              <Plus className="mr-2 h-4 w-4" />새 프리셋
            </Button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* 카테고리 사이드바 */}
            {/* <div className="w-1/4 border-r pr-4">
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
            </div> */}

            {/* 프리셋 목록 */}
            <div className="flex-1 pl-4">
              <ScrollArea className="h-[50vh]">
                {filteredPresets.length > 0 ? (
                  <div className="space-y-3">
                    {filteredPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="border rounded-md p-3 hover:border-blue-300 cursor-pointer transition-colors"
                        onClick={() => onSelectPreset(preset)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{preset.name}</h4>
                            <p className="text-sm text-gray-500">{preset.description}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* <span className="text-xs px-2 py-1 bg-gray-100 rounded-full dark:bg-gray-800">
                              {preset.category}
                            </span> */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleEditClick(e, preset)}
                              title="프리셋 수정"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={(e) => handleDeleteClick(e, preset.id)}
                              title="프리셋 삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">포함 항목:</span>{" "}
                          {preset.items
                            .slice(0, 3)
                            .map((item) => item.key)
                            .join(", ")}
                          {preset.items.length > 3 && ` 외 ${preset.items.length - 3}개`}
                        </div>
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
                      <>
                        <ListFilter className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>프리셋이 없습니다</p>
                        <Button variant="link" onClick={onCreatePreset}>
                          새 프리셋 만들기
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={presetToDelete !== null} onOpenChange={() => setPresetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              프리셋 삭제
            </AlertDialogTitle>
            <AlertDialogDescription>이 프리셋을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}