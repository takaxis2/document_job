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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Trash2 } from "lucide-react"

import type { UIPresetItem, UIPresetModel } from "../stores/presetStore"

// 프리셋 생성/수정 모달 컴포넌트
interface PresetManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (preset: UIPresetModel) => void
  editingPreset: UIPresetModel | null
  // existingCategories: string[]
}

export default function PresetManagementModal({
  isOpen,
  onClose,
  onSave,
  editingPreset,
  // existingCategories,
}: PresetManagementModalProps) {
  // 프리셋 상태
  const [preset, setPreset] = useState<UIPresetModel>(
    editingPreset || {
      id: 1, // 임시로 해놓음
      name: "",
      description: "",
      // category: existingCategories[0] || "회사 정보",
      items: [],
    },
  )

  // 새 카테고리 입력 상태
  // const [newCategory, setNewCategory] = useState("")
  // const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof UIPresetModel, value: string) => {
    setPreset((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 카테고리 변경 핸들러
  // const handleCategoryChange = (value: string) => {
  //   if (value === "new") {
  //     setShowNewCategoryInput(true)
  //   } else {
  //     setShowNewCategoryInput(false)
  //     handleInputChange("category", value)
  //   }
  // }

  // 새 카테고리 적용 핸들러
  // const applyNewCategory = () => {
  //   if (newCategory.trim()) {
  //     handleInputChange("category", newCategory.trim())
  //     setShowNewCategoryInput(false)
  //     setNewCategory("")
  //   }
  // }

  // 치환 항목 변경 핸들러
  const handleItemChange = (index: number, field: keyof UIPresetItem, value: string) => {
    const newItems = [...preset.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }
    setPreset((prev) => ({
      ...prev,
      items: newItems,
    }))
  }

  // 치환 항목 추가 핸들러
  const handleAddItem = () => {
    // 치환항목(presetItem) 추가 로직 필요
    // 임시로 암거나 집어 넣음
    setPreset((prev) => ({
      ...prev,
      items: [...prev.items, { key: "", value: "", id:9999, preset_id:8888, description:"temp" }],
    }))
  }

  // 치환 항목 삭제 핸들러
  const handleRemoveItem = (index: number) => {
    const newItems = [...preset.items]
    newItems.splice(index, 1)
    setPreset((prev) =>({
      ...prev,
      items: newItems,
    }))
  }

  // 저장 핸들러
  const handleSave = () => {
    // 필수 필드 검증
    if (!preset.name.trim()) {
      alert("프리셋 이름을 입력해주세요.")
      return
    }

    // if (!preset.category.trim()) {
    //   alert("카테고리를 선택해주세요.")
    //   return
    // }

    // 빈 항목 제거
    const filteredItems = preset.items.filter((item) => item.key.trim() !== "")

    if (filteredItems.length === 0) {
      alert("최소 하나 이상의 치환 항목을 추가해주세요.")
      return
    }

    // 저장
    onSave(({
      ...preset,
      items: filteredItems,
    }))
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingPreset ? "프리셋 수정" : "새 프리셋 만들기"}</DialogTitle>
          <DialogDescription>
            {editingPreset
              ? "프리셋 정보를 수정하고 저장하세요."
              : "자주 사용하는 치환 항목 세트를 프리셋으로 저장하세요."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <div className="space-y-4">
            {/* 프리셋 기본 정보 */}
            <div className="space-y-2">
              <Label htmlFor="preset-name">프리셋 이름</Label>
              <Input
                id="preset-name"
                value={preset.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="프리셋 이름을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preset-description">설명</Label>
              <Textarea
                id="preset-description"
                value={preset.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="프리셋에 대한 설명을 입력하세요"
                rows={2}
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="preset-category">카테고리</Label>
              {!showNewCategoryInput ? (
                <Select value={preset.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="preset-category">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">+ 새 카테고리</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="새 카테고리 이름"
                    className="flex-1"
                  />
                  <Button onClick={applyNewCategory} disabled={!newCategory.trim()}>
                    적용
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewCategoryInput(false)}>
                    취소
                  </Button>
                </div>
              )}
            </div> */}

            {/* 치환 항목 목록 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>치환 항목</Label>
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  항목 추가
                </Button>
              </div>

              {preset.items.length === 0 ? (
                <div className="text-center py-4 text-gray-500 border rounded-md">치환 항목을 추가해주세요</div>
              ) : (
                <div className="space-y-3">
                  {preset.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={item.key}
                        onChange={(e) => handleItemChange(index, "key", e.target.value)}
                        placeholder="찾을 문자열"
                        className="flex-1"
                      />
                      <span className="text-gray-500">→</span>
                      <Input
                        value={item.value}
                        onChange={(e) => handleItemChange(index, "value", e.target.value)}
                        placeholder="변경할 문자열"
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {editingPreset ? "수정 완료" : "프리셋 저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
