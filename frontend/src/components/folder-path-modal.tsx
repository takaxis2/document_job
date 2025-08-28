"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Terminal } from "lucide-react"
import { useToast } from "../hooks/use-toast"
import { SelectDirectory } from "../../wailsjs/go/document/Document"
import { useFileStore } from "../stores/fileStore"


interface FolderPathModalProps {
  isOpen: boolean
  onClose: () => void
  onSavePath: (path: string) => void
  initialPath?: string
}

export default function FolderPathModal({ isOpen, onClose, onSavePath, initialPath = "" }: FolderPathModalProps) {
  const {folderPath, setCurrentPath} = useFileStore()
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setCurrentPath(initialPath)
      setError(null)
    }
  }, [isOpen, initialPath])

  
  const handleSelectDirectory = async () => {
    try {
      const selectedPath = await SelectDirectory();
      if (selectedPath) {
        setCurrentPath(selectedPath);
      }
    } catch (error) {
      console.error("폴더 선택 중 오류 발생:", error);
    }
  };

  const handleSave = () => {
    if (!folderPath.trim()) {
      setError("폴더 경로를 입력해주세요.")
      toast({
        title: "경로 설정 실패",
        description: "폴더 경로를 입력해주세요.",
        variant: "destructive",
      })
      return
    }
    if (folderPath.trim().length < 3) {
      setError("폴더 경로는 최소 3자 이상이어야 합니다.")
      toast({
        title: "경로 설정 실패",
        description: "폴더 경로는 최소 3자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }
    onSavePath(folderPath.trim())
    setError(null)
    toast({
      title: "경로 설정 완료",
      description: `폴더 경로가 '${folderPath.trim()}'(으)로 설정되었습니다.`,
    })
  }

  const handleExampleClick = (examplePath: string) => {
    setCurrentPath(examplePath)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {" "}
      {/* onOpenChange를 항상 onClose로 설정 */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>문서 폴더 경로 설정</DialogTitle>
          <DialogDescription>문서를 관리할 기본 폴더 경로를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folderPath" className="text-right">
              폴더 경로
            </Label>
            <Input
              id="folderPath"
              value={folderPath}
              onChange={(e) => setCurrentPath(e.target.value)}
              onKeyDown={handleKeyDown}
              className="col-span-3"
              placeholder="/public/sample-files/contracts"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="text-sm text-muted-foreground mt-2">
            <p className="mb-1">예시 경로:</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExampleClick("/documents")} className="text-xs">
                /documents
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick("/public/sample-files")}
                className="text-xs"
              >
                /public/sample-files
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick("C:/Users/MyDocs")}
                className="text-xs"
              >
                C:/Users/MyDocs
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSelectDirectory}>
            경로 설정
          </Button>
          <Button type="button" onClick={handleSave}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
