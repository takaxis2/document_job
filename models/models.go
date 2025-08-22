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
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Company   string    `json:"company"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
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

// ProcessingHistory 모델
type ProcessingHistoryModel struct {
	ID         int64     `json:"id"`
	DocumentID int64     `json:"document_id"`
	TemplateID int64     `json:"template_id"`
	PartnerID  int64     `json:"partner_id"`
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
