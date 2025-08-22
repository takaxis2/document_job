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
		FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
		FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE SET NULL,
		FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE SET NULL
	);`

	createPresetModelTable := `
	CREATE TABLE IF NOT EXISTS presets (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	createPresetItemTable := `
	CREATE TABLE IF NOT EXISTS preset_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		preset_id INTEGER,
		key TEXT NOT NULL,
		description TEXT,
		FOREIGN KEY (preset_id) REFERENCES presets (id) ON DELETE CASCADE
	);`

	// 테이블 생성 실행
	tables := []string{
		createDocumentsTable,
		createPartnersTable,
		createTemplatesTable,
		createProcessingHistoryTable,
		createPresetModelTable,
		createPresetItemTable,
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
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO documents (file_path, file_name, file_size, file_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := tx.Exec(query, doc.FilePath, doc.FileName, doc.FileSize, doc.FileType, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	doc.ID = id

	return tx.Commit()
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
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE documents SET file_path = ?, file_name = ?, file_size = ?, file_type = ?, updated_at = ? WHERE id = ?`
	_, err = tx.Exec(query, doc.FilePath, doc.FileName, doc.FileSize, doc.FileType, time.Now(), doc.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func DeleteDocument(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `DELETE FROM documents WHERE id = ?`
	_, err = tx.Exec(query, id)
	if err != nil {
		return err
	}
	return tx.Commit()
}

// Partner CRUD 작업
func CreatePartner(partner *models.PartnerModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO partners (name, company, email, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
	result, err := tx.Exec(query, partner.Name, partner.Company, partner.Email, partner.Phone, partner.Address, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	partner.ID = id

	return tx.Commit()
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
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE partners SET name = ?, company = ?, email = ?, phone = ?, address = ?, updated_at = ? WHERE id = ?`
	_, err = tx.Exec(query, partner.Name, partner.Company, partner.Email, partner.Phone, partner.Address, time.Now(), partner.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func DeletePartner(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `DELETE FROM partners WHERE id = ?`
	_, err = tx.Exec(query, id)
	if err != nil {
		return err
	}
	return tx.Commit()
}

// Template CRUD 작업
func CreateTemplate(template *models.TemplateModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO templates (name, description, file_path, variables, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := tx.Exec(query, template.Name, template.Description, template.FilePath, template.Variables, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	template.ID = id

	return tx.Commit()
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
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE templates SET name = ?, description = ?, file_path = ?, variables = ?, updated_at = ? WHERE id = ?`
	_, err = tx.Exec(query, template.Name, template.Description, template.FilePath, template.Variables, time.Now(), template.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func DeleteTemplate(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `DELETE FROM templates WHERE id = ?`
	_, err = tx.Exec(query, id)
	if err != nil {
		return err
	}
	return tx.Commit()
}

// Preset CRUD
func CreatePreset(preset *models.PresetModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO presets (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)`
	result, err := tx.Exec(query, preset.Name, preset.Description, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	preset.ID = id

	for _, item := range preset.Items {
		item.PresetID = preset.ID
		if err := CreatePresetItem(&item); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func GetPresetByID(id int64) (*models.PresetModel, error) {
	preset := &models.PresetModel{}
	query := `SELECT id, name, description, created_at, updated_at FROM presets WHERE id = ?`
	err := db.QueryRow(query, id).Scan(&preset.ID, &preset.Name, &preset.Description)
	if err != nil {
		return nil, err
	}

	items, err := GetPresetItemsByPresetID(id)
	if err != nil {
		return nil, err
	}
	preset.Items = items

	return preset, nil
}

func GetAllPresets() ([]*models.PresetModel, error) {
	query := `SELECT id, name, description FROM presets ORDER BY created_at DESC`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	presets := make([]*models.PresetModel, 0)
	for rows.Next() {
		preset := &models.PresetModel{}
		err := rows.Scan(&preset.ID, &preset.Name, &preset.Description)
		if err != nil {
			return nil, err
		}

		items, err := GetPresetItemsByPresetID(preset.ID)
		if err != nil {
			return nil, err
		}
		preset.Items = items
		presets = append(presets, preset)
	}
	log.Println(presets)

	return presets, nil
}

func UpdatePreset(preset *models.PresetModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() // Rollback on error

	query := `UPDATE presets SET name = ?, description = ?, updated_at = ? WHERE id = ?`
	_, err = tx.Exec(query, preset.Name, preset.Description, time.Now(), preset.ID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM preset_items WHERE preset_id = ?`, preset.ID)
	if err != nil {
		return err
	}

	itemQuery := `INSERT INTO preset_items (preset_id, key, description) VALUES (?, ?, ?)`
	for _, item := range preset.Items {
		item.PresetID = preset.ID
		result, err := tx.Exec(itemQuery, item.PresetID, item.Key, item.Description)
		if err != nil {
			return err
		}
		id, err := result.LastInsertId()
		if err != nil {
			return err
		}
		item.ID = id
	}

	return tx.Commit()
}

func DeletePreset(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`DELETE FROM presets WHERE id = ?`, id)
	if err != nil {
		return err
	}
	return tx.Commit()
}

// PresetItem CRUD
func CreatePresetItem(presetItem *models.PresetItem) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO preset_items (preset_id, key, description) VALUES (?, ?, ?)`
	result, err := tx.Exec(query, presetItem.PresetID, presetItem.Key, presetItem.Description)
	if err != nil {
		return err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	presetItem.ID = id

	return tx.Commit()
}

func GetPresetItemByID(id int64) (*models.PresetItem, error) {
	query := `SELECT id, preset_id, key, description FROM preset_items WHERE id = ?`
	item := &models.PresetItem{}
	err := db.QueryRow(query, id).Scan(&item.ID, &item.PresetID, &item.Key, &item.Description)
	if err != nil {
		return nil, err
	}
	return item, nil
}

func GetPresetItemsByPresetID(presetID int64) ([]models.PresetItem, error) {
	query := `SELECT id, preset_id, key, description FROM preset_items WHERE preset_id = ?`
	rows, err := db.Query(query, presetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.PresetItem, 0)
	for rows.Next() {
		var item models.PresetItem
		if err := rows.Scan(&item.ID, &item.PresetID, &item.Key, &item.Description); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func GetAllPresetItems() ([]*models.PresetItem, error) { return nil, nil }

func UpdatePresetItem(presetItem *models.PresetItem) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE preset_items SET key = ?, description = ? WHERE id = ?`
	_, err = tx.Exec(query, presetItem.Key, presetItem.Description, presetItem.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func DeletePresetItem(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `DELETE FROM preset_items WHERE id = ?`
	_, err = tx.Exec(query, id)
	if err != nil {
		return err
	}
	return tx.Commit()
}
