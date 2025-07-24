import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import DocumentTree from "../components/document-tree"

export default function DocumentsPage() {
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
              <Input placeholder="예: C:/Documents" defaultValue="/documents" />
              <Button className="w-full">경로 불러오기</Button>
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
