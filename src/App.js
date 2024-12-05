import React, { useState, useEffect } from "react";
import "../src/App.css";

const WORD_BANK = [
  "GERMANY", "RUSSIA", "EGYPT", "CHINA",
  "UNITEDKINGDOM", "AMERICA", "BRAZIL", "JAPAN",
  "AUSTRALIA", "INDIA", "NEWZEALAND", "SWEDEN", "GREENLAND", "ICELAND"
];

const App = ({ rows = 20, cols = 20 }) => {
  const [grid, setGrid] = useState(Array.from({ length: rows }, () => Array(cols).fill("")));
  const [placedWords, setPlacedWords] = useState([]);
  const [debug, setDebug] = useState([]);

  const validatePlacement = (word, row, col, isAcross, currentGrid) => {
    row = Number(row);
    col = Number(col);

    if (isAcross && (col < 0 || col + word.length > cols || row < 0 || row >= rows)) return false;
    if (!isAcross && (row < 0 || row + word.length > rows || col < 0 || col >= cols)) return false;

    let hasValidIntersection = placedWords.length === 0;

    // Check each position of the word
    for (let i = 0; i < word.length; i++) {
      const currentRow = isAcross ? row : row + i;
      const currentCol = isAcross ? col + i : col;
      const currentCell = currentGrid[currentRow][currentCol];

      // If cell is not empty, it must match the word letter
      if (currentCell !== "" && currentCell !== word[i]) return false;

      // Check adjacent cells
      if (isAcross) {
        // Check cells above and below
        if (currentRow > 0) {
          const aboveCell = currentGrid[currentRow - 1][currentCol];
          if (aboveCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        if (currentRow < rows - 1) {
          const belowCell = currentGrid[currentRow + 1][currentCol];
          if (belowCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        // Check before and after word
        if (i === 0 && col > 0 && currentGrid[currentRow][currentCol - 1] !== "") return false;
        if (i === word.length - 1 && col + i < cols - 1 && currentGrid[currentRow][currentCol + 1] !== "") return false;
      } else {
        // Check cells to left and right
        if (currentCol > 0) {
          const leftCell = currentGrid[currentRow][currentCol - 1];
          if (leftCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        if (currentCol < cols - 1) {
          const rightCell = currentGrid[currentRow][currentCol + 1];
          if (rightCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        // Check before and after word
        if (i === 0 && row > 0 && currentGrid[currentRow - 1][currentCol] !== "") return false;
        if (i === word.length - 1 && row + i < rows - 1 && currentGrid[currentRow + 1][currentCol] !== "") return false;
      }

      // Check for valid intersection
      if (currentCell !== "") {
        hasValidIntersection = true;
      }
    }

    return hasValidIntersection;
  };

  const findCommonLetters = (word1, word2) => {
    const commonLetters = [];
    for (let i = 0; i < word1.length; i++) {
      for (let j = 0; j < word2.length; j++) {
        if (word1[i] === word2[j]) {
          commonLetters.push({ index1: i, index2: j, letter: word1[i] });
        }
      }
    }
    return commonLetters;
  };

  const findIntersections = (word, currentGrid, placedWords) => {
    const intersections = [];
    
    for (const placedWord of placedWords) {
      const commonLetters = findCommonLetters(word, placedWord.word);
      
      for (const { index1, index2, letter } of commonLetters) {
        if (placedWord.direction === "across") {
          const row = placedWord.row;
          const col = placedWord.col + index2;
          const newRow = row - index1;
          
          if (validatePlacement(word, newRow, col, false, currentGrid)) {
            intersections.push({ row: newRow, col, direction: "down" });
          }
        } else {
          const row = placedWord.row + index2;
          const col = placedWord.col;
          const newCol = col - index1;
          
          if (validatePlacement(word, row, newCol, true, currentGrid)) {
            intersections.push({ row, col: newCol, direction: "across" });
          }
        }
      }
    }
    
    return intersections;
  };

  const placeWord = (word, row, col, direction, currentGrid) => {
    const newGrid = currentGrid.map(r => [...r]);
    for (let i = 0; i < word.length; i++) {
      if (direction === "across") {
        newGrid[row][col + i] = word[i];
      } else {
        newGrid[row + i][col] = word[i];
      }
    }
    return newGrid;
  };

  useEffect(() => {
    let currentGrid = Array.from({ length: rows }, () => Array(cols).fill(""));
    let currentPlacedWords = [];
    let debugLog = [];

    const firstWord = WORD_BANK[0];
    const startRow = Math.floor(rows / 2);
    const startCol = Math.floor((cols - firstWord.length) / 2);
    currentGrid = placeWord(firstWord, startRow, startCol, "across", currentGrid);
    currentPlacedWords.push({ word: firstWord, row: startRow, col: startCol, direction: "across" });
    debugLog.push(`Placed ${firstWord} at (${startRow}, ${startCol}) across`);

    const remainingWords = [...WORD_BANK.slice(1)].sort(() => Math.random() - 0.5);
    for (const word of remainingWords) {
      const intersections = findIntersections(word, currentGrid, currentPlacedWords);

      if (intersections.length > 0) {
        const placement = intersections[0];
        currentGrid = placeWord(word, placement.row, placement.col, placement.direction, currentGrid);
        currentPlacedWords.push({
          word,
          row: placement.row,
          col: placement.col,
          direction: placement.direction
        });
        debugLog.push(`Placed ${word} at (${placement.row}, ${placement.col}) ${placement.direction}`);
      } else {
        debugLog.push(`Failed to place ${word}`);
      }
    }

    setGrid(currentGrid);
    setPlacedWords(currentPlacedWords);
    setDebug(debugLog);
  }, []);

  return (
    <div className="crossword-container">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}>
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className="cell">
              {cell}
            </div>
          ))
        ))}
      </div>
      
      <div className="debug" style={{ marginTop: '20px', fontFamily: 'monospace' }}>
        {debug.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default App;