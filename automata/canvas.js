/*
 * Author:  Aidan Evans
 * Date:    14 October 2020
 *
 * Automata Converter Graphics Code
 *
 */

const modes = {
  SELECT: "select",
  INSERT: {
    STATE: "state",
    TRANSITION: {
      FROM: "from",
      TO: "to",
    },
  },
  REMOVE: "remove",
};

var mode = modes.SELECT;

var stage = new Konva.Stage({
  container: "canvas",
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
});

var layer = new Konva.Layer();

//handles zooming via scroll on desktop
//  initial src: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
var scaleBy = 0.94;
stage.on("wheel", (e) => {
  e.evt.preventDefault();

  var oldScale = stage.scaleX();
  var pointer = stage.getPointerPosition();

  var mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  var newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

  stage.scale({ x: newScale, y: newScale });

  var newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  };
  stage.position(newPos);
  stage.batchDraw();
});

//makes canvas fit to window
function updateStageSize() {
  stage.width(window.innerWidth);
  stage.height(window.innerHeight);
}

window.addEventListener("resize", updateStageSize);

//circle ids
var ids = 0;

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

//gets the coordinates of the mouse relative to the stage
function getCoords() {
  var oldScale = stage.scaleX();
  var pointer = stage.getPointerPosition();

  var coords = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  return coords;
}

//calculates the start and end points for a line connecting two circles
function calcPoints(x1, y1, x2, y2, r1, r2) {
  var x = x2 - x1,
    y = y2 - y1;
  var theta = Math.atan(y / x);
  var sin = Math.sin(theta),
    cos = Math.cos(theta);

  if (x < 0) {
    sin = -1 * sin;
    cos = -1 * cos;
  }

  var arrow_start_radius = r1 + 10;
  var arrow_end_radius = Math.sqrt(x * x + y * y) - r2 - 10;

  var arrow_start_x = cos * arrow_start_radius + x1;
  var arrow_start_y = sin * arrow_start_radius + y1;

  var arrow_end_x = cos * arrow_end_radius + x1;
  var arrow_end_y = sin * arrow_end_radius + y1;

  var p = [arrow_start_x, arrow_start_y, arrow_end_x, arrow_end_y];

  return p;
}

var radius = 40;
var from_circle;
var selected_circle = null;
var hovering = false;

var temp_arrow = null;
var arrow_width = 4;
var pointer_width = 10;

function arrowClickEvent(e) {
  if (mode == modes.REMOVE) {
    e.target.destroy();

    layer.draw();
  }
}

function arrowOverEvent(e) {
  if (mode == modes.SELECT) {
    e.target.strokeWidth(arrow_width + 3);

    layer.draw();
  }
}

function arrowOutEvent(e) {
  e.target.strokeWidth(arrow_width);
  layer.draw();
}

//creates a new arrow between two points
function newArrow(x1, y1, x2, y2, r1, r2) {
  var arrow = new Konva.Arrow({
    points: calcPoints(x1, y1, x2, y2, r1, r2),
    pointerLength: 10,
    pointerWidth: 10,
    tension: 100,
    fill: "black",
    stroke: "black",
    strokeWidth: arrow_width,
  });

  arrow.on("mouseover", arrowOverEvent);
  arrow.on("mouseout", arrowOutEvent);
  arrow.on("click", arrowClickEvent);

  return arrow;
}

var temp_thing = new Konva.Arrow({
  points: [0, 10, 10, 0, 20, 20, 30, 10],
  pointerLength: 10,
  pointerWidth: 10,
  tension: 10,
  fill: "black",
  stroke: "black",
  strokeWidth: arrow_width,
});
layer.add(temp_thing);
layer.draw();

//creates a new arrow pointing from circle1 to circle2
function newCircleArrow(circle1, circle2) {
  return newArrow(
    circle1.getX(),
    circle1.getY(),
    circle2.getX(),
    circle2.getY(),
    radius,
    radius
  );
}

//redraws the arrows as circle moves
function adjustPoints(e) {
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

//modes events for circles
function changeMode(new_mode) {
  if (mode == modes.SELECT) {
    if (selected_circle != null) {
      selected_circle.stroke("black");

      selected_circle = null;

      layer.draw();
    }
  }

  if (mode != modes.INSERT.TRANSITION.FROM) {
    if (temp_arrow != null) {
      temp_arrow.destroy();
      temp_arrow = null;
      layer.draw();
    }
  }

  mode = new_mode;
}

function circleClickEvent(e) {
  switch (mode) {
    case modes.SELECT: {
      if (selected_circle != null) {
        selected_circle.stroke("black");
      }
      selected_circle = e.target;

      selected_circle.stroke("red");
      selected_circle.moveToTop();

      layer.draw();

      break;
    }

    case modes.INSERT.TRANSITION.FROM: {
      selected_circle = e.target; //selected_circle should be null

      temp_arrow = newArrow(0, 0, 0, 0, 0, 0);
      layer.add(temp_arrow);

      temp_arrow.moveToBottom();

      layer.draw();

      changeMode(modes.INSERT.TRANSITION.TO);

      break;
    }

    case modes.INSERT.TRANSITION.TO: {
      temp_arrow.setPoints(
        calcPoints(
          selected_circle.getX(),
          selected_circle.getY(),
          e.target.getX(),
          e.target.getY(),
          radius,
          radius
        )
      );

      selected_circle = null;
      temp_arrow = null;
      layer.draw();

      changeMode(modes.INSERT.TRANSITION.FROM);

      break;
    }

    case modes.REMOVE: {
      e.target.destroy();

      layer.draw();
      break;
    }
  }
}

function circleOverEvent(e) {
  if (mode == modes.INSERT.STATE) return;

  e.target.radius(radius + 5);
  layer.draw();

  if (mode == modes.INSERT.TRANSITION.TO) {
    hovering = true;

    if (selected_circle != e.target) {
      var points = calcPoints(
        selected_circle.getX(),
        selected_circle.getY(),
        e.target.getX(),
        e.target.getY(),
        radius,
        radius + 5
      );

      temp_arrow.setPoints(points);
    } else {
      temp_arrow.remove();
    }

    layer.draw();
  }
}

function circleOutEvent(e) {
  if (mode == modes.INSERT.STATE) return;

  hovering = false;

  e.target.radius(radius);
  layer.draw();
}

//generates a new circle at the current mouse position
function newCircle() {
  var coords = getCoords();

  var circle = new Konva.Circle({
    x: coords.x,
    y: coords.y,
    radius: radius,
    stroke: "black",
    strokeWidth: 5,
    draggable: true,
    id: ids++,
  });

  circle.on("mouseover", circleOverEvent);
  circle.on("mouseout", circleOutEvent);
  circle.on("mousedown", circleOutEvent);
  circle.on("click", circleClickEvent);

  return circle;
}

//adds circle to stage on click of stage if mode = modes.INSERT.STATE
stage.on("click", function () {
  if (mode == modes.INSERT.STATE) {
    var circle = newCircle();

    layer.add(circle);
    layer.draw();
  }
});

//has a circle follow mouse if mode = modes.INSERT.STATE
var hover_circle;

stage.on("mouseenter", function () {
  if (mode == modes.INSERT.STATE) {
    hover_circle = newCircle();

    layer.add(hover_circle);
    layer.draw();
  }
});

stage.on("mouseleave", function () {
  if (mode == modes.INSERT.STATE) {
    hover_circle.destroy();

    layer.draw();
  }
});

stage.on("mousemove", function () {
  if (mode == modes.INSERT.STATE) {
    var coords = getCoords();

    hover_circle.x(coords.x);
    hover_circle.y(coords.y);

    layer.draw();
  } else if (mode == modes.INSERT.TRANSITION.TO && hovering == false) {
    var coords = getCoords();

    var points = calcPoints(
      selected_circle.getX(),
      selected_circle.getY(),
      coords.x,
      coords.y,
      radius,
      0
    );

    temp_arrow.setPoints(points);
    layer.add(temp_arrow);

    layer.draw();
  }
});

//reduces size of hover_circle on mousedown, restores on mouseup
stage.on("mousedown", function () {
  if (mode == modes.INSERT.STATE) {
    hover_circle.radius(radius - 10);

    layer.draw();
  }
});

stage.on("mouseup", function () {
  if (mode == modes.INSERT.STATE) {
    hover_circle.radius(radius);

    layer.draw();
  }
});

stage.add(layer);

document.getElementById("select").addEventListener("click", function () {
  changeMode(modes.SELECT);
});

document.getElementById("insert_state").addEventListener("click", function () {
  changeMode(modes.INSERT.STATE);
});

document
  .getElementById("insert_transition")
  .addEventListener("click", function () {
    changeMode(modes.INSERT.TRANSITION.FROM);
  });

document.getElementById("remove").addEventListener("click", function () {
  changeMode(modes.REMOVE);
});

//handles the addition of a new circle to the stage
document.getElementById("plus").addEventListener("click", function () {
  var c = newCircle();
  c.on("dragmove", adjustPoints);

  var arr = [];
  var con = [];

  len = circles.length;
  for (var i = 0; i < len; i++) {
    var a = newCircleArrow(c, circles[i]);
    layer.add(a);

    arr.push(a);
    con.push(circles[i]);
  }

  circles.push(c);
  arrows.push(arr);
  connected.push(con);

  layer.add(c);
  layer.draw();
});

//removes last circle added from stage
document.getElementById("minus").addEventListener("click", function () {
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
});
