# 건설 도면 탐색 인터페이스 프로토타입

건설 도면 메타데이터(`metadata.json`)를 기반으로,
사용자가 **공간 → 공종 → 영역(Region) → 리비전** 순서로 원하는 도면에 빠르게 도달할 수 있도록 만든 UI 프로토타입입니다.

## 실행 방법
```bash
npm install
npm run dev
```

- 기본 로컬 주소: `http://localhost:4173` (환경에 따라 5173)
- 내부적으로 `app/`(React + TypeScript + Vite)에서 실행됩니다.

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
- [x] Before/After 분할 슬라이더 비교
- [x] polygon 하이라이트 렌더링 (기준/비교 공종 동시 표시 토글)
- [x] imageTransform 기반 정렬 1차 적용 (relativeTo 일치 시 x/y + 회전/스케일)

## 미완성 기능 (확장 과제)
> 핵심 요구사항(탐색/표시/컨텍스트)은 구현 완료했습니다.  
> 아래 항목은 정확도/편의성 고도화를 위한 확장 과제입니다.

- [ ] imageTransform의 도면별 기준 좌표계 차이를 완전 흡수하는 정밀 정렬 엔진
  - 현재 상태: `relativeTo` 일치 조건에서 x/y + 회전/스케일 1차 정렬 적용
- [ ] polygonTransform + imageTransform을 통합한 고정밀 렌더링
  - 현재 상태: polygon 하이라이트 렌더링 및 기준/비교 동시 표시 지원
- [ ] 리비전 간 자동 diff 시각화(변경 영역 마스킹/강조)
  - 현재 상태: before/after 분할 슬라이더로 수동 비교 지원
- [ ] 검색(자연어/키워드), 즐겨찾기, 최근 조회 히스토리
  - 현재 상태: 필터 기반 탐색(공간/공종/영역/리비전) 지원

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

## 설계 문서
UI 설계 의사결정, 데이터 해석, 대안 비교, 미해결 과제는 `DESIGN.md`에 정리했습니다.
