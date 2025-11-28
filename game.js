(function(){
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let running=false, paused=false;
let player, bullets, enemies, stars, score, level, lives, ticks, spawnRate;

function reset(){
  player = {x: W/2, y: H-50, r: 18, speed: 5, cooldown:0};
  bullets = [];
  enemies = [];
  stars = [];
  for(let i=0;i<80;i++) stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2});
  score = 0; level = 1; lives = 3; ticks = 0; spawnRate = 80;
  running = true; paused = false;
  updateHUD();
}

function updateHUD(){
  document.getElementById('hud').textContent = `Score: ${score}   Lives: ${lives}   Level: ${level}`;
}

function spawnEnemy(){
  const w = 24 + Math.random()*36;
  const x = Math.random()*(W-w);
  const speed = 1.2 + Math.random()*1.8 + (level-1)*0.3;
  enemies.push({x:x,y:-w,w:w, speed:speed, hp:1 + Math.floor(level/3)});
}

function rectsCollide(a,b){
  return !(a.x+a.r < b.x || a.x-a.r > b.x+b.w || a.y+a.r < b.y || a.y-a.r > b.y+b.h);
}

const keys = {};
window.addEventListener('keydown', e=>{ keys[e.key]=true; if(e.key===' ') shoot(); if(e.key==='p') togglePause(); });
window.addEventListener('keyup', e=>{ keys[e.key]=false; });

function shoot(){
  if(!running) return;
  if(player.cooldown>0) return;
  bullets.push({x:player.x, y:player.y - player.r - 6, r:4, speed:8});
  player.cooldown = 12;
}

function togglePause(){ paused = !paused; if(!paused) requestAnimationFrame(step); }

function step(){
  if(!running || paused) return;
  ticks++;
  if(ticks % Math.max(10, spawnRate - level*2) === 0) spawnEnemy();
  if(player.cooldown>0) player.cooldown--;

  let dx=0;
  if(keys.ArrowLeft || keys.a) dx -= 1;
  if(keys.ArrowRight || keys.d) dx += 1;
  player.x += dx * player.speed;
  player.x = Math.max(player.r, Math.min(W-player.r, player.x));

  for(let i=bullets.length-1;i>=0;i--){
    bullets[i].y -= bullets[i].speed;
    if(bullets[i].y < -10) bullets.splice(i,1);
  }

  for(let i=enemies.length-1;i>=0;i--){
    let e = enemies[i];
    e.y += e.speed;
    for(let j=bullets.length-1;j>=0;j--){
      const b = bullets[j];
      if(b.x > e.x && b.x < e.x+e.w && b.y > e.y && b.y < e.y+e.w){
        bullets.splice(j,1);
        e.hp--;
        if(e.hp<=0){
          enemies.splice(i,1);
          score += 5;
          break;
        }
      }
    }
    if(rectsCollide(player, e)){
      enemies.splice(i,1);
      lives--;
      if(lives<=0){ running=false; updateHUD(); return; }
    } else if(e.y > H+50){
      enemies.splice(i,1);
      score += 1;
    }
  }

  if(score >= level*50){
    level++;
    player.speed += 0.5;
    updateHUD();
  }

  draw();
  updateHUD();
  requestAnimationFrame(step);
}

function draw(){
  ctx.fillStyle = '#00111a';
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#ffffff';
  for(let s of stars){
    ctx.globalAlpha = 0.5;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.fillStyle='#38bdf8'; ctx.arc(player.x,player.y,player.r,0,Math.PI*2); ctx.fill(); ctx.closePath();
  ctx.beginPath(); ctx.fillStyle='#0369a1'; ctx.moveTo(player.x-8, player.y); ctx.lineTo(player.x+8, player.y); ctx.lineTo(player.x, player.y-22); ctx.fill(); ctx.closePath();
  ctx.fillStyle='#fffb7d';
  for(let b of bullets) ctx.fillRect(b.x-2,b.y-6,4,8);
  ctx.fillStyle='#fb7185';
  for(let e of enemies) ctx.fillRect(e.x,e.y,e.w,e.w);
  ctx.fillStyle='#cfe8ff'; ctx.font='16px system-ui';
  ctx.fillText(`Score: ${score}`, 12, 20);
  ctx.fillText(`Level: ${level}`, 120, 20);
  ctx.fillText(`Lives: ${lives}`, 220, 20);
}

document.getElementById('startBtn').addEventListener('click', ()=>{ reset(); requestAnimationFrame(step); });
document.getElementById('pauseBtn').addEventListener('click', ()=>{ togglePause(); });
canvas.addEventListener('touchstart', e=>{ e.preventDefault(); const t = e.touches[0]; if(t.clientY < window.innerHeight/2) shoot(); else handleTouch(t.clientX - canvas.getBoundingClientRect().left, t.clientY - canvas.getBoundingClientRect().top); });
canvas.addEventListener('touchmove', e=>{ e.preventDefault(); const t = e.touches[0]; handleTouch(t.clientX - canvas.getBoundingClientRect().left, t.clientY - canvas.getBoundingClientRect().top); });

function handleTouch(tx,ty){
  player.x = tx * (canvas.width / canvas.getBoundingClientRect().width);
}
})();
