import { FC, useMemo } from 'react';

interface MazeProps {
  start: [number, number];
  end: [number, number];
  edges: [[number, number], [number, number]][];
  path: [number, number][]; 
  rover?: {pos: [number, number], angle: number};
}

const DrawMaze: FC<MazeProps> = ({ start, end, edges, path, rover }) => {
  const svgContent = useMemo(() => {
    const background = `<rect width="300" height="200" fill="#404040" />`;
    const edgeSvgString = edges.map(([from, to]) => 
      `<line x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" stroke="#FFF" stroke-width="18" stroke-linecap="round" />`
    ).join('');
    const startSvgString = `<circle cx="${start[0]}" cy="${start[1]}" r="6" fill="#047857" />`;
    const endSvgString = `<circle cx="${end[0]}" cy="${end[1]}" r="6" fill="#dc2626" />`;

    // Add pathSvgString for drawing the path
    let pathSvgString = "";
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i+1];
      pathSvgString += `<line x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" stroke="#a78bfa" stroke-width="4" stroke-linecap="round" />`;
    }

    // Add rover position and angle
    let roverSvgString = "";

    if (rover) {
      const { pos, angle } = rover;
      const adjustedAngle = 90 - angle; // Adjust the angle so that 0 points east
      const [cx, cy] = pos;
      const size = 5; // You can adjust this as needed
      roverSvgString = `
        <g transform="translate(${cx} ${cy}) rotate(${adjustedAngle})">
          <polygon points="${-size},${-size} ${size},${-size} 0,${size}" fill="black" />
        </g>`;
    }
    
    return `${background}${edgeSvgString}${pathSvgString}${roverSvgString}${startSvgString}${endSvgString}`;
  }, [start, end, edges, path, rover]);

  return (
    <svg width="450" height="300" viewBox="0 0 300 200" className="border border-gray-400" dangerouslySetInnerHTML={{ __html: svgContent }} />
      
  );
};

export default DrawMaze;
