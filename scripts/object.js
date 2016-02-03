
var Obj = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;
      this.world = this.game.world;

      if(this.init_physics)
        this.init_physics();
      this.init_render();
    },

    remove: function() {
      this.destroyed = true;
      
      var scene = this.game.get_render_scene();
      var world = this.game.get_physics_world();
      scene.remove(this.object);

      this.object.remove(this.mesh);

      if(this.body)
        world.remove(this.body);
      
    },

    init_render: function() {
      this.object = new THREE.Object3D();
      
      if(!this.model_url) return;
      var obj = this;
      this.game.get_loader().load_json_model(this.model_url, function() {
        obj.loaded.apply(obj, arguments);
      });
    },

    init_shadow: function() {
      this.shadow = new THREE.SpotLight(0x000000, 1);
      this.shadow.castShadow = true;
      
      var spot_distance = 1000;
      var spot_start = 20;
      var spot_end = 1000;

      var shadow_size = 1024;
      
      this.shadow.shadowCameraNear = spot_distance - spot_start;
      this.shadow.shadowCameraFar = spot_distance + spot_end;

      this.shadow.shadowBias = -0.00003;
      this.shadow.shadowDarkness = 0.8;
      this.shadow.shadowMapWidth = shadow_size;
      this.shadow.shadowMapHeight = shadow_size;
      this.shadow.shadowCameraFov = 0.3;
      
      this.shadow.target = this.object;
    },

    set_material: function(material) {
      this.body.material = material;
    },

    done: function() {
      if(this.body)
        this.game.get_physics_world().add(this.body);
      this.game.get_render_scene().add(this.object);

      if(this.shadow) {
        this.game.get_render_scene().add(this.shadow);
      }
    },

    tick: function(elapsed) {
      var spot_distance = 1000;

      if(this.shadow) {
        this.shadow.position.copy(this.game.renderer.sun.position);
        this.shadow.position.setLength(spot_distance);
        this.shadow.position.add(this.object.position);
      }

      if(this.body) {
        this.object.position.copy(this.body.position);
        this.object.quaternion.copy(this.body.quaternion);
      }
    }

  }
});

