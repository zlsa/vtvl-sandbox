
var Vehicle = Obj.extend(function(base) {
  return {

    init: function(game) {
      base.init.apply(this, arguments);

      this.init_shadow();
      this.init_engines();
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
      return this.mass;
    },

    get_physics_mass: function() {
      return this.get_mass() * this.game.mass_multiplier;
    },

    init_engines: function() {
    },
    
    init_physics: function() {
      this.body = new CANNON.Body({
        mass: this.get_physics_mass(),
      });

      if(this.shape) {
        this.body.addShape(this.shape);
      }

      this.set_material(this.world.get_material('tank'));
    },

    tick: function(elapsed) {
      this.autopilot.tick(elapsed);
      
      base.tick.call(this, elapsed);

      this.body.mass = this.get_physics_mass();
    }

  }
});


var NewShepardVehicle = Vehicle.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/new-shepard/new-shepard.json';
      
      this.mass = 34000;
      
      base.init.apply(this, arguments);
      
      this.shadow.shadowCameraFov = 0.6;
    },

    init_engines: function() {
      this.engine = new BE3Engine(this.game);
    },
    
    init_physics: function() {
      this.shape = new CANNON.Cylinder(1.9, 1.45, 12, 24);

      base.init_physics.call(this);
      
      this.body.position.set(0, 0, 50);
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

      this.engine.tick(elapsed);
    }

  }
});

var XaeroVehicle = Vehicle.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/xaero/xaero.json';
      
      this.mass = 360;
      
      base.init.apply(this, arguments);
      
      this.shadow.shadowCameraFov = 0.3;
    },

    init_engines: function() {
      this.engine = new ScimitarEngine(this.game);
    },
    
    init_physics: function() {

      base.init_physics.call(this);

      var legspan = 1.5;
      var leg_height = 0.2;
      var nose = new CANNON.Cylinder(0.1/2, 0.75/2, 1.6, 48);
      var body = new CANNON.Cylinder(0.75/2, 0.75/2, 1.6, 24);
      var legs = new CANNON.Box(new CANNON.Vec3(legspan/2, legspan/2, leg_height/2));

      this.body.addShape(nose, new CANNON.Vec3(0, 0, 1.6), new CANNON.Quaternion());
      this.body.addShape(body, new CANNON.Vec3(0, 0, 0.0), new CANNON.Quaternion());
      this.body.addShape(legs, new CANNON.Vec3(0, 0, -2.3 + leg_height/2), new CANNON.Quaternion());
      
      this.body.position.set(0, 0, 2.5);
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
      this.engine.add_to_vehicle(this, new CANNON.Vec3(0, 0, -1.8));
    },

    tick: function(elapsed) {
      base.tick.call(this, elapsed);

      this.engine.tick(elapsed);
    }

  }
});

