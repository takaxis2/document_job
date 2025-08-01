package document

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/lukasjarosch/go-docx"
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
func getFolderTree(ctx context.Context, path string) ([]FileSystemItem, error) {
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
		runtime.LogPrint(ctx, "폴더 탐색 중 오류 발생: "+err.Error())
		return nil, fmt.Errorf("폴더 탐색 중 오류 발생: %v", err)
	}

	runtime.LogPrint(ctx, fmt.Sprintf("폴더 트리 로드 완료, %d개 아이템", len(items)))
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

	// 공통 상위위 폴더 찾기
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

// 문자열 치환
// 1. 상대경로 파악
// 2. 결과물 저장 경로
// 3. 필요한 폴더 생성
// 4. 파일 생성
func processSelectedFiles(filePaths []string, destination string, replacements map[string]string) (int, error) {
	if len(filePaths) == 0 {
		return 0, fmt.Errorf("처리할 파일이 없습니다")
	}

	// 공통 상위 폴더 찾기
	commonPath := findCommonPrefix(filePaths)
	if commonPath == "" {
		return 0, fmt.Errorf("공통 경로를 찾을 수 없습니다")
	}

	// 각 파일 처리
	for _, filePath := range filePaths {
		// 상대경로 계산
		relPath, err := filepath.Rel(commonPath, filePath)
		if err != nil {
			return 0, fmt.Errorf("상대 경로 계산 오류 (%s): %v", filePath, err)
		}

		// 결과물 저장 경로
		dstPath := filepath.Join(destination, relPath)

		// 필요한 폴더 생성
		dstDir := filepath.Dir(dstPath)
		if err := os.MkdirAll(dstDir, 0755); err != nil {
			return 0, fmt.Errorf("폴더 생성 오류 (%s): %v", dstDir, err)
		}

		// 파일 처리 / 생성

	}

	return 1, nil
}

// 공통 접두사 찾기
// 선택한 파일이 서로 다른 폴더에 있을 경우우
func findCommonPrefix(paths []string) string {
	if len(paths) == 0 {
		return ""
	}
	if len(paths) == 1 {
		return filepath.Dir(paths[0])
	}

	parts := strings.Split(filepath.ToSlash(filepath.Dir(paths[0])), "/")
	for i := 1; i < len(paths); i++ {
		otherParts := strings.Split(filepath.ToSlash(filepath.Dir(paths[i])), "/")
		j := 0
		for j < len(parts) && j < len(otherParts) && parts[j] == otherParts[j] {
			j++
		}
		parts = parts[:j]
	}

	return filepath.FromSlash(strings.Join(parts, "/"))
}

// 파일 처리
func processFile(filePath string, newPath string, replacements map[string]string) error {
	ext := strings.ToLower(filepath.Ext(filePath))

	switch ext {
	case ".doc":
	case ".docx":
		return processWordFile(filePath, newPath, replacements)
	case ".xlsx":
		return processExcelFile(filePath, newPath, replacements)
	default:
	}
	return nil
}

func processWordFile(filePath string, newPath string, replacements map[string]string) error {

	docx.Open(filePath)

	return nil
}

func processExcelFile(filePath string, newPath string, replacements map[string]string) error {
	return nil
}

// func createFolder(path, commonAncestor, destinationPath string) (string, error) {
// 	relPath, err := filepath.Rel(commonAncestor, path)
// 	if err != nil {
// 		return "", fmt.Errorf("상대 경로 계산 오류 (%s): %v", path, err)
// 	}

// 	newPath := filepath.Join(destinationPath, relPath)

// 	fileInfo, err := os.Stat(path)
// 	if err != nil {
// 		return "", fmt.Errorf("파일 정보 읽기 오류 (%s): %v", path, err)
// 	}

// 	if fileInfo.IsDir() {
// 		// 디렉토리 생성
// 		err = os.MkdirAll(newPath, os.ModePerm)
// 		if err != nil && !os.IsExist(err) {
// 			return "", fmt.Errorf("디렉토리 생성 오류 (%s): %v", newPath, err)
// 		}

// 		// 디렉토리 내용 처리
// 		files, err := os.ReadDir(path)
// 		if err != nil {
// 			return "", fmt.Errorf("디렉토리 읽기 오류 (%s): %v", path, err)
// 		}

// 		for _, file := range files {
// 			count, err := createFolder(filepath.Join(path, file.Name()), commonAncestor, destinationPath)
// 			if err != nil {
// 				fmt.Printf("파일 처리 중 오류 발생 (%s): %v\n", file.Name(), err)
// 				continue // 오류가 발생해도 계속 진행
// 			}

// 		}
// 		return processedCount, nil
// 	}

// 	// 파일 처리
// 	// 파일을 위한 디렉토리 생성
// 	err = os.MkdirAll(filepath.Dir(newPath), os.ModePerm)
// 	if err != nil && !os.IsExist(err) {
// 		return 0, fmt.Errorf("디렉토리 생성 오류 (%s): %v", filepath.Dir(newPath), err)
// 	}

// 	err = ds.processFile(path, newPath, replacements)
// 	if err != nil {
// 		return 0, fmt.Errorf("디렉토리 생성 오류 (%s): %v", filepath.Dir(newPath), err)
// 	}
// 	return 1, nil
// }
