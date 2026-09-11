import { useFileStore } from "@/stores/fileStore"
import { usePartnerStore } from "@/stores/partnerStore"
import { FolderGit2, HardDrive, CheckCircle2, ShieldCheck } from "lucide-react"

export default function StatusBar() {
  const { folderPath } = useFileStore()
  const { partners } = usePartnerStore()

  return (
    <footer className="h-7 px-3 border-t border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center justify-between select-none shrink-0">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-foreground font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>준비 완료</span>
        </div>

        <span className="text-border">|</span>

        <div className="flex items-center space-x-1.5 truncate max-w-xs sm:max-w-md">
          <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">작업 폴더: {folderPath || "미지정 (/documents/templates)"}</span>
        </div>

        <span className="text-border">|</span>

        <div className="hidden sm:flex items-center space-x-1">
          <span>등록 거래처:</span>
          <span className="font-semibold text-foreground">{partners.length}개소</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-1 text-muted-foreground">
          <HardDrive className="h-3.5 w-3.5" />
          <span>로컬 DB 스토리지 동기화</span>
        </div>
        <span className="hidden md:inline text-border">|</span>
        <div className="flex items-center space-x-1 text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>데스크탑 v1.0</span>
        </div>
      </div>
    </footer>
  )
}
