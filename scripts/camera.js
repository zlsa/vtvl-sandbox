
var PerspectiveCamera = Obj.extend(function(base) {
  return {

    init: function(game) {
      base.init.apply(this, arguments);

      this.init_camera();
    },

    init_camera: function() {
      this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.5, 100000);

      this.camera.up.set(0, 0, 1);

      this.object.add(this.camera);
    },

    resize: function(size) {
      this.camera.aspect = size[0]/size[1];
    },

    tick: function(elapsed) {
      var position = get_global_position(this.camera);
      this.game.get_sound().set_position(position);
      
      var orientation = new THREE.Vector3(0, 0, 1);
      orientation.applyQuaternion(this.camera.quaternion);
      
      this.game.get_sound().set_orientation(orientation, new THREE.Vector3(0, 0, 1));
      this.camera.updateProjectionMatrix();
      base.tick.call(this, elapsed);
    }

  }
});

