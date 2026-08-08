/* Championnat du Monde de la Moule — outil animateurs
   Simple, autonome. Les scores ne s'écrivent QUE via la fonction Supabase
   protégée par mot de passe : impossible d'injecter un score de l'extérieur. */
(function(){
  "use strict";
  var CFG  = window.FDP_ANIM || {};
  var FN   = CFG.SUPABASE_URL + "/functions/v1/anim-score";
  var ANON = CFG.SUPABASE_ANON_KEY;
  var PW   = localStorage.getItem("fdp_anim_pw") || "";
  var SCREENS = ["gate","home","soiffe","rocher","turbo"];

  function $(id){ return document.getElementById(id); }
  function show(id){
    SCREENS.forEach(function(s){ $(s).classList.toggle("hidden", s !== id); });
    window.scrollTo(0,0);
  }
  function btn(label, kind){
    var b = document.createElement("button");
    b.className = "bigbtn " + (kind || "yellow"); b.type = "button"; b.textContent = label;
    return b;
  }
  function fmt(ms){ return (ms/1000).toFixed(2).padStart(5,"0"); }   // 4520 -> "04.52"
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }
  function toast(msg){
    var t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function(){ t.remove(); }, 2200);
  }
  function api(body){
    return fetch(FN, {
      method:"POST",
      headers:{ "content-type":"application/json", apikey:ANON },
      body: JSON.stringify(Object.assign({ password:PW }, body))
    }).then(function(r){
      return r.json().then(function(j){ return { status:r.status, j:j }; }, function(){ return { status:r.status, j:{} }; });
    });
  }
  function needLogin(){
    PW = ""; localStorage.removeItem("fdp_anim_pw"); show("gate");
    $("pw-err").textContent = "Session expirée, reconnecte-toi.";
  }

  /* ---------- PORTE ---------- */
  function tryLogin(pw){
    return fetch(FN, { method:"POST", headers:{ "content-type":"application/json", apikey:ANON },
      body: JSON.stringify({ password:pw, action:"ping" }) }).then(function(r){ return r.status; });
  }
  $("pw-btn").addEventListener("click", function(){
    var v = ($("pw").value || "").trim();
    if(!v){ $("pw-err").textContent = "Entre le mot de passe."; return; }
    $("pw-err").textContent = "Vérification…";
    tryLogin(v).then(function(status){
      if(status === 200){ PW = v; localStorage.setItem("fdp_anim_pw", v); show("home"); }
      else if(status === 401){ $("pw-err").textContent = "Mot de passe incorrect."; }
      else { $("pw-err").textContent = "Erreur, réessaie."; }
    }).catch(function(){ $("pw-err").textContent = "Erreur réseau, réessaie."; });
  });
  $("pw").addEventListener("keydown", function(e){ if(e.key === "Enter") $("pw-btn").click(); });
  $("logout").addEventListener("click", function(){ PW = ""; localStorage.removeItem("fdp_anim_pw"); $("pw").value = ""; show("gate"); });

  /* ---------- NAVIGATION ---------- */
  function resetAll(){ SOIFFE.stopTimers(); TURBO.stopTimers(); ROCHER.stopTimers(); }
  function openGame(key){
    resetAll(); show(key);
    if(key === "soiffe"){ SOIFFE.reset(); SOIFFE.loadBoard(); }
    if(key === "turbo"){  TURBO.reset();  TURBO.loadBoard(); }
    if(key === "rocher"){ ROCHER.reset(); ROCHER.loadBoard(); }
  }
  document.querySelectorAll("[data-go]").forEach(function(b){ b.addEventListener("click", function(){ openGame(b.getAttribute("data-go")); }); });
  document.querySelectorAll("[data-back]").forEach(function(b){ b.addEventListener("click", function(){ resetAll(); show("home"); }); });

  /* ---------- CHRONO (Soiffe & Turbo) ---------- */
  function makeChrono(key, game){
    var chronoEl = $(key+"-chrono"), resultEl = $(key+"-result"), ctrl = $(key+"-ctrl"), boardEl = $(key+"-board");
    var t0 = 0, raf = 0, lastMs = 0;

    function draw(ms){ chronoEl.textContent = fmt(ms); }
    function tick(){ draw(performance.now() - t0); raf = requestAnimationFrame(tick); }
    function stopTimers(){ if(raf){ cancelAnimationFrame(raf); raf = 0; } }

    function setIdle(){
      stopTimers(); draw(0); chronoEl.classList.remove("run"); resultEl.textContent = "";
      ctrl.innerHTML = ""; var b = btn("▶ DÉMARRER","green"); b.onclick = start; ctrl.appendChild(b);
    }
    function start(){
      t0 = performance.now(); chronoEl.classList.add("run"); tick();
      ctrl.innerHTML = ""; var b = btn("⏹ STOP","red"); b.onclick = stop; ctrl.appendChild(b);
    }
    function stop(){
      stopTimers(); chronoEl.classList.remove("run");
      lastMs = Math.round(performance.now() - t0); draw(lastMs);
      resultEl.innerHTML = "Temps : <b>" + fmt(lastMs) + " s</b>";
      ctrl.innerHTML = "";
      var v = btn("✅ VALIDER","green"); v.onclick = askPseudo; ctrl.appendChild(v);
      var r = btn("🔄 RECOMMENCER","ghost"); r.onclick = setIdle; ctrl.appendChild(r);
    }
    function askPseudo(){
      ctrl.innerHTML = "";
      var box = document.createElement("div"); box.className = "entry";
      box.innerHTML = '<label>Pseudo du joueur</label>' +
        '<input class="field" id="'+key+'-pseudo" maxlength="24" placeholder="Ex : Kevin" autocomplete="off">' +
        '<div class="err" id="'+key+'-perr"></div>';
      ctrl.appendChild(box);
      var save = btn("✅ ENREGISTRER","yellow"); save.id = key+"-save"; save.onclick = submit; ctrl.appendChild(save);
      var r = btn("🔄 RECOMMENCER","ghost"); r.onclick = setIdle; ctrl.appendChild(r);
      var inp = $(key+"-pseudo"); inp.focus();
      inp.addEventListener("keydown", function(e){ if(e.key === "Enter") submit(); });
    }
    function submit(){
      var pseudo = ($(key+"-pseudo").value || "").trim();
      if(pseudo.length < 1){ $(key+"-perr").textContent = "Entre un pseudo."; return; }
      var save = $(key+"-save"); save.classList.add("saving"); save.textContent = "…";
      api({ action:"submit", game:game, pseudo:pseudo, time_ms:lastMs }).then(function(res){
        if(res.status === 200 && res.j.ok){ toast("Score enregistré ✅"); setIdle(); loadBoard(); }
        else if(res.status === 401){ needLogin(); }
        else { $(key+"-perr").textContent = "Erreur, réessaie."; save.classList.remove("saving"); save.textContent = "✅ ENREGISTRER"; }
      }).catch(function(){ $(key+"-perr").textContent = "Erreur réseau, réessaie."; save.classList.remove("saving"); save.textContent = "✅ ENREGISTRER"; });
    }
    function loadBoard(){
      boardEl.innerHTML = '<li class="empty">Chargement…</li>';
      api({ action:"list", game:game }).then(function(res){
        if(res.status === 401){ needLogin(); return; }
        var rows = (res.j && res.j.scores) || [];
        var seen = {}, best = [];
        rows.forEach(function(r){ var k = r.pseudo.toLowerCase(); if(!seen[k]){ seen[k] = 1; best.push(r); } }); // 1 meilleur temps / pseudo
        best = best.slice(0,10);
        boardEl.innerHTML = best.length
          ? best.map(function(r,i){ return '<li class="'+(i<3?"top":"")+'"><span class="r">'+(i+1)+'</span><span class="p">'+esc(r.pseudo)+'</span><span class="v">'+fmt(r.time_ms)+' s</span></li>'; }).join("")
          : '<li class="empty">Aucun temps pour l\'instant.</li>';
      }).catch(function(){ boardEl.innerHTML = '<li class="empty">Classement indisponible.</li>'; });
    }
    return { reset:setIdle, loadBoard:loadBoard, stopTimers:stopTimers };
  }

  /* ---------- ROCHER À MOULES ---------- */
  var ROCHER = (function(){
    var countEl = $("rocher-count"), resultEl = $("rocher-result"), ctrl = $("rocher-ctrl"),
        bestEl = $("rocher-best"), boardEl = $("rocher-board");
    var timer = 0, remaining = 10;

    function stopTimers(){ if(timer){ clearInterval(timer); timer = 0; } }
    function setIdle(){
      stopTimers(); remaining = 10; countEl.textContent = "10"; countEl.classList.remove("go"); resultEl.textContent = "";
      ctrl.innerHTML = ""; var b = btn("▶ DÉMARRER","green"); b.onclick = start; ctrl.appendChild(b);
    }
    function start(){
      remaining = 10; countEl.textContent = "10"; countEl.classList.remove("go"); resultEl.textContent = "";
      ctrl.innerHTML = ""; var a = btn("❌ ILS SONT TOMBÉS","red"); a.onclick = setIdle; ctrl.appendChild(a);
      timer = setInterval(function(){
        remaining--;
        if(remaining > 0){ countEl.textContent = String(remaining); }
        else { stopTimers(); countEl.textContent = "🦪"; countEl.classList.add("go"); resultEl.innerHTML = "<b>VALIDÉ !</b>"; validated(); }
      }, 1000);
    }
    function validated(){
      ctrl.innerHTML = "";
      var v = btn("✅ VALIDER","green"); v.onclick = askTeam; ctrl.appendChild(v);
      var e = btn("❌ ÉCHEC","ghost"); e.onclick = setIdle; ctrl.appendChild(e);
    }
    function askTeam(){
      ctrl.innerHTML = "";
      var box = document.createElement("div"); box.className = "entry";
      box.innerHTML = '<label>Nom de l\'équipe</label>' +
        '<input class="field" id="rocher-team" maxlength="24" placeholder="Ex : Les Bigoudens" autocomplete="off">' +
        '<label>Nombre de joueurs</label>' +
        '<input class="field" id="rocher-players" type="number" inputmode="numeric" min="1" max="300" placeholder="Ex : 12">' +
        '<div class="err" id="rocher-perr"></div>';
      ctrl.appendChild(box);
      var save = btn("✅ ENREGISTRER","yellow"); save.id = "rocher-save"; save.onclick = submit; ctrl.appendChild(save);
      var r = btn("🔄 RECOMMENCER","ghost"); r.onclick = setIdle; ctrl.appendChild(r);
      $("rocher-team").focus();
    }
    function submit(){
      var team = ($("rocher-team").value || "").trim();
      var players = parseInt($("rocher-players").value, 10);
      if(team.length < 1){ $("rocher-perr").textContent = "Entre le nom de l'équipe."; return; }
      if(!(players >= 1)){ $("rocher-perr").textContent = "Entre le nombre de joueurs."; return; }
      var save = $("rocher-save"); save.classList.add("saving"); save.textContent = "…";
      api({ action:"submit", game:"rocher_moules", pseudo:team, players:players }).then(function(res){
        if(res.status === 200 && res.j.ok){ toast("Équipe enregistrée ✅"); setIdle(); loadBoard(); }
        else if(res.status === 401){ needLogin(); }
        else { $("rocher-perr").textContent = "Erreur, réessaie."; save.classList.remove("saving"); save.textContent = "✅ ENREGISTRER"; }
      }).catch(function(){ $("rocher-perr").textContent = "Erreur réseau, réessaie."; save.classList.remove("saving"); save.textContent = "✅ ENREGISTRER"; });
    }
    function loadBoard(){
      boardEl.innerHTML = '<li class="empty">Chargement…</li>';
      api({ action:"list", game:"rocher_moules" }).then(function(res){
        if(res.status === 401){ needLogin(); return; }
        var rows = (res.j && res.j.scores) || [];
        if(!rows.length){ bestEl.innerHTML = ""; boardEl.innerHTML = '<li class="empty">Aucune équipe pour l\'instant.</li>'; return; }
        var top = rows[0];
        bestEl.innerHTML = '<div class="best">🏅 Meilleur : ' + top.players + ' joueurs<small>' + esc(top.pseudo) + '</small></div>';
        boardEl.innerHTML = rows.slice(0,10).map(function(r,i){
          return '<li class="'+(i<3?"top":"")+'"><span class="r">'+(i+1)+'</span><span class="p">'+esc(r.pseudo)+'</span><span class="v">'+r.players+' 👥</span></li>';
        }).join("");
      }).catch(function(){ boardEl.innerHTML = '<li class="empty">Classement indisponible.</li>'; });
    }
    return { reset:setIdle, loadBoard:loadBoard, stopTimers:stopTimers };
  })();

  var SOIFFE = makeChrono("soiffe","soiffe_bigoudene");
  var TURBO  = makeChrono("turbo","turbo_disco_v3");

  /* ---------- DÉMARRAGE ---------- */
  if(PW){
    tryLogin(PW).then(function(s){
      if(s === 200){ show("home"); }
      else { PW = ""; localStorage.removeItem("fdp_anim_pw"); show("gate"); }
    }).catch(function(){ show("gate"); });
  } else {
    show("gate");
  }
})();
