
var Renderer = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;

      this.scene = new THREE.Scene();

      this.cameras = [];

      //
      this.camera = this.new_camera();

      this.camera.camera.position.z = 10;
      this.camera.camera.position.x = -50;
      this.camera.camera.position.y = -30;
      this.camera.camera.up.set(0, 0, 1);

      this.scene.add(this.camera.object);
      //

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        shadowMapCullFace: THREE.CullFaceFront,
        shadowMapCascade: true
      });

      this.renderer.setClearColor(0xddeeff, 1);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.init_sun();
      this.init_hemi();
      this.init_skydome();
      
      $('#canvas').append(this.renderer.domElement);
    },

    new_camera: function() {
      var camera = new PerspectiveCamera(this.game);
      this.cameras.push(camera);
      return camera;
    },

    init_sun: function() {
      this.sun = new THREE.DirectionalLight( 0xffffff, 1);
      this.sun.position.set(0.2, -0.5, 1);
      this.sun.position.normalize();
      this.add(this.sun);
    },

    init_skydome: function() {
      var renderer = this;
      this.game.get_loader().load_texture('images/skydome/skydome.jpg', function(texture) {
        var material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
          depthWrite: false
        });

        var skyGeo = new THREE.SphereGeometry(1000, 25, 25);

        renderer.sky = new THREE.Mesh(skyGeo, material);
        renderer.sky.rotation.x = Math.PI * 0.5;
        renderer.scene.add(renderer.sky);
        
      });
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
        this.cameras[i].resize(size);
//        var camera = this.cameras[i];
//        camera.aspect = size[0]/size[1];
//        camera.updateProjectionMatrix();
      }
      
    },

    get_active_camera: function() {
      return this.game.vehicles[0].camera;
      return this.camera;
    },

    tick: function(elapsed) {
      var distance = this.camera.object.position.distanceTo(this.game.vehicles[0].body.position);
      var size = 15;
      var fov = degrees(Math.atan2(size, distance)) * 2;

      fov = clamp(0.5, fov);

//      this.camera.camera.fov = fov;
      
      for(var i=0; i<this.cameras.length; i++) {
        this.cameras[i].tick();
      }

      var camera = this.get_active_camera();
      
      this.sky.position.copy(camera.camera.position);
      
      this.camera.camera.lookAt(this.game.vehicles[0].body.position);
      
      this.renderer.render(this.scene, camera.camera);
    }

  }
});
