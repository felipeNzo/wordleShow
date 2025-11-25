// useTxt = true  → carrega words.txt
// useTxt = false → carrega words.json

const useTxt = true; 

let words = [];
let secret = "";
let attempt = 0;
let position = 0;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");

// ---------------------------------------------
// FUNÇÃO QUE CARREGA words.txt OU words.json
// ---------------------------------------------
function loadWords() {
  const file = useTxt ? "words.txt" : "words.json";

  fetch(file)
    .then(res => useTxt ? res.text() : res.json())
    .then(data => {
      if (useTxt) {
        // TXT → transforma em array de palavras
        words = data
          .split("\n")
          .map(w => w.trim().toUpperCase())
          .filter(w => w.length === 5);
      } else {
        // JSON → assume que já é um array
        words = data.map(w => w.toUpperCase());
      }

      secret = words[Math.floor(Math.random() * words.length)];
      console.log("Palavra secreta:", secret);

      startGame();
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao carregar " + file);
    });
}

loadWords();


// ---------------------------------------------
// FUNÇÃO QUE VERIFICA SE A PALAVRA EXISTE
// ---------------------------------------------
function wordExists(word) {
  return words.includes(word.toUpperCase());
}


// ---------------------------------------------
// INÍCIO DO JOGO
// ---------------------------------------------
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

function createKeyboard() {
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

  document.addEventListener("keydown", e => handleInput(e.key));
}



// ---------------------------------------------
// MANIPULAÇÃO DE TECLAS
// ---------------------------------------------
function handleInput(key) {
  const rows = document.querySelectorAll(".row");
  const tiles = rows[attempt].querySelectorAll(".tile");

  if (/^[a-zA-Z]$/.test(key) && position < 5) {
    tiles[position].textContent = key.toUpperCase();
    position++;
  }

  if (key === "Backspace" && position > 0) {
    position--;
    tiles[position].textContent = "";
  }

  if (key === "Enter" && position === 5) {
    const guess = Array.from(tiles).map(t => t.textContent).join("");

    // ---------------------------------------------
    // VALIDAÇÃO DA PALAVRA NO BANCO
    // ---------------------------------------------
    if (!wordExists(guess)) {
      alert("Essa palavra não tem!");
      return; // impede continuar
    }

    checkGuess(guess, tiles);
    updateKeyboard(guess);

    if (guess === secret) {
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



// ---------------------------------------------
// VERIFICA LETRAS (CORRETA, PRESENTE, AUSENTE)
// ---------------------------------------------
function checkGuess(guess, tiles) {
  const secretArray = secret.split("");

  for (let i = 0; i < 5; i++) {
    if (guess[i] === secret[i]) {
      tiles[i].classList.add("correct");
      secretArray[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (!tiles[i].classList.contains("correct")) {
      if (secretArray.includes(guess[i])) {
        tiles[i].classList.add("present");
        secretArray[secretArray.indexOf(guess[i])] = null;
      } else {
        tiles[i].classList.add("absent");
      }
    }
  }
}



// ---------------------------------------------
// ATUALIZA O TECLADO VIRTUAL
// ---------------------------------------------
function updateKeyboard(guess) {
  for (let i = 0; i < 5; i++) {
    const key = [...document.querySelectorAll(".key")]
      .find(k => k.textContent === guess[i]);

    if (!key) continue;

    if (guess[i] === secret[i]) {
      key.classList.add("correct");
    } else if (secret.includes(guess[i])) {
      if (!key.classList.contains("correct"))
        key.classList.add("present");
    } else {
      key.classList.add("absent");
    }
  }
}
