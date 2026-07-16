// ============================================================
//  SNIPPETS DATA
// ============================================================
const SNIPPETS = [
  {
    category: 'Algorithms',
    items: [
      { name: 'Linear Search', icon: 'search', code: `DECLARE Numbers : ARRAY[1:10] OF INTEGER
DECLARE Target : INTEGER
DECLARE Found : BOOLEAN
DECLARE Index : INTEGER
DECLARE FoundAt : INTEGER 

// Fill the array with 10 values
FOR Index ← 1 TO 10
   OUTPUT "Enter value for position ", Index
   INPUT Numbers[Index]
NEXT Index

Found ← FALSE
FoundAt ← -1

OUTPUT "Enter the number to search for:"
INPUT Target

FOR Index ← 1 TO 10
   IF Numbers[Index] = Target THEN
      Found ← TRUE
      FoundAt ← Index
   ENDIF
NEXT Index

IF Found = TRUE THEN
   OUTPUT "Found at index: ", FoundAt
ELSE
   OUTPUT "Not found"
ENDIF` },
      { name: 'Bubble Sort', icon: 'sort', code: `DECLARE Arr : ARRAY[1:10] OF INTEGER
DECLARE Temp, Count : INTEGER
DECLARE Swap : BOOLEAN
DECLARE IndexPassed : INTEGER
CONSTANT ArrayLength <- 10
IndexPassed ← 0

// Fill the array with 10 values
FOR Count ← 1 TO 10
   OUTPUT "Enter value for position ", Count
   INPUT Arr[Count]
NEXT Count

// The actual bubble sort
REPEAT
    Swap ← FALSE
    FOR Count ← 1 TO (ArrayLength - 1) - IndexPassed
        IF Arr[Count] > Arr[Count + 1] THEN
            Temp ← Arr[Count]
            Arr[Count] ← Arr[Count + 1]
            Arr[Count + 1] ← Temp
            Swap ← TRUE
        ENDIF
    NEXT Count
    IndexPassed ← IndexPassed + 1
UNTIL NOT Swap

// Outputting the sorted array
OUTPUT "Sorted array:"
FOR Count ← 1 TO 10
   OUTPUT Arr[Count]
NEXT Count` },
      { name: 'Totaling / Average', icon: 'sum', code: `DECLARE Total : REAL
DECLARE Count : INTEGER
DECLARE Average : REAL
DECLARE Value : REAL

Total ← 0.0
Count ← 0

// taking in all inputs, and finding the total, and how many numbers were inputted
REPEAT
   INPUT Value
   IF Value <> -1 THEN
      Total ← Total + Value
      Count ← Count + 1
   ENDIF
UNTIL Value = -1

// calculating the average and outputting everything
IF Count > 0 THEN
   Average ← Total / Count
   OUTPUT "Total: ", Total
   OUTPUT "Count: ", Count
   OUTPUT "Average: ", Average
ELSE
   OUTPUT "No values entered"
ENDIF` },
      { name: 'Find Max / Min', icon: 'minmax', code: `DECLARE Numbers : ARRAY[1:5] OF REAL
DECLARE Max : REAL
DECLARE Min : REAL
DECLARE i : INTEGER

// example data
Numbers[1] ← 4.5
Numbers[2] ← 7.2
Numbers[3] ← 1.3
Numbers[4] ← 9.8
Numbers[5] ← 3.1

Max ← Numbers[1]
Min ← Numbers[1]

// sorting finding smallest and largest number
FOR i ← 2 TO 5
   IF Numbers[i] > Max THEN
      Max ← Numbers[i]
   ENDIF
   IF Numbers[i] < Min THEN
      Min ← Numbers[i]
   ENDIF
NEXT i

// outputting the results
OUTPUT "Maximum: ", Max
OUTPUT "Minimum: ", Min` },
    ]
  },
  {
    category: 'Structures',
    items: [
      { name: 'FOR Loop', icon: 'loop', code: `FOR Index ← 1 TO 10
   OUTPUT Index
NEXT Index` },
      { name: 'WHILE Loop', icon: 'loop', code: `DECLARE Count : INTEGER
Count ← 0
WHILE Count < 10 DO
   Count ← Count + 1
   OUTPUT Count
ENDWHILE` },
      { name: 'REPEAT Loop', icon: 'loop', code: `DECLARE Password : STRING
REPEAT
   OUTPUT "Enter password:"
   INPUT Password
UNTIL Password = "Secret"
OUTPUT "Access granted"` },
      { name: 'IF / ELSE', icon: 'branch', code: `DECLARE Score : INTEGER
INPUT Score

IF Score >= 70 THEN
   OUTPUT "Grade A"
ELSE
   IF Score >= 50 THEN
      OUTPUT "Grade B"
   ELSE
      OUTPUT "Fail"
   ENDIF
ENDIF` },
      { name: 'CASE Statement', icon: 'branch', code: `DECLARE Choice : CHAR
INPUT Choice

CASE OF Choice
   'A' : OUTPUT "Option A selected"
   'B' : OUTPUT "Option B selected"
   'C' : OUTPUT "Option C selected"
   OTHERWISE : OUTPUT "Invalid option"
ENDCASE` },
      { name: 'PROCEDURE', icon: 'fn', code: `PROCEDURE Greet(Name : STRING)
   OUTPUT "Hello, ", Name
ENDPROCEDURE

CALL Greet("World")` },
      { name: 'FUNCTION', icon: 'fn', code: `FUNCTION Square(N : INTEGER) RETURNS INTEGER
   RETURN N * N
ENDFUNCTION

DECLARE Result : INTEGER
Result ← Square(5)
OUTPUT "5 squared = ", Result` },
      { name: '1D Array', icon: 'arr', code: `DECLARE Scores : ARRAY[1:5] OF INTEGER
DECLARE i : INTEGER

FOR i ← 1 TO 5
   INPUT Scores[i]
NEXT i

FOR i ← 1 TO 5
   OUTPUT Scores[i]
NEXT i` },
      { name: '2D Array', icon: 'arr', code: `DECLARE Scores : ARRAY[1:5, 1:2] OF INTEGER
DECLARE i : INTEGER
DECLARE j : INTEGER

FOR j ← 1 TO 2
  FOR i ← 1 TO 5
    INPUT Scores[i, j]
  NEXT i
NEXT j

FOR j ← 1 TO 2
  FOR i ← 1 TO 5
    OUTPUT Scores[i, j]
  NEXT i
NEXT j` },
      { name: 'File Read', icon: 'file', code: `DECLARE Line : STRING

OPENFILE "data.txt" FOR READ

READFILE "data.txt", Line
OUTPUT Line

CLOSEFILE "data.txt"
` },
      { name: 'File Write', icon: 'file', code: `DECLARE Line : STRING

OPENFILE "data.txt" FOR WRITE

WRITEFILE "data.txt", "Hello, World!"

CLOSEFILE "data.txt"
` },
      { name: 'Library Routines', icon: 'file', code: `OUTPUT LENGTH("Happy Days")
OUTPUT LCASE("Wowza")
OUTPUT UCASE("Happy")
OUTPUT SUBSTRING("Happy Days", 2, 4)
` },
    ]
  }
];

// ============================================================
//  SYNTAX HIGHLIGHTING
// ============================================================
const KEYWORDS = ['DECLARE','CONSTANT','ARRAY','OF','INPUT','OUTPUT','IF','THEN','ELSE','ENDIF',
  'FOR','TO','STEP','NEXT','WHILE','DO','ENDWHILE','REPEAT','UNTIL','CASE','OF','ENDCASE',
  'OTHERWISE','PROCEDURE','ENDPROCEDURE','CALL','FUNCTION','ENDFUNCTION','RETURNS','RETURN',
  'BYVAL','BYREF','TYPE','ENDTYPE','CLASS','ENDCLASS','INHERITS','SUPER','NEW','PUBLIC','PRIVATE',
  'OPENFILE','CLOSEFILE','READFILE','WRITEFILE','SEEK','GETRECORD','PUTRECORD','FOR','NOT','AND','OR',
  'DIV','MOD','APPEND','READ','WRITE'];

const TYPES = ['INTEGER','REAL','CHAR','STRING','BOOLEAN','DATE'];
const BOOLS = ['TRUE','FALSE'];
const BUILTINS = ['LENGTH','LCASE','UCASE','MID','RIGHT','LEFT','INT','RAND','RANDOM','ROUND','SUBSTRING','EOF'];

function highlight(code) {
  const lines = code.split('\n');
  return lines.map(line => highlightLine(line)).join('\n');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlightLine(line) {
  // Comments
  const commentIdx = line.indexOf('//');
  let code = line, comment = '';
  if (commentIdx !== -1) {
    comment = line.slice(commentIdx);
    code = line.slice(0, commentIdx);
  }

  let result = '';
  let i = 0;
  const tokens = tokenizeLine(code);
  for (const tok of tokens) {
    result += colorToken(tok);
  }

  if (comment) result += `<span class="comment">${escHtml(comment)}</span>`;
  return result;
}

function tokenizeLine(code) {
  const tokens = [];
  let i = 0;
  while (i < code.length) {
    // String
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') j++;
      tokens.push({ type: 'string', val: code.slice(i, j+1) });
      i = j + 1;
      continue;
    }
    // Char literal
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") j++;
      tokens.push({ type: 'string', val: code.slice(i, j+1) });
      i = j + 1;
      continue;
    }
    // Arrow
    if (code[i] === '←' || (code[i] === '<' && code[i+1] === '-')) {
      const len = code[i] === '←' ? 1 : 2;
      tokens.push({ type: 'arrow', val: code.slice(i, i+len) });
      i += len;
      continue;
    }
    // Operators
    if ('<>+-*/^='.includes(code[i])) {
      let j = i + 1;
      if ((code[i] === '<' && (code[i+1] === '=' || code[i+1] === '>')) ||
          (code[i] === '>' && code[i+1] === '=')) j = i + 2;
      tokens.push({ type: 'op', val: code.slice(i, j) });
      i = j;
      continue;
    }
    // Number
    if (/\d/.test(code[i]) || (code[i] === '-' && /\d/.test(code[i+1]||''))) {
      let j = i + 1;
      while (j < code.length && /[\d.]/.test(code[j])) j++;
      tokens.push({ type: 'number', val: code.slice(i, j) });
      i = j;
      continue;
    }
    // Word
    if (/[A-Za-z_]/.test(code[i])) {
      let j = i + 1;
      while (j < code.length && /[A-Za-z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (KEYWORDS.includes(word.toUpperCase())) tokens.push({ type: 'keyword', val: word });
      else if (TYPES.includes(word.toUpperCase())) tokens.push({ type: 'type', val: word });
      else if (BOOLS.includes(word.toUpperCase())) tokens.push({ type: 'bool', val: word });
      else if (BUILTINS.includes(word.toUpperCase())) tokens.push({ type: 'builtin', val: word });
      else tokens.push({ type: 'ident', val: word });
      i = j;
      continue;
    }
    tokens.push({ type: 'punc', val: code[i] });
    i++;
  }
  return tokens;
}

function colorToken(tok) {
  const e = escHtml(tok.val);
  switch (tok.type) {
    case 'keyword': return `<span class="kw">${e}</span>`;
    case 'type': return `<span class="type">${e}</span>`;
    case 'bool': return `<span class="bool">${e}</span>`;
    case 'string': return `<span class="str">${e}</span>`;
    case 'number': return `<span class="num">${e}</span>`;
    case 'op': return `<span class="op">${e}</span>`;
    case 'arrow': return `<span class="arrow">${e}</span>`;
    case 'builtin': return `<span class="fn">${e}</span>`;
    case 'punc': return `<span class="punc">${e}</span>`;
    default: return `<span class="ident">${e}</span>`;
  }
}

// ============================================================
//  EDITOR SETUP
// ============================================================
const codeInput = document.getElementById('code-input');
const codeHighlight = document.getElementById('code-highlight');
const lineNumbers = document.getElementById('line-numbers');

let autoSaveEnabled = true;
let linterEnabled = true;
let lineNumbersEnabled = true;
let enforceDeclareEnabled = true;
let currentSidebarPanel = 'snippets';
let inputMode = 'popup';

function updateEditor() {
  const code = codeInput.value;
  codeHighlight.innerHTML = highlight(code) + '\n';
  updateLineNumbers(code);
  updateStatusBar(code);
  if (linterEnabled) runLinter(code);
  if (autoSaveEnabled) {
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(() => {
      localStorage.setItem('cie_code', code);
    }, 500);
  }
  syncScroll();
}

function updateLineNumbers(code) {
  if (!lineNumbersEnabled) { lineNumbers.innerHTML = ''; return; }
  const lines = code.split('\n');
  const activeLine = getActiveLine();
  lineNumbers.innerHTML = lines.map((_, i) => {
    const n = i + 1;
    const cls = n === activeLine ? 'active-line' : '';
    return `<span class="${cls}">${n}</span>`;
  }).join('');
}

function getActiveLine() {
  const val = codeInput.value.slice(0, codeInput.selectionStart);
  return val.split('\n').length;
}

function syncScroll() {
  codeHighlight.scrollTop = codeInput.scrollTop;
  codeHighlight.scrollLeft = codeInput.scrollLeft;
  lineNumbers.scrollTop = codeInput.scrollTop;
}

function updateStatusBar(code) {
  const lines = code.split('\n');
  const pos = codeInput.selectionStart;
  const before = code.slice(0, pos);
  const ln = before.split('\n').length;
  const col = before.split('\n').pop().length + 1;
  document.getElementById('cursor-pos').textContent = `Ln ${ln}, Col ${col}`;
  document.getElementById('char-count').textContent = `${code.length} chars`;
}

// Linter
let lintErrors = [];
function runLinter(code) {
  const errors = [];
  const lines = code.split('\n');
  lines.forEach((line, idx) => {
    const stripped = line.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
    const commentIdx = stripped.indexOf('//');
    const codePart = commentIdx === -1 ? stripped : stripped.slice(0, commentIdx);
    
    // Check = used as assignment (not in condition context)
    if (/^\s*(DECLARE\s+)?\w+\s*=\s*[^=]/.test(codePart) && !/^\s*(CONSTANT|IF|WHILE|UNTIL|CASE|REPEAT)/.test(codePart.trim())) {
      if (!/<=|>=|<>/.test(codePart) && !codePart.trim().startsWith('//')) {
        errors.push({ line: idx + 1, msg: `Use '←' for assignment, not '='`, type: 'warn' });
      }
    }
    // Unclosed string
    const strMatch = codePart.match(/"/g);
    if (strMatch && strMatch.length % 2 !== 0) {
      errors.push({ line: idx + 1, msg: 'Unclosed string literal', type: 'error' });
    }
    // Wrong-case keywords — e.g. "declare" instead of "DECLARE"
    const ALL_KW = [...KEYWORDS, ...TYPES, ...BOOLS];
    const wordRe = /\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
    let wm;
    // Strip strings from codePart before scanning words
    const codeNoStr = codePart.replace(/"[^"]*"/g,'""').replace(/'[^']*'/g,"''");
    while ((wm = wordRe.exec(codeNoStr)) !== null) {
      const w = wm[1];
      const wu = w.toUpperCase();
      if (ALL_KW.includes(wu) && w !== wu) {
        errors.push({ line: idx + 1, msg: `Keyword '${w}' should be uppercase: ${wu}`, type: 'error' });
        break; // one error per line is enough
      }
    }
  });
  
  lintErrors = errors;
  const badge = document.getElementById('linter-badge');
  if (errors.length === 0) {
    badge.className = 'status-item ok';
    badge.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> No issues`;
  } else {
    const errs = errors.filter(e => e.type === 'error').length;
    const warns = errors.filter(e => e.type === 'warn').length;
    badge.className = errs > 0 ? 'status-item err' : 'status-item warn';
    badge.innerHTML = errs > 0 ?
      `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${errs} error${errs>1?'s':''}, ${warns} warning${warns!==1?'s':''}` :
      `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${warns} warning${warns!==1?'s':''}`;
  }
}

codeInput.addEventListener('input', updateEditor);
codeInput.addEventListener('scroll', syncScroll);
codeInput.addEventListener('keydown', e => {
  // Tab = 3 spaces
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = codeInput.selectionStart, en = codeInput.selectionEnd;
    codeInput.value = codeInput.value.slice(0, s) + '   ' + codeInput.value.slice(en);
    codeInput.selectionStart = codeInput.selectionEnd = s + 3;
    updateEditor();
  }
  // Ctrl+Enter = Run
  if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); runCode(); }
  // Auto-close brackets and quotes
  const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  if (pairs[e.key]) {
    e.preventDefault();
    const s = codeInput.selectionStart, en = codeInput.selectionEnd;
    const selected = codeInput.value.slice(s, en);
    // For quotes: if cursor is sitting on a closing quote, skip over it instead of wrapping
    if ((e.key === '"' || e.key === "'") && selected.length === 0 && codeInput.value[s] === e.key) {
      codeInput.selectionStart = codeInput.selectionEnd = s + 1;
      updateEditor();
      return;
    }
    const ins = e.key + selected + pairs[e.key];
    codeInput.value = codeInput.value.slice(0, s) + ins + codeInput.value.slice(en);
    if (selected.length > 0) {
      codeInput.selectionStart = s + 1;
      codeInput.selectionEnd   = s + 1 + selected.length;
    } else {
      codeInput.selectionStart = codeInput.selectionEnd = s + 1;
    }
    updateEditor();
  }
  // Skip over a closing bracket if the next char is already that bracket
  if (e.key === ')' || e.key === ']' || e.key === '}') {
    const s = codeInput.selectionStart;
    if (codeInput.value[s] === e.key) {
      e.preventDefault();
      codeInput.selectionStart = codeInput.selectionEnd = s + 1;
      updateEditor();
    }
  }
  updateEditor();
});
codeInput.addEventListener('click', updateEditor);
codeInput.addEventListener('keyup', updateEditor);

// ============================================================
//  INTERPRETER  v4  – all bugs fixed
// ============================================================

const UNINITIALIZED = Symbol('UNINITIALIZED');

// Runtime state
let interpEnv        = {};
let interpTraceRows  = [];
let interpProcedures = {};
let interpFunctions  = {};
let declaredTypes    = {};   // varName → 'INTEGER' | 'REAL' | 'CHAR' | 'STRING' | 'BOOLEAN'
let isRunning        = false;
let interpDeadline   = Infinity; // ms timestamp; exceeded → throw timeout error
const RUN_TIMEOUT_MS = 900000;    // 900 seconds
// Yield counter — every N statements we do a real setTimeout to break the
// microtask chain and keep the browser responsive on large programs.
let interpYieldCounter = 0;
const YIELD_EVERY_N_STMTS = 8000;

// Step-mode
let interpStepMode = false;
let stepResolve    = null;

// Multi-file tabs
let files        = [];
let activeFileId = 1;
let nextFileId   = 2;

// ── updateEditor override (multi-file save) ──────────────────
// This redefinition supersedes the one in the editor-setup block above.
function updateEditor() {
  const code = codeInput.value;
  codeHighlight.innerHTML = highlight(code) + '\n';
  updateLineNumbers(code);
  updateStatusBar(code);
  if (linterEnabled) runLinter(code);
  if (autoSaveEnabled) {
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(() => { saveCurrentFile(); }, 500);
  }
  syncScroll();
}

// ── Console ──────────────────────────────────────────────────
function consoleLog(msg, cls = 'output') {
  const el = document.createElement('div');
  el.className = `console-line ${cls}`;
  el.textContent = String(msg);           // textContent handles emoji fine
  const out = document.getElementById('console-output');
  out.appendChild(el);
  out.scrollTop = out.scrollHeight;
}
function consoleClear() {
  document.getElementById('console-output').innerHTML = '';
}

// ── INPUT modal ──────────────────────────────────────────────
function requestInput(varName, typeName) {
  return new Promise(resolve => {
    if (inputMode === 'console') {
      const inputForm = document.getElementById('input-form');
      const promptLabel = document.getElementById('input-prompt-label');
      const inputField = document.getElementById('input-field');
      const submitBtn = document.getElementById('input-submit');
      promptLabel.textContent = `INPUT ${varName} >`;
      inputField.value = '';
      inputForm.classList.add('visible');
      inputField.focus();
      const doSubmit = () => {
        const val = inputField.value;
        inputForm.classList.remove('visible');
        submitBtn.removeEventListener('click', doSubmit);
        inputField.removeEventListener('keydown', kh);
        consoleLog(`${varName} = ${val}`, 'input-line');
        resolve(val);
      };
      const kh = e => { if (e.key === 'Enter') doSubmit(); };
      submitBtn.addEventListener('click', doSubmit);
      inputField.addEventListener('keydown', kh);
      return;
    }
    const overlay  = document.getElementById('input-modal-overlay');
    const modalVar = document.getElementById('modal-var');
    const modalInp = document.getElementById('modal-input');
    const submit   = document.getElementById('modal-submit');
    modalVar.textContent = typeName ? `${varName} (${typeName})` : varName;
    modalInp.value = '';
    overlay.classList.add('visible');
    modalInp.focus();
    const doSubmit = () => {
      const val = modalInp.value;
      overlay.classList.remove('visible');
      submit.removeEventListener('click', doSubmit);
      modalInp.removeEventListener('keydown', kh);
      consoleLog(`${varName} = ${val}`, 'input-line');
      resolve(val);
    };
    const kh = e => { if (e.key === 'Enter') doSubmit(); };
    submit.addEventListener('click', doSubmit);
    modalInp.addEventListener('keydown', kh);
  });
}

// ── Strip inline comments  (respects string literals) ────────
// e.g.  x ← 5 // note  →  "x ← 5"
// but   x ← "http://foo"  →  unchanged  (// is inside a string)
function stripLineComment(s) {
  let inStr = false, sc = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) { if (ch === sc) inStr = false; continue; }
    if (ch === '"' || ch === "'") { inStr = true; sc = ch; continue; }
    if (ch === '/' && s[i + 1] === '/') return s.slice(0, i).trimEnd();
  }
  return s;
}

// ── Arrow normalisation  <- → ← ─────────────────────────────
function normalizeArrows(s) {
  let out = '', inStr = false, sc = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) { out += ch; if (ch === sc) inStr = false; }
    else if (ch === '"' || ch === "'") { inStr = true; sc = ch; out += ch; }
    else if (ch === '<' && s[i + 1] === '-') { out += '\u2190'; i++; }
    else out += ch;
  }
  return out;
}

function findArrowIdx(s) {
  let inStr = false, sc = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) { if (ch === sc) inStr = false; continue; }
    if (ch === '"' || ch === "'") { inStr = true; sc = ch; continue; }
    if (ch === '\u2190') return i;
  }
  return -1;
}

// ── Trace  (Cambridge "compact row" buffered model) ──────────
//
//  A new row is committed only when a variable that appeared in
//  the LAST COMMITTED ROW is assigned again (signals a new loop
//  iteration / logical step), or when the program ends.
//  No flush on INPUT — that would split Counter and Value apart.
//
//  traceColOrder   → ordered variable names (first-seen)
//  _traceCurrent   → open buffer { line, vars:{}, outputs:[] }

let traceColOrder = [];
let _traceCurrent = null;

function _traceEnsureRow(lineNum) {
  if (!_traceCurrent) _traceCurrent = { line: lineNum, vars: {}, outputs: [] };
}

function _traceCommit() {
  if (_traceCurrent) { interpTraceRows.push(_traceCurrent); _traceCurrent = null; }
}

function traceVar(lineNum, name, val) {
  if (!traceColOrder.includes(name)) traceColOrder.push(name);
  const valStr = (val === null || val === undefined) ? '' : String(val);
// Commit the buffer if this variable is already in the current open row
  if (_traceCurrent && Object.prototype.hasOwnProperty.call(_traceCurrent.vars, name)) {
    _traceCommit();
  }
  _traceEnsureRow(lineNum);
  _traceCurrent.vars[name] = valStr;
  _traceCurrent.line = lineNum;
}

function traceOutput(lineNum, val) {
  const valStr = (val === null || val === undefined) ? '' : String(val);
  _traceEnsureRow(lineNum);
  _traceCurrent.outputs.push(valStr);
}

function finaliseTrace() { _traceCommit(); }

// ── Split helpers ────────────────────────────────────────────
function splitArgs(s) {
  const args = []; let depth = 0, cur = '', inStr = false, sc = '';
  for (const ch of s) {
    if (inStr) { cur += ch; if (ch === sc) inStr = false; continue; }
    if (ch === '"' || ch === "'") { inStr = true; sc = ch; cur += ch; continue; }
    if (ch === '(' || ch === '[') { depth++; cur += ch; continue; }
    if (ch === ')' || ch === ']') { depth--; cur += ch; continue; }
    if (ch === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

function splitOnOp(expr, op) {
  let depth = 0, inStr = false, sc = '';
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (inStr) { if (ch === sc) inStr = false; continue; }
    if (ch === '"' || ch === "'") { inStr = true; sc = ch; continue; }
    if (ch === '(' || ch === '[') { depth++; continue; }
    if (ch === ')' || ch === ']') { depth--; continue; }
    if (depth === 0 && expr.slice(i, i + op.length) === op) {
      const after  = expr[i + op.length] || '';
      const before = i > 0 ? expr[i - 1] : '';
      if (op === '<'  && (after === '=' || after === '>')) continue;
      if (op === '>'  && after === '=') continue;
      if (op === '='  && (before === '<' || before === '>' || before === '!')) continue;
      return [expr.slice(0, i).trim(), expr.slice(i + op.length).trim()];
    }
  }
  return null;
}

function splitOnKeyword(expr, kw) {
  // Match keyword surrounded by at least one space on each side,
  // or at a word boundary so "12 DIV 5" and "12  DIV  5" both work.
  let depth = 0, inStr = false, sc = '';
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (inStr) { if (ch === sc) inStr = false; continue; }
    if (ch === '"' || ch === "'") { inStr = true; sc = ch; continue; }
    if (ch === '(' || ch === '[') { depth++; continue; }
    if (ch === ')' || ch === ']') { depth--; continue; }
    if (depth === 0 && /\s/.test(ch)) {
      // Check if a keyword starts after the whitespace
      let j = i + 1;
      while (j < expr.length && /\s/.test(expr[j])) j++;
      if (expr.slice(j, j + kw.length).toUpperCase() === kw) {
        let k = j + kw.length;
        if (k < expr.length && /\s/.test(expr[k])) {
          // Confirmed: whitespace KW whitespace
          while (k < expr.length && /\s/.test(expr[k])) k++;
          return [expr.slice(0, i).trim(), expr.slice(k).trim()];
        }
      }
    }
  }
  return null;
}

// ── setVar – async so array indices can be evaluated ─────────
async function setVar(env, name, val, lineNum) {
  const am = name.match(/^(\w+)\s*\[(.+)\]$/);
  if (am) {
    const aName   = am[1];
    const idxExpr = am[2].trim();
    if (typeof env[aName] !== 'object' || env[aName] === null || env[aName] === UNINITIALIZED) {
      if (!enforceDeclareEnabled) {
        env[aName] = {};
      } else {
        throw { message: `Error on Line ${lineNum}: '${aName}' is not a declared array` };
      }
    }
    // Evaluate each dimension of the index — use splitArgs so that
    // expressions like  Grid[SnakeCords[1, 2], SnakeCords[1, 1]]
    // are split into exactly two parts, not four.
    const parts     = splitArgs(idxExpr);
    const evaluated = await Promise.all(parts.map(p => evalExpr(p.trim(), env, lineNum)));
    const normIdx   = evaluated.join(',');
    env[aName][normIdx] = val;
    traceVar(lineNum, `${aName}[${normIdx}]`, val);
    return;
  }
  env[name] = val;
  traceVar(lineNum, name, val);
}

function getVar(env, name, lineNum) {
  if (!Object.prototype.hasOwnProperty.call(env, name)) {
    if (!enforceDeclareEnabled) {
      env[name] = UNINITIALIZED;
      return env[name];
    }
    throw { message: `Error on Line ${lineNum}: Variable '${name}' has not been declared` };
  }
  const v = env[name];
  if (v === UNINITIALIZED)
    throw { message: `Error on Line ${lineNum}: Variable '${name}' is used before being assigned a value` };
  return v;
}

// ── evalExpr – async (needed for user-defined function calls) ─
async function evalExpr(expr, env, lineNum) {
  if (expr === null || expr === undefined) return null;
  expr = expr.trim();
  if (!expr) return null;

  // 1. String literals
  if (expr.length >= 2 && expr[0] === '"' && expr[expr.length - 1] === '"') return expr.slice(1, -1);
  if (expr.length >= 2 && expr[0] === "'" && expr[expr.length - 1] === "'") return expr.slice(1, -1);

  // 2. Boolean literals
  if (expr === 'TRUE')  return true;
  if (expr === 'FALSE') return false;

  // 3. Numeric literals
  if (/^-?\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);

  // 4. Array element  Arr[idx]  or  Grid[r,c]  (allow optional space before [)
  // Uses bracket-depth matching so expressions like Arr[i+j] work correctly.
  {
    const am = expr.match(/^(\w+)\s*\[/);
    if (am) {
      const aName = am[1];
      const idxStart = am[0].length - 1; // position of the '['
      // Find matching ']' with bracket depth tracking
      let depth = 0, idxEnd = -1;
      for (let ci = idxStart; ci < expr.length; ci++) {
        if (expr[ci] === '[') depth++;
        else if (expr[ci] === ']') { depth--; if (depth === 0) { idxEnd = ci; break; } }
      }
      if (idxEnd === expr.length - 1) {
        // The whole expression IS the array access
        if (!Object.prototype.hasOwnProperty.call(env, aName))
          throw { message: `Error on Line ${lineNum}: Array '${aName}' has not been declared` };
        const arr = env[aName];
        if (typeof arr !== 'object' || arr === null || arr === UNINITIALIZED)
          throw { message: `Error on Line ${lineNum}: '${aName}' is not an array` };
        const idxExpr    = expr.slice(idxStart + 1, idxEnd);
        const parts      = splitArgs(idxExpr.trim());
        const evaluated  = await Promise.all(parts.map(p => evalExpr(p.trim(), env, lineNum)));
        const normIdx    = evaluated.join(',');
        let val = arr[normIdx];
        if (val === undefined) {
          const numKey = Number(normIdx);
          if (!isNaN(numKey)) val = arr[numKey];
        }
        if (val === undefined)
          throw { message: `Error on Line ${lineNum}: Index [${normIdx}] out of bounds for '${aName}'` };
        if (val === UNINITIALIZED)
          throw { message: `Error on Line ${lineNum}: Array element '${aName}[${normIdx}]' has not been assigned` };
        return val;
      }
    }
  }

  // 5. Parentheses stripping
  if (expr[0] === '(') {
    let d = 0;
    for (let i = 0; i < expr.length; i++) {
      if (expr[i] === '(') d++;
      else if (expr[i] === ')') {
        d--;
        if (d === 0 && i === expr.length - 1) return evalExpr(expr.slice(1, -1), env, lineNum);
        if (d === 0) break;
      }
    }
  }

  // 6. NOT
  if (/^NOT\s/i.test(expr)) return !await evalExpr(expr.slice(4), env, lineNum);

  // 7. Built-in and user function calls  NAME(...)
  // ── 7a. Whole expression IS a single function call ──────────
  {
    const fm = expr.match(/^([A-Za-z_]\w*)\s*\((.*)?\)$/);
    if (fm) {
      const fn     = fm[1].toUpperCase();
      const argStr = fm[2] || '';
      const args   = argStr.trim()
        ? await Promise.all(splitArgs(argStr).map(a => evalExpr(a.trim(), env, lineNum)))
        : [];

      switch (fn) {
        case 'LENGTH':    return String(args[0] != null ? args[0] : '').length;
        case 'LCASE':     return String(args[0] != null ? args[0] : '').toLowerCase();
        case 'UCASE':     return String(args[0] != null ? args[0] : '').toUpperCase();
        case 'MID':       { const s = String(args[0] ?? ''); return s.slice(+args[1] - 1, (+args[1] - 1) + +args[2]); }
        case 'RIGHT':     return String(args[0] ?? '').slice(-Math.abs(+args[1]));
        case 'LEFT':      return String(args[0] ?? '').slice(0, +args[1]);
        case 'SUBSTRING': { const s = String(args[0] ?? ''); return s.slice(+args[1] - 1, (+args[1] - 1) + +args[2]); }
        case 'INT':       return Math.trunc(+args[0]);
        case 'RAND':      return Math.floor(Math.random() * Math.abs(+args[0])) + 1;
        case 'RANDOM':    return Math.random();
        case 'ROUND':     return parseFloat((+args[0]).toFixed(args[1] != null ? +args[1] : 0));
        case 'ABS':       return Math.abs(+args[0]);
        case 'SQRT':      return Math.sqrt(+args[0]);
        case 'EOF':       return true;
        case 'DIV':       return Math.trunc(+args[0] / +args[1]);
        case 'MOD':       return (+args[0]) % (+args[1]);
        case 'NOT':       return !args[0];
        default: {
          // User-defined function
          const ufn = interpFunctions[fn];
          if (ufn) {
            // localEnv inherits all globals so function can read them
            const localEnv = Object.assign({}, env);
            ufn.params.forEach((p, i) => {
              localEnv[p.name] = args[i] !== undefined ? args[i] : UNINITIALIZED;
            });
            let retVal = null;
            try {
              await interpret(ufn.lines, localEnv, 0, null, false);
            } catch (e) {
              if (e && e.type === 'return') retVal = e.value;
              else throw e;
            }
            return retVal;
          }
          throw { message: `Error on Line ${lineNum}: Unknown function '${fn}'` };
        }
      }
    }
  }

  // ── 7b. Sub-expression substitution ─────────────────────────
  // Replaces every NAME(...) function call and every NAME[...] array
  // element that appears inside a larger expression with a numbered
  // sentinel token, so the surrounding arithmetic / comparison operators
  // are handled by the steps below without getting confused by the inner
  // commas, brackets, or identifiers.
  // e.g.  SnakeCords[1,2]+1  →  __S0__+1  (with __S0__=value of element)
  //        ROUND(x,0)+1       →  __S0__+1
  {
    if (expr.includes('(') || expr.includes('[')) {
      const sentinels = [];
      let   out = '', ii = 0, inStr = false, sc = '';
      while (ii < expr.length) {
        const ch = expr[ii];
        if (inStr) { out += ch; if (ch === sc) inStr = false; ii++; continue; }
        if (ch === '"' || ch === "'") { inStr = true; sc = ch; out += ch; ii++; continue; }
        if (/[A-Za-z_]/.test(ch)) {
          // Collect the identifier
          let jj = ii + 1;
          while (jj < expr.length && /[A-Za-z0-9_]/.test(expr[jj])) jj++;
          const word = expr.slice(ii, jj);
          // Skip whitespace
          let kk = jj;
          while (kk < expr.length && expr[kk] === ' ') kk++;
          const next = expr[kk];
          if (next === '(' || next === '[') {
            // Find matching closing bracket
            const open = next, close = next === '(' ? ')' : ']';
            let depth = 0, ll = kk, inS2 = false, sc2 = '';
            while (ll < expr.length) {
              const c2 = expr[ll];
              if (inS2) { if (c2 === sc2) inS2 = false; ll++; continue; }
              if (c2 === '"' || c2 === "'") { inS2 = true; sc2 = c2; ll++; continue; }
              if (c2 === open) depth++;
              else if (c2 === close) { depth--; if (depth === 0) { ll++; break; } }
              ll++;
            }
            // Build subExpr with the space normalised out (e.g. "AppleCords [2]" → "AppleCords[2]")
            // Using expr.slice(ii,jj)+expr.slice(kk,ll) skips any whitespace between name and bracket.
            const subExpr = expr.slice(ii, jj) + expr.slice(kk, ll);
            const val     = await evalExpr(subExpr, env, lineNum);
            const tok     = `__S${sentinels.length}__`;
            sentinels.push({ token: tok, value: val });
            out += tok;
            ii   = ll;
            continue;
          }
          out += word; ii = jj; continue;
        }
        out += ch; ii++;
      }
      if (sentinels.length > 0) {
        const synEnv = Object.assign({}, env);
        sentinels.forEach(s => { synEnv[s.token] = s.value; });
        return await evalExpr(out, synEnv, lineNum);
      }
    }
  }

  // 8. DIV / MOD keywords
  { const p = splitOnKeyword(expr, 'DIV'); if (p) return Math.trunc(+await evalExpr(p[0], env, lineNum) / +await evalExpr(p[1], env, lineNum)); }
  { const p = splitOnKeyword(expr, 'MOD'); if (p) return (+await evalExpr(p[0], env, lineNum)) % (+await evalExpr(p[1], env, lineNum)); }

  // 9. Logical AND / OR
  { const p = splitOnKeyword(expr, 'AND'); if (p) return Boolean(await evalExpr(p[0], env, lineNum)) && Boolean(await evalExpr(p[1], env, lineNum)); }
  { const p = splitOnKeyword(expr, 'OR');  if (p) return Boolean(await evalExpr(p[0], env, lineNum)) || Boolean(await evalExpr(p[1], env, lineNum)); }

  // 10. String concatenation &
  { const p = splitOnOp(expr, '&'); if (p) return String(await evalExpr(p[0], env, lineNum)) + String(await evalExpr(p[1], env, lineNum)); }

  // 11. Comparisons (longest op first)
  for (const op of ['<>', '<=', '>=', '<', '>', '=']) {
    const p = splitOnOp(expr, op);
    if (p) {
      const [av, bv] = await Promise.all([evalExpr(p[0], env, lineNum), evalExpr(p[1], env, lineNum)]);
      // Use string ordering when both operands are strings; numeric otherwise
      const bothStr = typeof av === 'string' && typeof bv === 'string';
      switch (op) {
        case '=':  return av === bv;
        case '<>': return av !== bv;
        case '<':  return bothStr ? av < bv  : +av < +bv;
        case '>':  return bothStr ? av > bv  : +av > +bv;
        case '<=': return bothStr ? av <= bv : +av <= +bv;
        case '>=': return bothStr ? av >= bv : +av >= +bv;
      }
    }
  }

  // 12. Power ^
  { const p = splitOnOp(expr, '^'); if (p) return Math.pow(+await evalExpr(p[0], env, lineNum), +await evalExpr(p[1], env, lineNum)); }

  // 13. Arithmetic via safe JS eval  (+  -  *  /)
  {
    let jsExpr = '', i = 0, inStr = false, sc = '';
    while (i < expr.length) {
      const ch = expr[i];
      if (inStr) { jsExpr += ch; if (ch === sc) inStr = false; i++; continue; }
      if (ch === '"' || ch === "'") { inStr = true; sc = ch; jsExpr += ch; i++; continue; }
      if (/[A-Za-z_]/.test(ch)) {
        let j = i + 1;
        while (j < expr.length && /[A-Za-z0-9_]/.test(expr[j])) j++;
        const word = expr.slice(i, j);
        if (word === 'TRUE')  { jsExpr += 'true';  i = j; continue; }
        if (word === 'FALSE') { jsExpr += 'false'; i = j; continue; }
        if (Object.prototype.hasOwnProperty.call(env, word)) {
          const v = env[word];
          if (v === UNINITIALIZED)
            throw { message: `Error on Line ${lineNum}: Variable '${word}' is used before being assigned a value` };
          jsExpr += (typeof v === 'string') ? JSON.stringify(v) : (v === null ? 'null' : String(v));
        } else {
          jsExpr += word;
        }
        i = j; continue;
      }
      jsExpr += ch; i++;
    }
    try {
      // eslint-disable-next-line no-new-func
      return Function('"use strict"; return (' + jsExpr + ')')();
    } catch (_) { /* fall through */ }
  }

  // 14. Plain variable lookup
  if (/^[A-Za-z_]\w*$/.test(expr)) return getVar(env, expr, lineNum);

  throw { message: `Error on Line ${lineNum}: Cannot evaluate expression: ${expr}` };
}

// ── Collect procedure/function definitions (top-level only) ──
function collectDefs(lines) {
  interpProcedures = {};
  interpFunctions  = {};
  for (let j = 0; j < lines.length; j++) {
    const l = lines[j].text;
    if (/^PROCEDURE\s+\w+/.test(l)) {
      const name = l.match(/^PROCEDURE\s+(\w+)/)[1];
      let end = j + 1;
      while (end < lines.length && !/^ENDPROCEDURE\b/i.test(lines[end].text)) end++;
      interpProcedures[name.toUpperCase()] = { lines: lines.slice(j + 1, end), params: parseParams(l) };
    }
    if (/^FUNCTION\s+\w+/.test(l)) {
      const name = l.match(/^FUNCTION\s+(\w+)/)[1];
      let end = j + 1;
      while (end < lines.length && !/^ENDFUNCTION\b/i.test(lines[end].text)) end++;
      interpFunctions[name.toUpperCase()] = { lines: lines.slice(j + 1, end), params: parseParams(l), retType: parseReturnType(l) };
    }
  }
}

function parseParams(decl) {
  const m = decl.match(/\((.+)\)/);
  if (!m) return [];
  return splitArgs(m[1]).map(p => {
    const byref = /BYREF/i.test(p);
    const clean = p.replace(/BYVAL|BYREF/gi, '').trim();
    const pm = clean.match(/(\w+)\s*:\s*(\w+)/);
    return pm ? { name: pm[1], type: pm[2], byref } : { name: clean, type: 'ANY', byref };
  });
}
function parseReturnType(decl) {
  const m = decl.match(/RETURNS\s+(\w+)/i);
  return m ? m[1] : 'ANY';
}

// ── Execute a single inline statement (CASE body, etc.) ──────
async function executeInline(stmt, env, lineNum) {
  const fakeLine = { text: stmt, orig: stmt, num: lineNum };
  await interpret([fakeLine], env, 0, 1, false);
}

// ── Type validation for INPUT ─────────────────────────────────
function validateAndParseInput(raw, typeName, varName, lineNum) {
  if (!typeName) {
    // Auto-detect
    if (raw.toLowerCase() === 'true')  return true;
    if (raw.toLowerCase() === 'false') return false;
    if (raw.trim() !== '' && !isNaN(raw)) return raw.includes('.') ? parseFloat(raw) : parseInt(raw, 10);
    return raw;
  }
  const t = typeName.toUpperCase();
  if (t === 'INTEGER') {
    const n = Number(raw);
    if (raw.trim() === '' || isNaN(n) || !Number.isInteger(n))
      throw { message: `Error on Line ${lineNum}: '${varName}' is INTEGER but got "${raw}" — enter a whole number` };
    return n;
  }
  if (t === 'REAL') {
    const n = Number(raw);
    if (raw.trim() === '' || isNaN(n))
      throw { message: `Error on Line ${lineNum}: '${varName}' is REAL but got "${raw}" — enter a number` };
    return n;
  }
  if (t === 'BOOLEAN') {
    if (raw.toUpperCase() !== 'TRUE' && raw.toUpperCase() !== 'FALSE')
      throw { message: `Error on Line ${lineNum}: '${varName}' is BOOLEAN but got "${raw}" — enter TRUE or FALSE` };
    return raw.toUpperCase() === 'TRUE';
  }
  if (t === 'CHAR') {
    let charVal = raw;
    // Allow student to type 'A' with surrounding quotes (natural pseudocode habit)
    if (charVal.length === 3 && charVal[0] === "'" && charVal[2] === "'") charVal = charVal[1];
    if ([...charVal].length !== 1)
      throw { message: `Error on Line ${lineNum}: '${varName}' is CHAR but got "${raw}" — enter a single character` };
    return charVal;
  }
  if (t === 'DATE') {
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(raw.trim()))
      throw { message: `Error on Line ${lineNum}: '${varName}' is DATE but got "${raw}" — use dd/mm/yyyy format` };
    return raw.trim();
  }
  // STRING: any value
  return raw;
}

// ── MAIN INTERPRETER ─────────────────────────────────────────
// isTopLevel = true  →  run collectDefs and reset declaredTypes
// isTopLevel = false →  sub-call (procedure body, IF block, loop body, etc.)
//
// ─── Loop-stack design ───────────────────────────────────────────────────────
// FOR / WHILE / REPEAT loops no longer recurse into interpret() for each
// iteration.  Instead, they push a frame onto `loopStack` and jump `i` into
// the body.  NEXT / ENDWHILE / UNTIL peek at the top frame and either jump
// back to the body start or pop the frame and continue past the loop.
// This keeps the JS call-stack flat for any number of iterations and avoids
// the microtask-chain overflow ("too much recursion") that browsers impose on
// large sequences of chained Promises.
async function interpret(lines, env, startIdx = 0, endIdx = null, isTopLevel = false) {
  let i         = startIdx;
  const end     = endIdx !== null ? endIdx : lines.length;

  // Per-call loop stack (nested loops at the same syntactic level share it)
  const loopStack = [];

  if (isTopLevel) {
    collectDefs(lines);
    declaredTypes = {};
  }

  while (i < end) {
    const line = lines[i];
    let l = stripLineComment(normalizeArrows(line.text));

    // Execution timeout — catches infinite loops and runaway recursion
    if (Date.now() > interpDeadline)
      throw { message: `Execution timed out after ${RUN_TIMEOUT_MS / 1000}s — check for infinite loops` };

    // ── Periodic yield ────────────────────────────────────────────────────────
    // Every YIELD_EVERY_N_STMTS statements we hand control back to the browser
    // event loop via setTimeout.  This prevents microtask-chain overflows and
    // keeps the UI responsive during large loops (e.g. 100 000 iterations).
    if (++interpYieldCounter % YIELD_EVERY_N_STMTS === 0) {
      await new Promise(r => setTimeout(r, 0));
      // Re-check deadline after yielding (browser may have been busy)
      if (Date.now() > interpDeadline)
        throw { message: `Execution timed out after ${RUN_TIMEOUT_MS / 1000}s — check for infinite loops` };
    }

    // Skip blank lines and comments
    if (!l || l.startsWith('//')) { i++; continue; }

    // Skip procedure/function definitions in main flow
    if (/^(PROCEDURE|FUNCTION)\b/.test(l)) {
      while (i < end && !/^(ENDPROCEDURE|ENDFUNCTION)\b/i.test(lines[i].text)) i++;
      i++; continue;
    }
    if (/^(ENDPROCEDURE|ENDFUNCTION)\b/.test(l)) { i++; continue; }

    // ── STEP MODE pause ──────────────────────────────────────
    if (interpStepMode) {
      consoleLog(`\u2192 Line ${line.num}: ${line.orig.trim()}`, 'info');
      buildTraceTable();
      await new Promise(resolve => { stepResolve = resolve; });
      stepResolve = null;
    }

    // ════════════════════════════════════════════════════════
    //  STATEMENT DISPATCH
    // ════════════════════════════════════════════════════════

    // ── DECLARE ──────────────────────────────────────────────
    if (/^DECLARE\s+/.test(l)) {
      const rest = l.replace(/^DECLARE\s+/, '');
      // Find colon that separates name(s) from type, skipping brackets
      let colonIdx = -1, bd = 0;
      for (let ci = 0; ci < rest.length; ci++) {
        if (rest[ci] === '[') bd++;
        else if (rest[ci] === ']') bd--;
        else if (rest[ci] === ':' && bd === 0) { colonIdx = ci; break; }
      }
      if (colonIdx === -1)
        throw { message: `Error on Line ${line.num}: Invalid DECLARE — missing colon` };

      const namesPart = rest.slice(0, colonIdx).trim();
      const typePart  = rest.slice(colonIdx + 1).trim();
      // Support multiple names:  DECLARE a, b, c : INTEGER
      const names = namesPart.split(',').map(n => n.trim()).filter(Boolean);
      for (const name of names) {
        if (!/^\w+$/.test(name))
          throw { message: `Error on Line ${line.num}: Invalid identifier '${name}'` };

        if (/^ARRAY/i.test(typePart)) {
          const am = typePart.match(/^ARRAY\s*\[\s*(\d+)\s*:\s*(\d+)(?:\s*,\s*(\d+)\s*:\s*(\d+))?\s*\]\s+OF\s+(\w+)/i);
          env[name] = {};
          if (am) {
            if (am[3] !== undefined) {
              for (let r = +am[1]; r <= +am[2]; r++)
                for (let c = +am[3]; c <= +am[4]; c++) env[name][`${r},${c}`] = UNINITIALIZED;
            } else {
              for (let k = +am[1]; k <= +am[2]; k++) env[name][k] = UNINITIALIZED;
            }
            declaredTypes[name] = am[5] ? am[5].toUpperCase() : null; // element type
          }
        } else {
          env[name] = UNINITIALIZED;
          declaredTypes[name] = typePart.replace(/\s.*/,'').toUpperCase(); // e.g. STRING (ignore extra words)
        }
      }
      i++; continue;
    }

    // ── CONSTANT ─────────────────────────────────────────────
    if (/^CONSTANT\s+/.test(l)) {
      const m = l.match(/^CONSTANT\s+(\w+)\s*[\u2190=]\s*(.+)/);
      if (m) {
        env[m[1]] = await evalExpr(m[2].trim(), env, line.num);
        interpConstants.add(m[1]);
      }
      i++; continue;
    }

    // ── OUTPUT ───────────────────────────────────────────────
    if (/^OUTPUT\s+/.test(l)) {
      const rest  = l.replace(/^OUTPUT\s+/, '');
      const parts = splitArgs(rest);
      const vals  = await Promise.all(parts.map(async p => {
        const v = await evalExpr(p.trim(), env, line.num);
        return (v === null || v === undefined) ? '' : String(v);
      }));
      const outStr = vals.join('');
      consoleLog(outStr);
      traceOutput(line.num, outStr);
      i++; continue;
    }

    // ── INPUT ────────────────────────────────────────────────
    if (/^INPUT\s+/.test(l)) {
      const varName = l.replace(/^INPUT\s+/, '').trim();
      // Determine declared type (works for scalars and array elements)
      let typeName = null;
      const arrayMatch = varName.match(/^(\w+)\[/);
      typeName = arrayMatch ? declaredTypes[arrayMatch[1]] : declaredTypes[varName];

      // Re-prompt until the user provides a value matching the declared type
      let parsed;
      while (true) {
        const raw = await requestInput(varName, typeName);
        try {
          parsed = validateAndParseInput(raw, typeName, varName, line.num);
          break;
        } catch (e) {
          consoleLog((e && e.message ? e.message : String(e)) + ' — please try again.', 'error');
        }
      }
      await setVar(env, varName, parsed, line.num);
      i++; continue;
    }

    // ── ASSIGNMENT   LHS \u2190 RHS ──────────────────────────────
    {
      const ai = findArrowIdx(l);
      if (ai > 0 && !/^(IF|WHILE|UNTIL|FOR|REPEAT|CASE|DECLARE|CONSTANT|PROCEDURE|FUNCTION)\b/.test(l)) {
        const lhs = l.slice(0, ai).trim();
        // Prevent reassignment of constants
        const lhsVarName = lhs.replace(/\[.*\]$/, '');
        if (interpConstants.has(lhsVarName))
          throw { message: `Error on Line ${line.num}: Cannot reassign constant '${lhsVarName}'` };
        const rhs = l.slice(ai + 1).trim();
        const val = await evalExpr(rhs, env, line.num);
        await setVar(env, lhs, val, line.num);
        i++; continue;
      }
    }

    // ── IF ───────────────────────────────────────────────────
    if (/^IF\s+/.test(l)) {
      // Strip leading IF and trailing THEN (if present on same line)
      const afterIf  = l.replace(/^IF\s+/, '');
      const cond     = afterIf.replace(/\s+THEN\s*$/, '');
      const hasThen  = cond !== afterIf; // THEN was on this line
      let bodyStart  = i + 1;
      if (!hasThen) {
        // Look ahead for THEN on its own line (skip blanks/comments)
        for (let peek = i + 1; peek < end; peek++) {
          const pt = lines[peek].text.trim();
          if (!pt || pt.startsWith('//')) continue;
          if (/^THEN\s*$/i.test(pt)) bodyStart = peek + 1;
          break;
        }
      }
      const condVal = await evalExpr(cond, env, line.num);
      let depth = 1, j = bodyStart, elseJ = -1;
      while (j < end && depth > 0) {
        const t = lines[j].text;
        if (/^IF\b/i.test(t)) depth++;
        if (/^ENDIF\b/i.test(t)) depth--;
        if (depth === 1 && /^ELSE\b/i.test(t) && elseJ === -1) elseJ = j;
        j++;
      }
      const endifJ = j - 1;
      if (condVal)            await interpret(lines, env, bodyStart, elseJ !== -1 ? elseJ : endifJ);
      else if (elseJ !== -1)  await interpret(lines, env, elseJ + 1, endifJ);
      i = endifJ + 1; continue;
    }

    // ── FOR ──────────────────────────────────────────────────
    // Push a frame onto loopStack and jump i into the body.
    // NEXT (below) will handle iteration / exit.
    if (/^FOR\s+/.test(l)) {
      const m = l.match(/^FOR\s+(\w+)\s*[\u2190<=]\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+))?$/);
      if (m) {
        const [, v, fromE, toE, stepE] = m;
        const from = +await evalExpr(fromE, env, line.num);
        const to   = +await evalExpr(toE,   env, line.num);
        const step = stepE ? +await evalExpr(stepE, env, line.num) : 1;
        // Locate the matching NEXT (depth-aware)
        let depth = 1, j = i + 1;
        while (j < end && depth > 0) {
          if (/^FOR\b/i.test(lines[j].text)) depth++;
          if (/^NEXT\b/i.test(lines[j].text)) depth--;
          j++;
        }
        const nextJ  = j - 1; // index of the NEXT line
        const okCond = step > 0 ? (val => val <= to) : (val => val >= to);
        if (okCond(from)) {
          await setVar(env, v, from, line.num);
          loopStack.push({ type: 'for', v, val: from, to, step, okCond, bodyStart: i + 1, nextJ, lineNum: line.num });
          i = i + 1; // enter body
        } else {
          i = nextJ + 1; // condition false from start — skip body
        }
        continue;
      }
    }

    // ── WHILE ────────────────────────────────────────────────
    // Evaluate condition; if true push a frame and enter the body.
    // ENDWHILE (below) will re-evaluate and loop back or exit.
    if (/^WHILE\s+/.test(l)) {
      const condExpr = l.replace(/^WHILE\s+/, '').replace(/\s+DO\s*$/, '');
      let depth = 1, j = i + 1;
      while (j < end && depth > 0) {
        if (/^WHILE\b/i.test(lines[j].text)) depth++;
        if (/^ENDWHILE\b/i.test(lines[j].text)) depth--;
        j++;
      }
      const endJ = j - 1; // index of the ENDWHILE line
      const condVal = await evalExpr(condExpr, env, line.num);
      if (condVal) {
        loopStack.push({ type: 'while', condExpr, bodyStart: i + 1, endJ, lineNum: line.num });
        i = i + 1; // enter body
      } else {
        i = endJ + 1; // skip body
      }
      continue;
    }

    // ── REPEAT ──────────────────────────────────────────────
    // Push a frame and enter the body immediately (always runs at least once).
    // UNTIL (below) checks the exit condition and loops back or exits.
    if (/^REPEAT$/.test(l)) {
      let j = i + 1;
      while (j < end && !/^UNTIL\b/i.test(lines[j].text)) j++;
      const untilJ = j; // index of the UNTIL line
      loopStack.push({ type: 'repeat', bodyStart: i + 1, untilJ });
      i = i + 1; // enter body
      continue;
    }

    // ── CASE OF ─────────────────────────────────────────────
    if (/^CASE\s+OF\s+/.test(l)) {
      const varVal = await evalExpr(l.replace(/^CASE\s+OF\s+/, '').trim(), env, line.num);
      let j = i + 1, matched = false;
      while (j < end && !/^ENDCASE\b/i.test(lines[j].text)) {
        const cl = normalizeArrows(lines[j].text);
        if (/^OTHERWISE\b/i.test(cl)) {
          if (!matched) {
            const stmt = cl.replace(/^OTHERWISE\s*:?\s*/i, '').trim();
            if (stmt) await executeInline(stmt, env, lines[j].num);
            else {
              let k = j + 1;
              while (k < end && !/^ENDCASE\b/i.test(lines[k].text)) k++;
              await interpret(lines, env, j + 1, k);
              j = k; break;
            }
          }
          while (j < end && !/^ENDCASE\b/i.test(lines[j].text)) j++;
          break;
        }
        const cm = cl.match(/^(.+?)\s*:\s*(.*)?$/);
        if (cm && !matched) {
          const caseExpr = cm[1].trim();
          const stmt     = (cm[2] || '').trim();
          let match = false;
          const rangeM = caseExpr.match(/^(.+?)\s+TO\s+(.+)$/i);
          if (rangeM) {
            const lo = await evalExpr(rangeM[1], env, line.num);
            const hi = await evalExpr(rangeM[2], env, line.num);
            match = varVal >= lo && varVal <= hi;
          } else {
            match = (await evalExpr(caseExpr, env, line.num)) == varVal;
          }
          if (match) {
            matched = true;
            if (stmt) await executeInline(stmt, env, lines[j].num);
            else {
              let k = j + 1;
              while (k < end && !/^ENDCASE\b/i.test(lines[k].text) && !/^OTHERWISE\b/i.test(lines[k].text)) {
                if (/^.+\s*:/.test(normalizeArrows(lines[k].text)) && !/^(IF|WHILE|FOR|REPEAT)\b/i.test(lines[k].text)) break;
                k++;
              }
              await interpret(lines, env, j + 1, k);
              j = k - 1;
            }
          }
        }
        j++;
      }
      i = j + 1; continue;
    }

    // ── CALL ─────────────────────────────────────────────────
    if (/^CALL\s+/.test(l)) {
      const m = l.match(/^CALL\s+(\w+)(?:\s*\((.*)\))?/);
      if (m) {
        const pName  = m[1];
        const argStr = m[2] || '';
        const proc   = interpProcedures[pName.toUpperCase()];
        if (!proc)
          throw { message: `Error on Line ${line.num}: Procedure '${pName}' is not defined` };
        // Keep raw arg expressions so BYREF can write back to the correct caller variable
        const argExprs = argStr.trim() ? splitArgs(argStr) : [];
        const args     = await Promise.all(argExprs.map(a => evalExpr(a.trim(), env, line.num)));
        // localEnv inherits all of env so the procedure can read global vars
        const localEnv = Object.assign({}, env);
        proc.params.forEach((p, idx) => {
          localEnv[p.name] = args[idx] !== undefined ? args[idx] : UNINITIALIZED;
        });
        await interpret(proc.lines, localEnv, 0, null, false);
        // Write back all pre-existing globals (excluding BYVAL params that shadow them)
        const byvalNames = new Set(proc.params.filter(p => !p.byref).map(p => p.name));
        Object.keys(env).forEach(key => {
          if (!byvalNames.has(key) && Object.prototype.hasOwnProperty.call(localEnv, key)) {
            env[key] = localEnv[key];
          }
        });
        // BYREF: write formal param value back to the actual argument variable at call site
        proc.params.forEach((p, idx) => {
          if (p.byref && idx < argExprs.length) {
            const argVar = argExprs[idx].trim();
            if (/^\w+$/.test(argVar) && Object.prototype.hasOwnProperty.call(env, argVar)) {
              env[argVar] = localEnv[p.name];
            }
          }
        });
      }
      i++; continue;
    }

    // ── RETURN ───────────────────────────────────────────────
    if (/^RETURN\s+/.test(l)) {
      const val = await evalExpr(l.replace(/^RETURN\s+/, ''), env, line.num);
      throw { type: 'return', value: val };
    }

    // ── FILE OPS (stub) ──────────────────────────────────────
    if (/^(OPENFILE|CLOSEFILE|READFILE|WRITEFILE|SEEK|GETRECORD|PUTRECORD)\b/.test(l)) {
      consoleLog(`// Note: File operation on line ${line.num} is not simulated`, 'info');
      i++; continue;
    }

    // ── NEXT ─────────────────────────────────────────────────
    // Advance the loop variable; jump back to body or exit.
    if (/^NEXT\b/.test(l)) {
      const frame = loopStack.length > 0 ? loopStack[loopStack.length - 1] : null;
      if (frame && frame.type === 'for') {
        frame.val += frame.step;
        if (frame.okCond(frame.val)) {
          await setVar(env, frame.v, frame.val, frame.lineNum);
          i = frame.bodyStart; // jump back to first line of body
        } else {
          loopStack.pop();
          i = frame.nextJ + 1; // past the NEXT line
        }
      } else {
        i++; // unmatched NEXT — skip (shouldn't happen in valid pseudocode)
      }
      continue;
    }

    // ── ENDWHILE ─────────────────────────────────────────────
    // Re-evaluate the WHILE condition; loop back or exit.
    if (/^ENDWHILE\b/.test(l)) {
      const frame = loopStack.length > 0 ? loopStack[loopStack.length - 1] : null;
      if (frame && frame.type === 'while') {
        const condVal = await evalExpr(frame.condExpr, env, frame.lineNum);
        if (condVal) {
          i = frame.bodyStart; // loop back
        } else {
          loopStack.pop();
          i = frame.endJ + 1; // past ENDWHILE
        }
      } else {
        i++;
      }
      continue;
    }

    // ── UNTIL ────────────────────────────────────────────────
    // Evaluate the exit condition; repeat or exit.
    if (/^UNTIL\b/.test(l)) {
      const frame = loopStack.length > 0 ? loopStack[loopStack.length - 1] : null;
      if (frame && frame.type === 'repeat') {
        // `l` is already normalizeArrows'd
        const untilCond = l.replace(/^UNTIL\s+/i, '');
        const condVal   = await evalExpr(untilCond, env, line.num);
        if (!condVal) {
          i = frame.bodyStart; // loop again
        } else {
          loopStack.pop();
          i = frame.untilJ + 1; // past UNTIL
        }
      } else {
        i++;
      }
      continue;
    }

    // ── Structural markers consumed by parent ────────────────
    if (/^(ENDIF|ELSE|ENDCASE|OTHERWISE|THEN)\b/.test(l)) { i++; continue; }

    // ── Unrecognised statement → error ───────────────────────
    const firstWord = l.match(/^(\w+)/);
    if (firstWord) {
      const fw = firstWord[1].toUpperCase();
      if (['DEFINE','SET','TYPE','ENDTYPE','CLASS','ENDCLASS','INHERITS','SUPER','NEW','PUBLIC','PRIVATE','GETRECORD','PUTRECORD'].includes(fw))
        throw { message: `Error on Line ${line.num}: Keyword '${firstWord[1]}' is recognised but not implemented in this IDE` };
    }
    throw { message: `Error on Line ${line.num}: Unrecognised statement: "${line.orig.trim()}"` };
  }
}

// ── Track constants to enforce immutability ─────────────────
let interpConstants = new Set();

// ── Lowercase keyword detection & fix ───────────────────────

function detectLowercaseKeywords(code) {
  const lines = code.split('\n');
  for (const line of lines) {
    const commentIdx = line.indexOf('//');
    const codePart = commentIdx === -1 ? line : line.slice(0, commentIdx);
    const tokens = tokenizeLine(codePart);
    for (const tok of tokens) {
      if ((tok.type === 'keyword' || tok.type === 'type' || tok.type === 'bool') && tok.val !== tok.val.toUpperCase()) {
        return true;
      }
    }
  }
  return false;
}

function fixLowercaseKeywords(code) {
  const lines = code.split('\n');
  return lines.map(line => {
    const commentIdx = line.indexOf('//');
    const codePart = commentIdx === -1 ? line : line.slice(0, commentIdx);
    const commentPart = commentIdx !== -1 ? line.slice(commentIdx) : '';
    const tokens = tokenizeLine(codePart);
    let result = '';
    for (const tok of tokens) {
      if ((tok.type === 'keyword' || tok.type === 'type' || tok.type === 'bool') && tok.val !== tok.val.toUpperCase()) {
        result += tok.val.toUpperCase();
      } else {
        result += tok.val;
      }
    }
    return result + commentPart;
  }).join('\n');
}

// ── RUN ──────────────────────────────────────────────────────
async function _doRun() {
  if (isRunning) return;
  consoleClear();
  consoleLog('\u25b6 Running program\u2026', 'info');
  interpTraceRows = []; traceColOrder = []; _traceCurrent = null; interpEnv = {}; interpConstants = new Set();
  isRunning = true;
  interpYieldCounter = 0;
  interpDeadline = Date.now() + RUN_TIMEOUT_MS;
  document.getElementById('btn-run').disabled = true;
  switchRightTab('console');
  const lines = codeInput.value.split('\n').map((t, i) => ({ text: t.trim(), orig: t, num: i + 1 }));
  try {
    await interpret(lines, interpEnv, 0, null, true);
    consoleLog('\u2713 Program finished.', 'info');
  } catch (e) {
    consoleLog(e && e.message ? e.message : String(e), 'error');
  }
  isRunning = false;
  interpDeadline = Infinity;
  document.getElementById('btn-run').disabled = false;
  finaliseTrace();
  buildTraceTable();
}

async function runCode() {
  if (isRunning) return;

  // Check for lowercase keywords
  if (detectLowercaseKeywords(codeInput.value)) {
    const overlay = document.getElementById('case-fix-overlay');
    overlay.classList.add('visible');
    return;
  }

  await _doRun();
}

// ── STEP ─────────────────────────────────────────────────────
function stepCode() {
  if (!interpStepMode) {
    consoleClear();
    interpTraceRows = []; traceColOrder = []; _traceCurrent = null; interpEnv = {};
    interpStepMode = true;
    document.getElementById('btn-step').style.borderColor = 'var(--yellow)';
    document.getElementById('btn-step').style.color       = 'var(--yellow)';
    document.getElementById('btn-run').disabled = true;
    const lines = codeInput.value.split('\n').map((t, i) => ({ text: t.trim(), orig: t, num: i + 1 }));
    interpret(lines, interpEnv, 0, null, true)
      .then(() => { consoleLog('\u2713 Program finished.', 'info'); finaliseTrace(); buildTraceTable(); endStepMode(); })
      .catch(e  => { consoleLog(e && e.message ? e.message : String(e), 'error'); finaliseTrace(); buildTraceTable(); endStepMode(); });
    // Trigger first step
    if (stepResolve) { const r = stepResolve; stepResolve = null; r(); }
  } else {
    if (stepResolve) { const r = stepResolve; stepResolve = null; r(); }
    else consoleLog('// Program has finished or is awaiting INPUT.', 'info');
  }
}

function endStepMode() {
  interpStepMode = false; stepResolve = null;
  document.getElementById('btn-step').style.borderColor = '';
  document.getElementById('btn-step').style.color = '';
  document.getElementById('btn-run').disabled = false;
}

function resetExecution() {
  isRunning = false; endStepMode();
  interpEnv = {}; interpTraceRows = []; traceColOrder = []; _traceCurrent = null; interpProcedures = {}; interpFunctions = {}; interpConstants = new Set();
  interpDeadline = Infinity;
  document.getElementById('input-modal-overlay').classList.remove('visible');
  consoleClear();
  consoleLog('// Console cleared. Ready to run.', 'info');
  document.getElementById('trace-container').innerHTML = '<div class="trace-hint">Run your code to populate the trace table.</div>';
}

// ── Trace table ──────────────────────────────────────────────
function buildTraceTable() {
  const container = document.getElementById('trace-container');
  if (!interpTraceRows.length) {
    container.innerHTML = '<div class="trace-hint">No variable changes recorded. Run your code first.</div>';
    return;
  }

  const vars = traceColOrder;

  let html = `<table id="trace-table"><thead><tr><th>Line</th>`;
  vars.forEach(v => html += `<th>${escHtml(v)}</th>`);
  html += `<th style="color:var(--cyan)">OUTPUT</th></tr></thead><tbody>`;

  for (const row of interpTraceRows) {
    const hasVars    = Object.keys(row.vars).length > 0;
    const hasOutputs = row.outputs.length > 0;
    if (!hasVars && !hasOutputs) continue;

    const outputCount = Math.max(1, row.outputs.length);
    for (let oi = 0; oi < outputCount; oi++) {
      html += `<tr>`;
      if (oi === 0) {
        html += `<td>${row.line}</td>`;
        vars.forEach(v => {
          if (Object.prototype.hasOwnProperty.call(row.vars, v)) {
            html += `<td style="color:var(--green);font-weight:600">${escHtml(row.vars[v])}</td>`;
          } else {
            html += '<td></td>';
          }
        });
      } else {
        html += `<td></td>`;
        vars.forEach(() => { html += '<td></td>'; });
      }
      const outVal = row.outputs[oi] || '';
      html += `<td style="color:var(--cyan)">${escHtml(outVal)}</td></tr>`;
    }
  }

  html += '</tbody></table>';
  container.innerHTML = html;
}

// ── Multi-file tab system ─────────────────────────────────────
function manualSave() {
  saveCurrentFile();
  // Brief visual feedback on the Save button
  const btn = [...document.querySelectorAll('.title-btn')].find(b => b.textContent.includes('Save'));
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Saved!`;
    btn.style.color = 'var(--green, #4ade80)';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
  }
}

function saveCurrentFile() {
  const cur = files.find(f => f.id === activeFileId);
  if (cur) cur.content = codeInput.value;
  // Persist the full workspace so all files, names and the active tab survive reload
  try {
    localStorage.setItem('cie_workspace', JSON.stringify({
      files,
      activeFileId,
      nextFileId
    }));
    // Keep the legacy key in sync so old code reading it still works
    if (cur && cur.id === 1) localStorage.setItem('cie_code', cur.content);
  } catch (_) { /* storage quota exceeded – silently ignore */ }
}

function renameFile(id) {
  // Used from sidebar — prompts via the same inline-input approach
  const f = files.find(f => f.id === id);
  if (!f) return;
  // Find the nameSpan in the sidebar and kick off inline rename there
  const sidebarList = document.getElementById('sidebar-file-list');
  if (!sidebarList) return;
  const rows = sidebarList.querySelectorAll('.snippet-item');
  rows.forEach((row, idx) => {
    if (files[idx] && files[idx].id === id) {
      const nameSpan = row.querySelector('.sidebar-filename');
      if (nameSpan) startRenameInline(id, nameSpan);
    }
  });
}

function startRenameInline(id, nameEl) {
  const f = files.find(f => f.id === id);
  if (!f) return;
  const inp = document.createElement('input');
  inp.value = f.name;
  inp.style.cssText = [
    'background:var(--bg-editor)',
    'border:1px solid var(--accent)',
    'border-radius:3px',
    'color:var(--text-primary)',
    'font-family:var(--font-mono)',
    'font-size:12px',
    'padding:1px 5px',
    'outline:none',
    'min-width:60px',
    'width:' + Math.max(70, f.name.length * 8 + 16) + 'px',
  ].join(';');
  nameEl.replaceWith(inp);
  inp.select();
  let committed = false;
  const commit = () => {
    if (committed) return;
    committed = true;
    const newName = inp.value.trim();
    if (newName) f.name = newName;
    renderTabs();
  };
  inp.addEventListener('blur', commit);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); inp.blur(); }
    if (e.key === 'Escape') { committed = true; renderTabs(); } // cancel
    e.stopPropagation(); // don't fire Run on Ctrl+Enter etc.
  });
  inp.focus();
}

function renderTabs() {
  const tabBar = document.getElementById('editor-tabs');
  tabBar.innerHTML = '';
  files.forEach(f => {
    const tab = document.createElement('div');
    const isActive = f.id === activeFileId;
    tab.className = 'editor-tab' + (isActive ? ' active' : '');
    tab.style.cursor = 'pointer';
    const dot  = document.createElement('span');
    dot.className = 'tab-dot';
    const name = document.createElement('span');
    name.textContent = f.name;
    name.title = 'Double-click to rename';
    name.addEventListener('dblclick', e => { e.stopPropagation(); startRenameInline(f.id, name); });
    tab.appendChild(dot);
    tab.appendChild(name);
    if (files.length > 1) {
      const x = document.createElement('button');
      x.textContent = '\u00d7';
      x.style.cssText = 'background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:0 0 0 6px;line-height:1;margin-left:2px';
      x.addEventListener('click', e => { e.stopPropagation(); closeFile(f.id); });
      tab.appendChild(x);
    }
    tab.addEventListener('click', () => switchFile(f.id));
    tab.addEventListener('contextmenu', e => showContextMenu(e, f.id));
    tabBar.appendChild(tab);
  });
  // "+" new-file button
  const plus = document.createElement('button');
  plus.textContent = '+';
  plus.title = 'New file';
  plus.style.cssText = 'background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0 12px;font-size:20px;line-height:34px;flex-shrink:0';
  plus.addEventListener('click', newFile);
  tabBar.appendChild(plus);
  // Sync title bar filename
  const active = files.find(f => f.id === activeFileId);
  if (active) {
    ['tab-filename'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = active.name;
    });
    const tc = document.getElementById('title-filename');
    if (tc) tc.textContent = active.name;
  }
  // Rebuild sidebar file list so it always matches the open tabs
  const sidebarList = document.getElementById('sidebar-file-list');
  if (sidebarList) {
    sidebarList.innerHTML = '';
    files.forEach(f => {
      const row = document.createElement('div');
      row.className = 'snippet-item';
      row.style.justifyContent = 'space-between';
      if (f.id === activeFileId) row.style.color = 'var(--accent)';
      const label = document.createElement('span');
      label.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1;min-width:0;cursor:pointer';
      label.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
      const nameSpan = document.createElement('span');
      nameSpan.textContent = f.name;
      nameSpan.className = 'sidebar-filename';
      nameSpan.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      nameSpan.title = 'Double-click to rename';
      nameSpan.addEventListener('dblclick', e => { e.stopPropagation(); startRenameInline(f.id, nameSpan); });
      label.appendChild(nameSpan);
      label.addEventListener('click', () => switchFile(f.id));
      row.appendChild(label);
      row.addEventListener('contextmenu', e => showContextMenu(e, f.id));
      // Pencil rename button
      const editBtn = document.createElement('button');
      editBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
      editBtn.title = 'Rename';
      editBtn.style.cssText = 'background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0 4px;flex-shrink:0;display:flex;align-items:center';
      editBtn.addEventListener('click', e => { e.stopPropagation(); startRenameInline(f.id, nameSpan); });
      row.appendChild(editBtn);
      if (files.length > 1) {
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = 'background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:0 0 0 4px;flex-shrink:0';
        closeBtn.addEventListener('click', e => { e.stopPropagation(); closeFile(f.id); });
        row.appendChild(closeBtn);
      }
      sidebarList.appendChild(row);
    });
  }
}

function switchFile(id) {
  saveCurrentFile();
  activeFileId = id;
  const target = files.find(f => f.id === id);
  if (target) { codeInput.value = target.content; updateEditor(); }
  renderTabs();
}

function newFile() {
  saveCurrentFile();
  const name = `file${nextFileId}.txt`;
  files.push({ id: nextFileId, name, content: '// New file\n' });
  activeFileId = nextFileId++;
  codeInput.value = files[files.length - 1].content;
  updateEditor(); renderTabs();
  consoleClear(); consoleLog('// New file created.', 'info');
}

function closeFile(id) {
  if (files.length <= 1) return;
  const idx = files.findIndex(f => f.id === id);
  files.splice(idx, 1);
  if (activeFileId === id) {
    activeFileId = files[Math.min(idx, files.length - 1)].id;
    codeInput.value = files.find(f => f.id === activeFileId).content;
    updateEditor();
  }
  renderTabs();
}

function duplicateFile(id) {
  const f = files.find(f => f.id === id);
  if (!f) return;
  const baseName = f.name.replace(/\.[^.]+$/, '');
  const ext = f.name.includes('.') ? f.name.slice(f.name.lastIndexOf('.')) : '';
  let copyName = `${baseName}_copy${ext}`;
  let counter = 2;
  while (files.some(f => f.name === copyName)) {
    copyName = `${baseName}_copy${counter}${ext}`;
    counter++;
  }
  const newId = nextFileId++;
  files.push({ id: newId, name: copyName, content: f.content });
  activeFileId = newId;
  codeInput.value = f.content;
  updateEditor();
  renderTabs();
  consoleLog(`// Duplicated as "${copyName}"`, 'info');
}

function deleteFile(id) {
  if (files.length <= 1) {
    consoleLog('// Cannot delete the last file.', 'error');
    return;
  }
  const idx = files.findIndex(f => f.id === id);
  files.splice(idx, 1);
  if (activeFileId === id) {
    activeFileId = files[Math.min(idx, files.length - 1)].id;
    codeInput.value = files.find(f => f.id === activeFileId).content;
    updateEditor();
  }
  renderTabs();
}

// ── Context menu ─────────────────────────────────────────────
let _ctxMenuFileId = null;

function showContextMenu(e, fileId) {
  e.preventDefault();
  e.stopPropagation();
  _ctxMenuFileId = fileId;
  const menu = document.getElementById('file-context-menu');
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.classList.add('visible');
}

function hideContextMenu() {
  const menu = document.getElementById('file-context-menu');
  menu.classList.remove('visible');
  _ctxMenuFileId = null;
}

// ── Theme toggle ─────────────────────────────────────────────
function toggleTheme() {
  const light = document.body.classList.toggle('light-mode');
  const btn = document.getElementById('btn-theme');
  btn.textContent = light ? '\u2600' : '\u23FE';
  const chk = document.getElementById('light-mode-toggle');
  if (chk) chk.checked = light;
  localStorage.setItem('cie_theme', light ? 'light' : 'dark');
}

function clearCode() {
  codeInput.value = '';
  saveCurrentFile();
  updateEditor();
  consoleClear();
  consoleLog('// Editor cleared.', 'info');
}

function downloadCode() {
  const active = files.find(f => f.id === activeFileId);
  const baseName = active ? active.name.replace(/\.[^.]+$/, '') : 'pseudocode';
  const blob = new Blob([codeInput.value], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = baseName + '.txt'; a.click();
  URL.revokeObjectURL(url);
}

// ── Sidebar ──────────────────────────────────────────────────
function switchSidebar(panel) {
  ['snippets','files','settings'].forEach(p => {
    document.getElementById(`panel-${p}`).style.display = p === panel ? 'block' : 'none';
    document.getElementById(`ab-${p}`).classList.toggle('active', p === panel);
  });
  if (currentSidebarPanel === panel) {
    document.getElementById('sidebar-panel').classList.toggle('collapsed');
    currentSidebarPanel = document.getElementById('sidebar-panel').classList.contains('collapsed') ? null : panel;
  } else {
    document.getElementById('sidebar-panel').classList.remove('collapsed');
    currentSidebarPanel = panel;
  }
}

let snippetTooltipTimeout;

function buildSnippets() {
  const list = document.getElementById('snippets-list');
  const tooltip = document.getElementById('snippet-tooltip');
  const sidebarPanel = document.getElementById('sidebar-panel');
  const isMobile = window.innerWidth <= 640;
  if (!tooltip.dataset.hoverInit) {
    tooltip.dataset.hoverInit = '1';
    tooltip.addEventListener('mouseenter', () => clearTimeout(snippetTooltipTimeout));
    tooltip.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
  }
  list.innerHTML = '';
  SNIPPETS.forEach(cat => {
    const catEl = document.createElement('div');
    catEl.className = 'snippet-category';
    catEl.textContent = cat.category;
    list.appendChild(catEl);
    cat.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'snippet-item';
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>${escHtml(item.name)}`;
      if (isMobile) {
        el.title = `View: ${item.name}`;
        el.addEventListener('click', () => {
          const highlighted = highlight(item.code);
          showMobileCodePopup(item.name, item.code, highlighted);
        });
      } else {
        el.title = `Insert: ${item.name}`;
        el.addEventListener('click', () => insertSnippet(item.code));
        const highlighted = highlight(item.code);
        el.addEventListener('mouseenter', e => {
          clearTimeout(snippetTooltipTimeout);
          tooltip.innerHTML = `
            <div class="tt-header">
              <span class="tt-name">${escHtml(item.name)}</span>
              <button class="tt-copy">Copy</button>
            </div>
            <pre>${highlighted}</pre>`;
          tooltip.style.display = 'block';
          positionSnippetTooltip(e, tooltip, sidebarPanel);
          const copyBtn = tooltip.querySelector('.tt-copy');
          copyBtn.addEventListener('click', e2 => {
            e2.stopPropagation();
            copyCodeToClipboard(item.code, copyBtn);
          });
        });
        el.addEventListener('mousemove', e => {
          positionSnippetTooltip(e, tooltip, sidebarPanel);
        });
        el.addEventListener('mouseleave', () => {
          snippetTooltipTimeout = setTimeout(() => {
            tooltip.style.display = 'none';
          }, 150);
        });
      }
      list.appendChild(el);
    });
  });
}

function positionSnippetTooltip(e, tooltip, sidebarPanel) {
  const sr = sidebarPanel.getBoundingClientRect();
  const tx = sr.right + 8;
  let ty = e.clientY - tooltip.offsetHeight / 2;
  ty = Math.max(8, Math.min(window.innerHeight - tooltip.offsetHeight - 8, ty));
  tooltip.style.left = tx + 'px';
  tooltip.style.top = ty + 'px';
}

function showMobileCodePopup(name, code, highlighted) {
  const popup = document.getElementById('mobile-code-popup');
  document.getElementById('mobile-code-popup-name').textContent = name;
  document.getElementById('mobile-code-popup-body').innerHTML = highlighted;
  const copyBtn = document.getElementById('mob-copy-code-btn');
  copyBtn.classList.remove('copied');
  copyBtn.textContent = 'Copy Code';
  popup.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function hideMobileCodePopup() {
  document.getElementById('mobile-code-popup').classList.remove('visible');
  document.body.style.overflow = '';
}

function copyCodeToClipboard(text, btn) {
  const originalText = btn.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 2000);
  });
}

function insertSnippet(code) {
  const ta = codeInput, s = ta.selectionStart;
  const before = ta.value.slice(0, s), after = ta.value.slice(ta.selectionEnd);
  const prefix = before && !before.endsWith('\n') ? '\n\n' : '';
  ta.value = before + prefix + code + '\n' + after;
  ta.selectionStart = ta.selectionEnd = s + prefix.length + code.length + 1;
  ta.focus(); updateEditor();
}

function switchRightTab(tab) {
  ['console','trace'].forEach(t => {
    document.getElementById(`pane-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`rt-${t}`).classList.toggle('active', t === tab);
  });
}

function changeFontSize(size) {
  [codeInput, codeHighlight, lineNumbers].forEach(el => {
    el.style.fontSize = `${size}px`; el.style.lineHeight = '1.7';
  });
  updateEditor();
}
function toggleAutoSave(val)    { autoSaveEnabled = val; }
function toggleLinter(val)      { linterEnabled = val; if (!val) document.getElementById('linter-badge').innerHTML = ''; }
function toggleEnforceDeclare(val) { enforceDeclareEnabled = val; }
function toggleLineNumbers(val) { lineNumbersEnabled = val; lineNumbers.style.display = val ? 'block' : 'none'; updateEditor(); }
function toggleLightMode(val) {
  document.body.classList.toggle('light-mode', val);
  const btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = val ? '\u2600' : '\u23FE';
  localStorage.setItem('cie_theme', val ? 'light' : 'dark');
}
function toggleInputMode(val) {
  inputMode = val;
  localStorage.setItem('cie_inputMode', val);
}

// ── INIT ─────────────────────────────────────────────────────
function init() {
  buildSnippets();
  // Initialise file system — restore full workspace if available
  const defaultContent = `// Welcome to CIE Pseudocode IDE
// Cambridge IGCSE / O Level Computer Science

DECLARE Name : STRING
DECLARE Score : INTEGER
DECLARE Grade : CHAR

INPUT Name
INPUT Score

IF Score >= 70 THEN
   Grade <- 'A'
ELSE
   IF Score >= 50 THEN
      Grade <- 'B'
   ELSE
      Grade <- 'F'
   ENDIF
ENDIF

OUTPUT "Student: ", Name
OUTPUT "Score: ", Score
OUTPUT "Grade: ", Grade`;

  let workspaceLoaded = false;
  try {
    const raw = localStorage.getItem('cie_workspace');
    if (raw) {
      const ws = JSON.parse(raw);
      if (Array.isArray(ws.files) && ws.files.length > 0) {
        files        = ws.files;
        activeFileId = ws.activeFileId || ws.files[0].id;
        nextFileId   = ws.nextFileId   || (Math.max(...ws.files.map(f => f.id)) + 1);
        workspaceLoaded = true;
      }
    }
  } catch (_) { /* corrupted storage — fall through to default */ }

  if (!workspaceLoaded) {
    // Fall back to legacy single-file key, then to hard-coded default
    const legacySaved = localStorage.getItem('cie_code');
    files        = [{ id: 1, name: 'main.txt', content: legacySaved || defaultContent }];
    activeFileId = 1;
    nextFileId   = 2;
  }
  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  codeInput.value = activeFile.content;
  renderTabs();
  updateEditor();

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); runCode(); }
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); manualSave(); }
    if (e.key === 'Escape') {
      document.getElementById('input-modal-overlay').classList.remove('visible');
      document.getElementById('case-fix-overlay').classList.remove('visible');
      hideContextMenu();
      hideMobileCodePopup();
    }
  });

  // ── Case-fix modal buttons ──────────────────────────────────
  document.getElementById('case-fix-yes').addEventListener('click', () => {
    document.getElementById('case-fix-overlay').classList.remove('visible');
    codeInput.value = fixLowercaseKeywords(codeInput.value);
    updateEditor();
    _doRun();
  });
  document.getElementById('case-fix-no').addEventListener('click', () => {
    document.getElementById('case-fix-overlay').classList.remove('visible');
    _doRun();
  });

  // ── Mobile code popup buttons ──────────────────────────────────
  document.getElementById('mob-close-popup-btn').addEventListener('click', hideMobileCodePopup);
  document.getElementById('mobile-code-popup').addEventListener('click', e => {
    if (e.target === e.currentTarget) hideMobileCodePopup();
  });
  document.getElementById('mob-copy-code-btn').addEventListener('click', function () {
    const code = document.getElementById('mobile-code-popup-body').textContent;
    copyCodeToClipboard(code, this);
  });

  // ── Resizable right panel ─────────────────────────────────────
  (function () {
    const resizer    = document.getElementById('right-resizer');
    const rightPanel = document.getElementById('right-panel');
    if (!resizer || !rightPanel) return;

    let startX, startWidth;

    resizer.addEventListener('mousedown', e => {
      e.preventDefault();
      startX     = e.clientX;
      startWidth = rightPanel.offsetWidth;
      resizer.classList.add('dragging');
      document.body.style.cursor     = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMove = e => {
        // Dragging LEFT widens the panel; dragging RIGHT shrinks it
        const dx       = startX - e.clientX;
        const newWidth = Math.max(220, Math.min(700, startWidth + dx));
        rightPanel.style.width = newWidth + 'px';
      };

      const onUp = () => {
        resizer.classList.remove('dragging');
        document.body.style.cursor     = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  })();

  // ── Right panel collapse/expand ──
  (function() {
    const rightPanel = document.getElementById('right-panel');
    const resizer = document.getElementById('right-resizer');
    const openBtn = document.getElementById('btn-open-panel');
    const closeBtn = document.getElementById('btn-close-panel');
    if (!rightPanel || !openBtn || !closeBtn) return;
    function positionOpenBtn() {
      openBtn.style.display = rightPanel.classList.contains('rp-collapsed') ? 'block' : 'none';
    }
    closeBtn.addEventListener('click', () => {
      rightPanel.classList.add('rp-collapsed');
      resizer.classList.add('rp-collapsed');
      positionOpenBtn();
    });
    openBtn.addEventListener('click', () => {
      rightPanel.classList.remove('rp-collapsed');
      resizer.classList.remove('rp-collapsed');
      positionOpenBtn();
    });
    positionOpenBtn();
  })();

  // ── Theme button ────────────────────────────────────────────
  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  // ── Context menu actions ────────────────────────────────────
  document.getElementById('file-context-menu').addEventListener('click', e => {
    const item = e.target.closest('.ctx-menu-item');
    if (!item || item.dataset.action === undefined) return;
    if (_ctxMenuFileId === null) return;
    switch (item.dataset.action) {
      case 'rename': {
        const f = files.find(f => f.id === _ctxMenuFileId);
        if (!f) break;
        const sidebarList = document.getElementById('sidebar-file-list');
        if (sidebarList) {
          const rows = sidebarList.querySelectorAll('.snippet-item');
          rows.forEach((row, idx) => {
            if (files[idx] && files[idx].id === _ctxMenuFileId) {
              const nameSpan = row.querySelector('.sidebar-filename');
              if (nameSpan) startRenameInline(_ctxMenuFileId, nameSpan);
            }
          });
        }
        // Also try to find the tab name element
        const tabBar = document.getElementById('editor-tabs');
        if (tabBar) {
          const tabs = tabBar.querySelectorAll('.editor-tab');
          tabs.forEach(tab => {
            const nameSpan = tab.querySelector('span:not(.tab-dot)');
            if (nameSpan) {
              const tabIdx = [...tabs].indexOf(tab);
              if (tabIdx < files.length && files[tabIdx].id === _ctxMenuFileId) {
                startRenameInline(_ctxMenuFileId, nameSpan);
              }
            }
          });
        }
        break;
      }
      case 'duplicate': duplicateFile(_ctxMenuFileId); break;
      case 'delete':    deleteFile(_ctxMenuFileId);    break;
    }
    hideContextMenu();
  });

  // Dismiss context menu on outside click
  document.addEventListener('click', e => {
    const menu = document.getElementById('file-context-menu');
    if (menu && !menu.contains(e.target)) hideContextMenu();
  });

  // ── Restore theme from localStorage ──
  const savedTheme = localStorage.getItem('cie_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    if (themeBtn) themeBtn.textContent = '\u2600';
    const chk = document.getElementById('light-mode-toggle');
    if (chk) chk.checked = true;
  }

  // ── Restore input mode from localStorage ──
  const savedMode = localStorage.getItem('cie_inputMode');
  if (savedMode === 'popup' || savedMode === 'console') {
    inputMode = savedMode;
    const sel = document.getElementById('input-mode-select');
    if (sel) sel.value = savedMode;
  }
}

init();