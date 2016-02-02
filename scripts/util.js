
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
