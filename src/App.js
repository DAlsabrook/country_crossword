import React, { useState } from "react";
import "./App.css";

const App = ({ rows = 10, cols = 10 }) => {
  const [grid, setGrid] = useState(
    Array.from({ length: rows }, () => Array(cols).fill(""))
  );

  const handleInputChange = (rowIndex, colIndex, value) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    setGrid(newGrid);
  };

  return (
    <div className="crossword-container">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="crossword-row">
          {row.map((cell, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              type="text"
              maxLength={1}
              value={cell}
              onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value.toUpperCase())}
              className="crossword-cell"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;
