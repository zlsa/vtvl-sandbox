
var PerspectiveCamera = Obj.extend(function(base) {
  return {

    init: function(game) {
      base.init.apply(this, arguments);

      this.init_camera();
    },

    init_camera: function() {
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.5, 100000);

      this.camera.position.z = 20;
      this.camera.position.y = -10;
      this.camera.rotation.x = Math.PI * 0.1;

      this.object.add(this.camera);
    },

    resize: function(size) {
      this.camera.aspect = size[0]/size[1];
    },

    tick: function(elapsed) {
      this.camera.updateProjectionMatrix();
      base.tick.call(this, elapsed);
    }

  }
});

