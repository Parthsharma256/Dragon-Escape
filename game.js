const canvas= document.getElementById("gameCanvas");
const ctx= canvas.getContext("2d");

const floorY= 360;
const ceilingY=60;
const cavelength=5000;
let gamephase="chase";
let cameraX=0;
const bossArenaStart=cavelength-canvas.width;

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
  const minX=gamephase==="boss" ? bossArenaStart+ballRadius : ballRadius;
  if (ballX<minX){
    ballX=minX;
  }
  if (ballX+ballRadius>cavelength){
    ballX=cavelength-ballRadius;
  }
  if (gamephase==="chase"){
    cameraX=ballX-250;
    if (cameraX<0) cameraX=0;
    if (cameraX>=bossArenaStart){
      cameraX=bossArenaStart;
      gamephase="boss";
    }
  }
  velocityY += gravity;
  ballY += velocityY;

  if (ballY+ballRadius > floorY){
    ballY =floorY-ballRadius;
    velocityY= 0;
    isOnGround=true;
  }
  if (ballY-ballRadius<ceilingY){
    ballY=ceilingY+ballRadius;
    velocityY=0;
  }
}

function draw (){
  ctx.fillStyle="#161925";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#23283d";
  const pillarStart=-(camera%180);
  for (let x=pillarStart;x<canvas.width; x+=180){
    ctx.fillRect(x,ceilingY,45,floorY-ceilingY);
  }

  
  //ceiling
  ctx.fillStyle= "#4e3b31";
  ctx.fillRect(0,canvas.width,ceilingY);
  //floor
  ctx.fillStyle="#4e3b31";
  filoRect(0,floorY,canvas.width,canvas.height-floorY);
  //stones
const tilestart=-(cameraX%80);
 ctx.fillStyle="#8a6a55";
  for (let x=tilestart;x<canvas.width;x+=80)
    ctx.fillRect(x,floorY,50,10);
  //ball 
  const screenBallX=ballX-cameraX;
  ctx.beginPath();
  ctx.arc(screenBallX,ballY,ballRadius,0,Math.PI*2);
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
