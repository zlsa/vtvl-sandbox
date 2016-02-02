
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

      this.vehicles = [];

      var newshepard = new NewShepardVehicle(this);
      this.add_vehicle(newshepard);

      var game = this;
      
      $(window).blur(function() {
        game.focus = false;
      });
      
      $(window).focus(function() {
        game.focus = true;
      });
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
      
      if(this.is_paused()) elapsed = 0;
      
      this.time += elapsed;

      if(!this.is_paused())
        this.world.tick(elapsed);
      for(var i=0; i<this.vehicles.length; i++)
        this.vehicles[i].tick(elapsed);
      this.renderer.tick(elapsed);
    }

  }
});
