package document

import (
	"context"
)

type Document struct {
	ctx context.Context
}

func NewDocument() *Document {
	return &Document{}
}

func (d *Document) Startup(ctx context.Context) {
	d.ctx = ctx
}

// 폴더 선택 다이얼로그 함수 - 컨텍스트를 직접 받음
func (d *Document) SelectDirectory() (string, error) {
	return selectDirectory(d.ctx)
}

// 폴더 트리 가져오기 함수
func (d *Document) GetFolderTree(path string) {
}
