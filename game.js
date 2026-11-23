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
let isgameover=false;
let spikes=[];
let rocks=[];
let rocktimer=0;
function createspike (){
  spikes=[];
  let x=550;
  while (x<bossArenaStart-200){
    spikes.push({x:x,width:34,height:28});
    x+=260+Math.random()*180;
  }
}
function resetgame() {
  ballX=100;
  ballY=100;
  velocityY=0;
  velocityX=0;
  cameraX=0;
  gamephase="chase";
  isgameover=false;
  rocks=[];
  rocktime=0
  createspike ();
}
createspike();

left.addEventListener("pointerdown",()=>{moveleft=true;})
left.addEventListener("pointerup",()=>{moveleft=false});
left.addEventListener("pointerleave",()=>{moveleft=false});
left.addEventListener("pointercancel",()=>{moveleft=false});

right.addEventListener("pointerdown",()=>{moveright=true});
right.addEventListener("pointerup",()=>{moveright=false});
right.addEventListener("pointerleave",()=>{moveright=false});
right.addEventListener("pointercancel",()=>{moveright=false});

function tryjump(){
  if (isgameover){
    resetgame();
    return;
  }
  if (isOnGround){
    velocityY=jumpstrenght;
    isOnGround=false;
  }
}
jump.addEventListener("pointerdown",tryjump);
canvas.addEventListener("pointerdown",()=>{
  if (isgameover)resetgame();
});
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
  if (isgameover) return;
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
  for (let i=0; i<spikes.length; i++){
    const s=spikes[i];
    if(
      ballX+ballRadius-6>s.x &&
      ballX-ballRadius+6<s.x+s.width &&
      ballY+ballRadius>floorY-heighr+6)
    {isgameover=true;
    } 
  }
  if (gamephase==="chase"){
    rocktimer++;
    if(rocktimer>=90){
      rocktimer=0;
      rocks.push({
        x:ballX+180+Math.random()*280,
        y:ceilingY,
        radius:14,
        speedY:3.5
      });
    }
  }
  for (let i=rocks.length-1;i>=0;i--){
    const r=rocks[i];
    r.y+=r.speedY;
    const dist = Math.hypot(ballX-r.x,ballY-r.y);
    if(dist<ballRadius+r.radius-4){
      isgameover=true;
    }
    if (r.y-r.radius>floorY) {
      rocks.splice(i,1);
    }
  }
}

function draw (){
  ctx.fillStyle="#161925";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#23283d";
  const pillarStart=-(cameraX%180);
  for (let x=pillarStart;x<canvas.width; x+=180){
    ctx.fillRect(x,ceilingY,45,floorY-ceilingY);
  }

  
  //ceiling
  ctx.fillStyle= "#4e3b31";
  ctx.fillRect(0,0,canvas.width,ceilingY);
  //floor
  ctx.fillStyle="#4e3b31";
  ctx.fillRect(0,floorY,canvas.width,canvas.height-floorY);
  //tile
const tilestart=-(cameraX%80);
 ctx.fillStyle="#8a6a55";
  for (let x=tilestart;x<canvas.width;x+=80){
    ctx.fillRect(x,floorY,50,10);
  }
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
