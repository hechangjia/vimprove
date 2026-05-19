// 2048 game pure logic (zero React dependency).
// Board is 4×4 number[][], 0 represents an empty cell. Tile values are powers of 2.

export type Direction = 'left' | 'right' | 'up' | 'down';
export type Board = number[][];

export const BOARD_SIZE = 4;
export const WIN_TILE = 2048;

export const createEmptyBoard = (): Board =>
  Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));

const cloneBoard = (board: Board): Board => board.map(row => [...row]);

const boardsEqual = (a: Board, b: Board): boolean => {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
};

const emptyCells = (board: Board): Array<{ r: number; c: number }> => {
  const cells: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) cells.push({ r, c });
    }
  }
  return cells;
};

// 在一个空位生成新方块（90% 概率 2，10% 概率 4）。如果没有空位返回原棋盘。
export const spawnTile = (board: Board, rand: () => number = Math.random): Board => {
  const empties = emptyCells(board);
  if (empties.length === 0) return board;
  const cell = empties[Math.floor(rand() * empties.length)];
  const value = rand() < 0.9 ? 2 : 4;
  const next = cloneBoard(board);
  next[cell.r][cell.c] = value;
  return next;
};

// 把一行向左 slide + merge。返回新行、本次合并得分、是否发生变化。
const slideRowLeft = (
  row: number[]
): { row: number[]; gained: number; moved: boolean } => {
  const compact = row.filter(v => v !== 0);
  const merged: number[] = [];
  let gained = 0;
  let i = 0;
  while (i < compact.length) {
    if (i + 1 < compact.length && compact[i] === compact[i + 1]) {
      const sum = compact[i] * 2;
      merged.push(sum);
      gained += sum;
      i += 2;
    } else {
      merged.push(compact[i]);
      i += 1;
    }
  }
  while (merged.length < BOARD_SIZE) merged.push(0);
  const moved = merged.some((v, idx) => v !== row[idx]);
  return { row: merged, gained, moved };
};

const reverseRow = (row: number[]): number[] => [...row].reverse();

const transpose = (board: Board): Board => {
  const out = createEmptyBoard();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      out[c][r] = board[r][c];
    }
  }
  return out;
};

// 应用一次移动操作。返回新棋盘、得分增量、是否真的移动。不负责生成新方块。
export const applyMove = (
  board: Board,
  direction: Direction
): { board: Board; gained: number; moved: boolean } => {
  let working: Board;
  if (direction === 'left') {
    working = board.map(r => [...r]);
  } else if (direction === 'right') {
    working = board.map(r => reverseRow(r));
  } else if (direction === 'up') {
    working = transpose(board);
  } else {
    // down
    working = transpose(board).map(r => reverseRow(r));
  }

  let totalGained = 0;
  let anyMoved = false;
  const sliced: Board = working.map(row => {
    const { row: newRow, gained, moved } = slideRowLeft(row);
    totalGained += gained;
    if (moved) anyMoved = true;
    return newRow;
  });

  let result: Board;
  if (direction === 'left') {
    result = sliced;
  } else if (direction === 'right') {
    result = sliced.map(r => reverseRow(r));
  } else if (direction === 'up') {
    result = transpose(sliced);
  } else {
    result = transpose(sliced.map(r => reverseRow(r)));
  }

  return { board: result, gained: totalGained, moved: anyMoved };
};

// 判断当前棋盘是否还有任何合法移动。
export const hasAnyMove = (board: Board): boolean => {
  if (emptyCells(board).length > 0) return true;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const v = board[r][c];
      if (c + 1 < BOARD_SIZE && board[r][c + 1] === v) return true;
      if (r + 1 < BOARD_SIZE && board[r + 1][c] === v) return true;
    }
  }
  return false;
};

// 是否已达到胜利方块（2048）。
export const hasReachedWin = (board: Board): boolean => {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] >= WIN_TILE) return true;
    }
  }
  return false;
};

// 棋盘最大方块（用于显示当前进度）。
export const maxTile = (board: Board): number => {
  let m = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] > m) m = board[r][c];
    }
  }
  return m;
};

// 创建一个含 2 个初始方块的新游戏棋盘。
export const createInitialBoard = (rand: () => number = Math.random): Board => {
  return spawnTile(spawnTile(createEmptyBoard(), rand), rand);
};

// 工具：boardsEqual 导出供组件检测无效移动。
export { boardsEqual };
