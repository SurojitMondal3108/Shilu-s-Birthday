// MUSIC SETUP: filenames below must match the files in your GitHub music repository.
// If a song filename differs, edit only the matching "file" value here.
const musicRepo = "https://raw.githubusercontent.com/SurojitMondal3108/Shilu-s-Birthday/main/";
const tracks = [
  {title:"Thik Jeno Love Story — Title Song", file:"Thik Jeno Love Story.mp3"},
  {title:"You & Me", file:"you-me.mp3"},
  {title:"Kothin", file:"Kothin.mp3"},
  {title:"Love Me Thoda", file:"Love Me Thoda.mp3"},
  {title:"Love Me Thoda — BGM", file:"Love Me Thoda - BGM.mp3"},
  {title:"Tomake Na Lekha Chithita", file:"Tomake na lekha chithita ❤.mp3"},
  {title:"Tor Naam — Male", file:"Tor Naam Male.mp3"},
  {title:"O My Love", file:"o-my-love.mp3"},
  {title:"Is This Love", file:"Is This Love.mp3"},
  {title:"Thik Jeno Love Story — Only BGM", file:"Thik Jeno Love Story - Only BGM.mp3"}
];

const captions = ["A lovely moment","That smile","Simply you","A little sunshine","Beautifully you","A favourite frame","A day to remember","Little joys","A soft little memory","A lovely frame","Just being you","A moment worth keeping","Your kind of magic","A smile I remember","A little happiness","A beautiful day","A favourite look","A frame full of charm","The little things","A memory in colour","Just you","A bright moment","A gentle reminder","A lovely chapter","Always keep smiling"];
const grid = document.getElementById("photoGrid");
for(let i=1;i<=25;i++){
  const figure=document.createElement("figure"); figure.className="photo";
  figure.style.setProperty("--r",`${((i%5)-2)*0.7}deg`);
  const img=document.createElement("img"); img.src=`images/shilu/photo-${String(i).padStart(2,"0")}.jpg`; img.alt=`Memory ${i} for Shilu`; img.loading="lazy";
  const cap=document.createElement("figcaption"); cap.textContent=captions[i-1];
  figure.append(img,cap); figure.addEventListener("click",()=>openLightbox(img.src)); grid.append(figure);
}
const pages=[...document.querySelectorAll(".page")], audio=document.getElementById("player");
let current=-1,started=false,soundEnabled=true,fadeTimer=null;
const trackName=document.getElementById("trackName"),trackStatus=document.getElementById("trackStatus"),playBtn=document.getElementById("play"),disc=document.getElementById("disc");
function trackUrl(i){return musicRepo+encodeURIComponent(tracks[i].file).replace(/%2F/g,"/");}
function fadeTo(target,callback){
  clearInterval(fadeTimer); const start=audio.volume; let step=0;
  fadeTimer=setInterval(()=>{step++;audio.volume=Math.max(0,Math.min(1,start+(target-start)*step/12));if(step>=12){clearInterval(fadeTimer);if(callback)callback();}},45);
}
function updatePlayer(playing){playBtn.textContent=playing?"Ⅱ":"▶";disc.classList.toggle("playing",playing);}
function setTrack(i,autoplay=false){
  if(i<0||i>=tracks.length)return;
  current=i;trackName.textContent=tracks[i].title;
  const load=()=>{audio.pause();audio.src=trackUrl(i);audio.volume=0; if(autoplay&&soundEnabled){audio.play().then(()=>{fadeTo(.62);trackStatus.textContent="Now playing";updatePlayer(true);}).catch(()=>{trackStatus.textContent="Music couldn't load — check the filename in the playlist";updatePlayer(false);});}else{trackStatus.textContent="Ready — press play";updatePlayer(false);}};
  if(!audio.paused)fadeTo(0,load);else load();
}
function show(id){
  const page=document.getElementById(id);if(!page)return;
  pages.forEach(p=>p.classList.remove("active"));page.classList.add("active");
  const idx=pages.indexOf(page);document.getElementById("progress").style.width=`${((idx+1)/pages.length)*100}%`;
  const song=Number(page.dataset.song);
  if(started&&song!==current)setTrack(song,true);
  window.scrollTo({top:0,behavior:"smooth"});
}
document.getElementById("begin").addEventListener("click",()=>{started=true;setTrack(0,true);show("gallery");});
document.querySelectorAll("[data-next]").forEach(btn=>btn.addEventListener("click",()=>show(btn.dataset.next)));
document.getElementById("restart").addEventListener("click",()=>show("opening"));
playBtn.addEventListener("click",async()=>{
  if(current<0){started=true;setTrack(0,true);return;}
  if(audio.paused){try{await audio.play();fadeTo(.62);trackStatus.textContent="Now playing";updatePlayer(true);}catch(e){trackStatus.textContent="Could not play this song — check its filename.";}}
  else{fadeTo(0,()=>audio.pause());trackStatus.textContent="Paused";updatePlayer(false);}
});
document.getElementById("next").addEventListener("click",()=>{started=true;setTrack((current+1)%tracks.length,true);});
document.getElementById("prev").addEventListener("click",()=>{started=true;setTrack((current-1+tracks.length)%tracks.length,true);});
document.getElementById("soundToggle").addEventListener("click",()=>{
  soundEnabled=!soundEnabled;document.getElementById("soundToggle").textContent=soundEnabled?"♫ Sound on":"♫ Sound off";
  if(!soundEnabled){fadeTo(0,()=>audio.pause());trackStatus.textContent="Sound is off";updatePlayer(false);}
  else if(started&&current>=0){audio.play().then(()=>{fadeTo(.62);updatePlayer(true);trackStatus.textContent="Now playing";}).catch(()=>{});}
});
audio.addEventListener("ended",()=>{if(current<tracks.length-1)setTrack(current+1,true);else{trackStatus.textContent="Playlist finished";updatePlayer(false);}});
document.getElementById("keep").addEventListener("click",e=>{e.currentTarget.textContent="Thank you for reading ♥";});
function openLightbox(src){document.getElementById("lightboxImage").src=src;document.getElementById("lightbox").classList.add("open");}
document.getElementById("closeLightbox").addEventListener("click",()=>document.getElementById("lightbox").classList.remove("open"));
document.getElementById("lightbox").addEventListener("click",e=>{if(e.target.id==="lightbox")e.currentTarget.classList.remove("open");});
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.getElementById("lightbox").classList.remove("open");});
function makePetal(){const el=document.createElement("span");el.className="petal";el.textContent=Math.random()>.5?"✿":"♥";el.style.left=`${Math.random()*100}vw`;el.style.fontSize=`${10+Math.random()*12}px`;el.style.opacity=.2+Math.random()*.35;el.style.animationDuration=`${8+Math.random()*7}s`;document.body.append(el);setTimeout(()=>el.remove(),16000);}
setInterval(makePetal,1500);
