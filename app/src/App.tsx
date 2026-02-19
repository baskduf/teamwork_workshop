import { useEffect, useMemo, useState } from 'react'
import './App.css'

type ImageTransform = {
  relativeTo?: string
  x: number
  y: number
  scale: number
  rotation: number
}

type Revision = {
  version: string
  image: string
  date: string
  description: string
  changes: string[]
  imageTransform?: ImageTransform
  polygon?: PolygonData
}

type PolygonData = {
  vertices: [number, number][]
  polygonTransform?: {
    x: number
    y: number
    scale: number
    rotation: number
  }
}

type Region = {
  polygon?: PolygonData
  revisions: Revision[]
}

type DisciplineData = {
  image?: string
  imageTransform?: ImageTransform
  polygon?: PolygonData
  revisions?: Revision[]
  regions?: Record<string, Region>
}

type Drawing = {
  id: string
  name: string
  image: string
  parent: string | null
  disciplines?: Record<string, DisciplineData>
}

type Metadata = {
  project: { name: string }
  drawings: Record<string, Drawing>
}

function getRevisionList(discipline?: DisciplineData, regionName?: string) {
  if (!discipline) return [] as Revision[]
  if (regionName && discipline.regions?.[regionName]) {
    return discipline.regions[regionName].revisions
  }
  return discipline.revisions ?? []
}

function getTransformStyle(
  overlay: ImageTransform | undefined,
  baseImageName: string | undefined,
  overlayOpacity: number,
) {
  const fallback = { opacity: overlayOpacity / 100 }
  if (!overlay || !baseImageName || !overlay.relativeTo) return fallback

  if (overlay.relativeTo !== baseImageName) return fallback

  return {
    opacity: overlayOpacity / 100,
    transformOrigin: `${overlay.x}px ${overlay.y}px`,
    transform: `translate(0px, 0px) rotate(${overlay.rotation}rad) scale(${overlay.scale})`,
  }
}

function App() {
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [selectedDrawingId, setSelectedDrawingId] = useState('01')
  const [selectedDiscipline, setSelectedDiscipline] = useState('건축')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [selectedRevision, setSelectedRevision] = useState('')

  const [compareMode, setCompareMode] = useState(false)
  const [secondaryDiscipline, setSecondaryDiscipline] = useState('')
  const [secondaryRevision, setSecondaryRevision] = useState('')
  const [overlayOpacity, setOverlayOpacity] = useState(55)
  const [imgSize, setImgSize] = useState({ width: 1000, height: 700 })

  useEffect(() => {
    fetch('/data/metadata.json')
      .then((res) => res.json())
      .then((data: Metadata) => setMetadata(data))
      .catch((e) => console.error('metadata load failed', e))
  }, [])

  const childDrawings = useMemo(() => {
    if (!metadata) return []
    return Object.values(metadata.drawings).filter((d) => d.parent === '00')
  }, [metadata])

  const currentDrawing = metadata?.drawings[selectedDrawingId]

  const disciplineNames = useMemo(() => {
    if (!currentDrawing?.disciplines) return []
    return Object.keys(currentDrawing.disciplines)
  }, [currentDrawing])

  useEffect(() => {
    if (!disciplineNames.includes(selectedDiscipline) && disciplineNames.length > 0) {
      setSelectedDiscipline(disciplineNames[0])
    }
  }, [disciplineNames, selectedDiscipline])

  useEffect(() => {
    if (!disciplineNames.includes(secondaryDiscipline)) {
      const fallback = disciplineNames.find((d) => d !== selectedDiscipline) ?? disciplineNames[0] ?? ''
      setSecondaryDiscipline(fallback)
    }
  }, [disciplineNames, secondaryDiscipline, selectedDiscipline])

  const currentDiscipline = currentDrawing?.disciplines?.[selectedDiscipline]

  const regionNames = useMemo(() => {
    if (!currentDiscipline?.regions) return []
    return Object.keys(currentDiscipline.regions)
  }, [currentDiscipline])

  useEffect(() => {
    if (regionNames.length === 0) {
      setSelectedRegion('')
      return
    }
    if (!regionNames.includes(selectedRegion)) {
      setSelectedRegion(regionNames[0])
    }
  }, [regionNames, selectedRegion])

  const revisionList = useMemo(
    () => getRevisionList(currentDiscipline, selectedRegion),
    [currentDiscipline, selectedRegion],
  )

  useEffect(() => {
    if (revisionList.length === 0) {
      setSelectedRevision('')
      return
    }
    if (!revisionList.some((r) => r.version === selectedRevision)) {
      setSelectedRevision(revisionList[revisionList.length - 1].version)
    }
  }, [revisionList, selectedRevision])

  const selectedRevisionData = revisionList.find((r) => r.version === selectedRevision)

  const secondaryDisciplineData = currentDrawing?.disciplines?.[secondaryDiscipline]
  const secondaryRevisionList = useMemo(
    () => getRevisionList(secondaryDisciplineData, selectedRegion),
    [secondaryDisciplineData, selectedRegion],
  )

  useEffect(() => {
    if (secondaryRevisionList.length === 0) {
      setSecondaryRevision('')
      return
    }
    if (!secondaryRevisionList.some((r) => r.version === secondaryRevision)) {
      setSecondaryRevision(secondaryRevisionList[secondaryRevisionList.length - 1].version)
    }
  }, [secondaryRevisionList, secondaryRevision])

  const selectedSecondaryRevisionData = secondaryRevisionList.find(
    (r) => r.version === secondaryRevision,
  )

  const baseImage = selectedRevisionData?.image || currentDiscipline?.image || currentDrawing?.image
  const overlayImage =
    selectedSecondaryRevisionData?.image || secondaryDisciplineData?.image || currentDrawing?.image

  const overlayTransform = selectedSecondaryRevisionData?.imageTransform || secondaryDisciplineData?.imageTransform
  const overlayStyle = getTransformStyle(overlayTransform, baseImage, overlayOpacity)

  const currentPolygon: PolygonData | undefined =
    (selectedRegion && currentDiscipline?.regions?.[selectedRegion]?.polygon) ||
    selectedRevisionData?.polygon ||
    currentDiscipline?.polygon

  const polygonPoints = currentPolygon?.vertices?.map(([x, y]) => `${x},${y}`).join(' ') ?? ''
  const polyTf = currentPolygon?.polygonTransform
  const polygonTransform = polyTf
    ? `translate(${polyTf.x} ${polyTf.y}) rotate(${(polyTf.rotation * 180) / Math.PI}) scale(${polyTf.scale}) translate(${-polyTf.x} ${-polyTf.y})`
    : undefined

  if (!metadata) {
    return <main className="container">데이터 로딩 중...</main>
  }

  return (
    <main className="container">
      <header className="header">
        <h1>건설 도면 탐색 프로토타입</h1>
        <p>{metadata.project.name} · 원하는 도면까지 빠르게 탐색</p>
      </header>

      <section className="panel controls">
        <label>
          공간(건물)
          <select value={selectedDrawingId} onChange={(e) => setSelectedDrawingId(e.target.value)}>
            {childDrawings.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          공종
          <select value={selectedDiscipline} onChange={(e) => setSelectedDiscipline(e.target.value)}>
            {disciplineNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {regionNames.length > 0 && (
          <label>
            영역(Region)
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              {regionNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}

        {revisionList.length > 0 && (
          <label>
            리비전
            <select value={selectedRevision} onChange={(e) => setSelectedRevision(e.target.value)}>
              {revisionList.map((rev) => (
                <option key={rev.version} value={rev.version}>
                  {rev.version} ({rev.date})
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      <section className="panel context">
        <strong>현재 컨텍스트</strong>
        <p>
          전체 배치도 / {currentDrawing?.name} / {selectedDiscipline}
          {selectedRegion ? ` / ${selectedRegion}` : ''}
          {selectedRevision ? ` / ${selectedRevision}` : ''}
        </p>
        {selectedRevisionData && (
          <>
            <p>설명: {selectedRevisionData.description}</p>
            <p>
              변경사항:{' '}
              {selectedRevisionData.changes.length
                ? selectedRevisionData.changes.join(', ')
                : '초기 설계'}
            </p>
          </>
        )}
      </section>

      <section className="panel compare">
        <label className="inline">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => setCompareMode(e.target.checked)}
          />
          비교/오버레이 모드
        </label>

        {compareMode && (
          <div className="compareGrid">
            <label>
              비교 공종
              <select value={secondaryDiscipline} onChange={(e) => setSecondaryDiscipline(e.target.value)}>
                {disciplineNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            {secondaryRevisionList.length > 0 && (
              <label>
                비교 리비전
                <select value={secondaryRevision} onChange={(e) => setSecondaryRevision(e.target.value)}>
                  {secondaryRevisionList.map((rev) => (
                    <option key={rev.version} value={rev.version}>
                      {rev.version} ({rev.date})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              오버레이 투명도 ({overlayOpacity}%)
              <input
                type="range"
                min={10}
                max={100}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              />
            </label>
            <p className="hint">
              정렬 규칙: 비교 도면의 imageTransform.relativeTo가 현재 기준 이미지와 같을 때 회전/스케일을 적용합니다.
            </p>
          </div>
        )}
      </section>

      <section className="panel viewer">
        {baseImage ? (
          <div className="viewerStack">
            <img
              src={`/data/drawings/${baseImage}`}
              alt={baseImage}
              onLoad={(e) => {
                const img = e.currentTarget
                setImgSize({ width: img.naturalWidth, height: img.naturalHeight })
              }}
            />
            {polygonPoints && (
              <svg
                className="polygon-layer"
                viewBox={`0 0 ${imgSize.width} ${imgSize.height}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <polygon points={polygonPoints} transform={polygonTransform} />
              </svg>
            )}
            {compareMode && overlayImage && (
              <img
                className="overlay"
                src={`/data/drawings/${overlayImage}`}
                alt={overlayImage}
                style={overlayStyle}
              />
            )}
          </div>
        ) : (
          <p>선택한 조건에 맞는 도면 이미지가 없습니다.</p>
        )}
      </section>
    </main>
  )
}

export default App
