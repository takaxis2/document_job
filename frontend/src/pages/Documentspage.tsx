import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import DocumentTree from "../components/document-tree"
// import { useToast } from "@/hooks/use-toast"
import FolderPathModal from "@/components/folder-path-modal"
import { useFileStore } from "@/stores/fileStore"
import { GetFolderTree } from "../../wailsjs/go/document/Document"
import { LogPrint } from "../../wailsjs/runtime/runtime"

export default function DocumentsPage() {
  // const [folderPath, setFolderPath] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { setFolderTree, setCurrentPath, folderPath } = useFileStore()
  // const { toast } = useToast()

  useEffect(() => {
    
    if (folderPath) {
      // setFolderPath(currentPath)
    } else {
      setIsModalOpen(true) // 경로가 없으면 모달 열기
    }
  }, [])

  const handleSavePath = async (path: string) => {
    // setFolderPath(path)
    setCurrentPath(path)
    setIsModalOpen(false)

    // 이 시점에 폴더트리 탐색을 시작해야 한다.
    const folderTree = await GetFolderTree(path)
    LogPrint("폴더 트리 로드 완료: " + JSON.stringify(folderTree, null, 2))
    setFolderTree(folderTree)
    
  }

  const handleChangeFolder = () => {
    setIsModalOpen(true)
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">문서 관리</h1>
        <p className="text-muted-foreground">문서를 관리하고 템플릿 변수를 치환하세요.</p>
      </div>

      {folderPath ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 폴더 트리 및 파일 목록 */}
          <Card className="md:col-span-4">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>문서 트리</CardTitle>
                  <CardDescription>{folderPath}</CardDescription>
                </div>
                <Button className="" onClick={handleChangeFolder}>
                  폴더 변경
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DocumentTree />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="w-full max-w-md mx-auto text-center py-8">
          <CardHeader>
            <CardTitle>폴더 경로가 설정되지 않았습니다</CardTitle>
            <CardDescription>문서 트리를 보려면 폴더 경로를 설정해야 합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>폴더 경로 설정</Button>
          </CardContent>
        </Card>
      )}

      
      <FolderPathModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // Allow closing
        onSavePath={handleSavePath}
        initialPath={folderPath || ""}
      />

    </div>
  )
}
