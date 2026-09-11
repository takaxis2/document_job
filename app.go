package main

import (
	"context"
	"fmt"
	"doc_job/db"
	"doc_job/models"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// Manager Operations

func (a *App) CreateManager(manager models.ManagerModel) (models.ManagerModel, error) {
	err := db.CreateManager(&manager)
	return manager, err
}

func (a *App) GetManagerByID(id int64) (*models.ManagerModel, error) {
	return db.GetManagerByID(id)
}

func (a *App) GetManagersByPartnerID(partnerID int64) ([]*models.ManagerModel, error) {
	return db.GetManagersByPartnerID(partnerID)
}

func (a *App) GetAllManagers() ([]*models.ManagerModel, error) {
	return db.GetAllManagers()
}

func (a *App) UpdateManager(manager models.ManagerModel) error {
	return db.UpdateManager(&manager)
}

func (a *App) DeleteManager(id int64) error {
	return db.DeleteManager(id)
}

// Setting Operations

func (a *App) GetSettingByKey(key string) (*models.SettingModel, error) {
	return db.GetSettingByKey(key)
}

func (a *App) GetAllSettings() ([]*models.SettingModel, error) {
	return db.GetAllSettings()
}

func (a *App) UpdateSetting(setting models.SettingModel) error {
	return db.UpdateSetting(&setting)
}

// Partner Note Operations

func (a *App) CreatePartnerNote(note models.PartnerNoteModel) (models.PartnerNoteModel, error) {
	err := db.CreatePartnerNote(&note)
	return note, err
}

func (a *App) GetPartnerNotesByPartnerID(partnerID int64) ([]*models.PartnerNoteModel, error) {
	return db.GetPartnerNotesByPartnerID(partnerID)
}

func (a *App) UpdatePartnerNote(note models.PartnerNoteModel) error {
	return db.UpdatePartnerNote(&note)
}

func (a *App) DeletePartnerNote(id int64) error {
	return db.DeletePartnerNote(id)
}

// Facility Operations

func (a *App) CreateFacility(facility models.FacilityModel) (models.FacilityModel, error) {
	err := db.CreateFacility(&facility)
	return facility, err
}

func (a *App) GetFacilityByID(id int64) (*models.FacilityModel, error) {
	return db.GetFacilityByID(id)
}

func (a *App) GetFacilitiesByPartnerID(partnerID int64) ([]*models.FacilityModel, error) {
	return db.GetFacilitiesByPartnerID(partnerID)
}

func (a *App) UpdateFacility(facility models.FacilityModel) error {
	return db.UpdateFacility(&facility)
}

func (a *App) DeleteFacility(id int64) error {
	return db.DeleteFacility(id)
}

// Facility Document Operations

func (a *App) SaveFacilityDocuments(facilityID int64, docs []string) error {
	return db.SaveFacilityDocuments(facilityID, docs)
}

func (a *App) GetFacilityDocumentsByFacilityID(facilityID int64) ([]*models.FacilityDocumentModel, error) {
	return db.GetFacilityDocumentsByFacilityID(facilityID)
}

func (a *App) GetManagersByFacilityID(facilityID int64) ([]*models.ManagerModel, error) {
	return db.GetManagersByFacilityID(facilityID)
}

// Partner Operations

func (a *App) GetAllPartners() ([]*models.PartnerModel, error) {
	return db.GetAllPartners()
}

func (a *App) CreatePartner(partner models.PartnerModel) (models.PartnerModel, error) {
	err := db.CreatePartner(&partner)
	return partner, err
}

func (a *App) GetPartnerByID(id int64) (*models.PartnerModel, error) {
	return db.GetPartnerByID(id)
}

func (a *App) UpdatePartner(partner models.PartnerModel) error {
	return db.UpdatePartner(&partner)
}

func (a *App) DeletePartner(id int64) error {
	return db.DeletePartner(id)
}
