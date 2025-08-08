package preset

import (
	"fmt"
	"regexp"
	"strings"
)

// ReplaceVariables 문서 내용에서 변수를 치환합니다
func ReplaceVariables(content string, replacements map[string]string) (string, error) {
	// {{변수명}} 형태의 정규식 패턴
	re := regexp.MustCompile(`{{([^{}]+)}}`)

	// 치환된 내용
	result := re.ReplaceAllStringFunc(content, func(match string) string {
		key := strings.Trim(match, "{}")
		if value, ok := replacements[key]; ok {
			// 특별한 처리: 한 자리 숫자인 경우 앞에 0 추가
			if len(value) == 1 && isNumeric(value) {
				return "0" + value
			}
			return value
		}
		// 치환값이 없으면 원본 그대로 반환
		return match
	})

	return result, nil
}

// ReplaceVariablesInText 일반 텍스트에서 변수를 치환합니다
func ReplaceVariablesInText(text string, replacements map[string]string) (string, error) {
	// {{변수명}} 형태의 정규식 패턴
	re := regexp.MustCompile(`{{([^{}]+)}}`)

	// 치환된 텍스트
	result := re.ReplaceAllStringFunc(text, func(match string) string {
		key := strings.Trim(match, "{}")
		if value, ok := replacements[key]; ok {
			// 특별한 처리: 한 자리 숫자인 경우 앞에 0 추가
			if len(value) == 1 && isNumeric(value) {
				return "0" + value
			}
			return value
		}
		// 치환값이 없으면 원본 그대로 반환
		return match
	})

	return result, nil
}

// ReplaceVariablesInFileName 파일명에서 변수를 치환합니다
func ReplaceVariablesInFileName(fileName string, replacements map[string]string) (string, error) {
	// 파일 확장자 분리
	lastDotIndex := strings.LastIndex(fileName, ".")
	if lastDotIndex == -1 {
		// 확장자가 없는 경우
		result, err := ReplaceVariablesInText(fileName, replacements)
		return result, err
	}

	// 파일명과 확장자 분리
	name := fileName[:lastDotIndex]
	ext := fileName[lastDotIndex:]

	// 파일명 부분만 치환
	result, err := ReplaceVariablesInText(name, replacements)
	if err != nil {
		return fileName, err
	}

	// 확장자와 결합
	return result + ext, nil
}

// GetUnreplacedVariables 치환되지 않은 변수들을 찾습니다
func GetUnreplacedVariables(content string, replacements map[string]string) []string {
	// {{변수명}} 형태의 정규식 패턴
	re := regexp.MustCompile(`{{([^{}]+)}}`)

	// 모든 매치를 찾기
	matches := re.FindAllString(content, -1)

	// 치환되지 않은 변수들을 저장할 맵
	unreplacedMap := make(map[string]bool)

	// 각 매치를 처리
	for _, match := range matches {
		key := strings.Trim(match, "{}")
		if _, exists := replacements[key]; !exists {
			unreplacedMap[key] = true
		}
	}

	// 맵을 슬라이스로 변환
	var unreplaced []string
	for variable := range unreplacedMap {
		unreplaced = append(unreplaced, variable)
	}

	return unreplaced
}

// GetReplacementStatistics 치환 통계를 반환합니다
func GetReplacementStatistics(content string, replacements map[string]string) map[string]int {
	// {{변수명}} 형태의 정규식 패턴
	re := regexp.MustCompile(`{{([^{}]+)}}`)

	// 모든 매치를 찾기
	matches := re.FindAllString(content, -1)

	// 통계를 저장할 맵
	stats := make(map[string]int)

	// 각 매치를 처리
	for _, match := range matches {
		key := strings.Trim(match, "{}")
		stats[key]++
	}

	return stats
}

// isNumeric 문자열이 숫자인지 확인합니다
func isNumeric(s string) bool {
	for _, r := range s {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}

// FormatReplacementMap 치환 맵을 보기 좋게 포맷팅합니다
func FormatReplacementMap(replacements map[string]string) string {
	if len(replacements) == 0 {
		return "치환 항목이 없습니다."
	}

	var result strings.Builder
	result.WriteString("치환 항목:\n")

	for key, value := range replacements {
		result.WriteString(fmt.Sprintf("  {{%s}} → %s\n", key, value))
	}

	return result.String()
}

// MergeReplacementMaps 여러 치환 맵을 병합합니다
func MergeReplacementMaps(maps ...map[string]string) map[string]string {
	result := make(map[string]string)

	for _, m := range maps {
		for key, value := range m {
			result[key] = value
		}
	}

	return result
}
