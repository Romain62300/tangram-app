import { useState, useRef, useCallback, useEffect } from 'react';
import { PIECES, SCALE } from './pieces';
import TangramPiece from './TangramPiece';
import TargetSilhouette from './TargetSilhouette';
import FigureLibrary from './FigureLibrary';

// ── helpers ──────────────────────────────────────────────────────────────────

function randomColor() {
  const palette = [
    '#E74C3C','#3498DB','#2ECC71','#F39C12','#9B59B6',
    '#1ABC9C','#E67E22','#E91E63','#00BCD4','#8BC34A',
  ];
  return palette[Math.floor(Math.random() * palette.length)];
}

// Convert original piece unit-coords to pixel coords
function unitToPixels(unitPoints) {
  return unitPoints.map(([x, y]) => [x * SCALE, y * SCALE]);
}

// Build piece catalogue: static metadata (id, label, color) + initial pixel points
function buildCatalogue() {
  return PIECES.map((p) => ({
    id: p.id,
    label: p.label,
    color: p.color,
  }));
}

function getInitialPieceStates() {
  return PIECES.reduce((acc, piece, i) => {
    acc[piece.id] = {
      x: 630 + (i % 2) * 165,
      y: 40 + Math.floor(i / 2) * 140,
      rotation: 0,
      points: unitToPixels(piece.points),
    };
    return acc;
  }, {});
}

const INITIAL_CATALOGUE = buildCatalogue();

// ── component ─────────────────────────────────────────────────────────────────

export default function GameBoard() {
  const [catalogue, setCatalogue] = useState(INITIAL_CATALOGUE);
  const [pieceStates, setPieceStates] = useState(getInitialPieceStates);
  const [pieceOrder, setPieceOrder] = useState(PIECES.map((p) => p.id));
  const [selectedId, setSelectedId] = useState(null);
  const [editHandles, setEditHandles] = useState(false);

  // Draw mode
  const [drawMode, setDrawMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState([]);
  const [drawCursor, setDrawCursor] = useState(null);

  // Figure library
  const [showLibrary, setShowLibrary] = useState(false);
  const [activeFigureId, setActiveFigureId] = useState('cat');

  const boardRef = useRef(null);
  const dragRef = useRef(null);

  // ── drag piece ────────────────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e, id) => {
      if (drawMode) return;
      dragRef.current = {
        id,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startPieceX: pieceStates[id].x,
        startPieceY: pieceStates[id].y,
      };
      setSelectedId(id);
      setPieceOrder((prev) => [...prev.filter((pid) => pid !== id), id]);
    },
    [pieceStates, drawMode]
  );

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { id, startMouseX, startMouseY, startPieceX, startPieceY } = dragRef.current;
    const dx = e.clientX - startMouseX;
    const dy = e.clientY - startMouseY;
    setPieceStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], x: startPieceX + dx, y: startPieceY + dy },
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    setSelectedId(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ── rotate ────────────────────────────────────────────────────────────────

  const handleRotate = useCallback((id, delta) => {
    setPieceStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], rotation: prev[id].rotation + delta },
    }));
  }, []);

  // ── vertex deform ─────────────────────────────────────────────────────────

  const handleVertexDrag = useCallback((id, vi, newX, newY) => {
    setPieceStates((prev) => {
      const pts = prev[id].points.map((p, i) =>
        i === vi ? [newX, newY] : p
      );
      return { ...prev, [id]: { ...prev[id], points: pts } };
    });
  }, []);

  // ── draw mode ─────────────────────────────────────────────────────────────

  function getBoardCoords(e) {
    const rect = boardRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function handleBoardMouseMove(e) {
    if (drawMode) setDrawCursor(getBoardCoords(e));
  }

  function handleBoardClick(e) {
    if (!drawMode) return;
    const [cx, cy] = getBoardCoords(e);

    if (drawPoints.length > 0) {
      const [fx, fy] = drawPoints[0];
      if (Math.hypot(cx - fx, cy - fy) < 12) {
        commitDrawing();
        return;
      }
    }
    setDrawPoints((prev) => [...prev, [cx, cy]]);
  }

  function handleBoardDblClick(e) {
    if (!drawMode) return;
    e.preventDefault();
    commitDrawing();
  }

  function commitDrawing() {
    if (drawPoints.length < 3) {
      setDrawPoints([]);
      return;
    }
    const id = `custom-${Date.now()}`;
    const color = randomColor();
    const newPiece = { id, label: 'Pièce custom', color };
    // centre la pièce sur ses points (origin = bounding box top-left)
    const xs = drawPoints.map(([x]) => x);
    const ys = drawPoints.map(([, y]) => y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const localPts = drawPoints.map(([x, y]) => [x - minX, y - minY]);

    setCatalogue((prev) => [...prev, newPiece]);
    setPieceStates((prev) => ({
      ...prev,
      [id]: { x: minX, y: minY, rotation: 0, points: localPts },
    }));
    setPieceOrder((prev) => [...prev, id]);
    setDrawPoints([]);
    setDrawCursor(null);
    setDrawMode(false);
  }

  function cancelDraw() {
    setDrawPoints([]);
    setDrawCursor(null);
    setDrawMode(false);
  }

  // ── save / load ───────────────────────────────────────────────────────────

  function buildSavePayload() {
    return { catalogue, pieceStates, pieceOrder };
  }

  function handleSave() {
    const payload = buildSavePayload();
    localStorage.setItem('tangram-save', JSON.stringify(payload));
  }

  function handleLoad() {
    try {
      const raw = localStorage.getItem('tangram-save');
      if (!raw) return alert('Aucune sauvegarde trouvée.');
      const { catalogue: cat, pieceStates: ps, pieceOrder: po } = JSON.parse(raw);
      setCatalogue(cat);
      setPieceStates(ps);
      setPieceOrder(po);
    } catch {
      alert('Erreur lors du chargement.');
    }
  }

  function handleExportJSON() {
    const payload = buildSavePayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tangram-save.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { catalogue: cat, pieceStates: ps, pieceOrder: po } = JSON.parse(ev.target.result);
        setCatalogue(cat);
        setPieceStates(ps);
        setPieceOrder(po);
      } catch {
        alert('Fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    setCatalogue(INITIAL_CATALOGUE);
    setPieceStates(getInitialPieceStates());
    setPieceOrder(PIECES.map((p) => p.id));
    setSelectedId(null);
    setDrawPoints([]);
    setDrawMode(false);
  }

  // ── render ────────────────────────────────────────────────────────────────

  const importRef = useRef(null);

  return (
    <div className="game-wrapper">
      {/* ── Header ── */}
      <header className="game-header">
        <h1>Tangram</h1>

        <div className="header-group">
          <button
            className={`btn-tool ${drawMode ? 'active' : ''}`}
            onClick={() => { setDrawMode((v) => !v); setDrawPoints([]); }}
            title="Mode dessin : cliquer pour poser des points, double-clic pour fermer"
          >
            {drawMode ? '✏️ Dessin actif' : '✏️ Dessiner'}
          </button>
          {drawMode && (
            <button className="btn-tool danger" onClick={cancelDraw}>Annuler</button>
          )}
        </div>

        <div className="header-group">
          <button
            className={`btn-tool ${editHandles ? 'active' : ''}`}
            onClick={() => setEditHandles((v) => !v)}
            title="Affiche les poignées de déformation sur les sommets"
          >
            ⬡ Déformer
          </button>
        </div>

        <div className="header-group">
          <button
            className="btn-tool"
            onClick={() => setShowLibrary((v) => !v)}
          >
            🖼 Figures
          </button>
        </div>

        <div className="header-group">
          <button className="btn-tool" onClick={handleSave}>💾 Sauvegarder</button>
          <button className="btn-tool" onClick={handleLoad}>📂 Charger</button>
          <button className="btn-tool" onClick={handleExportJSON}>⬇ Export JSON</button>
          <button className="btn-tool" onClick={() => importRef.current.click()}>⬆ Import JSON</button>
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImportJSON} />
        </div>

        <button onClick={handleReset} className="btn-reset" style={{ marginLeft: 'auto' }}>
          ↺ Réinitialiser
        </button>
      </header>

      {/* ── Board ── */}
      <div
        className={`board-container${drawMode ? ' draw-mode' : ''}`}
        ref={boardRef}
        onClick={handleBoardClick}
        onDoubleClick={handleBoardDblClick}
        onMouseMove={handleBoardMouseMove}
      >
        {/* Silhouette cible */}
        <TargetSilhouette figureId={activeFigureId} />

        {/* Draw-mode overlay */}
        {drawMode && (
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 200 }}
          >
            {drawPoints.length > 0 && (
              <>
                <polyline
                  points={[
                    ...drawPoints,
                    ...(drawCursor ? [drawCursor] : []),
                  ]
                    .map(([x, y]) => `${x},${y}`)
                    .join(' ')}
                  fill="none"
                  stroke="#E74C3C"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />
                {/* first point snap indicator */}
                <circle
                  cx={drawPoints[0][0]}
                  cy={drawPoints[0][1]}
                  r={10}
                  fill="none"
                  stroke="#E74C3C"
                  strokeWidth="2"
                />
              </>
            )}
            {drawPoints.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r={4} fill="#E74C3C" />
            ))}
            {drawCursor && (
              <circle cx={drawCursor[0]} cy={drawCursor[1]} r={4} fill="#E74C3C" opacity={0.5} />
            )}
          </svg>
        )}

        {/* Pieces */}
        {pieceOrder.map((id) => {
          const meta = catalogue.find((p) => p.id === id);
          const st = pieceStates[id];
          if (!meta || !st) return null;
          return (
            <TangramPiece
              key={id}
              piece={meta}
              state={st}
              onDragStart={handleDragStart}
              onRotate={handleRotate}
              onVertexDrag={handleVertexDrag}
              isSelected={selectedId === id}
              editHandles={editHandles}
            />
          );
        })}

        {/* Figure library panel */}
        {showLibrary && (
          <FigureLibrary
            activeFigureId={activeFigureId}
            onSelect={(id) => { setActiveFigureId(id); setShowLibrary(false); }}
            onClose={() => setShowLibrary(false)}
          />
        )}

        {/* Rotation / control panel */}
        <div className="rotation-panel">
          <p>Rotation</p>
          {catalogue.map((piece) => {
            const st = pieceStates[piece.id];
            if (!st) return null;
            return (
              <div key={piece.id} className="rot-row">
                <span className="piece-dot" style={{ background: piece.color }} />
                <span className="piece-name">{piece.label}</span>
                <button onClick={() => handleRotate(piece.id, -15)}>↺</button>
                <button onClick={() => handleRotate(piece.id, 15)}>↻</button>
              </div>
            );
          })}
        </div>

        {/* Draw mode hint */}
        {drawMode && (
          <div className="draw-hint">
            ✏️ Cliquez pour poser des points · Double-clic ou clic sur le 1er point pour fermer
          </div>
        )}
      </div>
    </div>
  );
}
