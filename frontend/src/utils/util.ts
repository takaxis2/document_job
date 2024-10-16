import { OpenFile, ShowInExplorer } from '../../wailsjs/go/services/DocumentService'

// 파일 열기
export const handleOpenFile = async (filePath: string) => {
  try {
    await OpenFile(filePath)
  } catch (error) {
    console.error('Failed to open file:', error)
  }
}

// 탐색기에서 보기
export const handleShowInExplorer = async (filePath:string) => {
  try {
    await ShowInExplorer(filePath)
  } catch (error) {
    console.error('Failed to show in explorer:', error)
  }
}