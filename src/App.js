import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import "./App.css"

const App = () => {
  const [solution, setSolution] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [placedWords, setPlacedWords] = useState([]);
  const [debug, setDebug] = useState([]);
  const [numberedCells, setNumberedCells] = useState(new Map());
  const [acrossClues, setAcrossClues] = useState(new Map());
  const [downClues, setDownClues] = useState(new Map());
  const [isValid, setIsValid] = useState(false);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [wordBank, setWordBank] = useState([]);
  const [hints, setHints] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const rows = 15;
  const cols = 15;

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

  const findIntersections = (word, currentGrid, currentPlacedWords) => {
    const intersections = [];

    for (const placedWord of currentPlacedWords) {
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

  const generateClueNumbers = (placedWords, grid) => {
    let clueNumber = 1;
    const numberedCells = new Map();
    const acrossClues = new Map();
    const downClues = new Map();

    const sortedWords = [...placedWords].sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });

    sortedWords.forEach(({ word, row, col, direction }) => {
      const key = `${row}-${col}`;
      if (!numberedCells.has(key)) {
        numberedCells.set(key, clueNumber);
        if (direction === "across") {
          acrossClues.set(clueNumber, { word, hints: hints[word] || [] });
        } else {
          downClues.set(clueNumber, { word, hints: hints[word] || [] });
        }
        clueNumber++;
      } else {
        const existingNumber = numberedCells.get(key);
        if (direction === "across") {
          acrossClues.set(existingNumber, { word, hints: hints[word] || [] });
        } else {
          downClues.set(existingNumber, { word, hints: hints[word] || [] });
        }
      }
    });

    return { numberedCells, acrossClues, downClues };
  };

  const validatePlacement = (word, row, col, isAcross, currentGrid) => {
    row = Number(row);
    col = Number(col);

    if (isAcross && (col < 0 || col + word.length > cols || row < 0 || row >= rows)) return false;
    if (!isAcross && (row < 0 || row + word.length > rows || col < 0 || col >= cols)) return false;

    let hasValidIntersection = placedWords.length === 0;

    for (let i = 0; i < word.length; i++) {
      const currentRow = isAcross ? row : row + i;
      const currentCol = isAcross ? col + i : col;
      const currentCell = currentGrid[currentRow][currentCol];

      if (currentCell !== "" && currentCell !== word[i]) return false;

      if (isAcross) {
        if (currentRow > 0) {
          const aboveCell = currentGrid[currentRow - 1][currentCol];
          if (aboveCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        if (currentRow < rows - 1) {
          const belowCell = currentGrid[currentRow + 1][currentCol];
          if (belowCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        if (i === 0 && col > 0 && currentGrid[currentRow][currentCol - 1] !== "") return false;
        if (i === word.length - 1 && col + i < cols - 1 && currentGrid[currentRow][currentCol + 1] !== "") return false;
      } else {
        if (currentCol > 0) {
          const leftCell = currentGrid[currentRow][currentCol - 1];
          if (leftCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        if (currentCol < cols - 1) {
          const rightCell = currentGrid[currentRow][currentCol + 1];
          if (rightCell !== "" && i !== 0 && i !== word.length - 1) return false;
        }
        if (i === 0 && row > 0 && currentGrid[currentRow - 1][currentCol] !== "") return false;
        if (i === word.length - 1 && row + i < rows - 1 && currentGrid[currentRow + 1][currentCol] !== "") return false;
      }

      if (currentCell !== "") {
        hasValidIntersection = true;
      }
    }

    return hasValidIntersection;
  };

  const validateGrids = (solution, userGrid, placedWords) => {
    // Add your grid validation logic here
    return true; // Placeholder return
  };

  // Core initialization function
  const initializeCrossword = () => {
    if (!wordBank.length) return;

    let currentGrid = Array.from({ length: rows }, () => Array(cols).fill(""));
    let currentPlacedWords = [];
    let debugLog = [];

    const firstWord = wordBank[0];
    const startRow = Math.floor(rows / 2);
    const startCol = Math.floor((cols - firstWord.length) / 2);

    currentGrid = placeWord(firstWord, startRow, startCol, "across", currentGrid);
    currentPlacedWords.push({
      word: firstWord,
      row: startRow,
      col: startCol,
      direction: "across",
    });
    debugLog.push(`Placed ${firstWord} at (${startRow}, ${startCol}) across`);

    const remainingWords = [...wordBank.slice(1)].sort(() => Math.random() - 0.5);

    for (const word of remainingWords) {
      const intersections = findIntersections(word, currentGrid, currentPlacedWords);

      if (intersections.length > 0) {
        const placement = intersections[0];
        currentGrid = placeWord(word, placement.row, placement.col, placement.direction, currentGrid);
        currentPlacedWords.push({
          word,
          row: placement.row,
          col: placement.col,
          direction: placement.direction,
        });
        debugLog.push(`Placed ${word} at (${placement.row}, ${placement.col}) ${placement.direction}`);
      } else {
        debugLog.push(`Failed to place ${word}`);
      }
    }

    const emptyUserGrid = currentGrid.map((row) =>
      row.map((cell) => (cell !== "" ? "" : cell))
    );

    const {
      numberedCells: newNumberedCells,
      acrossClues: newAcrossClues,
      downClues: newDownClues,
    } = generateClueNumbers(currentPlacedWords, currentGrid);

    // Validate the grid setup
    const isValidSetup = validateGrids(currentGrid, emptyUserGrid, currentPlacedWords);

    if (!isValidSetup) {
      console.error("Invalid grid setup detected - retrying...");
      initializeCrossword(); // Recursively retry instead of reloading the page
      return;
    }

    // Set state with new values
    setSolution(currentGrid);
    setUserGrid(emptyUserGrid);
    setPlacedWords(currentPlacedWords);
    setDebug(debugLog);
    setNumberedCells(newNumberedCells);
    setAcrossClues(newAcrossClues);
    setDownClues(newDownClues);
    setIsValid(true);
  };

  // Event Handlers
  const handleCellInput = (rowIndex, colIndex, value) => {
    if (value.length <= 1) {
      const newGrid = userGrid.map((row) => [...row]);
      newGrid[rowIndex][colIndex] = value.toUpperCase();
      setUserGrid(newGrid);
    }
  };

  const handleSubmitGuess = () => {
    const newRevealed = new Set(revealedCells);
    let allCorrect = true;

    userGrid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== "" && cell === solution[rowIndex][colIndex]) {
          const key = `${rowIndex}-${colIndex}`;
          newRevealed.add(key);
        } else if (cell !== solution[rowIndex][colIndex]) {
          allCorrect = false;
        }
      });
    });

    setRevealedCells(newRevealed);

    if (allCorrect) {
      setShowConfetti(true);
    }
  };

  // Effect Hooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://us-central1-country-crossword.cloudfunctions.net/api/getCountries");

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const countries = await response.json();
        if (countries && Object.keys(countries).length > 0) {
          setWordBank(Object.keys(countries).map(country => country.toUpperCase()));
          setHints(Object.fromEntries(
            Object.entries(countries).map(([country, hints]) => [country.toUpperCase(), hints])
          ));
        }
      } catch (error) {
        console.log("error in fetch:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (wordBank.length > 0) {
      initializeCrossword();
    }
  }, [wordBank]);

  // Clues component
  const Clues = ({ title, clues }) => (
    <div className="clues-section">
      <h3>{title}</h3>
      {Array.from(clues).map(([number, { word, hints }]) => (
        <div key={number} className="clue">
          <strong>{number}.</strong> <em style={{ paddingLeft: '1em' }}>({word.length} letters)</em><br />
          {hints.map((hint, index) => (
            <React.Fragment key={index}>
              <span style={{ paddingLeft: '1em' }}>{hint}</span>
              <br />
            </React.Fragment>
          ))}
          <br />
        </div>
      ))}
    </div>
  );

  // Render
  if (!isValid || !solution.length || !userGrid.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner">spinner</div>
      </div>
    );
  }

  return (
    <div className='crossword-and-controls'>
      {showConfetti && <Confetti />}
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
                  {solution[rowIndex][colIndex] !== "" && (
                    isRevealed ? (
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
                        onChange={(e) => handleCellInput(rowIndex, colIndex, e.target.value)}
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
                    )
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
      <div className='controlsandhints'>
        <div className="clues-container" style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <Clues title="Across" clues={acrossClues} />
          <Clues title="Down" clues={downClues} />
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-evenly"
        }}>
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
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            New Puzzle
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
