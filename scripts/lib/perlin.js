var Perlin = function () {
  var mask = 0xff;
  var size = mask + 1;
  var values = new Uint8Array(size * 2);
  for (var i = 0; i < size; i++) {
    values[i] = values[size + i] = 0|(Math.random() * 0xff);
  }

  var lerp = function (t, a, b) {
    return a + t * (b - a);
  };
  var fade = function (t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  var grad1d = function (hash, x) {
    return (hash & 1) === 0 ? x : -x;
  };
  var grad2d = function (hash, x, y) {
    var u = (hash & 2) === 0 ? x : -x;
    var v = (hash & 1) === 0 ? y : -y;
    return u + v;
  };
  var grad3d = function (hash, x, y, z) {
    var h = hash & 15;
    var u = h < 8 ? x : y;
    var v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) === 0 ? u : -u) + ((h & 1 === 0) ? v : -v);
  };

  var noise1d = function (x) {
    var intX = (0|x) & mask;
    var fracX = x - (0|x);
    var t = fade(fracX);
    var a = grad1d(values[intX], fracX);
    var b = grad1d(values[intX + 1], fracX - 1);
    return lerp(t, a, b);
  };

  return {
    get1d: noise1d
  }
}
