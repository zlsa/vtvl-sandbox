
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

    engine_started: function() {
      return this.vehicle.engine_started();
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

