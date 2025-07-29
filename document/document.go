package document

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Document struct {
	ctx context.Context
}

func NewDocument() *Document {
	return &Document{ctx: context.Background()}
}

// 폴더 선택 다이얼로그 함수 - 컨텍스트를 직접 받음
func (d *Document) SelectDirectory() (string, error) {
	result, err := runtime.OpenDirectoryDialog(d.ctx, runtime.OpenDialogOptions{
		Title: "폴더 선택",
	})
	if err != nil {
		return "", err
	}
	return result, nil
}
