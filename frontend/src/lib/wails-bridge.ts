// Web Bridge for Wails runtime and Go backend bindings
// Provides local persistence and business logic to run seamlessly in the browser.

interface PartnerItem {
  id: number;
  name: string;
  business_number: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface FacilityItem {
  id: number;
  partner_id: number;
  name: string;
  representative: string;
  company_name: string;
  address: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

interface ManagerItem {
  id: number;
  partner_id: number;
  facility_id?: number | null;
  name: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface NoteItem {
  id: number;
  partner_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

interface PresetItem {
  id: number;
  preset_id: number;
  key: string;
  description: string;
}

interface PresetModel {
  id: number;
  name: string;
  description: string;
  items: PresetItem[];
}

interface InvoiceTemplateModel {
  id: number;
  name: string;
  description: string;
  target_ids: string[];
  created_at: string;
}

const STORAGE_KEYS = {
  PARTNERS: 'doc_job_partners',
  FACILITIES: 'doc_job_facilities',
  MANAGERS: 'doc_job_managers',
  NOTES: 'doc_job_notes',
  DOCUMENTS: 'doc_job_facility_documents',
  PRESETS: 'doc_job_presets',
  INVOICE_TEMPLATES: 'doc_job_invoice_templates',
  SETTINGS: 'doc_job_settings',
  FOLDERS: 'doc_job_folder_path',
};

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return defaultVal;
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

// Initial demo seed data
const initialPartners: PartnerItem[] = [
  {
    id: 1,
    name: "한국전자",
    business_number: "123-45-67890",
    company: "한국전자 주식회사",
    email: "contact@hkelec.co.kr",
    phone: "02-555-1234",
    address: "서울특별시 강남구 테헤란로 123",
    created_at: "2025-01-15T09:00:00Z",
    updated_at: "2025-05-02T10:30:00Z",
  },
  {
    id: 2,
    name: "대한물산",
    business_number: "220-81-62517",
    company: "(주)대한물산",
    email: "daehan@mulsan.com",
    phone: "02-789-0123",
    address: "서울특별시 중구 남대문로 45",
    created_at: "2025-02-01T11:00:00Z",
    updated_at: "2025-05-01T14:20:00Z",
  },
  {
    id: 3,
    name: "성원기업",
    business_number: "105-86-45678",
    company: "성원기업(주)",
    email: "info@sungwon.kr",
    phone: "031-456-1122",
    address: "경기도 안양시 동안구 관양동 88",
    created_at: "2025-03-05T13:00:00Z",
    updated_at: "2025-05-02T16:00:00Z",
  }
];

const initialFacilities: FacilityItem[] = [
  {
    id: 1,
    partner_id: 1,
    name: "한국전자 화성사업장",
    representative: "김영수",
    company_name: "한국전자(주)",
    address: "경기도 화성시 반월동 456",
    email: "hwaseong@hkelec.co.kr",
    phone: "031-123-4567",
    created_at: "2025-01-15T09:30:00Z",
    updated_at: "2025-01-15T09:30:00Z",
  },
  {
    id: 2,
    partner_id: 1,
    name: "한국전자 평택공장",
    representative: "이진우",
    company_name: "한국전자(주)",
    address: "경기도 평택시 고덕면 789",
    email: "pyeongtaek@hkelec.co.kr",
    phone: "031-987-6543",
    created_at: "2025-01-20T10:00:00Z",
    updated_at: "2025-01-20T10:00:00Z",
  },
  {
    id: 3,
    partner_id: 2,
    name: "대한물산 인천물류센터",
    representative: "박지민",
    company_name: "(주)대한물산",
    address: "인천광역시 서구 가좌동 12",
    email: "incheon@mulsan.com",
    phone: "032-456-7890",
    created_at: "2025-02-01T11:30:00Z",
    updated_at: "2025-02-01T11:30:00Z",
  },
  {
    id: 4,
    partner_id: 3,
    name: "성원 안양본사",
    representative: "이수진",
    company_name: "성원기업(주)",
    address: "경기도 안양시 동안구 관양동 88",
    email: "info@sungwon.kr",
    phone: "031-456-1122",
    created_at: "2025-03-05T13:30:00Z",
    updated_at: "2025-03-05T13:30:00Z",
  }
];

const initialFacilityDocs: Record<number, string[]> = {
  1: ["사업자등록증", "통장사본", "위임장"],
  2: ["사업자등록증", "안전관리확인서"],
  3: ["사업자등록증", "물류보관증명서"],
  4: ["사업자등록증"]
};

const initialManagers: ManagerItem[] = [
  {
    id: 1,
    partner_id: 1,
    facility_id: 1,
    name: "김영수",
    position: "부장",
    department: "자재구매팀",
    phone: "010-1234-5678",
    email: "yskim@hkelec.co.kr",
    is_primary: true,
    created_at: "2025-01-15T09:30:00Z",
    updated_at: "2025-01-15T09:30:00Z",
  },
  {
    id: 2,
    partner_id: 1,
    facility_id: 2,
    name: "이진우",
    position: "팀장",
    department: "생산관리팀",
    phone: "010-2345-6789",
    email: "jwlee@hkelec.co.kr",
    is_primary: false,
    created_at: "2025-01-20T10:00:00Z",
    updated_at: "2025-01-20T10:00:00Z",
  },
  {
    id: 3,
    partner_id: 2,
    facility_id: 3,
    name: "박지민",
    position: "차장",
    department: "물류운영과",
    phone: "010-3456-7890",
    email: "jmpark@mulsan.com",
    is_primary: true,
    created_at: "2025-02-01T11:30:00Z",
    updated_at: "2025-02-01T11:30:00Z",
  },
  {
    id: 4,
    partner_id: 3,
    facility_id: 4,
    name: "이수진",
    position: "이사",
    department: "경영지원팀",
    phone: "010-4567-8901",
    email: "sjlee@sungwon.kr",
    is_primary: true,
    created_at: "2025-03-05T13:30:00Z",
    updated_at: "2025-03-05T13:30:00Z",
  }
];

const initialNotes: NoteItem[] = [
  {
    id: 1,
    partner_id: 1,
    content: "2025년 2분기 정기 계약 갱신 완료. 인보이스 전자발행 요청.",
    created_at: "2025-04-10T15:00:00Z",
    updated_at: "2025-04-10T15:00:00Z",
  },
  {
    id: 2,
    partner_id: 2,
    content: "납품 대금 익월 15일 결제 조건 합의",
    created_at: "2025-03-20T11:00:00Z",
    updated_at: "2025-03-20T11:00:00Z",
  }
];

const initialPresets: PresetModel[] = [
  {
    id: 1,
    name: "기본 회사 정보",
    description: "회사명, 대표자, 사업자번호 등 기본 변수",
    items: [
      { id: 1, preset_id: 1, key: "회사명", description: "회사 상호" },
      { id: 2, preset_id: 1, key: "대표자명", description: "대표자 성명" },
      { id: 3, preset_id: 1, key: "사업자등록번호", description: "사업자등록번호" },
      { id: 4, preset_id: 1, key: "주소", description: "사업장 주소" },
      { id: 5, preset_id: 1, key: "연락처", description: "대표 전화번호" },
      { id: 6, preset_id: 1, key: "이메일", description: "대표 이메일" }
    ]
  },
  {
    id: 2,
    name: "청구 및 일자 정보",
    description: "청구 년/월/일 및 작업일 정보",
    items: [
      { id: 7, preset_id: 2, key: "billing_year", description: "청구 연도" },
      { id: 8, preset_id: 2, key: "billing_month", description: "청구 월" },
      { id: 9, preset_id: 2, key: "billing_date", description: "청구 일" },
      { id: 10, preset_id: 2, key: "WORK_YEAR", description: "작업 년" },
      { id: 11, preset_id: 2, key: "WORK_MONTH", description: "작업 달" },
      { id: 12, preset_id: 2, key: "WORK_DATE", description: "작업 일" }
    ]
  }
];

const initialInvoiceTemplates: InvoiceTemplateModel[] = [
  {
    id: 1,
    name: "표준 세금계산서 양식",
    description: "기본 공급받는자 대상 세금계산서 템플릿",
    target_ids: ["fac_1", "fac_3"],
    created_at: "2025-04-01T09:00:00Z",
  },
  {
    id: 2,
    name: "정기 시설 인보이스",
    description: "사업장별 월간 정기 청구용 템플릿",
    target_ids: ["fac_2", "fac_4"],
    created_at: "2025-04-15T14:00:00Z",
  }
];

const initialSettings: Record<string, string> = {
  default_input_path: "/documents/templates",
  default_output_path: "/documents/output",
};

// Check Korean business registration number validity
export function checkBusinessNumber(num: string): boolean {
  const cleaned = num.replace(/-/g, "").trim();
  if (cleaned.length !== 10 || !/^\d+$/.test(cleaned)) {
    return false;
  }
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i], 10) * weights[i];
  }
  sum += Math.floor((parseInt(cleaned[8], 10) * 5) / 10);
  const remainder = (10 - (sum % 10)) % 10;
  return remainder === parseInt(cleaned[9], 10);
}

// Generate sample folder tree
function generateFolderTree(basePath: string) {
  const cleanPath = basePath || "/documents";
  return [
    {
      id: "folder-contracts",
      name: "계약서 양식",
      fileType: "folder",
      path: `${cleanPath}/계약서`,
      children: [
        {
          id: "file-contract-1",
          name: "표준_용역계약서_{{회사명}}.docx",
          fileType: "docx",
          path: `${cleanPath}/계약서/표준_용역계약서_{{회사명}}.docx`,
        },
        {
          id: "file-contract-2",
          name: "비밀유지협약서(NDA)_{{대표자명}}.docx",
          fileType: "docx",
          path: `${cleanPath}/계약서/비밀유지협약서(NDA)_{{대표자명}}.docx`,
        }
      ]
    },
    {
      id: "folder-invoices",
      name: "인보이스 및 견적서",
      fileType: "folder",
      path: `${cleanPath}/인보이스`,
      children: [
        {
          id: "file-invoice-1",
          name: "{{billing_year}}년_{{billing_month}}월_청구서.xlsx",
          fileType: "xlsx",
          path: `${cleanPath}/인보이스/{{billing_year}}년_{{billing_month}}월_청구서.xlsx`,
        },
        {
          id: "file-invoice-2",
          name: "표준견적서_{{회사명}}.xlsx",
          fileType: "xlsx",
          path: `${cleanPath}/인보이스/표준견적서_{{회사명}}.xlsx`,
        }
      ]
    },
    {
      id: "folder-reports",
      name: "완료 문서 보관함",
      fileType: "folder",
      path: `${cleanPath}/완료문서`,
      children: [
        {
          id: "file-done-1",
          name: "2025년_1분기_계약서_한국전자.docx",
          fileType: "docx",
          path: `${cleanPath}/완료문서/2025년_1분기_계약서_한국전자.docx`,
        },
        {
          id: "file-done-2",
          name: "2025년_4월_인보이스_대한물산.xlsx",
          fileType: "xlsx",
          path: `${cleanPath}/완료문서/2025년_4월_인보이스_대한물산.xlsx`,
        }
      ]
    }
  ];
}

// Event subscribers
const eventListeners: Record<string, ((...args: any[]) => void)[]> = {};

export function initWailsBridge() {
  if (typeof window === "undefined") return;

  const w = window as any;

  // Native Wails desktop environment guard:
  // If native Go bindings are already injected by Wails, preserve them so that SQLite and native APIs are used!
  if (w.go?.main?.App && w.go?.document?.Document) {
    console.log("[Wails Bridge] Native Wails desktop environment detected. Using native Go bindings.");
    return;
  }


  // Initialize runtime
  if (!w.runtime) {
    w.runtime = {
      LogPrint: (msg: any) => console.log("[Wails Log]:", msg),
      LogTrace: (msg: any) => console.debug("[Wails Trace]:", msg),
      LogDebug: (msg: any) => console.debug("[Wails Debug]:", msg),
      LogInfo: (msg: any) => console.info("[Wails Info]:", msg),
      LogWarning: (msg: any) => console.warn("[Wails Warn]:", msg),
      LogError: (msg: any) => console.error("[Wails Error]:", msg),
      LogFatal: (msg: any) => console.error("[Wails Fatal]:", msg),
      EventsOn: (event: string, callback: (...args: any[]) => void) => {
        if (!eventListeners[event]) eventListeners[event] = [];
        eventListeners[event].push(callback);
      },
      EventsOnMultiple: (event: string, callback: (...args: any[]) => void) => {
        if (!eventListeners[event]) eventListeners[event] = [];
        eventListeners[event].push(callback);
      },
      EventsOnce: (event: string, callback: (...args: any[]) => void) => {
        const wrapper = (...args: any[]) => {
          callback(...args);
          w.runtime.EventsOff(event, wrapper);
        };
        w.runtime.EventsOn(event, wrapper);
      },
      EventsOff: (event: string, ...callbacks: ((...args: any[]) => void)[]) => {
        if (!eventListeners[event]) return;
        if (callbacks.length === 0) {
          delete eventListeners[event];
        } else {
          eventListeners[event] = eventListeners[event].filter(cb => !callbacks.includes(cb));
        }
      },
      EventsOffAll: () => {
        for (const k in eventListeners) delete eventListeners[k];
      },
      EventsEmit: (event: string, ...args: any[]) => {
        if (eventListeners[event]) {
          eventListeners[event].forEach(cb => {
            try { cb(...args); } catch (e) { console.error(e); }
          });
        }
      },
      WindowReload: () => window.location.reload(),
      WindowReloadApp: () => window.location.reload(),
      WindowSetTitle: (t: string) => { document.title = t; },
      BrowserOpenURL: (url: string) => window.open(url, "_blank"),
    };
  }

  // Initialize Go hierarchy
  if (!w.go) w.go = {};
  if (!w.go.main) w.go.main = {};
  if (!w.go.document) w.go.document = {};

  // Setup App methods
  w.go.main.App = {
    Greet: async (name: string) => `Hello ${name}, It's show time!`,

    // Partner operations
    GetAllPartners: async () => {
      return getStorage<PartnerItem[]>(STORAGE_KEYS.PARTNERS, initialPartners);
    },
    GetPartnerByID: async (id: number) => {
      const partners = getStorage<PartnerItem[]>(STORAGE_KEYS.PARTNERS, initialPartners);
      return partners.find(p => p.id === id) || null;
    },
    CreatePartner: async (partner: PartnerItem) => {
      const partners = getStorage<PartnerItem[]>(STORAGE_KEYS.PARTNERS, initialPartners);
      const newId = partners.length > 0 ? Math.max(...partners.map(p => p.id)) + 1 : 1;
      const created: PartnerItem = {
        ...partner,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      partners.push(created);
      setStorage(STORAGE_KEYS.PARTNERS, partners);
      return created;
    },
    UpdatePartner: async (partner: PartnerItem) => {
      const partners = getStorage<PartnerItem[]>(STORAGE_KEYS.PARTNERS, initialPartners);
      const idx = partners.findIndex(p => p.id === partner.id);
      if (idx !== -1) {
        partners[idx] = { ...partners[idx], ...partner, updated_at: new Date().toISOString() };
        setStorage(STORAGE_KEYS.PARTNERS, partners);
      }
    },
    DeletePartner: async (id: number) => {
      let partners = getStorage<PartnerItem[]>(STORAGE_KEYS.PARTNERS, initialPartners);
      partners = partners.filter(p => p.id !== id);
      setStorage(STORAGE_KEYS.PARTNERS, partners);

      // Cascade facilities
      let facilities = getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);
      facilities = facilities.filter(f => f.partner_id !== id);
      setStorage(STORAGE_KEYS.FACILITIES, facilities);

      // Cascade managers
      let managers = getStorage<ManagerItem[]>(STORAGE_KEYS.MANAGERS, initialManagers);
      managers = managers.filter(m => m.partner_id !== id);
      setStorage(STORAGE_KEYS.MANAGERS, managers);

      // Cascade notes
      let notes = getStorage<NoteItem[]>(STORAGE_KEYS.NOTES, initialNotes);
      notes = notes.filter(n => n.partner_id !== id);
      setStorage(STORAGE_KEYS.NOTES, notes);
    },

    // Facility operations
    GetFacilitiesByPartnerID: async (partnerId: number) => {
      const facilities = getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);
      return facilities.filter(f => f.partner_id === partnerId);
    },
    GetFacilityByID: async (id: number) => {
      const facilities = getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);
      return facilities.find(f => f.id === id) || null;
    },
    GetAllFacilities: async () => {
      return getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);
    },
    CreateFacility: async (facility: FacilityItem) => {
      const facilities = getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);
      const newId = facilities.length > 0 ? Math.max(...facilities.map(f => f.id)) + 1 : 1;
      const created: FacilityItem = {
        ...facility,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      facilities.push(created);
      setStorage(STORAGE_KEYS.FACILITIES, facilities);
      return created;
    },
    UpdateFacility: async (facility: FacilityItem) => {
      const facilities = getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);
      const idx = facilities.findIndex(f => f.id === facility.id);
      if (idx !== -1) {
        facilities[idx] = { ...facilities[idx], ...facility, updated_at: new Date().toISOString() };
        setStorage(STORAGE_KEYS.FACILITIES, facilities);
      }
    },
    DeleteFacility: async (id: number) => {
      let facilities = getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);
      facilities = facilities.filter(f => f.id !== id);
      setStorage(STORAGE_KEYS.FACILITIES, facilities);
    },

    // Facility documents
    GetFacilityDocumentsByFacilityID: async (facilityId: number) => {
      const docsMap = getStorage<Record<number, string[]>>(STORAGE_KEYS.DOCUMENTS, initialFacilityDocs);
      const list = docsMap[facilityId] || [];
      return list.map((name, idx) => ({
        id: idx + 1,
        facility_id: facilityId,
        document_name: name,
        description: "",
        created_at: new Date().toISOString()
      }));
    },
    SaveFacilityDocuments: async (facilityId: number, documentNames: string[]) => {
      const docsMap = getStorage<Record<number, string[]>>(STORAGE_KEYS.DOCUMENTS, initialFacilityDocs);
      docsMap[facilityId] = documentNames || [];
      setStorage(STORAGE_KEYS.DOCUMENTS, docsMap);
    },

    // Managers operations
    GetManagersByPartnerID: async (partnerId: number) => {
      const managers = getStorage<ManagerItem[]>(STORAGE_KEYS.MANAGERS, initialManagers);
      return managers.filter(m => m.partner_id === partnerId);
    },
    GetManagersByFacilityID: async (facilityId: number) => {
      const managers = getStorage<ManagerItem[]>(STORAGE_KEYS.MANAGERS, initialManagers);
      return managers.filter(m => m.facility_id === facilityId);
    },
    GetAllManagers: async () => {
      return getStorage<ManagerItem[]>(STORAGE_KEYS.MANAGERS, initialManagers);
    },
    GetManagerByID: async (id: number) => {
      const managers = getStorage<ManagerItem[]>(STORAGE_KEYS.MANAGERS, initialManagers);
      return managers.find(m => m.id === id) || null;
    },
    CreateManager: async (manager: ManagerItem) => {
      const managers = getStorage<ManagerItem[]>(STORAGE_KEYS.MANAGERS, initialManagers);
      const newId = managers.length > 0 ? Math.max(...managers.map(m => m.id)) + 1 : 1;
      const created: ManagerItem = {
        ...manager,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      managers.push(created);
      setStorage(STORAGE_KEYS.MANAGERS, managers);
      return created;
    },
    UpdateManager: async (manager: ManagerItem) => {
      const managers = getStorage<ManagerItem[]>(STORAGE_KEYS.MANAGERS, initialManagers);
      const idx = managers.findIndex(m => m.id === manager.id);
      if (idx !== -1) {
        managers[idx] = { ...managers[idx], ...manager, updated_at: new Date().toISOString() };
        setStorage(STORAGE_KEYS.MANAGERS, managers);
      }
    },
    DeleteManager: async (id: number) => {
      let managers = getStorage<ManagerItem[]>(STORAGE_KEYS.MANAGERS, initialManagers);
      managers = managers.filter(m => m.id !== id);
      setStorage(STORAGE_KEYS.MANAGERS, managers);
    },

    // Partner notes
    GetPartnerNotesByPartnerID: async (partnerId: number) => {
      const notes = getStorage<NoteItem[]>(STORAGE_KEYS.NOTES, initialNotes);
      return notes.filter(n => n.partner_id === partnerId);
    },
    CreatePartnerNote: async (note: NoteItem) => {
      const notes = getStorage<NoteItem[]>(STORAGE_KEYS.NOTES, initialNotes);
      const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
      const created: NoteItem = {
        ...note,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      notes.push(created);
      setStorage(STORAGE_KEYS.NOTES, notes);
      return created;
    },
    UpdatePartnerNote: async (note: NoteItem) => {
      const notes = getStorage<NoteItem[]>(STORAGE_KEYS.NOTES, initialNotes);
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx !== -1) {
        notes[idx] = { ...notes[idx], ...note, updated_at: new Date().toISOString() };
        setStorage(STORAGE_KEYS.NOTES, notes);
      }
    },
    DeletePartnerNote: async (id: number) => {
      let notes = getStorage<NoteItem[]>(STORAGE_KEYS.NOTES, initialNotes);
      notes = notes.filter(n => n.id !== id);
      setStorage(STORAGE_KEYS.NOTES, notes);
    },

    // Settings
    GetAllSettings: async () => {
      const settings = getStorage<Record<string, string>>(STORAGE_KEYS.SETTINGS, initialSettings);
      return Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        description: "",
        updated_at: new Date().toISOString()
      }));
    },
    GetSettingByKey: async (key: string) => {
      const settings = getStorage<Record<string, string>>(STORAGE_KEYS.SETTINGS, initialSettings);
      return { key, value: settings[key] || "", description: "", updated_at: new Date().toISOString() };
    },
    UpdateSetting: async (setting: { key: string; value: string }) => {
      const settings = getStorage<Record<string, string>>(STORAGE_KEYS.SETTINGS, initialSettings);
      settings[setting.key] = setting.value;
      setStorage(STORAGE_KEYS.SETTINGS, settings);
    }
  };

  // Setup Document methods
  w.go.document.Document = {
    Startup: async () => {},

    SelectDirectory: async () => {
      return "/documents/templates";
    },

    SelectExcelFile: async () => {
      return "/documents/invoices/2025년_05월_세금계산서_청구목록.xlsx";
    },

    GetFolderTree: async (path: string) => {
      return generateFolderTree(path);
    },

    GetAllFacilities: async () => {
      return w.go.main.App.GetAllFacilities();
    },

    GetAllDocuments: async () => {
      return [];
    },
    CreateDocument: async () => {},
    GetDocumentByID: async () => null,
    UpdateDocument: async () => {},
    DeleteDocument: async () => {},

    // Preset operations
    GetAllPresets: async () => {
      return getStorage<PresetModel[]>(STORAGE_KEYS.PRESETS, initialPresets);
    },
    GetPresetByID: async (id: number) => {
      const presets = getStorage<PresetModel[]>(STORAGE_KEYS.PRESETS, initialPresets);
      return presets.find(p => p.id === id) || null;
    },
    CreatePreset: async (preset: PresetModel) => {
      const presets = getStorage<PresetModel[]>(STORAGE_KEYS.PRESETS, initialPresets);
      const newId = presets.length > 0 ? Math.max(...presets.map(p => p.id)) + 1 : 1;
      const created: PresetModel = {
        ...preset,
        id: newId,
        items: (preset.items || []).map((item, idx) => ({
          ...item,
          id: idx + 1,
          preset_id: newId
        }))
      };
      presets.push(created);
      setStorage(STORAGE_KEYS.PRESETS, presets);
    },
    UpdatePreset: async (preset: PresetModel) => {
      const presets = getStorage<PresetModel[]>(STORAGE_KEYS.PRESETS, initialPresets);
      const idx = presets.findIndex(p => p.id === preset.id);
      if (idx !== -1) {
        presets[idx] = { ...presets[idx], ...preset };
        setStorage(STORAGE_KEYS.PRESETS, presets);
      }
    },
    DeletePreset: async (id: number) => {
      let presets = getStorage<PresetModel[]>(STORAGE_KEYS.PRESETS, initialPresets);
      presets = presets.filter(p => p.id !== id);
      setStorage(STORAGE_KEYS.PRESETS, presets);
    },
    CreatePresetItem: async (item: PresetItem) => {
      const presets = getStorage<PresetModel[]>(STORAGE_KEYS.PRESETS, initialPresets);
      const p = presets.find(pr => pr.id === item.preset_id);
      if (p) {
        const newId = p.items.length > 0 ? Math.max(...p.items.map(i => i.id)) + 1 : 1;
        p.items.push({ ...item, id: newId });
        setStorage(STORAGE_KEYS.PRESETS, presets);
      }
    },
    UpdatePresetItem: async (item: PresetItem) => {
      const presets = getStorage<PresetModel[]>(STORAGE_KEYS.PRESETS, initialPresets);
      const p = presets.find(pr => pr.id === item.preset_id);
      if (p) {
        const idx = p.items.findIndex(i => i.id === item.id);
        if (idx !== -1) {
          p.items[idx] = { ...p.items[idx], ...item };
          setStorage(STORAGE_KEYS.PRESETS, presets);
        }
      }
    },
    DeletePresetItem: async (id: number) => {
      const presets = getStorage<PresetModel[]>(STORAGE_KEYS.PRESETS, initialPresets);
      for (const p of presets) {
        p.items = p.items.filter(i => i.id !== id);
      }
      setStorage(STORAGE_KEYS.PRESETS, presets);
    },

    // Variable extraction and substitution
    ExtractVariables: async (content: string) => {
      const regex = /{{([^{}]+)}}/g;
      const map: Record<string, number> = {};
      let match;
      while ((match = regex.exec(content)) !== null) {
        const key = match[1].trim();
        map[key] = (map[key] || 0) + 1;
      }
      return Object.entries(map).map(([key, count]) => ({
        key,
        description: `변수: ${key}`,
        category: "일반",
        count
      }));
    },

    ExtractVariablesFromFile: async (_filePath: string) => {
      return [
        { key: "회사명", description: "회사 이름", category: "회사 정보", count: 1 },
        { key: "대표자명", description: "회사 대표자 이름", category: "회사 정보", count: 1 },
        { key: "계약일자", description: "계약 체결 일자", category: "계약 정보", count: 1 }
      ];
    },

    ExtractVariablesFromFiles: async (filePaths: string[]) => {
      return [
        { key: "회사명", description: "회사 이름", category: "회사 정보", count: filePaths.length },
        { key: "대표자명", description: "회사 대표자 이름", category: "회사 정보", count: 1 },
        { key: "계약일자", description: "계약 체결 일자", category: "계약 정보", count: 1 }
      ];
    },

    ValidateVariables: async (variables: string[], replacements: Record<string, string>) => {
      const errors: { variable: string; message: string }[] = [];
      for (const v of variables) {
        if (!replacements[v] || replacements[v].trim() === "") {
          errors.push({ variable: v, message: `변수 '${v}'의 치환값이 입력되지 않았습니다.` });
        }
      }
      return {
        is_valid: errors.length === 0,
        errors
      };
    },

    ReplaceVariables: async (content: string, replacements: Record<string, string>) => {
      let result = content;
      for (const [k, v] of Object.entries(replacements)) {
        const regex = new RegExp(`{{${k}}}`, "g");
        result = result.replace(regex, v);
      }
      return result;
    },

    GetUnreplacedVariables: async (content: string, replacements: Record<string, string>) => {
      const regex = /{{([^{}]+)}}/g;
      const unreplaced = new Set<string>();
      let match;
      while ((match = regex.exec(content)) !== null) {
        const key = match[1].trim();
        if (!replacements[key] || replacements[key].trim() === "") {
          unreplaced.add(key);
        }
      }
      return Array.from(unreplaced);
    },

    GetReplacementStatistics: async (content: string, replacements: Record<string, string>) => {
      const stats: Record<string, number> = {};
      for (const k of Object.keys(replacements)) {
        const regex = new RegExp(`{{${k}}}`, "g");
        const matches = content.match(regex);
        if (matches) {
          stats[k] = matches.length;
        }
      }
      return stats;
    },

    ProcessSelectedFiles: async (filePaths: string[], destination: string, replacements: Record<string, string>) => {
      console.log("[Wails Mock] Processing files:", { filePaths, destination, replacements });
      // Simulate processing delay and success
      await new Promise(r => setTimeout(r, 400));
    },

    // Invoice Template operations
    GetAllInvoiceTemplates: async () => {
      return getStorage<InvoiceTemplateModel[]>(STORAGE_KEYS.INVOICE_TEMPLATES, initialInvoiceTemplates);
    },
    CreateInvoiceTemplate: async (t: InvoiceTemplateModel) => {
      const templates = getStorage<InvoiceTemplateModel[]>(STORAGE_KEYS.INVOICE_TEMPLATES, initialInvoiceTemplates);
      const newId = templates.length > 0 ? Math.max(...templates.map(tmp => tmp.id)) + 1 : 1;
      const created: InvoiceTemplateModel = {
        ...t,
        id: newId,
        created_at: new Date().toISOString()
      };
      templates.push(created);
      setStorage(STORAGE_KEYS.INVOICE_TEMPLATES, templates);
      return created;
    },
    UpdateInvoiceTemplate: async (t: InvoiceTemplateModel) => {
      const templates = getStorage<InvoiceTemplateModel[]>(STORAGE_KEYS.INVOICE_TEMPLATES, initialInvoiceTemplates);
      const idx = templates.findIndex(tmp => tmp.id === t.id);
      if (idx !== -1) {
        templates[idx] = { ...templates[idx], ...t };
        setStorage(STORAGE_KEYS.INVOICE_TEMPLATES, templates);
      }
    },
    DeleteInvoiceTemplate: async (id: number) => {
      let templates = getStorage<InvoiceTemplateModel[]>(STORAGE_KEYS.INVOICE_TEMPLATES, initialInvoiceTemplates);
      templates = templates.filter(tmp => tmp.id !== id);
      setStorage(STORAGE_KEYS.INVOICE_TEMPLATES, templates);
    },

    GetInvoiceTargets: async () => {
      const partners = getStorage<PartnerItem[]>(STORAGE_KEYS.PARTNERS, initialPartners);
      const facilities = getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);
      const targets: any[] = [];

      for (const f of facilities) {
        const p = partners.find(part => part.id === f.partner_id);
        targets.push({
          id: `fac_${f.id}`,
          type: "facility",
          partner_id: f.partner_id,
          partner_name: p?.name || "",
          name: f.name,
          company_name: f.company_name,
          business_number: p?.business_number || "",
          email: f.email,
        });
      }

      for (const p of partners) {
        targets.push({
          id: `part_${p.id}`,
          type: "partner",
          partner_id: p.id,
          partner_name: p.name,
          name: p.name,
          company_name: p.company,
          business_number: p.business_number,
          email: p.email,
        });
      }

      return targets;
    },

    ValidateInvoiceExcel: async (_filePath: string) => {
      const partners = getStorage<PartnerItem[]>(STORAGE_KEYS.PARTNERS, initialPartners);
      const facilities = getStorage<FacilityItem[]>(STORAGE_KEYS.FACILITIES, initialFacilities);

      const items = [
        {
          row_index: 2,
          business_number: "123-45-67890",
          company_name: "한국전자 주식회사",
          representative: "김영수",
          email: "contact@hkelec.co.kr",
          supply_value: 5000000,
          tax_value: 500000,
          errors: []
        },
        {
          row_index: 3,
          business_number: "220-81-62517",
          company_name: "(주)대한물산",
          representative: "박지민",
          email: "daehan@mulsan.com",
          supply_value: 3500000,
          tax_value: 350000,
          errors: []
        },
        {
          row_index: 4,
          business_number: "105-86-45678",
          company_name: "성원기업(주)",
          representative: "이수진",
          email: "info@sungwon.kr",
          supply_value: 1200000,
          tax_value: 120000,
          errors: []
        },
        {
          row_index: 5,
          business_number: "999-99-99999",
          company_name: "미등록 협력사",
          representative: "홍길동",
          email: "invalid-email",
          supply_value: 800000,
          tax_value: 70000, // 잘못된 세액 (10% 불일치)
          errors: [
            "유효하지 않은 사업자등록번호 형식입니다.",
            "올바르지 않은 이메일 주소 형식입니다.",
            "세액(70,000)이 공급가액(800,000)의 10%와 일치하지 않습니다 (기대값: 80,000)."
          ]
        }
      ];

      const missing_partners = facilities
        .filter(f => f.id === 2) // 한국전자 평택공장 미포함 예시
        .map(f => {
          const p = partners.find(part => part.id === f.partner_id);
          return {
            facility_id: f.id,
            target_id: `fac_${f.id}`,
            partner_name: p?.name || "",
            facility_name: f.name,
            company_name: f.company_name,
            business_number: p?.business_number || "",
            email: f.email,
          };
        });

      return {
        total_rows: items.length,
        valid_rows_count: items.filter(i => i.errors.length === 0).length,
        error_rows_count: items.filter(i => i.errors.length > 0).length,
        items,
        missing_partners
      };
    }
  };
}
