//src: https://stackoverflow.com/a/956878/11039508
function countProperties(obj) {
  var count = 0;

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) ++count;
  }

  return count;
}

//generates and returns a random color
//  src: https://stackoverflow.com/a/1484514/11039508
function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

//calculates distance between two points
function distance(x1, y1, x2, y2) {
  let x = x2 - x1;
  let y = y2 - y1;
  return Math.sqrt(x * x + y * y);
}

//calculates midpoint of two points
function midpoint(x1, y1, x2, y2) {
  let x = (x1 + x2) / 2;
  let y = (y1 + y2) / 2;
  return { x: x, y: y };
}
function midpointArr(arr) {
  return midpoint(arr[0], arr[1], arr[2], arr[3]);
}

//calculates inverse tangent of two points
function atanDiff(dx, dy) {
  let theta = Math.atan(dy / dx) * (180 / Math.PI);

  if (dx >= 0) theta += 180;
  if (theta < 0) theta += 360;

  return theta;
}
function atan(x1, y1, x2, y2) {
  return atanDiff(x2 - x1, y2 - y1);
}
function atanArr(arr) {
  return atan(arr[0], arr[1], arr[2], arr[3]);
}

//calculates slope of two points
function slope(x1, y1, x2, y2) {
  return (y2 - y1) / (x2 - x1);
}
function slopeArr(arr) {
  return slope(arr[0], arr[1], arr[2], arr[3]);
}

//calculates unit vector
function uVec(v) {
  let mag = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  return [v[0] / mag, v[1] / mag];
}

//calculates perpendicular unit vector
//  input:  v = [x, y]
function perpUVec(v) {
  let px = -v[1];
  let py = v[0];
  let mag = Math.sqrt(px * px + py * py);

  let upx = px / mag;
  let upy = py / mag;

  return [-upx, -upy];
}
function perpUVecLine(points) {
  return perpUVec([points[2] - points[0], points[3] - points[1]]);
}
