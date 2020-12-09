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

//ids
let circle_ids = 0;
let arrow_ids = 0;

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

//adjacency lists, etc.
const directed_in = {}; //(circle.id) -> [circles that point to circle]
const directed_out = {}; //(circle.id) -> [circles that circle points to]
const arrows = {}; //(circle1.id, circle2.id) -> arrow that points connects circle1 and circle2
const circles = {}; //(arrow.id) -> { out: circle1, in: circle2 }

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

//calculates distance between two points
function distance(x1, y1, x2, y2) {
  let x = x2 - x1;
  let y = y2 - y1;
  return Math.sqrt(x * x + y * y);
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
  let x_val = -radius - 5;
  let y_val = radius + 10;
  let arc = new Konva.Arc({
    x: x_val,
    y: y_val,
    innerRadius: self_arrow_radius,
    outerRadius: self_arrow_radius,
    angle: 260,
    rotation: 10,
    stroke: stroke_color,
    strokeWidth: arrow_width,
    name: "self-arrow",
  });

  let tip_x = x_val + self_arrow_radius;
  let tip = new Konva.Arrow({
    points: [tip_x, y_val + 5, tip_x + 2, y_val - 1],
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

//creates a new arrow pointing from circle1 to circle2
//  or a new self-arrow if circle1==circle2
function newCircleArrow(circle1, circle2) {
  return circle1 == cirlce2
    ? newSelfArrow(circle1.getX(), circle1.getY())
    : newArrow(
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

//variables for circle events
let from_circle;
let selected_circle = null;
let hovering = false;
let self_hovering = false;
let temp_arrow = null;
let temp_self_arrow = null;

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
    if (temp_self_arrow != null) {
      console.log("destoryed temp_self_arrow");
      temp_self_arrow.destroy();
      temp_self_arrow = null;
      layer.draw();
    }
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

      console.log(JSON.stringify(directed_in[selected_circle.id()]));
      console.log(JSON.stringify(directed_out[selected_circle.id()]));

      layer.draw();

      break;
    }

    //begins drawing new transition arrow
    case modes.INSERT.TRANSITION.FROM: {
      selected_circle = e.target; //selected_circle should be null

      temp_arrow = newArrow([0, 0, 0, 0]);

      let x = e.target.getX();
      let y = e.target.getY();
      temp_self_arrow = newSelfArrow(x, y);
      layer.add(temp_self_arrow);

      hovering = true;
      self_hovering = true;

      layer.draw();

      changeMode(modes.INSERT.TRANSITION.TO);

      break;
    }

    //finalizes new transition arrow
    case modes.INSERT.TRANSITION.TO: {
      let out_circle = selected_circle;
      let in_circle = null;
      let arrow = null;

      //adds self-referencing arrow
      if (self_hovering) {
        temp_self_arrow.setX(selected_circle.getX());
        temp_self_arrow.setY(selected_circle.getY());
        temp_arrow.destroy();

        in_circle = selected_circle;
        arrow = temp_self_arrow;
      }
      //adds arrow between two distinct circles
      else {
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
        temp_self_arrow.destroy();

        in_circle = e.target;
        arrow = temp_arrow;
      }

      selected_circle = null;
      temp_arrow = null;
      temp_self_arrow = null;

      //assings arrow an id
      arrow.setAttr("id", arrow_ids++);

      //adds circles and arrow to the adjaceny lists
      directed_out[out_circle.id()].push(in_circle);
      directed_in[in_circle.id()].push(out_circle);
      arrows[out_circle.id()][in_circle.id()] = arrow;
      circles[arrow.id()] = { out: out_circle, in: in_circle };

      console.log("directed_in: " + JSON.stringify(directed_in));
      console.log("directed_out: " + JSON.stringify(directed_out));
      console.log("arrows: " + JSON.stringify(arrows));
      console.log("circles: " + JSON.stringify(circles));

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
    //hides temp_arrow if hovering over selected_circle
    else {
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

  e.target.radius(radius);
  layer.draw();
}

//redraws the arrows as circle moves
function circleDragMoveEvent(e) {
  let cur = e.target;
  let id = cur.id();

  //redraws self-arrow
  let self_arrow = arrows[id][id];
  if (self_arrow != undefined) {
    self_arrow.setX(cur.getX());
    self_arrow.setY(cur.getY());
  }

  //redraws arrows directed out of circle
  directed_out[id].forEach(function (other, n) {
    if (cur != other) {
      let p = calcPoints(
        cur.getX(),
        cur.getY(),
        other.getX(),
        other.getY(),
        radius,
        radius
      );
      arrows[id][other.id()].setPoints(p);
    }
  });

  //redraws arrows directed in to circle
  directed_in[id].forEach(function (other, n) {
    if (cur != other) {
      let p = calcPoints(
        other.getX(),
        other.getY(),
        cur.getX(),
        cur.getY(),
        radius,
        radius
      );
      arrows[other.id()][id].setPoints(p);
    }
  });

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

  directed_in[circle.id()] = [];
  directed_out[circle.id()] = [];
  arrows[circle.id()] = {};

  circle.on("mouseover", circleOverEvent);
  circle.on("mouseout", circleOutEvent);
  circle.on("mousedown", circleOutEvent);
  circle.on("click", circleClickEvent);
  circle.on("dragmove", circleDragMoveEvent);

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
    let coords = getCoords();

    hover_circle.x(coords.x);
    hover_circle.y(coords.y);

    layer.draw();
  }
  //adjusts arrow accordingly if currently inserting a transition
  else if (mode == modes.INSERT.TRANSITION.TO) {
    let coords = getCoords();
    let circle_coords = {
      x: selected_circle.getX(),
      y: selected_circle.getY(),
    };

    if (hovering == false) {
      let points = calcPoints(
        circle_coords.x,
        circle_coords.y,
        coords.x,
        coords.y,
        radius,
        0
      );

      temp_arrow.setPoints(points);
      layer.add(temp_arrow);

      layer.draw();
    }

    //determines if mouse is hovering over selected_circle
    //  (i.e., if self_hover == true)
    let dist = distance(circle_coords.x, circle_coords.y, coords.x, coords.y);
    if (dist <= radius + circle_width) {
      if (self_hovering == false) {
        temp_arrow.remove();
        layer.add(temp_self_arrow);

        self_hovering = true;
        return;
      }
    } else if (self_hovering == true) {
      temp_self_arrow.remove();
      layer.add(temp_arrow);

      self_hovering = false;
      return;
    }

    //rotates self_circle appropriately
    if (self_hovering == true) {
      let x = coords.x - circle_coords.x;
      let y = coords.y - circle_coords.y;

      if (x == 0 && y == 0) return;

      let theta = Math.atan(y / x) * (180 / Math.PI) + 45;

      if (x >= 0) theta = theta - 180;

      temp_self_arrow.rotation(theta);
      layer.draw();
    }
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

/*
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
*/
