import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import DocumentTree from "../components/document-tree"
import { SelectDirectory } from "../../wailsjs/go/document/Document"

export default function DocumentsPage() {
  const [folderPath, setFolderPath] = useState("");

  const handleSelectDirectory = async () => {
    try {
      const selectedPath = await SelectDirectory();
      if (selectedPath) {
        setFolderPath(selectedPath);
      }
    } catch (error) {
      console.error("폴더 선택 중 오류 발생:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">문서 관리</h1>
        <p className="text-muted-foreground">문서를 관리하고 템플릿 변수를 치환하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 폴더 경로 입력 및 설정 */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>폴더 경로</CardTitle>
            <CardDescription>문서를 표시할 폴더 경로를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" onClick={handleSelectDirectory}>
                폴더 선택
              </Button>
              {folderPath && (
                <p className="text-sm text-muted-foreground">
                  선택된 경로: {folderPath}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 폴더 트리 및 파일 목록 */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>문서 트리</CardTitle>
            <CardDescription>폴더 구조와 문서 목록</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentTree />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
