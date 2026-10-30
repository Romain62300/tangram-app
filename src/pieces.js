
// Tangram classique : 7 pièces aux proportions correctes

const SQRT2 = Math.sqrt(2);

export const PIECES = [
  {
    id: 'large-tri-1',
    label: 'Grand Triangle 1',
    color: '#E74C3C',
    points: [
      [0, 0],
      [4, 0],
      [0, 4],
    ],
  },
  {
    id: 'large-tri-2',
    label: 'Grand Triangle 2',
    color: '#3498DB',
    points: [
      [0, 0],
      [4, 0],
      [0, 4],
    ],
  },
  {
    id: 'medium-tri',
    label: 'Triangle Moyen',
    color: '#2ECC71',
    points: [
      [0, 0],
      [2 * SQRT2, 0],
      [0, 2 * SQRT2],
    ],
  },
  {
    id: 'small-tri-1',
    label: 'Petit Triangle 1',
    color: '#F39C12',
    points: [
      [0, 0],
      [2, 0],
      [0, 2],
    ],
  },
  {
    id: 'small-tri-2',
    label: 'Petit Triangle 2',
    color: '#9B59B6',
    points: [
      [0, 0],
      [2, 0],
      [0, 2],
    ],
  },
  {
    id: 'square',
    label: 'Carré',
    color: '#1ABC9C',
    points: [
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ],
  },
  {
    id: 'parallelogram',
    label: 'Parallélogramme',
    color: '#E67E22',
    points: [
      [0, 2],
      [2, 2],
      [4, 0],
      [2, 0],
    ],
  },
];

// Échelle : 1 unité = 50 pixels
export const SCALE = 50;

// Convertit les points en coordonnées SVG
export function toSVGPoints(points) {
  return points
    .map(([x, y]) => `${x * SCALE},${y * SCALE}`)
    .join(' ');
}

// Calcule les dimensions et les limites d'une pièce
export function getBoundingBox(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

// Calcule le centre moyen des sommets d'une pièce
export function getCentroid(points) {
  const cx =
    points.reduce((sum, [x]) => sum + x, 0) / points.length;

  const cy =
    points.reduce((sum, [, y]) => sum + y, 0) / points.length;

  return [cx, cy];
}
