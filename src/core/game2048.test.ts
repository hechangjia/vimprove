import { describe, it, expect } from 'vitest';
import {
  applyMove,
  createEmptyBoard,
  hasAnyMove,
  hasReachedWin,
  maxTile,
  spawnTile,
  type Board
} from './game2048';

const b = (rows: number[][]): Board => rows.map(r => [...r]);

describe('game2048.applyMove', () => {
  it('slides tiles left and merges adjacent equal pairs once', () => {
    const board = b([
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);
    const { board: next, gained, moved } = applyMove(board, 'left');
    expect(next[0]).toEqual([4, 8, 0, 0]);
    expect(gained).toBe(4 + 8);
    expect(moved).toBe(true);
  });

  it('does not chain a single tile into multiple merges', () => {
    const board = b([
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);
    const { board: next, gained } = applyMove(board, 'left');
    expect(next[0]).toEqual([4, 4, 0, 0]);
    expect(gained).toBe(8);
  });

  it('slides and merges right', () => {
    const board = b([
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);
    const { board: next } = applyMove(board, 'right');
    expect(next[0]).toEqual([0, 0, 4, 8]);
  });

  it('slides up and down through columns', () => {
    const board = b([
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [4, 0, 0, 0]
    ]);
    const up = applyMove(board, 'up');
    expect(up.board.map(r => r[0])).toEqual([4, 8, 0, 0]);
    const down = applyMove(board, 'down');
    expect(down.board.map(r => r[0])).toEqual([0, 0, 4, 8]);
  });

  it('reports moved=false when nothing changes', () => {
    const board = b([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ]);
    const { moved, gained } = applyMove(board, 'left');
    expect(moved).toBe(false);
    expect(gained).toBe(0);
  });
});

describe('game2048.spawnTile', () => {
  it('places exactly one new tile of value 2 or 4 in an empty cell', () => {
    const board = createEmptyBoard();
    const next = spawnTile(board, () => 0.5);
    const total = next.flat().filter(v => v !== 0);
    expect(total).toHaveLength(1);
    expect([2, 4]).toContain(total[0]);
  });

  it('returns the same board when no empty cell exists', () => {
    const full = b([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ]);
    expect(spawnTile(full)).toEqual(full);
  });
});

describe('game2048 helpers', () => {
  it('hasAnyMove returns false only when no merges or empties exist', () => {
    const stuck = b([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ]);
    expect(hasAnyMove(stuck)).toBe(false);
    const merge = b([
      [2, 2, 4, 8],
      [4, 8, 16, 2],
      [2, 4, 8, 16],
      [4, 16, 2, 4]
    ]);
    expect(hasAnyMove(merge)).toBe(true);
  });

  it('hasReachedWin / maxTile reflect current board', () => {
    const board = b([
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 0],
      [0, 0, 0, 0]
    ]);
    expect(hasReachedWin(board)).toBe(true);
    expect(maxTile(board)).toBe(2048);
  });
});
