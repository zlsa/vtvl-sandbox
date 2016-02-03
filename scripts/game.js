
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

      this.sound = new SoundEnvironment(this);

      this.settings = new Settings(this);

      this.vehicles = [];

      this.reset();
      
      var game = this;
      
      $(window).blur(function() {
        game.focus = false;
        game.sound.tick();
      });
      
      $(window).focus(function() {
        game.focus = true;
        game.sound.tick();
      });
    },

    reset: function() {
      for(var i=0; i<this.vehicles.length; i++) {
        this.vehicles[i].remove();
        delete this.vehicles[i];
      }
      
      this.vehicles = [];

      this.time = 0;
      
      var v = new XaeroVehicle(this);
      v.autopilot = new XaeroInflightRestartAutopilot(this, v);
      this.add_vehicle(v);

    },

    add_vehicle: function(vehicle) {
      this.vehicles.push(vehicle);
    },

    is_paused: function() {
      if(this.paused) return true;
      if(!this.focus) return true;
      return false;
    },

    get_sound: function() {
      return this.sound;
    },

    get_time: function() {
      return this.time;
    },

    get_loader: function() {
      return this.loader;
    },
    
    get_physics_world: function() {
      return this.world.get_world();
    },

    get_render_scene: function() {
      return this.renderer.get_scene();
    },

    resize: function(size) {
      this.renderer.resize(size);
    },

    done: function() {
      this.ground.done();

      for(var i=0; i<this.vehicles.length; i++)
        this.vehicles[i].done();
    },

    tick: function(elapsed) {
      elapsed *= this.time_scale;
      
      if(this.is_paused()) return;
      
      this.time += elapsed;

      elapsed = clamp(0.001, elapsed);

      this.world.tick(elapsed);
      for(var i=0; i<this.vehicles.length; i++)
        this.vehicles[i].tick(elapsed);
      this.ground.tick();
      
      this.renderer.tick(elapsed);
      this.sound.tick();
    }

  }
});
