// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
let words = [];
let wordsNoAccent = [];
let usedWords = [];

let secret = "";
let secretNoAccent = "";

let attempt = 0;
let position = 0;
let gameOver = false;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const restartBtn = document.getElementById("restart");

const losePopup = document.getElementById("lose-popup");
const loseWordText = document.getElementById("lose-word");
const popupRestartBtn = document.getElementById("popup-restart");


// ===============================
// REMOVE ACENTOS
// ===============================
const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ===============================
// CARREGA PALAVRAS
// ===============================
function loadWords() {
  fetch("words.json")
    .then((res) => res.json())
    .then((data) => {
      words = data.map(w => w.trim().toUpperCase());
      wordsNoAccent = words.map(w => removeAccents(w));

      resetSecret();
      startGame();
    })
    .catch(() => alert("Erro ao carregar words.json"));
}

loadWords();

// ===============================
// EXISTÊNCIA DA PALAVRA
// ===============================
function wordExists(word) {
  return wordsNoAccent.includes(removeAccents(word));
}

// ===============================
// INÍCIO
// ===============================
function startGame() {
  createBoard();
  createKeyboard();
}

// ===============================
// TABULEIRO
// ===============================
function createBoard() {
  board.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "row";

    for (let j = 0; j < 5; j++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
    }

    board.appendChild(row);
  }
}

const keys = [..."QWERTYUIOP", ..."ASDFGHJKL", ..."ZXCVBNM"];

// ===============================
// TECLADO VIRTUAL
// ===============================
function createKeyboard() {
  keyboard.innerHTML = "";

  keys.forEach(letter => {
    const k = document.createElement("div");
    k.className = "key";
    k.textContent = letter;
    k.onclick = () => handleInput(letter);
    keyboard.appendChild(k);
  });

  const enter = document.createElement("div");
  enter.className = "key special";
  enter.textContent = "ENTER";
  enter.onclick = () => handleInput("Enter");
  keyboard.appendChild(enter);

  const back = document.createElement("div");
  back.className = "key special";
  back.textContent = "←";
  back.onclick = () => handleInput("Backspace");
  keyboard.appendChild(back);
}

// ===============================
// TECLADO FÍSICO
// ===============================
document.addEventListener("keydown", (e) => {
  if (gameOver) return;

  if (e.key.length === 1) {
    const k = removeAccents(e.key).toUpperCase();
    if (/^[A-Z]$/.test(k)) {
      handleInput(k);
      return;
    }
  }

  handleInput(e.key);
});

// ===============================
// INPUT
// ===============================
function handleInput(key) {
  if (gameOver) return;

  const rows = document.querySelectorAll(".row");
  const tiles = rows[attempt].querySelectorAll(".tile");

  if (/^[A-Z]$/.test(key) && position < 5) {
    tiles[position].textContent = key;
    position++;
    return;
  }

  if (key === "Backspace" && position > 0) {
    position--;
    tiles[position].textContent = "";
    return;
  }

  if (key === "Enter" && position === 5) {
    const guess = [...tiles].map(t => t.textContent).join("");
    const guessNoAcc = removeAccents(guess);

    // Palavra inexistente
    if (!wordExists(guess)) {
      animateInvalidWord(rows[attempt]);
      return;
    }

    // Palavra repetida
    if (usedWords.includes(guessNoAcc)) {
      animateInvalidWord(rows[attempt]);
      return;
    }

    usedWords.push(guessNoAcc);

    checkGuess(guess, tiles);
    updateKeyboard(guess);

    // Vitória
    if (guessNoAcc === secretNoAccent) {
      animateWin(tiles);
      gameOver = true;
      showRestartButton();
      return;
    }

    attempt++;
    position = 0;

    if (attempt === 6) {
      gameOver = true;
      showLosePopup();
    }
  }
}

// ===============================
// VERIFICA LETRAS
// ===============================
function checkGuess(guess, tiles) {
  const guessNoAcc = removeAccents(guess);
  let secretArr = secretNoAccent.split("");

  // Letras corretas
  for (let i = 0; i < 5; i++) {
    if (guessNoAcc[i] === secretArr[i]) {
      tiles[i].classList.add("correct");
      secretArr[i] = null;
    }
  }

  // Letras presentes / ausentes
  for (let i = 0; i < 5; i++) {
    if (!tiles[i].classList.contains("correct")) {
      const idx = secretArr.indexOf(guessNoAcc[i]);
      if (idx !== -1) {
        tiles[i].classList.add("present");
        secretArr[idx] = null;
      } else {
        tiles[i].classList.add("absent");
      }
    }
  }
}

// ===============================
// TECLADO CORES
// ===============================
function updateKeyboard(guess) {
  const guessNoAcc = removeAccents(guess);

  for (let i = 0; i < 5; i++) {
    const letter = guessNoAcc[i];
    const key = [...document.querySelectorAll(".key")]
      .find(k => k.textContent === letter);

    if (!key || key.classList.contains("correct")) continue;

    if (letter === secretNoAccent[i]) {
      key.classList.remove("present", "absent");
      key.classList.add("correct");
    } else if (secretNoAccent.includes(letter)) {
      key.classList.add("present");
    } else {
      key.classList.add("absent");
    }
  }
}

// ===============================
// ANIMAÇÃO DE ERRO
// ===============================
function animateInvalidWord(row) {
  row.classList.add("invalid");
  setTimeout(() => row.classList.remove("invalid"), 600);
}

// ===============================
// ANIMAÇÃO DE VITÓRIA
// ===============================
function animateWin(tiles) {
  tiles.forEach((tile, i) => {
    setTimeout(() => tile.classList.add("win"), i * 100);
  });
}

// ===============================
// REINICIAR
// ===============================
restartBtn.onclick = resetGame;

function showRestartButton() {
  restartBtn.style.display = "block";
}

function resetSecret() {
  const index = Math.floor(Math.random() * words.length);
  secret = words[index];
  secretNoAccent = wordsNoAccent[index];
  console.log("Palavra secreta:", secret);
}

function showLosePopup() {
  loseWordText.textContent = secret;
  losePopup.classList.remove("hidden");
}

popupRestartBtn.onclick = () => {
  losePopup.classList.add("hidden");
  resetGame();
};


function resetGame() {
  attempt = 0;
  position = 0;
  gameOver = false;
  usedWords = [];

  board.innerHTML = "";
  keyboard.innerHTML = "";

  resetSecret();
  restartBtn.style.display = "none";
  losePopup.classList.add("hidden");

  startGame();
}

