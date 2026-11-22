const canvas= document.getElementById("gameCanva");
const ctx= canvas.getContext("2d");

const floorY= 360;

let ballX= 100;
let ballY= 100;
const ballRadius= 20;
let velocityY= 0;
const gravity= 0.5;


function update(){
  velocityY += gravity;
  ballY += velocityY;

  if (ballY+ballRadius > floorY){
    ballY =floorY-ballRadius;
    velocityY= 0;
  }
}

function draw (){
  ctx.fillstyle= "#444";
  ctx.fillRect(0,floorY,canvas.width,canva.height-floorY);

  ctx.beginPath();
  ctx.arc(ballX,ballY,ballRadius,0,Math.Pi*2);
ctx.fillstyle="deepskyblue";
  ctx.fill();
  ctx.closrPath();
}

function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();



