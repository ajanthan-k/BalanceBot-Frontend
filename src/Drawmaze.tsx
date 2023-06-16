import { FC } from 'react';

interface MazeProps {
  maze: number[][];
}

const Drawmaze: FC<MazeProps> = ({maze}) => {
  
  if (!maze || maze.length === 0) {
    return <svg width={448} height={250} className="border border-gray-400"> 
           <text x="10" y="25" fill="black">Maze placeholder</text>
           </svg>
  }
  const openColour: string = '#ffffff';
  const startColour: string = '#00FF00';
  const endColour: string = '#FF0000';
  const wallColour: string = '#000000';
  const blockedColour: string = '#808080';

  const cellSize: number = 2;

  const svgWidth: number = maze[0].length * cellSize;
  const svgHeight: number = maze.length * cellSize;


  const renderMaze = (): JSX.Element[][] => {
    const mazeSvg: JSX.Element[][] = maze.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const x: number = colIndex * cellSize;
        const y: number = rowIndex * cellSize;

        switch (cell) {
            case 0: 
              return <rect key={`${rowIndex}-${colIndex}`} x={x} y={y} width={cellSize} height={cellSize} fill={openColour} />;
            case 1:
              return <rect key={`${rowIndex}-${colIndex}`} x={x} y={y} width={cellSize} height={cellSize} fill={startColour} />;
            case 2:
              return <rect key={`${rowIndex}-${colIndex}`} x={x} y={y} width={cellSize} height={cellSize} fill={endColour} />;
            case 3:
              return <rect key={`${rowIndex}-${colIndex}`} x={x} y={y} width={cellSize} height={cellSize} fill={wallColour} />;
            case 4:
              return <rect key={`${rowIndex}-${colIndex}`} x={x} y={y} width={cellSize} height={cellSize} fill={blockedColour} />;
            default:
              return <rect key={`${rowIndex}-${colIndex}`} x={x} y={y} width={cellSize} height={cellSize} fill={openColour} />;
        }
      })
    );
    return mazeSvg;
  
  };

  // Render the SVG
  return (
    <svg width={svgWidth} height={svgHeight} className="border border-gray-400">
      {renderMaze()}
    </svg>
  );
};

export default Drawmaze;