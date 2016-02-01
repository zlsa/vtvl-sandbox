
var Game = Fiber.extend(function() {
  return {

    init: function() {
      this.time = 0;
      this.time_scale = 1;

      this.last_tick = 0;

      this.paused = false;
      this.focus = true;
      
      this.mass_multiplier = 0.01;
      
      this.loader = new Loader(this);
      
      this.renderer = new Renderer(this);
      this.world = new World(this);
      
      this.ground = new Ground(this);

      this.vehicle = new Vehicle(this);

      var game = this;
      
      $(window).blur(function() {
        game.focus = false;
      });
      $(window).focus(function() {
        game.focus = true;
      });
    },

    is_paused: function() {
      if(this.paused) return true;
      if(!this.focus) return true;
      return false;
    },

    get_time: function() {
      return this.time;
    },

    get_loader: function() {
      return this.loader;
    },
    
    get_world: function() {
      return this.world.get_world();
    },

    get_scene: function() {
      return this.renderer.get_scene();
    },

    resize: function(size) {
      this.renderer.resize(size);
    },

    done: function() {
      this.ground.done();
      this.vehicle.done();
    },

    tick: function(elapsed) {
      elapsed *= this.time_scale;
      
      if(this.is_paused()) elapsed = 0;
      
      this.time += elapsed;

      this.world.tick(elapsed);
      this.vehicle.tick(elapsed);
      this.renderer.tick(elapsed);
    }

  }
});
