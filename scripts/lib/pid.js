/**
 *  PID Controller.
 */
var Controller = function(k_p, k_i, k_d, i_max) {
  if (typeof k_p === 'object') {
    var options = k_p;
    k_p = options.k_p;
    k_i = options.k_i;
    k_d = options.k_d;
    i_max = options.i_max;
  }

  // PID constants
  this.k_p = (typeof k_p === 'number') ? k_p : 1;
  this.k_i = k_i || 0;
  this.k_d = k_d || 0;

  // Maximum absolute value of sumError
  this.i_max = i_max || 0;

  this.sumError  = 0;
  this.lastError = 0;
  this.lastTime  = 0;

  this.limits = [-Infinity, Infinity];

  this.target    = 0; // default value, can be modified with .setTarget
  this.currentValue = 0;
  this.output = 0;
};

Controller.prototype.set_target = function(target) {
  this.target = target;
};

Controller.prototype.set_measure = function(currentValue) {
  this.currentValue = currentValue;
};

Controller.prototype.get = function() {
  return this.output;
};

Controller.prototype.update = function(dt) {

  var error = (this.target - this.currentValue);
  this.sumError = this.sumError + error*dt;
  if (this.i_max > 0 && Math.abs(this.sumError) > this.i_max) {
    var sumSign = (this.sumError > 0) ? 1 : -1;
    this.sumError = sumSign * this.i_max;
  }

  var dError = (error - this.lastError)/dt;
  this.lastError = error;

  this.output = (this.k_p*error) + (this.k_i * this.sumError) + (this.k_d * dError);
  this.output = clamp(this.limits[0], this.output, this.limits[1]);
  return this.output;
};

Controller.prototype.reset = function() {
  this.sumError  = 0;
  this.lastError = 0;
  this.lastTime  = 0;
};
