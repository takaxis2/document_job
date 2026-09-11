import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import DocumentTree from "../components/document-tree"
import FolderPathModal from "@/components/folder-path-modal"
import { useFileStore } from "@/stores/fileStore"
import { GetFolderTree } from "../../wailsjs/go/document/Document"
import { Folder, RefreshCw, FolderInput } from "lucide-react"

export default function DocumentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { setFolderTree, setCurrentPath, folderPath } = useFileStore()

  const handleSavePath = useCallback(async (path: string) => {
    setCurrentPath(path)
    setIsModalOpen(false)
    const folderTree = await GetFolderTree(path)
    setFolderTree(folderTree)
  }, [setCurrentPath, setFolderTree])

  useEffect(() => {
    const savedPath = localStorage.getItem("doc_job_default_input_path")
    if (savedPath && !folderPath) {
      handleSavePath(savedPath)
    } else if (!folderPath) {
      // In browser mock mode, use /documents/templates default.
      // In desktop Wails native mode, open modal if no path is set.
      const isNative = (window as any).runtime && (window as any).go?.main?.App
      if (!isNative) {
        handleSavePath("/documents/templates")
      } else {
        setIsModalOpen(true)
      }
    }
  }, [folderPath, handleSavePath])

  const handleRefresh = async () => {
    if (folderPath) {
      const folderTree = await GetFolderTree(folderPath)
      setFolderTree(folderTree)
    }
  }

  return (
    <div className="space-y-3">
      {/* Desktop Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-border gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">문서 템플릿 관리</h1>
          <p className="text-xs text-muted-foreground">문서 서식 트리를 탐색하고 거래처 정보 변수를 자동 치환합니다.</p>
        </div>

        <div className="flex items-center space-x-2">
          {folderPath && (
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-muted border border-border/80 text-xs font-mono text-muted-foreground">
              <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate max-w-xs">{folderPath}</span>
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            새로고침
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            className="h-8 text-xs border border-border"
            onClick={() => setIsModalOpen(true)}
          >
            <FolderInput className="mr-1.5 h-3.5 w-3.5" />
            폴더 경로 변경
          </Button>
        </div>
      </div>

      {/* Main Document Workspace */}
      <Card className="rounded-md border border-border bg-card shadow-none overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <DocumentTree />
        </CardContent>
      </Card>

      <FolderPathModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSavePath={handleSavePath}
        initialPath={folderPath || ""}
      />
    </div>
  )
}
