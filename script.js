  //  VARIÁVEIS GLOBAIS

let words = [];
let wordsNoAccent = [];

let secret = "";
let secretNoAccent = "";

let attempt = 0;
let position = 0;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");

  //  FUNÇÃO PARA REMOVER ACENTOS

const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function loadWords() {
  fetch("words.json")
    .then((res) => res.json())
    .then((data) => {
      words = data.map((w) => w.trim().toUpperCase());
      wordsNoAccent = words.map((w) => removeAccents(w));

      const index = Math.floor(Math.random() * words.length);
      secret = words[index];
      secretNoAccent = wordsNoAccent[index];

      console.log("Palavra secreta:", secret);

      startGame();
    })
    .catch(() => alert("Erro ao carregar words.json"));
}

loadWords();

  //  VERIFICA SE A PALAVRA EXISTE

function wordExists(word) {
  const wordNoAcc = removeAccents(word).toUpperCase();
  return wordsNoAccent.includes(wordNoAcc);
}

  //  INÍCIO DO JOGO

function startGame() {
  createBoard();
  createKeyboard();
}

function createBoard() {
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

  //  TECLADO VIRTUAL + FÍSICO

function createKeyboard() {
  keys.forEach((letter) => {
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

    //  TECLADO FÍSICO – ACEITA ACENTO
  document.addEventListener("keydown", (e) => {
    let key = e.key;

    // Se for letra (inclusive acentuada), converter
    if (key.length === 1) {
      const converted = removeAccents(key).toUpperCase();
      if (/^[A-Z]$/.test(converted)) {
        handleInput(converted);
        return;
      }
    }

    handleInput(e.key);
  });
}

  //  MANIPULAÇÃO DAS TECLAS

function handleInput(key) {
  const rows = document.querySelectorAll(".row");
  const tiles = rows[attempt].querySelectorAll(".tile");

  if (/^[A-Z]$/.test(key) && position < 5) {
    tiles[position].textContent = key.toUpperCase();
    position++;
  }

  if (key === "Backspace" && position > 0) {
    position--;
    tiles[position].textContent = "";
  }

  if (key === "Enter" && position === 5) {
    const guess = Array.from(tiles).map((t) => t.textContent).join("");

    // Verifica existência no banco
    if (!wordExists(guess)) {
      alert("Essa palavra não tem!");
      return;
    }

    checkGuess(guess, tiles);
    updateKeyboard(guess);

    if (removeAccents(guess) === secretNoAccent) {
      alert("Você acertou!");
      return;
    }

    attempt++;
    position = 0;

    if (attempt === 6) {
      alert("Fim do jogo! A palavra era: " + secret);
    }
  }
}

  //  VERIFICA LETRAS (CORRETA / PRESENTE / AUSENTE)

function checkGuess(guess, tiles) {
  const guessNoAcc = removeAccents(guess);
  const secretArr = secretNoAccent.split("");

  // Letras corretas
  for (let i = 0; i < 5; i++) {
    if (guessNoAcc[i] === secretNoAccent[i]) {
      tiles[i].classList.add("correct");
      secretArr[i] = null;
    }
  }

  // Letras presentes em posição errada
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

  //  ATUALIZA O TECLADO

function updateKeyboard(guess) {
  const guessNoAcc = removeAccents(guess);

  for (let i = 0; i < 5; i++) {
    const letter = guessNoAcc[i];
    const key = [...document.querySelectorAll(".key")].find(
      (k) => k.textContent === letter
    );

    if (!key) continue;

    if (letter === secretNoAccent[i]) {
      key.classList.add("correct");
    } else if (secretNoAccent.includes(letter)) {
      if (!key.classList.contains("correct")) key.classList.add("present");
    } else {
      key.classList.add("absent");
    }
  }
}
