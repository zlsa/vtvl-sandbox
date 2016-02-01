
var Engine = Obj.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/new-shepard/be-3.json';
      this.vehicle = null;

      this.throttle = 1;
      this.max_thrust = 490000;
      this.gimbal = [0, 0];

      this.max_gimbal = radians(10);

      base.init.apply(this, arguments);
      
      this.init_particles();
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

    init_particles: function() {
      this.particle = {}
      
      this.particle.group = new SPE.Group({
        texture: {
          value: THREE.ImageUtils.loadTexture('/images/flame.png')
        },
        maxParticleCount: 4000
      });

      var size = 0.4;

      this.particle.emitter = new SPE.Emitter({
        maxAge: {
          value: 0.4,
          spread: 0.2
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
          value: new THREE.Vector3(0, -30, 0),
          spread: new THREE.Vector3(10, 10, 10)
        },

        color: {
          value: [ new THREE.Color(0xffccaa), new THREE.Color(0xaa33aa) ]
        },

        opacity: {
          value: [0.3, 0.02, 0]
        },
        
        size: {
          value: [1.0, 5.0],
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
      this.throttle = clamp(0, this.throttle, 1);
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
      this.particle.group.tick(elapsed);
      
      this.gimbal[0] = Math.sin(this.game.get_time() * 10);
      this.gimbal[1] = Math.sin(this.game.get_time() * 5);
      this.clamp_values();
      
      this.apply_force();

      this.mesh.rotation.x = -this.gimbal[1] * this.max_gimbal;
      this.mesh.rotation.z = -this.gimbal[0] * this.max_gimbal;
      this.mesh.rotation.x += Math.PI * 0.5;
      this.mesh.updateMatrix();
      
      base.tick.call(this, elapsed);
      
    }

  }
});

