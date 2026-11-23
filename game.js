const canvas= document.getElementById("gameCanvas");
const ctx= canvas.getContext("2d");

const floorY= 360;

let ballX= 100;
let ballY= 100;
const ballRadius= 20;
let velocityY= 0;
const gravity= 0.5;
const left=document.getElementById("left");
const right=document.getElementById("right");
const jump=document.getElementById("jump");

const movespeed= 5;
const jumpstrenght= -12;

let moveleft=false;
let moveright=false;
let isOnGround=false;

left.addEventListener("pointerdown",()=>{moveleft=true;})
left.addEventListener("pointerup",()=>{moveleft=false});
left.addEventListener("pointerleave",()=>{moveleft=false});
left.addEventListener("pointercancel",()=>{moveleft=false});

right.addEventListener("pointerdown",()=>{moveright=true});
right.addEventListener("pointerup",()=>{moveright=false});
right.addEventListener("pointerleave",()=>{moveright=false});
right.addEventListener("pointercancel",()=>{moveright=false});

function tryjump(){
  if (isOnGround){
    velocityY=jumpstrenght;
    isOnGround=false;
  }
}
jump.addEventListener("pointerdown",tryjump);

window.addEventListener("keydown",(e)=>{
  if (e.code==="ArrowLeft") moveleft=true;
  if (e.code==="ArrowRight") moveright=true;
  if (e.code==="Space" || e.code==="ArrowUp") tryjump();
});
window.addEventListener("keyup",(e)=>{
  if (e.code==="ArrowLeft") moveleft=false;
  if (e.code==="ArrowRight") moveright=false;
});

function update(){
  if (moveleft) {
    ballX -=movespeed;
  }
  if (moveright){
    ballX+=movespeed;
  }
  if (ballX-ballRadius<0){
    ballX=ballRadius;
  }
  if (ballX+ballRadius>canvas.width){
    ballX=canvas.width-ballRadius;
  }
  velocityY += gravity;
  ballY += velocityY;

  if (ballY+ballRadius > floorY){
    ballY =floorY-ballRadius;
    velocityY= 0;
    isOnGround=true;
  }
}

function draw (){
  ctx.fillStyle= "#444";
  ctx.fillRect(0,floorY,canvas.width,canvas.height-floorY);

  ctx.beginPath();
  ctx.arc(ballX,ballY,ballRadius,0,Math.PI*2);
  ctx.fillStyle="deepskyblue";
  ctx.fill();
  ctx.closePath();
}

function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();



