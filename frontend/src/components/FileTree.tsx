import { useFileStore } from "@/stores/fileStore"
import { Checkbox } from "./ui/checkbox"
import { useState } from "react"
import { services } from "wailsjs/go/models"
// import { handleOpenFile, handleShowInExplorer } from "@/utils/util"
// import { OpenFile, ShowInExplorer } from "../../wailsjs/go/services/DocumentService"

interface FileTreeProps {
    node: services.FileNode
}


export default function FileTree({ node }: FileTreeProps) {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const { selectedFiles, selectFile } = useFileStore();

    const isSelected = selectedFiles.has(node.path);

    const handleCheckboxChange = (chekced: boolean) => {
        selectFile(node, chekced);
    }

    // const handleDoubleClick = async () => {
    //     if (node.isDir) {
    //       await ShowInExplorer(node.path);
    //     } else {
    //       await OpenFile(node.path);
    //     }
    //   };


    return (
        <div>
            <div className="flex items-center">
                {/* {!node.isDir && <Checkbox
                    checked={isSelected}
                    onCheckedChange={handleCheckboxChange}
                    className="mr-2"
                />} */}
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={handleCheckboxChange}
                    className="mr-2"
                />
                <div onClick={() => node.isDir && setIsOpen(!isOpen)}>
                    {node.isDir ? '📁' : '📄'} {node.name}
                </div>
            </div>
            {isOpen && node.children && (
                <div style={{ marginLeft: '20px' }} >
                    {node.children.map((child) => (
                        <FileTree key={child.path} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
}