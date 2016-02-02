
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
      
      this.altitude_pid = this.new_pid(0.5, 0.15, 0, 5);
      this.vspeed_pid = this.new_pid(1.2, 0.4, 0, 1.0);
      this.vspeed_pid.limits = [0, 1];

      this.states = [
        'preidle',
        'startup',
        'liftoff',
        'hover',
        'descend',
        'land',
        'shutdown'
      ];

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
      $('#state').text(this.state);
      
      var liftoff_altitude = 0.01;
      var hover_altitude = 30;
      var landing_altitude = 1;
      var altitude = this.vehicle.get_altitude() - this.rest_altitude;
      var vspeed = this.vehicle.get_vspeed();

      if(this.time > 2 && this.state == 'preidle') {
        this.set_state('startup');
      } else if(altitude > liftoff_altitude && this.state == 'liftoff') {
        this.set_state('hover');
      } else if(altitude > hover_altitude && this.state == 'hover') {
        this.set_state('descend');
      } else if(altitude < landing_altitude && this.state == 'descend') {
        this.set_state('land');
      } else if(altitude < liftoff_altitude && this.state == 'land') {
        this.set_state('shutdown');
      } else if(this.time > 20 && this.state != 'shutdown') {
        this.set_state('abort');
      }

      if(this.state == 'startup') {
        this.engine_start();
        this.set_state('liftoff');
      } else if(this.state == 'shutdown' || this.state == 'abort') {
        this.engine_stop();
      }

      var target_altitude = 0;
      if(this.state == 'startup') target_altitude = 0;
      if(this.state == 'hover') target_altitude = hover_altitude + 0.5;
      if(this.state == 'descend') target_altitude = landing_altitude;
      else if(this.state == 'land') target_altitude = 0;

      this.altitude_pid.set_target(target_altitude);
      this.altitude_pid.set_measure(altitude);

      this.vspeed_pid.set_target(this.altitude_pid.get());
      this.vspeed_pid.set_measure(vspeed);

      if(this.state == 'land')
        this.vspeed_pid.set_target(clerp(0, altitude, 10, -0.05, -5));

      this.throttle = this.vspeed_pid.get();

      if(this.state == 'liftoff') {
        this.throttle = 1;
      }

    }

  }
});

