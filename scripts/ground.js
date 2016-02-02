
var Ground = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;
      this.world = game.world;
      
      this.init_physics();
      this.init_render();
      
      var ground = this;
      this.game.get_loader().load_texture('images/grass.jpg', function(texture) {
        ground.mesh.material.bumpMap = texture;
        ground.mesh.material.bumpScale = 1;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
      });

    },

    init_physics: function() {
      this.body = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
      this.set_material(this.world.get_material('ground'));
    },

    init_render: function() {
      var size = 10000;
      var geometry = new THREE.PlaneGeometry(size, size);
      var material = new THREE.MeshPhongMaterial({
        color: 0x886633,
        specular: 0x0,
        shininess: 0
      });

      for(var i=0; i<geometry.faceVertexUvs.length; i++) {
        var z = geometry.faceVertexUvs[i];
        for(var j=0; j<z.length; j++) {
          for(var k=0; k<z[j].length; k++) {
            z[j][k].x *= 500;
            z[j][k].y *= 500;
          }
        }
      }
      window.g = geometry;
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.receiveShadow = true;
    },

    set_material: function(material) {
      this.body.material = material;
    },

    done: function() {
      this.game.get_physics_world().add(this.body);
      this.game.get_render_scene().add(this.mesh);
    },

    tick: function(elapsed) {

    }

  }
});
