package generator

// import (
// 	"bytes"
// 	"strings"

// 	"doc_job/document"

// 	unioffice_ss "github.com/unidoc/unioffice/spreadsheet"
// )

// // xlsxProcessor는 XlsxTemplateProcessor 인터페이스를 구현합니다.
// type xlsxProcessor struct{}

// // NewXlsxProcessor는 Excel용 프로세서를 생성합니다.
// func NewXlsxProcessor() document.XlsxTemplateProcessor {
// 	return &xlsxProcessor{}
// }

// // ProcessXlsx는 Excel 템플릿의 변수를 찾아 교체합니다.
// func (p *xlsxProcessor) ProcessXlsx(content []byte, data map[string]string) ([]byte, error) {
// 	reader := bytes.NewReader(content)
// 	wb, err := unioffice_ss.Read(reader, int64(len(content))) // wb = Workbook
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer wb.Close()

// 	// 모든 시트(Sheet)를 순회
// 	for _, sheet := range wb.Sheets() {
// 		// 모든 행(Row)을 순회
// 		for _, row := range sheet.Rows() {
// 			// 모든 셀(Cell)을 순회
// 			for _, cell := range row.Cells() {
// 				text := cell.GetFormattedValue()
// 				for key, value := range data {
// 					if strings.Contains(text, key) {
// 						text = strings.ReplaceAll(text, key, value)
// 					}
// 				}
// 				cell.SetString(text)
// 			}
// 		}
// 	}

// 	var buf bytes.Buffer
// 	if err := wb.Write(&buf); err != nil {
// 		return nil, err
// 	}
// 	return buf.Bytes(), nil
// }
