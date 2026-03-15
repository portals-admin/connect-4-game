export const ROWS = 6;
export const COLS = 7;
export const WIN_LENGTH = 4;

export type Player = 1 | 2;
export type Cell = Player | null;
export type Board = Cell[][];

export type GameStatus = "playing" | "won" | "draw";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
}

/** Create a fresh empty board. */
export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

/** Create a new game in its initial state. */
export function createGame(): GameState {
  return {
    board: createBoard(),
    currentPlayer: 1,
    status: "playing",
    winner: null,
  };
}

/** Return true if the column index is in bounds and has an empty cell. */
export function isValidMove(state: GameState, col: number): boolean {
  if (state.status !== "playing") return false;
  if (col < 0 || col >= COLS) return false;
  return state.board[0][col] === null;
}

/**
 * Return the row index where a piece dropped in `col` would land,
 * or -1 if the column is full.
 */
export function getDropRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) return row;
  }
  return -1;
}

/** Check whether `player` has four in a row passing through (row, col). */
export function checkWin(
  board: Board,
  row: number,
  col: number,
  player: Player
): boolean {
  const directions: [number, number][] = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal ↘
    [1, -1], // diagonal ↙
  ];

  for (const [dr, dc] of directions) {
    let count = 1;

    // Count in the positive direction.
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      count++;
    }

    // Count in the negative direction.
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      count++;
    }

    if (count >= WIN_LENGTH) return true;
  }

  return false;
}

/** Return true if every cell in the top row is occupied (board is full). */
export function isDraw(board: Board): boolean {
  return board[0].every((cell) => cell !== null);
}

/**
 * Drop the current player's piece into `col`.
 * Returns a new GameState; the original is not mutated.
 * Throws if the move is invalid.
 */
export function dropPiece(state: GameState, col: number): GameState {
  if (!isValidMove(state, col)) {
    throw new Error(`Invalid move: column ${col}`);
  }

  const board: Board = state.board.map((row) => [...row]);
  const row = getDropRow(board, col);
  board[row][col] = state.currentPlayer;

  if (checkWin(board, row, col, state.currentPlayer)) {
    return { board, currentPlayer: state.currentPlayer, status: "won", winner: state.currentPlayer };
  }

  if (isDraw(board)) {
    return { board, currentPlayer: state.currentPlayer, status: "draw", winner: null };
  }

  return {
    board,
    currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    status: "playing",
    winner: null,
  };
}
