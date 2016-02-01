
var Loader = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;

      this.json_model_loader = new THREE.JSONLoader();
      this.texture_loader = new THREE.TextureLoader();
//      this.obj_model_loader = new THREE.OBJLoader();

      this.total = 0;
      this.complete = 0;
      
    },

    before_load: function() {
      this.total += 1;
    },

    after_load: function() {
      this.complete += 1;
      
      if(this.complete >= this.total) {
        done();
      }
    },

    load_json_model: function(url, callback) {
      this.before_load();
      var loader = this;
      this.json_model_loader.load(url, function() {
        loader.callback_json_model.call(loader, arguments, callback);
      });
    },
    
    callback_json_model: function(args, callback) {
      if(callback) {
        callback.apply(callback, args);
      }
      this.after_load();
    },

    //

    load_texture: function(url, callback) {
      this.before_load();
      var loader = this;
      this.texture_loader.load(url, function() {
        loader.callback_texture.call(loader, arguments, callback);
      });
    },
    
    callback_texture: function(args, callback) {
      if(callback) {
        callback.apply(callback, args);
      }
      this.after_load();
    }

  }
});

