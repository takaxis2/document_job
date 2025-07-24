import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">변동사항 대시보드</h1>
        <p className="text-muted-foreground">최근 변동사항과 주요 지표를 확인하세요.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>최근 변동사항</CardTitle>
            <CardDescription>지난 30일 동안의 변경 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24건</div>
            <p className="text-xs text-muted-foreground">전월 대비 12% 증가</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>신규 거래처</span>
                <span className="font-medium">8건</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>계약 갱신</span>
                <span className="font-medium">12건</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>계약 종료</span>
                <span className="font-medium">4건</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>문서 처리 현황</CardTitle>
            <CardDescription>자동화 처리된 문서 통계</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156건</div>
            <p className="text-xs text-muted-foreground">전월 대비 8% 증가</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>견적서</span>
                <span className="font-medium">42건</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>계약서</span>
                <span className="font-medium">38건</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>인보이스</span>
                <span className="font-medium">76건</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>주요 알림</CardTitle>
            <CardDescription>확인이 필요한 중요 사항</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-3 py-1">
                <p className="text-sm font-medium">계약 만료 임박</p>
                <p className="text-xs text-muted-foreground">대한물산 외 3개 업체 (7일 이내)</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3 py-1">
                <p className="text-sm font-medium">미결제 인보이스</p>
                <p className="text-xs text-muted-foreground">성원기업 외 2개 업체</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3 py-1">
                <p className="text-sm font-medium">신규 견적 요청</p>
                <p className="text-xs text-muted-foreground">한국전자 (오늘)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 활동 내역</CardTitle>
          <CardDescription>시스템에 기록된 최근 활동</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>활동</TableHead>
                <TableHead>거래처</TableHead>
                <TableHead>담당자</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2025-05-03</TableCell>
                <TableCell>계약서 생성</TableCell>
                <TableCell>한국전자</TableCell>
                <TableCell>김영수</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    완료
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-05-02</TableCell>
                <TableCell>견적서 발송</TableCell>
                <TableCell>대한물산</TableCell>
                <TableCell>박지민</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    완료
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-05-02</TableCell>
                <TableCell>거래처 정보 수정</TableCell>
                <TableCell>성원기업</TableCell>
                <TableCell>이수진</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    완료
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-05-01</TableCell>
                <TableCell>인보이스 발행</TableCell>
                <TableCell>글로벌트레이딩</TableCell>
                <TableCell>정민호</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    대기중
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2025-04-30</TableCell>
                <TableCell>신규 거래처 등록</TableCell>
                <TableCell>한국전자</TableCell>
                <TableCell>김영수</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    완료
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
