
var Ground = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;
      this.world = game.world;
      
      this.init_physics();
      this.init_render();
    },

    add_to_world: function(world) {
      world.add(this.body);
    },

    add_to_scene: function(scene) {
      scene.add(this.mesh);
    },

    init_physics: function() {
      this.body = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
      this.set_material(this.world.get_material('ground'));
    },

    init_render: function() {
      var geometry = new THREE.PlaneGeometry(10000, 10000);
      var material = new THREE.MeshPhongMaterial({
        color: 0x886633
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.receiveShadow = true;
    },

    set_material: function(material) {
      this.body.material = material;
    },

    done: function() {
      this.add_to_world(this.game.get_world());
      this.add_to_scene(this.game.get_scene());
    },

    tick: function(elapsed) {

    }

  }
});
