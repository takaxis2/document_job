package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"doc_job/models"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

// InitDatabase 데이터베이스 초기화

func InitDatabase() error {
	// 데이터베이스 파일 경로 설정
	dbPath := "documents.db"

	// 데이터베이스 연결
	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("데이터베이스 연결 실패: %v", err)
	}

	// 연결 테스트
	if err := db.Ping(); err != nil {
		return fmt.Errorf("데이터베이스 연결 테스트 실패: %v", err)
	}

	// 테이블 생성
	if err := createTables(); err != nil {
		return fmt.Errorf("테이블 생성 실패: %v", err)
	}

	log.Println("SQLite 데이터베이스 초기화 완료")
	return nil
}

// createTables 필요한 테이블들을 생성
func createTables() error {
	// 문서 정보 테이블
	createDocumentsTable := `
	CREATE TABLE IF NOT EXISTS documents (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		file_path TEXT NOT NULL UNIQUE,
		file_name TEXT NOT NULL,
		file_size INTEGER,
		file_type TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// 파트너 정보 테이블
	createPartnersTable := `
	CREATE TABLE IF NOT EXISTS partners (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		company TEXT,
		email TEXT,
		phone TEXT,
		address TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// 템플릿 정보 테이블
	createTemplatesTable := `
	CREATE TABLE IF NOT EXISTS templates (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT,
		file_path TEXT NOT NULL,
		variables TEXT, -- JSON 형태로 변수 정보 저장
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// 처리 이력 테이블
	createProcessingHistoryTable := `
	CREATE TABLE IF NOT EXISTS processing_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		document_id INTEGER,
		template_id INTEGER,
		partner_id INTEGER,
		output_path TEXT,
		status TEXT DEFAULT 'completed',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (document_id) REFERENCES documents (id),
		FOREIGN KEY (template_id) REFERENCES templates (id),
		FOREIGN KEY (partner_id) REFERENCES partners (id)
	);`

	// 테이블 생성 실행
	tables := []string{
		createDocumentsTable,
		createPartnersTable,
		createTemplatesTable,
		createProcessingHistoryTable,
	}

	for _, table := range tables {
		if _, err := db.Exec(table); err != nil {
			return fmt.Errorf("테이블 생성 오류: %v", err)
		}
	}

	return nil
}

// CloseDatabase 데이터베이스 연결 종료
func CloseDatabase() error {
	if db != nil {
		return db.Close()
	}
	return nil
}

// GetDB 데이터베이스 인스턴스 반환
func GetDB() *sql.DB {
	return db
}

// Document CRUD 작업
func CreateDocument(doc *models.DocumentModel) error {
	query := `
		INSERT INTO documents (file_path, file_name, file_size, file_type, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := db.Exec(query, doc.FilePath, doc.FileName, doc.FileSize, doc.FileType, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	doc.ID = id
	return nil
}

func GetDocumentByID(id int64) (*models.DocumentModel, error) {
	query := `SELECT id, file_path, file_name, file_size, file_type, created_at, updated_at FROM documents WHERE id = ?`

	doc := &models.DocumentModel{}
	err := db.QueryRow(query, id).Scan(
		&doc.ID, &doc.FilePath, &doc.FileName, &doc.FileSize, &doc.FileType, &doc.CreatedAt, &doc.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return doc, nil
}

func GetAllDocuments() ([]*models.DocumentModel, error) {
	query := `SELECT id, file_path, file_name, file_size, file_type, created_at, updated_at FROM documents ORDER BY created_at DESC`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var documents []*models.DocumentModel
	for rows.Next() {
		doc := &models.DocumentModel{}
		err := rows.Scan(
			&doc.ID, &doc.FilePath, &doc.FileName, &doc.FileSize, &doc.FileType, &doc.CreatedAt, &doc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		documents = append(documents, doc)
	}

	return documents, nil
}

func UpdateDocument(doc *models.DocumentModel) error {
	query := `
		UPDATE documents 
		SET file_path = ?, file_name = ?, file_size = ?, file_type = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := db.Exec(query, doc.FilePath, doc.FileName, doc.FileSize, doc.FileType, time.Now(), doc.ID)
	return err
}

func DeleteDocument(id int64) error {
	query := `DELETE FROM documents WHERE id = ?`
	_, err := db.Exec(query, id)
	return err
}

// Partner CRUD 작업
func CreatePartner(partner *models.PartnerModel) error {
	query := `
		INSERT INTO partners (name, company, email, phone, address, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	result, err := db.Exec(query, partner.Name, partner.Company, partner.Email, partner.Phone, partner.Address, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	partner.ID = id
	return nil
}

func GetPartnerByID(id int64) (*models.PartnerModel, error) {
	query := `SELECT id, name, company, email, phone, address, created_at, updated_at FROM partners WHERE id = ?`

	partner := &models.PartnerModel{}
	err := db.QueryRow(query, id).Scan(
		&partner.ID, &partner.Name, &partner.Company, &partner.Email, &partner.Phone, &partner.Address, &partner.CreatedAt, &partner.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return partner, nil
}

func GetAllPartners() ([]*models.PartnerModel, error) {
	query := `SELECT id, name, company, email, phone, address, created_at, updated_at FROM partners ORDER BY created_at DESC`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var partners []*models.PartnerModel
	for rows.Next() {
		partner := &models.PartnerModel{}
		err := rows.Scan(
			&partner.ID, &partner.Name, &partner.Company, &partner.Email, &partner.Phone, &partner.Address, &partner.CreatedAt, &partner.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		partners = append(partners, partner)
	}

	return partners, nil
}

func UpdatePartner(partner *models.PartnerModel) error {
	query := `
		UPDATE partners 
		SET name = ?, company = ?, email = ?, phone = ?, address = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := db.Exec(query, partner.Name, partner.Company, partner.Email, partner.Phone, partner.Address, time.Now(), partner.ID)
	return err
}

func DeletePartner(id int64) error {
	query := `DELETE FROM partners WHERE id = ?`
	_, err := db.Exec(query, id)
	return err
}

// Template CRUD 작업
func CreateTemplate(template *models.TemplateModel) error {
	query := `
		INSERT INTO templates (name, description, file_path, variables, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := db.Exec(query, template.Name, template.Description, template.FilePath, template.Variables, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	template.ID = id
	return nil
}

func GetTemplateByID(id int64) (*models.TemplateModel, error) {
	query := `SELECT id, name, description, file_path, variables, created_at, updated_at FROM templates WHERE id = ?`

	template := &models.TemplateModel{}
	err := db.QueryRow(query, id).Scan(
		&template.ID, &template.Name, &template.Description, &template.FilePath, &template.Variables, &template.CreatedAt, &template.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return template, nil
}

func GetAllTemplates() ([]*models.TemplateModel, error) {
	query := `SELECT id, name, description, file_path, variables, created_at, updated_at FROM templates ORDER BY created_at DESC`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var templates []*models.TemplateModel
	for rows.Next() {
		template := &models.TemplateModel{}
		err := rows.Scan(
			&template.ID, &template.Name, &template.Description, &template.FilePath, &template.Variables, &template.CreatedAt, &template.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		templates = append(templates, template)
	}

	return templates, nil
}

func UpdateTemplate(template *models.TemplateModel) error {
	query := `
		UPDATE templates 
		SET name = ?, description = ?, file_path = ?, variables = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := db.Exec(query, template.Name, template.Description, template.FilePath, template.Variables, time.Now(), template.ID)
	return err
}

func DeleteTemplate(id int64) error {
	query := `DELETE FROM templates WHERE id = ?`
	_, err := db.Exec(query, id)
	return err
}
