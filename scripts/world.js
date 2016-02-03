
var World = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;
      
      this.world = new CANNON.World();
      this.world.gravity.set(0, 0, -9.82);
      this.world.broadphase = new CANNON.NaiveBroadphase();

      this.world.solver.iterations = 80;
      this.world.solver.tolerance = 1e-10;

      world = this.world;

      this.init_materials();
    },

    get_world: function() {
      return this.world;
    },

    init_materials: function() {
      this.material = {};

      this.create_material('ground');
      this.create_material('tank');
      this.create_material('nozzle');

      this.create_contact_material('ground', 'ground', 0.5, 0.01);
      this.create_contact_material('ground', 'tank', 0.8, 0.01);
      this.create_contact_material('ground', 'nozzle', 1, 0.8);
      this.create_contact_material('tank', 'nozzle', 0.2, 0.8);
    },

    create_material: function(name) {
      this.material[name] = new CANNON.Material(name);
    },

    get_material: function(name) {
      return this.material[name];
    },

    create_contact_material: function(a, b, friction, restitution) {
      var cm = new CANNON.ContactMaterial(this.get_material(a), this.get_material(b), {
        friction: friction,
        restitution: restitution,
        contactEquationStiffness: 1e30,
        contactEquationRelaxation: 1.2
      });
      this.world.addContactMaterial(cm);
    },

    tick: function(elapsed) {
      this.world.step(elapsed);
    }

  }
});
