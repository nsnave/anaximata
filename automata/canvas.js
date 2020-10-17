/*
 * Author:  Aidan Evans
 * Date:    14 October 2020  
 * 
 * Automata Converter Graphics Code
 * 
 */



Konva.hitOnDragEnabled = true;

var width = window.innerWidth;
var height = window.innerHeight;

var radius = 40;

var stage = new Konva.Stage({
  container: 'canvas',
  width: width,
  height: height,
  draggable: true
});

//handles zooming via scroll on desktop
//  initial src: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
var scaleBy = 0.94;
stage.on('wheel', (e) => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();

    var pointer = stage.getPointerPosition();

    var mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
    };

    var newScale =
        (e.evt.deltaY > 0) ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
});

//handles zooming via pinch on mobile
//  src: https://konvajs.org/docs/sandbox/Multi-touch_Scale_Stage.html
stage.on('touchmove', function (e) {
    e.evt.preventDefault();
    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      // if the stage was under Konva's drag&drop
      // we need to stop it, and implement our own pan logic with two pointers
      if (stage.isDragging()) {
        stage.stopDrag();
      }

      var p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      var p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };

      if (!lastCenter) {
        lastCenter = getCenter(p1, p2);
        return;
      }
      var newCenter = getCenter(p1, p2);

      var dist = getDistance(p1, p2);

      if (!lastDist) {
        lastDist = dist;
      }

      // local coordinates of center point
      var pointTo = {
        x: (newCenter.x - stage.x()) / stage.scaleX(),
        y: (newCenter.y - stage.y()) / stage.scaleX(),
      };

      var scale = stage.scaleX() * (dist / lastDist);

      stage.scaleX(scale);
      stage.scaleY(scale);

      // calculate new position of the stage
      var dx = newCenter.x - lastCenter.x;
      var dy = newCenter.y - lastCenter.y;

      var newPos = {
        x: newCenter.x - pointTo.x * scale + dx,
        y: newCenter.y - pointTo.y * scale + dy,
      };

      stage.position(newPos);
      stage.batchDraw();

      lastDist = dist;
      lastCenter = newCenter;
    }
  });

  stage.on('touchend', function () {
    lastDist = 0;
    lastCenter = null;
  });



var layer = new Konva.Layer();


//circle ids
var ids = 0;


//generates and returns a random color
//  src: https://stackoverflow.com/a/1484514/11039508
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


//generates a new circle in a random position
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


//calculates the start and end points for a line connecting two circles
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


//creates a new arrow pointing from circle1 to circle2
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


//generates the first two default circles
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


//variables to keep track of circles and arrows
var circles = [circle0, circle1];
var connected = [[], [circle0]];
var len = circles.length;

var arrow = newArrow(circle1, circle0);
var arrows = [[], [arrow]];


//redraws the arrows as circle moves
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


//adds first two circles to stage
for (var i = 0; i < len; i++) {
  
  circles[i].on('dragmove', adjustPoint);
  layer.add(circles[i]);
  
}

layer.add(arrow);

stage.add(layer);



//handles the addition of a new circle to the stage
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


//removes last circle added from stage
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




