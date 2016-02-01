
var Engine = Obj.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/new-shepard/be-3.json';
      this.vehicle = null;

      this.throttle = 0;
      this.throttle_range = [0.4, 1];
      
      this.max_thrust = 490000;
      this.gimbal = [0, 0];

      this.restarts = 3;
      this.started = false;

      this.flame = null;

      this.max_gimbal = radians(10);

      base.init.apply(this, arguments);

      var engine = this;
      this.game.get_loader().load_texture('images/flame.png', function(texture) {
        engine.flame = texture;
        engine.init_particles.call(engine);
      });

      this.init_light();
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

    add_to_scene: function(scene) {
      base.add_to_scene.apply(this, arguments);
      
      this.mesh.add(this.particle.group.mesh);
    },

    init_physics: function() {
      var shape = new CANNON.Cylinder(0.5, 0.1, 1.5, 12);
      
      this.body = new CANNON.Body({
        mass: 100,
        shape: shape
      });

      this.set_material(this.world.get_material('nozzle'));
    },

    init_light: function() {
      this.light = new THREE.PointLight(0xffaa44, 1, 150);
      this.light.position.set(0, 0, -3);
      this.object.add(this.light);
    },

    init_particles: function() {
      this.particle = {}
      
      this.particle.group = new SPE.Group({
        texture: {
          value: this.flame
        },
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
          spread: new THREE.Vector3(10, 100, 10)
        },

        color: {
          value: [ new THREE.Color(0xffaa00), new THREE.Color(0xff8800) ]
        },

        opacity: {
          value: [0.001, 0.01, 0.002, 0.0005, 0]
        },
        
        size: {
          value: [2, 6.0, 9.0],
          spread: 1
        },

        particleCount: 3000,
      });

      this.particle.group.addEmitter(this.particle.emitter);
    },

    add_to_vehicle: function(vehicle, position) {
      this.vehicle = vehicle;
      
      this.body.position = position;
      this.body.position.vadd(vehicle.body.position, this.body.position);
      
      this.constraint = new CANNON.LockConstraint(this.body, vehicle.body, {
        maxForce: 1e90
      });
      
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
      return this.max_thrust * this.throttle * this.game.mass_multiplier;
    },

    clamp_values: function() {
      this.gimbal[0] = clamp(-1, this.gimbal[0], 1);
      this.gimbal[1] = clamp(-1, this.gimbal[1], 1);
      this.throttle = clamp(this.throttle_range[0], this.throttle, this.throttle_range[1]);
      
      if(!this.is_running()) this.throttle = 0;
    },

    apply_force: function() {
      var thrust = this.get_thrust();

      var max = Math.sin(this.max_gimbal);
      var vector = new CANNON.Vec3(this.gimbal[0] * max, this.gimbal[1] * max, 1);
      vector.normalize();
      vector.mult(thrust, vector);

      this.body.applyLocalForce(vector, new CANNON.Vec3(0, 0, 0));
    },

    tick: function(elapsed) {
      this.clamp_values();
      
      this.apply_force();

      this.particle.emitter.activeMultiplier = this.throttle;

      var steps = 5;
      for(var i=0; i<steps; i++)
        this.particle.group.tick(elapsed / steps);
      
      this.light.intensity = clerp(0.4, this.throttle, 1, 0, 2);
      var spread = 0.1;
      this.light.intensity *= clerp(0, perlin.get1d(this.game.get_time() * 6), 1, 1-spread, 1+spread);

      this.mesh.rotation.x = -this.gimbal[1] * this.max_gimbal;
      this.mesh.rotation.z = -this.gimbal[0] * this.max_gimbal;
      this.mesh.rotation.x += Math.PI * 0.5;
      this.mesh.updateMatrix();
      
      base.tick.call(this, elapsed);
      
    }

  }
});

