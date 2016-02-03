
var Settings = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;

      this.settings = [];
      this.html = $('#settings');

      this.add_setting(new ButtonSetting('reset', function() {
        game.reset.call(game);
      }));
      
      this.add_setting(new ButtonSetting('next camera', function() {
        game.renderer.next_camera.call(game.renderer, 1);
      }));
    },

    add_setting: function(setting) {
      this.settings.push(setting);
      setting.add(this);
    },
    
  }
});

var ButtonSetting = Fiber.extend(function() {
  return {

    init: function(name, callback) {
      this.name = name;
      this.callback = callback;

      this.html = $('<li></li>');
      this.html.text(name);
      
      this.html.click(function() {
        callback();
      });
    },

    add: function(settings) {
      settings.html.append(this.html);
    }
    
  }
});