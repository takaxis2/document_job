package document

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func selectDirectory(ctx context.Context) (string, error) {
	result, err := runtime.OpenDirectoryDialog(ctx, runtime.OpenDialogOptions{
		Title: "폴더 선택",
	})
	if err != nil {
		return "", err
	}
	return result, nil
}

// 폴더 트리를 가져오는 함수
func getFolderTree(path string) ([]FileSystemItem, error) {
	var items []FileSystemItem

	// 경로가 존재하는지 확인
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return nil, fmt.Errorf("경로가 존재하지 않습니다: %s", path)
	}

	// 폴더를 재귀적으로 탐색
	err := filepath.Walk(path, func(filePath string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// 루트 경로는 건너뛰기
		if filePath == path {
			return nil
		}

		// 상대 경로 계산
		relPath, err := filepath.Rel(path, filePath)
		if err != nil {
			return err
		}

		// 숨김 파일/폴더 건너뛰기
		if strings.HasPrefix(filepath.Base(filePath), ".") {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		// 파일 크기 포맷팅
		// var sizeStr string
		// if !info.IsDir() {
		// 	size := info.Size()
		// 	if size < 1024 {
		// 		sizeStr = fmt.Sprintf("%d B", size)
		// 	} else if size < 1024*1024 {
		// 		sizeStr = fmt.Sprintf("%.1f KB", float64(size)/1024)
		// 	} else {
		// 		sizeStr = fmt.Sprintf("%.1f MB", float64(size)/(1024*1024))
		// 	}
		// }

		// 수정 시간 포맷팅
		// modifiedStr := info.ModTime().Format("2006-01-02 15:04")

		// 템플릿 파일 여부 확인 (파일명에 "템플릿" 또는 "template" 포함)
		// isTemplate := false
		// if !info.IsDir() {
		// 	fileName := strings.ToLower(info.Name())
		// 	isTemplate = strings.Contains(fileName, "템플릿") ||
		// 		strings.Contains(fileName, "template") ||
		// 		strings.Contains(fileName, "tpl")
		// }

		item := FileSystemItem{
			Id:       generateId(filePath),
			Name:     info.Name(),
			FileType: getItemType(info),
			Path:     filePath,
			// Size:       sizeStr,
			// Modified:   modifiedStr,
			// IsTemplate: isTemplate,
		}

		// 폴더인 경우에만 children 추가
		if info.IsDir() {
			item.Children = []FileSystemItem{}
		}

		// 트리 구조에 추가
		addItemToTree(&items, item, relPath)

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("폴더 탐색 중 오류 발생: %v", err)
	}

	return items, nil
}

// 아이템 타입 결정
func getItemType(info os.FileInfo) string {
	if info.IsDir() {
		return "folder"
	}
	return "file"
}

// 고유 ID 생성
func generateId(path string) string {
	// 경로를 기반으로 한 간단한 해시 생성
	hash := 0
	for _, char := range path {
		hash = ((hash << 5) - hash) + int(char)
		hash = hash & hash // 32비트 정수로 변환
	}
	return fmt.Sprintf("%d", hash)
}

// 트리 구조에 아이템 추가
func addItemToTree(items *[]FileSystemItem, item FileSystemItem, relPath string) {
	pathParts := strings.Split(relPath, string(os.PathSeparator))

	if len(pathParts) == 1 {
		// 최상위 레벨 아이템
		*items = append(*items, item)
		return
	}

	// 부모 폴더 찾기
	parentName := pathParts[0]
	for i := range *items {
		if (*items)[i].Name == parentName && (*items)[i].FileType == "folder" {
			// 재귀적으로 하위 경로에 추가
			subPath := strings.Join(pathParts[1:], string(os.PathSeparator))
			addItemToTree(&(*items)[i].Children, item, subPath)
			return
		}
	}
}
