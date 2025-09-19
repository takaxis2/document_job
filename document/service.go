package document

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	// "regexp"
	"strings"

	"doc_job/preset"

	"github.com/takaxis2/go-docx"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/xuri/excelize/v2"
)

type TemplateProcessor interface {
	Process(content []byte, data map[string]string) ([]byte, error)
}

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
func processSelectedFiles(filePaths []string, destination string, replacements map[string]string) error {
	if len(filePaths) == 0 {
		return fmt.Errorf("처리할 파일이 없습니다")
	}

	// 공통 상위 폴더 찾기
	commonPath := findCommonPrefix(filePaths)
	if commonPath == "" {
		return fmt.Errorf("공통 경로를 찾을 수 없습니다")
	}

	// 각 파일 처리
	for _, filePath := range filePaths {
		// 상대경로 계산
		relPath, err := filepath.Rel(commonPath, filePath)
		if err != nil {
			return fmt.Errorf("상대 경로 계산 오류 (%s): %v", filePath, err)
		}

		// 결과물 저장 경로
		dstPath := filepath.Join(destination, relPath)

		// 필요한 폴더 생성
		dstDir := filepath.Dir(dstPath)
		if err := os.MkdirAll(dstDir, 0755); err != nil {
			return fmt.Errorf("폴더 생성 오류 (%s): %v", dstDir, err)
		}

		// 파일 처리 / 생성
		if err := processFile(filePath, dstPath, replacements); err != nil {
			return fmt.Errorf("파일 처리 오류 (%s): %v", filePath, err)
		}

	}

	return nil
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

	docx.ChangeOpenCloseDelimiter("{{", "}}")

	doc, err := docx.Open(filePath)
	if err != nil {
		return fmt.Errorf("docx 파일 열기 오류: %v", err)
	}

	// 1. os.Open으로 파일을 열고, Stat()으로 파일 정보를 가져옵니다.
	// readFile, err := os.Open(filePath)
	// if err != nil {
	// 	return fmt.Errorf("파일 열기 오류: %v", err)
	// }
	// defer readFile.Close()

	// fileinfo, err := readFile.Stat()
	// if err != nil {
	// 	return fmt.Errorf("파일 정보 읽기 오류: %v", err)
	// }

	// // 2. docx.Parse에 파일 리더와 크기를 전달하여 docx 객체를 생성합니다.
	// doc, err := docx.Parse(readFile, fileinfo.Size())
	// if err != nil {
	// 	return fmt.Errorf("docx 파일 파싱 오류: %v", err)
	// }

	// for _, item := range doc.Document.Body.Items {
	// 	if para, ok := item.(*docx.Paragraph); ok {
	// 		fmt.Println("para")
	// 		for _, run := range para.Children {
	// 			fmt.Println("run")
	// 			if text, ok := run.(*docx.Text); ok {
	// 				// Replace the text. You can perform any string operation here.
	// 				fmt.Println("text.Text : " + text.Text)
	// 				newVal, err := preset.ReplaceVariablesInText(text.Text, replacements)
	// 				if err != nil {
	// 					return fmt.Errorf("변수 치환 오류: %v", err)
	// 				}

	// 				text.Text = newVal
	// 			}
	// 		}
	// 	}
	// }

	// 4. 새 파일명 처리
	newFileName, err := processFileName(newPath, replacements)
	if err != nil {
		newFileName = newPath // 오류 발생 시 원본 경로 사용
	}

	// 5. 파일 저장
	// w, err := os.Create(newFileName)
	// if err != nil {
	// 	return fmt.Errorf("파일 생성 오류: %v", err)
	// }
	// defer w.Close()

	// _, err = doc.WriteTo(w)

	if err != nil {
		return fmt.Errorf("수정된 파일 저장 오류: %v", err)
	}

	fmt.Println("변수 치환 완료: " + newFileName)

	return nil
}

func processExcelFile(filePath string, newPath string, replacements map[string]string) error {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return fmt.Errorf("excel 파일 열기 오류 : %v", err)
	}

	defer func() {
		if err := f.Close(); err != nil {
			fmt.Printf("Excel 파일 닫기 오류: %v\n", err)
		}
	}()

	//모든 시트에대해 작업 수행
	for _, sheetName := range f.GetSheetList() {
		if err := processSheet(f, sheetName, replacements); err != nil {
			return fmt.Errorf("시트 '%s' 처리 오류: %v", sheetName, err)
		}
	}

	newFileName, err := processFileName(newPath, replacements)
	if err != nil {
		//에러 발생시 _template 파일명을 사용
		newFileName = newPath
	}

	//새 파일로 저장
	if err := f.SaveAs(newFileName); err != nil {
		return fmt.Errorf("수정된 Excel 파일 저장 오류 : %v", err)
	}

	return nil
}

// processSheet는 단일 시트를 처리합니다
func processSheet(f *excelize.File, sheetName string, replacements map[string]string) error {
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return fmt.Errorf("시트 읽기 오류: %v", err)
	}

	for rowIndex, row := range rows {
		if err := processRow(f, sheetName, row, rowIndex, replacements); err != nil {
			return fmt.Errorf("행 %d 처리 오류: %v", rowIndex+1, err)
		}
	}
	return nil
}

// processRow는 단일 행을 처리합니다
func processRow(f *excelize.File, sheetName string, row []string, rowIndex int, replacements map[string]string) error {
	for colIndex, cellValue := range row {
		newValue, err := preset.ReplaceVariablesInText(cellValue, replacements)
		if err != nil {
			return fmt.Errorf("셀 변수 치환 오류: %v", err)
		}

		//값이 변경되었다면 새 값을 셀에 설정
		if newValue != cellValue {
			cellName, err := excelize.CoordinatesToCellName(colIndex+1, rowIndex+1)
			if err != nil {
				return fmt.Errorf("셀 좌표변환 오류 : %v", err)
			}
			if err := f.SetCellValue(sheetName, cellName, newValue); err != nil {
				return fmt.Errorf("셀 값 설정 오류 : %v", err)
			}
		}
	}
	return nil
}

func processFileName(file_path string, replacements map[string]string) (string, error) {
	// 파일명과 확장자 분리
	dir := filepath.Dir(file_path)
	filename := filepath.Base(file_path)
	ext := filepath.Ext(filename)
	name := strings.TrimSuffix(filename, ext)

	// '_template'이 포함된 파일명인지 확인
	if !strings.Contains(name, "_template") {
		return "", fmt.Errorf("파일명에 '_template'이 포함되어 있지 않습니다")
	}

	// replacements에서 연도와 월 가져오기
	year, exists := replacements["WORK_YEAR"]
	if !exists {
		return "", fmt.Errorf("WORK_YEAR가 replacements에 없습니다")
	}

	month, exists := replacements["WORK_MONTH"]
	if !exists {
		return "", fmt.Errorf("WORK_MONTH가 replacements에 없습니다")
	}

	// 월이 한 자리수인 경우 두 자리로 변환 (예: "3" -> "03")
	if len(month) == 1 {
		month = "0" + month
	}

	// 새 파일명 생성 (_template을 _YYYYMM으로 대체)
	newFilename := strings.Replace(name, "_template", fmt.Sprintf("_%s%s", year, month), 1)
	newPath := filepath.Join(dir, newFilename+ext)

	return newPath, nil
}
