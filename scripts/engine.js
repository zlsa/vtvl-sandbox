
var Engine = Obj.extend(function(base) {
  return {

    init: function(game) {
      this.vehicle = null;

      this.throttle_command = 0;
      this.gimbal_command = [0, 0];

      this.gimbal = [0, 0];
      this.throttle = 0;
      

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

    remove: function() {
      this.object.remove(this.light);
      this.mesh.remove(this.particle.group.mesh);
      
      base.remove.call(this);
    },

    get_isp: function() {
      return this.isp[0];
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

    get_thrust_fraction: function() {
      return this.get_thrust() / this.max_thrust;
    },

    get_physics_thrust: function() {
      return this.get_thrust() * this.game.mass_multiplier;
    },

    clamp_values: function() {
      this.gimbal_command[0] = clamp(-1, this.gimbal_command[0], 1);
      this.gimbal_command[1] = clamp(-1, this.gimbal_command[1], 1);
      this.throttle_command = clamp(this.throttle_range[0], this.throttle_command, this.throttle_range[1]);
      
      if(!this.is_running()) this.throttle_command = 0;
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

    update_sound: function() {
      this.sound.set_volume(clerp(0, this.throttle, 1, 0, 1));
      this.sound.set_pitch(clerp(0, this.throttle, 1, 0.3, 1.0));
      this.sound.set_position(this.object.position);
      this.sound.set_velocity(this.body.velocity);

      var orientation = new THREE.Vector3(0, 0, -1);
      orientation.applyQuaternion(this.object.quaternion);
      
      this.sound.set_orientation(orientation, new THREE.Vector3(0, 0, -1));
    },

    tick: function(elapsed) {
      this.clamp_values();

      this.throttle += (this.throttle_command - this.throttle) / (this.throttle_response / elapsed);
      if(!this.is_running())
        this.throttle /= 0.1 / elapsed;
      this.throttle = clamp(0, this.throttle, 1);
      
      this.gimbal[0] += (this.gimbal_command[0] - this.gimbal[0]) / (this.gimbal_response / elapsed);
      this.gimbal[0] = clamp(-1, this.gimbal[0], 1);
      this.gimbal[1] += (this.gimbal_command[1] - this.gimbal[1]) / (this.gimbal_response / elapsed);
      this.gimbal[1] = clamp(-1, this.gimbal[1], 1);
      
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
      
      this.light.intensity = clerp(0, this.throttle, 1, 0, 1);
      var spread = 0.1;
      this.light.intensity *= clerp(0, perlin.get1d(this.game.get_time() * 6), 1, 1-spread, 1+spread);
      
      this.update_sound();
      
      base.tick.call(this, elapsed);
      
    }

  }
});

var BipropEngine = Engine.extend(function(base) {
  return {

    init: function(game, fuel_tank, oxidizer_tank) {
      base.init.apply(this, arguments);

      this.ratio = 1;
        
      this.fuel_tank = fuel_tank;
      this.oxidizer_tank = oxidizer_tank;
    },

    has_propellant: function() {
      return this.fuel_tank.has_propellant() && this.oxidizer_tank.has_propellant();
    },

    is_running: function() {
      return base.is_running.call(this) && this.has_propellant();
    },

    update_propellant_flow: function() {
      var total_flow = this.get_thrust() / (9.81 * this.get_isp());
      
      var fuel_flow = total_flow / (1 + this.ratio);
      var oxidizer_flow = fuel_flow * this.ratio;

      this.fuel_tank.add_flow(fuel_flow);
      this.oxidizer_tank.add_flow(oxidizer_flow);
    },

    tick: function(elapsed) {
      base.tick.call(this, elapsed);
      
      this.update_propellant_flow();
    }

  }
});

