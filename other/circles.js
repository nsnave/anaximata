

var width = window.innerWidth;
var height = window.innerHeight;

var radius = 40;

var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
  draggable: true
});



var layer = new Konva.Layer();

var ids = 0;


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function newCircle() {
  
  var circle = new Konva.Circle({
    x: Math.random() * stage.getWidth(),
    y: Math.random() * stage.getHeight(),
    radius: radius,
    fill: getRandomColor(),
    stroke: 'black',
    strokeWidth: 5,
    draggable: true,
    id: ids++
  });
  
  return circle;
  
}

function calcPoints(circle1, circle2) {
  
  var x1 = circle1.getX(), y1 = circle1.getY();
  var x2 = circle2.getX(), y2 = circle2.getY();

  var x = x2 - x1, y = y2 - y1;
  var theta = Math.atan(y/x);
  var sin = Math.sin(theta), cos = Math.cos(theta);

  if (x < 0) {
    sin = -1 * sin;
    cos = -1 * cos;
  }

  var arrow_start_radius = radius + 10;
  var arrow_end_radius = Math.sqrt(x*x + y*y) - radius - 10;

  var arrow_start_x = cos * arrow_start_radius + x1;
  var arrow_start_y = sin * arrow_start_radius + y1;

  var arrow_end_x = cos * arrow_end_radius + x1;
  var arrow_end_y = sin * arrow_end_radius + y1;

  var p=[arrow_start_x, arrow_start_y, arrow_end_x, arrow_end_y];
  
  return p;
  
  
}

function newArrow(circle1, circle2) {
  
  var arrow = new Konva.Arrow({
    points: calcPoints(circle1, circle2),
    pointerLength: 10,
    pointerWidth: 10,
    fill: 'black',
    stroke: 'black',
    strokeWidth: 4
  });
  
  return arrow
  
}

var circle0 = new Konva.Circle({
  x: stage.getWidth() / 2,
  y: stage.getHeight() / 2,
  radius: radius,
  fill: 'green',
  stroke: 'black',
  strokeWidth: 5,
  draggable: true,
  id: ids++
});

var circle1 = new Konva.Circle({
  x: stage.getWidth() / 5,
  y: stage.getHeight() / 5,
  radius: radius,
  fill: 'red',
  stroke: 'black',
  strokeWidth: 5,
  draggable: true,
  id: ids++
});


var circles = [circle0, circle1];
var connected = [[], [circle0]];
var len = circles.length;


var arrow = newArrow(circle1, circle0);
var arrows = [[], [arrow]];


function adjustPoint(e){
  
  var cur = e.target;
  var id = cur.id();
  
  //redraws arrows directed out of circle
  var arr_len = arrows[id].length;
  for (var i = 0; i < arr_len; i++) {

    var p = calcPoints(cur, connected[id][i]);
    arrows[id][i].setPoints(p);
    
  }
  
  //redraws arrows directed in to circle
  len = circles.length;
  for (var i = id + 1; i < len; i++) {
    
    var p = calcPoints(circles[i], cur);
    arrows[i][id].setPoints(p);
    
  }
  
  layer.draw();
  
}




for (var i = 0; i < len; i++) {
  
  circles[i].on('dragmove', adjustPoint);
  layer.add(circles[i]);
  
}


layer.add(arrow);

stage.add(layer);




document.getElementById('plus').addEventListener(
  'click',
  function () {
    
    var c = newCircle();
    c.on('dragmove', adjustPoint);
    
    var arr = [];
    var con = [];
    
    len = circles.length;
    for (var i = 0; i < len; i++) {
  
      var a = newArrow(c, circles[i]);
      layer.add(a);
      
      arr.push(a);
      con.push(circles[i]);
      
    }
    
    circles.push(c);
    arrows.push(arr);
    connected.push(con);
    
    layer.add(c);
    layer.draw();
    
  }
);



document.getElementById('minus').addEventListener(
  'click',
  function () {
    
    var id = circles.length - 1;
  
    //removes and frees arrows directed out of circle
    var arr_len = arrows[id].length;
    for (var i = 0; i < arr_len; i++) {

      var temp = arrows[id].pop();
      temp.destroy();
    
    }
    arrows.pop();
    
    //removes and frees circle
    var cir = circles.pop();
    cir.destroy();
    
    connected.pop();
    
    ids--;
  
  
    layer.draw();
    
  }
);




