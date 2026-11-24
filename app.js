"use strict";

const $ = id => document.getElementById(id);
const icons = {
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  clipboard:'<path d="M8 5H5v16h14V5h-3"/><rect x="8" y="3" width="8" height="4" rx="1"/><path d="m8 14 3 3 5-6"/>',
  book:'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1v14"/>',
  layers:'<path d="m3 7 9-5 9 5-9 5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  timer:'<circle cx="12" cy="14" r="7.5"/><path d="M9 2h6m-3 1v3m6 2 2-2m-8 4v4l3 1"/>',
  activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  scan:'<path d="M3 9V5q0-2 2-2h4m6 0h4q2 0 2 2v4m0 6v4q0 2-2 2h-4m-6 0H5q-2 0-2-2v-4"/><circle cx="12" cy="12" r="3"/>',
  wave:'<path d="M2 12h3m3-5v10m4-14v18m4-15v12m3-8v4m3-3v2"/>',
  cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 2v4m4-4v4m-4 12v4m4-4v4M2 10h4m-4 4h4m12-4h4m-4 4h4"/><rect x="10" y="10" width="4" height="4"/>',
  camera:'<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/>',
  sliders:'<path d="M3 6h5m4 0h9M3 12h11m4 0h3M3 18h3m4 0h11"/><circle cx="10" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  hand:'<path d="M7 13V6a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-6a1.5 1.5 0 0 1 3 0v6-4a1.5 1.5 0 0 1 3 0v8c0 4-2 7-6 7-3 0-5-1-7-4l-3-5c-1-2 1-3 2-2z"/>',
  fist:'<path d="M5 12V8a2 2 0 0 1 4 0v3-5a2 2 0 0 1 4 0v5-4a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v5c0 3-2 4-3 6v1H9v-2l-5-4c-3-3-1-6 1-5l5 3h4"/>',
  thumb:'<path d="M8 10c3-2 4-5 4-8 4 0 4 4 3 7h4c2 0 3 1 2 4l-2 6q-.5 2-3 2H8z"/><rect x="2" y="10" width="5" height="11" rx="1"/>',
  play:'<path d="m7 4 12 8-12 8z"/>',history:'<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6m3-4v6l4 2"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M3 16v5h18v-5"/>',power:'<path d="M12 2v10M7 5a8 8 0 1 0 10 0"/>'
};
function icon(name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'+icons[name]+'</svg>';
}
document.querySelectorAll('[data-icon]').forEach(el => {el.innerHTML = icon(el.dataset.icon);});
const names = {open:"Mano abierta", fist:"Puño cerrado", thumb:"Pulgar arriba"};
const exercises = ["Sentadillas","Zancadas","Curl de bíceps"];
const pad = n => String(n).padStart(2,"0");
const session = {reps:0, set:1, exercise:0, paused:false, elapsed:0, since:Date.now()};
let eventCount = 0;
let lastGesture = "";
const clockText = () => {
  const secs = Math.floor((session.elapsed + (session.paused ? 0 : Date.now()-session.since))/1000);
  return pad(Math.floor(secs/60))+":"+pad(secs%60);
};
setInterval(() => {$("clock").textContent=clockText();}, 500);
function logAction(message, mark="activity") {
  const li = document.createElement("li");
  li.innerHTML = '<span class="log-mark">'+icon(mark)+'</span><span></span><time></time>';
  li.children[1].textContent = message;
  li.lastElementChild.textContent = clockText();
  $("log").prepend(li);
  $("log-count").textContent = ++eventCount + (eventCount===1 ? " evento":" eventos");
}
function renderSession() {
  $("reps").textContent=pad(session.reps);
  $("set").textContent=pad(session.set);
  $("exercise").textContent=exercises[session.exercise];
  $("session-state").innerHTML='<b class="dot"></b>'+ (session.paused ? "Sesión en pausa":"Sesión activa");
  $("session-state").classList.toggle("paused",session.paused);
  [...$("bars").children].forEach((bar,i)=>bar.classList.toggle("filled",i<session.reps));
}
for(let i=0;i<12;i++){
  const bar=document.createElement("b");bar.style.height=(6+i*1.5)+"px";$("bars").append(bar);
}
function nextExercise() {
  session.exercise=(session.exercise+1)%exercises.length;
  session.set=1;session.reps=0;
}
function execute(gesture, source) {
  lastGesture=gesture;
  $("gesture-name").textContent=names[gesture];
  document.querySelectorAll("[data-gesture]").forEach(b=>b.classList.toggle("chosen",b.dataset.gesture===gesture));
  let message;
  if(gesture==="open"){
    nextExercise();
    message="Siguiente ejercicio · "+exercises[session.exercise];
  }else if(gesture==="fist"){
    if(session.paused) session.since=Date.now();
    else session.elapsed+=Date.now()-session.since;
    session.paused=!session.paused;
    message=session.paused?"Serie pausada":"Serie reanudada";
  }else if(session.paused){
    message="Serie en pausa · repetición sin contar";
  }else{
    if(session.reps===12) {
      if(session.set===3) nextExercise();
      else {session.set++;session.reps=0;}
    }
    session.reps++;
    message=exercises[session.exercise]+" · serie "+session.set+" · repetición "+session.reps;
  }
  renderSession();
  logAction(message+" · "+source,gesture==="open"?"hand":gesture);
}
function clearGesture() {
  lastGesture="";
  $("gesture-name").textContent="En espera";
  document.querySelectorAll(".gesture.chosen").forEach(b=>b.classList.remove("chosen"));
}

// Las tres poses comparten los índices anatómicos de MediaPipe Hands.
const poses={
 open:[[283,238],[252,214],[227,193],[209,169],[191,151],[253,146],[246,112],[240,82],[234,60],[277,141],[278,102],[277,70],[276,42],[299,146],[308,111],[315,84],[321,61],[316,159],[332,134],[344,112],[353,94]],
 fist:[[284,235],[246,208],[237,178],[254,165],[279,160],[246,149],[244,127],[255,144],[259,163],[269,141],[269,116],[281,137],[278,157],[293,143],[296,122],[304,141],[297,161],[312,155],[320,137],[326,155],[315,171]],
 thumb:[[284,235],[248,205],[233,169],[231,129],[234,92],[252,148],[250,127],[261,144],[264,164],[273,141],[273,118],[285,137],[281,157],[294,144],[300,124],[308,144],[299,162],[314,157],[322,139],[327,157],[317,173]]
};
const fingers=[[0,1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16],[17,18,19,20]];
const palm=[0,1,5,9,13,17,0];
function drawHand(gesture="open") {
  const p=poses[gesture];
  const coords=ids=>ids.map(i=>p[i].join(",")).join(" ");
  const parts=[];
  // Un contorno translúcido da volumen al esquema; los nodos señalan las articulaciones.
  if(gesture==="open") parts.push('<path d="M266 246 Q253 231 243 218 L216 192 186 158 Q178 144 190 144 Q197 145 204 154 L237 181 Q247 190 246 174 L227 64 Q225 52 233 51 Q240 50 243 63 L261 130 Q263 139 266 130 L268 44 Q269 31 277 32 Q285 33 285 45 L286 129 Q288 140 291 128 L313 62 Q318 49 325 53 Q332 56 327 69 L311 142 Q310 152 316 144 L346 92 Q352 81 359 87 Q365 91 359 102 L333 166 Q330 187 315 208 L298 246 Z" fill="url(#handfill)" stroke="#90caa1" stroke-width="1.3" opacity=".87"/>');
  parts.push('<polygon points="'+coords(palm)+'" fill="#9be3b5" fill-opacity=".09"/>');
  for(const chain of [...fingers,palm]) parts.push('<polyline points="'+coords(chain)+'" fill="none" stroke="#ace8bb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>');
  for(const chain of [[0,5,13,0,9,17],[1,9,13],[2,5],[5,17]]) parts.push('<polyline points="'+coords(chain)+'" fill="none" stroke="#86b99a" opacity=".5" stroke-width=".9"/>');
  p.forEach(([x,y],i)=>{
    parts.push('<circle cx="'+x+'" cy="'+y+'" r="6.4" fill="#b6fac0" opacity=".12"/><circle cx="'+x+'" cy="'+y+'" r="3.45" fill="#c8f9c5" stroke="#264735" stroke-width="1"/>');
    if([0,8,12,20].includes(i)) parts.push('<text x="'+(x+7)+'" y="'+(y-5)+'" fill="#a3c5ab" font-size="8" font-family="monospace">'+pad(i)+'</text>');
  });
  const labels=[[8,"ÍNDICE",164,96],[0,"MUÑECA",381,219]];
  for(const [index,label,x,y] of labels){
    const [px,py]=p[index], left=x<px, edge=x+(left?5:-5);
    parts.push('<path d="M'+px+' '+py+' L'+(edge+(left?18:-18))+' '+y+' H'+edge+'" fill="none" stroke="#759f83" stroke-dasharray="3 3" stroke-width=".8"/><text x="'+x+'" y="'+(y+3)+'" text-anchor="'+(left?"end":"start")+'" font-size="9" letter-spacing="1.3" font-family="monospace" fill="#aec9b3">'+label+'</text>');
  }
  $("drawing").innerHTML=parts.join("");
  $("hand-diagram").setAttribute("aria-label","Modelo simulado · "+names[gesture]+" · 21 puntos");
}
drawHand();renderSession();logAction("Sesión iniciada · simulador listo","power");
document.querySelectorAll("[data-gesture]").forEach(button=>button.addEventListener("click",()=>{
  drawHand(button.dataset.gesture);execute(button.dataset.gesture,"simulador");
}));

const cdn="https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/";
let library, cameraRun=null;
function timeout(task, ms, message) {
  let timer;
  return Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms);})])
    .finally(()=>clearTimeout(timer));
}
function loadHands() {
  if(window.Hands) return Promise.resolve();
  if(!library){
    const tag=document.createElement("script");tag.src=cdn+"hands.js";tag.crossOrigin="anonymous";
    const loaded=new Promise((resolve,reject)=>{
      tag.onload=()=>window.Hands ? resolve() : reject(new Error("Detector no disponible."));
      tag.onerror=()=>reject(new Error("No se pudo cargar MediaPipe. Comprueba la conexión."));
    });
    library=timeout(loaded,18000,"El CDN no ha respondido.").catch(error=>{tag.remove();library=null;throw error;});
    document.head.append(tag);
  }
  return library;
}
function setCameraUI(state,note="") {
  const live=state==="live", sim=state==="sim";
  $("camera").querySelector("span").textContent=live?"Usar simulador":sim?"Activar cámara":"Cancelar";
  $("mode-chip").textContent=live?"Cámara":sim?"Simulador":"Conectando…";
  $("feed-label").textContent=live?"CÁMARA EN DIRECTO":"VISTA SIMULADA";
  $("source-label").textContent=live?"MediaPipe Hands":"Modelo de mano";
  $("frame").hidden=!live;$("hand-diagram").hidden=live;
  $("landmarks").textContent=live?"0 LANDMARKS":"21 LANDMARKS";
  $("camera-note").hidden=!note;$("camera-note").textContent=note;
  $("gesture-help").textContent=live?"Muestra un gesto estable a la cámara.":"Selecciona un gesto para simularlo.";
  document.querySelectorAll("[data-gesture]").forEach(b=>b.disabled=live);
}
function stopCamera(note="") {
  const run=cameraRun;cameraRun=null;
  if(run){
    cancelAnimationFrame(run.raf);
    run.stream?.getTracks().forEach(t=>t.stop());
    $("video").pause();$("video").srcObject=null;
    // Esperar a la inferencia pendiente antes de liberar su contexto WASM.
    Promise.resolve(run.pending).catch(()=>{}).then(()=>run.model?.close()).catch(()=>{});
  }
  clearGesture();drawHand();setCameraUI("sim",note);
}
function classifyHand(p) {
  const dist=(a,b)=>Math.hypot(p[a].x-p[b].x,p[a].y-p[b].y);
  const length=dist(0,9);
  const ratios=[5,9,13,17].map(i=>dist(i,i+3)/Math.max(.001,dist(i,i+1)+dist(i+1,i+2)+dist(i+2,i+3)));
  if(ratios.every(r=>r>.85) && dist(4,5)>length*.42) return "open";
  if(ratios.every(r=>r<.83)){
    if(p[4].y<p[2].y-length*.4 && dist(4,5)>length*.53) return "thumb";
    if(dist(4,5)<length*.76) return "fist";
  }
  return "";
}
function cameraResults(run,results) {
  if(cameraRun!==run) return;
  if(!run.live){run.live=true;clearGesture();setCameraUI("live","Retira o relaja la mano para repetir el mismo gesto.");logAction("Cámara activada · MediaPipe Hands","camera");}
  const frame=$("frame"), ctx=frame.getContext("2d"), video=$("video");
  if(frame.width!==video.videoWidth || frame.height!==video.videoHeight){frame.width=video.videoWidth;frame.height=video.videoHeight;}
  const w=frame.width,h=frame.height;
  ctx.save();ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(results.image,0,0,w,h);
  const points=results.multiHandLandmarks?.[0];
  if(points){
    ctx.strokeStyle="#c2f579";ctx.lineWidth=3;
    for(const chain of [...fingers,palm]){
      ctx.beginPath();
      chain.forEach((i,j)=>{const {x,y}=points[i];if(j)ctx.lineTo(x*w,y*h);else ctx.moveTo(x*w,y*h);});ctx.stroke();
    }
    ctx.fillStyle="#e0ffbc";
    points.forEach(({x,y})=>{ctx.beginPath();ctx.arc(x*w,y*h,4,0,Math.PI*2);ctx.fill();});
  }
  ctx.restore();
  $("landmarks").textContent=(points?21:0)+" LANDMARKS";
  const gesture=points?classifyHand(points.map(p=>({x:p.x*w/h,y:p.y}))):"", now=performance.now();
  if(gesture!==run.candidate){run.candidate=gesture;run.since=now;}
  if(now-run.since>=350 && gesture!==lastGesture) {
    if(gesture) execute(gesture,"cámara");
    else clearGesture();
  }
}
async function startCamera() {
  const run={candidate:"",since:performance.now(),live:false};cameraRun=run;
  setCameraUI("loading","Solicitando permiso para usar la cámara…");
  try {
    if(!navigator.mediaDevices?.getUserMedia) throw new Error("Abre el proyecto en localhost para usar una cámara compatible.");
    const acquire=navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:"user",width:{ideal:640},height:{ideal:480}}}).then(stream=>{
      if(cameraRun!==run) stream.getTracks().forEach(t=>t.stop());
      else run.stream=stream;
    });
    await timeout(acquire,45000,"El permiso de cámara sigue pendiente.");
    if(cameraRun!==run)return;
    run.stream.getVideoTracks()[0].addEventListener("ended",()=>{if(cameraRun===run)stopCamera("Cámara desconectada. Simulador disponible.");});
    $("camera-note").textContent="Cargando el detector de manos…";
    await loadHands();if(cameraRun!==run)return;
    const video=$("video");video.srcObject=run.stream;
    await timeout(video.play(),10000,"La cámara no entrega imágenes.");if(cameraRun!==run)return;
    run.model=new window.Hands({locateFile:file=>cdn+file});
    run.model.setOptions({maxNumHands:1,modelComplexity:0,minDetectionConfidence:.65,minTrackingConfidence:.65});
    run.model.onResults(results=>cameraResults(run,results));
    async function tick(){
      if(cameraRun!==run)return;
      try{
        run.pending=run.model.send({image:video});
        await timeout(run.pending,run.live?10000:30000,"El detector no ha respondido.");
        if(cameraRun===run)run.raf=requestAnimationFrame(tick);
      }catch{if(cameraRun===run)stopCamera("No se ha podido procesar la imagen. Simulador disponible.");}
    }
    tick();
  }catch(error){
    if(cameraRun!==run)return;
    const details={NotAllowedError:"Permiso de cámara denegado.",NotFoundError:"No se ha encontrado una cámara.",NotReadableError:"La cámara está ocupada o no responde."};
    stopCamera((details[error.name]||error.message)+" Simulador disponible.");
  }
}
$("camera").addEventListener("click",()=>cameraRun?stopCamera("Simulador activo."):startCamera());
window.addEventListener("pagehide",()=>{if(cameraRun)stopCamera();});

const storageKey="fittrack.2e.intentos.v1";
const trials=Array.from({length:10},()=>({resultado:null, causa:"", modo:null}));
try{
  const saved=JSON.parse(localStorage.getItem(storageKey));
  if(Array.isArray(saved))trials.forEach((_,i)=>{
    const row=saved[i];
    if(row && ["acierto","fallo"].includes(row.resultado)) trials[i]={resultado:row.resultado,causa:row.resultado==="fallo"?String(row.causa||""):"",modo:row.modo==="cámara"?"cámara":"simulador"};
  });
}catch{/* El registro sigue disponible en memoria. */}
function persistTrials(){
  try{localStorage.setItem(storageKey,JSON.stringify(trials));}
  catch{$("trial-note").textContent="Guardado en memoria. Exporta el JSON antes de cerrar esta página.";}
}
function trialSummary(){
  const registrados=trials.filter(t=>t.resultado).length,aciertos=trials.filter(t=>t.resultado==="acierto").length;
  return {registrados,aciertos,fallos:registrados-aciertos,exitoPorcentaje:registrados?Math.round(1000*aciertos/registrados)/10:null};
}
function renderTrials(){
  const summary=trialSummary();
  $("trial-count").textContent=summary.registrados;$("wins").textContent=summary.aciertos;
  $("rate").textContent=summary.registrados?summary.exitoPorcentaje.toLocaleString("es-ES")+" %":"—";
  $("export").disabled=!summary.registrados;
  [...$("trials").children].forEach((row,i)=>{
    row.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.result===trials[i].resultado)));
    row.querySelector("label").hidden=trials[i].resultado!=="fallo";
    row.querySelector("input").value=trials[i].causa;
  });
}
trials.forEach((trial,i)=>{
  const row=document.createElement("div");row.className="trial";
  row.innerHTML='<strong>Intento '+pad(i+1)+'</strong><button data-result="acierto">Acierto</button><button class="fail" data-result="fallo">Fallo</button><label hidden>Causa del fallo<input placeholder="Poca luz, oclusión, movimiento rápido…" maxlength="250"></label>';
  row.querySelectorAll("button").forEach(b=>{
    b.setAttribute("aria-label",b.textContent+" en el intento "+(i+1));
    b.addEventListener("click",()=>{
      trial.resultado=trial.resultado===b.dataset.result?null:b.dataset.result;
      trial.modo=trial.resultado?(cameraRun?.live?"cámara":"simulador"):null;
      if(trial.resultado!=="fallo")trial.causa="";
      renderTrials();persistTrials();
      if(trial.resultado==="fallo")row.querySelector("input").focus();
    });
  });
  row.querySelector("input").addEventListener("input",event=>{trial.causa=event.target.value;persistTrials();});
  $("trials").append(row);
});
renderTrials();
$("export").addEventListener("click",()=>{
  const report={proyecto:"Gimnasio FitTrack 2.e",autores:["Ángel Armada","Manuel Rojo"],fecha:new Date().toISOString(),...trialSummary(),intentos:trials.map((t,i)=>({intento:i+1,...t}))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:"application/json;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="fittrack-pruebas-2e.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
function route(){
  const hash=location.hash.slice(1);
  const page=["pruebas","guia"].includes(hash)?hash:"panel";
  document.querySelectorAll(".page").forEach(section=>section.hidden=section.id!==page);
  document.querySelectorAll("[data-page]").forEach(a=>{
    if(a.dataset.page===page)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
  });
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",()=>{route();$("main").focus({preventScroll:true});});route();
