export type Cursor = {
  line: number;
  col: number;
};

export type Mode = 'normal' | 'insert' | 'visual' | 'visual-line' | 'visual-block' | 'command';

export type Operator = 'd' | 'c' | 'y' | 'gu' | 'gU' | 'g~';

export type Motion =
  | 'h' | 'j' | 'k' | 'l'
  | 'w' | 'b' | 'e'
  | 'W' | 'B' | 'E'
  | '0' | '$' | '^' | '_'
  | 'gg' | 'G'
  | '{' | '}'
  | '%';

export type TextObject =
  | 'iw' | 'aw'
  | 'ip' | 'ap'
  | 'i(' | 'a(' | 'i)' | 'a)' | 'i{' | 'a{' | 'i}' | 'a}' | 'i[' | 'a[' | 'i]' | 'a]'
  | 'i"' | 'a"' | "i'" | "a'" | 'i`' | 'a`';

export type OperatorMotion = Motion | TextObject;

export type SearchState = {
  pattern: string;
  direction: 'forward' | 'backward';
};

export type Command = {
  type: 'move' | 'delete-char' | 'delete-line' | 'delete-range' | 'enter-insert' | 'open-line' | 'open-line-above' | 'mode-switch' | 'yank' | 'paste' | 'ex';
  motion?: OperatorMotion;
  operator?: Operator;
  to?: Mode;
  before?: boolean;
  command?: string;
};

export type FindMotion = {
  type: 'f' | 'F' | 't' | 'T';
  char: string;
};

export type VimBuffer = {
  id: number;
  name: string;
  lines: string[];
  cursor: Cursor;
};

export type VimWindow = {
  id: number;
  bufferIndex: number;
  row: number;
  col: number;
};

export type QuickfixItem = {
  bufferIndex: number;
  line: number;
  col: number;
  text: string;
};

export type LowercaseLetter =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

export type RegisterName = '"' | '0' | '_' | '+' | '*' | LowercaseLetter;

export type VimState = {
  buffer: string[];
  cursor: Cursor;
  mode: Mode;
  visualAnchor: Cursor | null;
  commandLine: string;
  commandStatus: string | null;
  viewportTop: number;
  viewportHeight: number;
  pendingOperator: Operator | null;
  pendingReplace: boolean;
  pendingFind: 'f' | 'F' | 't' | 'T' | null;
  pendingTextObject: 'i' | 'a' | null;
  pendingSearch: SearchState | null;
  pendingG: boolean;
  pendingZ: boolean;
  pendingCtrlW: boolean;
  lastSearch: SearchState | null;
  lastCommand: Command | null;

  // Simulated project navigation state
  buffers: VimBuffer[];
  currentBufferIndex: number;
  windows: VimWindow[];
  currentWindowIndex: number;
  quickfixList: QuickfixItem[];
  quickfixIndex: number;
  quickfixOpen: boolean;

  // Undo/Redo support
  history: VimState[];
  historyIndex: number;

  // Yank/Paste support
  register: string;
  yankRegister: string;
  registers: Partial<Record<RegisterName, string>>;
  pendingRegister: boolean;
  selectedRegister: RegisterName | null;

  // Insert position (for Insert mode only, 0..len)
  // This is the actual insertion point, while cursor.col is the display position
  insertCol?: number;
  insertStart: Cursor | null;

  // Count prefix (e.g., "3" in "3dw")
  count: string;

  // Last find motion (for ; and ,)
  lastFind: FindMotion | null;

  // Last change action (for . repeat)
  lastChange: KeyPress[] | null;

  // Count used for last change (for . repeat)
  lastChangeCount: number | null;
  lastChangeCursor: Cursor | null;
  lastChangeInsertCursor: Cursor | null;
  lastChangeInsertStart: Cursor | null;

  // Currently recording change for . command
  changeRecording: KeyPress[] | null;

  // Count captured when recording a change
  recordingCount: number | null;
  recordingExitCursor: Cursor | null;
  recordingInsertCursor: Cursor | null;

  // Macro support
  pendingMacroRecord: boolean;
  pendingMacroReplay: boolean;
  macroRecordingRegister: LowercaseLetter | null;
  macroRecording: KeyPress[];
  macros: Partial<Record<LowercaseLetter, KeyPress[]>>;
  lastMacroRegister: LowercaseLetter | null;

  // Marks, jumplist, and changelist
  marks: Partial<Record<LowercaseLetter, Cursor>>;
  pendingMarkSet: boolean;
  pendingMarkJump: '`' | "'" | null;
  previousJumpCursor: Cursor | null;
  jumpList: Cursor[];
  jumpIndex: number;
  changeList: Cursor[];
  changeIndex: number;
};

export type VimAction = {
  type: 'RESET' | 'KEYDOWN';
  payload?: {
    key?: string;
    ctrlKey?: boolean;
    buffer?: string[];
    cursor?: Cursor;
    [key: string]: unknown;
  };
};

export type KeyPress = {
  key: string;
  ctrlKey: boolean;
};

export type ChallengeGoalType = 'move' | 'delete' | 'change' | 'insert' | 'custom';

export type ChallengeGoal = {
  id: string;
  type: ChallengeGoalType;
  description: string;
  validator: (prev: VimState | null, next: VimState, lastCommand?: Command | null) => boolean;
};

export type ChallengeConfig = {
  initialBuffer: string[];
  initialCursor: Cursor;
  initialBuffers?: VimBuffer[];
  initialWindows?: VimWindow[];
  initialCurrentBufferIndex?: number;
  initialCurrentWindowIndex?: number;
  goalsRequired: number;
  enabledCommands: string[];
  goals: ChallengeGoal[];
  language?: 'cpp' | 'javascript' | 'typescript' | 'python' | 'auto';
};

export type RunExampleStep = {
  key: string;
  description: string;
  cursorIndex?: number;
};

export type RunExampleTrack = {
  label: string;
  keys: string[];
  color?: string;
};

export type RunExampleConfig = {
  initialBuffer: string[];
  initialCursor: Cursor;
  tracks: RunExampleTrack[];
  steps: RunExampleStep[];
  autoPlaySpeed?: number;
  language?: 'cpp' | 'javascript' | 'typescript' | 'python' | 'auto';
};

export type HjklSnakeGameConfig = {
  boardWidth?: number;
  boardHeight?: number;
  bronzeScore?: number;
  silverScore?: number;
  goldScore?: number;
};

export type Game2048Config = {
  // 预留扩展位（如自定义胜利方块 / 起始方块数）。当前 4x4，胜利方块固定 2048。
  bronzeTile?: number;  // 默认 128
  silverTile?: number;  // 默认 512
  goldTile?: number;    // 默认 2048
};

export type FindTargetGameConfig = {
  rounds?: Array<{
    line: string;
    cursorCol: number;
    targetCol: number;
  }>;
  targetScore?: number;
};

export type WindowNavigatorGameConfig = {
  targetScore?: number;
};

export type OperatorGymGameConfig = {
  rounds?: Array<{
    prompt: string;
    command: string;
    hint?: string;
  }>;
  targetScore?: number;
};

export type ScrollSurferGameConfig = {
  targetScore?: number;
};

export type CheatSheetConfig = {
  chapterId: string;       // 'chapter1' | 'chapter3' | ...
  title?: string;          // 可选覆盖默认 "Chapter X — Cheat Sheet"
  // entries 由组件根据 chapterId 在运行时从 LESSONS 聚合
};

export type ContentBlock =
  | { type: 'markdown'; content: string; i18nKey?: string }
  | { type: 'key-list'; keys: KeyItem[]; i18nKey?: string }
  | { type: 'challenge'; config: ChallengeConfig; i18nKey?: string }
  | { type: 'run-example'; config: RunExampleConfig; i18nKey?: string }
  | { type: 'hjkl-snake'; config?: HjklSnakeGameConfig; i18nKey?: string }
  | { type: 'game-2048'; config?: Game2048Config; i18nKey?: string }
  | { type: 'find-target'; config?: FindTargetGameConfig; i18nKey?: string }
  | { type: 'window-navigator'; config?: WindowNavigatorGameConfig; i18nKey?: string }
  | { type: 'operator-gym'; config?: OperatorGymGameConfig; i18nKey?: string }
  | { type: 'scroll-surfer'; config?: ScrollSurferGameConfig; i18nKey?: string }
  | { type: 'cheat-sheet'; config: CheatSheetConfig; i18nKey?: string };

export type KeyItem = {
  chars: string[];
  desc: string;
  i18nKey?: string;
};

export type Lesson = {
  slug: string;
  title: string;
  categoryId: string;
  shortDescription: string;
  contentBlocks: ContentBlock[];
  i18nKey?: string;
};

export type Category = {
  id: string;
  title: string;
  order: number;
};

export type UserProgress = {
  [lessonSlug: string]: {
    completedGoalsCount: number;
    totalGoals: number;
    bestTimeSeconds: number | null;
    attemptsCount: number;
    lastCompletedAt: string | null;
  };
};
