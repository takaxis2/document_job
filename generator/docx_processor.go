package generator

// import (
// 	"bytes"
// 	"fmt"
// 	"strings"

// 	"doc_job/document"

// 	"github.com/unidoc/unioffice/common/license"
// 	unioffice_doc "github.com/unidoc/unioffice/document"
// )

// // init 함수는 패키지 로드 시 한 번만 실행됩니다.
// // 여러 파일에 있더라도 generator 패키지 전체에서 한 번만 실행되므로
// // 여기에 라이선스 키 설정을 유지하는 것이 좋습니다.
// func init() {
// 	err := license.SetMeteredKey(`18952d7a124531b26ea5b7b328353891298018861f422333623a08d45c382c79`)
// 	if err != nil {
// 		fmt.Errorf("Failed to set Unioffice license key: %v", err)
// 	}
// }

// // docxProcessor는 DocxTemplateProcessor 인터페이스를 구현합니다.
// type docxProcessor struct{}

// // NewDocxProcessor는 Word용 프로세서를 생성합니다.
// func NewDocxProcessor() document.DocxTemplateProcessor {
// 	return &docxProcessor{}
// }

// // ProcessDocx는 Word 템플릿의 변수를 찾아 교체합니다.
// func (p *docxProcessor) ProcessDocx(content []byte, data map[string]string) ([]byte, error) {
// 	reader := bytes.NewReader(content)
// 	doc, err := unioffice_doc.Read(reader, int64(len(content)))
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer doc.Close()

// 	for _, para := range doc.Paragraphs() {
// 		for _, run := range para.Runs() {
// 			text := run.Text()
// 			for key, value := range data {
// 				if strings.Contains(text, key) {
// 					text = strings.ReplaceAll(text, key, value)
// 				}
// 			}
// 			run.SetText(text)
// 		}
// 	}

// 	var buf bytes.Buffer
// 	if err := doc.WriteTo(&buf); err != nil {
// 		return nil, err
// 	}
// 	return buf.Bytes(), nil
// }
