const canvas= document.getElementById("gameCanvas");
const ctx= canvas.getContext("2d");

const floorY= 360;
const ceilingY=60;
const cavelength=5000;
let gamephase="chase";
let cameraX=0;
const bossArenaStart=cavelength-canvas.width;

let ballX= 100;
const ballRadius= 20;
let ballY= floorY-ballRadius;
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
let gamestarted=false;
let spikes=[];
let rocks=[];
let rocktimer=0;
let dragon={
  x:-120,
  y:220,
  width:110,
  height:85,
  speed:3.6
};
let fireballs=[];
let firetimer=0;
let dragondelay=30;
let bosshp=10;
let win=false;
let orbs=[];
let bosstimer=0;
let orbtimer=0;
let dragonflash=0;
let gametimer=0;

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
  ballY=floorY-ballRadius;
  velocityY=0;
  velocityX=0;
  cameraX=0;
  gamephase="chase";
  isgameover=false;
  rocks=[];
  rocktimer=0
  dragon.x=-120;
  dragon.y=220;
  fireballs=[];
  firetimer=0;
  dragondelay=30;
  bosshp=10;
  win=false;
  orbs=[];
  bosstimer=0;
  orbtimer=0;
  dragonflash=0;
  gametimer=0;
  
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
  if(!gamestarted){
    gamestarted=true;
    return;
  }
  if (isgameover||win){
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
  if(!gamestarted){
    gamestarted=true;
    return;
  }
  if (isgameover||win)resetgame();
});
const fsbutton=document.getElementById("fsbutton");
fsbutton.addEventListener("pointerdown",()=>{
  if (!document.fullscreenElement){
    document.documentElement.requestFullscreen();
  }
  else{
    document.exitFullscreen();
  }
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
if (!gamestarted||isgameover||win) return;
  gametimer++;
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
      dragon.x=cavelength-150;
      dragon.y=180;
      fireballs=[];
      rocks=[];
      firetimer=0;
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
      ballY+ballRadius>floorY-s.height+6)
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
  if (gamephase==="chase"){
    if (dragondelay>0){
      dragondelay--;
    }
    else{
    dragon.x+=dragon.speed;
    if (dragon.x<ballX-420){
      dragon.x=ballX-420;
    }
    dragon.y+=(ballY-(dragon.y+dragon.height/2))*0.04;
    }
    if (
      ballX+ballRadius-10>dragon.x &&
    ballX-ballRadius+10<dragon.x + dragon.width &&
      ballY+ballRadius-10>dragon.y &&
      ballY-ballRadius+10<dragon.y+dragon.height
    ) {isgameover=true;}
    firetimer++;
    if (firetimer>=110) {
      
    firetimer=0;
    fireballs.push({
      x:dragon.x+dragon.width,
      y:dragon.y+dragon.height/2,
      radius:12,
      speedX: 7.5
    });
  }
    
for (let i=fireballs.length-1; i>=0;i--){
  const f=fireballs[i];
  f.x+=f.speedX;

  const fdist=Math.hypot(ballX-f.x,ballY-f.y);
  if (fdist<ballRadius+f.radius-3){
  isgameover=true;
  }
  if (f.x-cameraX>canvas.width+50){
    fireballs.splice(i,1);
  }
}
  }
  if(gamephase==="boss"){
    bosstimer++;
  if (dragonflash>0)dragonflash--;
  dragon.y=180+Math.sin(bosstimer*0.04)*70;

  if (
    ballX+ballRadius-10>dragon.x&&
    ballX-ballRadius+10<dragon.x +dragon.width &&
    ballY+ballRadius-10>dragon.y&&
    ballY-ballRadius+10<dragon.y+dragon.height
    ){
    isgameover=true;
    }
    firetimer++;
  if(firetimer>=95){
    firetimer=0;
    fireballs.push({
      x: dragon.x,
      y: dragon.y+dragon.height/2,
      radius:12,
      speedX:-6.5
    });
  }
    orbtimer++;
    if (orbtimer>=130){
  orbtimer=0;
  orbs.push({
    x:bossArenaStart+120+Math.random()*360,
    y:ceilingY,
    radius:16,
    speedX:0,
  speedY:2.6,
    deflected:false
  })
    }
for (let i=fireballs.length-1;i>=0;i--){
  const f=fireballs[i];
  f.x+=f.speedX;
  if (Math.hypot(ballX-f.x,ballY-f.y)<ballRadius+f.radius-3){
    isgameover=true;
  }
  if(f.x<bossArenaStart-50){
    fireballs.splice(i,1);
  }
}
for(let i=orbs.length-1; i>=0;i--){
  const o=orbs[i];
  o.x+=o.speedX;
  o.y+=o.speedY;

  if(!o.deflected&&Math.hypot(ballX-o.x,ballY-o.y)<ballRadius+o.radius+4){
    o.deflected=true;
    o.speedX=9.5;
    o.speedY=(dragon.y+dragon.height/2-o.y)*0.03;
    velocityY=-8;
  }
  if (
    o.deflected&&
    o.x+o.radius>dragon.x&&
    o.x-o.radius<dragon.x+dragon.width&&
    o.y+o.radius>dragon.y&&
    o.y-o.radius<dragon.y+dragon.height
  ){
    bosshp--;
    dragonflash=8;
    orbs.splice(i,1);
    if (bosshp<=0){
      win=true;
    }
    continue;
  }
  if (o.y-o.radius>floorY||o.x>cavelength+50){
    orbs.splice(i,1);
  }
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
  //spikes
  ctx.fillStyle="#ef4444";
  for (let i=0; i<spikes.length;i++){
    const s=spikes[i];
    const sx=s.x-cameraX;
    if (sx+s.width>0&&sx<canvas.width){
      ctx.beginPath();
      ctx.moveTo(sx,floorY);
      ctx.lineTo(sx+s.width/2,floorY-s.height);
      ctx.lineTo(sx+s.width,floorY);
      ctx.closePath();
      ctx.fill();
    }
  }
  //falling rocks
  ctx.fillStyle="#9ca3af";
  for(let i=0; i<rocks.length;i++){
    const r=rocks[i];
    const rx=r.x-cameraX;
    ctx.beginPath();
    ctx.arc(rx,r.y,r.radius,0,Math.PI*2);
    ctx.fill();
    ctx.closePath();
  }
  //dragon
  const dx=dragon.x-cameraX;
  //dragon wing
  ctx.fillStyle="#7f1d1d";
  ctx.beginPath();
  ctx.moveTo(dx+20,dragon.y+20);
  ctx.lineTo(dx-25,dragon.y-25);
  ctx.lineTo(dx+60,dragon.y+10);
  ctx.closePath();
  ctx.fill();
  //dragon body
  ctx.fillStyle=dragonflash>0?"#ffffff":"#b91c1c";
  ctx.fillRect(dx,dragon.y,dragon.width,dragon.height);
  //eyes
  ctx.fillStyle="#facc15";
  ctx.fillRect(dx+dragon.width-28,dragon.y+18,12,12);
  //fireball
  for (let i=0;i<fireballs.length;i++){
    const f=fireballs[i];
    const fx=f.x-cameraX;
    ctx.beginPath();
    ctx.arc(fx,f.y,f.radius,0,Math.PI*2);
    ctx.fillStyle="#f97316";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(fx,f.y,f.radius*0.5,0,Math.PI*2)
    ctx.fillStyle="#fde047";
    ctx.fill();
    ctx.closePath();
  }
  //orbs
  for (let i=0; i<orbs.length; i++){
    const o=orbs[i];
    const ox=o.x-cameraX;
    ctx.beginPath();
    ctx.arc(ox,o.y,o.radius,0,Math.PI*2);
    ctx.fillStyle=o.deflected?"#22c55e":"#facc15";
    ctx.fill();
    ctx.strokeStyle="#ffffff";
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.closePath();
  }
  //ball 
  const screenBallX=ballX-cameraX;
  ctx.beginPath();
  ctx.arc(screenBallX,ballY,ballRadius,0,Math.PI*2);
  ctx.fillStyle="deepskyblue";
  ctx.fill();
  ctx.closePath();
  //progress bar 
  const timeText=(gametimer/60).toFixed(1)+ "s";

  if (gamephase==="chase"){
    ctx.fillStyle="#38bdf8"
    ctx.font="bold 20px sans-serif";
    ctx.textAlign="left";
    ctx.fillText("CHASE",24,36);

    const progress=Math.min(ballX/(bossArenaStart+250),1);
    ctx.filletStyle="#0f172a";
    ctx.fillRect(105,20,420,20);
    ctx.fillStyle="#38bdf8";
    ctx.fillRect(105,20,420*progess,20);
    ctx.strokeStyle="#94a3b8";
    ctx.linewidth=2;
    ctx,strokrRect(105,20,420,20);
  }
  else{
    ctx.fillStyle="#ef4444";
    ctx.font="bold 16px sans-serif";
    ctx.textAlign="left";
    ctx.fillText("BOSS HP",24,36);

    for (let i=0;i<10;i++){
      const bx=115+i*40;
      ctx.fillStyle=i<bosshp ? "#ef4444":"1e293b";
      ctx.fillRect(bx,18,32,24);
      ctx.strokeStyle="#94a3b8";
      ctx.lineWidth=2;
      ctx.strokeRect(bx,18,32,24);
    }
    }
  ctx.fillStyle="#facc15";
  ctx.font="bold 18px monospace";
  ctx.textAlign="right";
  ctx.fillText(timeText,690,36);
  }
  if(!gamestarted){
    ctx.fillStyle="rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#f97316";
    ctx.font="bold 46px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("DRAGON ESCAPE",canvas.width/2,canvas.height/2-20);
    ctx.fillStyle="#ffffff";
    ctx.font="20px sans-serif";
    ctx.fillText("Tap the screen or ■ to start",canvas.width/2,canvas.height/2+25);
  }
  if (isgameover){
    ctx.fillStyle="rgba(0,0,0,0.65)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#ef4444";
    ctx.font="bold 44px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("GAME OVER",canvas.width/2,canvas.height/2-10);
    ctx.fillStyle="#ffffff";
    ctx.font="20px sans-serif";
    ctx.fillText("Tap screen or ■ to retry",canvas.width/2,canvas.height/2+30);
  }
  if(win){
    ctx.fillStyle="rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#22c55e";
    ctx.font="bold 44px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("VICTORY!",canvas.width/2,canvas.height/2-10);
    ctx.fillStyle="#ffffff";
    ctx.font="20px sans-serif";
    ctx.fillText("You defeated the dragon! Tap to play again",canvas.width/2,canvas.height/2+30);
  }

function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
