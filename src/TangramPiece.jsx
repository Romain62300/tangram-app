import { useEffect, useRef } from 'react';

const PADDING = 20; // Padding around the shape inside its SVG viewport

export default function TangramPiece({
  piece,
  state,
  onDragStart,
  onRotate,
  onVertexDrag,
  isSelected,
  editHandles,
}) {
  const { color, id } = piece;
  const { x, y, rotation, points } = state;
  const vertexDragCleanupRef = useRef(null);

  // Remove global listeners if this component unmounts during a vertex drag.
  useEffect(() => {
    return () => {
      vertexDragCleanupRef.current?.();
    };
  }, []);

  if (!points || points.length === 0) return null;

  const xs = points.map(([px]) => px);
  const ys = points.map(([, py]) => py);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const w = maxX - minX + PADDING * 2;
  const h = maxY - minY + PADDING * 2;

  // Translate the shape so it sits inside the SVG padding.
  const ox = -minX + PADDING;
  const oy = -minY + PADDING;
  const svgPoints = points.map(([px, py]) => `${px + ox},${py + oy}`).join(' ');

  function handleBodyMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    onDragStart(e, id);
  }

  function handleWheel(e) {
    e.preventDefault();
    onRotate(id, e.deltaY > 0 ? 15 : -15);
  }

  function handleVertexMouseDown(e, vi) {
    e.preventDefault();
    e.stopPropagation();

    // Ensure a previous drag cannot leave duplicate global listeners.
    vertexDragCleanupRef.current?.();

    const startMX = e.clientX;
    const startMY = e.clientY;
    const [startVX, startVY] = points[vi];

    function onMove(me) {
      // Convert the mouse movement to the piece's local rotated coordinates.
      const rad = (-rotation * Math.PI) / 180;
      const dmx = me.clientX - startMX;
      const dmy = me.clientY - startMY;
      const localDx = dmx * Math.cos(rad) - dmy * Math.sin(rad);
      const localDy = dmx * Math.sin(rad) + dmy * Math.cos(rad);
      onVertexDrag(id, vi, startVX + localDx, startVY + localDy);
    }

    function cleanup() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', cleanup);
      if (vertexDragCleanupRef.current === cleanup) {
        vertexDragCleanupRef.current = null;
      }
    }

    vertexDragCleanupRef.current = cleanup;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', cleanup);
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: `${w / 2}px ${h / 2}px`,
        cursor: 'grab',
        userSelect: 'none',
        filter: isSelected
          ? 'drop-shadow(0 0 8px rgba(0,0,0,0.55))'
          : 'drop-shadow(1px 2px 4px rgba(0,0,0,0.25))',
        zIndex: isSelected ? 100 : 10,
        touchAction: 'none',
      }}
      onMouseDown={handleBodyMouseDown}
      onWheel={handleWheel}
    >
      <svg
        width={w}
        height={h}
        style={{ overflow: 'visible', display: 'block' }}
      >
        <polygon
          points={svgPoints}
          fill={color}
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {editHandles &&
          points.map(([px, py], vi) => (
            <circle
              key={vi}
              cx={px + ox}
              cy={py + oy}
              r={7}
              fill="#fff"
              stroke={color}
              strokeWidth="2.5"
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handleVertexMouseDown(e, vi)}
            />
          ))}
      </svg>
    </div>
  );
}
