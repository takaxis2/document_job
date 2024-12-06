import CCheckbox from "@/components/CCheckbox"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { ProcessFiles, ProcessWordDocument } from "../../wailsjs/go/services/DocumentService"
import { LogPrint } from "../../wailsjs/runtime/runtime"
import { Button } from "@/components/ui/button"
import { services } from "wailsjs/go/models"
import FileTree from "@/components/FileTree"
import { useFileStore } from "@/stores/fileStore"
import { Textarea } from "@/components/ui/textarea"
import FolderView from "@/components/FolderView"
import { Input } from "@/components/ui/input"
import { ReplyAll } from "lucide-react"




export default function Document() {

    const [templatePath, setTemplatePath] = useState('');
    const [newFilePath, setNewFilePath] = useState('C:/Users/SAMSUNG/Desktop/document_job/destination');
    const [replacements, setReplacements] = useState({
        "WORK_YEAR" : "2024",
        "WORK_MONTH": "12",
        "WORK_DATE": "18",
        "END_YEAR" : "2055",
        "END_MONTH" : "29",
        "END_DATE": "223",
        "BILLING_YEAR" : "2024",
        "BILLING_MONTH" :"12",
        "BILLING_DATE" : "20",
        "CHECK_YEAR" : "2024",
        "CHECK_MONTH" : "12",
        "CHECK_DATE" : "18"
    });

    const { selectedFiles } = useFileStore();

    const handleProcessTemplate = async()=>{
        // const result =await ProcessWordDocument(templatePath, newFilePath, replacements);
        // LogPrint(`파일리스트 : ${Array.from(selectedFiles)}`)
        // LogPrint("파일경로" + newFilePath)
        // LogPrint(`변환구 : ${JSON.stringify(replacements)}`)
        const result = await ProcessFiles(Array.from(selectedFiles), newFilePath, replacements)
        // LogPrint(`${result}`);
    }

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel className="h-full">
                <FolderView />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel>
                작업 설정
                <div className="m-5">
                    <Textarea placeholder="replacements in json" value={JSON.stringify(replacements)} className="h-[120px]" onChange={e=>{
                        setReplacements(JSON.parse(e.target.value))
                        LogPrint(`${JSON.stringify(replacements)}`)
                        }}/>
                    <Input placeholder="destination" value={newFilePath} className="m-1" onChange={e=>setNewFilePath(e.target.value)}/>
                    <Button onClick={handleProcessTemplate}>test</Button>
                </div>
                
            </ResizablePanel>

        </ResizablePanelGroup>
    )
}