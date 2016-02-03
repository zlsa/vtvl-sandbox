
var Renderer = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;

      this.scene = new THREE.Scene();

      this.cameras = [];
      this.active_camera = 0;

      if('camera' in localStorage)
        this.active_camera = localStorage['camera'];
      //
      this.camera = this.new_camera();

      this.camera.camera.position.z = 10;
      this.camera.camera.position.x = -20;
      this.camera.camera.position.y = -40;
      this.camera.camera.fov = 20;

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

      this.fog = new THREE.FogExp2(0xffffff, 0.0005);
      this.scene.fog = this.fog;

      $('#canvas').append(this.renderer.domElement);
    },

    new_camera: function() {
      var camera = new PerspectiveCamera(this.game);
      this.cameras.push(camera);
      return camera;
    },

    init_sun: function() {
      this.sun = new THREE.DirectionalLight( 0xffeecc, 1.3);
      this.sun.position.set(0.0, -0.8, 1);
      this.sun.position.normalize();
      this.add(this.sun);
    },

    init_skydome: function() {
      var renderer = this;
      this.game.get_loader().load_texture('images/skydome/skydome.jpg', function(texture) {
        var material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
          depthWrite: false,
          fog: false
        });

        var skyGeo = new THREE.SphereGeometry(50000, 25, 25);

        renderer.skydome = new THREE.Mesh(skyGeo, material);
        renderer.skydome.rotation.x = Math.PI * 0.5;
        renderer.scene.add(renderer.skydome);
        
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
      }
      
    },

    next_camera: function(offset) {
      this.active_camera += offset || 1;
      this.active_camera = this.active_camera % this.cameras.length;

      localStorage['camera'] = this.active_camera;
    },
    
    get_active_camera: function() {
      this.active_camera = this.active_camera % this.cameras.length;
      return this.cameras[this.active_camera];
    },

    tick: function(elapsed) {
      var distance = this.camera.camera.position.distanceTo(this.game.vehicles[0].body.position);
      
      this.camera.auto_zoom(distance, 20);
      this.camera.camera.lookAt(this.game.vehicles[0].body.position);
      
      var camera = this.get_active_camera();
      camera.tick(elapsed);

      var position = camera.object.position.clone();
      position.applyMatrix4(camera.object.matrixWorld);
      
      this.skydome.position.copy(position);

      this.renderer.render(this.scene, camera.camera);
    }

  }
});
