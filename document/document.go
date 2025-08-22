package document

import (
	"context"
	"doc_job/db"
	"doc_job/models"
	"doc_job/preset"
	"log"
)

type Document struct {
	ctx context.Context
}

func NewDocument() *Document {
	return &Document{}
}

func (d *Document) Startup(ctx context.Context) {
	d.ctx = ctx

	// 데이터베이스 초기화
	if err := db.InitDatabase(); err != nil {
		log.Printf("데이터베이스 초기화 실패: %v", err)
	} else {
		log.Println("데이터베이스 초기화 성공")
	}
}

// 폴더 선택 다이얼로그 함수 - 컨텍스트를 직접 받음
func (d *Document) SelectDirectory() (string, error) {
	return selectDirectory(d.ctx)
}

// 폴더 트리 가져오기 함수
func (d *Document) GetFolderTree(path string) ([]FileSystemItem, error) {
	return getFolderTree(d.ctx, path)
}

func (d *Document) ProcessSelectedFiles(filePaths []string, destination string, replacements map[string]string) error {
	return processSelectedFiles(filePaths, destination, replacements)
}

// 데이터베이스 관련 메서드들
func (d *Document) GetAllDocuments() ([]*models.DocumentModel, error) {
	return db.GetAllDocuments()
}

func (d *Document) CreateDocument(doc *models.DocumentModel) error {
	return db.CreateDocument(doc)
}

func (d *Document) GetDocumentByID(id int64) (*models.DocumentModel, error) {
	return db.GetDocumentByID(id)
}

func (d *Document) UpdateDocument(doc *models.DocumentModel) error {
	return db.UpdateDocument(doc)
}

func (d *Document) DeleteDocument(id int64) error {
	return db.DeleteDocument(id)
}

// Partner 관련 메서드들
// func (d *Document) GetAllPartners() ([]*models.PartnerModel, error) {
// 	return db.GetAllPartners()
// }

// func (d *Document) CreatePartner(partner *models.PartnerModel) error {
// 	return db.CreatePartner(partner)
// }

// func (d *Document) GetPartnerByID(id int64) (*models.PartnerModel, error) {
// 	return db.GetPartnerByID(id)
// }

// func (d *Document) UpdatePartner(partner *models.PartnerModel) error {
// 	return db.UpdatePartner(partner)
// }

// func (d *Document) DeletePartner(id int64) error {
// 	return db.DeletePartner(id)
// }

// Template 관련 메서드들
// func (d *Document) GetAllTemplates() ([]*models.TemplateModel, error) {
// 	return db.GetAllTemplates()
// }

// func (d *Document) CreateTemplate(template *models.TemplateModel) error {
// 	return db.CreateTemplate(template)
// }

// func (d *Document) GetTemplateByID(id int64) (*models.TemplateModel, error) {
// 	return db.GetTemplateByID(id)
// }

// func (d *Document) UpdateTemplate(template *models.TemplateModel) error {
// 	return db.UpdateTemplate(template)
// }

// func (d *Document) DeleteTemplate(id int64) error {
// 	return db.DeleteTemplate(id)
// }

// Preset 교체 메서드들. 필요한가?
func (d *Document) ExtractVariables(content string) ([]preset.VariableInfo, error) {
	return preset.ExtractVariables(content)
}

func (d *Document) ValidateVariables(variables []string, replacements map[string]string) preset.ValidationResult {
	return preset.ValidateVariables(variables, replacements)
}

func (d *Document) ReplaceVariables(content string, replacements map[string]string) (string, error) {
	return preset.ReplaceVariables(content, replacements)
}

func (d *Document) GetUnreplacedVariables(content string, replacements map[string]string) []string {
	return preset.GetUnreplacedVariables(content, replacements)
}

func (d *Document) GetReplacementStatistics(content string, replacements map[string]string) map[string]int {
	return preset.GetReplacementStatistics(content, replacements)
}

// Preset 관련 메서드들
func (d *Document) CreatePreset(preset *models.PresetModel) error {
	return db.CreatePreset(preset)
}

func (d *Document) GetAllPresets() ([]*models.PresetModel, error) {
	return db.GetAllPresets()
}

func (d *Document) GetPresetByID(id int64) (*models.PresetModel, error) {
	return db.GetPresetByID(id)
}

func (d *Document) UpdatePreset(preset *models.PresetModel) error {
	return db.UpdatePreset(preset)
}

func (d *Document) DeletePreset(id int64) error {
	return db.DeletePreset(id)
}

// PresetItem 관련 메서드들
func (d *Document) CreatePresetItem(presetItem *models.PresetItem) error {
	return db.CreatePresetItem(presetItem)
}

func (d *Document) UpdatePresetItem(presetItem *models.PresetItem) error {
	return db.UpdatePresetItem(presetItem)
}

func (d *Document) DeletePresetItem(id int64) error {
	return db.DeletePresetItem(id)
}
