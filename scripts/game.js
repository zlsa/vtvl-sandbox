
var Game = Fiber.extend(function() {
  return {

    init: function() {
      this.time = 0;

      this.mass_multiplier = 0.01;
      
      this.loader = new Loader(this);
      
      this.renderer = new Renderer(this);
      this.world = new World(this);
      
      this.ground = new Ground(this);

      this.vehicle = new Vehicle(this);
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
      this.world.tick(elapsed);
      this.vehicle.tick(elapsed);
      this.renderer.tick(elapsed);
    }

  }
});
