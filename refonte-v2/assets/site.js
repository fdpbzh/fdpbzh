// FDP — refonte V2 · JS partagé (menu mobile + léger parallax du hero)
(function(){
  // Menu mobile
  var b=document.getElementById('burger'),n=document.getElementById('nav');
  if(b&&n){
    b.addEventListener('click',function(){
      var open=n.classList.toggle('open');
      document.body.classList.toggle('menu-open',open);
      b.setAttribute('aria-expanded',open);
      b.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
    });
    n.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){
        n.classList.remove('open');document.body.classList.remove('menu-open');
        b.setAttribute('aria-expanded',false);
      });
    });
  }
  // Plein écran du jeu (page Jeux) : agrandit la partie en cours, sans nouvelle partie
  var fsBtn=document.getElementById('mv-fs'),fsFrame=document.getElementById('mv-frame');
  if(fsBtn&&fsFrame){
    fsBtn.addEventListener('click',function(){
      var req=fsFrame.requestFullscreen||fsFrame.webkitRequestFullscreen||fsFrame.msRequestFullscreen;
      if(req){try{var r=req.call(fsFrame);if(r&&r.catch)r.catch(function(){});}catch(e){}}
    });
  }
  // Parallax hero (respecte prefers-reduced-motion)
  var bg=document.querySelector('.hero-bg');
  if(bg&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var ticking=false;
    window.addEventListener('scroll',function(){
      if(!ticking){requestAnimationFrame(function(){bg.style.transform='translate3d(0,'+(window.scrollY*0.25)+'px,0)';ticking=false;});ticking=true;}
    },{passive:true});
  }
})();
