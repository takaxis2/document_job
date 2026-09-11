package document

import (
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"

	"log"
	"path/filepath"

	"doc_job/db"
	"doc_job/models"

	"github.com/xuri/excelize/v2"
)

type ExcelValidationItem struct {
	RowIndex       int      `json:"row_index"`        // 엑셀 행 번호 (1-based)
	BusinessNumber string   `json:"business_number"` // 공급받는자 등록번호
	CompanyName    string   `json:"company_name"`    // 공급받는자 상호
	Representative string   `json:"representative"`  // 공급받는자 대표자
	Email          string   `json:"email"`           // 공급받는자 이메일1
	SupplyValue    int64    `json:"supply_value"`    // 공급가액
	TaxValue       int64    `json:"tax_value"`       // 세액
	Errors         []string `json:"errors"`          // 이 행의 오류들
}

type InvoiceTarget struct {
	ID             string `json:"id"`              // "fac_1" 또는 "part_1"
	Type           string `json:"type"`            // "facility" 또는 "partner"
	PartnerID      int64  `json:"partner_id"`
	PartnerName    string `json:"partner_name"`
	Name           string `json:"name"`            // 시설명 또는 파트너명
	CompanyName    string `json:"company_name"`    // 상호명
	BusinessNumber string `json:"business_number"` // 사업자번호
	Email          string `json:"email"`
}

type MissingPartnerItem struct {
	FacilityID     int64  `json:"facility_id"`
	TargetID       string `json:"target_id"` // "fac_1" 또는 "part_1"
	PartnerName    string `json:"partner_name"`
	FacilityName   string `json:"facility_name"`
	CompanyName    string `json:"company_name"`
	BusinessNumber string `json:"business_number"`
	Email          string `json:"email"`
}

type ExcelValidationReport struct {
	TotalRows       int                   `json:"total_rows"`
	ValidRowsCount  int                   `json:"valid_rows_count"`
	ErrorRowsCount  int                   `json:"error_rows_count"`
	Items           []ExcelValidationItem `json:"items"`
	MissingPartners []MissingPartnerItem  `json:"missing_partners"`
}

// IsValidBusinessNumber checks Korean business registration number validity (checksum)
func IsValidBusinessNumber(num string) bool {
	num = strings.ReplaceAll(num, "-", "")
	num = strings.TrimSpace(num)
	if len(num) != 10 {
		return false
	}
	keys := []int{1, 3, 7, 1, 3, 7, 1, 3, 5}
	sum := 0
	for i := 0; i < 9; i++ {
		val := int(num[i] - '0')
		if val < 0 || val > 9 {
			return false
		}
		sum += val * keys[i]
	}
	
	lastKeyProduct := int(num[8]-'0') * 5
	sum += lastKeyProduct / 10
	
	checkDigit := (10 - (sum % 10)) % 10
	return checkDigit == int(num[9]-'0')
}

// ValidateInvoiceExcel parses and validates tax invoice Excel file
func (d *Document) ValidateInvoiceExcel(filePath string) (*ExcelValidationReport, error) {
	log.Printf("[Go Backend] ValidateInvoiceExcel called with path: %s\n", filePath)
	
	// 확장자 체크
	ext := strings.ToLower(filepath.Ext(filePath))
	if ext == ".xls" {
		return nil, fmt.Errorf("구버전 엑셀 형식(.xls)은 분석할 수 없습니다. 엑셀 프로그램에서 파일을 열어 '다른 이름으로 저장'을 통해 'Excel 통합 문서(.xlsx)' 형식으로 저장한 후 다시 시도해 주세요")
	}

	f, err := excelize.OpenFile(filePath)
	if err != nil {
		log.Printf("[Go Backend] ValidateInvoiceExcel OpenFile error: %v\n", err)
		return nil, fmt.Errorf("excel 파일 열기 오류: %w", err)
	}
	defer f.Close()

	// 첫 번째 시트 가져오기
	sheetList := f.GetSheetList()
	if len(sheetList) == 0 {
		return nil, fmt.Errorf("엑셀 파일에 시트가 존재하지 않습니다")
	}
	sheetName := sheetList[0]

	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("시트 행 읽기 오류: %w", err)
	}

	if len(rows) == 0 {
		return &ExcelValidationReport{TotalRows: 0}, nil
	}

	// 1. 헤더 감지 및 열 매핑
	// 기본값은 홈택스 표준 일괄작성 양식 기준
	bizNumIdx := 10  // Column K
	companyIdx := 12 // Column M
	repIdx := 13     // Column N
	emailIdx := 17   // Column R
	supplyIdx := 19  // Column T
	taxIdx := 20     // Column U
	
	headerRowIndex := -1
	detected := false

	// 첫 10행을 검색하여 헤더 유무 및 컬럼 매핑 찾기
	searchLimit := 10
	if len(rows) < searchLimit {
		searchLimit = len(rows)
	}

	for i := 0; i < searchLimit; i++ {
		row := rows[i]
		hasBizNum := false
		hasSupply := false
		hasTax := false

		tempBizNumIdx := -1
		tempCompanyIdx := -1
		tempRepIdx := -1
		tempEmailIdx := -1
		tempSupplyIdx := -1
		tempTaxIdx := -1

		for colIdx, cellVal := range row {
			cleanVal := strings.ReplaceAll(cellVal, " ", "")
			cleanVal = strings.ReplaceAll(cleanVal, "\n", "")

			// 공급받는자 등록번호 식별 (공급받는자 영역의 등록번호여야 함, 대략 colIdx > 5인 지점)
			// 첫 번째 매칭만 사용 (품목별 중복 컬럼 방지)
			if strings.Contains(cleanVal, "등록번호") && colIdx > 5 && !hasBizNum {
				tempBizNumIdx = colIdx
				hasBizNum = true
			}
			if (strings.Contains(cleanVal, "상호") || strings.Contains(cleanVal, "법인명")) && colIdx > 5 && tempCompanyIdx == -1 {
				tempCompanyIdx = colIdx
			}
			if (strings.Contains(cleanVal, "대표자") || strings.Contains(cleanVal, "성명")) && colIdx > 5 && tempRepIdx == -1 {
				tempRepIdx = colIdx
			}
			// 이메일1 컬럼만 사용 (이메일2는 보조 수신자이므로 첫 번째 이메일 컬럼만 감지)
			if (strings.Contains(cleanVal, "이메일") || strings.Contains(cleanVal, "이메일1")) && colIdx > 5 && tempEmailIdx == -1 {
				tempEmailIdx = colIdx
			}
			// 공급가액 총계 컬럼만 사용 (공급가액1~4는 품목별 소계이므로 첫 번째만 감지)
			if strings.Contains(cleanVal, "공급가액") && tempSupplyIdx == -1 {
				tempSupplyIdx = colIdx
				hasSupply = true
			}
			// 세액 총계 컬럼만 사용 (세액1~4는 품목별 소계이므로 첫 번째만 감지)
			if strings.Contains(cleanVal, "세액") && tempTaxIdx == -1 {
				tempTaxIdx = colIdx
				hasTax = true
			}
		}

		// 등록번호와 공급가액, 세액 항목이 한 행에서 발견된다면 헤더 행으로 확정
		if hasBizNum && hasSupply && hasTax {
			headerRowIndex = i
			bizNumIdx = tempBizNumIdx
			if tempCompanyIdx != -1 {
				companyIdx = tempCompanyIdx
			}
			if tempRepIdx != -1 {
				repIdx = tempRepIdx
			}
			if tempEmailIdx != -1 {
				emailIdx = tempEmailIdx
			}
			supplyIdx = tempSupplyIdx
			taxIdx = tempTaxIdx
			detected = true
			break
		}
	}

	// 시작 데이터 행 정의
	startRow := 0
	if detected {
		startRow = headerRowIndex + 1
	} else {
		// 헤더가 감지되지 않은 경우, 홈택스 표준 서식(5행부터 데이터)을 가정하여
		// 4번째 행(0-indexed: 4)부터 스캔
		if len(rows) > 4 {
			startRow = 4
		}
	}

	// 2. 데이터 행 파싱 및 검증
	var validationItems []ExcelValidationItem
	excelBizNumbers := make(map[string]bool)

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

	for i := startRow; i < len(rows); i++ {
		row := rows[i]

		// 행이 너무 짧으면 패스
		if len(row) <= bizNumIdx && len(row) <= supplyIdx {
			continue
		}

		// 셀 값 안전하게 가져오기
		getVal := func(idx int) string {
			if idx >= 0 && idx < len(row) {
				return strings.TrimSpace(row[idx])
			}
			return ""
		}

		bizNum := getVal(bizNumIdx)
		company := getVal(companyIdx)
		representative := getVal(repIdx)
		email := getVal(emailIdx)
		supplyStr := getVal(supplyIdx)
		taxStr := getVal(taxIdx)

		// 모든 필수 값들이 비어있다면 빈 행으로 간주하고 건너뜀
		if bizNum == "" && company == "" && representative == "" && supplyStr == "" && taxStr == "" {
			continue
		}

		var errors []string

		// 1) 사업자등록번호 검사
		cleanBizNum := strings.ReplaceAll(bizNum, "-", "")
		cleanBizNum = strings.ReplaceAll(cleanBizNum, " ", "")
		
		if bizNum == "" {
			errors = append(errors, "사업자등록번호가 입력되지 않았습니다.")
		} else if !IsValidBusinessNumber(cleanBizNum) {
			errors = append(errors, fmt.Sprintf("올바르지 않은 사업자번호 형식입니다: %s", bizNum))
		} else {
			excelBizNumbers[cleanBizNum] = true
		}

		// 2) 공급가액 & 세액 파싱 및 금액 정산 검증
		var supplyVal int64
		var taxVal int64
		var parseErr error

		if supplyStr != "" {
			cleanSupply := strings.ReplaceAll(supplyStr, ",", "")
			if idx := strings.Index(cleanSupply, "."); idx != -1 {
				cleanSupply = cleanSupply[:idx]
			}
			supplyVal, parseErr = strconv.ParseInt(cleanSupply, 10, 64)
			if parseErr != nil {
				errors = append(errors, fmt.Sprintf("공급가액 숫자 변환 오류: %s", supplyStr))
			}
		} else {
			errors = append(errors, "공급가액이 비어있습니다.")
		}

		if taxStr != "" {
			cleanTax := strings.ReplaceAll(taxStr, ",", "")
			if idx := strings.Index(cleanTax, "."); idx != -1 {
				cleanTax = cleanTax[:idx]
			}
			taxVal, parseErr = strconv.ParseInt(cleanTax, 10, 64)
			if parseErr != nil {
				errors = append(errors, fmt.Sprintf("세액 숫자 변환 오류: %s", taxStr))
			}
		} else {
			errors = append(errors, "세액이 비어있습니다.")
		}

		// 부가세 10% 일치성 검증 (오차 ±1 범위 허용)
		if supplyStr != "" && taxStr != "" && parseErr == nil {
			expectedTaxFloat := float64(supplyVal) * 0.1
			diff := math.Abs(expectedTaxFloat - float64(taxVal))
			
			roundedTax := int64(math.Round(expectedTaxFloat))
			flooredTax := int64(math.Floor(expectedTaxFloat))
			ceiledTax := int64(math.Ceil(expectedTaxFloat))

			if taxVal != roundedTax && taxVal != flooredTax && taxVal != ceiledTax && diff > 1.1 {
				errors = append(errors, fmt.Sprintf("공급가액 대비 세액 계산 불일치 (기대값: %d, 입력값: %d)", roundedTax, taxVal))
			}
		}

		// 3) 이메일 주소 검사
		if email != "" {
			if !emailRegex.MatchString(email) {
				errors = append(errors, fmt.Sprintf("올바르지 않은 이메일 형식입니다: %s", email))
			}
		} else {
			errors = append(errors, "수신 이메일이 입력되지 않았습니다.")
		}

		validationItems = append(validationItems, ExcelValidationItem{
			RowIndex:       i + 1, // 1-based index
			BusinessNumber: bizNum,
			CompanyName:    company,
			Representative: representative,
			Email:          email,
			SupplyValue:    supplyVal,
			TaxValue:       taxVal,
			Errors:         errors,
		})
	}

	// 3. 데이터베이스와 대조하여 누락된 거래처 찾기
	var missingPartners []MissingPartnerItem
	
	targets, err := d.GetInvoiceTargets()
	if err == nil {
		for _, target := range targets {
			cleanTargetBiz := strings.ReplaceAll(target.BusinessNumber, "-", "")
			cleanTargetBiz = strings.ReplaceAll(cleanTargetBiz, " ", "")

			if cleanTargetBiz == "" {
				continue
			}

			// 엑셀에서 발견되었는지 확인
			if !excelBizNumbers[cleanTargetBiz] {
				missingPartners = append(missingPartners, MissingPartnerItem{
					FacilityID:     0, // 하위 호환용
					TargetID:       target.ID,
					PartnerName:    target.PartnerName,
					FacilityName:   target.Name,
					CompanyName:    target.CompanyName,
					BusinessNumber: target.BusinessNumber,
					Email:          target.Email,
				})
			}
		}
	} else {
		log.Printf("[Go Backend] d.GetInvoiceTargets error: %v\n", err)
	}

	// 4. 레포트 종합
	totalRows := len(validationItems)
	errorRowsCount := 0
	for _, item := range validationItems {
		if len(item.Errors) > 0 {
			errorRowsCount++
		}
	}
	validRowsCount := totalRows - errorRowsCount

	return &ExcelValidationReport{
		TotalRows:       totalRows,
		ValidRowsCount:  validRowsCount,
		ErrorRowsCount:  errorRowsCount,
		Items:           validationItems,
		MissingPartners: missingPartners,
	}, nil
}

func (d *Document) GetInvoiceTargets() ([]InvoiceTarget, error) {
	partners, err := db.GetAllPartners()
	if err != nil {
		return nil, err
	}

	facilities, err := db.GetAllFacilities()
	if err != nil {
		return nil, err
	}

	partnerFacs := make(map[int64][]*models.FacilityModel)
	for _, f := range facilities {
		partnerFacs[f.PartnerID] = append(partnerFacs[f.PartnerID], f)
	}

	var targets []InvoiceTarget

	for _, p := range partners {
		facs, ok := partnerFacs[p.ID]
		if ok && len(facs) > 0 {
			// 시설이 있는 경우 각 시설을 독립적인 발행 대상으로 함
			for _, f := range facs {
				compName := f.CompanyName
				if compName == "" {
					compName = p.Name
				}
				email := f.Email
				if email == "" {
					email = p.Email
				}
				targets = append(targets, InvoiceTarget{
					ID:             fmt.Sprintf("fac_%d", f.ID),
					Type:           "facility",
					PartnerID:      p.ID,
					PartnerName:    p.Name,
					Name:           f.Name,
					CompanyName:    compName,
					BusinessNumber: p.BusinessNumber,
					Email:          email,
				})
			}
		} else {
			// 시설이 없는 경우 파트너 자체를 발행 대상으로 함 (사업자등록번호가 있는 경우)
			bizNum := strings.TrimSpace(p.BusinessNumber)
			if bizNum != "" {
				targets = append(targets, InvoiceTarget{
					ID:             fmt.Sprintf("part_%d", p.ID),
					Type:           "partner",
					PartnerID:      p.ID,
					PartnerName:    p.Name,
					Name:           p.Name,
					CompanyName:    p.Name,
					BusinessNumber: p.BusinessNumber,
					Email:          p.Email,
				})
			}
		}
	}

	return targets, nil
}
