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
  width:160,
  height:130,
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
let sfx=null;
let muted=false;
let rolltimer=0;
function loadasset(src){
  const asset= new Image();
  asset.src=src;
  return asset;
}
const assetbg=loadasset("assets/background.png");
const assetwall=loadasset("assets/back-walls.png");
const assettile=loadasset("assets/tiles.png");
const assetball=loadasset("assets/ball.png");
const assetdragon=loadasset("assets/dragon.png");
const assetspike=loadasset("assets/spike.png");
const assetrock=loadasset("assets/rock.png");
const assetfireball=loadasset("assets/fireball.png");
const assetorb=loadasset("assets/orb.png")
let animtick=0;

function playaudio(startfreq,endfreq,duration,type) {
  if (muted) return;
  if (!sfx){
    sfx=new(window.AudioContext||window.webkitAudioContext)();  
  }
  const osc=sfx.createOscillator();
  const gain=sfx.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(startfreq,sfx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endfreq,sfx.currentTime+duration);
  gain.gain.setValueAtTime(0.15,sfx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01,sfx.currentTime+duration);
  osc.connect(gain);
  gain.connect(sfx.destination);
  osc.start();
  osc.stop(sfx.currentTime+duration);
}
function soundwin(){
  playaudio(440,440,0.12,"square");
  setTimeout(()=>playaudio(554,554,0.12,"square"),130);
  setTimeout(()=>playaudio(659,880,0.25,"square"),260);
}
function dragonroar () {
  if (muted) return;
  if (!sfx){
    sfx=new(window.AudioContext||window.webkitAudioContext)();
  }
  const now=sfx.currentTime;
  [95,102].forEach((freq)=>{
    const osc=sfx.createOscillator();
    const g=sfx.createGain();
    osc.type="sawtooth";
    osc.frequency.setValueAtTime(freq,now);
    osc.frequency.exponentialRampToValueAtTime(36,now+0.75);
    g.gain.setValueAtTime(0.18,now);
    g.gain.exponentialRampToValueAtTime(0.01,now+0.75);
    osc.connect(g);
    g.connect(sfx.destination);
    osc.start(now);
    osc.stop(now+0.75);
  });
const bufSize =sfx.sampleRate*0.75;
  const buf=sfx.createBuffer(1,bufSize,sfx.sampleRate);
  const data=buf.getChannelData(0);
  for (let i=0; i<bufSize; i++) data[i]=Math.random()*2-1;
  const noise=sfx.createBufferSource();
  noise.buffer=buf;
  const filter=sfx.createBiquadFilter();
  filter.type="bandpass";
  filter.frequency.setValueAtTime(700,now);
  filter.frequency.exponentialRampToValueAtTime(160,now+0.75);
  const ng=sfx.createGain();
  ng.gain.setValueAtTime(0.35,now);
  ng.gain.exponentialRampToValueAtTime(0.01,now+0.75);
  noise.connect(filter);
  filter.connect(ng);
  ng.connect(sfx.destination);
  noise.start(now);
  
}
function fireballsound(){
  playaudio(420,140,0.14,"sawtooth");
}
function rocksound(){
  playaudio(260,110,0.12,"triangle");
}
function orbsound(){
  playaudio(880,1320,0.1,"sine");
}
function gameoversound(){
  playaudio(300,220,0.15,"sawtooth");
  setTimeout(()=>playaudio(210,150,0.15,"sawtooth"),160);
  setTimeout(()=>playaudio(140,60,0.35,"sawtooth"),320);
}
let bgmStep=0;
let bgmTime=0;
const titlelead=[294,349,440,587,523,440,466,440];
const titlebass=[147,147,110,110,117,117,110,110];

const chaselead=[294,294,349,392,440,392,349,330,294,349,440,523,466,440,392,330];
const chasebass=[147,110,147,110,175,131,196,110,147,110,175,131,117,175,110,110];

const bosslead=[330,349,330,247,330,349,392,349,330,392,440,392,349,330,294,247];
const bossbass=[165,165,123,123,165,165,175,165,165,165,110,110,196,175,165,123];

function playmusic(freq,dur,type,vol){
  if (muted||!sfx)return;
  const osc=sfx.createOscillator();
  const gain=sfx.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(freq,sfx.currentTime);
  gain.gain.setValueAtTime(vol,sfx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.005,sfx.currentTime+dur);
  osc.connect(gain);
  gain.connect(sfx.destination);
  osc.start();
  osc.stop(sfx.currentTime+dur);
}

function updatemusic(){
  if (muted||!sfx||isgameover) return;
  bgmTime++;
  let lead,bass,speed,wave;
  if (!gamestarted||win){
    lead=titlelead; bass=titlebass; speed=16; wave="triangle";
  }
  else if(gamephase==="chase"){
    lead=chaselead;bass=chasebass; speed=9; wave="square"
  }
  else{
    lead=bosslead; bass=bossbass; speed=8; wave="sawtooth";
  }
  if (bgmTime>=speed){
    bgmTime=0;
    const i=bgmStep%lead.length;
    playmusic(lead[i],speed/60,wave,0.055);
    playmusic(bass[i],speed/60,"triangle",0.07);
    bgmStep++
  }
}
function createspike (){
  spikes=[];
  let x=550;
  while (x<bossArenaStart-200){
    spikes.push({x:x,width:90,height:36});
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
    if (!sfx) sfx=new(window.AudioContext||window.webkitAudioContext)();
    return;
  }
  if (isgameover||win){
    resetgame();
    return;
  }
  if (isOnGround){
    velocityY=jumpstrenght;
    isOnGround=false;
    playaudio(220,520,0.12,"square");
  }
}
jump.addEventListener("pointerdown",tryjump);
canvas.addEventListener("pointerdown",()=>{
  if(!gamestarted){
    gamestarted=true;
    if (!sfx)sfx=new(window.AudioContext||window.webkitAudioContext)();
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
const mutebutton=document.getElementById("mutebutton");
mutebutton.addEventListener("pointerdown",()=> {
  muted=!muted;
  mutebutton.textContent=muted ? "OFF" : "ON";
});
window.addEventListener("pointerdown",()=>{
  if (!sfx) sfx=new(window.AudioContext||window.webkitAudioContext)();
  if (sfx.state==="suspended") sfx.resume();
});
window.addEventListener("keydown",(e)=>{
  if (e.code==="ArrowLeft"||e.code==="KeyA") moveleft=true;
  if (e.code==="ArrowRight"||e.code==="KeyD") moveright=true;
  if (e.code==="Space" || e.code==="ArrowUp") tryjump();
  if (!sfx) sfx=new(window.AudioContext||window.webkitAudioContext)();
  if (sfx.state==="suspended") sfx.resume();
});
window.addEventListener("keyup",(e)=>{
  if (e.code==="ArrowLeft"||"KeyA") moveleft=false;
  if (e.code==="ArrowRight"||"KeyD") moveright=false;
});
function update(){
if (!gamestarted||isgameover||win) return;
  gametimer++;
  const wasdead=isgameover;
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
      dragonroar();
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
  if (isOnGround&&(moveleft||moveright)){
    rolltimer++;
    if (rolltimer>=10){
      rolltimer=0;
      playaudio(95,75,0.04,"triangle");
    }
  }
  if (ballY-ballRadius<ceilingY){
    ballY=ceilingY+ballRadius;
    velocityY=0;
  }
  for (let i=0; i<spikes.length; i++){
    const s=spikes[i];
    if(
      ballX+ballRadius-2>s.x &&
      ballX-ballRadius+2<s.x+s.width &&
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
        radius:30,
        speedY:4
      });
      rocksound();
    }
  }
  for (let i=rocks.length-1;i>=0;i--){
    const r=rocks[i];
    r.y+=r.speedY;
    const dist = Math.hypot(ballX-r.x,ballY-r.y);
    if(dist<ballRadius+r.radius-14){
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
      fireballsound();
  }
    
for (let i=fireballs.length-1; i>=0;i--){
  const f=fireballs[i];
  f.x+=f.speedX;

  const fdist=Math.hypot(ballX-f.x,ballY-f.y);
  if (fdist<ballRadius+f.radius-8){
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
    fireballsound();
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
      orbsound();
    }
for (let i=fireballs.length-1;i>=0;i--){
  const f=fireballs[i];
  f.x+=f.speedX;
  if (Math.hypot(ballX-f.x,ballY-f.y)<ballRadius+f.radius-8){
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
    const dxhit=o.x-ballX;
    const dyhit=o.y-ballY;
    const len=Math.hypot(dxhit,dyhit)||1;
    o.speedX=(dxhit/len)*10;
    o.speedY=(dyhit/len)*10;
    playaudio(500,950,0.1,"triangle");
  }

  if (
    o.deflected&&
    o.x+o.radius>dragon.x&&
    o.x-o.radius<dragon.x+dragon.width&&
    o.y+o.radius>dragon.y&&
    o.y-o.radius<dragon.y+dragon.height
  ){
    bosshp--;
    playaudio(180,60,0.15,"sawtooth");
    dragonflash=8;
    orbs.splice(i,1);
    if (bosshp<=0){
      win=true;
      soundwin();
      bgmStep=0;
      bgmTime=-25;
    }
    continue;
  }
  if (o.y-o.radius>floorY||o.y+o.radius<ceilingY||o.x>cavelength+50||o.x<bossArenaStart-50){
    orbs.splice(i,1);
  }
  }
}
  if(!wasdead&&isgameover) gameoversound();
}


function draw (){
ctx.imageSmoothingEnabled=false;
  animtick++;
  //cave bg n walls
  ctx.fillStyle="#161426";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if (assetbg.complete&&assetbg.width>0){
    const bgstart= -((cameraX*0.25)%200);
    for (let x=bgstart;x<canvas.width;x+=200){
      ctx.drawImage(assetbg,x,ceilingY,200,floorY-ceilingY);
    }
  }
  if (assetwall.complete&&assetwall.width>0){
    const wallstart =-((cameraX*0.5)%533);
    for (let x=wallstart;x<canvas.width;x+=533){
    ctx.drawImage(assetwall,x,ceilingY,533,floorY-ceilingY); 
    }
  }
  //cave ceiling n floor
  ctx.fillStyle="#1a1222";
  ctx.fillRect(0,0,canvas.width,ceilingY);
  if (assettile.complete&&assettile.width>0){
    const tilestart= -(cameraX%240);
    for (let x=tilestart;x<canvas.width;x+=240){
    ctx.drawImage(assettile,144,80,192,20,x,ceilingY-8,240,25);
    ctx.drawImage(assettile,144,144,192,32,x,floorY,240,40);
    }
  }
  // spikes
  for (let i=0; i<spikes.length; i++){
    const s=spikes[i];
    const sx=s.x-cameraX;
    if (sx+s.width>0&&sx<canvas.width&&assetspike.complete){
      ctx.drawImage(assetspike,sx-5,floorY-52,100,100);
    }
  }
  //rocks
  const rframe=Math.floor(animtick/6)%4;
  for (let i=0; i<rocks.length;i++){
    const r=rocks[i];
    const rx=r.x-cameraX;
    if(assetrock.complete){
      ctx.drawImage(assetrock,rframe*16,0,16,16,rx-r.radius*1.3,r.y-r.radius*1.3,r.radius*2.6,r.radius*2.6);
  }
  }
  //dragon
  const dx=dragon.x-cameraX;
  const dragonframe=Math.floor(animtick/8)%4;
  if (assetdragon.complete){
    ctx.save();
    if (dragonflash>0) ctx.globalAlpha=0.4;
    ctx.translate(dx+dragon.width/2,dragon.y+dragon.height/2);
    if (ballX<dragon.x+dragon.width/2) ctx.scale(-1,1);
    ctx.drawImage(assetdragon,dragonframe*16,0,16,16,-dragon.width/2,-dragon.height/2,dragon.width,dragon.height);
    ctx.restore();
  }
  //fireball
  const fframe=Math.floor(animtick/5)%4;
  for (let i=0; i<fireballs.length;i++){
  const f=fireballs[i];
    const fx=f.x-cameraX;
    if(assetfireball.complete){
      ctx.save();
      ctx.translate(fx,f.y);
    if (f.speedX<0) ctx.scale(-1,1);
    ctx.drawImage(assetfireball,fframe*40,0,40,18,-32,-16,64,32);
   ctx.restore(); 
  }
  }
  //orb
  const oframe=Math.floor(animtick/6)%5;
  for(let i=0;i<orbs.length;i++){
    const o=orbs[i];
    const ox=o.x-cameraX;
    if (assetorb.complete){
      ctx.drawImage(assetorb,oframe*16,0,16,16,ox-o.radius-2,o.y-o.radius-2,o.radius*2+4,o.radius*2+4);
    }
    if (o.deflected){
      ctx.beginPath();
     ctx.arc(ox,o.y,o.radius+3,0,Math.PI*2);
      ctx.strokeStyle="#22c55e";
      ctx.lineWidth=2;
      ctx.stroke();
      ctx.closePath();
    }
  }
  //ball
  const screenballx=ballX-cameraX;
  if (assetball.complete){
    ctx.save();
    ctx.translate(screenballx,ballY);
    ctx.rotate(ballX/ballRadius);
    ctx.drawImage(assetball,0,0,10,10,-ballRadius,-ballRadius,ballRadius*2,ballRadius*2);
    ctx.restore();
  }
  //progress bar
  const timeText=(gametimer/60).toFixed(1)+"s";
  if (gamephase==="chase") {
    ctx.font='bold 14px "Press Start 2P",monospace';
    ctx.textAlign="left";
    ctx.fillStyle="#0b0814";
    ctx.fillText("THE CHASE",22,38);
    ctx.fillStyle="#d8b4fe";
    ctx.fillText("THE CHASE",20,36);

    const progress=Math.min(ballX/(bossArenaStart+250),1);
    const barW=350;
    const fillW=Math.floor(barW*progress);

    ctx.fillStyle="#0b0814";
    ctx.fillRect(160,16,barW+8,28);
    ctx.fillStyle="#161126";
    ctx.fillRect(164,20,barW,20);

    if (fillW>0){
      ctx.fillStyle="#9333ea";
      ctx.fillRect(164,20,fillW,20);
      ctx.fillStyle="#d8b4fe";
      ctx.fillRect(164,20,fillW,5);
    }
    ctx.strokeStyle="#7e22ce";
    ctx.lineWidth=2;
    ctx.strokeRect(162,18,barW+4,24);
  }
  //boss fight bar
  else{
    ctx.font='bold 18px "Press Start 2P",monospace';
    ctx.textAlign="left";
    ctx.fillStyle="#0b0814";
    ctx.fillText("DRAGON",22,38);
    ctx.fillStyle="#ef4444";
    ctx.fillText("DRAGON",20,36);
    //boss hp bar
    for (let i=0; i<10;i++){
      const bx=110+i*40;
      ctx.fillStyle="#0b0814";
      ctx.fillRect(bx-2,16,34,28);
      if (i<bosshp){
        ctx.fillStyle="#dc2626";
        ctx.fillRect(bx,18,30,24);
        ctx.fillStyle="#f87171";
        ctx.fillRect(bx,18,30,5);
      }
      else{
        ctx.fillStyle="#1e1629";
        ctx.fillRect(bx,18,30,24);
      }
      ctx.strokeStyle="#5a6082";
      ctx.lineWidth=2;
      ctx.strokeRect(bx,18,30,24);
    }
  }
  //timer
  ctx.fillStyle="#0b0814";
  ctx.fillRect(548,14,152,32);
  ctx.fillStyle="#292c42";
  ctx.fillRect(550,16,148,28);
  ctx.strokeStyle="#5a6082";
  ctx.lineWidth=2;
  ctx.strokeRect(550,16,148,28);

  ctx.font='bold 16px "Press Start 2P",monospace';
  ctx.textAlign="center";
  ctx.fillStyle="#0b0814";
  ctx.fillText(timeText,626,38);
  ctx.fillStyle="#ffe135";
  ctx.fillText(timeText,624,36);
//title screen
  const blink=Math.floor(animtick/28)%2===0;

  if (!gamestarted){
    ctx.fillStyle="rgba(10,8,20,0.78)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#161426";
    ctx.fillRect(110,85,580,230);
    ctx.strokeStyle="#c084fc";
    ctx.lineWidth=4;
    ctx.strokeRect(110,85,580,230);

    ctx.textAlign="center";
    ctx.font='32px "Press Start 2P",monospace';
    ctx.fillStyle="#7c2d12";
    ctx.fillText("DRAGON ESCAPE",canvas.width/2+4,159);
    ctx.fillStyle="#f97316";
    ctx.fillText("DRAGON ESCAPE",canvas.width/2,155);

   ctx.font='14px "Press Start 2P",monospace';
    ctx.fillStyle="#d8b4fe";
    ctx.fillText("You ran into a cave....it's the dragon's nest!",canvas.width/2,205);

    if (blink){
      ctx.font='14px "Press Start 2P",monospace';
      ctx.fillStyle="#ffffff";
      ctx.fillText("TAP SCREEN OR ■ TO START",canvas.width/2,270);
    }
  }
//gameover screen
  if (isgameover){
    ctx.fillStyle="rgba(15,5,10,0.78)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#1f1018";
    ctx.fillRect(140,90,520,220);
    ctx.strokeStyle="#ef4444";
    ctx.lineWidth=4;
    ctx.strokeRect(140,90,520,220);

    ctx.textAlign="center";
    ctx.font='32px "Press Start 2P",monospace';
    ctx.fillStyle="#7f1d1d";
    ctx.fillText("GAME OVER",canvas.width/2+4,159);
    ctx.fillStyle="#ef4444";
    ctx.fillText("GAME OVER",canvas.width/2,155);

    const pct=Math.floor(Math.min(ballX/(bossArenaStart+250),1)*100);
    const stat=gamephase==="chase"? "PROGRESS: "+pct+"%| "+ timeText:"BOSS HP LEFT: "+ bosshp+"/10| " +timeText;
    ctx.font='14px "Press Start 2P",monospace';
    ctx.fillStyle="#facc15";
    ctx.fillText(stat,canvas.width/2,205);

    if (blink){
      ctx.font='14px "Press Start 2P",monospace';
      ctx.fillStyle="#ffffff";
      ctx.fillText("TAP SCREEN OR ■ TO RETRY",canvas.width/2,265);
    }
  }

  //win screen
  if (win){
    ctx.fillStyle="rgba(18,14,4,0.8)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#1c160a";
    ctx.fillRect(120,85,560,230);
    ctx.strokeStyle="#facc15";
    ctx.lineWidth=4;
    ctx.strokeRect(120,85,560,230);

    ctx.textAlign="center";
    ctx.font='bold 38px "Press Start 2P",monospace';
    ctx.fillStyle="#141006";
    ctx.fillText("VICTORY!",canvas.width/2+4,159);
    ctx.fillStyle="#ffe135";
    ctx.fillText("VICTORY!",canvas.width/2,155);

    ctx.font='bold 15px "Press Start 2P",monospace';
    ctx.fillStyle="#fde047";
    ctx.fillText("ESCAPED IN "+timeText+"!",canvas.width/2,205);

    if (blink){
      ctx.font='bold 16px "Press Start 2P",monospace';
      ctx.fillStyle="#ffffff";
      ctx.fillText("TAP SCREEN OR ■ TO PLAY AGAIN",canvas.width/2,268);
    }
  }
  }
function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  updatemusic();
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
