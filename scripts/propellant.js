
var PropellantTank = Obj.extend(function(base) {
  return {

    init: function() {
      this.vehicle = null;

      this.dry_mass = this.dry_mass || 1;
      this.amount = this.amount || 0;
      this.capacity = this.capacity || 0;
      
      this.flow = 0;
      base.init.apply(this, arguments);
    },

    add_flow: function(flow) {
      this.flow += flow;
    },

    has_propellant: function() {
      if(this.amount > 0) return true;
    },

    get_fraction: function() {
      return this.amount / this.capacity;
    },

    get_mass: function() {
      return this.dry_mass + this.amount;
    },

    get_physics_mass: function() {
      return this.get_mass() * this.game.mass_multiplier;
    },

    init_physics: function() {
      this.body = new CANNON.Body({
        mass: this.get_physics_mass(),
        shape: this.shape
      });

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

    tick: function(elapsed) {
      this.body.mass = this.get_physics_mass();
        
      this.amount -= this.flow * elapsed;
      this.amount = clamp(0, this.amount, this.capacity);
      this.flow = 0;
    }

  }
});

var LiquidOxygenTank = PropellantTank.extend(function(base) {
  return {

  }
});


var AlcoholTank = PropellantTank.extend(function(base) {
  return {

  }
});

