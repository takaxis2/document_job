package document

import (
	"context"
	"doc_job/db"
	"doc_job/models"
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
func (d *Document) GetAllPartners() ([]*models.PartnerModel, error) {
	return db.GetAllPartners()
}

func (d *Document) CreatePartner(partner *models.PartnerModel) error {
	return db.CreatePartner(partner)
}

func (d *Document) GetPartnerByID(id int64) (*models.PartnerModel, error) {
	return db.GetPartnerByID(id)
}

func (d *Document) UpdatePartner(partner *models.PartnerModel) error {
	return db.UpdatePartner(partner)
}

func (d *Document) DeletePartner(id int64) error {
	return db.DeletePartner(id)
}

// Template 관련 메서드들
func (d *Document) GetAllTemplates() ([]*models.TemplateModel, error) {
	return db.GetAllTemplates()
}

func (d *Document) CreateTemplate(template *models.TemplateModel) error {
	return db.CreateTemplate(template)
}

func (d *Document) GetTemplateByID(id int64) (*models.TemplateModel, error) {
	return db.GetTemplateByID(id)
}

func (d *Document) UpdateTemplate(template *models.TemplateModel) error {
	return db.UpdateTemplate(template)
}

func (d *Document) DeleteTemplate(id int64) error {
	return db.DeleteTemplate(id)
}
