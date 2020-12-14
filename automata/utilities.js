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
