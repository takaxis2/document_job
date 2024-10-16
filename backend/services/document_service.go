package services

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"

	"github.com/nguyenthenguyen/docx"
	"github.com/xuri/excelize/v2"
)

type DocumentService struct{}

type FileNode struct {
	Name     string     `json:"name"`
	Path     string     `json:"path"`
	IsDir    bool       `json:"isDir"`
	Children []FileNode `json:"children,omitempty"`
}

func NewDocumentService() *DocumentService {
	return &DocumentService{}
}

func (ds *DocumentService) ReadFolderAndDocument(root string) (FileNode, error) {
	//root폴더/파일을 찾고 없으면 err 리턴
	rootInfo, err := os.Stat(root)
	if err != nil {
		return FileNode{}, err
	}

	//루트노드 생성
	rootNode := FileNode{
		Name:  rootInfo.Name(),
		Path:  root,
		IsDir: rootInfo.IsDir(),
	}

	//루트 노드가 파일이면 리턴
	if !rootInfo.IsDir() {
		return rootNode, nil
	}

	//루트 폴더 조회
	err = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		//폴더 안에 아무것도 없으면 리턴
		if path == root {
			return nil
		}

		//Rel은 중간 구분 기호를 사용하여 basepath에 결합할 때 targpath와 어휘적으로 동일한 상대 경로를 반환합니다.
		relPath, err := filepath.Rel(root, path)
		if err != nil {
			return err
		}

		parts := strings.Split(relPath, string(os.PathSeparator))
		currentNode := &rootNode

		for i, part := range parts {
			if i == len(parts)-1 {
				// 마지막 부분 (파일 또는 폴더)
				newNode := FileNode{
					Name:  part,
					Path:  path,
					IsDir: info.IsDir(),
				}
				currentNode.Children = append(currentNode.Children, newNode)
			} else {
				// 중간 경로 (폴더)
				found := false
				for j := range currentNode.Children {
					if currentNode.Children[j].Name == part && currentNode.Children[j].IsDir {
						currentNode = &currentNode.Children[j]
						found = true
						break
					}
				}
				if !found {
					newNode := FileNode{
						Name:  part,
						Path:  filepath.Join(root, filepath.Join(parts[:i+1]...)),
						IsDir: true,
					}
					currentNode.Children = append(currentNode.Children, newNode)
					currentNode = &currentNode.Children[len(currentNode.Children)-1]
				}
			}
		}

		return nil
	})

	if err != nil {
		return FileNode{}, err
	}

	return rootNode, nil
}

func (ds *DocumentService) GetDocumentsInFolder(path string) ([]FileNode, error) {
	var nodes []FileNode
	err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		node := FileNode{
			Name:  info.Name(),
			Path:  path,
			IsDir: info.IsDir(),
		}
		nodes = append(nodes, node)
		return nil
	})
	return nodes, err
}

func (ds *DocumentService) ProcessFiles(filePaths []string, destination string, replacements map[string]string) (int, error) {
	if len(filePaths) == 0 {
		return 0, fmt.Errorf("처리할 파일이 없습니다")
	}

	for i := 0; i < len(filePaths); i++ {
		fmt.Println("filePath : " + filePaths[i])
	}

	processedCount := 0
	commonAncestor := findCommonPrefix(filePaths)
	// fmt.Println("COMMON ANCESTOR : " + commonAncestor)

	for _, path := range filePaths {
		// fmt.Println("path : " + path)
		count, err := ds.processPath(path, commonAncestor, destination, replacements)
		if err != nil {
			fmt.Printf("경로 처리 중 오류 발생 (%s): %v\n", path, err)
			continue // 오류가 발생해도 계속 진행
		}
		processedCount += count
	}

	return processedCount, nil

}

func (ds *DocumentService) processPath(path, commonAncestor, destinationFolder string, replacements map[string]string) (int, error) {
	relPath, err := filepath.Rel(commonAncestor, path)
	// fmt.Println("rel path : " + relPath)
	if err != nil {
		return 0, fmt.Errorf("상대 경로 계산 오류 (%s): %v", path, err)
	}

	newPath := filepath.Join(destinationFolder, relPath)
	// fmt.Println("new path : " + newPath)

	fileInfo, err := os.Stat(path)
	if err != nil {
		return 0, fmt.Errorf("파일 정보 읽기 오류 (%s): %v", path, err)
	}

	if fileInfo.IsDir() {
		// 디렉토리 생성
		err = os.MkdirAll(newPath, os.ModePerm)
		if err != nil && !os.IsExist(err) {
			return 0, fmt.Errorf("디렉토리 생성 오류 (%s): %v", newPath, err)
		}

		// 디렉토리 내용 처리
		files, err := os.ReadDir(path)
		if err != nil {
			return 0, fmt.Errorf("디렉토리 읽기 오류 (%s): %v", path, err)
		}

		processedCount := 0
		for _, file := range files {
			count, err := ds.processPath(filepath.Join(path, file.Name()), commonAncestor, destinationFolder, replacements)
			if err != nil {
				fmt.Printf("파일 처리 중 오류 발생 (%s): %v\n", file.Name(), err)
				continue // 오류가 발생해도 계속 진행
			}
			processedCount += count
		}
		return processedCount, nil
	}

	// 파일 처리
	// 파일을 위한 디렉토리 생성
	err = os.MkdirAll(filepath.Dir(newPath), os.ModePerm)
	if err != nil && !os.IsExist(err) {
		return 0, fmt.Errorf("디렉토리 생성 오류 (%s): %v", filepath.Dir(newPath), err)
	}

	err = ds.processFile(path, newPath, replacements)
	if err != nil {
		return 0, fmt.Errorf("디렉토리 생성 오류 (%s): %v", filepath.Dir(newPath), err)
	}

	return 1, nil
}

// func (ds *DocumentService) ProcessFiles(filePaths []string, destination string, replacements map[string]string) (int, error) {

// 	if len(filePaths) == 0 {
// 		return 0, fmt.Errorf("처리할 파일이 없습니다")
// 	}

// 	processCount := 0
// 	commonPrefix := findCommonPrefix(filePaths)

// 	for _, path := range filePaths {

// 		// 원본 파일의 상대 경로 계산
// 		relPath, err := filepath.Rel(commonPrefix, path)
// 		if err != nil {
// 			return processCount, fmt.Errorf("상대 경로 계산 오류 (%s): %v", path, err)
// 		}

// 		// 새 파일 경로 생성
// 		newPath := filepath.Join(destination, relPath)

// 		// 새 파일을 위한 디렉토리 생성
// 		err = os.MkdirAll(filepath.Dir(newPath), os.ModePerm)
// 		if err != nil && !os.IsExist(err) {
// 			return processCount, fmt.Errorf("디렉토리 생성 오류 (%s): %v", filepath.Dir(newPath), err)
// 		}

// 		// 파일인지 확인
// 		fileInfo, err := os.Stat(path)
// 		if err != nil {
// 			return processCount, fmt.Errorf("파일 정보 읽기 오류 (%s): %v", path, err)
// 		}
// 		if fileInfo.IsDir() {
// 			// 디렉토리는 건너뜁니다
// 			continue
// 		}

// 		err = ds.processFile(path, newPath, replacements)
// 		if err != nil {
// 			return 0, fmt.Errorf("파일 처리 중 오류 발생 (%s): %v", path, err)
// 		}
// 		processCount++
// 	}
// 	return processCount, nil
// }

// 공통 접두사를 찾는 함수
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

func (ds *DocumentService) processFile(filePath string, newFilePath string, replacements map[string]string) error {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".docx":
		return ds.ProcessWordDocument(filePath, newFilePath, replacements)
	case ".xlsx":
		return ds.ProcessExcelDocument(filePath, newFilePath, replacements)
	default:
		// {
		// 	sourceFile, err := os.Open(filePath)
		// 	if err != nil {
		// 		return err
		// 	}
		// 	defer sourceFile.Close()

		// 	destFile, err := os.Create(newFilePath)
		// 	if err != nil {
		// 		return err
		// 	}
		// 	defer destFile.Close()

		// 	_, err = io.Copy(destFile, sourceFile)
		// 	return err
		// }
		// return fmt.Errorf("지원하지 않는 파일형식 %s", filePath)
		return nil
	}
}

// processExcelFile 함수는 Excel 파일을 처리합니다.
func processExcelFile(filePath string) error {
	// Excel 파일 처리 로직 구현
	fmt.Printf("Excel 파일 처리: %s\n", filePath)
	return nil
}

func (ds *DocumentService) ProcessExcelDocument(templatPath, newFilePath string, replacements map[string]string) error {
	//원본 템플릿 문서 열기
	f, err := excelize.OpenFile(templatPath)
	if err != nil {
		return fmt.Errorf("Excel 파일 열기 오류 : %v", err)
	}

	defer func() {
		if err := f.Close(); err != nil {
			fmt.Printf("Excel 파일 닫기 오류: %v\n", err)
		}
	}()

	//{{}}형식의 플레이스 홀더를 찾기위한 정규식
	re := regexp.MustCompile((`{{([^{}]+)}}`))

	//모든 시트에대해 작업 수행
	for _, sheetName := range f.GetSheetList() {
		// 시트의 모든 셀을 순회
		rows, err := f.GetRows(sheetName)
		if err != nil {
			return fmt.Errorf("시트 '%s' 읽기 오류: %v", sheetName, err)
		}

		for rowIndex, row := range rows {
			for colIndex, cellValue := range row {
				//플레이스홀더 검색 및 대체
				newValue := re.ReplaceAllStringFunc(cellValue, func(match string) string {
					key := strings.Trim(match, "{}")
					if value, ok := replacements[key]; ok {
						return value
					}
					return match
				})

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
		}
	}

	//새 파일로 저장
	if err := f.SaveAs(newFilePath); err != nil {
		return fmt.Errorf("수정된 Excel 파일 저장 오류 : %v", err)
	}

	return nil

}

func (ds *DocumentService) ProcessWordDocument(templatePath, newFilePath string, replacements map[string]string) error {
	//원본 템플릿 문서 열기
	r, err := docx.ReadDocxFile(templatePath)
	if err != nil {
		return err
	}
	defer r.Close()

	//편집가능한 문서 생성
	doc := r.Editable()

	//{{}} 형식의 플레이스 홀더를 찾기위한 정규식
	re := regexp.MustCompile(`{{([^{}]+)}}`)

	//문서 내용 가져오기
	content := doc.GetContent()

	//모든 플레이스홀더를 찾기 및 대체
	content = re.ReplaceAllStringFunc(content, func(match string) string {
		key := strings.Trim(match, "{}")
		if value, ok := replacements[key]; ok {
			return value
		}
		return match
	})

	//대체된 내용을 문서에 저장
	doc.SetContent(content)

	//새파일로 저장
	err = doc.WriteToFile(newFilePath)
	if err != nil {
		return err
	}

	return nil

}

// 나중에 위에걸 갈아치우든 한다
func ProcessTemplate[T any](templatePath, newFilePath string, replacements map[string]T) error {
	// 원본 템플릿 문서 열기
	r, err := docx.ReadDocxFile(templatePath)
	if err != nil {
		return err
	}
	defer r.Close()

	// 새 문서 객체 생성
	doc := r.Editable()

	// {{}} 형식의 플레이스홀더를 찾기 위한 정규표현식
	re := regexp.MustCompile(`{{([^{}]+)}}`)

	// 문서 내용 가져오기
	content := doc.GetContent()

	// 모든 플레이스홀더 찾기 및 대체
	content = re.ReplaceAllStringFunc(content, func(match string) string {
		key := strings.Trim(match, "{}")
		if value, ok := replacements[key]; ok {
			return fmt.Sprintf("%v", value)
		}
		return match // 대체할 값이 없으면 원래 플레이스홀더 유지
	})

	// 대체된 내용을 문서에 다시 설정
	doc.SetContent(content)

	// 새 파일로 저장
	newFile, err := os.Create(newFilePath)
	if err != nil {
		return err
	}
	defer newFile.Close()

	// docx 패키지의 Write 메서드를 사용하여 새 파일에 내용 쓰기
	err = doc.Write(newFile)
	if err != nil {
		return err
	}

	return nil
}

func (ds *DocumentService) OpenFile(path string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rund1132", "url.dll.FileProtocolHandler", path)
	case "darwin":
		cmd = exec.Command("open", path)
	default: //Linux
		cmd = exec.Command("xdg-open", path)
	}
	return cmd.Start()
}

func (ds *DocumentService) ShowInExplorer(path string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("explorer", "/select,", path)
	case "darwin":
		cmd = exec.Command("open", "-R", path)
	default: // Linux
		cmd = exec.Command("xdg-open", filepath.Dir(path))
	}
	return cmd.Start()
}
