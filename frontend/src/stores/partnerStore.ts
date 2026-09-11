import { create } from 'zustand'
import { 
  GetAllPartners, 
  CreatePartner, 
  UpdatePartner, 
  DeletePartner,
  GetFacilitiesByPartnerID,
  CreateFacility,
  UpdateFacility,
  DeleteFacility,
  SaveFacilityDocuments,
  GetFacilityDocumentsByFacilityID,
  GetManagersByPartnerID,
  CreateManager,
  UpdateManager,
  DeleteManager,
  GetPartnerNotesByPartnerID,
  CreatePartnerNote,
  DeletePartnerNote
} from '../../wailsjs/go/main/App'

export interface Facility {
  id: string
  partnerId: string
  name: string
  representative: string
  companyName: string
  address: string
  email: string
  phone: string
  requiredDocuments: string[]
}

export interface PartnerNote {
  id: string
  content: string
  createdAt: string
}

export interface PartnerDocument {
  id: string
  name: string
  type: string
  createdAt: string
  size: string
}

export interface PartnerContact {
  id: string
  name: string
  position: string
  department: string
  phone: string
  email: string
  isPrimary: boolean
  facilityId?: string
}

export interface PartnerTransaction {
  id: string
  date: string
  type: string
  amount: number
  description: string
  status: string
}

export interface Partner {
  id: string
  name: string
  businessNumber: string
  representative: string
  contactPerson: string
  phone: string
  email: string
  address: string
  status: "active" | "inactive" | "pending"
  industry: string
  lastTransaction: string
  notes: string
  createdAt: string
  documents: PartnerDocument[]
  contacts: PartnerContact[]
  transactions: PartnerTransaction[]
  notesHistory?: PartnerNote[]
  facilities?: Facility[]
}

interface PartnerStoreState {
  partners: Partner[]
  setPartners: (partners: Partner[]) => void
  loadPartnersFromDb: () => Promise<void>
  addPartner: (partner: Partner) => Promise<string>
  updatePartner: (partner: Partner) => Promise<void>
  deletePartner: (id: string) => Promise<void>
}

// time.Time 문자열 포맷팅 헬퍼
function formatDate(timeStr: any): string {
  if (!timeStr) return ""
  try {
    return timeStr.split("T")[0]
  } catch {
    return String(timeStr)
  }
}

export const usePartnerStore = create<PartnerStoreState>((set) => ({
  partners: [],
  setPartners: (partners) => set({ partners }),

  loadPartnersFromDb: async () => {
    try {
      const dbPartners = (await GetAllPartners()) || []
      const partnersList: Partner[] = []
      
      for (const p of dbPartners) {
        // 각 파트너별 시설 조회
        const dbFacilities = (await GetFacilitiesByPartnerID(p.id)) || []
        // 각 파트너별 담당자 조회
        const dbManagers = (await GetManagersByPartnerID(p.id)) || []
        // 각 파트너별 특이사항 조회
        const dbNotes = (await GetPartnerNotesByPartnerID(p.id)) || []
        
        // 시설별 필요 서류 매핑
        const mappedFacilities: Facility[] = []
        for (const f of dbFacilities) {
          const dbDocs = (await GetFacilityDocumentsByFacilityID(f.id)) || []
          mappedFacilities.push({
            id: f.id.toString(),
            partnerId: f.partner_id.toString(),
            name: f.name,
            representative: f.representative,
            companyName: f.company_name,
            address: f.address,
            email: f.email,
            phone: f.phone,
            requiredDocuments: dbDocs.map(d => d.document_name)
          })
        }
        
        partnersList.push({
          id: p.id.toString(),
          name: p.name,
          businessNumber: p.business_number || "", // business_number 컬럼에서 사업자번호 읽기
          representative: "",
          contactPerson: dbManagers.find(m => m.is_primary)?.name || "",
          phone: p.phone || "",
          email: p.email || "",
          address: p.address || "",
          status: "active",
          industry: "service",
          lastTransaction: "-",
          notes: "",
          createdAt: formatDate(p.created_at),
          documents: [],
          contacts: dbManagers.map(m => ({
            id: m.id.toString(),
            name: m.name,
            position: m.position,
            department: m.department,
            phone: m.phone,
            email: m.email,
            isPrimary: m.is_primary,
            facilityId: m.facility_id ? m.facility_id.toString() : undefined
          })),
          transactions: [],
          notesHistory: dbNotes.map(n => ({
            id: n.id.toString(),
            content: n.content,
            createdAt: formatDate(n.created_at)
          })),
          facilities: mappedFacilities
        })
      }
      
      set({ partners: partnersList })
    } catch (err) {
      console.error("데이터베이스에서 거래처 목록 로드 실패:", err)
    }
  },

  addPartner: async (partner) => {
    try {
      const created = await CreatePartner({
        id: 0,
        name: partner.name,
        business_number: partner.businessNumber,
        company: partner.name, // company는 회사명 용도
        email: partner.email,
        phone: partner.phone,
        address: partner.address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      await usePartnerStore.getState().loadPartnersFromDb()
      return created.id.toString()
    } catch (err) {
      console.error("거래처 추가 실패:", err)
      throw err
    }
  },

  updatePartner: async (partner) => {
    try {
      // 1. 거래처 기본 정보 업데이트
      await UpdatePartner({
        id: parseInt(partner.id),
        name: partner.name,
        business_number: partner.businessNumber,
        company: partner.name, // company는 회사명 용도
        email: partner.email,
        phone: partner.phone,
        address: partner.address,
        created_at: partner.createdAt ? new Date(partner.createdAt).toISOString() : new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)

      // 2. 시설 정보 동기화
      if (partner.facilities) {
        const dbFacs = await GetFacilitiesByPartnerID(parseInt(partner.id))
        
        for (const f of partner.facilities) {
          const isNew = f.id.startsWith("fac-")
          const facModel = {
            id: isNew ? 0 : parseInt(f.id),
            partner_id: parseInt(partner.id),
            name: f.name,
            representative: f.representative,
            company_name: f.companyName,
            address: f.address,
            email: f.email,
            phone: f.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          let savedId = facModel.id
          if (isNew) {
            const saved = await CreateFacility(facModel as any)
            savedId = saved.id
          } else {
            await UpdateFacility(facModel as any)
          }

          await SaveFacilityDocuments(savedId, f.requiredDocuments)
        }

        // 삭제된 시설 처리
        for (const dbF of dbFacs) {
          const exists = partner.facilities.some(f => f.id === dbF.id.toString())
          if (!exists) {
            await DeleteFacility(dbF.id)
          }
        }
      }

      // 3. 담당자(Manager) 정보 동기화
      if (partner.contacts) {
        const dbManagers = await GetManagersByPartnerID(parseInt(partner.id))
        
        for (const c of partner.contacts) {
          const isNew = c.id.startsWith("contact-")
          const managerModel = {
            id: isNew ? 0 : parseInt(c.id),
            partner_id: parseInt(partner.id),
            facility_id: c.facilityId ? parseInt(c.facilityId) : null,
            name: c.name,
            position: c.position,
            department: c.department,
            phone: c.phone,
            email: c.email,
            is_primary: c.isPrimary,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          if (isNew) {
            await CreateManager(managerModel as any)
          } else {
            await UpdateManager(managerModel as any)
          }
        }

        // 삭제된 담당자 처리
        for (const dbM of dbManagers) {
          const exists = partner.contacts.some(c => c.id === dbM.id.toString())
          if (!exists) {
            await DeleteManager(dbM.id)
          }
        }
      }

      // 4. 특이사항(Note) 동기화
      if (partner.notesHistory) {
        const dbNotes = await GetPartnerNotesByPartnerID(parseInt(partner.id))
        
        for (const n of partner.notesHistory) {
          const isNew = n.id.startsWith("note-")
          if (isNew) {
            await CreatePartnerNote({
              id: 0,
              partner_id: parseInt(partner.id),
              content: n.content,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as any)
          }
        }

        // 삭제된 특이사항 처리
        for (const dbN of dbNotes) {
          const exists = partner.notesHistory.some(n => n.id === dbN.id.toString())
          if (!exists) {
            await DeletePartnerNote(dbN.id)
          }
        }
      }

      await usePartnerStore.getState().loadPartnersFromDb()
    } catch (err) {
      console.error("거래처 정보 업데이트 실패:", err)
    }
  },

  deletePartner: async (id) => {
    try {
      await DeletePartner(parseInt(id))
      await usePartnerStore.getState().loadPartnersFromDb()
    } catch (err) {
      console.error("거래처 삭제 실패:", err)
    }
  }
}))
