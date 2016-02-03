
var SoundEnvironment = Fiber.extend(function() {
  return {

    init: function(game) {
      this.game = game;

      this.master_volume = 1;

      this.sounds = [];

      try {
        this.context = new AudioContext();
        this.listener = this.context.listener;
      } catch(e) {
        console.log('Web Audio API is not supported in this browser; no audio available');
      }
      
    },

    set_position: function(pos) {
      this.listener.setPosition(pos.x, pos.y, pos.z);
    },

    set_velocity: function(vel) {
      this.listener.setVelocity(vel.x, vel.y, vel.z);
    },

    set_orientation: function(rot, up) {
      this.listener.setOrientation(rot.x, rot.y, rot.z, up.x, up.y, up.z);
    },

    tick: function() {
      if(this.game.is_paused()) this.master_volume = 0;
      else this.master_volume = 1;
      for(var i=0; i<this.sounds.length; i++) {
        this.sounds[i].set_master_volume(this.master_volume);
      }
    }

  }
});

var Sound = Fiber.extend(function() {
  return {

    init: function(game, url) {
      this.game = game;

      this.env = game.sound;

      this.env.sounds.push(this);

      this.url = url;

      this.load();
    },

    load: function() {
      var sound = this;
      this.game.get_loader().load_sound(this.url, this.env, function(buffer, callback) {
        sound.loaded.call(sound, buffer, callback);
      });
    },

    loaded: function(buffer, done) {
      var sound = this;
      this.env.context.decodeAudioData(buffer, function(buf) {
        sound.init_nodes.call(sound, buf);
       
        done();
      }, function() {
        console.log('Couldn\'t decode audio data ' + this.url + '!');
        done();
      });
      
    },

    init_nodes: function(buffer) {
      this.source = this.env.context.createBufferSource();
      this.source.buffer = buffer;

      this.gain = this.env.context.createGain();
      this.gain.gain.value = 0;
      this.source.connect(this.gain);

      this.panner = this.env.context.createPanner();
      this.panner.panningModel = 'HRTF';
      this.panner.distanceModel = 'inverse';
      this.panner.refDistance = 10;
      this.panner.maxDistance = 2500;
      this.panner.rolloffFactor = 0.1;
      this.panner.coneInnerAngle = 180;
      this.panner.coneOuterAngle = 360;
      this.panner.coneOuterGain = 0.8;
      this.gain.connect(this.panner);

      this.panner.connect(this.env.context.destination);

      this.source.loop = true;
      this.source.start(0);
    },

    set_volume: function(vol) {
      vol = clamp(0, vol, 1);
      this.gain.gain.value = vol;
    },

    set_master_volume: function(volume) {
      this.set_volume(volume * this.gain.gain.value);
    },

    set_position: function(pos) {
      var fac = 1;
      this.panner.setPosition(pos.x * fac, pos.y * fac, pos.z * fac);
    },

    set_orientation: function(rot) {
      this.panner.setOrientation(rot.x, rot.y, rot.z);
    },

    set_velocity: function(vel) {
      var fac = 1;
      this.panner.setVelocity(vel.x * fac, vel.y * fac, vel.z * fac);
    },

    set_pitch: function(pitch) {
      pitch = clamp(0.05, pitch, 10);
      this.source.playbackRate.value = pitch;
    },

    tick: function(elapsed) {

    }

  }
});

