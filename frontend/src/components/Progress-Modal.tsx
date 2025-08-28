// import { useState, useEffect } from 'react';
// import { EventsOn } from '../../wailsjs/runtime/runtime';
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
// } from '@/components/ui/dialog';
// import { Progress } from '@/components/ui/progress';
// import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';

// interface ProgressModalProps {
//     isOpen: boolean;
//     onClose: () => void;
// }

// export function ProgressModal({ isOpen, onClose }: ProgressModalProps) {
//     const [progress, setProgress] = useState(0);
//     const [progressText, setProgressText] = useState('작업을 준비 중입니다...');
//     const [isComplete, setIsComplete] = useState(false);

//     useEffect(() => {
//         // 모달이 열릴 때만 이벤트 리스너를 설정하고, 상태를 초기화합니다.
//         if (!isOpen) {
//             return;
//         }

//         // 상태 초기화
//         setProgress(0);
//         setProgressText('작업을 준비 중입니다...');
//         setIsComplete(false);

//         const unsubscribeProgress = EventsOn('replacement-progress', (data) => {
//             setProgress(data.percentage);
//             setProgressText(`(${data.filesProcessed}/${data.totalFiles}) ${data.currentFile} 처리 중...`);
//         });

//         const unsubscribeComplete = EventsOn('replacement-complete', (message) => {
//             setProgress(100);
//             setProgressText('완료되었습니다.');
//             setIsComplete(true);
//             toast.success(message);
//         });

//         // 클린업 함수: 컴포넌트가 언마운트되거나 isOpen이 바뀔 때 리스너를 제거합니다.
//         return () => {
//             unsubscribeProgress();
//             unsubscribeComplete();
//         };
//     }, [isOpen]);

//     const handleClose = () => {
//         if (isComplete) {
//             onClose();
//         }
//     };

//     return (
//         <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
//             <DialogContent
//                 className="sm:max-w-[425px]"
//                 onPointerDownOutside={(e) => {
//                     // 작업이 완료되지 않았으면 모달이 닫히지 않도록 막습니다.
//                     if (!isComplete) {
//                         e.preventDefault();
//                     }
//                 }}
//             >
//                 <DialogHeader>
//                     <DialogTitle>변수 치환 진행 상황</DialogTitle>
//                     <DialogDescription>
//                         파일의 변수를 치환하는 중입니다. 작업이 완료될 때까지 기다려주세요.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                     <Progress value={progress} />
//                     <p className="text-sm text-muted-foreground text-center">{progressText}</p>
//                 </div>
//                 {isComplete && (
//                     <div className="flex justify-end">
//                         <Button onClick={handleClose}>닫기</Button>
//                     </div>
//                 )}
//             </DialogContent>
//         </Dialog>
//     );
// }

// /**
//  *  import React, { useState } from 'react';
//     2 import { Button } from '@/components/ui/button';
//     3 import { Toaster } from 'sonner';
//     4 import { ProgressModal } from '@/components/progress-modal'; // 새로 만든 모달 import
//     5 
//     6 import { ReplaceVariablesInFiles } from '../../wailsjs/go/main/App';
//     7 
//     8 export function DocumentsPage() {
//     9   const [isProcessing, setIsProcessing] = useState(false);
//    10 
//    11   const handleStartReplacement = () => {
//    12     // 백엔드 함수를 호출하고 모달을 엽니다.
//    13     setIsProcessing(true);
//    14 
//    15     const filesToProcess = ['C:/path/to/doc1.txt', 'C:/path/to/doc2.txt']; // 실제 파일 경로
//    16     ReplaceVariablesInFiles(filesToProcess);
//    17   };
//    18
//    19   return (
//    20     <div>
//    21       <h1 className="text-2xl font-bold mb-4">문서 변수 치환</h1>
//    22
//    23       <Button onClick={handleStartReplacement} disabled={isProcessing}>
//    24         {isProcessing ? '처리 중...' : '변수 치환 시작'}
//    25       </Button>
//    26
//    27       {/* 모달 컴포넌트를 렌더링하고 상태를 전달합니다. 
//    28       <ProgressModal
//    29         isOpen={isProcessing}
//    30         onClose={() => setIsProcessing(false)}
//    31       />
//    32
//    33       <Toaster />
//    34     </div>
//    35   );
//    36 }

//    이걸 documentPage.tsx를 추가시킨다
//  */