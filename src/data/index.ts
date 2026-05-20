import type { Lesson } from '@/core/types';
import { CATEGORIES } from './categories';

// Chapter 1: Modes & Basic Movement
import { modesBasics } from './lessons/chapter1/modes-basics';
import { motionsHjkl } from './lessons/chapter1/motions-hjkl';
import { motionsLineBounds } from './lessons/chapter1/motions-line-bounds';
import { motionsFileBounds } from './lessons/chapter1/motions-file-bounds';
import { motionsParagraph } from './lessons/chapter1/motions-paragraph';
import { motionsBracketMatch } from './lessons/chapter1/motions-bracket-match';
import { modesMovementMiniReview } from './lessons/chapter1/modes-movement-mini-review';
import { hjklSnake } from './lessons/chapter1/hjkl-snake';

// Chapter 2: Words & Small Edits
import { motionsWords } from './lessons/chapter2/motions-words';
import { wordsFixSmallThings } from './lessons/chapter2/words-fix-small-things';
import { motionsWORDs } from './lessons/chapter2/motions-words-big';
import { smallEditsChars } from './lessons/chapter2/small-edits-chars';
import { insertModeShortcuts } from './lessons/chapter2/insert-mode-shortcuts';
import { wordsMiniReview } from './lessons/chapter2/words-mini-review';

// Chapter 3: Advanced Editing
import { operatorDeleteBasic } from './lessons/chapter3/operator-delete-basic';
import { operatorChangeBasic } from './lessons/chapter3/operator-change-basic';
import { operatorYankBasic } from './lessons/chapter3/operator-yank-basic';
import { countRepeatUndo } from './lessons/chapter3/count-repeat-undo';
import { operatorsMiniReview } from './lessons/chapter3/operators-mini-review';
import { operatorShortcuts } from './lessons/chapter3/operator-shortcuts';
import { operatorCase } from './lessons/chapter3/operator-case';
import { game2048 } from './lessons/chapter3/game-2048';

// Chapter 4: In-line Find/Till & Precise Edits
import { findChar } from './lessons/chapter4/find-char';
import { deleteWithFind } from './lessons/chapter4/delete-with-find';
import { changeWithFind } from './lessons/chapter4/change-with-find';
import { inLinePrecisionReview } from './lessons/chapter4/in-line-precision-review';

// Chapter 5: Text Objects
import { textobjectsWords } from './lessons/chapter5/textobjects-words';
import { textobjectsParagraphs } from './lessons/chapter5/textobjects-paragraphs';
import { textobjectsBrackets } from './lessons/chapter5/textobjects-brackets';
import { textobjectsQuotes } from './lessons/chapter5/textobjects-quotes';
import { textobjectsMegaReview } from './lessons/chapter5/textobjects-mega-review';
import { textobjectsNinjaGame } from './lessons/chapter5/textobjects-ninja-game';

// Chapter 6: Search & Refactor
import { searchBasic } from './lessons/chapter6/search-basic';
import { searchWithOperators } from './lessons/chapter6/search-with-operators';
import { realworldCleanup1 } from './lessons/chapter6/realworld-cleanup-1';
import { speedrunChallenge } from './lessons/chapter6/speedrun-challenge';

// Chapter 7: Visual Mode
import { visualCharBasics } from './lessons/chapter7/visual-char-basics';
import { visualLineMode } from './lessons/chapter7/visual-line-mode';
import { visualBlockMode } from './lessons/chapter7/visual-block-mode';
import { visualOperators } from './lessons/chapter7/visual-operators';
import { visualRefactorReview } from './lessons/chapter7/visual-refactor-review';

// Chapter 8: Macros & Registers
import { macrosBasics } from './lessons/chapter8/macros-basics';
import { macrosCount } from './lessons/chapter8/macros-count';
import { registersNamed } from './lessons/chapter8/registers-named';
import { registersSystem } from './lessons/chapter8/registers-system';
import { macrosMegaChallenge } from './lessons/chapter8/macros-mega-challenge';

// Chapter 9: Marks & Jump History
import { marksBasics } from './lessons/chapter9/marks-basics';
import { jumplist } from './lessons/chapter9/jumplist';
import { changelist } from './lessons/chapter9/changelist';

// Chapter 10: Vim in the Real World
import { installAndMinimalConfig } from './lessons/chapter10/install-and-minimal-config';
import { vimInVscode } from './lessons/chapter10/vim-in-vscode';
import { vimInJetbrains } from './lessons/chapter10/vim-in-jetbrains';
import { vimInTerminal } from './lessons/chapter10/vim-in-terminal';
import { editorShortcutMigration } from './lessons/chapter10/editor-shortcut-migration';
import { realworldRefactorDemo } from './lessons/chapter10/realworld-refactor-demo';

// Chapter 11: Daily Vim Mastery
import { commandLineBasics } from './lessons/chapter11/command-line-basics';
import { substituteCurrentLine } from './lessons/chapter11/substitute-current-line';
import { substituteWholeBuffer } from './lessons/chapter11/substitute-whole-buffer';
import { firstWeekWorkflowReview } from './lessons/chapter11/first-week-workflow-review';

// Chapter 12: Project Navigation
import { bufferListBasics } from './lessons/chapter12/buffer-list-basics';
import { switchBuffers } from './lessons/chapter12/switch-buffers';
import { splitWindows } from './lessons/chapter12/split-windows';
import { projectNavigationReview } from './lessons/chapter12/project-navigation-review';

// Chapter 13: Screen Navigation
import { screenScrollBasics } from './lessons/chapter13/screen-scroll-basics';
import { viewportPositioning } from './lessons/chapter13/viewport-positioning';
import { screenLineJumps } from './lessons/chapter13/screen-line-jumps';
import { screenNavigationReview } from './lessons/chapter13/screen-navigation-review';

// Chapter 14: Project Workspace
import { workspaceMentalModel } from './lessons/chapter14/workspace-mental-model';
import { projectSearchVimgrep } from './lessons/chapter14/project-search-vimgrep';
import { quickfixNavigation } from './lessons/chapter14/quickfix-navigation';
import { projectWorkspaceReview } from './lessons/chapter14/project-workspace-review';

// Chapter 15: VimGolf Challenges
import { vimgolfIntro, vimgolfBasicEditing, vimgolfTextObjects, vimgolfMacros, vimgolfAdvanced } from './lessons/chapter15/vimgolf-challenges';

// Chapter 16: Development Environment Bridge
import { devEnvironmentMentalModel, vimModeEverywhere, lspAiVimWorkflow, remoteDevWorkflowReview } from './lessons/chapter16/development-environment';

export { CATEGORIES };

export const LESSONS: Lesson[] = [
  // Chapter 1 & 2: Basics
  modesBasics,
  motionsHjkl,
  motionsLineBounds,
  motionsFileBounds,
  motionsParagraph,
  motionsBracketMatch,
  modesMovementMiniReview,
  hjklSnake,
  motionsWords,
  wordsFixSmallThings,
  motionsWORDs,
  smallEditsChars,
  insertModeShortcuts,
  wordsMiniReview,

  // Chapter 3: Advanced Editing
  operatorDeleteBasic,
  operatorChangeBasic,
  operatorYankBasic,
  countRepeatUndo,
  operatorsMiniReview,
  operatorShortcuts,
  operatorCase,
  game2048,

  // Chapter 4: In-line Find/Till & Precise Edits
  findChar,
  deleteWithFind,
  changeWithFind,
  inLinePrecisionReview,

  // Chapter 5: Text Objects
  textobjectsWords,
  textobjectsParagraphs,
  textobjectsBrackets,
  textobjectsQuotes,
  textobjectsMegaReview,
  textobjectsNinjaGame,

  // Chapter 6: Search & Refactor
  searchBasic,
  searchWithOperators,
  realworldCleanup1,
  speedrunChallenge,

  // Chapter 7: Visual Mode
  visualCharBasics,
  visualLineMode,
  visualBlockMode,
  visualOperators,
  visualRefactorReview,

  // Chapter 8: Macros & Registers
  macrosBasics,
  macrosCount,
  registersNamed,
  registersSystem,
  macrosMegaChallenge,

  // Chapter 9: Marks & Jump History
  marksBasics,
  jumplist,
  changelist,

  // Chapter 10: Vim in the Real World
  installAndMinimalConfig,
  vimInVscode,
  vimInJetbrains,
  vimInTerminal,
  editorShortcutMigration,
  realworldRefactorDemo,

  // Chapter 11: Daily Vim Mastery
  commandLineBasics,
  substituteCurrentLine,
  substituteWholeBuffer,
  firstWeekWorkflowReview,

  // Chapter 12: Project Navigation
  bufferListBasics,
  switchBuffers,
  splitWindows,
  projectNavigationReview,

  // Chapter 13: Screen Navigation
  screenScrollBasics,
  viewportPositioning,
  screenLineJumps,
  screenNavigationReview,

  // Chapter 14: Project Workspace
  workspaceMentalModel,
  projectSearchVimgrep,
  quickfixNavigation,
  projectWorkspaceReview,

  // Chapter 15: VimGolf Challenges
  vimgolfIntro,
  vimgolfBasicEditing,
  vimgolfTextObjects,
  vimgolfMacros,
  vimgolfAdvanced,

  // Chapter 16: Development Environment Bridge
  devEnvironmentMentalModel,
  vimModeEverywhere,
  lspAiVimWorkflow,
  remoteDevWorkflowReview
];
