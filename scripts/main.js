
var game;
var last_tick = 0;

$(document).ready(function() {
  init();
});

function init() {
  game = new Game();

  $(window).resize(resize);

  resize();
}

function resize() {
  var size = [
    $(window).width(),
    $(window).height()
  ];
  game.resize(size);
}

function done() {
  game.done();

  tick();
}

function tick() {
  var now = time();
  var elapsed = 0;
  
  if(last_tick != 0)
    elapsed = now - last_tick;
  
  elapsed = clamp(0, elapsed, 0.1);
  
  game.tick(elapsed);

  requestAnimationFrame(tick);

  last_tick = now;
}
