package preset

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

// Preset 프리셋 정보
type Preset struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Category    string            `json:"category"`
	Variables   map[string]string `json:"variables"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

// PresetManager 프리셋 관리자
type PresetManager struct {
	presets map[string]*Preset
}

// NewPresetManager 새로운 프리셋 관리자를 생성합니다
func NewPresetManager() *PresetManager {
	return &PresetManager{
		presets: make(map[string]*Preset),
	}
}

// CreatePreset 새로운 프리셋을 생성합니다
func (pm *PresetManager) CreatePreset(name, description, category string, variables map[string]string) (*Preset, error) {
	if name == "" {
		return nil, fmt.Errorf("프리셋 이름은 필수입니다")
	}

	if len(variables) == 0 {
		return nil, fmt.Errorf("최소 하나 이상의 변수가 필요합니다")
	}

	// ID 생성 (현재 시간 기반)
	id := fmt.Sprintf("preset-%d", time.Now().Unix())

	preset := &Preset{
		ID:          id,
		Name:        name,
		Description: description,
		Category:    category,
		Variables:   variables,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	pm.presets[id] = preset
	return preset, nil
}

// GetPreset ID로 프리셋을 조회합니다
func (pm *PresetManager) GetPreset(id string) (*Preset, error) {
	preset, exists := pm.presets[id]
	if !exists {
		return nil, fmt.Errorf("프리셋을 찾을 수 없습니다: %s", id)
	}

	return preset, nil
}

// GetAllPresets 모든 프리셋을 조회합니다
func (pm *PresetManager) GetAllPresets() []*Preset {
	var presets []*Preset
	for _, preset := range pm.presets {
		presets = append(presets, preset)
	}
	return presets
}

// GetPresetsByCategory 카테고리별로 프리셋을 조회합니다
func (pm *PresetManager) GetPresetsByCategory(category string) []*Preset {
	var presets []*Preset
	for _, preset := range pm.presets {
		if preset.Category == category {
			presets = append(presets, preset)
		}
	}
	return presets
}

// UpdatePreset 프리셋을 업데이트합니다
func (pm *PresetManager) UpdatePreset(id string, name, description, category string, variables map[string]string) (*Preset, error) {
	preset, exists := pm.presets[id]
	if !exists {
		return nil, fmt.Errorf("프리셋을 찾을 수 없습니다: %s", id)
	}

	if name != "" {
		preset.Name = name
	}
	if description != "" {
		preset.Description = description
	}
	if category != "" {
		preset.Category = category
	}
	if variables != nil {
		preset.Variables = variables
	}

	preset.UpdatedAt = time.Now()

	return preset, nil
}

// DeletePreset 프리셋을 삭제합니다
func (pm *PresetManager) DeletePreset(id string) error {
	if _, exists := pm.presets[id]; !exists {
		return fmt.Errorf("프리셋을 찾을 수 없습니다: %s", id)
	}

	delete(pm.presets, id)
	return nil
}

// SearchPresets 프리셋을 검색합니다
func (pm *PresetManager) SearchPresets(query string) []*Preset {
	var results []*Preset
	query = strings.ToLower(query)

	for _, preset := range pm.presets {
		if strings.Contains(strings.ToLower(preset.Name), query) ||
			strings.Contains(strings.ToLower(preset.Description), query) ||
			strings.Contains(strings.ToLower(preset.Category), query) {
			results = append(results, preset)
		}
	}

	return results
}

// GetCategories 모든 카테고리를 조회합니다
func (pm *PresetManager) GetCategories() []string {
	categoryMap := make(map[string]bool)

	for _, preset := range pm.presets {
		if preset.Category != "" {
			categoryMap[preset.Category] = true
		}
	}

	var categories []string
	for category := range categoryMap {
		categories = append(categories, category)
	}

	return categories
}

// ExportPreset 프리셋을 JSON으로 내보냅니다
func (pm *PresetManager) ExportPreset(id string) (string, error) {
	preset, err := pm.GetPreset(id)
	if err != nil {
		return "", err
	}

	data, err := json.MarshalIndent(preset, "", "  ")
	if err != nil {
		return "", fmt.Errorf("JSON 직렬화 오류: %v", err)
	}

	return string(data), nil
}

// ImportPreset JSON에서 프리셋을 가져옵니다
func (pm *PresetManager) ImportPreset(jsonData string) (*Preset, error) {
	var preset Preset
	if err := json.Unmarshal([]byte(jsonData), &preset); err != nil {
		return nil, fmt.Errorf("JSON 파싱 오류: %v", err)
	}

	// ID가 중복되지 않도록 새로운 ID 생성
	preset.ID = fmt.Sprintf("preset-%d", time.Now().Unix())
	preset.CreatedAt = time.Now()
	preset.UpdatedAt = time.Now()

	pm.presets[preset.ID] = &preset
	return &preset, nil
}

// GetPresetStatistics 프리셋 통계를 반환합니다
func (pm *PresetManager) GetPresetStatistics() map[string]interface{} {
	stats := make(map[string]interface{})

	// 총 프리셋 수
	stats["total_presets"] = len(pm.presets)

	// 카테고리별 프리셋 수
	categoryCount := make(map[string]int)
	for _, preset := range pm.presets {
		categoryCount[preset.Category]++
	}
	stats["presets_by_category"] = categoryCount

	// 변수별 사용 빈도
	variableUsage := make(map[string]int)
	for _, preset := range pm.presets {
		for variable := range preset.Variables {
			variableUsage[variable]++
		}
	}
	stats["variable_usage"] = variableUsage

	return stats
}
