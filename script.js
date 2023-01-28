import { WORDS } from "./words.js";

const GUESS_COUNT = 6;
let pendingGuess = GUESS_COUNT;
let currentGuess = [];
let nextLetter = 0;
let correctGuess;
//  = WORDS[Math.floor(Math.random() * WORDS.length)];

function init() {
  if (localStorage.getItem("HighScore") == null) {
    localStorage.setItem("HighScore", 0);
  }

  fetch("http://localhost/getWord").then((response) => {
    return response.text();
  }).then((body) => {
    correctGuess = body;
    console.log("at front:", body);
  })

  let board = document.getElementById("game-board");

  for (let i = 0; i < GUESS_COUNT; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;
      if (oldColor === "green") {
        return;
      }

      if (oldColor === "yellow" && color !== "green") {
        return;
      }

      elem.style.backgroundColor = color;
      break;
    }
  }
}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[6 - pendingGuess];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[6 - pendingGuess];
  let guessString = "";
  let rightGuess = (correctGuess) ? Array.from(correctGuess) : null;

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != 5) {
    toastr.error("Not enough letters!");
    return;
  }

  var letterColor = ["gray", "gray", "gray", "gray", "gray"];

  //check green
  for (let i = 0; i < 5; i++) {
    if (rightGuess[i] == currentGuess[i]) {
      letterColor[i] = "green";
      rightGuess[i] = "#";
    }
  }

  //check yellow
  //check guess letters
  for (let i = 0; i < 5; i++) {
    if (letterColor[i] == "green") continue;

    //check right letters
    for (let j = 0; j < 5; j++) {
      if (rightGuess[j] == currentGuess[i]) {
        letterColor[i] = "yellow";
        rightGuess[j] = "#";
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    let box = row.children[i];
    let delay = 250 * i;
    setTimeout(() => {
      //flip
      animateCSS(box, "flipInX");
      //shade
      box.style.backgroundColor = letterColor[i];
      shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
    }, delay);
  }

  if (guessString === correctGuess) {
    toastr.success("You guessed right! Game over!");
    toastr.info(`Your Score was: "${pendingGuess}"`);
    if (localStorage.getItem("HighScore") < pendingGuess) {
      localStorage.setItem("HighScore", pendingGuess);
      toastr.info(`Your High Score was saved`);
    }
    pendingGuess = 0;
    return;
  } else {
    pendingGuess -= 1;
    currentGuess = [];
    nextLetter = 0;

    //use pendingGuess and do saving highscore logic
    if (pendingGuess === 0) {
      toastr.error("You've run out of guesses! Game over!");
      toastr.info(`The right word was: "${correctGuess}"`);
      toastr.info(`Your Score was: "${pendingGuess}"`);
      
    }
  }
}

function insertLetter(pressedKey) {
  if (nextLetter === 5) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[6 - pendingGuess];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

const animateCSS = (element, animation, prefix = "animate__") =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");
    node.classList.add(`${prefix}animated`, animationName);
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

document.addEventListener("keyup", (e) => {
  if (pendingGuess === 0) {
    return;
  }

  let pressedKey = String(e.key);
  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  let found = pressedKey.match(/[a-z]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey);
  }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  if (key === "Restart") {
    location.reload();

  }
  if (key === "Check") {
    checkGuess();
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

init();
