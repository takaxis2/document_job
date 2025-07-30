package document

type FileSystemItem struct {
	Id       string           `json:"id"`
	Name     string           `json:"name"`
	FileType string           `json:"fileType`
	Children []FileSystemItem `json:"children"`
	Path     string           `json:"path"`
}


