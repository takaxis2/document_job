package preset

import (
	"fmt"
	"regexp"
	"strings"
)

// ValidationError 검증 오류 정보
type ValidationError struct {
	Variable string `json:"variable"`
	Message  string `json:"message"`
}

// ValidationResult 검증 결과
type ValidationResult struct {
	IsValid bool              `json:"is_valid"`
	Errors  []ValidationError `json:"errors"`
}

// ValidateVariables 변수와 치환값을 검증합니다
func ValidateVariables(variables []string, replacements map[string]string) ValidationResult {
	result := ValidationResult{
		IsValid: true,
		Errors:  []ValidationError{},
	}

	// 필수 변수 검증
	for _, variable := range variables {
		if !isOptionalVariable(variable) {
			if value, exists := replacements[variable]; !exists || strings.TrimSpace(value) == "" {
				result.IsValid = false
				result.Errors = append(result.Errors, ValidationError{
					Variable: variable,
					Message:  fmt.Sprintf("필수 변수 '%s'의 값이 입력되지 않았습니다.", variable),
				})
			}
		}
	}

	// 치환값 형식 검증
	for variable, value := range replacements {
		if err := validateVariableValue(variable, value); err != nil {
			result.IsValid = false
			result.Errors = append(result.Errors, ValidationError{
				Variable: variable,
				Message:  err.Error(),
			})
		}
	}

	return result
}

// isOptionalVariable 선택적 변수인지 확인합니다
func isOptionalVariable(variable string) bool {
	optionalVariables := []string{
		"팩스번호",
		"홈페이지",
		"거래처팩스번호",
		"거래처이메일",
		"거래처담당자",
		"거래처담당자연락처",
		"계약담당자",
		"담당자이메일",
	}

	for _, opt := range optionalVariables {
		if variable == opt {
			return true
		}
	}

	return false
}

// validateVariableValue 변수값의 형식을 검증합니다
func validateVariableValue(variable, value string) error {
	if strings.TrimSpace(value) == "" {
		return nil // 빈 값은 검증하지 않음
	}

	switch variable {
	case "사업자번호", "거래처사업자번호":
		return validateBusinessNumber(value)
	case "법인번호":
		return validateCorporateNumber(value)
	case "전화번호", "거래처전화번호", "거래처담당자연락처", "담당자연락처":
		return validatePhoneNumber(value)
	case "팩스번호", "거래처팩스번호":
		return validateFaxNumber(value)
	case "이메일", "거래처이메일", "담당자이메일":
		return validateEmail(value)
	case "홈페이지":
		return validateWebsite(value)
	case "계약금액", "견적금액", "인보이스금액":
		return validateAmount(value)
	case "계약일자", "계약시작일", "계약종료일", "견적일자", "인보이스발행일", "인보이스만기일", "설립일":
		return validateDate(value)
	}

	return nil
}

// validateBusinessNumber 사업자번호 형식을 검증합니다
func validateBusinessNumber(value string) error {
	// 숫자와 하이픈만 허용
	re := regexp.MustCompile(`^[0-9-]+$`)
	if !re.MatchString(value) {
		return fmt.Errorf("사업자번호는 숫자와 하이픈(-)만 입력 가능합니다")
	}

	// 하이픈 제거 후 길이 확인
	cleanValue := strings.ReplaceAll(value, "-", "")
	if len(cleanValue) != 10 {
		return fmt.Errorf("사업자번호는 10자리여야 합니다")
	}

	return nil
}

// validateCorporateNumber 법인번호 형식을 검증합니다
func validateCorporateNumber(value string) error {
	// 숫자와 하이픈만 허용
	re := regexp.MustCompile(`^[0-9-]+$`)
	if !re.MatchString(value) {
		return fmt.Errorf("법인번호는 숫자와 하이픈(-)만 입력 가능합니다")
	}

	// 하이픈 제거 후 길이 확인
	cleanValue := strings.ReplaceAll(value, "-", "")
	if len(cleanValue) != 13 {
		return fmt.Errorf("법인번호는 13자리여야 합니다")
	}

	return nil
}

// validatePhoneNumber 전화번호 형식을 검증합니다
func validatePhoneNumber(value string) error {
	// 전화번호 형식: 02-1234-5678, 010-1234-5678, 031-123-4567 등
	re := regexp.MustCompile(`^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$`)
	if !re.MatchString(value) {
		return fmt.Errorf("전화번호 형식이 올바르지 않습니다 (예: 02-1234-5678)")
	}

	return nil
}

// validateFaxNumber 팩스번호 형식을 검증합니다
func validateFaxNumber(value string) error {
	// 팩스번호는 전화번호와 동일한 형식
	return validatePhoneNumber(value)
}

// validateEmail 이메일 형식을 검증합니다
func validateEmail(value string) error {
	// 이메일 형식 검증
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !re.MatchString(value) {
		return fmt.Errorf("이메일 형식이 올바르지 않습니다")
	}

	return nil
}

// validateWebsite 웹사이트 형식을 검증합니다
func validateWebsite(value string) error {
	// 웹사이트 형식 검증 (http:// 또는 https:// 포함)
	re := regexp.MustCompile(`^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`)
	if !re.MatchString(value) {
		return fmt.Errorf("웹사이트 형식이 올바르지 않습니다 (예: https://example.com)")
	}

	return nil
}

// validateAmount 금액 형식을 검증합니다
func validateAmount(value string) error {
	// 숫자와 쉼표만 허용
	re := regexp.MustCompile(`^[0-9,]+$`)
	if !re.MatchString(value) {
		return fmt.Errorf("금액은 숫자와 쉼표(,)만 입력 가능합니다")
	}

	return nil
}

// validateDate 날짜 형식을 검증합니다
func validateDate(value string) error {
	// YYYY-MM-DD 형식 검증
	re := regexp.MustCompile(`^[0-9]{4}-[0-9]{2}-[0-9]{2}$`)
	if !re.MatchString(value) {
		return fmt.Errorf("날짜 형식이 올바르지 않습니다 (예: 2025-01-01)")
	}

	return nil
}
