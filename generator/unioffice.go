package generator

import (
	// "byte"
	"fmt"
	// "io"
	// "strings"

	"doc_job/document"

	"github.com/unidoc/unioffice/common/license"
	// unioffice_doc "github.com/unidoc/unioffice/document"
)

func init() {
	err := license.SetMeteredKey(`18952d7a124531b26ea5b7b328353891298018861f422333623a08d45c382c79`)
	if err != nil {
		fmt.Errorf("failed to set unioffice license: %v", err)
	}
}

type uniofficeProcessor struct{}

func New() document.TemplateProcessor {
	return &uniofficeProcessor{}
}

func (u *uniofficeProcessor) Process(content []byte, data map[string]string) ([]byte, error) {
	return nil, nil
}
