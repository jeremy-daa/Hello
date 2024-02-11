const scoreboard = document.getElementById("scoreboard");
const scoreElement = document.getElementById("score");
const instructions = document.getElementById("instruction");
const closeButton = document.getElementById("close-button");
const gameError = document.getElementById("error");
const startButton = document.getElementById("start");
const gameTime = document.getElementById("game-time");
const gameScore = document.getElementById("game-score");
const gameHighscore = document.getElementById("game-highscore");
let onGame = false;
let mousePosition = { x: -10, y: -10 };
let quadrant = -1;
let score = 0;
let holePosition = -1;

startButton.addEventListener("click", () => {
  startGame();
  console.log("game started");
});
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

ctx.fillStyle = "rgba(0,0,0,255)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const height = canvas.height;
const width = canvas.width;
draw2x3Grid("white");

function drawLine(x1, y1, x2, y2, color) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  const xInc = dx / steps;
  const yInc = dy / steps;

  let x = x1;
  let y = y1;

  for (let i = 0; i <= steps; i++) {
    ctx.fillStyle = color || "yellow";
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    x += xInc;
    y += yInc;
  }
}
function rotate(x, y, angle) {
  const newX = x * Math.cos(angle) - y * Math.sin(angle);
  const newY = x * Math.sin(angle) + y * Math.cos(angle);
  return { x: newX, y: newY };
}

function floodFill(x, y, newColor, targetColor) {
  const stack = [];
  const initialColor = ctx.getImageData(x, y, 1, 1).data;

  if (
    initialColor[0] === newColor[0] &&
    initialColor[1] === newColor[1] &&
    initialColor[2] === newColor[2]
  ) {
    return;
  }

  stack.push({ x, y });

  while (stack.length) {
    const { x, y } = stack.pop();
    const pixel = ctx.getImageData(x, y, 1, 1).data;

    if (
      x >= 0 &&
      y >= 0 &&
      x < canvas.width &&
      y < canvas.height &&
      pixel[0] === targetColor[0] &&
      pixel[1] === targetColor[1] &&
      pixel[2] === targetColor[2] &&
      pixel[3] === targetColor[3]
    ) {
      ctx.fillStyle = newColor;
      ctx.fillRect(x, y, 1, 1);

      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
  }
}

function drawRectangle(x1, y1, x2, y2, color) {
  drawLine(x1, y1, x2, y1, color);
  drawLine(x2, y1, x2, y2, color);
  drawLine(x2, y2, x1, y2, color);
  drawLine(x1, y2, x1, y1, color);
  floodFill(x1 + 2, y1 + 2, color, [0, 0, 0, 255]);
}

function drawFilledRectangle(x1, y1, x2, y2, color) {
  drawLine(x1, y1, x2, y1, color);
  drawLine(x2, y1, x2, y2, color);
  drawLine(x2, y2, x1, y2, color);
  drawLine(x1, y2, x1, y1, color);
  floodFill(x1 + 2, y1 + 2, color, [196, 118, 56, 255]);
}
function drawRect(x1, y1, x2, y2, color, fillColor) {
  drawLine(x1, y1, x2, y1, color);
  drawLine(x2, y1, x2, y2, color);
  drawLine(x2, y2, x1, y2, color);
  drawLine(x1, y2, x1, y1, color);
  floodFill(x1 + 1, y1 + 1, color, fillColor);
}
function drawRotatedRectangle(x1, y1, x2, y2, color, fillColor, angle) {
  var centerX = (x1 + x2) / 2;
  var centerY = (y1 + y2) / 2;

  var rotatedX1 =
    centerX +
    (x1 - centerX) * Math.cos(angle) -
    (y1 - centerY) * Math.sin(angle);
  var rotatedY1 =
    centerY +
    (x1 - centerX) * Math.sin(angle) +
    (y1 - centerY) * Math.cos(angle);

  var rotatedX2 =
    centerX +
    (x2 - centerX) * Math.cos(angle) -
    (y1 - centerY) * Math.sin(angle);
  var rotatedY2 =
    centerY +
    (x2 - centerX) * Math.sin(angle) +
    (y1 - centerY) * Math.cos(angle);

  var rotatedX3 =
    centerX +
    (x2 - centerX) * Math.cos(angle) -
    (y2 - centerY) * Math.sin(angle);
  var rotatedY3 =
    centerY +
    (x2 - centerX) * Math.sin(angle) +
    (y2 - centerY) * Math.cos(angle);

  var rotatedX4 =
    centerX +
    (x1 - centerX) * Math.cos(angle) -
    (y2 - centerY) * Math.sin(angle);
  var rotatedY4 =
    centerY +
    (x1 - centerX) * Math.sin(angle) +
    (y2 - centerY) * Math.cos(angle);

  drawLine(rotatedX1, rotatedY1, rotatedX2, rotatedY2, color);
  drawLine(rotatedX2, rotatedY2, rotatedX3, rotatedY3, color);
  drawLine(rotatedX3, rotatedY3, rotatedX4, rotatedY4, color);
  drawLine(rotatedX4, rotatedY4, rotatedX1, rotatedY1, color);
}

function drawTriangle(x1, y1, x2, y2, x3, y3, color, t) {
  drawLine(x1, y1, x2, y2, color);
  drawLine(x2, y2, x3, y3, color);
  drawLine(x3, y3, x1, y1, color);
  if (t) {
    floodFill(x3 - 1, y3 - 1, color, [196, 118, 56, 255]);
  } else {
    floodFill(x3 + 1, y3 - 1, color, [196, 118, 56, 255]);
  }
}
function drawCircle(x0, y0, radius, color) {
  let x = radius;
  let y = 0;
  let decisionOver2 = 1 - x;

  while (y <= x) {
    drawLine(x + x0, y + y0, -x + x0, y + y0, color);
    drawLine(y + x0, x + y0, -y + x0, x + y0, color);
    drawLine(-x + x0, -y + y0, x + x0, -y + y0, color);
    drawLine(-y + x0, -x + y0, y + x0, -x + y0, color);
    y++;
    if (decisionOver2 <= 0) {
      decisionOver2 += 2 * y + 1;
    } else {
      x--;
      decisionOver2 += 2 * (y - x) + 1;
    }
  }
}
function drawHole(x, y, radiusX, radiusY, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function draw2x3Grid(color) {
  drawLine(0, 0, width, 0, color);
  drawLine(0, height / 2, width, height / 2, color);
  drawLine(0, height, width, height, color);
  drawLine(0, 0, 0, height, color);
  drawLine(width / 3, 0, width / 3, height, color);
  drawLine((width / 3) * 2, 0, (width / 3) * 2, height, color);
  drawLine(width - 1, 0, width - 1, height, color);
  drawLine(0, height - 1, width - 1, height - 1, color);
}
function drawMole(x, y) {
  drawRectangle(x, y, x + 80, y + 80, "rgb(196,118,56)");
  drawCircle(x, y, 20, "rgb(196,118,56)");
  drawCircle(x - 1.5, y - 1.5, 10, "black");
  drawCircle(x + 80, y, 20, "rgb(196,118,56)");
  drawCircle(x + 81, y - 1.5, 10, "black");
  drawTriangle(x, y + 50, x + 25, y + 80, x, y + 80, "black");
  drawTriangle(x + 80, y + 50, x + 55, y + 80, x + 80, y + 80, "black", true);
  drawCircle(x + 40, y + 115, 60, "rgb(196,118,56)");
  drawCircle(x + 20, y + 30, 5, "black");
  drawCircle(x + 60, y + 30, 5, "black");
  drawCircle(x + 40, y + 50, 5, "black");
  drawFilledRectangle(x + 30, y + 65, x + 50, y + 70, "black");
  drawRect(x + 32, y + 72, x + 35, y + 79, "silver", [196, 118, 56, 255]);
  drawRect(x + 38, y + 72, x + 42, y + 79, "silver", [196, 118, 56, 255]);
  drawRect(x + 45, y + 72, x + 48, y + 79, "silver", [196, 118, 56, 255]);
  drawRotatedRectangle(
    x + 5,
    y + 90,
    x + 25,
    y + 150,
    "black",
    [196, 118, 56, 255],
    -Math.PI / 9
  );
  floodFill(x + 8, y + 95, "black", [196, 118, 56, 255]);

  drawRotatedRectangle(
    x + 55,
    y + 90,
    x + 75,
    y + 150,
    "black",
    [196, 118, 56, 255],
    Math.PI / 9
  );
  floodFill(x + 79, y + 96, "black", [196, 118, 56, 255]);
}
function animateMole(x, y) {
  let backwards = false;
  for (let i = 0; ; ) {
    if (i > 3) {
      backwards = true;
    }
    if (i < 0 && backwards) {
      break;
    }
    if (backwards) {
      i--;
    } else {
      i++;
    }
    setTimeout(() => {
      resetBoard();
      drawHole(x, y, 100, 50, color);
      drawMole(x - 40, y - 140 + i * 2);
    }, 10 * i * 0.5);
  }
}

function drawFirstMoleandHole() {
  animateMole(width / 3 / 2, height / 2 / 2 + 50);
}

function drawSecondMoleandHole() {
  drawHole((width / 3 / 2) * 3, height / 2 / 2 + 50, 100, 50, colorHole);
  drawMole((width / 3 / 2) * 3 - 40, height / 2 / 2 + 50 - 140);
  animateMole((width / 3 / 2) * 3, height / 2 / 2 + 50);
}

function drawThirdMoleandHole() {
  drawHole((width / 3 / 2) * 5, height / 2 / 2 + 50, 100, 50, colorHole);
  drawMole((width / 3 / 2) * 5 - 40, height / 2 / 2 + 50 - 140);
  animateMole((width / 3 / 2) * 5, height / 2 / 2 + 50);
}

function drawFourthMoleandHole() {
  drawHole(width / 3 / 2, (height / 2 / 2) * 3 + 50, 100, 50, colorHole);
  drawMole(width / 3 / 2 - 40, (height / 2 / 2) * 3 + 50 - 140);
  animateMole(width / 3 / 2, (height / 2 / 2) * 3 + 50);
}

function drawFifthMoleandHole() {
  drawHole((width / 3 / 2) * 3, (height / 2 / 2) * 3 + 50, 100, 50, colorHole);
  drawMole((width / 3 / 2) * 3 - 40, (height / 2 / 2) * 3 + 50 - 140);
  animateMole((width / 3 / 2) * 3, (height / 2 / 2) * 3 + 50);
}

function drawSixthMoleandHole() {
  drawHole((width / 3 / 2) * 5, (height / 2 / 2) * 3 + 50, 100, 50, colorHole);
  drawMole((width / 3 / 2) * 5 - 40, (height / 2 / 2) * 3 + 50 - 140);
  animateMole((width / 3 / 2) * 5, (height / 2 / 2) * 3 + 50);
}

function drawMoleandHole(random) {
  switch (random) {
    case 0:
      drawFirstMoleandHole();
      break;
    case 1:
      drawSecondMoleandHole();
      break;
    case 2:
      drawThirdMoleandHole();
      break;
    case 3:
      drawFourthMoleandHole();
      break;
    case 4:
      drawFifthMoleandHole();
      break;
    case 5:
      drawSixthMoleandHole();
      break;
  }
}
let color = "green";
function resetBoard() {
  ctx.fillStyle = "rgba(0,0,0,255)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  draw2x3Grid(color);

  colorHole = "gray";
  drawHole(width / 3 / 2, height / 2 / 2 + 50, 100, 50, colorHole);
  drawHole((width / 3 / 2) * 3, height / 2 / 2 + 50, 100, 50, colorHole);
  drawHole((width / 3 / 2) * 5, height / 2 / 2 + 50, 100, 50, colorHole);
  drawHole(width / 3 / 2, (height / 2 / 2) * 3 + 50, 100, 50, colorHole);
  drawHole((width / 3 / 2) * 3, (height / 2 / 2) * 3 + 50, 100, 50, colorHole);
  drawHole((width / 3 / 2) * 5, (height / 2 / 2) * 3 + 50, 100, 50, colorHole);
}
function setCookie(name, value, daysToExpire) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysToExpire);

  const cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
  document.cookie = cookie;
}
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}
const randomNum = (quadrantExcluded) => {
  let random = Math.floor(Math.random() * 6);
  if (random === quadrantExcluded) {
    randomNum(quadrantExcluded);
  } else {
    return random;
  }
};
let highscore = getCookie("highscore");
document.getElementById("game-highscore").innerHTML = highscore;
const eachQuadrant = (x, y) => {
  if (x >= 0 && x <= width / 3 && y >= 0 && y <= height / 2) {
    return 0;
  } else if (
    x >= width / 3 &&
    x <= (width / 3) * 2 &&
    y >= 0 &&
    y <= height / 2
  ) {
    return 1;
  } else if (x >= (width / 3) * 2 && x <= width && y >= 0 && y <= height / 2) {
    return 2;
  } else if (x >= 0 && x <= width / 3 && y >= height / 2 && y <= height) {
    return 3;
  } else if (
    x >= width / 3 &&
    x <= (width / 3) * 2 &&
    y >= height / 2 &&
    y <= height
  ) {
    return 4;
  } else if (
    x >= (width / 3) * 2 &&
    x <= width &&
    y >= height / 2 &&
    y <= height
  ) {
    return 5;
  }
};

const eachScore = 10;
canvas.addEventListener("click", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;
  mousePosition = { x, y };
  quadrant = eachQuadrant(x, y);
});
closeButton.addEventListener("click", () => {
  scoreboard.style.opacity = 0;
  score = 0;
  holePosition = -1;
  gameScore.innerHTML = score;
  setTimeout(() => {
    scoreboard.style.display = "none";
    score = 0;
    onGame = false;
    location.reload();
  }, 1000);
});
const startGame = () => {
  const timer = Number(document.getElementById("timer").value) * 10;
  const speed = Number(document.getElementById("speed").value);
  onGame = false;
  if (timer >= 0 && timer <= 60 && onGame === false) {
    onGame = true;
    resetBoard();
    for (let i = 1; i <= timer; i++) {
      if (onGame) {
        setTimeout(() => {
          gameTime.innerHTML = timer - i;
        }, 2000 * i * speed);
        setTimeout(() => {
          holePosition = randomNum(holePosition);
          console.log("Hole Position", holePosition);
          resetBoard();
          drawMoleandHole(holePosition);
          console.log("Loop", i);
          setTimeout(() => {
            if (color === "green") {
              color = "yellow";
            } else if (color === "yellow") {
              color = "red";
            } else if (color === "red") {
              color = "green";
            }
            if (quadrant === holePosition) {
              score += eachScore;
              gameScore.innerHTML = score;
            } else {
              gameScore.innerHTML = score;
            }
            if (i === timer) {
              resetBoard();
            }
          }, 1000);
        }, 2000 * i * speed);

        setTimeout(() => {
          resetBoard();
          onGame = false;
          console.log("Score", score);
          scoreboard.style.display = "block";
          scoreElement.innerHTML = score;
          highscore = Number(getCookie("highscore"));

          if (highscore === null) {
            setCookie("highscore", score, 365);
            gameHighscore.innerHTML = score;
          } else if (score > highscore) {
            gameHighscore.innerHTML = score;
            setCookie("highscore", score, 365);
          }
        }, 2000 * timer * speed + 2000);
      }
    }
  }
};
