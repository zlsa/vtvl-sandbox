
var Renderer = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;

      this.scene = new THREE.Scene();

      this.cameras = [];

      //
      this.camera = this.new_camera();

      this.camera.position.z = 5;
      this.camera.position.y = -30;
      this.camera.up.set(0, 0, 1);
      //

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });

      this.renderer.setClearColor(0xaaccff, 1);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.init_sun();
      this.init_hemi();
      
      $('#canvas').append(this.renderer.domElement);
    },

    new_camera: function() {
      var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.cameras.push(camera);
      return camera;
    },

    init_sun: function() {
      this.sun = new THREE.DirectionalLight( 0xffffff, 1);
      this.sun.position.set(0.2, -0.5, 1);
      this.sun.position.normalize();
      this.add(this.sun);
    },

    init_hemi: function() {
      this.hemi = new THREE.HemisphereLight(0xaaccff, 0x205070, 0.6);
      this.add(this.hemi);
    },

    add: function(obj) {
      this.get_scene().add(obj);
    },

    get_scene: function() {
      return this.scene;
    },

    resize: function(size) {
      this.renderer.setSize(size[0], size[1]);

      for(var i=0; i<this.cameras.length; i++) {
        var camera = this.cameras[i];
        camera.setLens(35, 35);
        camera.aspect = size[0]/size[1];
        camera.updateProjectionMatrix();
      }
    },

    tick: function(elapsed) {
      this.camera.lookAt(this.game.vehicle.body.position);
      this.renderer.render(this.scene, this.game.vehicle.camera);
    }

  }
});
