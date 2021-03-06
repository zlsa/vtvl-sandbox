
var Vehicle = Obj.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/new-shepard/new-shepard.json';
      
      this.mass = 34000;
      
      base.init.apply(this, arguments);
      
      this.init_engines();
    },

    get_mass: function() {
      return this.mass * this.game.mass_multiplier;
    },

    init_engines: function() {
      this.engine = new Engine(this.game);
    },
    
    add_to_world: function(world) {
      base.add_to_world.apply(this, arguments);
      
      this.engine.add_to_world(world);
    },

    add_to_scene: function(scene) {
      base.add_to_scene.apply(this, arguments);
      
      this.engine.add_to_scene(scene);
      scene.add(this.shadow);
    },

    init_physics: function() {
      var shape = new CANNON.Cylinder(2.0, 1.5, 12, 24);
      
      this.body = new CANNON.Body({
        mass: this.get_mass(),
        shape: shape
      });

      this.body.position.set(0, 0, 8);
      
      this.set_material(this.world.get_material('tank'));
    },

    loaded: function(geometry, materials) {
      var material = new THREE.MeshPhongMaterial({
        color: 0xdddddd
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.rotation.x = Math.PI * 0.5;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      
      this.object.add(this.mesh);
    },

    done: function() {
      base.done.call(this);

      this.engine.done();
      this.engine.add_to_vehicle(this, new CANNON.Vec3(0, 0, -6.4));
     
    },

    tick: function(elapsed) {
      base.tick.call(this, elapsed);

      this.body.mass = this.get_mass();
      
      this.engine.tick(elapsed);
    }

  }
});

