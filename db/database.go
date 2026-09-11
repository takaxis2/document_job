package db

import (
	"database/sql"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"doc_job/models"

	_ "modernc.org/sqlite"
)

var db *sql.DB

// InitDatabase 데이터베이스 초기화

func InitDatabase() error {
	// 데이터베이스 파일 경로 설정
	dbPath := "documents.db"
	absPath, _ := filepath.Abs(dbPath)
	log.Printf("데이터베이스 파일 절대 경로: %s", absPath)

	// 데이터베이스 연결
	var err error
	db, err = sql.Open("sqlite", dbPath)
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
		business_number TEXT,
		company TEXT,
		email TEXT,
		phone TEXT,
		address TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// 파트너 특이사항/변동사항 노트 테이블
	createPartnerNotesTable := `
	CREATE TABLE IF NOT EXISTS partner_notes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		partner_id INTEGER NOT NULL,
		content TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE
	);`

	// 시설/사업장 정보 테이블
	createFacilitiesTable := `
	CREATE TABLE IF NOT EXISTS facilities (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		partner_id INTEGER NOT NULL,
		name TEXT NOT NULL,
		representative TEXT,
		company_name TEXT,
		address TEXT,
		email TEXT,
		phone TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE
	);`

	// 시설별 필요 서류 테이블
	createFacilityDocumentsTable := `
	CREATE TABLE IF NOT EXISTS facility_documents (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		facility_id INTEGER NOT NULL,
		document_name TEXT NOT NULL,
		description TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (facility_id) REFERENCES facilities (id) ON DELETE CASCADE
	);`

	// 담당자 정보 테이블
	createManagersTable := `
	CREATE TABLE IF NOT EXISTS managers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		partner_id INTEGER NOT NULL,
		facility_id INTEGER,
		name TEXT NOT NULL,
		position TEXT,
		department TEXT,
		phone TEXT,
		email TEXT,
		is_primary BOOLEAN DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE,
		FOREIGN KEY (facility_id) REFERENCES facilities (id) ON DELETE CASCADE
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
		facility_id INTEGER,
		output_path TEXT,
		status TEXT DEFAULT 'completed',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE,
		FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE SET NULL,
		FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE SET NULL,
		FOREIGN KEY (facility_id) REFERENCES facilities (id) ON DELETE SET NULL
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

	createSettingsTable := `
	CREATE TABLE IF NOT EXISTS settings (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL,
		description TEXT,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	createInvoiceTemplatesTable := `
	CREATE TABLE IF NOT EXISTS invoice_templates (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		description TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	createInvoiceTemplateTargetsTable := `
	CREATE TABLE IF NOT EXISTS invoice_template_targets (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		template_id INTEGER NOT NULL,
		target_id TEXT NOT NULL,
		FOREIGN KEY (template_id) REFERENCES invoice_templates (id) ON DELETE CASCADE
	);`

	// 테이블 생성 실행
	tables := []string{
		createDocumentsTable,
		createPartnersTable,
		createPartnerNotesTable,
		createFacilitiesTable,
		createFacilityDocumentsTable,
		createManagersTable,
		createTemplatesTable,
		createProcessingHistoryTable,
		createPresetModelTable,
		createPresetItemTable,
		createSettingsTable,
		createInvoiceTemplatesTable,
		createInvoiceTemplateTargetsTable,
	}

	for _, table := range tables {
		if _, err := db.Exec(table); err != nil {
			return fmt.Errorf("테이블 생성 오류: %v", err)
		}
	}

	// 기존 DB 컬럼 추가 마이그레이션
	if !columnExists("managers", "facility_id") {
		_, err := db.Exec("ALTER TABLE managers ADD COLUMN facility_id INTEGER REFERENCES facilities (id) ON DELETE CASCADE")
		if err != nil {
			log.Printf("managers 테이블 facility_id 컬럼 마이그레이션 실패: %v", err)
		} else {
			log.Println("managers 테이블 facility_id 컬럼 마이그레이션 성공")
		}
	}
	if !columnExists("processing_history", "facility_id") {
		_, err := db.Exec("ALTER TABLE processing_history ADD COLUMN facility_id INTEGER REFERENCES facilities (id) ON DELETE SET NULL")
		if err != nil {
			log.Printf("processing_history 테이블 facility_id 컬럼 마이그레이션 실패: %v", err)
		} else {
			log.Println("processing_history 테이블 facility_id 컬럼 마이그레이션 성공")
		}
	}

	// partners 테이블에 business_number 컬럼 마이그레이션
	if !columnExists("partners", "business_number") {
		_, err := db.Exec("ALTER TABLE partners ADD COLUMN business_number TEXT")
		if err != nil {
			log.Printf("partners 테이블 business_number 컬럼 마이그레이션 실패: %v", err)
		} else {
			log.Println("partners 테이블 business_number 컬럼 마이그레이션 성공")
		}
	}

	// 기본 설정값 초기화
	if err := initDefaultSettings(); err != nil {
		return fmt.Errorf("기본 설정값 초기화 실패: %v", err)
	}

	return nil
}

// columnExists SQLite 특정 테이블에 컬럼이 이미 존재하는지 확인하는 헬퍼 함수
func columnExists(tableName, columnName string) bool {
	rows, err := db.Query(fmt.Sprintf("PRAGMA table_info(%s)", tableName))
	if err != nil {
		return false
	}
	defer rows.Close()

	for rows.Next() {
		var cid int
		var name string
		var ctype string
		var notnull int
		var dfltValue interface{}
		var pk int
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dfltValue, &pk); err == nil {
			if name == columnName {
				return true
			}
		}
	}
	return false
}

// initDefaultSettings 기본 설정이 없을 경우 초기화
func initDefaultSettings() error {
	defaultSettings := []models.SettingModel{
		{Key: "default_input_path", Value: "", Description: "기본 파일/폴더 입력 경로"},
		{Key: "default_output_path", Value: "", Description: "파일 변환 결과물 기본 저장 경로"},
	}

	for _, setting := range defaultSettings {
		// 이미 존재하는지 확인
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM settings WHERE key = ?", setting.Key).Scan(&count)
		if err != nil {
			return err
		}

		if count == 0 {
			_, err = db.Exec("INSERT INTO settings (key, value, description, updated_at) VALUES (?, ?, ?, ?)",
				setting.Key, setting.Value, setting.Description, time.Now())
			if err != nil {
				return err
			}
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

	query := `INSERT INTO partners (name, business_number, company, email, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := tx.Exec(query, partner.Name, partner.BusinessNumber, partner.Company, partner.Email, partner.Phone, partner.Address, time.Now(), time.Now())
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
	query := `SELECT id, name, COALESCE(business_number,''), company, email, phone, address, created_at, updated_at FROM partners WHERE id = ?`
	partner := &models.PartnerModel{}
	err := db.QueryRow(query, id).Scan(
		&partner.ID, &partner.Name, &partner.BusinessNumber, &partner.Company, &partner.Email, &partner.Phone, &partner.Address, &partner.CreatedAt, &partner.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return partner, nil
}

func GetAllPartners() ([]*models.PartnerModel, error) {
	query := `SELECT id, name, COALESCE(business_number,''), company, email, phone, address, created_at, updated_at FROM partners ORDER BY created_at DESC`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var partners []*models.PartnerModel
	for rows.Next() {
		partner := &models.PartnerModel{}
		err := rows.Scan(
			&partner.ID, &partner.Name, &partner.BusinessNumber, &partner.Company, &partner.Email, &partner.Phone, &partner.Address, &partner.CreatedAt, &partner.UpdatedAt,
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

	query := `UPDATE partners SET name = ?, business_number = ?, company = ?, email = ?, phone = ?, address = ?, updated_at = ? WHERE id = ?`
	_, err = tx.Exec(query, partner.Name, partner.BusinessNumber, partner.Company, partner.Email, partner.Phone, partner.Address, time.Now(), partner.ID)
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

// Partner Note CRUD 작업
func CreatePartnerNote(note *models.PartnerNoteModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO partner_notes (partner_id, content, created_at, updated_at) VALUES (?, ?, ?, ?)`
	result, err := tx.Exec(query, note.PartnerID, note.Content, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	note.ID = id

	return tx.Commit()
}

func GetPartnerNotesByPartnerID(partnerID int64) ([]*models.PartnerNoteModel, error) {
	query := `SELECT id, partner_id, content, created_at, updated_at FROM partner_notes WHERE partner_id = ? ORDER BY created_at DESC`
	rows, err := db.Query(query, partnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*models.PartnerNoteModel
	for rows.Next() {
		note := &models.PartnerNoteModel{}
		err := rows.Scan(
			&note.ID, &note.PartnerID, &note.Content, &note.CreatedAt, &note.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		notes = append(notes, note)
	}
	return notes, nil
}

func UpdatePartnerNote(note *models.PartnerNoteModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE partner_notes SET content = ?, updated_at = ? WHERE id = ?`
	_, err = tx.Exec(query, note.Content, time.Now(), note.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func DeletePartnerNote(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `DELETE FROM partner_notes WHERE id = ?`
	_, err = tx.Exec(query, id)
	if err != nil {
		return err
	}
	return tx.Commit()
}

// Manager CRUD 작업
func CreateManager(manager *models.ManagerModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO managers (partner_id, facility_id, name, position, department, phone, email, is_primary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := tx.Exec(query, manager.PartnerID, manager.FacilityID, manager.Name, manager.Position, manager.Department, manager.Phone, manager.Email, manager.IsPrimary, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	manager.ID = id

	return tx.Commit()
}

func GetManagerByID(id int64) (*models.ManagerModel, error) {
	query := `SELECT id, partner_id, facility_id, name, position, department, phone, email, is_primary, created_at, updated_at FROM managers WHERE id = ?`
	manager := &models.ManagerModel{}
	err := db.QueryRow(query, id).Scan(
		&manager.ID, &manager.PartnerID, &manager.FacilityID, &manager.Name, &manager.Position, &manager.Department, &manager.Phone, &manager.Email, &manager.IsPrimary, &manager.CreatedAt, &manager.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return manager, nil
}

func GetManagersByPartnerID(partnerID int64) ([]*models.ManagerModel, error) {
	query := `SELECT id, partner_id, facility_id, name, position, department, phone, email, is_primary, created_at, updated_at FROM managers WHERE partner_id = ? ORDER BY created_at DESC`
	rows, err := db.Query(query, partnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var managers []*models.ManagerModel
	for rows.Next() {
		manager := &models.ManagerModel{}
		err := rows.Scan(
			&manager.ID, &manager.PartnerID, &manager.FacilityID, &manager.Name, &manager.Position, &manager.Department, &manager.Phone, &manager.Email, &manager.IsPrimary, &manager.CreatedAt, &manager.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		managers = append(managers, manager)
	}
	return managers, nil
}

func GetManagersByFacilityID(facilityID int64) ([]*models.ManagerModel, error) {
	query := `SELECT id, partner_id, facility_id, name, position, department, phone, email, is_primary, created_at, updated_at FROM managers WHERE facility_id = ? ORDER BY created_at DESC`
	rows, err := db.Query(query, facilityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var managers []*models.ManagerModel
	for rows.Next() {
		manager := &models.ManagerModel{}
		err := rows.Scan(
			&manager.ID, &manager.PartnerID, &manager.FacilityID, &manager.Name, &manager.Position, &manager.Department, &manager.Phone, &manager.Email, &manager.IsPrimary, &manager.CreatedAt, &manager.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		managers = append(managers, manager)
	}
	return managers, nil
}

func GetAllManagers() ([]*models.ManagerModel, error) {
	query := `SELECT id, partner_id, facility_id, name, position, department, phone, email, is_primary, created_at, updated_at FROM managers ORDER BY created_at DESC`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var managers []*models.ManagerModel
	for rows.Next() {
		manager := &models.ManagerModel{}
		err := rows.Scan(
			&manager.ID, &manager.PartnerID, &manager.FacilityID, &manager.Name, &manager.Position, &manager.Department, &manager.Phone, &manager.Email, &manager.IsPrimary, &manager.CreatedAt, &manager.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		managers = append(managers, manager)
	}
	return managers, nil
}

func UpdateManager(manager *models.ManagerModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE managers SET partner_id = ?, facility_id = ?, name = ?, position = ?, department = ?, phone = ?, email = ?, is_primary = ?, updated_at = ? WHERE id = ?`
	_, err = tx.Exec(query, manager.PartnerID, manager.FacilityID, manager.Name, manager.Position, manager.Department, manager.Phone, manager.Email, manager.IsPrimary, time.Now(), manager.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func DeleteManager(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `DELETE FROM managers WHERE id = ?`
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

// Settings CRUD 작업
func GetSettingByKey(key string) (*models.SettingModel, error) {
	query := `SELECT key, value, description, updated_at FROM settings WHERE key = ?`
	setting := &models.SettingModel{}
	err := db.QueryRow(query, key).Scan(&setting.Key, &setting.Value, &setting.Description, &setting.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("설정을 찾을 수 없습니다: %s", key)
		}
		return nil, err
	}
	return setting, nil
}

func GetAllSettings() ([]*models.SettingModel, error) {
	query := `SELECT key, value, description, updated_at FROM settings`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var settings []*models.SettingModel
	for rows.Next() {
		setting := &models.SettingModel{}
		err := rows.Scan(&setting.Key, &setting.Value, &setting.Description, &setting.UpdatedAt)
		if err != nil {
			return nil, err
		}
		settings = append(settings, setting)
	}
	return settings, nil
}

func UpdateSetting(setting *models.SettingModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE settings SET value = ?, description = ?, updated_at = ? WHERE key = ?`
	_, err = tx.Exec(query, setting.Value, setting.Description, time.Now(), setting.Key)
	if err != nil {
		return err
	}
	return tx.Commit()
}

// Facility CRUD 작업
func CreateFacility(facility *models.FacilityModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO facilities (partner_id, name, representative, company_name, address, email, phone, created_at, updated_at) 
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
	result, err := tx.Exec(query, facility.PartnerID, facility.Name, facility.Representative, facility.CompanyName, facility.Address, facility.Email, facility.Phone, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	facility.ID = id

	return tx.Commit()
}

func GetFacilityByID(id int64) (*models.FacilityModel, error) {
	query := `SELECT id, partner_id, name, representative, company_name, address, email, phone, created_at, updated_at FROM facilities WHERE id = ?`
	facility := &models.FacilityModel{}
	err := db.QueryRow(query, id).Scan(
		&facility.ID, &facility.PartnerID, &facility.Name, &facility.Representative, &facility.CompanyName, &facility.Address, &facility.Email, &facility.Phone, &facility.CreatedAt, &facility.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return facility, nil
}

func GetFacilitiesByPartnerID(partnerID int64) ([]*models.FacilityModel, error) {
	query := `SELECT id, partner_id, name, representative, company_name, address, email, phone, created_at, updated_at FROM facilities WHERE partner_id = ? ORDER BY name ASC`
	rows, err := db.Query(query, partnerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var facilities []*models.FacilityModel
	for rows.Next() {
		facility := &models.FacilityModel{}
		err := rows.Scan(
			&facility.ID, &facility.PartnerID, &facility.Name, &facility.Representative, &facility.CompanyName, &facility.Address, &facility.Email, &facility.Phone, &facility.CreatedAt, &facility.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		facilities = append(facilities, facility)
	}
	return facilities, nil
}

func UpdateFacility(facility *models.FacilityModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE facilities SET name = ?, representative = ?, company_name = ?, address = ?, email = ?, phone = ?, updated_at = ? WHERE id = ?`
	_, err = tx.Exec(query, facility.Name, facility.Representative, facility.CompanyName, facility.Address, facility.Email, facility.Phone, time.Now(), facility.ID)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func DeleteFacility(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `DELETE FROM facilities WHERE id = ?`
	_, err = tx.Exec(query, id)
	if err != nil {
		return err
	}
	return tx.Commit()
}

// FacilityDocument CRUD 작업
func SaveFacilityDocuments(facilityID int64, docs []string) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 기존 서류 항목들 삭제
	_, err = tx.Exec(`DELETE FROM facility_documents WHERE facility_id = ?`, facilityID)
	if err != nil {
		return err
	}

	// 새 서류 항목들 추가
	query := `INSERT INTO facility_documents (facility_id, document_name, description, created_at) VALUES (?, ?, ?, ?)`
	for _, docName := range docs {
		_, err = tx.Exec(query, facilityID, docName, "", time.Now())
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func GetFacilityDocumentsByFacilityID(facilityID int64) ([]*models.FacilityDocumentModel, error) {
	query := `SELECT id, facility_id, document_name, description, created_at FROM facility_documents WHERE facility_id = ? ORDER BY id ASC`
	rows, err := db.Query(query, facilityID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []*models.FacilityDocumentModel
	for rows.Next() {
		doc := &models.FacilityDocumentModel{}
		err := rows.Scan(&doc.ID, &doc.FacilityID, &doc.DocumentName, &doc.Description, &doc.CreatedAt)
		if err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}
	return docs, nil
}

func GetAllFacilities() ([]*models.FacilityModel, error) {
	query := `SELECT id, partner_id, name, representative, company_name, address, email, phone, created_at, updated_at FROM facilities ORDER BY name ASC`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var facilities []*models.FacilityModel
	for rows.Next() {
		facility := &models.FacilityModel{}
		err := rows.Scan(
			&facility.ID, &facility.PartnerID, &facility.Name, &facility.Representative, &facility.CompanyName, &facility.Address, &facility.Email, &facility.Phone, &facility.CreatedAt, &facility.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		facilities = append(facilities, facility)
	}
	return facilities, nil
}

// Invoice Template CRUD Operations

func CreateInvoiceTemplate(t *models.InvoiceTemplateModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO invoice_templates (name, description, created_at) VALUES (?, ?, ?)`
	res, err := tx.Exec(query, t.Name, t.Description, time.Now())
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	t.ID = id

	targetQuery := `INSERT INTO invoice_template_targets (template_id, target_id) VALUES (?, ?)`
	for _, targetID := range t.TargetIDs {
		_, err = tx.Exec(targetQuery, t.ID, targetID)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

func GetAllInvoiceTemplates() ([]*models.InvoiceTemplateModel, error) {
	query := `SELECT id, name, description, created_at FROM invoice_templates ORDER BY id DESC`
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	templates := make([]*models.InvoiceTemplateModel, 0)
	for rows.Next() {
		t := &models.InvoiceTemplateModel{}
		var createdAtStr string
		err := rows.Scan(&t.ID, &t.Name, &t.Description, &createdAtStr)
		if err != nil {
			return nil, err
		}
		
		t.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
		if t.CreatedAt.IsZero() {
			t.CreatedAt, _ = time.Parse(time.RFC3339, createdAtStr)
		}

		targetIDs, err := GetInvoiceTemplateTargetIDs(t.ID)
		if err != nil {
			return nil, err
		}
		t.TargetIDs = targetIDs
		templates = append(templates, t)
	}
	return templates, nil
}

func GetInvoiceTemplateTargetIDs(templateID int64) ([]string, error) {
	query := `SELECT target_id FROM invoice_template_targets WHERE template_id = ?`
	rows, err := db.Query(query, templateID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ids := make([]string, 0)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func UpdateInvoiceTemplate(t *models.InvoiceTemplateModel) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE invoice_templates SET name = ?, description = ? WHERE id = ?`
	_, err = tx.Exec(query, t.Name, t.Description, t.ID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM invoice_template_targets WHERE template_id = ?`, t.ID)
	if err != nil {
		return err
	}

	targetQuery := `INSERT INTO invoice_template_targets (template_id, target_id) VALUES (?, ?)`
	for _, targetID := range t.TargetIDs {
		_, err = tx.Exec(targetQuery, t.ID, targetID)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

func DeleteInvoiceTemplate(id int64) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.Exec(`DELETE FROM invoice_templates WHERE id = ?`, id)
	if err != nil {
		return err
	}
	return tx.Commit()
}



