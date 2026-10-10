// Terreno: gestión en terreno con login por usuario, roles y asignaciones (Railway Function, Bun + Postgres).
// Variables: DATABASE_URL (Postgres), ACCESS_CODE (clave inicial del administrador "admin"), PORT.

const HTML: string = String.raw`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1E4E8C">
<script>try{var tm=localStorage.getItem('tema');if(tm==='light'||tm==='dark')document.documentElement.setAttribute('data-theme',tm);}catch(e){}</script>
<style>html{color-scheme:light}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
<title>Terreno</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
:root{
  --bg:#EEF1F5; --surface:#FFFFFF; --surface-2:#E1E7EF; --ink:#121A26; --ink-2:#4A5568; --line:#CAD3DF;
  --accent:#1E4E8C; --accent-ink:#FFFFFF;
  --ok:#17703D; --ok-bg:#DBEFE2;
  --info:#0B6E8A; --info-bg:#D6EEF4;
  --warn:#8F5400; --warn-bg:#FBEACA;
  --bad:#B3261E; --bad-bg:#F9DEDC;
  --mute:#4A5568; --mute-bg:#E1E7EF;
  --font-display:'Archivo',system-ui,sans-serif;
  --font-body:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;
  --font-mono:'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --bg:#0E131B; --surface:#171E29; --surface-2:#212A37; --ink:#E6ECF4; --ink-2:#9AA8BA; --line:#2F3A4A;
    --accent:#7FB0F0; --accent-ink:#0A1A30;
    --ok:#6FD08F; --ok-bg:#163A25; --info:#7CCDE3; --info-bg:#12313A;
    --warn:#F0B452; --warn-bg:#3D2D0C; --bad:#F28B82; --bad-bg:#44201D;
    --mute:#9AA8BA; --mute-bg:#212A37; color-scheme:dark;
  }
}
:root[data-theme="dark"]{
  --bg:#0E131B; --surface:#171E29; --surface-2:#212A37; --ink:#E6ECF4; --ink-2:#9AA8BA; --line:#2F3A4A;
  --accent:#7FB0F0; --accent-ink:#0A1A30;
  --ok:#6FD08F; --ok-bg:#163A25; --info:#7CCDE3; --info-bg:#12313A;
  --warn:#F0B452; --warn-bg:#3D2D0C; --bad:#F28B82; --bad-bg:#44201D;
  --mute:#9AA8BA; --mute-bg:#212A37; color-scheme:dark;
}
body{background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:15px;line-height:1.45}
*{box-sizing:border-box}
button,input,textarea,select{font:inherit;color:inherit}
button{cursor:pointer}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
h1,h2,h3,p,ul{margin:0}
ul{padding:0;list-style:none}

#app{max-width:560px;margin-inline:auto;padding-inline:16px;padding-block:0 110px}
.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-block:14px 10px;border-bottom:1px solid var(--line)}
.brand{font-family:var(--font-display);font-weight:800;font-size:24px;letter-spacing:-.01em}
.brand i{font-style:normal;color:var(--accent)}
.today{font-family:var(--font-mono);font-size:12px;color:var(--ink-2);text-transform:uppercase;letter-spacing:.04em}
.top-r{display:flex;align-items:center;gap:10px}
.theme-btn{display:inline-flex;align-items:center;gap:6px;height:32px;padding-inline:10px;border:1px solid var(--line);border-radius:99px;background:var(--surface);color:var(--ink-2);font-size:12px;font-weight:600}
.theme-btn:hover{color:var(--ink);border-color:var(--ink-2)}
.theme-btn svg{flex:none}
#view{padding-block:16px;display:flex;flex-direction:column;gap:16px}

.h1{font-family:var(--font-display);font-weight:700;font-size:20px;letter-spacing:-.005em;text-wrap:balance}
.muted{color:var(--ink-2)}
.small{font-size:13px}
.mono{font-family:var(--font-mono);font-variant-numeric:tabular-nums}

.sum-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.sum-n{font-size:13px;color:var(--ink-2);font-variant-numeric:tabular-nums}
.sum-n b{color:var(--ink);font-family:var(--font-display);font-size:18px}
.bar{display:flex;height:8px;border-radius:99px;overflow:hidden;background:var(--surface-2);margin-top:10px;gap:2px}
.bar span{display:block;min-width:0;height:100%}
.s-pendiente{background:var(--line)} .s-gestionado{background:var(--ok)} .s-parcial{background:var(--info)} .s-reprogramado{background:var(--warn)} .s-nogestionado{background:var(--bad)}

.tools{display:flex;flex-direction:column;gap:10px}
.search{width:100%;height:44px;border:1px solid var(--line);border-radius:8px;background:var(--surface);padding-inline:12px}
.filters{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-inline:-16px;padding-inline:16px;scrollbar-width:none}
.filters::-webkit-scrollbar{display:none}
.fchip{flex:none;display:inline-flex;align-items:center;gap:6px;height:34px;padding-inline:12px;border:1px solid var(--line);border-radius:99px;background:var(--surface);font-size:13px;font-weight:500;white-space:nowrap}
.fchip[aria-pressed="true"]{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.fchip .n{font-family:var(--font-mono);font-size:12px;opacity:.8}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex:none}

.lista{display:flex;flex-direction:column;gap:10px}
.user{width:100%;text-align:left;display:flex;flex-direction:column;gap:6px;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px;min-height:44px}
.user:active{background:var(--surface-2)}
.user.flash{animation:flash 1.6s ease-out}
@keyframes flash{0%{box-shadow:0 0 0 3px var(--accent)}100%{box-shadow:0 0 0 3px transparent}}
.row{display:flex;justify-content:space-between;align-items:center;gap:10px}
.folio{font-family:var(--font-mono);font-size:12px;color:var(--ink-2);letter-spacing:.03em}
.u-name{font-family:var(--font-display);font-weight:700;font-size:17px;min-width:0;overflow-wrap:anywhere}
.u-dir{font-size:13px;color:var(--ink-2);overflow-wrap:anywhere}
.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px}
.tag{font-size:12px;font-weight:500;padding:2px 8px;border-radius:4px;background:var(--surface-2);color:var(--ink-2)}
.chip{display:inline-flex;align-items:center;gap:6px;flex:none;font-size:12px;font-weight:600;padding:3px 10px 3px 8px;border-radius:99px;white-space:nowrap}
.c-pendiente{background:var(--mute-bg);color:var(--mute)} .c-pendiente .dot{background:var(--mute)}
.c-gestionado{background:var(--ok-bg);color:var(--ok)} .c-gestionado .dot{background:var(--ok)}
.c-parcial{background:var(--info-bg);color:var(--info)} .c-parcial .dot{background:var(--info)}
.c-reprogramado{background:var(--warn-bg);color:var(--warn)} .c-reprogramado .dot{background:var(--warn)}
.c-nogestionado{background:var(--bad-bg);color:var(--bad)} .c-nogestionado .dot{background:var(--bad)}
.empty{padding:28px 12px;text-align:center;color:var(--ink-2);border:1px dashed var(--line);border-radius:8px}
.foot{font-size:12px;color:var(--ink-2);text-align:center}

.back{align-self:flex-start;background:none;border:0;padding:8px 4px 8px 0;font-weight:600;color:var(--accent);min-height:44px;display:inline-flex;align-items:center;gap:6px}
.ficha{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:8px}
.ficha h1{font-family:var(--font-display);font-weight:800;font-size:22px;line-height:1.15;overflow-wrap:anywhere}
.asig{font-size:13px;color:var(--ink-2);border-top:1px dashed var(--line);padding-top:8px}
.asig b{color:var(--ink)}
.note{font-size:13px;padding:10px 12px;border-radius:8px;background:var(--warn-bg);color:var(--warn)}
form{display:flex;flex-direction:column;gap:20px}
fieldset{border:0;padding:0;margin:0;min-width:0;display:flex;flex-direction:column;gap:14px}
legend{padding:0;margin-bottom:10px;font-family:var(--font-display);font-weight:700;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-2)}
.field{display:flex;flex-direction:column;gap:6px;min-width:0}
.field>label,.field>.lab{font-weight:600;font-size:14px}
.req{font-weight:500;font-size:12px;color:var(--ink-2);margin-left:6px}
.input,.area{width:100%;border:1px solid var(--line);border-radius:8px;background:var(--surface);padding:10px 12px;min-height:44px}
.area{min-height:84px;resize:vertical}
.field.bad .input,.field.bad .area,.field.bad .opts,.field.bad .drop,.field.bad .geo{border-color:var(--bad)}
.err{font-size:13px;color:var(--bad);font-weight:500}
.segs{display:flex;gap:8px;flex-wrap:wrap}
.seg{position:relative}
.seg input,.opt input,.visually-hidden{position:absolute;opacity:0;width:1px;height:1px;overflow:hidden;pointer-events:none}
.seg span{display:inline-flex;align-items:center;min-height:44px;padding-inline:16px;border:1px solid var(--line);border-radius:8px;background:var(--surface);font-weight:500}
.seg input:checked+span{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);font-weight:600}
.seg input:focus-visible+span,.opt input:focus-visible+.opt-b{outline:2px solid var(--accent);outline-offset:2px}
.opts{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--surface)}
.opt{position:relative;display:block;border-top:1px solid var(--line)}
.opt:first-child{border-top:0}
.opt-b{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 12px;min-height:48px}
.opt-t{font-weight:500}
.opt input:checked+.opt-b{background:var(--surface-2)}
.opt input:checked+.opt-b .opt-t{font-weight:700}
.radio{width:18px;height:18px;border-radius:50%;border:2px solid var(--line);flex:none;display:grid;place-items:center;margin-right:2px}
.opt input:checked+.opt-b .radio{border-color:var(--accent)}
.opt input:checked+.opt-b .radio::after{content:"";width:8px;height:8px;border-radius:50%;background:var(--accent)}
.opt-l{display:flex;align-items:center;gap:10px;min-width:0}
.hint{font-size:12px;color:var(--ink-2)}

.drop{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:120px;border:2px dashed var(--line);border-radius:10px;background:var(--surface);text-align:center;padding:16px;cursor:pointer;font-weight:600}
.drop svg{color:var(--accent)}
.drop:has(input:focus-visible){outline:2px solid var(--accent);outline-offset:2px}
.photo{display:flex;flex-direction:column;gap:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:10px}
.photo img{display:block;width:100%;max-height:300px;object-fit:contain;background:var(--surface-2);border-radius:6px}
.photo-info{font-family:var(--font-mono);font-size:12px;color:var(--ink-2);font-variant-numeric:tabular-nums}
.btns{display:flex;gap:8px;flex-wrap:wrap}
.btn2{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding-inline:14px;border:1px solid var(--line);border-radius:8px;background:var(--surface);font-weight:600;font-size:14px}
.btn2.main{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.btn2:disabled{opacity:.6;cursor:progress}
.geo{display:flex;flex-direction:column;gap:10px;border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:12px}
.coords{font-family:var(--font-mono);font-size:17px;font-weight:500;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.src{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:2px 6px;border-radius:4px;background:var(--surface-2);color:var(--ink-2)}
.manual{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.manual .input{font-family:var(--font-mono)}
.status-line{font-size:13px;color:var(--ink-2)}
.summary{border:1px solid var(--bad);background:var(--bad-bg);color:var(--bad);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px;font-size:14px}
.summary b{font-weight:700}
.summary button{background:none;border:0;padding:4px 0;text-align:left;color:inherit;text-decoration:underline;font-size:14px;min-height:32px}

.actionbar,.tabs{position:fixed;left:0;right:0;bottom:0;z-index:10;background:var(--bg);border-top:1px solid var(--line);padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px))}
.actionbar>div,.tabs>div{max-width:560px;margin-inline:auto;display:flex;gap:8px}
.go{flex:1;min-height:50px;border:0;border-radius:8px;background:var(--accent);color:var(--accent-ink);font-family:var(--font-display);font-weight:700;font-size:17px;letter-spacing:.02em}
.go:disabled{opacity:.6}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;min-height:48px;background:none;border:0;border-radius:8px;font-size:12px;font-weight:600;color:var(--ink-2)}
.tab[aria-current="page"]{color:var(--accent);background:var(--surface-2)}
.toast{position:fixed;left:16px;right:16px;bottom:calc(84px + env(safe-area-inset-bottom,0px));max-width:528px;margin-inline:auto;z-index:20;background:var(--ink);color:var(--bg);padding:12px 14px;border-radius:8px;font-weight:500;box-shadow:0 6px 24px rgba(0,0,0,.25)}

.hist{display:flex;flex-direction:column;gap:10px}
.hist details{background:var(--surface);border:1px solid var(--line);border-radius:8px}
.hist summary{list-style:none;display:flex;gap:12px;align-items:center;padding:10px;cursor:pointer;min-height:64px}
.hist summary::-webkit-details-marker{display:none}
.thumb{width:56px;height:56px;border-radius:6px;object-fit:cover;background:var(--surface-2);flex:none}
.h-main{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
.h-main .u-name{font-size:15px}
.h-body{padding:0 12px 12px;display:flex;flex-direction:column;gap:10px;border-top:1px dashed var(--line);padding-top:12px}
.h-body img{width:100%;max-height:340px;object-fit:contain;background:var(--surface-2);border-radius:6px}
dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:13px}
dt{color:var(--ink-2)} dd{margin:0;overflow-wrap:anywhere}
.link{color:var(--accent);font-weight:600}
.reset{margin-top:8px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.btn-danger{min-height:44px;padding-inline:14px;border:1px solid var(--bad);color:var(--bad);background:transparent;border-radius:8px;font-weight:600}
.btn-danger.arm{background:var(--bad);color:var(--bg)}
.sum-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
.btn-s{min-height:38px;font-size:13px}
@media (prefers-reduced-motion:reduce){.user.flash{animation:none}}
@media (max-width:380px){.manual{grid-template-columns:1fr}}

.sel{width:100%;min-height:44px;border:1px solid var(--line);border-radius:8px;background:var(--surface);padding:8px 10px}
.tag.warn{background:var(--warn-bg);color:var(--warn)}
.tag.ok{background:var(--ok-bg);color:var(--ok)}
.tag.bad{background:var(--bad-bg);color:var(--bad)}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px}
.arow{display:flex;flex-direction:column;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:8px;padding:12px 14px}
.arow label{font-size:12px;font-weight:600;color:var(--ink-2)}
.cred{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-family:var(--font-mono);font-size:16px;font-variant-numeric:tabular-nums;background:var(--surface-2);border-radius:8px;padding:12px;overflow-wrap:anywhere}
.cred dt{font-family:var(--font-body);font-size:13px}
.cred dd{margin:0;font-weight:500;user-select:all}
.tab{min-width:0}
.acct{display:flex;flex-direction:column;gap:8px;align-items:flex-start;margin-top:8px}
</style>
</head>
<body>
<div id="app">
  <header class="top">
    <div class="brand">Terreno<i>.</i></div>
    <div class="top-r">
      <div class="today" id="today"></div>
      <button class="theme-btn" id="theme-btn" type="button"></button>
    </div>
  </header>
  <main id="view"></main>
</div>
<nav class="tabs" id="tabs" aria-label="Secciones" hidden>
  <div id="tabs-in"></div>
</nav>
<div id="actionbar" class="actionbar" hidden>
  <div><button class="go" type="submit" form="f" id="gestionar">Gestionar</button></div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

<script>
(function(){
'use strict';

var ESTADOS = {
  pendiente:    {label:'Pendiente'},
  gestionado:   {label:'Gestionado'},
  parcial:      {label:'Parcial'},
  reprogramado: {label:'Reprogramado'},
  nogestionado: {label:'No gestionado'}
};
var ORDEN = ['pendiente','reprogramado','parcial','nogestionado','gestionado'];
var SALIDAS = [
  {id:'completa',    label:'Completada conforme',      to:'gestionado',   obs:false, fecha:false, persona:true},
  {id:'parcial',     label:'Completada parcialmente',  to:'parcial',      obs:true,  fecha:false, persona:true},
  {id:'ausente',     label:'Persona ausente',          to:'reprogramado', obs:true,  fecha:true,  persona:false},
  {id:'reprogramar', label:'Reprogramar a pedido',     to:'reprogramado', obs:true,  fecha:true,  persona:false},
  {id:'direccion',   label:'Dirección no encontrada',  to:'nogestionado', obs:true,  fecha:false, persona:false},
  {id:'rechazada',   label:'Rechazada por la persona', to:'nogestionado', obs:true,  fecha:false, persona:false}
];
var TIPOS = ['Entrega','Retiro'];
var OBJETOS = ['Elemento','Documento','Información'];

function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function pad(n){return String(n).padStart(2,'0');}
function isoDate(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function hoy(){return isoDate(new Date());}
function fmtFecha(iso){
  try{return new Date(iso).toLocaleString('es-CL',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}catch(e){return iso;}
}
function fmtDia(iso){
  try{var p=iso.split('-');return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('es-CL',{weekday:'short',day:'numeric',month:'short'});}catch(e){return iso;}
}
function fmtBytes(b){return b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';}
function chip(e){return '<span class="chip c-'+e+'"><span class="dot"></span>'+esc(ESTADOS[e].label)+'</span>';}
function salidaDe(id){for(var i=0;i<SALIDAS.length;i++){if(SALIDAS[i].id===id)return SALIDAS[i];}return null;}
function genClave(){
  var a='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789',o='',b=new Uint8Array(10);
  crypto.getRandomValues(b);
  for(var i=0;i<10;i++)o+=a[b[i]%a.length];
  return o;
}

var state={me:null,dest:[],visits:[],equipo:[]};
var ui={view:'list',filter:'todos',q:'',sel:null,flash:null,aq:'',af:'sin',openEq:null,cred:null,forzada:false};
var draft=null;
var view=$('#view');
function lsGet(k){try{return localStorage.getItem(k)||'';}catch(e){return '';}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function esAdmin(){return !!state.me&&state.me.rol==='admin';}

function api(path,body){
  var opt={credentials:'same-origin',headers:{}};
  if(body!==undefined){opt.method='POST';opt.headers['content-type']='application/json';opt.body=JSON.stringify(body);}
  return fetch(path,opt).then(function(r){
    return r.json().catch(function(){return {};}).then(function(d){
      if(r.ok)return d;
      var e=new Error(d.mensaje||'Error del servidor');
      e.status=r.status;e.data=d;
      e.cambiar=!!d.cambiarClave;
      e.auth=(r.status===401&&path!=='/api/entrar');
      throw e;
    });
  },function(){var e=new Error('Sin conexión con el servidor');e.red=true;throw e;});
}
function cargarTodo(){
  var ps=[api('/api/destinatarios'),api('/api/visitas')];
  if(esAdmin())ps.push(api('/api/equipo'));
  return Promise.all(ps).then(function(r){
    state.dest=r[0].destinatarios;state.visits=r[1].visitas;state.equipo=r[2]?r[2].equipo:[];
  });
}
function enlazar(root){
  $$('.field[data-f]',root).forEach(function(f){
    var c=$('input:not([type=radio]):not([type=file]),textarea,select',f),l=$('.lab',f);
    if(c&&l&&!c.getAttribute('aria-labelledby'))c.setAttribute('aria-labelledby',l.id);
  });
}

var toastTimer=null;
function toast(msg){
  var t=$('#toast');t.textContent=msg;t.hidden=false;
  clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.hidden=true;},4500);
}

/* ---------- Navegación ---------- */
var ICONS={
  list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>',
  asignar:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M18 8v6M15 11h6"/>',
  equipo:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.5 2.4 3.5 5.5"/>',
  hist:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
var SIN_TABS={form:1,login:1,nuevo:1,clave:1,eqnuevo:1,cred:1};
var AB={form:['f','Gestionar'],nuevo:['fn','Guardar destinatario'],eqnuevo:['fe','Crear acceso']};
function renderTabs(){
  var items=[['list','Visitas']];
  if(esAdmin()){items.push(['asignar','Asignar']);items.push(['equipo','Equipo']);}
  items.push(['hist','Historial']);
  $('#tabs-in').innerHTML=items.map(function(it){
    return '<button class="tab" data-tab="'+it[0]+'" type="button"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[it[0]]+'</svg>'+it[1]+'</button>';
  }).join('');
}
function go(v){
  ui.view=v;
  var sinTabs=!!SIN_TABS[v]||!state.me;
  $('#tabs').hidden=sinTabs;
  if(!sinTabs)renderTabs();
  var ab=AB[v],gb=$('#gestionar');
  $('#actionbar').hidden=!ab;
  if(ab){gb.setAttribute('form',ab[0]);gb.textContent=ab[1];gb.disabled=false;}
  $$('.tab').forEach(function(b){
    if(b.dataset.tab===v)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });
  render();
  window.scrollTo(0,0);
}
function render(){
  var m={list:renderList,hist:renderHist,login:renderLogin,nuevo:renderNuevo,asignar:renderAsignar,equipo:renderEquipo,eqnuevo:renderEqNuevo,clave:renderClave,cred:renderCred,form:renderForm};
  (m[ui.view]||renderList)();
}
function fallaAuth(e){
  if(e.auth){state.me=null;go('login');return true;}
  if(e.cambiar){ui.forzada=true;go('clave');return true;}
  return false;
}
function refrescar(avisar){
  return cargarTodo().then(function(){
    if(ui.view==='list'||ui.view==='hist'||ui.view==='asignar'||ui.view==='equipo')render();
    if(avisar)toast('Datos actualizados.');
  }).catch(function(e){
    if(fallaAuth(e))return;
    if(avisar)toast(e.message+'. Revisa tu conexión.');
  });
}
$('#tabs').addEventListener('click',function(e){
  var b=e.target.closest('[data-tab]');
  if(!b)return;
  go(b.dataset.tab);refrescar(false);
});
/* ---------- Tema: automático / claro / oscuro ---------- */
var TEMAS={auto:{lab:'Auto',sig:'light',ico:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>'},
  light:{lab:'Claro',sig:'dark',ico:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'},
  dark:{lab:'Oscuro',sig:'auto',ico:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'}};
function aplicarTema(tm){
  if(!TEMAS[tm])tm='auto';
  var root=document.documentElement;
  if(tm==='auto')root.removeAttribute('data-theme');else root.setAttribute('data-theme',tm);
  var oscuro=tm==='dark'||(tm==='auto'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  var mc=document.querySelector('meta[name="theme-color"]');if(mc)mc.setAttribute('content',oscuro?'#0E131B':'#1E4E8C');
  var b=$('#theme-btn'),t=TEMAS[tm];
  b.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+t.ico+'</svg>'+t.lab;
  b.setAttribute('aria-label','Tema: '+t.lab+'. Cambiar a '+TEMAS[t.sig].lab);
  b.dataset.tema=tm;
}
aplicarTema(lsGet('tema')||'auto');
$('#theme-btn').addEventListener('click',function(){
  var sig=TEMAS[this.dataset.tema||'auto'].sig;
  lsSet('tema',sig==='auto'?'':sig);aplicarTema(sig);
});
try{window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){aplicarTema(lsGet('tema')||'auto');});}catch(e){}
try{$('#today').textContent=new Date().toLocaleDateString('es-CL',{weekday:'short',day:'numeric',month:'short'}).replace('.','');}catch(e){}

/* ---------- Formularios: helpers ---------- */
function radios(name,list,sel){
  return '<div class="segs" role="radiogroup">'+list.map(function(v){
    var val=v,lab=v;
    if(v&&typeof v==='object'){val=v[0];lab=v[1];}
    return '<label class="seg"><input type="radio" name="'+name+'" value="'+esc(val)+'"'+(val===sel?' checked':'')+'><span>'+esc(lab)+'</span></label>';
  }).join('')+'</div>';
}
function fld(key,label,inner){
  return '<div class="field" data-f="'+key+'"><span class="lab" id="l-'+key+'">'+label+'<span class="req" data-req="'+key+'"></span></span>'+inner+'<p class="err" id="e-'+key+'" role="alert" hidden></p></div>';
}
function campoEl(k){return $('[data-f="'+k+'"]');}
function ponError(k,msg){
  var el=campoEl(k);if(!el)return;
  el.classList.add('bad');
  var p=$('#e-'+k);if(p){p.textContent=msg;p.hidden=false;}
}
function limpiaError(k){
  var el=campoEl(k);if(!el)return;
  el.classList.remove('bad');
  var p=$('#e-'+k);if(p){p.hidden=true;p.textContent='';}
  var sum=$('#sum');
  if(sum&&!sum.hidden){
    var b=$('[data-key="'+k+'"]',sum);if(b)b.remove();
    var resto=$$('[data-key]',sum).length;
    if(!resto)sum.hidden=true;else $('#sum-n').textContent=resto===1?'Falta 1 dato':'Faltan '+resto+' datos';
  }
}
function limpiaTodo(){
  $$('.field.bad').forEach(function(el){el.classList.remove('bad');});
  $$('.err').forEach(function(p){p.hidden=true;p.textContent='';});
}
function irA(k){
  var el=campoEl(k);if(!el)return;
  el.scrollIntoView({behavior:'smooth',block:'center'});
  var t=$('input,textarea,select,button',el);if(t){try{t.focus({preventScroll:true});}catch(e){}}
}
function erroresServidor(e){
  if(e.data&&e.data.errores){
    var ks=Object.keys(e.data.errores);
    ks.forEach(function(k){ponError(k,e.data.errores[k]);});
    if(ks.length)irA(ks[0]);
    return true;
  }
  return false;
}
var BACK='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';

/* ---------- Ingreso ---------- */
function renderLogin(){
  view.innerHTML=
    '<section class="ficha"><h1>Ingresar a Terreno</h1><p class="u-dir">Usa tu usuario y clave. Si no los tienes, pídelos a tu administrador.</p></section>'+
    '<form id="fl" novalidate>'+
      fld('login','Usuario','<input id="login" name="login" class="input" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" value="'+esc(lsGet('terreno.login'))+'">')+
      fld('clave','Clave','<input id="clave" name="clave" class="input" type="password" autocomplete="current-password">')+
      '<button class="go" type="submit" id="entrar">Ingresar</button>'+
    '</form>';
  enlazar(view);
  var f=$('#fl');
  f.addEventListener('input',function(e){if(e.target.name)limpiaError(e.target.name);});
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var l=f.elements.login.value.trim().toLowerCase(),c=f.elements.clave.value,bad=false;
    limpiaTodo();
    if(!l){ponError('login','Escribe tu usuario.');bad=true;}
    if(!c){ponError('clave','Escribe tu clave.');bad=true;}
    if(bad)return;
    var b=$('#entrar');b.disabled=true;b.textContent='Ingresando…';
    api('/api/entrar',{login:l,clave:c}).then(function(r){
      lsSet('terreno.login',l);state.me=r.usuario;return iniciar();
    }).catch(function(e){
      b.disabled=false;b.textContent='Ingresar';
      ponError('clave',e.status===429?'Demasiados intentos. Espera unos minutos.':e.status===401?'Usuario o clave incorrectos.':e.message);
    });
  });
}

/* ---------- Cambio de clave ---------- */
function renderClave(){
  var f0=ui.forzada;
  view.innerHTML=
    (f0?'':'<button type="button" class="back" id="volver">'+BACK+'Historial</button>')+
    '<section class="ficha"><h1>'+(f0?'Define tu nueva clave':'Cambiar clave')+'</h1><p class="u-dir">'+(f0?'Tu clave es temporal. Elige una propia para continuar.':'Mínimo 8 caracteres.')+'</p></section>'+
    '<form id="fc" novalidate>'+
      fld('actual','Clave actual','<input id="actual" name="actual" class="input" type="password" autocomplete="current-password">')+
      fld('nueva','Clave nueva','<input id="nueva" name="nueva" class="input" type="password" autocomplete="new-password">')+
      fld('rep','Repite la clave nueva','<input id="rep" name="rep" class="input" type="password" autocomplete="new-password">')+
      '<button class="go" type="submit" id="guardar-clave">Guardar clave</button>'+
      (f0?'<button type="button" class="btn2" id="salir2">Cerrar sesión</button>':'')+
    '</form>';
  enlazar(view);
  if(!f0)$('#volver').addEventListener('click',function(){go('hist');});
  if(f0)$('#salir2').addEventListener('click',salir);
  var f=$('#fc');
  f.addEventListener('input',function(e){if(e.target.name)limpiaError(e.target.name);});
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var a=f.elements.actual.value,n=f.elements.nueva.value,r=f.elements.rep.value,bad=false;
    limpiaTodo();
    if(!a){ponError('actual','Escribe tu clave actual.');bad=true;}
    if(n.length<8){ponError('nueva','La clave nueva debe tener al menos 8 caracteres.');bad=true;}
    else if(n===a){ponError('nueva','La clave nueva debe ser distinta de la actual.');bad=true;}
    if(r!==n){ponError('rep','Las claves no coinciden.');bad=true;}
    if(bad)return;
    var b=$('#guardar-clave');b.disabled=true;b.textContent='Guardando…';
    api('/api/clave',{actual:a,nueva:n}).then(function(){
      ui.forzada=false;if(state.me)state.me.debeCambiar=false;
      toast('Clave actualizada.');
      return iniciar();
    }).catch(function(e){
      b.disabled=false;b.textContent='Guardar clave';
      if(e.auth){fallaAuth(e);return;}
      if(!erroresServidor(e))toast(e.red?'Sin conexión. Intenta de nuevo.':e.message);
    });
  });
}
function salir(){
  api('/api/salir',{}).catch(function(){}).then(function(){
    state={me:null,dest:[],visits:[],equipo:[]};ui.forzada=false;ui.filter='todos';ui.q='';go('login');
  });
}

/* ---------- Lista de visitas ---------- */
function conteo(){
  var c={todos:state.dest.length,sinasignar:0};
  ORDEN.forEach(function(k){c[k]=0;});
  state.dest.forEach(function(u){c[u.estado]=(c[u.estado]||0)+1;if(!u.asignadoA)c.sinasignar++;});
  return c;
}
function renderList(){
  var c=conteo(),admin=esAdmin();
  var seg=ORDEN.map(function(k){return c[k]?'<span class="s-'+k+'" style="flex:'+c[k]+' 1 0" title="'+esc(ESTADOS[k].label)+': '+c[k]+'"></span>':'';}).join('');
  var chips='<button type="button" class="fchip" data-filter="todos" aria-pressed="'+(ui.filter==='todos')+'">Todos <span class="n">'+c.todos+'</span></button>'+
    (admin?'<button type="button" class="fchip" data-filter="sinasignar" aria-pressed="'+(ui.filter==='sinasignar')+'">Sin asignar <span class="n">'+c.sinasignar+'</span></button>':'')+
    ORDEN.map(function(k){return '<button type="button" class="fchip" data-filter="'+k+'" aria-pressed="'+(ui.filter===k)+'"><span class="dot s-'+k+'"></span>'+esc(ESTADOS[k].label)+' <span class="n">'+c[k]+'</span></button>';}).join('');
  view.innerHTML=
    '<section><div class="sum-top"><h1 class="h1">'+(admin?'Todas las visitas':'Mis visitas')+'</h1><p class="sum-n"><b>'+c.gestionado+'</b> de '+state.dest.length+' gestionadas</p></div>'+
    '<div class="bar" role="img" aria-label="Avance de gestión">'+seg+'</div><div class="sum-actions">'+(admin?'<button type="button" class="btn2 btn-s" data-nuevo="1">+ Destinatario</button>':'')+'<button type="button" class="btn2 btn-s" data-refrescar="1">Actualizar</button></div></section>'+
    '<div class="tools"><input id="q" class="search" type="search" placeholder="Buscar por nombre, folio o dirección" value="'+esc(ui.q)+'" aria-label="Buscar destinatario"><div class="filters" role="group" aria-label="Filtrar por estado de gestión">'+chips+'</div></div>'+
    '<ul class="lista" id="lista"></ul>';
  pintaLista();
}
function pintaLista(){
  var q=ui.q.trim().toLowerCase(),admin=esAdmin();
  var items=state.dest.filter(function(u){
    if(ui.filter==='sinasignar'){if(u.asignadoA)return false;}
    else if(ui.filter!=='todos'&&u.estado!==ui.filter)return false;
    if(!q)return true;
    return (u.nombre+' '+u.folio+' '+u.dir).toLowerCase().indexOf(q)>-1;
  });
  var ul=$('#lista');
  if(!items.length){
    var msg=state.dest.length?'Ningún destinatario coincide con el filtro.':(admin?'Aún no hay destinatarios. Agrega el primero con “+ Destinatario”.':'No tienes visitas asignadas. Pide a tu administrador que te asigne.');
    ul.innerHTML='<li class="empty">'+msg+'</li>';return;
  }
  ul.innerHTML=items.map(function(u){
    var extra=(u.estado==='reprogramado'&&u.fechaNueva)?'<span class="tag">Nueva visita: '+esc(fmtDia(u.fechaNueva))+'</span>':'';
    var asig=admin?(u.asignadoA?'<span class="tag ok">'+esc(u.asignadoNombre||'Asignado')+'</span>':'<span class="tag warn">Sin asignar</span>'):'';
    return '<li><button type="button" class="user'+(ui.flash===u.id?' flash':'')+'" data-id="'+esc(u.id)+'">'+
      '<span class="row"><span class="folio">'+esc(u.folio)+'</span>'+chip(u.estado)+'</span>'+
      '<span class="u-name">'+esc(u.nombre)+'</span>'+
      '<span class="u-dir">'+esc(u.dir)+'</span>'+
      '<span class="tags"><span class="tag">'+esc(u.tipo)+'</span><span class="tag">'+esc(u.objeto)+'</span>'+asig+extra+'</span>'+
    '</button></li>';
  }).join('');
  ui.flash=null;
}
function buscar(id){for(var i=0;i<state.dest.length;i++){if(String(state.dest[i].id)===String(id))return state.dest[i];}return null;}
function nuevoDraft(u){return {tipo:u.tipo,objeto:u.objeto,detalle:u.detalle,salida:'',contacto:'',obs:'',fecha:'',foto:null,geo:null,manual:false,geoMsg:''};}
view.addEventListener('input',function(e){
  if(ui.view==='list'&&e.target.id==='q'){ui.q=e.target.value;pintaLista();}
  if(ui.view==='asignar'&&e.target.id==='aq'){ui.aq=e.target.value;pintaAsignar();}
});
view.addEventListener('click',function(e){
  if(ui.view==='list'){
    if(e.target.closest('[data-nuevo]')){go('nuevo');return;}
    if(e.target.closest('[data-refrescar]')){refrescar(true);return;}
    var f=e.target.closest('[data-filter]');
    if(f){ui.filter=f.dataset.filter;renderList();return;}
    var u=e.target.closest('[data-id]');
    if(u){var us=buscar(u.dataset.id);if(!us)return;ui.sel=u.dataset.id;draft=nuevoDraft(us);go('form');return;}
  }else if(ui.view==='asignar'){
    if(e.target.closest('[data-masivo]'))asignarVisibles();
  }else if(ui.view==='equipo'){
    clickEquipo(e);
  }
});
view.addEventListener('change',function(e){
  if(ui.view==='asignar'){
    if(e.target.id==='af'){ui.af=e.target.value;pintaAsignar();}
    else if(e.target.matches('[data-asig]'))asignarUno(e.target);
  }
});
view.addEventListener('click',function(e){if(e.target.closest('[data-reintentar]'))iniciar();});

/* ---------- Asignar (administrador) ---------- */
function gestoresActivos(){return state.equipo.filter(function(u){return u.activo;});}
function optsGestores(sel,vacio){
  return '<option value="">'+esc(vacio)+'</option>'+gestoresActivos().map(function(g){
    return '<option value="'+g.id+'"'+(String(sel)===String(g.id)?' selected':'')+'>'+esc(g.nombre)+(g.rol==='admin'?' (admin)':'')+'</option>';
  }).join('');
}
function renderAsignar(){
  if(!esAdmin()){go('list');return;}
  var c=conteo();
  var fopts='<option value="sin"'+(ui.af==='sin'?' selected':'')+'>Sin asignar ('+c.sinasignar+')</option><option value="todos"'+(ui.af==='todos'?' selected':'')+'>Todos ('+c.todos+')</option>'+
    gestoresActivos().map(function(g){return '<option value="g'+g.id+'"'+(ui.af==='g'+g.id?' selected':'')+'>'+esc(g.nombre)+' ('+g.asignados+')</option>';}).join('');
  view.innerHTML=
    '<section><div class="sum-top"><h1 class="h1">Asignar visitas</h1><p class="sum-n"><b>'+c.sinasignar+'</b> sin asignar</p></div></section>'+
    (gestoresActivos().length?'':'<p class="note">Primero crea los usuarios de acceso en la pestaña Equipo. Después podrás asignarles destinatarios.</p>')+
    '<div class="panel"><div class="field"><label class="lab" for="af">Ver</label><select id="af" class="sel">'+fopts+'</select></div>'+
      '<input id="aq" class="search" type="search" placeholder="Buscar por nombre, folio o dirección" value="'+esc(ui.aq)+'" aria-label="Buscar destinatario">'+
      '<div class="field"><label class="lab" for="amas">Asignar todos los de esta lista a</label><select id="amas" class="sel">'+optsGestores('','Elige un usuario')+'</select></div>'+
      '<button type="button" class="btn2 main" data-masivo="1" id="bmas">Asignar</button></div>'+
    '<ul class="lista" id="alista"></ul>';
  pintaAsignar();
}
function visiblesAsignar(){
  var q=ui.aq.trim().toLowerCase();
  return state.dest.filter(function(u){
    if(ui.af==='sin'){if(u.asignadoA)return false;}
    else if(ui.af.charAt(0)==='g'){if(String(u.asignadoA)!==ui.af.slice(1))return false;}
    if(!q)return true;
    return (u.nombre+' '+u.folio+' '+u.dir).toLowerCase().indexOf(q)>-1;
  });
}
function pintaAsignar(){
  var items=visiblesAsignar(),ul=$('#alista');
  if(!ul)return;
  var b=$('#bmas');if(b)b.textContent=items.length?'Asignar '+items.length+(items.length===1?' destinatario':' destinatarios'):'Asignar';
  if(!items.length){ul.innerHTML='<li class="empty">'+(ui.af==='sin'&&!ui.aq?'Todo está asignado.':'No hay destinatarios en esta lista.')+'</li>';return;}
  ul.innerHTML=items.map(function(u){
    return '<li class="arow"><div class="row"><span class="folio">'+esc(u.folio)+'</span>'+chip(u.estado)+'</div>'+
      '<span class="u-name">'+esc(u.nombre)+'</span><span class="u-dir">'+esc(u.dir)+'</span>'+
      '<label for="as-'+u.id+'">Asignado a</label><select class="sel" id="as-'+u.id+'" data-asig="'+u.id+'">'+optsGestores(u.asignadoA,'Sin asignar')+'</select></li>';
  }).join('');
}
function aplicaAsignacion(rows){
  rows.forEach(function(r){
    for(var i=0;i<state.dest.length;i++){if(state.dest[i].id===r.id){state.dest[i]=r;break;}}
  });
  return api('/api/equipo').then(function(d){state.equipo=d.equipo;});
}
function asignarUno(sel){
  var id=parseInt(sel.dataset.asig,10),g=sel.value?parseInt(sel.value,10):null;
  sel.disabled=true;
  api('/api/asignar',{ids:[id],gestorId:g}).then(function(r){
    return aplicaAsignacion(r.destinatarios).catch(function(){});
  }).then(function(){
    var u=buscar(id);
    toast(u&&u.asignadoA?u.folio+' asignado a '+u.asignadoNombre+'.':(u?u.folio+' quedó sin asignar.':'Asignación guardada.'));
    var y=window.scrollY;renderAsignar();window.scrollTo(0,y);
  }).catch(function(e){
    sel.disabled=false;
    if(fallaAuth(e))return;
    var u=buscar(id);sel.value=u&&u.asignadoA?String(u.asignadoA):'';
    toast(e.red?'Sin conexión. No se guardó la asignación.':'No se pudo asignar: '+e.message);
  });
}
function asignarVisibles(){
  var items=visiblesAsignar(),g=$('#amas').value;
  if(!g){toast('Elige a quién asignar.');$('#amas').focus();return;}
  if(!items.length){toast('No hay destinatarios en la lista.');return;}
  var ids=items.slice(0,500).map(function(u){return u.id;});
  var b=$('#bmas');b.disabled=true;b.textContent='Asignando…';
  api('/api/asignar',{ids:ids,gestorId:parseInt(g,10)}).then(function(r){
    return aplicaAsignacion(r.destinatarios).catch(function(){});
  }).then(function(){
    var nom='';gestoresActivos().forEach(function(x){if(String(x.id)===g)nom=x.nombre;});
    ui.af='sin';
    renderAsignar();
    toast(ids.length+(ids.length===1?' destinatario asignado':' destinatarios asignados')+' a '+nom+'.');
  }).catch(function(e){
    b.disabled=false;
    if(fallaAuth(e))return;
    pintaAsignar();
    toast(e.red?'Sin conexión. No se guardó la asignación.':'No se pudo asignar: '+e.message);
  });
}

/* ---------- Equipo (administrador) ---------- */
function renderEquipo(){
  if(!esAdmin()){go('list');return;}
  var h='<section><div class="sum-top"><h1 class="h1">Equipo</h1><p class="sum-n"><b>'+gestoresActivos().length+'</b> activos</p></div>'+
    '<div class="sum-actions"><button type="button" class="btn2 btn-s" data-act="eq-nuevo">+ Acceso</button><button type="button" class="btn2 btn-s" data-refrescar="1">Actualizar</button></div></section>';
  h+='<ul class="hist">'+state.equipo.map(function(u){
    var yo=state.me&&u.id===state.me.id;
    var tags='<span class="tag">'+(u.rol==='admin'?'Administrador':'Gestor')+'</span>'+(u.activo?'':'<span class="tag bad">Inactivo</span>')+(u.debeCambiar?'<span class="tag warn">Clave temporal</span>':'');
    return '<li><details'+(ui.openEq===u.id?' open':'')+' data-uid="'+u.id+'"><summary><span class="h-main"><span class="row"><span class="folio">'+esc(u.login)+'</span><span class="small muted">'+u.asignados+' asignados</span></span>'+
      '<span class="u-name">'+esc(u.nombre)+(yo?' (tú)':'')+'</span><span class="tags">'+tags+'</span></span></summary>'+
      '<div class="h-body">'+
        '<div class="field"><label class="lab" for="rc-'+u.id+'">Restablecer clave</label><input class="input mono" id="rc-'+u.id+'" type="text" autocomplete="off" spellcheck="false" placeholder="Clave temporal (mínimo 8)"><p class="err" id="erc-'+u.id+'" role="alert" hidden></p></div>'+
        '<div class="btns"><button type="button" class="btn2" data-act="eq-gen" data-id="'+u.id+'">Generar</button><button type="button" class="btn2 main" data-act="eq-clave" data-id="'+u.id+'">Restablecer clave</button></div>'+
        (yo?'':'<div class="btns"><button type="button" class="btn2" data-act="eq-rol" data-id="'+u.id+'">Cambiar a '+(u.rol==='admin'?'gestor':'administrador')+'</button><button type="button" class="btn2" data-act="eq-activo" data-id="'+u.id+'">'+(u.activo?'Desactivar':'Activar')+'</button></div>')+
      '</div></details></li>';
  }).join('')+'</ul>';
  view.innerHTML=h;
}
function eqPorId(id){for(var i=0;i<state.equipo.length;i++){if(state.equipo[i].id===id)return state.equipo[i];}return null;}
function editarEquipo(payload,okMsg,errId){
  ui.openEq=payload.id;
  return api('/api/equipo/editar',payload).then(function(r){
    state.equipo=r.equipo;renderEquipo();toast(okMsg);return true;
  }).catch(function(e){
    if(fallaAuth(e))return false;
    var msg=(e.data&&e.data.errores&&(e.data.errores.clave||e.data.errores.id||e.data.errores.rol))||(e.red?'Sin conexión. Intenta de nuevo.':e.message);
    if(errId&&$('#'+errId)){var p=$('#'+errId);p.textContent=msg;p.hidden=false;}else toast(msg);
    return false;
  });
}
function clickEquipo(e){
  if(e.target.closest('[data-refrescar]')){refrescar(true);return;}
  var b=e.target.closest('[data-act]');
  if(!b)return;
  var a=b.dataset.act,id=parseInt(b.dataset.id,10);
  if(a==='eq-nuevo'){go('eqnuevo');return;}
  var u=eqPorId(id);
  if(a==='eq-gen'){var i=$('#rc-'+id);i.value=genClave();return;}
  if(a==='eq-clave'){
    var v=$('#rc-'+id).value;
    var p=$('#erc-'+id);p.hidden=true;
    if(v.length<8){p.textContent='La clave temporal debe tener al menos 8 caracteres.';p.hidden=false;return;}
    b.disabled=true;
    editarEquipo({id:id,clave:v},'Clave restablecida.','erc-'+id).then(function(ok){
      if(ok){ui.cred={nombre:u.nombre,login:u.login,clave:v,nuevo:false};go('cred');}
      else b.disabled=false;
    });
    return;
  }
  if(a==='eq-rol'){editarEquipo({id:id,rol:u.rol==='admin'?'gestor':'admin'},'Rol actualizado.');return;}
  if(a==='eq-activo'){editarEquipo({id:id,activo:!u.activo},u.activo?'Acceso desactivado.':'Acceso activado.');return;}
}
function renderEqNuevo(){
  view.innerHTML=
    '<button type="button" class="back" id="volver">'+BACK+'Equipo</button>'+
    '<h1 class="h1">Nuevo acceso</h1>'+
    '<form id="fe" novalidate>'+
      fld('nombre','Nombre completo','<input id="nombre" name="nombre" class="input" type="text" autocomplete="off">')+
      fld('login','Usuario para ingresar','<input id="login" name="login" class="input" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="ej: mtorres"><span class="hint">3 a 30 caracteres: minúsculas, números, punto, guion.</span>')+
      fld('rol','Rol',radios('rol',[['gestor','Gestor'],['admin','Administrador']],'gestor'))+
      fld('clave','Clave temporal','<input id="clave" name="clave" class="input mono" type="text" autocomplete="off" spellcheck="false"><div class="btns"><button type="button" class="btn2" id="gen">Generar clave</button></div><span class="hint">La persona deberá cambiarla al ingresar.</span>')+
    '</form>';
  enlazar(view);
  $('#volver').addEventListener('click',function(){go('equipo');});
  var f=$('#fe');
  $('#gen').addEventListener('click',function(){f.elements.clave.value=genClave();limpiaError('clave');});
  f.addEventListener('input',function(e){if(e.target.name)limpiaError(e.target.name);});
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var d={nombre:f.elements.nombre.value.trim(),login:f.elements.login.value.trim().toLowerCase(),rol:f.elements.rol.value,clave:f.elements.clave.value};
    var errs={};
    if(d.nombre.length<3)errs.nombre='Escribe el nombre completo.';
    if(!/^[a-z0-9._-]{3,30}$/.test(d.login))errs.login='Usa 3 a 30 letras minúsculas, números, punto, guion o guion bajo.';
    if(d.clave.length<8)errs.clave='La clave temporal debe tener al menos 8 caracteres.';
    limpiaTodo();
    var ks=Object.keys(errs);
    if(ks.length){ks.forEach(function(k){ponError(k,errs[k]);});irA(ks[0]);return;}
    var btn=$('#gestionar');btn.disabled=true;btn.textContent='Creando…';
    api('/api/equipo',d).then(function(){
      return api('/api/equipo').then(function(r){state.equipo=r.equipo;});
    }).then(function(){
      ui.cred={nombre:d.nombre,login:d.login,clave:d.clave,nuevo:true};go('cred');
    }).catch(function(e){
      btn.disabled=false;btn.textContent='Crear acceso';
      if(fallaAuth(e))return;
      if(!erroresServidor(e))toast(e.red?'Sin conexión. Intenta de nuevo.':'No se pudo crear: '+e.message);
    });
  });
}
function renderCred(){
  var c=ui.cred;
  if(!c){go('equipo');return;}
  view.innerHTML=
    '<section class="ficha"><h1>'+(c.nuevo?'Acceso creado':'Clave restablecida')+'</h1><p class="u-dir">Entrega estos datos a '+esc(c.nombre)+'. La clave no se vuelve a mostrar y deberá cambiarla al ingresar.</p></section>'+
    '<dl class="cred"><dt>Usuario</dt><dd>'+esc(c.login)+'</dd><dt>Clave</dt><dd>'+esc(c.clave)+'</dd></dl>'+
    '<div class="btns"><button type="button" class="btn2" id="copiar">Copiar datos</button><button type="button" class="btn2 main" id="listo">Listo</button></div>';
  $('#listo').addEventListener('click',function(){ui.cred=null;go('equipo');refrescar(false);});
  $('#copiar').addEventListener('click',function(){
    var t='Usuario: '+c.login+'\nClave: '+c.clave+'\nEnlace: '+location.origin;
    var ok=function(){toast('Datos copiados.');};
    var no=function(){toast('No se pudo copiar. Selecciona el texto a mano.');};
    try{navigator.clipboard.writeText(t).then(ok,no);}catch(e){no();}
  });
}

/* ---------- Nuevo destinatario (administrador) ---------- */
function renderNuevo(){
  if(!esAdmin()){go('list');return;}
  view.innerHTML=
    '<button type="button" class="back" id="volver">'+BACK+'Visitas</button>'+
    '<h1 class="h1">Nuevo destinatario</h1>'+
    '<form id="fn" novalidate>'+
      fld('nombre','Nombre','<input id="nombre" name="nombre" class="input" type="text" autocomplete="off">')+
      fld('dir','Dirección','<input id="dir" name="dir" class="input" type="text" autocomplete="off">')+
      fld('tipo','Tipo de gestión',radios('tipo',TIPOS,'Entrega'))+
      fld('objeto','Qué se gestiona',radios('objeto',OBJETOS,'Documento'))+
      fld('detalle','Detalle','<textarea id="detalle" name="detalle" class="area" rows="2" autocomplete="off" placeholder="Qué hay que entregar o retirar"></textarea>')+
      fld('asignadoA','Asignar a (opcional)','<select id="asignadoA" name="asignadoA" class="sel">'+optsGestores('','Sin asignar por ahora')+'</select>')+
    '</form>';
  enlazar(view);
  $('#volver').addEventListener('click',function(){go('list');});
  var f=$('#fn');
  f.addEventListener('input',function(e){if(e.target.name)limpiaError(e.target.name);});
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var d={nombre:f.elements.nombre.value.trim(),dir:f.elements.dir.value.trim(),tipo:f.elements.tipo.value,objeto:f.elements.objeto.value,detalle:f.elements.detalle.value.trim()};
    if(f.elements.asignadoA.value)d.asignadoA=parseInt(f.elements.asignadoA.value,10);
    var errs={};
    if(d.nombre.length<3)errs.nombre='Escribe el nombre completo.';
    if(d.dir.length<5)errs.dir='Escribe la dirección completa.';
    if(d.detalle.length<3)errs.detalle='Describe qué se gestiona.';
    limpiaTodo();
    var ks=Object.keys(errs);
    if(ks.length){ks.forEach(function(k){ponError(k,errs[k]);});irA(ks[0]);return;}
    var btn=$('#gestionar');btn.disabled=true;btn.textContent='Guardando…';
    api('/api/destinatarios',d).then(function(r){
      state.dest.push(r.destinatario);ui.flash=r.destinatario.id;ui.filter='todos';ui.q='';
      return api('/api/equipo').then(function(x){state.equipo=x.equipo;}).catch(function(){});
    }).then(function(){
      go('list');toast('Destinatario creado.');
    }).catch(function(e){
      btn.disabled=false;btn.textContent='Guardar destinatario';
      if(fallaAuth(e))return;
      if(!erroresServidor(e))toast(e.red?'Sin conexión. Intenta de nuevo.':'No se pudo guardar: '+e.message);
    });
  });
}

/* ---------- Ficha y formulario de gestión ---------- */
var ICON_CAM='<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
function renderForm(){
  var u=buscar(ui.sel);
  if(!u){go('list');return;}
  var ult=null;
  for(var i=0;i<state.visits.length;i++){if(state.visits[i].destinatarioId===u.id){ult=state.visits[i];break;}}
  var aviso='';
  if(u.estado==='gestionado')aviso='<p class="note">Este destinatario ya figura como gestionado. Si registras otra visita, su estado se actualiza.</p>';
  else if(ult)aviso='<p class="note">Última visita: '+esc(fmtFecha(ult.fechaISO))+' · '+esc(salidaDe(ult.salida).label)+'.</p>';

  var salidaOpts='<div class="opts" role="radiogroup" aria-labelledby="l-salida">'+SALIDAS.map(function(s){
    return '<label class="opt"><input type="radio" name="salida" value="'+s.id+'"'+(draft.salida===s.id?' checked':'')+'><span class="opt-b"><span class="opt-l"><span class="radio"></span><span class="opt-t">'+esc(s.label)+'</span></span>'+chip(s.to)+'</span></label>';
  }).join('')+'</div><p class="hint">A la derecha se ve el estado en que queda el destinatario.</p>';

  view.innerHTML=
    '<button type="button" class="back" id="volver">'+BACK+'Visitas</button>'+
    '<section class="ficha"><div class="row"><span class="folio">'+esc(u.folio)+'</span>'+chip(u.estado)+'</div>'+
      '<h1>'+esc(u.nombre)+'</h1><p class="u-dir">'+esc(u.dir)+'</p>'+
      '<p class="asig">Asignado: <b>'+esc(u.tipo)+'</b> de <b>'+esc(u.objeto.toLowerCase())+'</b>. '+esc(u.detalle)+'</p></section>'+
    aviso+
    '<form id="f" novalidate>'+
      '<div class="summary" id="sum" role="alert" hidden></div>'+
      '<fieldset><legend>Qué se gestiona</legend>'+
        fld('tipo','Tipo de gestión',radios('tipo',TIPOS,draft.tipo))+
        fld('objeto','Qué se '+(draft.tipo==='Retiro'?'retira':'entrega'),radios('objeto',OBJETOS,draft.objeto))+
        fld('detalle','Detalle','<textarea id="detalle" name="detalle" class="area" rows="2" autocomplete="off">'+esc(draft.detalle)+'</textarea>')+
      '</fieldset>'+
      '<fieldset><legend>Salida de la visita</legend>'+
        fld('salida','Resultado de la visita',salidaOpts)+
        fld('contacto','<span id="lab-contacto"></span>','<input id="contacto" name="contacto" class="input" type="text" autocomplete="off" value="'+esc(draft.contacto)+'">')+
        '<div id="fecha-wrap">'+fld('fecha','Nueva fecha de visita','<input id="fecha" name="fecha" class="input" type="date" min="'+hoy()+'" value="'+esc(draft.fecha)+'">')+'</div>'+
        fld('obs','Observación','<textarea id="obs" name="obs" class="area" rows="3" autocomplete="off" placeholder="Qué pasó en la visita">'+esc(draft.obs)+'</textarea>')+
      '</fieldset>'+
      '<fieldset><legend>Respaldo</legend>'+
        fld('foto','Foto','<div id="foto-box"></div>')+
        fld('geo','Ubicación','<div id="geo-box"></div>')+
      '</fieldset>'+
    '</form>';
  pintaFoto();pintaGeo();pistas();enlazar(view);
  $('#volver').addEventListener('click',function(){go('list');});
  var f=$('#f');
  f.addEventListener('submit',onSubmit);
  f.addEventListener('input',onCampo);
  f.addEventListener('change',onCambio);
  f.addEventListener('click',onClickForm);
}

function pistas(){
  var s=salidaDe(draft.salida);
  var retira=draft.tipo==='Retiro';
  $('#lab-contacto').textContent=retira?'Nombre de quien entrega':'Nombre de quien recibe';
  var reqs={
    detalle:'obligatorio',
    salida:'obligatorio',
    contacto:(s&&s.persona)?'obligatorio':'si hubo contacto',
    obs:(s&&s.obs)?'obligatoria':'opcional',
    foto:'obligatoria',
    geo:'obligatoria'
  };
  $$('[data-req]').forEach(function(el){var k=el.dataset.req;el.textContent=reqs[k]?'· '+reqs[k]:'';});
  $('#fecha-wrap').hidden=!(s&&s.fecha);
  var lo=$('[data-f="objeto"] .lab');
  if(lo){lo.firstChild.nodeValue='Qué se '+(retira?'retira':'entrega');}
}
function leerCampos(){
  var f=$('#f');
  function val(n){var el=f.elements[n];return el?el.value:'';}
  draft.detalle=val('detalle');draft.contacto=val('contacto');draft.obs=val('obs');draft.fecha=val('fecha');
}
function onCampo(e){
  var n=e.target.name;
  if(!n||e.target.type==='file')return;
  draft[n]=e.target.value;
  limpiaError(n);
}
function onCambio(e){
  var t=e.target;
  if(t.name==='tipo'||t.name==='objeto'||t.name==='salida'){
    draft[t.name]=t.value;limpiaError(t.name);
    if(t.name==='salida'&&draft.salida){var s=salidaDe(draft.salida);if(!s.fecha){limpiaError('fecha');}}
    pistas();
  }
  if(t.id==='foto'&&t.files&&t.files[0]){var file=t.files[0];t.value='';onFoto(file);}
}
function onClickForm(e){
  var b=e.target.closest('[data-act]');
  if(!b)return;
  var a=b.dataset.act;
  if(a==='quitar-foto'){draft.foto=null;pintaFoto();}
  else if(a==='geo'){pedirGeo(b);}
  else if(a==='manual'){draft.manual=!draft.manual;pintaGeo();}
  else if(a==='usar-manual'){usarManual();}
  else if(a==='ir'){irA(b.dataset.key);}
}

/* Foto: se reduce antes de guardarla */
var MAX_LADO=1024,CALIDAD=0.7;
function reducir(file){
  var url=URL.createObjectURL(file);
  return new Promise(function(res,rej){
    var img=new Image();
    img.onload=function(){
      try{
        var w=img.naturalWidth,h=img.naturalHeight;
        if(!w||!h)throw new Error('vacía');
        var s=Math.min(1,MAX_LADO/Math.max(w,h));
        var cw=Math.round(w*s),ch=Math.round(h*s);
        var c=document.createElement('canvas');c.width=cw;c.height=ch;
        var ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,cw,ch);ctx.drawImage(img,0,0,cw,ch);
        var data=c.toDataURL('image/jpeg',CALIDAD);
        res({dataUrl:data,w:cw,h:ch,bytes:Math.round(data.length*3/4),orig:file.size});
      }catch(err){rej(err);}
      URL.revokeObjectURL(url);
    };
    img.onerror=function(){URL.revokeObjectURL(url);rej(new Error('lectura'));};
    img.src=url;
  });
}
function onFoto(file){
  if(!file.type||file.type.indexOf('image/')!==0){ponError('foto','El archivo no es una imagen. Toma una foto o elige una de la galería.');return;}
  var box=$('#foto-box');
  box.innerHTML='<p class="status-line" role="status">Reduciendo imagen…</p>';
  reducir(file).then(function(r){draft.foto=r;limpiaError('foto');pintaFoto();})
  .catch(function(){draft.foto=null;pintaFoto();ponError('foto','No se pudo leer la imagen. Prueba con otra foto.');});
}
function pintaFoto(){
  var box=$('#foto-box');if(!box)return;
  var p=draft.foto;
  if(!p){
    box.innerHTML='<label class="drop" for="foto">'+ICON_CAM+'<span>Tomar o elegir foto</span><span class="hint">Se reduce a '+MAX_LADO+' px antes de guardarse</span><input class="visually-hidden" id="foto" name="foto" type="file" accept="image/*" capture="environment"></label>';
    return;
  }
  box.innerHTML='<div class="photo"><img src="'+p.dataUrl+'" alt="Foto de la visita">'+
    '<p class="photo-info">'+p.w+' × '+p.h+' px · '+fmtBytes(p.bytes)+' (original '+fmtBytes(p.orig)+')</p>'+
    '<div class="btns"><label class="btn2" for="foto">Cambiar foto<input class="visually-hidden" id="foto" name="foto" type="file" accept="image/*" capture="environment"></label>'+
    '<button type="button" class="btn2" data-act="quitar-foto">Quitar</button></div></div>';
}

/* Geolocalización */
function fmtCoord(n){return (n>=0?'':'−')+Math.abs(n).toFixed(5);}
function pintaGeo(){
  var box=$('#geo-box');if(!box)return;
  var g=draft.geo,h='';
  if(g){
    h+='<div class="row"><span class="coords">'+fmtCoord(g.lat)+', '+fmtCoord(g.lng)+'</span><span class="src">'+(g.src==='gps'?'GPS':'Manual')+'</span></div>';
    h+='<p class="status-line">'+(g.src==='gps'?'Precisión ±'+g.acc+' m':'Ingresada a mano')+'</p>';
  }else if(draft.geoMsg){
    h+='<p class="status-line" role="status">'+esc(draft.geoMsg)+'</p>';
  }
  h+='<div class="btns"><button type="button" class="btn2'+(g?'':' main')+'" data-act="geo" id="btn-geo">'+(g?'Actualizar ubicación':'Obtener ubicación')+'</button>'+
     '<button type="button" class="btn2" data-act="manual">'+(draft.manual?'Ocultar coordenadas':'Ingresar a mano')+'</button></div>';
  if(draft.manual){
    h+='<div class="manual"><div class="field"><label for="m-lat" class="lab">Latitud</label><input class="input" id="m-lat" inputmode="decimal" placeholder="-33.42628" autocomplete="off"></div>'+
       '<div class="field"><label for="m-lng" class="lab">Longitud</label><input class="input" id="m-lng" inputmode="decimal" placeholder="-70.56656" autocomplete="off"></div></div>'+
       '<div class="btns"><button type="button" class="btn2" data-act="usar-manual">Usar estas coordenadas</button></div>';
  }
  box.className='geo';
  box.innerHTML=h;
}
function pedirGeo(btn){
  if(!('geolocation' in navigator)){draft.geoMsg='Este navegador no permite obtener la ubicación.';draft.manual=true;pintaGeo();return;}
  btn.disabled=true;btn.textContent='Buscando señal…';
  var fallo=function(msg){draft.geoMsg=msg+' Puedes ingresar las coordenadas a mano.';draft.manual=true;pintaGeo();};
  try{
    navigator.geolocation.getCurrentPosition(function(p){
      draft.geo={lat:p.coords.latitude,lng:p.coords.longitude,acc:Math.round(p.coords.accuracy),src:'gps'};
      draft.geoMsg='';limpiaError('geo');pintaGeo();
    },function(err){
      var m={1:'No hay permiso para usar la ubicación.',2:'No se pudo determinar la posición.',3:'Se agotó el tiempo de espera.'}[err&&err.code]||'No se pudo obtener la ubicación.';
      fallo(m);
    },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
  }catch(e){fallo('No se pudo obtener la ubicación.');}
}
function usarManual(){
  var la=parseFloat(($('#m-lat').value||'').replace(',','.')),lo=parseFloat(($('#m-lng').value||'').replace(',','.'));
  if(isNaN(la)||isNaN(lo)||la<-90||la>90||lo<-180||lo>180){ponError('geo','Revisa las coordenadas: latitud entre −90 y 90, longitud entre −180 y 180.');return;}
  draft.geo={lat:la,lng:lo,acc:0,src:'manual'};draft.geoMsg='';draft.manual=false;limpiaError('geo');pintaGeo();
}

/* Validación al presionar Gestionar */
var NOMBRES={tipo:'Tipo de gestión',objeto:'Qué se gestiona',detalle:'Detalle',salida:'Resultado de la visita',contacto:'Nombre de la persona',fecha:'Nueva fecha',obs:'Observación',foto:'Foto',geo:'Ubicación'};
function validar(){
  leerCampos();
  var e={},s=salidaDe(draft.salida);
  if(!draft.tipo)e.tipo='Elige si es entrega o retiro.';
  if(!draft.objeto)e.objeto='Elige qué se gestiona.';
  if(draft.detalle.trim().length<3)e.detalle='Describe brevemente lo que se gestiona.';
  if(!s)e.salida='Elige cómo terminó la visita.';
  if(s){
    if(s.persona&&draft.contacto.trim().length<3)e.contacto='Escribe el nombre completo de la persona.';
    if(s.obs&&draft.obs.trim().length<5)e.obs='Cuenta qué ocurrió (mínimo 5 letras).';
    if(s.fecha){
      if(!draft.fecha)e.fecha='Indica cuándo se vuelve a visitar.';
      else if(draft.fecha<hoy())e.fecha='La fecha no puede ser anterior a hoy.';
    }
  }
  if(!draft.foto)e.foto='Falta la foto de la visita.';
  if(!draft.geo)e.geo='Falta la ubicación. Obtenla o ingrésala a mano.';
  return e;
}
function onSubmit(ev){
  ev.preventDefault();
  var errs=validar(),keys=Object.keys(errs);
  limpiaTodo();
  var sum=$('#sum');
  if(keys.length){
    keys.forEach(function(k){ponError(k,errs[k]);});
    sum.innerHTML='<b id="sum-n">'+(keys.length===1?'Falta 1 dato':'Faltan '+keys.length+' datos')+' para gestionar</b>'+
      keys.map(function(k){return '<button type="button" data-act="ir" data-key="'+k+'">'+esc(NOMBRES[k])+': '+esc(errs[k])+'</button>';}).join('');
    sum.hidden=false;
    sum.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  sum.hidden=true;
  confirmar();
}
function confirmar(){
  var u=buscar(ui.sel),s=salidaDe(draft.salida);
  var btn=$('#gestionar');btn.disabled=true;btn.textContent='Guardando…';
  api('/api/visitas',{
    destinatarioId:u.id,tipo:draft.tipo,objeto:draft.objeto,detalle:draft.detalle.trim(),salida:s.id,
    contacto:draft.contacto.trim(),obs:draft.obs.trim(),fechaNueva:s.fecha?draft.fecha:'',
    foto:draft.foto.dataUrl,fotoInfo:{w:draft.foto.w,h:draft.foto.h,bytes:draft.foto.bytes,orig:draft.foto.orig},
    geo:{lat:draft.geo.lat,lng:draft.geo.lng,acc:draft.geo.acc,src:draft.geo.src}
  }).then(function(r){
    state.visits.unshift(r.visita);
    for(var i=0;i<state.dest.length;i++){if(state.dest[i].id===r.destinatario.id)state.dest[i]=r.destinatario;}
    ui.flash=r.destinatario.id;ui.filter='todos';ui.q='';draft=null;
    go('list');
    toast(r.destinatario.folio+' gestionado: queda como '+ESTADOS[r.destinatario.estado].label.toLowerCase()+'.');
  }).catch(function(e){
    btn.disabled=false;btn.textContent='Gestionar';
    if(e.auth){toast('Tu sesión expiró. Ingresa de nuevo.');fallaAuth(e);return;}
    if(fallaAuth(e))return;
    if(e.status===403){toast(e.message);return;}
    if(e.data&&e.data.errores){Object.keys(e.data.errores).forEach(function(k){ponError(k,e.data.errores[k]);});toast('El servidor encontró datos por corregir.');return;}
    toast(e.red?'Sin conexión. Tu registro sigue aquí, intenta de nuevo.':'No se pudo guardar: '+e.message);
  });
}

/* ---------- Historial y cuenta ---------- */
function renderHist(){
  var v=state.visits;
  var h='<h1 class="h1">Historial</h1>';
  if(!v.length){
    h+='<p class="empty">Todavía no hay visitas gestionadas. Elige un destinatario en Visitas para registrar la primera.</p>';
  }else{
    h+='<ul class="hist">'+v.map(function(x){
      var s=salidaDe(x.salida);
      var mapa='https://www.google.com/maps?q='+encodeURIComponent(x.geo.lat+','+x.geo.lng);
      return '<li><details><summary><img class="thumb" loading="lazy" src="'+esc(x.foto)+'" alt="">'+
        '<span class="h-main"><span class="row"><span class="folio">'+esc(x.folio)+'</span>'+chip(x.estadoNuevo)+'</span>'+
        '<span class="u-name">'+esc(x.nombre)+'</span><span class="small muted">'+esc(s.label)+' · '+esc(fmtFecha(x.fechaISO))+'</span></span></summary>'+
        '<div class="h-body"><img loading="lazy" src="'+esc(x.foto)+'" alt="Foto de la visita a '+esc(x.nombre)+'">'+
        '<dl><dt>Gestión</dt><dd>'+esc(x.tipo)+' de '+esc(x.objeto.toLowerCase())+'</dd>'+
        '<dt>Detalle</dt><dd>'+esc(x.detalle)+'</dd>'+
        '<dt>Estado</dt><dd>'+esc(ESTADOS[x.estadoAnterior].label)+' → '+esc(ESTADOS[x.estadoNuevo].label)+'</dd>'+
        (x.gestor?'<dt>Gestor</dt><dd>'+esc(x.gestor)+'</dd>':'')+
        (x.contacto?'<dt>Persona</dt><dd>'+esc(x.contacto)+'</dd>':'')+
        (x.fechaNueva?'<dt>Nueva visita</dt><dd>'+esc(fmtDia(x.fechaNueva))+'</dd>':'')+
        (x.obs?'<dt>Observación</dt><dd>'+esc(x.obs)+'</dd>':'')+
        '<dt>Ubicación</dt><dd><span class="mono">'+fmtCoord(x.geo.lat)+', '+fmtCoord(x.geo.lng)+'</span> · '+(x.geo.src==='gps'?'GPS ±'+x.geo.acc+' m':'manual')+'<br><a class="link" href="'+mapa+'" target="_blank" rel="noopener">Ver en el mapa</a></dd>'+
        '<dt>Foto</dt><dd class="mono">'+x.fotoInfo.w+' × '+x.fotoInfo.h+' · '+fmtBytes(x.fotoInfo.bytes)+'</dd></dl></div></details></li>';
    }).join('')+'</ul>';
  }
  var me=state.me;
  h+='<section class="panel"><div class="row"><span class="u-name">'+esc(me.nombre)+'</span><span class="tag">'+(me.rol==='admin'?'Administrador':'Gestor')+'</span></div>'+
    '<span class="folio">'+esc(me.login)+'</span>'+
    '<div class="acct"><button type="button" class="btn2" id="cambiar">Cambiar clave</button><button type="button" class="btn-danger" id="salir">Cerrar sesión</button></div></section>';
  view.innerHTML=h;
  $('#cambiar').addEventListener('click',function(){ui.forzada=false;go('clave');});
  $('#salir').addEventListener('click',salir);
}

/* ---------- Arranque ---------- */
function iniciar(){
  $('#tabs').hidden=true;$('#actionbar').hidden=true;
  view.innerHTML='<p class="empty" role="status">Cargando…</p>';
  return api('/api/yo').then(function(r){
    state.me=r.usuario;
    if(state.me.debeCambiar){ui.forzada=true;go('clave');return;}
    ui.forzada=false;
    return cargarTodo().then(function(){go('list');});
  }).catch(function(e){
    if(e.auth){state.me=null;go('login');return;}
    if(e.cambiar){ui.forzada=true;go('clave');return;}
    view.innerHTML='<p class="empty">No se pudo conectar con el servidor.<br>'+esc(e.message)+'</p><div class="btns"><button type="button" class="btn2 main" data-reintentar="1">Reintentar</button></div>';
  });
}
iniciar();
})();
</script>
</body>
</html>
`;

const PORT = Number(Bun.env.PORT || 3000);
const SEED = (Bun.env.ACCESS_CODE || "").trim();
const TZ = "America/Santiago";
const sql = Bun.sql;

const TIPOS = ["Entrega", "Retiro"];
const OBJETOS = ["Elemento", "Documento", "Información"];
const SALIDAS: Record<string, { to: string; obs: boolean; fecha: boolean; persona: boolean }> = {
  completa: { to: "gestionado", obs: false, fecha: false, persona: true },
  parcial: { to: "parcial", obs: true, fecha: false, persona: true },
  ausente: { to: "reprogramado", obs: true, fecha: true, persona: false },
  reprogramar: { to: "reprogramado", obs: true, fecha: true, persona: false },
  direccion: { to: "nogestionado", obs: true, fecha: false, persona: false },
  rechazada: { to: "nogestionado", obs: true, fecha: false, persona: false },
};

/* ---------------- Base de datos ---------------- */
async function init() {
  // Migración: la tabla "usuarios" original (personas visitadas) pasa a "destinatarios".
  await sql`DO $$ BEGIN
    IF to_regclass('public.destinatarios') IS NULL AND to_regclass('public.usuarios') IS NOT NULL
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'folio')
    THEN ALTER TABLE usuarios RENAME TO destinatarios; END IF;
  END $$`;

  await sql`CREATE TABLE IF NOT EXISTS usuarios (
    id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    nombre text NOT NULL,
    login text NOT NULL UNIQUE,
    pass_hash text NOT NULL,
    rol text NOT NULL DEFAULT 'gestor' CHECK (rol IN ('admin', 'gestor')),
    activo boolean NOT NULL DEFAULT true,
    debe_cambiar boolean NOT NULL DEFAULT false,
    creado timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS sesiones (
    token_hash text PRIMARY KEY,
    usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado timestamptz NOT NULL DEFAULT now(),
    expira timestamptz NOT NULL
  )`;
  await sql`CREATE SEQUENCE IF NOT EXISTS destinatarios_folio_seq START 412`;
  await sql`CREATE TABLE IF NOT EXISTS destinatarios (
    id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    folio text NOT NULL DEFAULT ('TR-' || lpad(nextval('destinatarios_folio_seq')::text, 4, '0')),
    nombre text NOT NULL,
    dir text NOT NULL,
    tipo text NOT NULL,
    objeto text NOT NULL,
    detalle text NOT NULL,
    estado text NOT NULL DEFAULT 'pendiente',
    fecha_nueva text,
    creado timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`ALTER TABLE destinatarios
    ADD COLUMN IF NOT EXISTS asignado_a integer REFERENCES usuarios(id),
    ADD COLUMN IF NOT EXISTS asignado_por integer REFERENCES usuarios(id),
    ADD COLUMN IF NOT EXISTS asignado_en timestamptz`;
  await sql`CREATE TABLE IF NOT EXISTS visitas (
    id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    destinatario_id integer NOT NULL REFERENCES destinatarios(id),
    creado timestamptz NOT NULL DEFAULT now(),
    gestor text NOT NULL DEFAULT '',
    tipo text NOT NULL,
    objeto text NOT NULL,
    detalle text NOT NULL,
    salida text NOT NULL,
    estado_anterior text NOT NULL,
    estado_nuevo text NOT NULL,
    contacto text NOT NULL DEFAULT '',
    obs text NOT NULL DEFAULT '',
    fecha_nueva text NOT NULL DEFAULT '',
    foto_b64 text NOT NULL,
    foto_w integer NOT NULL,
    foto_h integer NOT NULL,
    foto_bytes integer NOT NULL,
    foto_orig integer NOT NULL,
    lat double precision NOT NULL,
    lng double precision NOT NULL,
    acc integer NOT NULL DEFAULT 0,
    src text NOT NULL
  )`;
  await sql`DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitas' AND column_name = 'usuario_id')
    THEN ALTER TABLE visitas RENAME COLUMN usuario_id TO destinatario_id; END IF;
  END $$`;
  await sql`ALTER TABLE visitas ADD COLUMN IF NOT EXISTS gestor_id integer REFERENCES usuarios(id)`;
  await sql`CREATE INDEX IF NOT EXISTS visitas_dest_idx ON visitas (destinatario_id, id DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS destinatarios_asig_idx ON destinatarios (asignado_a)`;

  // Primer administrador: login "admin", clave inicial = ACCESS_CODE, debe cambiarla al ingresar.
  const n = await sql`SELECT count(*)::int AS n FROM usuarios`;
  if (n[0].n === 0 && SEED) {
    const h = await Bun.password.hash(SEED);
    await sql`INSERT INTO usuarios (nombre, login, pass_hash, rol, debe_cambiar)
      VALUES ('Administrador', 'admin', ${h}, 'admin', true) ON CONFLICT (login) DO NOTHING`;
  }
}
let listo: Promise<void> | null = null;
function bd() {
  if (!listo) {
    listo = init().catch((e) => {
      listo = null;
      console.error("init bd:", e);
      throw e;
    });
  }
  return listo;
}

/* ---------------- Utilidades ---------------- */
const hoy = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
const sha = (s: string) => new Bun.CryptoHasher("sha256").update(s).digest("hex");
const randHex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, "0")).join("");

const SEC: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
};
const CSP =
  "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; " +
  "script-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'";

function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...SEC, ...extra },
  });
}
function cookie(req: Request, name: string) {
  const c = req.headers.get("cookie") || "";
  for (const part of c.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return "";
}
const COOKIE_ON = (t: string) => `s=${t}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`;
const COOKIE_OFF = "s=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax";

/* Límite de intentos de ingreso */
const intentos = new Map<string, { n: number; desde: number }>();
const VENTANA = 15 * 60_000;
function bloqueado(clave: string, max: number) {
  const r = intentos.get(clave);
  if (!r) return false;
  if (Date.now() - r.desde > VENTANA) {
    intentos.delete(clave);
    return false;
  }
  return r.n >= max;
}
function falla(clave: string) {
  const r = intentos.get(clave);
  if (!r || Date.now() - r.desde > VENTANA) intentos.set(clave, { n: 1, desde: Date.now() });
  else r.n++;
}

/* Sesiones */
type Yo = { id: number; nombre: string; login: string; rol: "admin" | "gestor"; debeCambiar: boolean; tokenHash: string };
async function sesionDe(req: Request): Promise<Yo | null> {
  const t = cookie(req, "s");
  if (!/^[0-9a-f]{64}$/.test(t)) return null;
  const th = sha(t);
  const r = await sql`SELECT u.id, u.nombre, u.login, u.rol, u.debe_cambiar
    FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
    WHERE s.token_hash = ${th} AND s.expira > now() AND u.activo`;
  if (!r.length) return null;
  const u = r[0];
  return { id: u.id, nombre: u.nombre, login: u.login, rol: u.rol, debeCambiar: u.debe_cambiar, tokenHash: th };
}
const pubYo = (y: Yo) => ({ id: y.id, nombre: y.nombre, login: y.login, rol: y.rol, debeCambiar: y.debeCambiar });
async function crearSesion(uid: number) {
  const raw = randHex(32);
  await sql`DELETE FROM sesiones WHERE expira < now()`;
  await sql`INSERT INTO sesiones (token_hash, usuario_id, expira) VALUES (${sha(raw)}, ${uid}, now() + interval '30 days')`;
  return raw;
}
let falsoHash: string | null = null;

/* Mapeos */
const mapDest = (r: any) => ({
  id: r.id,
  folio: r.folio,
  nombre: r.nombre,
  dir: r.dir,
  tipo: r.tipo,
  objeto: r.objeto,
  detalle: r.detalle,
  estado: r.estado,
  fechaNueva: r.fecha_nueva || null,
  asignadoA: r.asignado_a ?? null,
  asignadoNombre: r.asignado_nombre || "",
});
const mapVisita = (r: any) => ({
  id: r.id,
  destinatarioId: r.destinatario_id,
  folio: r.folio,
  nombre: r.nombre,
  dir: r.dir,
  fechaISO: new Date(r.creado).toISOString(),
  gestor: r.gestor,
  tipo: r.tipo,
  objeto: r.objeto,
  detalle: r.detalle,
  salida: r.salida,
  estadoAnterior: r.estado_anterior,
  estadoNuevo: r.estado_nuevo,
  contacto: r.contacto,
  obs: r.obs,
  fechaNueva: r.fecha_nueva,
  foto: `/api/visitas/${r.id}/foto`,
  fotoInfo: { w: r.foto_w, h: r.foto_h, bytes: r.foto_bytes, orig: r.foto_orig },
  geo: { lat: r.lat, lng: r.lng, acc: r.acc, src: r.src },
});
const mapEquipo = (r: any) => ({
  id: r.id,
  nombre: r.nombre,
  login: r.login,
  rol: r.rol,
  activo: r.activo,
  debeCambiar: r.debe_cambiar,
  asignados: r.asignados,
});

async function listaDest(yo: Yo) {
  if (yo.rol === "admin") {
    return await sql`SELECT d.*, a.nombre AS asignado_nombre FROM destinatarios d
      LEFT JOIN usuarios a ON a.id = d.asignado_a ORDER BY d.id`;
  }
  return await sql`SELECT d.*, a.nombre AS asignado_nombre FROM destinatarios d
    LEFT JOIN usuarios a ON a.id = d.asignado_a WHERE d.asignado_a = ${yo.id} ORDER BY d.id`;
}
async function listaVisitas(yo: Yo) {
  if (yo.rol === "admin") {
    return await sql`SELECT v.id, v.destinatario_id, v.creado, v.gestor, v.tipo, v.objeto, v.detalle, v.salida,
      v.estado_anterior, v.estado_nuevo, v.contacto, v.obs, v.fecha_nueva, v.foto_w, v.foto_h, v.foto_bytes,
      v.foto_orig, v.lat, v.lng, v.acc, v.src, d.folio, d.nombre, d.dir
      FROM visitas v JOIN destinatarios d ON d.id = v.destinatario_id ORDER BY v.id DESC LIMIT 300`;
  }
  return await sql`SELECT v.id, v.destinatario_id, v.creado, v.gestor, v.tipo, v.objeto, v.detalle, v.salida,
      v.estado_anterior, v.estado_nuevo, v.contacto, v.obs, v.fecha_nueva, v.foto_w, v.foto_h, v.foto_bytes,
      v.foto_orig, v.lat, v.lng, v.acc, v.src, d.folio, d.nombre, d.dir
      FROM visitas v JOIN destinatarios d ON d.id = v.destinatario_id
      WHERE d.asignado_a = ${yo.id} ORDER BY v.id DESC LIMIT 300`;
}
async function visitaPorId(id: number) {
  return await sql`SELECT v.id, v.destinatario_id, v.creado, v.gestor, v.tipo, v.objeto, v.detalle, v.salida,
      v.estado_anterior, v.estado_nuevo, v.contacto, v.obs, v.fecha_nueva, v.foto_w, v.foto_h, v.foto_bytes,
      v.foto_orig, v.lat, v.lng, v.acc, v.src, d.folio, d.nombre, d.dir
      FROM visitas v JOIN destinatarios d ON d.id = v.destinatario_id WHERE v.id = ${id}`;
}
async function listaEquipo() {
  return await sql`SELECT u.id, u.nombre, u.login, u.rol, u.activo, u.debe_cambiar,
      (SELECT count(*)::int FROM destinatarios d WHERE d.asignado_a = u.id) AS asignados
      FROM usuarios u ORDER BY u.activo DESC, u.rol, lower(u.nombre)`;
}

/* ---------------- Validaciones ---------------- */
const txt = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const esInt = (v: unknown, min: number, max: number) => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const esNum = (v: unknown, min: number, max: number) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const LOGIN_RE = /^[a-z0-9._-]{3,30}$/;
const claveOk = (c: unknown) => typeof c === "string" && c.length >= 8 && c.length <= 100;

function validarDest(b: any) {
  const e: Record<string, string> = {};
  const nombre = txt(b?.nombre), dir = txt(b?.dir), detalle = txt(b?.detalle);
  if (nombre.length < 3 || nombre.length > 120) e.nombre = "Escribe el nombre completo.";
  if (dir.length < 5 || dir.length > 200) e.dir = "Escribe la dirección completa.";
  if (!TIPOS.includes(b?.tipo)) e.tipo = "Elige entrega o retiro.";
  if (!OBJETOS.includes(b?.objeto)) e.objeto = "Elige qué se gestiona.";
  if (detalle.length < 3 || detalle.length > 500) e.detalle = "Describe qué se gestiona.";
  return { e, d: { nombre, dir, tipo: b?.tipo, objeto: b?.objeto, detalle } };
}

function validarVisita(b: any) {
  const e: Record<string, string> = {};
  const s = SALIDAS[b?.salida];
  const detalle = txt(b?.detalle), contacto = txt(b?.contacto), obs = txt(b?.obs), fecha = txt(b?.fechaNueva);
  if (!Number.isInteger(b?.destinatarioId)) e.destinatarioId = "Destinatario inválido.";
  if (!TIPOS.includes(b?.tipo)) e.tipo = "Elige entrega o retiro.";
  if (!OBJETOS.includes(b?.objeto)) e.objeto = "Elige qué se gestiona.";
  if (detalle.length < 3 || detalle.length > 500) e.detalle = "Describe brevemente lo que se gestiona.";
  if (!s) e.salida = "Elige cómo terminó la visita.";
  if (contacto.length > 120) e.contacto = "El nombre es demasiado largo.";
  if (obs.length > 1000) e.obs = "La observación es demasiado larga.";
  if (s) {
    if (s.persona && contacto.length < 3) e.contacto = "Escribe el nombre completo de la persona.";
    if (s.obs && obs.length < 5) e.obs = "Cuenta qué ocurrió (mínimo 5 letras).";
    if (s.fecha) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) e.fecha = "Indica cuándo se vuelve a visitar.";
      else if (fecha < hoy()) e.fecha = "La fecha no puede ser anterior a hoy.";
    }
  }
  let b64 = "";
  const foto = typeof b?.foto === "string" ? b.foto : "";
  if (foto.length > 2_500_000) e.foto = "La foto es demasiado pesada.";
  else {
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+\/=]+)$/.exec(foto);
    if (!m) e.foto = "Falta la foto de la visita.";
    else b64 = m[1];
  }
  const fi = b?.fotoInfo || {};
  if (!esInt(fi.w, 1, 8192) || !esInt(fi.h, 1, 8192) || !esInt(fi.orig, 0, 500_000_000)) e.foto = e.foto || "Datos de foto inválidos.";
  const g = b?.geo || {};
  if (!esNum(g.lat, -90, 90) || !esNum(g.lng, -180, 180) || !["gps", "manual"].includes(g.src) || !esInt(Math.round(Number(g.acc) || 0), 0, 1_000_000)) {
    e.geo = "Falta la ubicación o es inválida.";
  }
  return { e, s, d: { detalle, contacto, obs, fecha, b64, fi, g } };
}

const faltan = (errores: Record<string, string>, status = 400) => json({ mensaje: "Datos por corregir", errores }, status);
const prohibido = () => json({ mensaje: "No tienes permiso para esta acción." }, 403);

/* ---------------- Servidor ---------------- */
Bun.serve({
  port: PORT,
  maxRequestBodySize: 8 * 1024 * 1024,
  async fetch(req) {
    const url = new URL(req.url);
    const p = url.pathname;
    const m = req.method;
    try {
      if (p === "/health") return json({ ok: true });

      if ((p === "/" || p === "/index.html") && m === "GET") {
        return new Response(HTML, {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache", "content-security-policy": CSP, ...SEC },
        });
      }
      if (!p.startsWith("/api/")) return json({ mensaje: "No encontrado" }, 404);

      if (m === "POST" && !(req.headers.get("content-type") || "").includes("application/json")) {
        return json({ mensaje: "Formato no soportado" }, 415);
      }
      let body: any = {};
      if (m === "POST") {
        try {
          body = await req.json();
        } catch {
          return json({ mensaje: "Solicitud inválida" }, 400);
        }
      }
      await bd();

      /* --- Ingreso --- */
      if (p === "/api/entrar" && m === "POST") {
        const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "?").split(",")[0].trim();
        const login = txt(body?.login).toLowerCase();
        const kIp = "ip:" + ip, kLogin = "login:" + login;
        if (bloqueado(kIp, 30) || bloqueado(kLogin, 8)) return json({ mensaje: "Demasiados intentos. Espera unos minutos." }, 429);
        const clave = typeof body?.clave === "string" ? body.clave : "";
        const r = login && clave.length <= 200 ? await sql`SELECT id, pass_hash, activo FROM usuarios WHERE login = ${login}` : [];
        let ok = false;
        if (r.length) {
          ok = await Bun.password.verify(clave, r[0].pass_hash);
        } else {
          falsoHash ??= await Bun.password.hash("terreno-sin-usuario");
          await Bun.password.verify(clave, falsoHash);
        }
        if (!ok || !r[0].activo) {
          falla(kIp);
          falla(kLogin);
          return json({ mensaje: "Usuario o clave incorrectos." }, 401);
        }
        intentos.delete(kLogin);
        const tok = await crearSesion(r[0].id);
        const yo = await sesionDe(new Request(req.url, { headers: { cookie: "s=" + tok } }));
        return json({ usuario: yo ? pubYo(yo) : null }, 200, { "set-cookie": COOKIE_ON(tok) });
      }
      if (p === "/api/salir" && m === "POST") {
        const t = cookie(req, "s");
        if (/^[0-9a-f]{64}$/.test(t)) await sql`DELETE FROM sesiones WHERE token_hash = ${sha(t)}`;
        return json({ ok: true }, 200, { "set-cookie": COOKIE_OFF });
      }

      const yo = await sesionDe(req);
      if (!yo) {
        const sinUsuarios = (await sql`SELECT count(*)::int AS n FROM usuarios`)[0].n === 0;
        return json({ mensaje: sinUsuarios ? "El servidor aún no tiene usuarios. Falta configurar ACCESS_CODE." : "No autorizado" }, 401);
      }
      const admin = yo.rol === "admin";

      if (p === "/api/yo" && m === "GET") return json({ usuario: pubYo(yo) });

      /* --- Cambio de clave propia --- */
      if (p === "/api/clave" && m === "POST") {
        const e: Record<string, string> = {};
        const actual = typeof body?.actual === "string" ? body.actual : "";
        const nueva = body?.nueva;
        const fila = await sql`SELECT pass_hash FROM usuarios WHERE id = ${yo.id}`;
        if (!actual || !(await Bun.password.verify(actual, fila[0].pass_hash))) e.actual = "La clave actual no es correcta.";
        if (!claveOk(nueva)) e.nueva = "La clave nueva debe tener entre 8 y 100 caracteres.";
        else if (nueva === actual) e.nueva = "La clave nueva debe ser distinta de la actual.";
        if (Object.keys(e).length) return faltan(e);
        const h = await Bun.password.hash(nueva);
        await sql`UPDATE usuarios SET pass_hash = ${h}, debe_cambiar = false WHERE id = ${yo.id}`;
        await sql`DELETE FROM sesiones WHERE usuario_id = ${yo.id} AND token_hash <> ${yo.tokenHash}`;
        return json({ ok: true });
      }

      if (yo.debeCambiar) return json({ mensaje: "Debes cambiar tu clave antes de continuar.", cambiarClave: true }, 403);

      /* --- Destinatarios --- */
      if (p === "/api/destinatarios" && m === "GET") {
        const rows = await listaDest(yo);
        return json({ destinatarios: rows.map(mapDest) });
      }
      if (p === "/api/destinatarios" && m === "POST") {
        if (!admin) return prohibido();
        const { e, d } = validarDest(body);
        let asignado: number | null = null;
        let asignadoNombre = "";
        if (body?.asignadoA != null) {
          const g = Number.isInteger(body.asignadoA) ? await sql`SELECT id, nombre FROM usuarios WHERE id = ${body.asignadoA} AND activo` : [];
          if (!g.length) e.asignadoA = "Elige un usuario activo.";
          else {
            asignado = g[0].id;
            asignadoNombre = g[0].nombre;
          }
        }
        if (Object.keys(e).length) return faltan(e);
        const rows = await sql`INSERT INTO destinatarios (nombre, dir, tipo, objeto, detalle, asignado_a, asignado_por, asignado_en)
          VALUES (${d.nombre}, ${d.dir}, ${d.tipo}, ${d.objeto}, ${d.detalle}, ${asignado}, ${asignado ? yo.id : null}, ${asignado ? new Date() : null})
          RETURNING *`;
        return json({ destinatario: mapDest({ ...rows[0], asignado_nombre: asignadoNombre }) }, 201);
      }
      if (p === "/api/asignar" && m === "POST") {
        if (!admin) return prohibido();
        const ids: unknown = body?.ids;
        const e: Record<string, string> = {};
        if (!Array.isArray(ids) || ids.length < 1 || ids.length > 500 || !ids.every((x) => Number.isInteger(x) && x > 0)) {
          e.ids = "Elige al menos un destinatario.";
        }
        let gid: number | null = null;
        let gnom = "";
        if (body?.gestorId != null) {
          const g = Number.isInteger(body.gestorId) ? await sql`SELECT id, nombre FROM usuarios WHERE id = ${body.gestorId} AND activo` : [];
          if (!g.length) e.gestorId = "Elige un usuario activo.";
          else {
            gid = g[0].id;
            gnom = g[0].nombre;
          }
        }
        if (Object.keys(e).length) return faltan(e);
        const lista = ids as number[];
        const rows = await sql`UPDATE destinatarios SET asignado_a = ${gid}, asignado_por = ${yo.id}, asignado_en = now()
          WHERE id = ANY(string_to_array(${lista.join(",")}, ',')::int[]) RETURNING *`;
        return json({ destinatarios: rows.map((r: any) => mapDest({ ...r, asignado_nombre: gnom })) });
      }

      /* --- Equipo (usuarios de acceso) --- */
      if (p === "/api/equipo" && m === "GET") {
        if (!admin) return prohibido();
        const rows = await listaEquipo();
        return json({ equipo: rows.map(mapEquipo) });
      }
      if (p === "/api/equipo" && m === "POST") {
        if (!admin) return prohibido();
        const e: Record<string, string> = {};
        const nombre = txt(body?.nombre), login = txt(body?.login).toLowerCase();
        if (nombre.length < 3 || nombre.length > 80) e.nombre = "Escribe el nombre completo.";
        if (!LOGIN_RE.test(login)) e.login = "Usa 3 a 30 letras minúsculas, números, punto, guion o guion bajo.";
        if (!["admin", "gestor"].includes(body?.rol)) e.rol = "Elige un rol.";
        if (!claveOk(body?.clave)) e.clave = "La clave temporal debe tener entre 8 y 100 caracteres.";
        if (!e.login) {
          const ya = await sql`SELECT 1 FROM usuarios WHERE login = ${login}`;
          if (ya.length) e.login = "Ese usuario ya existe.";
        }
        if (Object.keys(e).length) return faltan(e);
        const h = await Bun.password.hash(body.clave);
        const rows = await sql`INSERT INTO usuarios (nombre, login, pass_hash, rol, debe_cambiar)
          VALUES (${nombre}, ${login}, ${h}, ${body.rol}, true) RETURNING id, nombre, login, rol, activo, debe_cambiar`;
        return json({ usuario: mapEquipo({ ...rows[0], asignados: 0 }) }, 201);
      }
      if (p === "/api/equipo/editar" && m === "POST") {
        if (!admin) return prohibido();
        const id = body?.id;
        if (!Number.isInteger(id)) return faltan({ id: "Usuario inválido." });
        const act = await sql`SELECT id, rol, activo FROM usuarios WHERE id = ${id}`;
        if (!act.length) return faltan({ id: "El usuario ya no existe." }, 404);
        const u = act[0];
        const e: Record<string, string> = {};
        const nuevoRol = body?.rol ?? u.rol;
        const nuevoActivo = typeof body?.activo === "boolean" ? body.activo : u.activo;
        if (!["admin", "gestor"].includes(nuevoRol)) e.rol = "Rol inválido.";
        if (id === yo.id && (nuevoRol !== "admin" || !nuevoActivo)) e.id = "No puedes quitarte el rol de administrador ni desactivarte a ti mismo.";
        if (body?.clave !== undefined && !claveOk(body.clave)) e.clave = "La clave temporal debe tener entre 8 y 100 caracteres.";
        if (!e.id && u.rol === "admin" && u.activo && (nuevoRol !== "admin" || !nuevoActivo)) {
          const otros = await sql`SELECT count(*)::int AS n FROM usuarios WHERE rol = 'admin' AND activo AND id <> ${id}`;
          if (otros[0].n === 0) e.id = "Debe quedar al menos un administrador activo.";
        }
        if (Object.keys(e).length) return faltan(e);
        await sql`UPDATE usuarios SET rol = ${nuevoRol}, activo = ${nuevoActivo} WHERE id = ${id}`;
        if (body?.clave !== undefined) {
          const h = await Bun.password.hash(body.clave);
          await sql`UPDATE usuarios SET pass_hash = ${h}, debe_cambiar = true WHERE id = ${id}`;
          await sql`DELETE FROM sesiones WHERE usuario_id = ${id}`;
        }
        if (!nuevoActivo) await sql`DELETE FROM sesiones WHERE usuario_id = ${id}`;
        const rows = await listaEquipo();
        return json({ equipo: rows.map(mapEquipo) });
      }

      /* --- Visitas --- */
      if (p === "/api/visitas" && m === "GET") {
        const rows = await listaVisitas(yo);
        return json({ visitas: rows.map(mapVisita) });
      }
      if (p === "/api/visitas" && m === "POST") {
        const { e, s, d } = validarVisita(body);
        if (Object.keys(e).length || !s) return faltan(e);
        const did: number = body.destinatarioId;
        const bytes = Math.floor((d.b64.length * 3) / 4);
        const res = await sql.begin(async (tx: any) => {
          const us = await tx`SELECT id, estado, asignado_a FROM destinatarios WHERE id = ${did} FOR UPDATE`;
          if (!us.length) return "nada";
          if (!admin && us[0].asignado_a !== yo.id) return "prohibido";
          const ins = await tx`INSERT INTO visitas
            (destinatario_id, gestor_id, gestor, tipo, objeto, detalle, salida, estado_anterior, estado_nuevo, contacto, obs, fecha_nueva,
             foto_b64, foto_w, foto_h, foto_bytes, foto_orig, lat, lng, acc, src)
            VALUES (${did}, ${yo.id}, ${yo.nombre}, ${body.tipo}, ${body.objeto}, ${d.detalle}, ${body.salida}, ${us[0].estado}, ${s.to},
             ${d.contacto}, ${d.obs}, ${s.fecha ? d.fecha : ""}, ${d.b64}, ${d.fi.w}, ${d.fi.h}, ${bytes}, ${d.fi.orig},
             ${d.g.lat}, ${d.g.lng}, ${Math.round(Number(d.g.acc) || 0)}, ${d.g.src}) RETURNING id`;
          await tx`UPDATE destinatarios SET estado = ${s.to}, fecha_nueva = ${s.fecha ? d.fecha : null},
            tipo = ${body.tipo}, objeto = ${body.objeto}, detalle = ${d.detalle} WHERE id = ${did}`;
          return { vid: ins[0].id as number };
        });
        if (res === "nada") return faltan({ destinatarioId: "El destinatario ya no existe." });
        if (res === "prohibido") return json({ mensaje: "Este destinatario no está asignado a ti." }, 403);
        const vrows = await visitaPorId((res as { vid: number }).vid);
        const drows = await sql`SELECT d.*, a.nombre AS asignado_nombre FROM destinatarios d
          LEFT JOIN usuarios a ON a.id = d.asignado_a WHERE d.id = ${did}`;
        return json({ visita: mapVisita(vrows[0]), destinatario: mapDest(drows[0]) }, 201);
      }

      const fm = /^\/api\/visitas\/(\d+)\/foto$/.exec(p);
      if (fm && m === "GET") {
        const vid = Number(fm[1]);
        const rows = admin
          ? await sql`SELECT v.foto_b64 FROM visitas v WHERE v.id = ${vid}`
          : await sql`SELECT v.foto_b64 FROM visitas v JOIN destinatarios d ON d.id = v.destinatario_id
              WHERE v.id = ${vid} AND d.asignado_a = ${yo.id}`;
        if (!rows.length) return json({ mensaje: "No encontrado" }, 404);
        return new Response(Buffer.from(rows[0].foto_b64, "base64"), {
          headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=86400", ...SEC },
        });
      }

      return json({ mensaje: "No encontrado" }, 404);
    } catch (err) {
      console.error("error:", p, err);
      return json({ mensaje: "Error interno del servidor" }, 500);
    }
  },
});

console.log(`Terreno escuchando en :${PORT}`);
bd().catch(() => {});

