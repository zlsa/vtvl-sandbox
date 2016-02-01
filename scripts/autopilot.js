
var Autopilot = Fiber.extend(function(base) {
  return {

    init: function(game, vehicle) {
      this.game = game;
      this.vehicle = vehicle;

      this.throttle = 0;
      this.gimbal = [0, 0];
    },

    tick: function(elapsed) {
      this.vehicle.engine.start();
      this.vehicle.set_throttle(clerp(-1, Math.sin(time()), 1, 0.8, 1));
      this.vehicle.set_gimbal(this.gimbal);
    }

  }
});

