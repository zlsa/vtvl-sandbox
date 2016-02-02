
var Autopilot = Fiber.extend(function(base) {
  return {

    init: function(game, vehicle) {
      this.game = game;
      this.vehicle = vehicle;

      this.throttle = 0;
      this.gimbal = [0, 0];
    },

    tick: function(elapsed) {
//      this.gimbal[0] = Math.sin(this.game.get_time() * 5);
      this.gimbal[1] = 1;
      if(game.get_time() > 1) {
        this.vehicle.engine.start();
      }
      this.vehicle.set_throttle(clerp(-1, Math.sin(this.game.get_time() * 10), 1, 0.9, 1));
      this.vehicle.set_gimbal(this.gimbal);
    }

  }
});

