// src/store/fileStore.ts
import { create } from 'zustand';
import { services } from "wailsjs/go/models"


interface FileStore {
  selectedFiles: Set<string>;
  selectFile: (node: services.FileNode, isChecked: boolean) => void;
  // selectFolder:(folder: services.FileNode) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  selectedFiles: new Set<string>(),

  selectFile: (node: services.FileNode, isChecked: boolean) => 
    set((state) => {
      const newSelectedFiles = new Set(state.selectedFiles);

      const toggleSelection = (n: services.FileNode) =>{
        if (isChecked) {
          newSelectedFiles.add(n.path);
        } else {
          newSelectedFiles.delete(n.path);
        }
        n.children?.forEach(toggleSelection);
      }

      toggleSelection(node);
      
      return { selectedFiles: newSelectedFiles };
    }),

    // selectFolder:
}));