package document

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func selectDirectory(ctx context.Context) (string, error) {
	result, err := runtime.OpenDirectoryDialog(ctx, runtime.OpenDialogOptions{
		Title: "폴더 선택",
	})
	if err != nil {
		return "", err
	}
	return result, nil
}

func getFolderTree(path string) {

}
