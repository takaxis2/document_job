import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Card, CardContent } from "../components/ui/card"
import { useToast } from "../hooks/use-toast"
import { usePartnerStore } from "../stores/partnerStore"
import type { Partner, PartnerContact, PartnerNote, Facility } from "../stores/partnerStore"
import { Building2, User, Phone, Mail, Calendar, FileText, Trash2, Save, AlertTriangle, Plus, ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"

export default function PartnerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const { partners, updatePartner, deletePartner, loadPartnersFromDb } = usePartnerStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedPartner, setEditedPartner] = useState<Partner | null>(null)
  const [activeTab, setActiveTab] = useState("info")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState<Partial<PartnerContact>>({
    name: "",
    position: "",
    department: "",
    phone: "",
    email: "",
    isPrimary: false,
    facilityId: "",
  })
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)

  // 하위 시설 관련 상태
  const [editingFacility, setEditingFacility] = useState<Partial<Facility> | null>(null)
  const [newFacilityDoc, setNewFacilityDoc] = useState("")

  const [hasLoaded, setHasLoaded] = useState(false)

  // DB에서 데이터 로드
  useEffect(() => {
    const init = async () => {
      if (partners.length === 0 && !hasLoaded) {
        await loadPartnersFromDb()
      }
      setHasLoaded(true)
    }
    init()
  }, [partners.length, loadPartnersFromDb, hasLoaded])

  // URL 파라미터 id에 해당하는 거래처 조회 및 설정
  useEffect(() => {
    if (!hasLoaded) return
    const foundPartner = partners.find(p => p.id === id)
    if (foundPartner) {
      setEditedPartner(foundPartner)
    } else if (partners.length > 0) {
      toast({
        title: "거래처 조회 실패",
        description: "해당 거래처 정보를 찾을 수 없습니다.",
        variant: "destructive",
      })
      navigate("/partners")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, partners, hasLoaded])

  if (!editedPartner) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground">거래처 정보를 로딩 중입니다...</p>
      </div>
    )
  }

  // 입력값 변경 핸들러
  const handleInputChange = (field: keyof Partner, value: string) => {
    setEditedPartner((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  // 연락처 입력값 변경 핸들러
  const handleContactInputChange = (field: keyof PartnerContact, value: string | boolean) => {
    setNewContact((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 연락처 추가 핸들러
  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "입력 오류",
        description: "이름과 연락처는 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    const contact: PartnerContact = {
      id: `contact-${Date.now()}`,
      name: newContact.name || "",
      position: newContact.position || "",
      department: newContact.department || "",
      phone: newContact.phone || "",
      email: newContact.email || "",
      isPrimary: newContact.isPrimary || false,
      facilityId: newContact.facilityId || "",
    }

    setEditedPartner((prev) => {
      if (!prev) return null
      return {
        ...prev,
        contacts: [...prev.contacts, contact],
      }
    })

    setNewContact({
      name: "",
      position: "",
      department: "",
      phone: "",
      email: "",
      isPrimary: false,
      facilityId: "",
    })
    setIsAddingContact(false)

    toast({
      title: "연락처 추가됨",
      description: `${contact.name} 연락처가 추가되었습니다.`,
    })
  }

  // 연락처 삭제 핸들러
  const handleDeleteContact = (contactId: string) => {
    setEditedPartner((prev) => {
      if (!prev) return null
      return {
        ...prev,
        contacts: prev.contacts.filter((contact) => contact.id !== contactId),
      }
    })

    toast({
      title: "연락처 삭제됨",
      description: "연락처가 삭제되었습니다.",
    })
  }

  // 특이사항 추가 핸들러
  const handleAddNote = () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "입력 오류",
        description: "특이사항 내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const note: PartnerNote = {
      id: `note-${Date.now()}`,
      content: newNoteContent,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setEditedPartner((prev) => {
      if (!prev) return null
      return {
        ...prev,
        notesHistory: [note, ...(prev.notesHistory || [])],
      }
    })

    setNewNoteContent("")
    setIsAddingNote(false)

    toast({
      title: "특이사항 추가됨",
      description: "특이사항이 성공적으로 추가되었습니다.",
    })
  }

  // 특이사항 삭제 핸들러
  const handleDeleteNote = (noteId: string) => {
    setEditedPartner((prev) => {
      if (!prev) return null
      return {
        ...prev,
        notesHistory: (prev.notesHistory || []).filter((note) => note.id !== noteId),
      }
    })

    toast({
      title: "특이사항 삭제됨",
      description: "특이사항 이력이 삭제되었습니다.",
    })
  }

  // 시설 저장 핸들러
  const handleSaveFacility = () => {
    if (!editingFacility?.name) {
      toast({
        title: "입력 오류",
        description: "시설명은 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    const fac: Facility = {
      id: editingFacility.id || `fac-${Date.now()}`,
      partnerId: editedPartner.id,
      name: editingFacility.name || "",
      representative: editingFacility.representative || "",
      companyName: editingFacility.companyName || "",
      address: editingFacility.address || "",
      email: editingFacility.email || "",
      phone: editingFacility.phone || "",
      requiredDocuments: editingFacility.requiredDocuments || [],
    }

    setEditedPartner((prev) => {
      if (!prev) return null
      const facilities = prev.facilities || []
      const exists = facilities.some((f) => f.id === fac.id)
      return {
        ...prev,
        facilities: exists
          ? facilities.map((f) => (f.id === fac.id ? fac : f))
          : [...facilities, fac],
      }
    })

    setEditingFacility(null)
    toast({
      title: "시설 정보 저장됨",
      description: `${fac.name} 시설 정보가 반영되었습니다.`,
    })
  }

  // 시설 삭제 핸들러
  const handleDeleteFacility = (facilityId: string) => {
    setEditedPartner((prev) => {
      if (!prev) return null
      const facilities = prev.facilities || []
      return {
        ...prev,
        facilities: facilities.filter((f) => f.id !== facilityId),
        contacts: prev.contacts.map((c) => c.facilityId === facilityId ? { ...c, facilityId: "" } : c)
      }
    })

    toast({
      title: "시설 삭제됨",
      description: "시설이 삭제되었습니다.",
    })
  }

  // 시설 서류 항목 추가 핸들러
  const handleAddFacilityDoc = () => {
    if (!newFacilityDoc.trim()) return
    if (editingFacility?.requiredDocuments?.includes(newFacilityDoc.trim())) {
      toast({
        title: "오류",
        description: "이미 존재하는 서류 항목입니다.",
        variant: "destructive",
      })
      return
    }

    setEditingFacility((prev) => {
      if (!prev) return null
      return {
        ...prev,
        requiredDocuments: [...(prev.requiredDocuments || []), newFacilityDoc.trim()],
      }
    })
    setNewFacilityDoc("")
  }

  // 시설 서류 항목 삭제 핸들러
  const handleDeleteFacilityDoc = (docName: string) => {
    setEditingFacility((prev) => {
      if (!prev) return null
      return {
        ...prev,
        requiredDocuments: (prev.requiredDocuments || []).filter((d) => d !== docName),
      }
    })
  }

  // 저장 핸들러 (Zustand 스토어 연동)
  const handleSave = () => {
    if (!editedPartner) return

    // 필수 필드 검증
    if (!editedPartner.name || !editedPartner.businessNumber) {
      toast({
        title: "입력 오류",
        description: "거래처명과 사업자번호는 필수 입력 항목입니다.",
        variant: "destructive",
      })
      return
    }

    updatePartner(editedPartner)
    setIsEditing(false)
    toast({
      title: "저장 완료",
      description: "거래처 정보가 저장되었습니다.",
    })
  }

  // 삭제 핸들러
  const handleDelete = () => {
    if (!editedPartner) return
    deletePartner(editedPartner.id)
    setIsDeleteDialogOpen(false)
    navigate("/partners")
    toast({
      title: "삭제 완료",
      description: "거래처가 삭제되었습니다.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="icon" onClick={() => navigate("/partners")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <Building2 className="mr-2 h-7 w-7 text-primary" />
              {editedPartner.name}
            </h1>
            <p className="text-muted-foreground">거래처 상세 정보와 하위 시설들을 통합 관리합니다.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)}>정보 수정</Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                거래처 삭제
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                변경사항 저장
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                수정 취소
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 w-full mb-6">
              <TabsTrigger value="info">기본 정보</TabsTrigger>
              <TabsTrigger value="notes">특이사항 ({(editedPartner.notesHistory || []).length})</TabsTrigger>
              <TabsTrigger value="contacts">담당자 ({editedPartner.contacts.length})</TabsTrigger>
              <TabsTrigger value="facilities">시설 관리 ({editedPartner.facilities?.length || 0})</TabsTrigger>
              <TabsTrigger value="transactions">거래 내역 ({editedPartner.transactions.length})</TabsTrigger>
              <TabsTrigger value="documents">문서 ({editedPartner.documents.length})</TabsTrigger>
            </TabsList>

            {/* 기본 정보 탭 */}
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold">거래처명 *</Label>
                  <Input
                    id="name"
                    value={editedPartner.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessNumber" className="font-semibold">사업자번호 *</Label>
                  <Input
                    id="businessNumber"
                    value={editedPartner.businessNumber}
                    onChange={(e) => handleInputChange("businessNumber", e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representative" className="font-semibold">대표자명</Label>
                  <Input
                    id="representative"
                    value={editedPartner.representative}
                    onChange={(e) => handleInputChange("representative", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="font-semibold">담당자</Label>
                  <Input
                    id="contactPerson"
                    value={editedPartner.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold">연락처</Label>
                  <Input
                    id="phone"
                    value={editedPartner.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedPartner.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="font-semibold">주소</Label>
                  <Input
                    id="address"
                    value={editedPartner.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="font-semibold">업종</Label>
                  <Select
                    value={editedPartner.industry}
                    onValueChange={(value) => handleInputChange("industry", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="업종 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturing">제조업</SelectItem>
                      <SelectItem value="service">서비스업</SelectItem>
                      <SelectItem value="retail">유통업</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="construction">건설업</SelectItem>
                      <SelectItem value="finance">금융업</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-semibold">거래 상태</Label>
                  <Select
                    value={editedPartner.status}
                    onValueChange={(value: "active" | "inactive" | "pending") => handleInputChange("status", value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="거래 상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">거래중</SelectItem>
                      <SelectItem value="inactive">거래중단</SelectItem>
                      <SelectItem value="pending">검토중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes" className="font-semibold">메모</Label>
                  <Textarea
                    id="notes"
                    value={editedPartner.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                <div>
                  <span className="font-medium">최초 등록일:</span> {editedPartner.createdAt}
                </div>
                <div>
                  <span className="font-medium">최근 거래일:</span> {editedPartner.lastTransaction}
                </div>
              </div>
            </TabsContent>

            {/* 특이사항 탭 */}
            <TabsContent value="notes" className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">특이사항 이력</h3>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsAddingNote(!isAddingNote)}>
                    {isAddingNote ? "작성 취소" : <><Plus className="h-4 w-4 mr-1" /> 작성</>}
                  </Button>
                )}
              </div>

              {isAddingNote && (
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900 space-y-3">
                  <Label htmlFor="new-note" className="font-semibold">새 특이사항 등록</Label>
                  <Textarea 
                    id="new-note" 
                    rows={3} 
                    placeholder="거래처와 관련된 특이사항이나 변동사항을 기록하세요..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleAddNote}>등록</Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(editedPartner.notesHistory || []).length > 0 ? (
                  (editedPartner.notesHistory || []).map((note) => (
                    <div key={note.id} className="p-4 border rounded-md group relative hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded">
                          {note.createdAt}
                        </span>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500 border border-dashed rounded-md bg-white dark:bg-gray-950">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>등록된 특이사항 이력이 없습니다.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* 담당자 탭 */}
            <TabsContent value="contacts" className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">담당자 목록</h3>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsAddingContact(true)}>
                    <Plus className="h-4 w-4 mr-1" /> 담당자 추가
                  </Button>
                )}
              </div>

              {isAddingContact && (
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-900 space-y-4">
                  <h4 className="font-semibold text-sm border-b pb-1">새 담당자 추가</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">이름 *</Label>
                      <Input
                        id="contact-name"
                        value={newContact.name}
                        onChange={(e) => handleContactInputChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-position">직책</Label>
                      <Input
                        id="contact-position"
                        value={newContact.position}
                        onChange={(e) => handleContactInputChange("position", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-department">부서</Label>
                      <Input
                        id="contact-department"
                        value={newContact.department}
                        onChange={(e) => handleContactInputChange("department", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">연락처 *</Label>
                      <Input
                        id="contact-phone"
                        value={newContact.phone}
                        onChange={(e) => handleContactInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">이메일</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => handleContactInputChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-facility">소속 시설</Label>
                      <Select
                        value={newContact.facilityId || "none"}
                        onValueChange={(val) => handleContactInputChange("facilityId", val === "none" ? "" : val)}
                      >
                        <SelectTrigger id="contact-facility">
                          <SelectValue placeholder="소속 시설 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">본사 / 소속 없음</SelectItem>
                          {(editedPartner.facilities || []).map((f) => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex items-end">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="contact-primary"
                          checked={newContact.isPrimary}
                          onChange={(e) => handleContactInputChange("isPrimary", e.target.checked)}
                          className="rounded border-gray-300 h-4 w-4"
                        />
                        <Label htmlFor="contact-primary" className="cursor-pointer">주 담당자 설정</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingContact(false)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={handleAddContact}>
                      추가
                    </Button>
                  </div>
                </div>
              )}

              {editedPartner.contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editedPartner.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 border rounded-md flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors shadow-sm bg-white dark:bg-gray-950"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-semibold">{contact.name}</span>
                          {contact.isPrimary && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                              주 담당자
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-2 text-gray-500" />
                            <span>{contact.phone}</span>
                          </div>
                          {contact.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-2 text-gray-500" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          {(contact.position || contact.department || contact.facilityId) && (
                            <div className="flex items-center text-xs">
                              {contact.facilityId && (
                                <span className="inline-block bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200/50 font-medium mr-2">
                                  {editedPartner.facilities?.find(f => f.id === contact.facilityId)?.name || "시설"} 소속
                                </span>
                              )}
                              <span>
                                {contact.department}
                                {contact.department && contact.position ? " / " : ""}
                                {contact.position}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 border border-dashed rounded-md bg-white dark:bg-gray-950">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>등록된 담당자가 없습니다.</p>
                  {isEditing && (
                    <Button variant="link" onClick={() => setIsAddingContact(true)}>
                      담당자 추가하기
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* 시설 관리 탭 */}
            <TabsContent value="facilities" className="space-y-4">
              {editingFacility ? (
                /* 시설 등록/수정 폼 */
                <div className="p-5 border rounded-md bg-gray-50 dark:bg-gray-900 space-y-4 shadow-sm">
                  <h4 className="font-bold text-lg border-b pb-2">
                    {editingFacility.id ? "시설 정보 수정" : "새 하위 시설 등록"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facility-name">시설명 (사업소명) *</Label>
                      <Input
                        id="facility-name"
                        value={editingFacility.name || ""}
                        onChange={(e) => setEditingFacility(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="예: 황산공원, 주민편익시설"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facility-company">세금계산서 상호명 (선택)</Label>
                      <Input
                        id="facility-company"
                        value={editingFacility.companyName || ""}
                        onChange={(e) => setEditingFacility(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="미지정 시 거래처명 사용"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facility-rep">대표자명 (선택)</Label>
                      <Input
                        id="facility-rep"
                        value={editingFacility.representative || ""}
                        onChange={(e) => setEditingFacility(prev => ({ ...prev, representative: e.target.value }))}
                        placeholder="미지정 시 거래처 대표자명 사용"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facility-email">세금계산서 수신 이메일 (선택)</Label>
                      <Input
                        id="facility-email"
                        value={editingFacility.email || ""}
                        onChange={(e) => setEditingFacility(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="미지정 시 거래처 이메일 사용"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facility-phone">전화번호 (선택)</Label>
                      <Input
                        id="facility-phone"
                        value={editingFacility.phone || ""}
                        onChange={(e) => setEditingFacility(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="미지정 시 거래처 연락처 사용"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="facility-address">주소 (선택)</Label>
                      <Input
                        id="facility-address"
                        value={editingFacility.address || ""}
                        onChange={(e) => setEditingFacility(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="미지정 시 거래처 주소 사용"
                      />
                    </div>

                    {/* 필요 서류 추가 */}
                    <div className="space-y-2 md:col-span-2 pt-2 border-t mt-2">
                      <Label className="block font-semibold">필요한 서류 항목 설정</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newFacilityDoc}
                          onChange={(e) => setNewFacilityDoc(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddFacilityDoc();
                            }
                          }}
                          placeholder="추가할 서류명 입력 (예: 청구서, 작업완료보고서)"
                        />
                        <Button type="button" onClick={handleAddFacilityDoc}>추가</Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 border rounded bg-white dark:bg-gray-950">
                        {(editingFacility.requiredDocuments || []).length > 0 ? (
                          (editingFacility.requiredDocuments || []).map((doc) => (
                            <span
                              key={doc}
                              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded"
                            >
                              {doc}
                              <button
                                type="button"
                                onClick={() => handleDeleteFacilityDoc(doc)}
                                className="text-blue-500 hover:text-blue-750 font-bold ml-1"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">설정된 필요 서류 항목이 없습니다.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingFacility(null)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={handleSaveFacility}>
                      <Save className="h-4 w-4 mr-1" />
                      시설 정보 저장
                    </Button>
                  </div>
                </div>
              ) : (
                /* 시설 목록 뷰 */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">하위 시설 및 사업소 목록</h3>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingFacility({
                            name: "",
                            companyName: "",
                            representative: "",
                            email: "",
                            phone: "",
                            address: "",
                            requiredDocuments: [],
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" /> 신규 시설 추가
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {(editedPartner.facilities || []).length > 0 ? (
                      (editedPartner.facilities || []).map((fac) => {
                        // 소속 담당자 필터링
                        const facManagers = editedPartner.contacts.filter((c) => c.facilityId === fac.id);

                        return (
                          <div key={fac.id} className="p-4 border rounded-md bg-white dark:bg-gray-950 space-y-3 relative group shadow-sm hover:border-blue-200 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-base text-blue-600 dark:text-blue-400">
                                  {fac.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  상호명: {fac.companyName || <span className="text-gray-400">{editedPartner.name} (본사 상속)</span>}
                                </p>
                              </div>
                              
                              {isEditing && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingFacility(fac)}
                                    className="h-8 px-2 text-blue-600"
                                  >
                                    수정
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteFacility(fac.id)}
                                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm border-t pt-3 mt-2">

                              <div>
                                <span className="text-gray-500 font-medium mr-2">대표자:</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {fac.representative || <span className="text-gray-400">{editedPartner.representative || "없음"} (상속됨)</span>}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium mr-2">계산서 이메일:</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {fac.email || <span className="text-gray-400">{editedPartner.email || "없음"} (상속됨)</span>}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium mr-2">연락처:</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {fac.phone || <span className="text-gray-400">{editedPartner.phone || "없음"} (상속됨)</span>}
                                </span>
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-500 font-medium mr-2">주소:</span>
                                <span className="text-gray-800 dark:text-gray-200">
                                  {fac.address || <span className="text-gray-400">{editedPartner.address || "없음"} (상속됨)</span>}
                                </span>
                              </div>
                            </div>

                            {/* 필요 서류 정보 */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded border border-dashed text-xs space-y-1.5">
                              <span className="font-bold text-gray-700 dark:text-gray-300 block">
                                필요한 서류 항목 ({fac.requiredDocuments?.length || 0})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {fac.requiredDocuments && fac.requiredDocuments.length > 0 ? (
                                  fac.requiredDocuments.map((doc) => (
                                    <span key={doc} className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-0.5 rounded font-medium border border-blue-200/50">
                                      {doc}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-450">설정된 필요 서류 항목이 없습니다.</span>
                                )}
                              </div>
                            </div>

                            {/* 담당자 정보 */}
                            <div className="text-xs pt-1">
                              <span className="font-bold text-gray-700 dark:text-gray-300 mr-2">소속 담당자:</span>
                              {facManagers.length > 0 ? (
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  {facManagers.map((m) => `${m.name}(${m.position || "담당자"})`).join(", ")}
                                </span>
                              ) : (
                                <span className="text-gray-400">지정된 담당자가 없습니다. (담당자 탭에서 소속 지정 가능)</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 border border-dashed rounded-md bg-white dark:bg-gray-950">
                        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-semibold">등록된 하위 시설이 없습니다.</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
                          거래처 산하의 각 시설/사업소별로 세금계산서 설정이나 필요 서류 항목을 다르게 구성하고 담당자를 지정하려면 시설을 등록하세요.
                        </p>
                        {isEditing && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() =>
                              setEditingFacility({
                                name: "",
                                companyName: "",
                                representative: "",
                                email: "",
                                phone: "",
                                address: "",
                                requiredDocuments: [],
                              })
                            }
                            className="mt-3 text-xs"
                          >
                            신규 시설 등록하기
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 거래 내역 탭 */}
            <TabsContent value="transactions" className="space-y-4">
              <div className="mb-2">
                <h3 className="text-lg font-semibold">거래 내역</h3>
              </div>

              {editedPartner.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2.5 px-3 font-semibold text-sm">날짜</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-sm">유형</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-sm">금액</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-sm">설명</th>
                        <th className="text-left py-2.5 px-3 font-semibold text-sm">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedPartner.transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50/50 dark:hover:bg-gray-900/50 text-sm">
                          <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{transaction.date}</td>
                          <td className="py-3 px-3">{transaction.type}</td>
                          <td className="py-3 px-3 font-medium">{transaction.amount.toLocaleString()}원</td>
                          <td className="py-3 px-3">{transaction.description}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium ${
                                transaction.status === "completed"
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : transaction.status === "pending"
                                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {transaction.status === "completed"
                                ? "완료"
                                : transaction.status === "pending"
                                  ? "진행중"
                                  : "취소"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 border border-dashed rounded-md bg-white dark:bg-gray-950">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>거래 내역이 없습니다.</p>
                </div>
              )}
            </TabsContent>

            {/* 문서 탭 */}
            <TabsContent value="documents" className="space-y-4">
              <div className="mb-2">
                <h3 className="text-lg font-semibold">관련 문서</h3>
              </div>

              {editedPartner.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editedPartner.documents.map((document) => (
                    <div key={document.id} className="p-4 border rounded-md flex items-center bg-white dark:bg-gray-950 shadow-sm hover:border-blue-200 transition-colors">
                      <FileText className="h-10 w-10 mr-3 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-sm">{document.name}</div>
                        <div className="text-xs text-gray-500 flex items-center justify-between mt-1">
                          <span>{document.type}</span>
                          <span>{document.size}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">{document.createdAt}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2 text-xs">
                        보기
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 border border-dashed rounded-md bg-white dark:bg-gray-950">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>관련 문서가 없습니다.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              거래처 완전히 삭제
            </AlertDialogTitle>
            <AlertDialogDescription>
              정말로 {editedPartner?.name} 거래처를 완전히 삭제하시겠습니까? 이 작업은 등록된 모든 메모, 서류 정보, 담당자를 삭제하며 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              완전히 삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
