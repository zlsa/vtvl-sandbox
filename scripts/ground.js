
var Ground = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;
      this.world = game.world;
      
      this.init_physics();
      this.init_render();
      
      var ground = this;
      this.game.get_loader().load_texture('images/grass.jpg', function(texture) {
//        ground.mesh.material.map = texture;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
      });

      this.pads = [];

      this.new_pad(0, 0, 0);
      this.new_pad(-15, -10, 80);
      this.new_pad(-100, 50, 20);
    },

    new_pad: function(x, y, rot) {
      this.pads.push(new GroundPad(this.game, x, y, rot));
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

      for(var i=0; i<this.pads.length; i++)
        this.pads[i].done();
    },

    tick: function(elapsed) {
      for(var i=0; i<this.pads.length; i++)
        this.pads[i].tick();
    }

  }
});

var GroundPad = Obj.extend(function(base) {
  return {

    init: function(game, x, y, rot) {
      base.init.apply(this, arguments);
      
      this.move(x, y);
      this.rotate(radians(rot));
      
      this.init_camera();
//      this.init_shadow();
    },
    
    init_camera: function() {
      this.camera = {};
      this.camera.ground = this.game.renderer.new_camera();

      this.camera.ground.camera.position.z = 0.5;
      this.camera.ground.camera.position.y = 4;
      this.camera.ground.camera.rotation.x = Math.PI/2;
      this.camera.ground.camera.rotation.y = Math.PI;
      
      this.camera.ground.camera.fov = 60;
      
      this.object.add(this.camera.ground.object);
    },

    init_physics: function() {
      this.body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(2, 2, 0.1)) });
      this.set_material(this.world.get_material('ground'));
    },

    move: function(x, y) {
      this.body.position.set(x, y, 0);
      this.object.position.set(-x, -y, 0);
    },

    rotate: function(angle) {
      this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), angle);
      this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
    },

    init_render: function() {
      base.init_render.call(this);
      var geometry = new THREE.BoxGeometry(4, 4, 0.2);
      var material = new THREE.MeshPhongMaterial({
        color: 0x888888,
        shininess: 10,
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      
      this.object.add(this.mesh);
    },

  }
});
