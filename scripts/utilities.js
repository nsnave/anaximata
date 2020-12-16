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
function distPoints(p1, p2) {
  return distance(p1.x, p1.y, p2.x, p2.y);
}
function distArr(points) {
  return distance(points[0], points[1], points[2], points[3]);
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
function atanPoints(p1, p2) {
  return atanDiff(p2.x - p1.x, p2.y - p1.y);
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

//flips a vector from one direction to another
function flipVec(v) {
  return { x: -v.x, y: -v.y };
}

//calculates magnitude of vector
function vecMag(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

//calculates unit vector
function uVec(v) {
  let mag = vecMag(v);
  return { x: v.x / mag, y: v.y / mag };
}
function uVecLine(points) {
  return uVec({ x: points[2] - points[0], y: points[3] - points[1] });
}

//calculates perpendicular unit vector
function perpUVec(v, is_uVec = false) {
  let val = { x: -v.y, y: v.x };
  return uVec(val);
}
function perpUVecLine(points, is_uVec = false) {
  return perpUVec({ x: points[2] - points[0], y: points[3] - points[1] });
}

function solveLinear2(eq1, eq2) {
  let intersection = {};
  intersection.x = (eq2.intercept - eq1.intercept) / (eq1.slope - eq2.slope);
  intersection.y = eq1.slope * intersection.x + eq1.intercept;

  return intersection;
}

function lineFromSlopeAndPoint(slope, point) {
  return { slope: slope, intercept: point.y - slope * point.x };
}
