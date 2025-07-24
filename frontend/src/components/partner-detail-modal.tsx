import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Building2, User, Phone, Mail, Calendar, FileText, Trash2, Save, AlertTriangle, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// 거래처 타입 정의
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
}

// 거래처 문서 타입
interface PartnerDocument {
  id: string
  name: string
  type: string
  createdAt: string
  size: string
}

// 거래처 연락처 타입
interface PartnerContact {
  id: string
  name: string
  position: string
  department: string
  phone: string
  email: string
  isPrimary: boolean
}

// 거래처 거래 내역 타입
interface PartnerTransaction {
  id: string
  date: string
  type: string
  amount: number
  description: string
  status: string
}

// 거래처 상세 모달 컴포넌트
interface PartnerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  partner: Partner | null
  onSave: (partner: Partner) => void
  onDelete: (partnerId: string) => void
}

export default function PartnerDetailModal({ isOpen, onClose, partner, onSave, onDelete }: PartnerDetailModalProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedPartner, setEditedPartner] = useState<Partner | null>(partner)
  const [activeTab, setActiveTab] = useState("info")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState<Partial<PartnerContact>>({
    name: "",
    position: "",
    department: "",
    phone: "",
    email: "",
    isPrimary: false,
  })
  const [isAddingContact, setIsAddingContact] = useState(false)

  // 파트너 정보가 변경될 때 상태 업데이트
  if (partner && (!editedPartner || partner.id !== editedPartner.id)) {
    setEditedPartner(partner)
  }

  if (!editedPartner) {
    return null
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

  // 저장 핸들러
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

    onSave(editedPartner)
    setIsEditing(false)
    toast({
      title: "저장 완료",
      description: "거래처 정보가 저장되었습니다.",
    })
  }

  // 삭제 핸들러
  const handleDelete = () => {
    if (!editedPartner) return
    onDelete(editedPartner.id)
    setIsDeleteDialogOpen(false)
    onClose()
    toast({
      title: "삭제 완료",
      description: "거래처가 삭제되었습니다.",
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Building2 className="mr-2 h-5 w-5" />
              {isEditing ? "거래처 정보 수정" : "거래처 상세 정보"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "거래처 정보를 수정하고 저장하세요." : "거래처의 상세 정보를 확인합니다."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="info">기본 정보</TabsTrigger>
                <TabsTrigger value="contacts">담당자 ({editedPartner.contacts.length})</TabsTrigger>
                <TabsTrigger value="transactions">거래 내역 ({editedPartner.transactions.length})</TabsTrigger>
                <TabsTrigger value="documents">문서 ({editedPartner.documents.length})</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-auto mt-4">
                {/* 기본 정보 탭 */}
                <TabsContent value="info" className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">거래처명 *</Label>
                      <Input
                        id="name"
                        value={editedPartner.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessNumber">사업자번호 *</Label>
                      <Input
                        id="businessNumber"
                        value={editedPartner.businessNumber}
                        onChange={(e) => handleInputChange("businessNumber", e.target.value)}
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="representative">대표자</Label>
                      <Input
                        id="representative"
                        value={editedPartner.representative}
                        onChange={(e) => handleInputChange("representative", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">담당자</Label>
                      <Input
                        id="contactPerson"
                        value={editedPartner.contactPerson}
                        onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">연락처</Label>
                      <Input
                        id="phone"
                        value={editedPartner.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedPartner.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">주소</Label>
                      <Input
                        id="address"
                        value={editedPartner.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">업종</Label>
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
                      <Label htmlFor="status">거래 상태</Label>
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
                      <Label htmlFor="notes">메모</Label>
                      <Textarea
                        id="notes"
                        value={editedPartner.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div>
                        <span className="font-medium">등록일:</span> {editedPartner.createdAt}
                      </div>
                      <div>
                        <span className="font-medium">최근 거래일:</span> {editedPartner.lastTransaction}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 담당자 탭 */}
                <TabsContent value="contacts" className="h-full">
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-medium">담당자 목록</h3>
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={() => setIsAddingContact(true)}>
                        <Plus className="h-4 w-4 mr-1" /> 담당자 추가
                      </Button>
                    )}
                  </div>

                  {isAddingContact && (
                    <div className="mb-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-medium mb-3">새 담당자 추가</h4>
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
                        <div className="space-y-2 flex items-end">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="contact-primary"
                              checked={newContact.isPrimary}
                              onChange={(e) => handleContactInputChange("isPrimary", e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="contact-primary">주 담당자</Label>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
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
                    <div className="space-y-4">
                      {editedPartner.contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-4 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="font-medium">{contact.name}</span>
                              {contact.isPrimary && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                                  주 담당자
                                </span>
                              )}
                            </div>
                            <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1 text-gray-500" />
                                <span>{contact.phone}</span>
                              </div>
                              {contact.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1 text-gray-500" />
                                  <span>{contact.email}</span>
                                </div>
                              )}
                              {(contact.position || contact.department) && (
                                <div className="flex items-center text-gray-600">
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
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteContact(contact.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
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

                {/* 거래 내역 탭 */}
                <TabsContent value="transactions" className="h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">거래 내역</h3>
                  </div>

                  {editedPartner.transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium">날짜</th>
                            <th className="text-left py-2 px-3 font-medium">유형</th>
                            <th className="text-left py-2 px-3 font-medium">금액</th>
                            <th className="text-left py-2 px-3 font-medium">설명</th>
                            <th className="text-left py-2 px-3 font-medium">상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editedPartner.transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                              <td className="py-3 px-3">{transaction.date}</td>
                              <td className="py-3 px-3">{transaction.type}</td>
                              <td className="py-3 px-3">{transaction.amount.toLocaleString()}원</td>
                              <td className="py-3 px-3">{transaction.description}</td>
                              <td className="py-3 px-3">
                                <span
                                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    transaction.status === "completed"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                      : transaction.status === "pending"
                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
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
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>거래 내역이 없습니다.</p>
                    </div>
                  )}
                </TabsContent>

                {/* 문서 탭 */}
                <TabsContent value="documents" className="h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">관련 문서</h3>
                  </div>

                  {editedPartner.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editedPartner.documents.map((document) => (
                        <div key={document.id} className="p-4 border rounded-md flex items-center">
                          <FileText className="h-10 w-10 mr-3 text-blue-500" />
                          <div className="flex-1">
                            <div className="font-medium">{document.name}</div>
                            <div className="text-sm text-gray-500 flex items-center justify-between">
                              <span>{document.type}</span>
                              <span>{document.size}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{document.createdAt}</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            보기
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>관련 문서가 없습니다.</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter className="flex justify-between items-center pt-4 border-t">
            <div>
              {!isEditing ? (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>수정</Button>
              ) : (
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              거래처 삭제
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editedPartner?.name} 거래처를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
