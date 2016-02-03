
var Vehicle = Obj.extend(function(base) {
  return {

    init: function(game) {
      base.init.apply(this, arguments);

      this.init_shadow();
      this.init_camera();
    },

    move: function(x, y, z) {
      this.body.position.set(x, y, z);
    },

    // data

    get_position: function() {
      return this.object.position;
    },

    get_crossrange: function() {
      var p = this.get_position();
      return new THREE.Vector2(p.x, p.y);
    },

    get_altitude: function() {
      return this.body.position.z;
    },

    get_vspeed: function() {
      return this.body.velocity.z;
    },

    get_hspeed: function() {
      return new THREE.Vector2(this.body.velocity.x, this.body.velocity.y);
    },

    get_orientation: function() {
      return new THREE.Quaternion().copy(this.body.quaternion);
    },

    get_angular_velocity: function() {
      var av = this.body.angularVelocity;
      return new THREE.Euler(av.x, av.y, av.z, 'XYZ');
    },

    init_camera: function() {
      this.camera = this.game.renderer.new_camera();

      this.camera.camera.position.z = 20;
      this.camera.camera.position.y = -10;
      this.camera.camera.rotation.x = Math.PI * 0.1;

      this.object.add(this.camera.object);
    },

    engine_started: function() {
      return this.engine.is_started();
    },

    engine_start: function() {
      this.engine.start();
    },

    engine_stop: function() {
      this.engine.stop();
    },

    set_gimbal: function(gimbal) {
      this.engine.gimbal_command = gimbal;
    },

    set_throttle: function(throttle) {
      this.engine.throttle_command = throttle;
    },

    get_mass: function() {
      return this.get_dry_mass() + this.engine.mass;
    },

    get_dry_mass: function() {
      return this.mass;
    },

    get_physics_mass: function() {
      return this.get_mass() * this.game.mass_multiplier;
    },

    get_physics_dry_mass: function() {
      return this.get_dry_mass() * this.game.mass_multiplier;
    },

    init_engines: function() {
      
    },
    
    init_physics: function() {
      this.body = new CANNON.Body({
        mass: this.get_physics_dry_mass(),
      });

      if(this.shape) {
        this.body.addShape(this.shape);
      }

      this.set_material(this.world.get_material('tank'));
    },

    tick: function(elapsed) {
      this.autopilot.tick(elapsed);
      
      base.tick.call(this, elapsed);

      this.body.mass = this.get_physics_dry_mass();
    }

  }
});

