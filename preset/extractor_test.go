package preset

import (
	"archive/zip"
	"bytes"
	"os"
	"path/filepath"
	"testing"

	"github.com/xuri/excelize/v2"
)

// createTestDocx creates a minimal valid docx file containing given text in word/document.xml
func createTestDocx(t *testing.T, filePath, bodyText string) {
	buf := new(bytes.Buffer)
	w := zip.NewWriter(buf)

	// [Content_Types].xml
	ct, err := w.Create("[Content_Types].xml")
	if err != nil {
		t.Fatalf("failed to create [Content_Types].xml: %v", err)
	}
	ct.Write([]byte(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`))

	// _rels/.rels
	rels, err := w.Create("_rels/.rels")
	if err != nil {
		t.Fatalf("failed to create _rels/.rels: %v", err)
	}
	rels.Write([]byte(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`))

	// word/document.xml
	docXml, err := w.Create("word/document.xml")
	if err != nil {
		t.Fatalf("failed to create word/document.xml: %v", err)
	}
	docXml.Write([]byte(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>` + bodyText + `</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`))

	if err := w.Close(); err != nil {
		t.Fatalf("failed to close zip: %v", err)
	}

	if err := os.WriteFile(filePath, buf.Bytes(), 0644); err != nil {
		t.Fatalf("failed to write test docx file: %v", err)
	}
}

func TestExtractVariablesFromXlsx(t *testing.T) {
	tempDir := t.TempDir()
	xlsxPath := filepath.Join(tempDir, "test.xlsx")

	f := excelize.NewFile()
	f.SetCellValue("Sheet1", "A1", "귀하: {{거래처명}}")
	f.SetCellValue("Sheet1", "B2", "계약일: {{계약일자}}, 대표: {{대표자명}}")
	f.SetCellValue("Sheet1", "C3", "반복: {{거래처명}}")
	if err := f.SaveAs(xlsxPath); err != nil {
		t.Fatalf("failed to save test excel: %v", err)
	}

	vars, err := ExtractVariablesFromXlsx(xlsxPath)
	if err != nil {
		t.Fatalf("ExtractVariablesFromXlsx failed: %v", err)
	}

	varMap := make(map[string]int)
	for _, v := range vars {
		varMap[v.Key] = v.Count
	}

	if varMap["거래처명"] != 2 {
		t.Errorf("expected 거래처명 count 2, got %d", varMap["거래처명"])
	}
	if varMap["계약일자"] != 1 {
		t.Errorf("expected 계약일자 count 1, got %d", varMap["계약일자"])
	}
	if varMap["대표자명"] != 1 {
		t.Errorf("expected 대표자명 count 1, got %d", varMap["대표자명"])
	}
}

func TestExtractVariablesFromDocx(t *testing.T) {
	tempDir := t.TempDir()
	docxPath := filepath.Join(tempDir, "test.docx")

	createTestDocx(t, docxPath, "계약서: {{회사명}} 담당자 {{담당자}} 확인 {{회사명}}")

	vars, err := ExtractVariablesFromDocx(docxPath)
	if err != nil {
		t.Fatalf("ExtractVariablesFromDocx failed: %v", err)
	}

	varMap := make(map[string]int)
	for _, v := range vars {
		varMap[v.Key] = v.Count
	}

	if varMap["회사명"] != 2 {
		t.Errorf("expected 회사명 count 2, got %d", varMap["회사명"])
	}
	if varMap["담당자"] != 1 {
		t.Errorf("expected 담당자 count 1, got %d", varMap["담당자"])
	}
}

func TestExtractVariablesFromFiles(t *testing.T) {
	tempDir := t.TempDir()
	docxPath := filepath.Join(tempDir, "test.docx")
	xlsxPath := filepath.Join(tempDir, "test.xlsx")

	createTestDocx(t, docxPath, "{{회사명}} {{계약금액}}")

	f := excelize.NewFile()
	f.SetCellValue("Sheet1", "A1", "{{회사명}} {{납품기한}}")
	f.SaveAs(xlsxPath)

	vars, err := ExtractVariablesFromFiles([]string{docxPath, xlsxPath})
	if err != nil {
		t.Fatalf("ExtractVariablesFromFiles failed: %v", err)
	}

	varMap := make(map[string]int)
	for _, v := range vars {
		varMap[v.Key] = v.Count
	}

	if varMap["회사명"] != 2 {
		t.Errorf("expected merged 회사명 count 2, got %d", varMap["회사명"])
	}
	if varMap["계약금액"] != 1 {
		t.Errorf("expected 계약금액 count 1, got %d", varMap["계약금액"])
	}
	if varMap["납품기한"] != 1 {
		t.Errorf("expected 납품기한 count 1, got %d", varMap["납품기한"])
	}
}
