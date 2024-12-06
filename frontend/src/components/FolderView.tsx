import { useFileStore } from "@/stores/fileStore";
import { useEffect, useState } from "react";
import { services } from "wailsjs/go/models";
import { ReadFolderAndDocument } from "../../wailsjs/go/services/DocumentService";
import { LogPrint } from "../../wailsjs/runtime/runtime";
import FileTree from "./FileTree";
import { ScrollArea } from "./ui/scroll-area";

export default function FolderView() {
    const [files, setFiles] = useState<services.FileNode>();

    const { selectedFiles } = useFileStore();

    useEffect(() => {

        // ReadFolderAndDocument("C:/Users/axis1/OneDrive/바탕 화면/docs/monthly-docs-react/test_template")
        ReadFolderAndDocument("C:/Users/SAMSUNG/Desktop/document_job/거래처")
            .then(folders => {
                setFiles(folders)
                // LogPrint(`${JSON.stringify(folders)}`)
            })
            .catch(err => LogPrint(`custom err : ${err}`))

    }, []);

    return (
        <ScrollArea className="h-screen w-full rounded-md border p-4">
            {files && (
                <FileTree node={files} />
            )}
            Selected Files: {Array.from(selectedFiles).join(', ')}
        </ScrollArea>
    )
}