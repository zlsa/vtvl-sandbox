
var Engine = Obj.extend(function(base) {
  return {

    init: function(game) {
      this.vehicle = null;

      this.throttle = 0;
      
      this.gimbal = [0, 0];

      this.started = false;

      this.flame = null;

      base.init.apply(this, arguments);

      var engine = this;
      this.game.get_loader().load_texture('images/flame.png', function(texture) {
        engine.flame = texture;
        engine.init_particles.call(engine);
      });

      this.init_light();
    },

    init_light: function() {
      this.light = new THREE.PointLight(this.color, 1, 150);
      this.light.position.set(0, 0, -0.5);
      this.object.add(this.light);
    },

    start: function() {
      if(this.restarts <= 0) return;
      if(this.is_running()) return;
      this.restarts -= 1;
      this.started = true;
    },

    stop: function() {
      if(!this.is_running()) return;
      this.started = false;
    },

    is_running: function() {
      return this.started;
    },

    init_physics: function() {
      this.body = new CANNON.Body({
        mass: this.mass * this.game.mass_multiplier,
        shape: this.shape
      });

      this.set_material(this.world.get_material('nozzle'));
    },

    add_to_vehicle: function(vehicle, position) {
      this.position = position;
      
      this.vehicle = vehicle;
      
      this.body.position = position;
      this.body.position.vadd(vehicle.body.position, this.body.position);
      
      this.constraint = new CANNON.LockConstraint(this.body, vehicle.body, {
        maxForce: 1e50
      });

      for(var i=0; i<this.constraint.equations.length; i++){
        this.constraint.equations[i].setSpookParams(1e30, 0.5, 0.02);
      }
      window.constraint = this.constraint;
      
      this.constraint.collideConnected = false;
      this.world.world.addConstraint(this.constraint);
    },

    loaded: function(geometry, materials) {
      var material = new THREE.MeshPhongMaterial({
        color: 0x222222
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;

      this.object.add(this.mesh);
    },

    get_thrust: function() {
      return this.max_thrust * this.throttle;
    },

    get_physics_thrust: function() {
      return this.get_thrust() * this.game.mass_multiplier;
    },

    clamp_values: function() {
      this.gimbal[0] = clamp(-1, this.gimbal[0], 1);
      this.gimbal[1] = clamp(-1, this.gimbal[1], 1);
      this.throttle = clamp(this.throttle_range[0], this.throttle, this.throttle_range[1]);
      
      if(!this.is_running()) this.throttle = 0;
    },

    apply_force: function() {
      var thrust = this.get_physics_thrust();

      var max = Math.sin(this.max_gimbal);
      var vector = new CANNON.Vec3(this.gimbal[0] * max, this.gimbal[1] * max, 1);
      vector.normalize();
      vector.mult(thrust, vector);

      this.body.applyLocalForce(vector, new CANNON.Vec3(0, 0, 0));
    },

    done: function() {
      this.mesh.add(this.particle.group.mesh);
      base.done.call(this);
    },

    tick: function(elapsed) {
      this.clamp_values();
      
      this.apply_force();

      this.particle.emitter.activeMultiplier = this.throttle;

      if(elapsed) {
        var steps = 5;
        for(var i=0; i<steps; i++)
          this.particle.group.tick(elapsed / steps);
      }
      
      this.mesh.rotation.x = -this.gimbal[1] * this.max_gimbal;
      this.mesh.rotation.z = -this.gimbal[0] * this.max_gimbal;
      this.mesh.rotation.x += Math.PI * 0.5;
      this.mesh.updateMatrix();
      
      this.light.intensity = clerp(0.4, this.throttle, 1, 0, 1);
      var spread = 0.1;
      this.light.intensity *= clerp(0, perlin.get1d(this.game.get_time() * 6), 1, 1-spread, 1+spread);
      
      base.tick.call(this, elapsed);
      
    }

  }
});

var BE3Engine = Engine.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/new-shepard/be-3.json';

      this.color = 0xffaa44;

      this.mass = 100;
      
      this.throttle_range = [0.4, 1];
      
      this.max_thrust = 490000;
      this.max_gimbal = radians(5);
      
      this.restarts = 3;

      base.init.apply(this, arguments);
    },

    init_physics: function() {
      this.shape = new CANNON.Cylinder(0.5, 0.1, 1.5, 12);
      
      base.init_physics.call(this);
    },

    init_particles: function() {
      this.particle = {}
      
      this.particle.group = new SPE.Group({
        texture: {
          value: this.flame
        },
        hasPerspective: true,
        maxParticleCount: 4000
      });

      var size = 0.4;

      this.particle.emitter = new SPE.Emitter({
        maxAge: {
          value: 0.3,
          spread: 0.03
        },
        position: {
          value: new THREE.Vector3(0, -0.6, 0),
          spread: new THREE.Vector3(size, size, size)
        },

        acceleration: {
          value: new THREE.Vector3(0, 10, 0),
          spread: new THREE.Vector3(0, 0, 0)
        },

        velocity: {
          value: new THREE.Vector3(0, -120, 0),
          spread: new THREE.Vector3(10, 30, 10)
        },

        color: {
          value: [ new THREE.Color(0xff88aa), new THREE.Color(0x882266) ]
        },

        opacity: {
          value: [0.01, 0.03, 0.005, 0.001, 0.0002, 0]
        },
        
        size: {
          value: [2, 5.0, 10.0],
          spread: 1
        },

        particleCount: 3000,
      });

      this.particle.group.addEmitter(this.particle.emitter);
    },

    add_to_vehicle: function(vehicle, position) {
      this.position = position;
      
      this.vehicle = vehicle;
      
      this.body.position = position;
      this.body.position.vadd(vehicle.body.position, this.body.position);
      
      this.constraint = new CANNON.LockConstraint(this.body, vehicle.body, {
        maxForce: 1e50
      });

      for(var i=0; i<this.constraint.equations.length; i++){
        this.constraint.equations[i].setSpookParams(1e30, 0.5, 0.02);
      }
      window.constraint = this.constraint;
      
      this.constraint.collideConnected = false;
      this.world.world.addConstraint(this.constraint);
    },

    loaded: function(geometry, materials) {
      var material = new THREE.MeshPhongMaterial({
        color: 0x222222
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;

      this.object.add(this.mesh);
    },

    tick: function() {
      base.tick.apply(this, arguments);
    }

  }
});

var ScimitarEngine = Engine.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/xaero/scimitar.json';

      this.color = 0xff88cc;

      this.mass = 15;
      
      this.throttle_range = [0.1, 1];
      
      this.max_thrust = 5300;
      this.max_gimbal = radians(5);
      
      this.restarts = 3;

      this.sound = new Sound(game, 'vehicles/xaero/audio/running.wav');

      base.init.apply(this, arguments);
    },

    init_physics: function() {
      this.shape = new CANNON.Cylinder(0.2, 0.1, 0.3, 12);
      
      base.init_physics.call(this);
    },

    init_particles: function() {
      this.particle = {}
      
      this.particle.group = new SPE.Group({
        texture: {
          value: this.flame
        },
        hasPerspective: true,
        maxParticleCount: 4000
      });

      var size = 0.01;

      this.particle.emitter = new SPE.Emitter({
        maxAge: {
          value: 0.03,
          spread: 0.04
        },
        position: {
          value: new THREE.Vector3(0, -0.1, 0),
          spread: new THREE.Vector3(size, size, size)
        },

        velocity: {
          value: new THREE.Vector3(0, -100, 0),
          spread: new THREE.Vector3(1, 10, 1)
        },

        color: {
          value: [ new THREE.Color(0xff44cc), new THREE.Color(0x882266) ]
        },

        opacity: {
          value: [0.5, 0.08, 0.02, 0]
        },
        
        size: {
          value: [0.3, 3.0],
          spread: 0.3
        },

        particleCount: 3000,
      });

      this.particle.group.addEmitter(this.particle.emitter);
    },

    loaded: function(geometry, materials) {
      var material = new THREE.MeshPhongMaterial({
        color: 0x222222
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;

      this.object.add(this.mesh);
    },

    update_sound: function() {
      this.sound.set_volume(clerp(0, this.throttle, 1, 0, 1.0));
      this.sound.set_pitch(clerp(0, this.throttle, 1, 0.3, 1.0));
      this.sound.set_position(this.object.position);
      this.sound.set_velocity(this.body.velocity);

      var orientation = new THREE.Vector3(0, 1, 0);
      orientation.applyQuaternion(this.object.quaternion);
      
      this.sound.set_orientation(orientation, new THREE.Vector3(0, 0, -1));
//      this.sound.set_volume(clerp(0, this.throttle, 1, 0, 1.0));
//      this.sound.set_volume(0);
    },

    tick: function() {
      base.tick.apply(this, arguments);

      this.update_sound();
      
    }

  }
});

