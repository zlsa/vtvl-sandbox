
var XaeroAlcoholTank = AlcoholTank.extend(function(base) {
  return {
    init: function() {
      this.dry_mass = 15;
      this.amount = 110;
      this.capacity = 110;
      
      base.init.apply(this, arguments);
    },
    
    init_physics: function() {
      this.shape = new CANNON.Sphere(0.1);
      
      base.init_physics.call(this);
    },

  }
});


var XaeroLiquidOxygenTank = LiquidOxygenTank.extend(function(base) {
  return {
    init: function() {
      this.dry_mass = 25;
      this.amount = 110 * 1.7;
      this.capacity = 110 * 1.7;
      
      base.init.apply(this, arguments);
    },
    
    init_physics: function() {
      this.shape = new CANNON.Sphere(0.1);
      
      base.init_physics.call(this);
    },

  }
});

var ScimitarEngine = BipropEngine.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/xaero/scimitar.json';

      this.isp = [284, 338];

      this.throttle_response = 0.08;
      this.gimbal_response = 0.03;
      
      this.color = 0xff88cc;

      this.mass = 15;
      
      this.throttle_range = [0.1, 1];
      
      this.max_thrust = 5300;
      this.max_gimbal = radians(5);
      
      this.restarts = 3;

      this.sound = new Sound(game, 'vehicles/xaero/audio/running.wav');

      base.init.apply(this, arguments);
      
      this.ratio = 1.7;
    },

    remove: function() {
      this.sound.remove();
      
      base.remove.call(this);
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

  }
});

var XaeroVehicle = Vehicle.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/xaero/xaero.json';
      
      this.mass = 40;
      
      base.init.apply(this, arguments);

      this.init_propellant_tanks();
      this.init_engines();
      
      this.shadow.shadowCameraFov = 0.3;
      
      this.camera.camera.position.z = 0.1;
      this.camera.camera.position.y = 0;
      this.camera.camera.position.x = 0.42;
      this.camera.camera.rotation.x = 0;
      this.camera.camera.rotation.z = Math.PI * 1.5;
      this.camera.camera.rotation.y -= Math.PI * 0.1;
      
      this.camera.camera.near = 0.1;
      this.camera.camera.far = 5000;
      this.camera.camera.fov = 60;

    },

    remove: function() {
      this.fuel_tank.remove();
      this.oxidizer_tank.remove();

      base.remove.call(this);
    },

    get_mass: function() {
      return base.get_mass.call(this) + this.fuel_tank.get_mass() + this.oxidizer_tank.get_mass();
    },

    init_propellant_tanks: function() {
      this.fuel_tank = new XaeroAlcoholTank(this.game);
      this.oxidizer_tank = new XaeroLiquidOxygenTank(this.game);
    },

    init_engines: function() {
      this.engine = new ScimitarEngine(this.game, this.fuel_tank, this.oxidizer_tank);
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
      
      this.body.position.set(0, 0, 3);
    },

    loaded: function(geometry, materials) {
      var material = new THREE.MeshPhongMaterial({
        color: 0xdddddd,
        shininess: 100,
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
      this.engine.add_to_vehicle(this, new CANNON.Vec3(0.0, 0.0, -1.8));
      
      this.fuel_tank.done();
      this.fuel_tank.add_to_vehicle(this, new CANNON.Vec3(0, 0, 0.8));
      
      this.oxidizer_tank.done();
      this.oxidizer_tank.add_to_vehicle(this, new CANNON.Vec3(0, 0, -0.8));
    },

    tick: function(elapsed) {
      base.tick.call(this, elapsed);

      this.engine.tick(elapsed);
      
      this.fuel_tank.tick(elapsed);
      this.oxidizer_tank.tick(elapsed);
    }

  }
});


////////////////////////////////////////////////
// AUTOPILOT
////////////////////////////////////////////////

var XaeroAutopilot = Autopilot.extend(function(base) {
  return {

    init_autopilot: function() {
      this.rest_altitude = 2.3 + 0.1;
      
      this.altitude_pid = this.new_pid(0.8, 0.05, 0, 3);
      this.vspeed_pid = this.new_pid(2.0, 0.7, 0, 3);
      this.vspeed_pid.limits = [0, 1];
      
      this.hspeed_x_pid = this.new_pid(0.1, 0.001, 0);
      this.hspeed_y_pid = this.new_pid(0.1, 0.001, 0);
      var x = 0.2;
      this.hspeed_x_pid.limits = [-x, x];
      this.hspeed_y_pid.limits = [-x, x];
      this.pitch_x_pid = this.new_pid(4, 0.3, 1.5);
      this.pitch_y_pid = this.new_pid(4, 0.3, 1.5);
      this.pitch_velocity_x_pid = this.new_pid(2.5, 0.08, 0);
      this.pitch_velocity_y_pid = this.new_pid(2.5, 0.08, 0);

      var max_angle = radians(20);
      this.pitch_x_pid.limits = [-max_angle, max_angle];
      this.pitch_y_pid.limits = [-max_angle, max_angle];
      this.pitch_velocity_x_pid.limits = [-1, 1];
      this.pitch_velocity_y_pid.limits = [-1, 1];

      this.target_crossrange = new THREE.Vector2(0, 0);

      this.init_states();
    },

    get_state: function(state) {
      return this.states[this.state];
    },

    get_state_index: function(state) {
      return this.states.indexOf(state);
    },

    next_state: function() {
      if(this.state < 0 || this.state >= this.states.length) return;
      this.state += 1;
    },

    tick_throttle: function(target_altitude) {
      var measured_orientation = this.vehicle.get_orientation();
      
      var measured_altitude = this.vehicle.get_altitude() - this.rest_altitude;
      var measured_vspeed = this.vehicle.get_vspeed();
      
      this.altitude_pid.set_target(target_altitude);
      this.altitude_pid.set_measure(measured_altitude);

      var target_vspeed = this.altitude_pid.get()
      target_vspeed *= clerp(-10, target_vspeed, 0, 0.5, 1);

      this.vspeed_pid.set_target(target_vspeed);
      this.vspeed_pid.set_measure(measured_vspeed);

      var thrust_vector = new THREE.Vector3(this.gimbal[0], this.gimbal[1], 1);
      thrust_vector.applyQuaternion(measured_orientation);
      thrust_vector = thrust_vector.angleTo(new THREE.Vector3(0, 0, 1));
      
      this.throttle *= Math.cos(thrust_vector); // account for cosine losses
      
    },

    tick_hspeed: function(target_crossrange) {
      var measured_crossrange = this.vehicle.get_crossrange();
      
      var measured_orientation = this.vehicle.get_orientation();
      var measured_angular_velocity = this.vehicle.get_angular_velocity();

      var measured_hspeed = this.vehicle.get_hspeed();
      var measured_pitch = new THREE.Vector3(0, 0, 1);
      measured_pitch.applyQuaternion(measured_orientation);

      var measured_pitch_velocity = new THREE.Vector3(0, 0, 1);
      measured_pitch_velocity.applyEuler(measured_angular_velocity);

      var x_offset = (target_crossrange.x - measured_crossrange.x);
      var y_offset = (target_crossrange.y - measured_crossrange.y);

      x_offset *= clerp(0, Math.abs(x_offset), 15, 1.5, 1);
      y_offset *= clerp(0, Math.abs(y_offset), 15, 1.5, 1);
      
      x_offset *= clerp(0, Math.abs(x_offset), 2, 3, 1);
      y_offset *= clerp(0, Math.abs(y_offset), 2, 3, 1);
      
      x_offset *= clerp(0, this.vehicle.engine.get_thrust_fraction(), 1, 1.3, 1);
      y_offset *= clerp(0, this.vehicle.engine.get_thrust_fraction(), 1, 1.3, 1);

      this.hspeed_x_pid.set_target(x_offset * 0.2);
      this.hspeed_y_pid.set_target(y_offset * 0.2);
      this.hspeed_x_pid.set_measure(measured_hspeed.x);
      this.hspeed_y_pid.set_measure(measured_hspeed.y);
    },

    tick_gimbal: function(target_hspeed) {
      if(!target_hspeed)
        target_hspeed = [this.hspeed_x_pid.get(), this.hspeed_y_pid.get()];
      var measured_orientation = this.vehicle.get_orientation();
      var measured_angular_velocity = this.vehicle.get_angular_velocity();

      var measured_hspeed = this.vehicle.get_hspeed();
      var measured_pitch = new THREE.Vector3(0, 0, 1);
      measured_pitch.applyQuaternion(measured_orientation);

      var measured_pitch_velocity = new THREE.Vector3(0, 0, 1);
      measured_pitch_velocity.applyEuler(measured_angular_velocity);

      this.pitch_x_pid.set_target(target_hspeed[0]);
      this.pitch_x_pid.set_measure(measured_pitch.x);
      this.pitch_y_pid.set_target(target_hspeed[1]);
      this.pitch_y_pid.set_measure(measured_pitch.y);

      var target_pitch_velocity = new THREE.Vector3(0, 0, 0);
      target_pitch_velocity.x = this.pitch_x_pid.get();
      target_pitch_velocity.y = this.pitch_y_pid.get();

      target_pitch_velocity.applyQuaternion(measured_orientation);

      this.pitch_velocity_x_pid.set_target(target_pitch_velocity.x);
      this.pitch_velocity_x_pid.set_measure(measured_pitch_velocity.x);
      this.pitch_velocity_y_pid.set_target(target_pitch_velocity.y);
      this.pitch_velocity_y_pid.set_measure(measured_pitch_velocity.y);

    },

    tick_info: function() {
      var measured_altitude = this.vehicle.get_altitude() - this.rest_altitude + 0.01;
      
      $('#info .fps').text(Math.round(fps));
      $('#info .state').text(this.get_state());
      $('#info .altitude').text(measured_altitude.toFixed(2) + 'm');
      $('#info .thrust').text(Math.round(this.vehicle.engine.get_thrust_fraction() * 100) + '%');
      $('#info .mass').text(this.vehicle.get_mass().toFixed(2) + 'kg');
      $('#info .fuel-percent').text(this.vehicle.fuel_tank.get_amount().toFixed(2) + 'kg');
      $('#info .oxidizer-percent').text(this.vehicle.oxidizer_tank.get_amount().toFixed(2) + 'kg');
    },
    
    tick_autopilot: function() {
      this.tick_throttle(0);
      
      this.tick_gimbal(new THREE.Vector2(0, 0));

      this.throttle = this.vspeed_pid.get();
      this.gimbal[0] = -this.pitch_velocity_x_pid.get();
      this.gimbal[1] = -this.pitch_velocity_y_pid.get();
      
      this.tick_info();
    }

  }
});

var XaeroInflightRestartAutopilot = XaeroAutopilot.extend(function(base) {
  return {

    init_states: function() {
      this.time = 0;
      
      this.states = [
        'preidle',
        'startup',
        'liftoff',
        'hover',
        'boost',
        'inflight-shutdown',
        'coast',
        'inflight-startup',
        'hover',
        'descent',
        'land',
        'shutdown',
        'safe'
      ];

      this.state = 0;
    },

    tick_autopilot: function() {

      var constants = {
        'liftoff-altitude': 5, // full throttle until this high
        
        'hover-altitude': 50,
        'hover-time': 20,
        
        'boost-vspeed': 20,
        
        'extra-altitude': 3,

        'land-altitude': 10,
        'touchdown-altitude': 0.05
      };
      
      var target_altitude = 0;
      var target_crossrange = new THREE.Vector2(0, 0);

      var measured_crossrange = this.vehicle.get_crossrange();
      var measured_altitude = this.vehicle.get_altitude() - this.rest_altitude;
      var measured_vspeed = this.vehicle.get_vspeed();

      var state = this.get_state();

      if(state == 'hover')
        target_altitude = constants['hover-altitude'];
      if(state == 'descent')
        target_altitude = 0;

      var target_hspeed = [0, 0];

      if(state == 'hover') {
        target_crossrange.set(-100, 50);
        target_hspeed = this.tick_hspeed(target_crossrange);
      }
      
      this.tick_throttle(target_altitude);
      this.tick_gimbal(target_hspeed);

      if(state == 'land') {
        var vspeed = clerp(2, measured_altitude, 70, 0, -15);
        vspeed += clerp(0, measured_altitude, 2, -0.02, -3);
        this.vspeed_pid.set_target(vspeed);
      }

      this.throttle = this.vspeed_pid.get();
      
      if(state == 'liftoff' || state == 'boost') {
        this.throttle = 1;
      }
      
      this.gimbal[0] = -this.pitch_velocity_x_pid.get();
      this.gimbal[1] = -this.pitch_velocity_y_pid.get();

      if(state == 'inflight-startup')
        this.hover_start_time = this.time;
      
      if(state == 'startup' || state == 'inflight-startup') {
        this.engine_start();
        this.next_state();
      } else if(state == 'shutdown' || state == 'inflight-shutdown') {
        this.engine_stop();
        this.next_state();
      }

      if(this.time > 2 && state == 'preidle') {
        this.next_state();
      } else if(measured_altitude > constants['liftoff-altitude'] && state == 'liftoff') {
        this.next_state();
        this.hover_start_time = this.time;
      } else if(elapsed(this.time, this.hover_start_time) > constants['hover-time'] && state == 'hover') {
        this.next_state();
      } else if(measured_vspeed > constants['boost-vspeed'] && state == 'boost') {
        this.next_state();
        this.boost_end = measured_altitude + constants['extra-altitude'];
      } else if(measured_altitude < this.boost_end && state == 'coast') {
        this.next_state();
      } else if(measured_altitude < constants['land-altitude'] && state == 'descent') {
        this.next_state();
      } else if(measured_altitude < constants['touchdown-altitude'] && state == 'land') {
        this.next_state();
      }

      this.tick_info();
    }

  }
});

