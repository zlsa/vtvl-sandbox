
var Autopilot = Fiber.extend(function(base) {
  return {

    init: function(game, vehicle) {
      this.game = game;
      this.vehicle = vehicle;

      this.throttle = 0;
      this.gimbal = [0, 0];
      
      this.start = false;

      this.pids = [];
      
      this.init_autopilot();
    },

    new_pid: function(k_p, k_i, k_d, i_max) {
      var c = new Controller(k_p, k_i, k_d, i_max);
      this.pids.push(c);
      return c;
    },

    engine_start: function() {
      this.start = true;
    },

    engine_stop: function() {
      this.start = false;
    },

    tick: function(elapsed) {
      this.time = this.game.get_time();
      this.tick_autopilot();

      for(var i=0; i<this.pids.length; i++) {
        this.pids[i].update(elapsed);
      }
      
      if(this.start)
        this.vehicle.engine_start();
      else
        this.vehicle.engine_stop();

      if(!isNaN(this.throttle))
        this.vehicle.set_throttle(this.throttle);
      if(!isNaN(this.gimbal[0]) && !isNaN(this.gimbal[1]))
        this.vehicle.set_gimbal(this.gimbal);
    }

  }
});

var XaeroAutopilot = Autopilot.extend(function(base) {
  return {

    init_autopilot: function() {
      this.rest_altitude = 2.3;
      
      this.altitude_pid = this.new_pid(0.5, 0.1, 0, 5);
      this.vspeed_pid = this.new_pid(0.8, 0.3, 0, 2.0);
      this.vspeed_pid.limits = [0, 1];
      
      this.hspeed_x_pid = this.new_pid(0.1, 0.001, 0);
      this.hspeed_y_pid = this.new_pid(0.1, 0.001, 0);
      var x = 0.2;
      this.hspeed_x_pid.limits = [-x, x];
      this.hspeed_y_pid.limits = [-x, x];
      this.pitch_x_pid = this.new_pid(4, 0.3, 1.5);
      this.pitch_y_pid = this.new_pid(4, 0.3, 1.5);
      this.pitch_velocity_x_pid = this.new_pid(2, 0.05, 0);
      this.pitch_velocity_y_pid = this.new_pid(2, 0.05, 0);

      var max_angle = radians(20);
      this.pitch_x_pid.limits = [-max_angle, max_angle];
      this.pitch_y_pid.limits = [-max_angle, max_angle];
      this.pitch_velocity_x_pid.limits = [-1, 1];
      this.pitch_velocity_y_pid.limits = [-1, 1];

      this.states = [
        'preidle',
        'startup',
        'liftoff',
        'ascent',
        'hover',
        'translate',
        'descent',
        'land',
        'shutdown'
      ];

      this.target_crossrange = new THREE.Vector2(0, 0);

      this.state = 'preidle';
    },

    set_state: function(state) {
      this.state = state;
    },

    next_state: function() {
      var current = this.states.indexOf(this.state);
      if(current < 0 || current >= this.states.length) return;
      this.set_state(this.states[current+1]);
    },

    tick_autopilot: function() {
      var fuzz = 0.05;
      var liftoff_altitude = 0.5;
      var hover_time = 2;
      var translate_time = 20;
      var hover_altitude = 20;
      var ground_altitude = 0.0;
      var landing_altitude = hover_altitude - 10;

      var crossrange = this.vehicle.get_crossrange();
      var range = crossrange.length();
      var altitude = this.vehicle.get_altitude() - this.rest_altitude;
      var vspeed = this.vehicle.get_vspeed();
      var hspeed = this.vehicle.get_hspeed();

      var target_crossrange = new THREE.Vector2(0, 0);
      var target_range = target_crossrange.length();
      var target_hspeed = crossrange.length() - target_range;

      var orientation = this.vehicle.get_orientation();
      var angular_velocity = this.vehicle.get_angular_velocity();

      var pitch = new THREE.Vector3(0, 0, 1);
      pitch.applyQuaternion(orientation);

      var pitch_velocity = new THREE.Vector3(0, 0, 1);
      pitch_velocity.applyEuler(angular_velocity);

      var cr = '';
      cr += crossrange.x.toFixed(2);
      cr += ', ';
      cr += crossrange.y.toFixed(2);
//      console.log(cr);

      if(this.state == 'startup') {
        this.engine_start();
        this.set_state('liftoff');
      } else if(this.state == 'shutdown' || this.state == 'abort') {
        this.engine_stop();
      }

      var target_altitude = 0;
      if(this.state == 'startup') target_altitude = 0;
      else if(this.state == 'ascent') target_altitude = hover_altitude + 3;
      else if(this.state == 'hover') target_altitude = hover_altitude + 3;
      else if(this.state == 'translate') target_altitude = hover_altitude + 3;
      else if(this.state == 'descent') target_altitude = 0;
      
      if(this.state == 'preidle' || this.state == 'startup' ||
         this.state == 'liftoff' || this.state == 'ascent' || this.state == 'hover')
        target_crossrange.set(0, 0);
      else target_crossrange.set(-30, 10);

      this.altitude_pid.set_target(target_altitude);
      this.altitude_pid.set_measure(altitude);

      this.vspeed_pid.set_target(this.altitude_pid.get());
      this.vspeed_pid.set_measure(vspeed);

      //

//      console.log(this.crossrange_x_pid.get());

      var x_offset = (target_crossrange.x - crossrange.x);
      var y_offset = (target_crossrange.y - crossrange.y);

      x_offset *= clerp(0, this.throttle, 1, 0.2, 1);
      y_offset *= clerp(0, this.throttle, 1, 0.2, 1);
      
      this.hspeed_x_pid.set_target(x_offset * 0.2);
      this.hspeed_y_pid.set_target(y_offset * 0.2);
      this.hspeed_x_pid.set_measure(hspeed.x);
      this.hspeed_y_pid.set_measure(hspeed.y);

      this.pitch_x_pid.set_target(this.hspeed_x_pid.get());
      this.pitch_x_pid.set_measure(pitch.x);
      this.pitch_y_pid.set_target(this.hspeed_y_pid.get());
      this.pitch_y_pid.set_measure(pitch.y);

      var target_pitch_velocity = new THREE.Vector3(0, 0, 0);
      target_pitch_velocity.x = this.pitch_x_pid.get();
      target_pitch_velocity.y = this.pitch_y_pid.get();

      target_pitch_velocity.applyQuaternion(orientation);

      this.pitch_velocity_x_pid.set_target(target_pitch_velocity.x);
      this.pitch_velocity_x_pid.set_measure(pitch_velocity.x);
      this.pitch_velocity_y_pid.set_target(target_pitch_velocity.y);
      this.pitch_velocity_y_pid.set_measure(pitch_velocity.y);

      this.gimbal[0] = -this.pitch_velocity_x_pid.get();
      this.gimbal[1] = -this.pitch_velocity_y_pid.get();
      
//      log_array([degrees(this.pitch_x_pid.get()), degrees(pitch.x)]);
//      log_array([degrees(target_pitch_velocity.x), degrees(pitch_velocity.x)]);
//      log_array([hspeed.x, this.crossrange_x_pid.get()]);
//      log_array([crossrange.x, crossrange.y]);

//      this.gimbal[1] = gimbal.y;

      if(this.state == 'land') {
        var vspeed = clerp(2, altitude, 70, 0, -15);
        vspeed += clerp(0, altitude, 2, -0.02, -2);
        this.vspeed_pid.set_target(vspeed);
      }

      this.throttle = this.vspeed_pid.get();

      if(this.state == 'liftoff') {
        this.throttle = 1;
      }

      var offset = distance_2d(target_crossrange.x - crossrange.x, target_crossrange.y - crossrange.y);
      $('#state').text(offset.toFixed(2) + 'm ' + this.state);

      if(this.time > 2 && this.state == 'preidle') {
        this.set_state('startup');
      } else if(altitude > liftoff_altitude && this.state == 'liftoff') {
        this.set_state('ascent');
      } else if(altitude > hover_altitude && this.state == 'ascent') {
        this.set_state('hover');
        this.hover_start = this.time;
      } else if((this.time - this.hover_start) > hover_time && this.state == 'hover') {
        this.set_state('translate');
        this.hover_start = this.time;
      } else if(((this.time - this.hover_start) > translate_time) && this.state == 'translate') {
        this.set_state('descent');
      } else if(offset < 0.5 && this.state == 'translate') {
        this.set_state('descent');
      } else if(altitude < landing_altitude+fuzz && this.state == 'descent') {
        this.set_state('land');
      } else if((altitude < ground_altitude+fuzz || vspeed > 0)&& this.state == 'land') {
        this.set_state('shutdown');
      } else if(this.time > 60 && this.state != 'shutdown') {
        this.set_state('abort');
      }

    }

  }
});

