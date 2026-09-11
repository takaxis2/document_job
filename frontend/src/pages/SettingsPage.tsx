import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useToast } from "../hooks/use-toast"
import { Save, Folder, HardDrive, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useFileStore } from "@/stores/fileStore"

export default function SettingsPage() {
  const { toast } = useToast()
  const { folderPath, setCurrentPath } = useFileStore()
  const [activeTab, setActiveTab] = useState<"paths" | "system">("paths")
  const [inputPath, setInputPath] = useState(folderPath || "/documents/templates")
  const [outputPath, setOutputPath] = useState("/documents/outputs")
  const [autoBackup, setAutoBackup] = useState(true)

  useEffect(() => {
    if (folderPath) {
      setInputPath(folderPath)
    }
  }, [folderPath])

  const handleSave = () => {
    setCurrentPath(inputPath)
    localStorage.setItem("doc_job_default_input_path", inputPath)
    localStorage.setItem("doc_job_default_output_path", outputPath)
    toast({
      title: "설정 저장 완료",
      description: "기본 폴더 경로 및 환경 설정이 저장되었습니다.",
    })
  }

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Desktop Header */}
      <div className="flex justify-between items-center pb-2.5 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">환경설정</h1>
          <p className="text-xs text-muted-foreground mt-0.5">애플리케이션 작업 경로 및 시스템 기본값을 관리합니다.</p>
        </div>
      </div>

      {/* Segmented Desktop Tabs */}
      <div className="inline-flex p-0.5 rounded-md bg-muted/60 border border-border text-xs">
        <button
          className={`px-3 py-1 rounded font-medium transition-colors ${
            activeTab === "paths"
              ? "bg-background text-foreground shadow-xs border border-border/80 font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("paths")}
        >
          경로 및 파일 설정
        </button>
        <button
          className={`px-3 py-1 rounded font-medium transition-colors ${
            activeTab === "system"
              ? "bg-background text-foreground shadow-xs border border-border/80 font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("system")}
        >
          시스템 및 저장소 정보
        </button>
      </div>

      {/* Tab 1: Paths & Files */}
      {activeTab === "paths" && (
        <Card className="rounded-md border border-border bg-card shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              문서 경로 설정
            </CardTitle>
            <CardDescription className="text-xs">
              문서 서식 로드 및 치환 결과물 저장 시 기본으로 사용되는 로컬 작업 디렉토리입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="input-path" className="text-xs font-medium">
                기본 서식/템플릿 폴더 경로
              </Label>
              <Input
                id="input-path"
                value={inputPath}
                onChange={(e) => setInputPath(e.target.value)}
                placeholder="/documents/templates"
                className="h-8 text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                문서 서식 트리 탐색 시 최초로 로드되는 디렉토리입니다.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="output-path" className="text-xs font-medium">
                변환 결과물 기본 저장 위치
              </Label>
              <Input
                id="output-path"
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                placeholder="/documents/outputs"
                className="h-8 text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                서식 변수 치환 작업 완료 후 생성된 문서가 보관되는 경로입니다.
              </p>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoBackup"
                checked={autoBackup}
                onChange={(e) => setAutoBackup(e.target.checked)}
                className="rounded border-border h-4 w-4 text-primary focus:ring-ring"
              />
              <label htmlFor="autoBackup" className="text-xs text-foreground select-none cursor-pointer">
                치환 작업 전 원본 파일 임시 백업 보관 활성화
              </label>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button size="sm" className="h-8 text-xs" onClick={handleSave}>
                <Save className="mr-1.5 h-3.5 w-3.5" /> 설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: System Info */}
      {activeTab === "system" && (
        <Card className="rounded-md border border-border bg-card shadow-none">
          <CardHeader className="p-4 pb-2 border-b border-border/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              시스템 환경 진단
            </CardTitle>
            <CardDescription className="text-xs">
              현재 실행 환경 및 로컬 브릿지 연동 상태입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded bg-muted/40 border border-border space-y-1">
                <span className="text-muted-foreground">런타임 엔진</span>
                <p className="font-semibold text-foreground">Vite + React 19 (Wails Web Bridge)</p>
              </div>
              <div className="p-2.5 rounded bg-muted/40 border border-border space-y-1">
                <span className="text-muted-foreground">데이터 스토리지</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  브라우저 로컬 DB 동기화 (Persistent)
                </p>
              </div>
              <div className="p-2.5 rounded bg-muted/40 border border-border space-y-1">
                <span className="text-muted-foreground">문서 인코딩</span>
                <p className="font-semibold text-foreground">UTF-8 / EUC-KR 호환 파서</p>
              </div>
              <div className="p-2.5 rounded bg-muted/40 border border-border space-y-1">
                <span className="text-muted-foreground">보안 및 정책</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  로컬 파일시스템 격리 모드
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
