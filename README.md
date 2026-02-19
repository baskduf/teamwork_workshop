# 건설 도면 탐색 인터페이스 프로토타입

## 실행 방법
```bash
npm install
npm run dev
```

> 내부적으로 `app/`(React + TypeScript + Vite)에서 실행됩니다.

## 기술 스택
- React 19
- TypeScript
- Vite
- CSS (vanilla)

## 구현 기능
- [x] 공간(건물) 기반 도면 탐색
- [x] 공종 기반 도면 탐색
- [x] Region 분기 데이터(예: 구조 A/B) 탐색
- [x] 리비전 선택 및 도면 표시
- [x] 현재 컨텍스트(건물/공종/영역/리비전) 표시
- [x] 리비전 설명/변경사항 표시
- [x] 비교/오버레이 모드 (공종/리비전 + 투명도)

## 미완성 기능
- [ ] imageTransform/rotation/scale을 이용한 정확한 도면 정렬
- [ ] polygon/region 하이라이트 렌더링
- [ ] 리비전 간 시각적 diff(변경점 자동 강조)
- [ ] 검색(자연어/키워드) 및 최근 조회 히스토리

## 폴더 구조
```text
teamwork_workshop/
  data/
    metadata.json
    drawings/*
  app/
    src/*
  DESIGN.md
```
