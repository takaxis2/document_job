package preset

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/takaxis2/go-docx"
	"github.com/xuri/excelize/v2"
)

// VariableInfo 변수 정보
type VariableInfo struct {
	Key         string `json:"key"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Count       int    `json:"count"` // 문서에서 사용된 횟수
}

// ExtractVariables 문서에서 변수를 추출합니다
func ExtractVariables(content string) ([]VariableInfo, error) {
	// {{변수명}} 형태의 정규식 패턴
	re := regexp.MustCompile(`{{([^{}]+)}}`)

	// 모든 매치를 찾기
	matches := re.FindAllString(content, -1)

	// 변수 정보를 저장할 맵
	variableMap := make(map[string]*VariableInfo)

	// 각 매치를 처리
	for _, match := range matches {
		key := strings.Trim(match, "{}")

		// 이미 존재하는 변수인지 확인
		if info, exists := variableMap[key]; exists {
			info.Count++
		} else {
			// 새로운 변수 정보 생성
			description := getVariableDescription(key)
			category := getVariableCategory(key)

			variableMap[key] = &VariableInfo{
				Key:         key,
				Description: description,
				Category:    category,
				Count:       1,
			}
		}
	}

	// 맵을 슬라이스로 변환
	var variables []VariableInfo
	for _, info := range variableMap {
		variables = append(variables, *info)
	}

	return variables, nil
}

var xmlTagRegex = regexp.MustCompile(`<[^>]+>`)

func stripXMLTags(s string) string {
	return xmlTagRegex.ReplaceAllString(s, "")
}

// ExtractVariablesFromDocx 워드(.docx) 파일에서 변수를 추출합니다
func ExtractVariablesFromDocx(filePath string) ([]VariableInfo, error) {
	docx.ChangeOpenCloseDelimiter("{{", "}}")

	b, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("docx 파일 읽기 오류: %w", err)
	}

	doc, err := docx.OpenBytes(b)
	if err != nil {
		return nil, fmt.Errorf("docx 파싱 오류: %w", err)
	}
	defer doc.Close()

	variableMap := make(map[string]*VariableInfo)

	// 1. go-docx의 GetPlaceHoldersList 시도
	placeholders, err := doc.GetPlaceHoldersList()
	if err == nil && len(placeholders) > 0 {
		for _, ph := range placeholders {
			cleanKey := strings.TrimSpace(strings.Trim(ph, "{}"))
			if cleanKey == "" {
				continue
			}
			if info, exists := variableMap[cleanKey]; exists {
				info.Count++
			} else {
				variableMap[cleanKey] = &VariableInfo{
					Key:         cleanKey,
					Description: getVariableDescription(cleanKey),
					Category:    getVariableCategory(cleanKey),
					Count:       1,
				}
			}
		}
	}

	// 2. 만약 placeholders에서 잡히지 않은 변수나 분할 run 보완을 위해 docx 내부 XML 스캔
	re := regexp.MustCompile(`\{\{([^{}]+)\}\}`)
	zipReader, zipErr := zip.NewReader(bytes.NewReader(b), int64(len(b)))
	if zipErr == nil {
		for _, file := range zipReader.File {
			if strings.HasPrefix(file.Name, "word/") && strings.HasSuffix(file.Name, ".xml") {
				rc, err := file.Open()
				if err != nil {
					continue
				}
				contentBytes, _ := io.ReadAll(rc)
				rc.Close()

				matches := re.FindAllStringSubmatch(string(contentBytes), -1)
				for _, match := range matches {
					if len(match) > 1 {
						cleanKey := strings.TrimSpace(match[1])
						if strings.Contains(cleanKey, "<") || strings.Contains(cleanKey, ">") {
							cleanKey = stripXMLTags(cleanKey)
						}
						cleanKey = strings.TrimSpace(cleanKey)
						if cleanKey == "" {
							continue
						}
						// 이미 GetPlaceHoldersList에서 세었으면 중복 카운트하지 않음
						if len(placeholders) == 0 {
							if info, exists := variableMap[cleanKey]; exists {
								info.Count++
							} else {
								variableMap[cleanKey] = &VariableInfo{
									Key:         cleanKey,
									Description: getVariableDescription(cleanKey),
									Category:    getVariableCategory(cleanKey),
									Count:       1,
								}
							}
						} else {
							// GetPlaceHoldersList에 없던 새로운 키만 추가
							if _, exists := variableMap[cleanKey]; !exists {
								variableMap[cleanKey] = &VariableInfo{
									Key:         cleanKey,
									Description: getVariableDescription(cleanKey),
									Category:    getVariableCategory(cleanKey),
									Count:       1,
								}
							}
						}
					}
				}
			}
		}
	}

	var variables []VariableInfo
	for _, info := range variableMap {
		variables = append(variables, *info)
	}

	return variables, nil
}

// ExtractVariablesFromXlsx 엑셀(.xlsx) 파일에서 변수를 추출합니다
func ExtractVariablesFromXlsx(filePath string) ([]VariableInfo, error) {
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("excel 파일 열기 오류: %w", err)
	}
	defer f.Close()

	re := regexp.MustCompile(`\{\{([^{}]+)\}\}`)
	variableMap := make(map[string]*VariableInfo)

	for _, sheetName := range f.GetSheetList() {
		rows, err := f.GetRows(sheetName)
		if err != nil {
			continue
		}
		for _, row := range rows {
			for _, cellValue := range row {
				if !strings.Contains(cellValue, "{{") {
					continue
				}
				matches := re.FindAllStringSubmatch(cellValue, -1)
				for _, match := range matches {
					if len(match) > 1 {
						key := strings.TrimSpace(match[1])
						if key == "" {
							continue
						}
						if info, exists := variableMap[key]; exists {
							info.Count++
						} else {
							variableMap[key] = &VariableInfo{
								Key:         key,
								Description: getVariableDescription(key),
								Category:    getVariableCategory(key),
								Count:       1,
							}
						}
					}
				}
			}
		}
	}

	var variables []VariableInfo
	for _, info := range variableMap {
		variables = append(variables, *info)
	}

	return variables, nil
}

// ExtractVariablesFromFile 파일 형식에 따라 적절한 추출기를 호출합니다
func ExtractVariablesFromFile(filePath string) ([]VariableInfo, error) {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".docx", ".doc":
		return ExtractVariablesFromDocx(filePath)
	case ".xlsx", ".xls":
		return ExtractVariablesFromXlsx(filePath)
	default:
		return nil, fmt.Errorf("지원하지 않는 파일 형식입니다: %s", ext)
	}
}

// ExtractVariablesFromFiles 여러 파일에서 변수를 추출하여 병합합니다
func ExtractVariablesFromFiles(filePaths []string) ([]VariableInfo, error) {
	variableMap := make(map[string]*VariableInfo)

	for _, path := range filePaths {
		vars, err := ExtractVariablesFromFile(path)
		if err != nil {
			continue
		}

		for _, v := range vars {
			if existing, exists := variableMap[v.Key]; exists {
				existing.Count += v.Count
			} else {
				infoCopy := v
				variableMap[v.Key] = &infoCopy
			}
		}
	}

	var variables []VariableInfo
	for _, info := range variableMap {
		variables = append(variables, *info)
	}

	return variables, nil
}

// getVariableDescription 변수에 대한 설명을 반환합니다
func getVariableDescription(key string) string {
	descriptions := map[string]string{
		"회사명":       "회사 이름",
		"대표자명":      "회사 대표자 이름",
		"사업자번호":     "사업자등록번호",
		"법인번호":      "법인등록번호",
		"설립일":       "회사 설립일",
		"업종":        "회사 업종",
		"업태":        "회사 업태",
		"주소":        "회사 주소",
		"전화번호":      "회사 대표 전화번호",
		"팩스번호":      "회사 팩스번호",
		"이메일":       "회사 대표 이메일",
		"홈페이지":      "회사 홈페이지 주소",
		"거래처명":      "거래처 이름",
		"거래처대표자":    "거래처 대표자 이름",
		"거래처사업자번호":  "거래처 사업자등록번호",
		"거래처주소":     "거래처 주소",
		"거래처전화번호":   "거래처 전화번호",
		"거래처팩스번호":   "거래처 팩스번호",
		"거래처이메일":    "거래처 이메일",
		"거래처담당자":    "거래처 담당자 이름",
		"거래처담당자연락처": "거래처 담당자 연락처",
		"계약번호":      "계약 고유 번호",
		"계약일자":      "계약 체결 일자",
		"계약시작일":     "계약 시작일",
		"계약종료일":     "계약 종료일",
		"계약금액":      "계약 금액",
		"계약목적":      "계약의 목적",
		"계약기간":      "계약 유효 기간",
		"계약담당자":     "계약 담당자 이름",
		"견적번호":      "견적서 번호",
		"견적일자":      "견적서 작성일",
		"견적유효기간":    "견적서 유효기간",
		"견적금액":      "견적 총액",
		"납품기한":      "납품 기한",
		"결제조건":      "결제 조건",
		"인보이스번호":    "인보이스 번호",
		"인보이스발행일":   "인보이스 발행일",
		"인보이스만기일":   "인보이스 지불 만기일",
		"인보이스금액":    "인보이스 총액",
		"세금계산서번호":   "세금계산서 번호",
		"오늘날짜":      "현재 날짜",
		"담당자":       "담당자 이름",
		"담당자연락처":    "담당자 연락처",
		"담당자이메일":    "담당자 이메일",
	}

	if desc, exists := descriptions[key]; exists {
		return desc
	}

	return "사용자 정의 변수"
}

// getVariableCategory 변수의 카테고리를 반환합니다
func getVariableCategory(key string) string {
	categories := map[string]string{
		"회사명":       "회사 정보",
		"대표자명":      "회사 정보",
		"사업자번호":     "회사 정보",
		"법인번호":      "회사 정보",
		"설립일":       "회사 정보",
		"업종":        "회사 정보",
		"업태":        "회사 정보",
		"주소":        "회사 정보",
		"전화번호":      "회사 정보",
		"팩스번호":      "회사 정보",
		"이메일":       "회사 정보",
		"홈페이지":      "회사 정보",
		"거래처명":      "거래처 정보",
		"거래처대표자":    "거래처 정보",
		"거래처사업자번호":  "거래처 정보",
		"거래처주소":     "거래처 정보",
		"거래처전화번호":   "거래처 정보",
		"거래처팩스번호":   "거래처 정보",
		"거래처이메일":    "거래처 정보",
		"거래처담당자":    "거래처 정보",
		"거래처담당자연락처": "거래처 정보",
		"계약번호":      "계약 정보",
		"계약일자":      "계약 정보",
		"계약시작일":     "계약 정보",
		"계약종료일":     "계약 정보",
		"계약금액":      "계약 정보",
		"계약목적":      "계약 정보",
		"계약기간":      "계약 정보",
		"계약담당자":     "계약 정보",
		"견적번호":      "견적 정보",
		"견적일자":      "견적 정보",
		"견적유효기간":    "견적 정보",
		"견적금액":      "견적 정보",
		"납품기한":      "견적 정보",
		"결제조건":      "견적 정보",
		"인보이스번호":    "인보이스 정보",
		"인보이스발행일":   "인보이스 정보",
		"인보이스만기일":   "인보이스 정보",
		"인보이스금액":    "인보이스 정보",
		"세금계산서번호":   "인보이스 정보",
		"오늘날짜":      "기타 정보",
		"담당자":       "기타 정보",
		"담당자연락처":    "기타 정보",
		"담당자이메일":    "기타 정보",
	}

	if category, exists := categories[key]; exists {
		return category
	}

	return "기타 정보"
}
