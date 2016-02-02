
var Vehicle = Obj.extend(function(base) {
  return {

    init: function(game) {
      base.init.apply(this, arguments);

      this.init_shadow();
      this.init_engines();
      this.init_autopilot();
      this.init_camera();
    },

    init_camera: function() {
      this.camera = this.game.renderer.new_camera();

      this.camera.camera.position.z = 20;
      this.camera.camera.position.y = -10;
      this.camera.camera.rotation.x = Math.PI * 0.1;

      this.object.add(this.camera.object);
    },

    init_autopilot: function() {
      this.autopilot = new Autopilot(this.game, this);
    },

    set_gimbal: function(gimbal) {
      this.engine.gimbal = gimbal;
    },

    set_throttle: function(throttle) {
      this.engine.throttle = throttle;
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
      this.autopilot.tick();
      
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

