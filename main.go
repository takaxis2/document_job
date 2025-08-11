package main

import (
	"context"
	"embed"

	// "doc_job/db"
	"doc_job/document"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	doc := document.NewDocument()
	// db.InitDatabase()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "doc_job",
		Width:  1040,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			doc.Startup(ctx)
			app.startup(ctx)
		},
		Bind: []interface{}{
			app, doc,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
