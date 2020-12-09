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

let mode = modes.SELECT;

//circle ids
let circle_ids = 0;

//shared constants
const stroke_color = "black";

//circle constants
const radius = 40;
const circle_width = 5;

//arrow constants
const arrow_width = 4;
const arrow_pointer_size = 10;
const self_arrow_radius = radius * 0.8;
const pointer_width = 10;

const stage = new Konva.Stage({
  container: "canvas",
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
});

const layer = new Konva.Layer();

//handles zooming via scroll on desktop
//  initial src: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
const scaleBy = 0.94;
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

//arrow event functions
function arrowClickEvent(e) {
  if (mode == modes.REMOVE) {
    e.target.destroy();

    layer.draw();
  }
}

function arrowOverEvent(e) {
  if (mode == modes.SELECT || mode == modes.REMOVE) {
    e.target.strokeWidth(arrow_width + 3);

    layer.draw();
  }
}

function arrowOutEvent(e) {
  e.target.strokeWidth(arrow_width);
  layer.draw();
}

//creates a new arrow between two points
function newArrow(points) {
  var arrow = new Konva.Arrow({
    points: points,
    pointerLength: arrow_pointer_size,
    pointerWidth: arrow_pointer_size,
    tension: 100,
    fill: stroke_color,
    stroke: stroke_color,
    strokeWidth: arrow_width,
    name: "arrow",
  });

  arrow.on("mouseover", arrowOverEvent);
  arrow.on("mouseout", arrowOutEvent);
  arrow.on("click", arrowClickEvent);

  return arrow;
}

//self-arrow event functions
function selfArrowClickEvent(e) {
  if (mode == modes.REMOVE) {
    e.target.parent.destroy();

    layer.draw();
  }
}

function selfArrowOverEvent(e) {
  if (mode == modes.SELECT || mode == modes.REMOVE) {
    let children = e.target.parent.getChildren();
    children.each(function (child, n) {
      child.strokeWidth(arrow_width + 3);
    });

    layer.draw();
  }
}

function selfArrowOutEvent(e) {
  let children = e.target.parent.getChildren();
  children.each(function (child, n) {
    child.strokeWidth(arrow_width);
  });

  layer.draw();
}

//creates a new self-pointing arrow centered at (x, y)
function newSelfArrow(x, y) {
  let arc = new Konva.Arc({
    x: 0,
    y: 0,
    innerRadius: self_arrow_radius,
    outerRadius: self_arrow_radius,
    angle: 260,
    rotation: 10,
    stroke: stroke_color,
    strokeWidth: arrow_width,
    name: "self-arrow",
  });

  var tip = new Konva.Arrow({
    points: [self_arrow_radius, 5, self_arrow_radius + 2, -1],
    pointerLength: arrow_pointer_size,
    pointerWidth: arrow_pointer_size,
    tension: 100,
    fill: stroke_color,
    stroke: stroke_color,
    strokeWidth: arrow_width,
    name: "self-arrow",
  });

  let group = new Konva.Group({
    x: x,
    y: y,
  });
  group.add(arc);
  group.add(tip);

  group.on("mouseover", selfArrowOverEvent);
  group.on("mouseout", selfArrowOutEvent);
  group.on("click", selfArrowClickEvent);

  return group;
}
let temp_self_arrow = newSelfArrow(stage.width() / 2, stage.height() / 2);
layer.add(temp_self_arrow);
layer.draw();

//creates a new arrow pointing from circle1 to circle2
//  or a new self-arrow if circle1==circle2
function newCircleArrow(circle1, circle2) {
  return newArrow(
    calcPoints(
      circle1.getX(),
      circle1.getY(),
      circle2.getX(),
      circle2.getY(),
      radius,
      radius
    )
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

//variables for circle events
let from_circle;
let selected_circle = null;
let hovering = false;
//let self_hovering = false;
let temp_arrow = null;
//let temp_self_arrow = null;

//handles changing the mode for circles
function changeMode(new_mode) {
  if (mode == modes.SELECT) {
    if (selected_circle != null) {
      selected_circle.stroke(stroke_color);

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
    /*
    if (temp_self_arrow != null) {
      temp_self_arrow.destroy();
      temp_self_arrow = null;
      layer.draw();
    }
    */
  }

  mode = new_mode;
}

//circle event functions
function circleClickEvent(e) {
  switch (mode) {
    case modes.SELECT: {
      //changes selected circle to red
      if (selected_circle != null) {
        selected_circle.stroke(stroke_color);
      }
      selected_circle = e.target;

      selected_circle.stroke("red");
      selected_circle.moveToTop();

      layer.draw();

      break;
    }

    //begins drawing new transition arrow
    case modes.INSERT.TRANSITION.FROM: {
      selected_circle = e.target; //selected_circle should be null

      temp_arrow = newArrow([0, 0, 0, 0]);
      //temp_self_arrow = newSelfArrow(0, 0);
      layer.add(temp_arrow);
      //layer.add(temp_self_arrow);

      temp_arrow.moveToBottom();
      //temp_self_arrow.moveToBottom();

      layer.draw();

      changeMode(modes.INSERT.TRANSITION.TO);

      break;
    }

    //finalizes new transition arrow
    case modes.INSERT.TRANSITION.TO: {
      /*if (self_hovering) {
        temp_self_arrow.setPoints(
          selected_circle.getX() - radius - self_arrow_radius,
          selected_circle.getY() + radius + self_arrow_radius
        );
        temp_arrow.destroy();
      } else {*/
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
      //temp_self_arrow.destroy();
      //}

      selected_circle = null;
      temp_arrow = null;
      //temp_self_arrow = null;
      layer.draw();

      changeMode(modes.INSERT.TRANSITION.FROM);

      break;
    }

    //removes element
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

  //if adding new transition
  if (mode == modes.INSERT.TRANSITION.TO) {
    hovering = true;

    //causes arrow to "stick" to circle being hovered over
    if (selected_circle != e.target) {
      //self_hovering = false;

      let points = calcPoints(
        selected_circle.getX(),
        selected_circle.getY(),
        e.target.getX(),
        e.target.getY(),
        radius,
        radius + 5
      );

      temp_arrow.setPoints(points);
    }
    //changes arrow to self-arrow if hovering over selected_circle
    else {
      //self_hovering = true;
      temp_arrow.remove();
    }

    layer.draw();
  }
}

function circleOutEvent(e) {
  if (mode == modes.INSERT.STATE) return;

  hovering = false;

  if (mode == modes.INSERT.TRANSITION.TO) {
  }

  //self_hovering = false;

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
    stroke: stroke_color,
    strokeWidth: circle_width,
    draggable: true,
    id: circle_ids++,
    name: "circle",
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
  //destroys hover_circle
  if (mode == modes.INSERT.STATE) {
    hover_circle.destroy();

    layer.draw();
  }
});

stage.on("mousemove", function () {
  //has hover_circle follow mouse
  if (mode == modes.INSERT.STATE) {
    var coords = getCoords();

    hover_circle.x(coords.x);
    hover_circle.y(coords.y);

    layer.draw();
  }
  //adjusts arrow accordingly if currently inserting a transition
  else if (mode == modes.INSERT.TRANSITION.TO) {
    if (hovering == false) {
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
  }
  //hovering == true && self_hovering == true
  //else if (self_hovering == true) {}
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

  circle_ids--;

  layer.draw();
});
