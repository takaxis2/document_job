import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useToast } from "../hooks/use-toast"
import { Save } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("variables")
  const [defaultInputPath, setDefaultInputPath] = useState("")
  const [defaultOutputPath, setDefaultOutputPath] = useState("")
  
  // 실제 구현 시 아래 함수들을 통해 Wails App에서 값을 가져옴
  useEffect(() => {
    // 임시 초기값
    setDefaultInputPath("C:\\Documents\\Input")
    setDefaultOutputPath("C:\\Documents\\Output")
  }, [])

  const handleSaveVariables = () => {
    // 실제 구현 시 Wails UpdateSetting 호출
    console.log("Saving variables:", { defaultInputPath, defaultOutputPath })
    toast({
      title: "설정 저장됨",
      description: "변수 관리 설정이 성공적으로 저장되었습니다.",
    })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground">시스템 환경 및 애플리케이션 설정을 관리합니다.</p>
      </div>

      <div className="flex border-b">
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "variables" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
          onClick={() => setActiveTab("variables")}
        >
          변수 관리
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "general" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
          onClick={() => setActiveTab("general")}
        >
          일반 설정
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "variables" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>경로 변수 설정</CardTitle>
                <CardDescription>
                  시스템 전반에서 사용되는 기본 폴더 경로 및 변환 결과물 경로를 설정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input-path">기본 템플릿/입력 폴더 경로</Label>
                  <Input 
                    id="input-path"
                    value={defaultInputPath}
                    onChange={(e) => setDefaultInputPath(e.target.value)}
                    placeholder="예: C:\Users\Username\Documents\Templates"
                  />
                  <p className="text-sm text-muted-foreground">문서를 불러올 때 기본적으로 열리는 디렉토리 경로입니다.</p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="output-path">파일 변환 결과물 기본 저장 경로</Label>
                  <Input 
                    id="output-path"
                    value={defaultOutputPath}
                    onChange={(e) => setDefaultOutputPath(e.target.value)}
                    placeholder="예: C:\Users\Username\Documents\Outputs"
                  />
                  <p className="text-sm text-muted-foreground">변환된 문서 파일이 자동으로 저장될 기본 위치입니다.</p>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveVariables}>
                    <Save className="mr-2 h-4 w-4" /> 설정 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "general" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>일반 설정</CardTitle>
                <CardDescription>
                  애플리케이션의 일반적인 동작 방식을 설정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">추후 구현될 일반 설정 항목들이 여기에 표시됩니다.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
