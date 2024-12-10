import React, { useState, useEffect } from "react";
import "./App.css";

let WORD_BANK = [
  "GERMANY",
  "RUSSIA",
  "EGYPT",
  "CHINA",
  "UNITEDKINGDOM",
  "AMERICA",
  "BRAZIL",
  "JAPAN",
  "AUSTRALIA",
  "INDIA",
  "NEWZEALAND",
  "SWEDEN",
  "GREENLAND",
  "ICELAND",
];

/* eslint-disable */
const App = ({ rows = 20, cols = 20 }) => {
  const [solution, setSolution] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [debug, setDebug] = useState([]);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [numberedCells, setNumberedCells] = useState(new Map());
  const [acrossClues, setAcrossClues] = useState(new Map());
  const [downClues, setDownClues] = useState(new Map());
  const [isValid, setIsValid] = useState(false);

  // Validation function to check grid alignment
  const validateGrids = (solutionGrid, userGrid, placedWordsList) => {
    // Check if grids exist and have same dimensions
    if (!solutionGrid?.length || !userGrid?.length) return false;
    if (solutionGrid.length !== userGrid.length) return false;
    if (solutionGrid[0].length !== userGrid[0].length) return false;

    // Verify that all placed words are in their correct positions
    for (const { word, row, col, direction } of placedWordsList) {
      for (let i = 0; i < word.length; i++) {
        const currentRow = direction === "across" ? row : row + i;
        const currentCol = direction === "across" ? col + i : col;

        // Bounds check
        if (
          currentRow >= solutionGrid.length ||
          currentCol >= solutionGrid[0].length
        ) {
          console.error("Word placement out of bounds:", word);
          return false;
        }

        // Check if letter is in correct position in solution grid
        if (solutionGrid[currentRow][currentCol] !== word[i]) {
          console.error("Word misalignment detected:", word);
          return false;
        }

        // Verify corresponding empty space in user grid
        if (userGrid[currentRow][currentCol] !== "") {
          console.error("User grid initialization error:", word);
          return false;
        }
      }
    }

    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            console.log("Fetching..");
            const response = await fetch("https://us-central1-country-crossword.cloudfunctions.net/getCountries");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            if (result.countries) {
                WORD_BANK = result.countries; // Update the word bank with fetched countries
                // Force a re-render of the crossword
                initializeCrossword();
            }
        } catch (error) {
            console.log("error in fetch:", error);
        }
    };

    fetchData();
}, []);

  const generateClueNumbers = (placedWords, grid) => {
    let clueNumber = 1;
    const numberedCells = new Map();
    const acrossClues = new Map();
    const downClues = new Map();

    // First, sort placedWords by position (top to bottom, left to right)
    const sortedWords = [...placedWords].sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });

    // Create a set to track all starting positions
    const startPositions = new Set(
      sortedWords.map(({ row, col }) => `${row}-${col}`)
    );

    // First pass: assign numbers to all starting positions
    sortedWords.forEach(({ row, col }) => {
      const key = `${row}-${col}`;
      if (!numberedCells.has(key)) {
        numberedCells.set(key, clueNumber++);
      }
    });

    // Second pass: assign clues using the established numbers
    sortedWords.forEach(({ word, row, col, direction }) => {
      const key = `${row}-${col}`;
      const cellNumber = numberedCells.get(key);

      if (direction === "across") {
        acrossClues.set(cellNumber, word);
      } else {
        downClues.set(cellNumber, word);
      }
    });

    return { numberedCells, acrossClues, downClues };
  };

  const handleCellInput = (rowIndex, colIndex, value) => {
    if (value.length <= 1) {
      const newGrid = userGrid.map((row) => [...row]);
      newGrid[rowIndex][colIndex] = value.toUpperCase();
      setUserGrid(newGrid);
    }
  };

  const handleSubmitGuess = () => {
    const newRevealed = new Set(revealedCells);

    userGrid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== "" && cell === solution[rowIndex][colIndex]) {
          const key = `${rowIndex}-${colIndex}`;
          newRevealed.add(key);
        }
      });
    });

    setRevealedCells(newRevealed);
  };

  const calculateUsedGrid = (grid) => {
    let minRow = grid.length;
    let maxRow = 0;
    let minCol = grid[0].length;
    let maxCol = 0;

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] !== "") {
          minRow = Math.min(minRow, i);
          maxRow = Math.max(maxRow, i);
          minCol = Math.min(minCol, j);
          maxCol = Math.max(maxCol, j);
        }
      }
    }

    return {
      minRow: Math.max(0, minRow - 1),
      maxRow: Math.min(grid.length - 1, maxRow + 1),
      minCol: Math.max(0, minCol - 1),
      maxCol: Math.min(grid[0].length - 1, maxCol + 1),
    };
  };

  const addPadding = (grid) => {
    let paddedGrid = [...grid.map((row) => [...row])];

    if (grid.some((row) => row[0] !== "")) {
      paddedGrid = paddedGrid.map((row) => ["", ...row]);
    }

    if (grid.some((row) => row[row.length - 1] !== "")) {
      paddedGrid = paddedGrid.map((row) => [...row, ""]);
    }

    if (grid[0].some((cell) => cell !== "")) {
      paddedGrid = [Array(paddedGrid[0].length).fill(""), ...paddedGrid];
    }

    if (grid[grid.length - 1].some((cell) => cell !== "")) {
      paddedGrid = [...paddedGrid, Array(paddedGrid[0].length).fill("")];
    }

    return paddedGrid;
  };

  const validatePlacement = (word, row, col, isAcross, currentGrid) => {
    row = Number(row);
    col = Number(col);

    if (
      isAcross &&
      (col < 0 || col + word.length > cols || row < 0 || row >= rows)
    )
      return false;
    if (
      !isAcross &&
      (row < 0 || row + word.length > rows || col < 0 || col >= cols)
    )
      return false;

    let hasValidIntersection = placedWords.length === 0;

    for (let i = 0; i < word.length; i++) {
      const currentRow = isAcross ? row : row + i;
      const currentCol = isAcross ? col + i : col;
      const currentCell = currentGrid[currentRow][currentCol];

      if (currentCell !== "" && currentCell !== word[i]) return false;

      if (isAcross) {
        if (currentRow > 0) {
          const aboveCell = currentGrid[currentRow - 1][currentCol];
          if (aboveCell !== "" && i !== 0 && i !== word.length - 1)
            return false;
        }
        if (currentRow < rows - 1) {
          const belowCell = currentGrid[currentRow + 1][currentCol];
          if (belowCell !== "" && i !== 0 && i !== word.length - 1)
            return false;
        }
        if (
          i === 0 &&
          col > 0 &&
          currentGrid[currentRow][currentCol - 1] !== ""
        )
          return false;
        if (
          i === word.length - 1 &&
          col + i < cols - 1 &&
          currentGrid[currentRow][currentCol + 1] !== ""
        )
          return false;
      } else {
        if (currentCol > 0) {
          const leftCell = currentGrid[currentRow][currentCol - 1];
          if (leftCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        if (currentCol < cols - 1) {
          const rightCell = currentGrid[currentRow][currentCol + 1];
          if (rightCell !== "" && i !== 0 && i !== word.length - 1)
            return false;
        }
        if (
          i === 0 &&
          row > 0 &&
          currentGrid[currentRow - 1][currentCol] !== ""
        )
          return false;
        if (
          i === word.length - 1 &&
          row + i < rows - 1 &&
          currentGrid[currentRow + 1][currentCol] !== ""
        )
          return false;
      }

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

      for (const { index1, index2 } of commonLetters) {
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
    const newGrid = currentGrid.map((r) => [...r]);
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
    const initializeCrossword = () => {
      let currentGrid = Array.from({ length: rows }, () =>
        Array(cols).fill("")
      );
      let currentPlacedWords = [];
      let debugLog = [];

      const firstWord = WORD_BANK[0];
      const startRow = Math.floor(rows / 2);
      const startCol = Math.floor((cols - firstWord.length) / 2);

      // Place first word and update tracking
      currentGrid = placeWord(
        firstWord,
        startRow,
        startCol,
        "across",
        currentGrid
      );
      currentPlacedWords.push({
        word: firstWord,
        row: startRow,
        col: startCol,
        direction: "across",
      });
      debugLog.push(`Placed ${firstWord} at (${startRow}, ${startCol}) across`);

      const remainingWords = [...WORD_BANK.slice(1)].sort(
        () => Math.random() - 0.5
      );
      for (const word of remainingWords) {
        const intersections = findIntersections(
          word,
          currentGrid,
          currentPlacedWords
        );

        if (intersections.length > 0) {
          const placement = intersections[0];
          currentGrid = placeWord(
            word,
            placement.row,
            placement.col,
            placement.direction,
            currentGrid
          );
          currentPlacedWords.push({
            word,
            row: placement.row,
            col: placement.col,
            direction: placement.direction,
          });
          debugLog.push(
            `Placed ${word} at (${placement.row}, ${placement.col}) ${placement.direction}`
          );
        } else {
          debugLog.push(`Failed to place ${word}`);
        }
      }

      const boundaries = calculateUsedGrid(currentGrid);
      const trimmedGrid = currentGrid
        .slice(boundaries.minRow, boundaries.maxRow + 1)
        .map((row) => row.slice(boundaries.minCol, boundaries.maxCol + 1));

      const paddedGrid = addPadding(trimmedGrid);
      const adjustedPlacedWords = currentPlacedWords.map((word) => ({
        ...word,
        row:
          word.row -
          boundaries.minRow +
          (paddedGrid.length > trimmedGrid.length ? 1 : 0),
        col:
          word.col -
          boundaries.minCol +
          (paddedGrid[0].length > trimmedGrid[0].length ? 1 : 0),
      }));

      const emptyUserGrid = paddedGrid.map((row) =>
        row.map((cell) => (cell !== "" ? "" : cell))
      );

      // Generate numbers and clues
      const {
        numberedCells: newNumberedCells,
        acrossClues: newAcrossClues,
        downClues: newDownClues,
      } = generateClueNumbers(adjustedPlacedWords, paddedGrid);

      // Validate the generated grids
      const isValidSetup = validateGrids(
        paddedGrid,
        emptyUserGrid,
        adjustedPlacedWords
      );

      if (!isValidSetup) {
        console.error("Invalid grid setup detected - retrying...");
        window.location.reload();
        return;
      }

      // Update state only if validation passes
      setSolution(paddedGrid);
      setUserGrid(emptyUserGrid);
      setPlacedWords(adjustedPlacedWords);
      setDebug(debugLog);
      setNumberedCells(newNumberedCells);
      setAcrossClues(newAcrossClues);
      setDownClues(newDownClues);
      setIsValid(true);
    };

    initializeCrossword();
  }, []);

  if (!isValid || !solution.length || !userGrid.length) {
    return <div>Initializing crossword...</div>;
  }

  return (
    <div className="crossword-container">
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${userGrid[0]?.length || 0}, 40px)`,
          gap: "1px",
          backgroundColor: "#000",
          padding: "1px",
        }}
      >
        {userGrid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isRevealed = revealedCells.has(`${rowIndex}-${colIndex}`);
            const cellKey = `${rowIndex}-${colIndex}`;
            const clueNumber = numberedCells.get(cellKey);
            return (
              <div
                key={cellKey}
                className="cell"
                style={{
                  position: "relative",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    cell === "" && solution[rowIndex][colIndex] === ""
                      ? "#000"
                      : "#fff",
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "20px",
                  border:
                    solution[rowIndex][colIndex] !== ""
                      ? "1px solid #000"
                      : "none",
                }}
              >
                {clueNumber && (
                  <div
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: "2px",
                      fontSize: "12px",
                      lineHeight: "12px",
                    }}
                  >
                    {clueNumber}
                  </div>
                )}

                {solution[rowIndex][colIndex] !== "" &&
                  (isRevealed ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#4CAF50",
                      }}
                    >
                      {solution[rowIndex][colIndex]}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) =>
                        handleCellInput(rowIndex, colIndex, e.target.value)
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        textAlign: "center",
                        fontSize: "20px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        backgroundColor: "transparent",
                      }}
                      maxLength={1}
                    />
                  ))}
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={handleSubmitGuess}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Submit Guesses
      </button>

      <div className="word-list" style={{ marginTop: "20px" }}>
        <h3>Words to Find:</h3>
        {WORD_BANK.map((word, index) => (
          <div key={index}>{word}</div>
        ))}
      </div>
    </div>
  );
};

export default App;
