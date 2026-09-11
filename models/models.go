package models

import (
	"time"
)

// Document 모델
type DocumentModel struct {
	ID        int64     `json:"id"`
	FilePath  string    `json:"file_path"`
	FileName  string    `json:"file_name"`
	FileSize  int64     `json:"file_size"`
	FileType  string    `json:"file_type"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Partner 모델
type PartnerModel struct {
	ID             int64     `json:"id"`
	Name           string    `json:"name"`
	BusinessNumber string    `json:"business_number"`
	Company        string    `json:"company"`
	Email          string    `json:"email"`
	Phone          string    `json:"phone"`
	Address        string    `json:"address"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// PartnerNote 모델
type PartnerNoteModel struct {
	ID        int64     `json:"id"`
	PartnerID int64     `json:"partner_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Manager 모델
type ManagerModel struct {
	ID         int64      `json:"id"`
	PartnerID  int64      `json:"partner_id"`
	FacilityID *int64     `json:"facility_id"` // 특정 시설 소속일 경우 (선택)
	Name       string     `json:"name"`
	Position   string     `json:"position"`
	Department string     `json:"department"`
	Phone      string     `json:"phone"`
	Email      string     `json:"email"`
	IsPrimary  bool       `json:"is_primary"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// Template 모델
type TemplateModel struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	FilePath    string    `json:"file_path"`
	Variables   string    `json:"variables"` // JSON 형태로 변수 정보 저장
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Facility 모델
type FacilityModel struct {
	ID             int64     `json:"id"`
	PartnerID      int64     `json:"partner_id"`
	Name           string    `json:"name"`
	Representative string    `json:"representative"`
	CompanyName    string    `json:"company_name"`
	Address        string    `json:"address"`
	Email          string    `json:"email"`
	Phone          string    `json:"phone"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// FacilityDocument 모델
type FacilityDocumentModel struct {
	ID           int64     `json:"id"`
	FacilityID   int64     `json:"facility_id"`
	DocumentName string    `json:"document_name"`
	Description  string    `json:"description"`
	CreatedAt    time.Time `json:"created_at"`
}

// ProcessingHistory 모델
type ProcessingHistoryModel struct {
	ID         int64     `json:"id"`
	DocumentID int64     `json:"document_id"`
	TemplateID int64     `json:"template_id"`
	PartnerID  int64     `json:"partner_id"`
	FacilityID *int64    `json:"facility_id"` // 특정 시설 소속일 경우 (선택)
	OutputPath string    `json:"output_path"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

// Preset 모델
type PresetModel struct {
	ID          int64        `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Items       []PresetItem `json:"items"`
}

// PresetItem 모델
type PresetItem struct {
	ID          int64  `json:"id"`
	PresetID    int64  `json:"preset_id"`
	Key         string `json:"key"`
	Description string `json:"description"`
}

// category 모델
type CategoryModel struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

// Setting 모델
type SettingModel struct {
	Key         string    `json:"key"`
	Value       string    `json:"value"`
	Description string    `json:"description"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// InvoiceTemplate 모델
type InvoiceTemplateModel struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	TargetIDs   []string  `json:"target_ids"` // 템플릿에 포함된 대상 ID 목록 ("fac_1", "part_2" 등)
	CreatedAt   time.Time `json:"created_at"`
}


