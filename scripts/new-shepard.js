var BE3Engine = Engine.extend(function(base) {
  return {

    init: function() {
      this.model_url = 'vehicles/new-shepard/be-3.json';

      this.color = 0xffaa44;

      this.mass = 100;

      this.throttle_range = [0.4, 1];
      
      this.max_thrust = 490000;
      this.max_gimbal = radians(5);
      
      this.restarts = 3;

      this.sound = new Sound(game, 'vehicles/xaero/audio/running.wav');

      base.init.apply(this, arguments);
    },

    init_physics: function() {
      this.shape = new CANNON.Cylinder(0.5, 0.1, 1.5, 12);
      
      base.init_physics.call(this);
    },

    init_particles: function() {
      this.particle = {}
      
      this.particle.group = new SPE.Group({
        texture: {
          value: this.flame
        },
        hasPerspective: true,
        maxParticleCount: 4000
      });

      var size = 0.4;

      this.particle.emitter = new SPE.Emitter({
        maxAge: {
          value: 0.3,
          spread: 0.03
        },
        position: {
          value: new THREE.Vector3(0, -0.6, 0),
          spread: new THREE.Vector3(size, size, size)
        },

        acceleration: {
          value: new THREE.Vector3(0, 10, 0),
          spread: new THREE.Vector3(0, 0, 0)
        },

        velocity: {
          value: new THREE.Vector3(0, -120, 0),
          spread: new THREE.Vector3(10, 30, 10)
        },

        color: {
          value: [ new THREE.Color(0xff88aa), new THREE.Color(0x882266) ]
        },

        opacity: {
          value: [0.01, 0.03, 0.005, 0.001, 0.0002, 0]
        },
        
        size: {
          value: [2, 5.0, 10.0],
          spread: 1
        },

        particleCount: 3000,
      });

      this.particle.group.addEmitter(this.particle.emitter);
    },

    add_to_vehicle: function(vehicle, position) {
      this.position = position;
      
      this.vehicle = vehicle;
      
      this.body.position = position;
      this.body.position.vadd(vehicle.body.position, this.body.position);
      
      this.constraint = new CANNON.LockConstraint(this.body, vehicle.body, {
        maxForce: 1e50
      });

      for(var i=0; i<this.constraint.equations.length; i++){
        this.constraint.equations[i].setSpookParams(1e30, 0.5, 0.02);
      }
      window.constraint = this.constraint;
      
      this.constraint.collideConnected = false;
      this.world.world.addConstraint(this.constraint);
    },

    loaded: function(geometry, materials) {
      var material = new THREE.MeshPhongMaterial({
        color: 0x222222
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;

      this.object.add(this.mesh);
    },

  }
});

var NewShepardVehicle = Vehicle.extend(function(base) {
  return {

    init: function(game) {
      this.model_url = 'vehicles/new-shepard/new-shepard.json';
      
      this.mass = 34000;
      
      base.init.apply(this, arguments);
      
      this.shadow.shadowCameraFov = 0.6;
    },

    init_engines: function() {
      this.engine = new BE3Engine(this.game);
    },
    
    init_physics: function() {
      this.shape = new CANNON.Cylinder(1.9, 1.45, 12, 24);

      base.init_physics.call(this);
      
      this.body.position.set(0, 0, 50);
    },

    loaded: function(geometry, materials) {
      var material = new THREE.MeshPhongMaterial({
        color: 0xdddddd
      });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.rotation.x = Math.PI * 0.5;
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      
      this.object.add(this.mesh);
    },

    done: function() {
      base.done.call(this);

      this.engine.done();
      this.engine.add_to_vehicle(this, new CANNON.Vec3(0, 0, -6.4));
    },

    tick: function(elapsed) {
      base.tick.call(this, elapsed);

      this.engine.tick(elapsed);
    }

  }
});

