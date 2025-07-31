import { create } from 'zustand'
import { GetFolderTree, SelectDirectory } from '../../wailsjs/go/document/Document'
import { document } from '../../wailsjs/go/models'

// 파일 시스템 아이템 타입
// export interface FileSystemItem {
//   id: string
//   name: string
//   fileType: 'file' | 'folder'
//   children?: FileSystemItem[]
//   path: string
//   size?: string
//   modified?: string
//   isTemplate?: boolean
// }


// 파일 스토어 상태 타입
interface FileStoreState {
  // 상태
  fileSystem: document.FileSystemItem[]
  folderPath: string
  error: string | null
  
  // 액션
  selectDirectory: () => Promise<void>
  loadFolderTree: (path: string) => Promise<void>
  setFolderTree: (item: document.FileSystemItem[]) => void
  setCurrentPath: (path: string) => void

}

export const useFileStore = create<FileStoreState>((set, get) => ({
  // 초기 상태
  fileSystem: [],
  folderPath: '',
  isLoading: false,
  error: null,


  // 폴더 선택
  selectDirectory: async () => {
    try {
    //   set({ isLoading: true, error: null })
      const path = await SelectDirectory()
      if (path) {
        await get().loadFolderTree(path)
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '폴더 선택 중 오류가 발생했습니다.' })
    } finally {
    //   set({ isLoading: false })
    }
  },

  // 폴더 트리 로드
  loadFolderTree: async (path: string) => {
    try {
    //   set({ isLoading: true, error: null })
      const items = await GetFolderTree(path)
      // const items = backendItems.map(convertBackendItem)
      set({ 
        fileSystem: items, 
        folderPath: path,
        // selectedItems: new Set(),
        // expandedItems: new Set()
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '폴더 트리 로드 중 오류가 발생했습니다.' })
    } finally {
    //   set({ isLoading: false })
    }
  },
  setFolderTree: (item: document.FileSystemItem[]) => {
    set({ fileSystem: item })
  },
  setCurrentPath: (path: string) => {
    set({ folderPath: path })
  },
}))