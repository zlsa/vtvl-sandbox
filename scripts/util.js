
function time() {
  return Date.now() * 0.001;
}

function clamp(a, n, b) {
  if(!b) b = Infinity;
  if(a > b) {
    var temp = a;
    a = b;
    b = temp;
  }
  if(n < a) return a;
  if(n > b) return b;
  return n;
}

function radians(deg) {
  return deg * Math.PI / 180;
}

function degrees(rad) {
  return rad / Math.PI * 180;
}

function lerp(il, i, ih, ol, oh) {
  return ol + (oh - ol) * (i - il) / (ih - il);
}

function clerp(il, i, ih, ol, oh) {
  return clamp(ol,  lerp(il, i, ih, ol, oh), oh);
}


var perlin = Perlin();

function get_global_position(obj) {
  var vec = obj.position.clone();
  vec.applyMatrix4(obj.matrixWorld);
  return vec;
}

function distance_2d(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function vector3_to_quat(vec, order) {
  var euler = new THREE.Euler().setFromVector3(vec, 'XYZ');
  return new THREE.Quaternion().setFromEuler(euler);
}

function log_array(arr) {
  var out = ''
  for(var i=0; i<arr.length; i++) {
    out += arr[i].toFixed(3);
    if(i < arr.length - 1)
      out += ', ';
  }
  console.log(out);
}

function elapsed(now, start) {
  return (now - start);
}
