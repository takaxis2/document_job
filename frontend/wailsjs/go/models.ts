export namespace document {
	
	export class ExcelValidationItem {
	    row_index: number;
	    business_number: string;
	    company_name: string;
	    representative: string;
	    email: string;
	    supply_value: number;
	    tax_value: number;
	    errors: string[];
	
	    static createFrom(source: any = {}) {
	        return new ExcelValidationItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.row_index = source["row_index"];
	        this.business_number = source["business_number"];
	        this.company_name = source["company_name"];
	        this.representative = source["representative"];
	        this.email = source["email"];
	        this.supply_value = source["supply_value"];
	        this.tax_value = source["tax_value"];
	        this.errors = source["errors"];
	    }
	}
	export class MissingPartnerItem {
	    facility_id: number;
	    target_id: string;
	    partner_name: string;
	    facility_name: string;
	    company_name: string;
	    business_number: string;
	    email: string;
	
	    static createFrom(source: any = {}) {
	        return new MissingPartnerItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.facility_id = source["facility_id"];
	        this.target_id = source["target_id"];
	        this.partner_name = source["partner_name"];
	        this.facility_name = source["facility_name"];
	        this.company_name = source["company_name"];
	        this.business_number = source["business_number"];
	        this.email = source["email"];
	    }
	}
	export class ExcelValidationReport {
	    total_rows: number;
	    valid_rows_count: number;
	    error_rows_count: number;
	    items: ExcelValidationItem[];
	    missing_partners: MissingPartnerItem[];
	
	    static createFrom(source: any = {}) {
	        return new ExcelValidationReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total_rows = source["total_rows"];
	        this.valid_rows_count = source["valid_rows_count"];
	        this.error_rows_count = source["error_rows_count"];
	        this.items = this.convertValues(source["items"], ExcelValidationItem);
	        this.missing_partners = this.convertValues(source["missing_partners"], MissingPartnerItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FileSystemItem {
	    id: string;
	    name: string;
	    fileType: string;
	    children: FileSystemItem[];
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new FileSystemItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.fileType = source["fileType"];
	        this.children = this.convertValues(source["children"], FileSystemItem);
	        this.path = source["path"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class InvoiceTarget {
	    id: string;
	    type: string;
	    partner_id: number;
	    partner_name: string;
	    name: string;
	    company_name: string;
	    business_number: string;
	    email: string;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceTarget(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.partner_id = source["partner_id"];
	        this.partner_name = source["partner_name"];
	        this.name = source["name"];
	        this.company_name = source["company_name"];
	        this.business_number = source["business_number"];
	        this.email = source["email"];
	    }
	}

}

export namespace models {
	
	export class DocumentModel {
	    id: number;
	    file_path: string;
	    file_name: string;
	    file_size: number;
	    file_type: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new DocumentModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.file_path = source["file_path"];
	        this.file_name = source["file_name"];
	        this.file_size = source["file_size"];
	        this.file_type = source["file_type"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FacilityDocumentModel {
	    id: number;
	    facility_id: number;
	    document_name: string;
	    description: string;
	    // Go type: time
	    created_at: any;
	
	    static createFrom(source: any = {}) {
	        return new FacilityDocumentModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.facility_id = source["facility_id"];
	        this.document_name = source["document_name"];
	        this.description = source["description"];
	        this.created_at = this.convertValues(source["created_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FacilityModel {
	    id: number;
	    partner_id: number;
	    name: string;
	    representative: string;
	    company_name: string;
	    address: string;
	    email: string;
	    phone: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new FacilityModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.partner_id = source["partner_id"];
	        this.name = source["name"];
	        this.representative = source["representative"];
	        this.company_name = source["company_name"];
	        this.address = source["address"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class InvoiceTemplateModel {
	    id: number;
	    name: string;
	    description: string;
	    target_ids: string[];
	    // Go type: time
	    created_at: any;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceTemplateModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.target_ids = source["target_ids"];
	        this.created_at = this.convertValues(source["created_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ManagerModel {
	    id: number;
	    partner_id: number;
	    facility_id?: number;
	    name: string;
	    position: string;
	    department: string;
	    phone: string;
	    email: string;
	    is_primary: boolean;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new ManagerModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.partner_id = source["partner_id"];
	        this.facility_id = source["facility_id"];
	        this.name = source["name"];
	        this.position = source["position"];
	        this.department = source["department"];
	        this.phone = source["phone"];
	        this.email = source["email"];
	        this.is_primary = source["is_primary"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PartnerModel {
	    id: number;
	    name: string;
	    business_number: string;
	    company: string;
	    email: string;
	    phone: string;
	    address: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new PartnerModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.business_number = source["business_number"];
	        this.company = source["company"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.address = source["address"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PartnerNoteModel {
	    id: number;
	    partner_id: number;
	    content: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new PartnerNoteModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.partner_id = source["partner_id"];
	        this.content = source["content"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PresetItem {
	    id: number;
	    preset_id: number;
	    key: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new PresetItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.preset_id = source["preset_id"];
	        this.key = source["key"];
	        this.description = source["description"];
	    }
	}
	export class PresetModel {
	    id: number;
	    name: string;
	    description: string;
	    items: PresetItem[];
	
	    static createFrom(source: any = {}) {
	        return new PresetModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.items = this.convertValues(source["items"], PresetItem);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SettingModel {
	    key: string;
	    value: string;
	    description: string;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new SettingModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	        this.description = source["description"];
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace preset {
	
	export class ValidationError {
	    variable: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new ValidationError(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.variable = source["variable"];
	        this.message = source["message"];
	    }
	}
	export class ValidationResult {
	    is_valid: boolean;
	    errors: ValidationError[];
	
	    static createFrom(source: any = {}) {
	        return new ValidationResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.is_valid = source["is_valid"];
	        this.errors = this.convertValues(source["errors"], ValidationError);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class VariableInfo {
	    key: string;
	    description: string;
	    category: string;
	    count: number;
	
	    static createFrom(source: any = {}) {
	        return new VariableInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.description = source["description"];
	        this.category = source["category"];
	        this.count = source["count"];
	    }
	}

}

