package document

type FileSystemItem struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Type string `json:type"`
}

// interface FileSystemItem {
// 	id: string
// 	name: string
// 	type: "file" | "folder"
// 	children?: FileSystemItem[]
// 	path: string
// 	size?: string // 굳이 필요한가?
// 	modified?: string // 굳이 필요한가?
// 	isTemplate?: boolean // 굳이 필요한가?
//   }
