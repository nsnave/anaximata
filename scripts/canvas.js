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
  MARK: {
    INITIAL: "initial",
    FINAL: "final",
  },
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
const final_subcircle_radius = radius * 0.8;

//arrow constants
const arrow_width = 4;
const arrow_pointer_size = 10;
const self_arrow_radius = radius * 0.8;
const pointer_width = 10;
const initial_arrow_length = radius;

//adjacency lists, etc.
const all_circles = {};
const directed_in = {}; //(circle.id) -> [circles that point to circle]
const directed_out = {}; //(circle.id) -> [circles that circle points to]
const arrows = {}; //(circle1.id, circle2.id) -> arrow that points connects circle1 and circle2
const circles = {}; //(arrow.id) -> { out: circle1, in: circle2 }
const start_circles = {}; //(circle.id) -> initial arrow
const end_circles = {}; //(circle.id) -> final sub-circle

//stage constants
let stage_left_offset = 250;
let stage_right_offset = 32;

let stage_top_offset = 0;
let stage_bottom_offset = 0;

const stage = new Konva.Stage({
  container: "canvas",
  width: window.innerWidth - stage_left_offset - stage_right_offset,
  height: window.innerHeight - stage_top_offset - stage_bottom_offset,
  draggable: true,
});
const layer = new Konva.Layer();

//makes canvas fit to window
function updateStageSize() {
  stage.width(window.innerWidth - stage_left_offset - stage_right_offset);
  stage.height(window.innerHeight - stage_top_offset - stage_bottom_offset);
}
window.addEventListener("resize", updateStageSize);

//keeps track of canvas size within side menus
function updateStageOffsets(
  left = document.getElementById("leftsidenav").offsetWidth,
  right = document.getElementById("rightsidenav").offsetWidth,
  top = document.getElementById("navbar").offsetHeight,
  bottom = document.getElementById("canvasbar").offsetHeight
) {
  stage_left_offset = left;
  stage_right_offset = right;

  stage_top_offset = top;
  stage_bottom_offset = bottom;

  updateStageSize();
}
window.addEventListener("transitionend", function () {
  updateStageOffsets();
});

//displays current data structures in right sidenav display
function updateDisplay() {
  let display = document.getElementById("display");
  //display.textContent = "Number of States: " + countProperties(circles);
}

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

//remove element from data structures functions
//removes an arrow
function removeArrow(arrow) {
  let c = circles[arrow.id()];

  delete circles[arrow.id()];
  delete arrows[c.out.id()][c.in.id()];

  let index = directed_in[c.in.id()].indexOf(c.out);
  directed_in[c.in.id()].splice(index, 1);

  index = directed_out[c.out.id()].indexOf(c.in);
  directed_out[c.out.id()].splice(index, 1);
}

//removes a circle and destroys the associated arrows
function removeCircle(circle) {
  let in_circles = directed_in[circle.id()];
  let out_circles = directed_out[circle.id()];

  in_circles.forEach(function (other, n) {
    if (directed_out[other.id()] != undefined) {
      let index = directed_out[other.id()].indexOf(circle);
      directed_out[other.id()].splice(index, 1);
    }

    if (arrows[other.id()] != undefined) {
      let arrow = arrows[other.id()][circle.id()];
      if (arrow != undefined) {
        delete circles[arrow.id()];
        arrow.destroy();
      }
      delete arrows[other.id()][circle.id()];
    }
  });

  out_circles.forEach(function (other, n) {
    if (directed_in[other.id()] != undefined) {
      let index = directed_in[other.id()].indexOf(circle);
      directed_in[other.id()].splice(index, 1);
    }

    if (arrows[circle.id()] != undefined) {
      let arrow = arrows[circle.id()][other.id()];
      if (arrow != undefined) {
        delete circles[arrow.id()];
        arrow.destroy();
      }
      delete arrows[circle.id()][other.id()];
    }
  });

  delete directed_in[circle.id()];
  delete directed_out[circle.id()];
  delete arrows[circle.id()];

  if (start_circles[circle.id()] != undefined) {
    start_circles[circle.id()].destroy();
    delete start_circles[circle.id()];
  }

  if (end_circles[circle.id()] != undefined) {
    end_circles[circle.id()].destroy();
    delete end_circles[circle.id()];
  }
}

//arrow event functions
function arrowClickEvent(e) {
  if (mode == modes.REMOVE) {
    /*
    console.log(JSON.stringify(circles));
    console.log(JSON.stringify(arrows));
    console.log(JSON.stringify(directed_in));
    console.log(JSON.stringify(directed_out));
    console.log("");
    */

    removeArrow(e.target);
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

//self-arrow angle function
//  returns the proper angle for the arrow
//    given mouse location and circle location
function selfArrowAngle(mouse_x, mouse_y, circle_x, circle_y) {
  let x = mouse_x - circle_x;
  let y = mouse_y - circle_y;

  if (x == 0 && y == 0) return;

  let theta = Math.atan(y / x) * (180 / Math.PI) + 45;

  if (x >= 0) theta = theta - 180;

  return theta;
}

//self-arrow event functions
function selfArrowClickEvent(e) {
  if (mode == modes.REMOVE) {
    removeArrow(e.target.parent);

    e.target.parent.destroy();

    layer.draw();
  }
}

function selfArrowOverEvent(e) {
  if (
    mode == modes.SELECT ||
    mode == modes.REMOVE ||
    mode == modes.INSERT.TRANSITION.FROM
  ) {
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

function selfArrowDragMoveEvent(e) {
  let coords = getCoords();
  let circle = circles[e.target.id()].in;

  let theta = selfArrowAngle(coords.x, coords.y, circle.getX(), circle.getY());

  e.target.rotation(theta);

  e.target.setX(circle.getX());
  e.target.setY(circle.getY());

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

  let overlay = new Konva.Circle({
    x: x_val,
    y: y_val,
    radius: self_arrow_radius,
    name: "self-arrow",
  });

  let group = new Konva.Group({
    x: x,
    y: y,
    draggable: true,
    name: "self-arrow",
  });
  group.add(arc);
  group.add(tip);
  group.add(overlay);

  group.on("mouseover", selfArrowOverEvent);
  group.on("mouseout", selfArrowOutEvent);
  group.on("click", selfArrowClickEvent);
  group.on("dragmove", selfArrowDragMoveEvent);

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

function updateArrowPoints(arrow, circle1, circle2) {
  if (arrow != null) {
    let p = calcPoints(
      circle1.getX(),
      circle1.getY(),
      circle2.getX(),
      circle2.getY(),
      circle1.radius(),
      circle2.radius()
    );
    arrow.setPoints(p);
  }
}

//initial-arrow angle function
//  returns the proper angle for the arrow
//    given mouse location and circle location
function initialArrowAngle(mouse_x, mouse_y, circle_x, circle_y) {
  let x = mouse_x - circle_x;
  let y = mouse_y - circle_y;

  if (x == 0 && y == 0) return;

  let theta = Math.atan(y / x) * (180 / Math.PI);

  if (x >= 0) theta += 180;
  if (theta < 0) theta += 360;

  let sector_size = 15;
  theta += sector_size / 2;
  theta -= theta % sector_size;

  return theta;
}

//creates a new initial arrow pointing to (x, y)
function newInitialArrow(x, y) {
  let shared_offset = -radius - circle_width - 5;
  let arrow = new Konva.Arrow({
    points: [shared_offset - initial_arrow_length, 0, shared_offset, 0],
    pointerLength: arrow_pointer_size,
    pointerWidth: arrow_pointer_size,
    tension: 100,
    fill: stroke_color,
    stroke: stroke_color,
    strokeWidth: arrow_width,
    name: "initial-arrow",
  });

  let group = new Konva.Group({
    x: x,
    y: y,
    draggable: true,
    name: "initial-arrow",
  });

  group.add(arrow);

  return group;
}

//creates a new final sub-circle centered at (x, y)
function newFinalSubCircle(x, y) {
  var circle = new Konva.Circle({
    x: x,
    y: y,
    radius: final_subcircle_radius,
    stroke: stroke_color,
    strokeWidth: circle_width,
    draggable: true,
    name: "final-subcircle",
  });
  return circle;
}

//variables for circle events
let from_circle;
let selected_circle = null;
let over_circle = null;
let hovering = false;
let self_hovering = false;
let temp_arrow = null;
let temp_self_arrow = null;
let temp_initial_arrow = null;
let temp_final_subcircle = null;

//handles changing the mode for circles
function changeMode(new_mode) {
  //console.log(new_mode);
  if (mode == modes.SELECT) {
    if (selected_circle != null) {
      selected_circle.stroke(stroke_color);

      selected_circle = null;

      layer.draw();
    }
  } else if (mode == modes.MARK.INITIAL) {
    over_circle = null;
  }

  if (mode != modes.INSERT.TRANSITION.FROM) {
    if (temp_arrow != null) {
      temp_arrow.destroy();
      temp_arrow = null;
      layer.draw();
    }
    if (temp_self_arrow != null) {
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
      temp_self_arrow.moveToBottom();

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

      //checks if new transition already exists
      if (
        arrows[out_circle.id()] != undefined &&
        arrows[out_circle.id()][in_circle.id()] != undefined
      ) {
        arrow.destroy();
      } else {
        //assings arrow an id
        arrow.setAttr("id", arrow_ids++);

        //adds circles and arrow to the adjaceny lists
        directed_out[out_circle.id()].push(in_circle);
        directed_in[in_circle.id()].push(out_circle);
        arrows[out_circle.id()][in_circle.id()] = arrow;
        circles[arrow.id()] = { out: out_circle, in: in_circle };
      }

      layer.draw();

      changeMode(modes.INSERT.TRANSITION.FROM);

      break;
    }

    //removes element
    case modes.REMOVE: {
      /*
      console.log(JSON.stringify(circles));
      console.log(JSON.stringify(arrows));
      console.log(JSON.stringify(directed_in));
      console.log(JSON.stringify(directed_out));
      console.log("");
      */
      removeCircle(e.target);
      /*
      console.log(JSON.stringify(circles));
      console.log(JSON.stringify(arrows));
      console.log(JSON.stringify(directed_in));
      console.log(JSON.stringify(directed_out));
      console.log("");
      */
      e.target.destroy();

      layer.draw();
      break;
    }

    case modes.MARK.INITIAL: {
      if (start_circles[e.target.id()] == undefined) {
        start_circles[e.target.id()] = temp_initial_arrow;
        temp_initial_arrow = null;
      } else {
        start_circles[e.target.id()].destroy();
        delete start_circles[e.target.id()];
      }
      layer.draw();
      break;
    }

    case modes.MARK.FINAL: {
      if (end_circles[e.target.id()] == undefined) {
        end_circles[e.target.id()] = temp_final_subcircle;
        temp_final_subcircle = null;
      } else {
        end_circles[e.target.id()].destroy();
        delete end_circles[e.target.id()];
      }
      layer.draw();
      break;
    }
  }

  updateDisplay();
}

function circleOverEvent(e) {
  if (mode == modes.INSERT.STATE) return;

  switch (mode) {
    case modes.MARK.INITIAL: {
      if (start_circles[e.target.id()] == undefined) {
        over_circle = e.target;
        temp_initial_arrow = newInitialArrow(e.target.getX(), e.target.getY());
        layer.add(temp_initial_arrow);
        temp_initial_arrow.moveToBottom();
      }
      break;
    }

    case modes.MARK.FINAL: {
      if (end_circles[e.target.id()] == undefined) {
        temp_final_subcircle = newFinalSubCircle(
          e.target.getX(),
          e.target.getY()
        );
        layer.add(temp_final_subcircle);
        temp_final_subcircle.moveToBottom();
      }
      break;
    }

    //if adding new transition
    case modes.INSERT.TRANSITION.TO: {
      hovering = true;

      //causes arrow to "snap" to the circle being hovered over
      if (selected_circle != e.target) {
        updateArrowPoints(temp_arrow, selected_circle, e.target);
      }
      //hides temp_arrow if hovering over selected_circle
      else {
        temp_arrow.remove();
      }

      break;
    }
  }

  if (mode != modes.MARK.INITIAL && mode != modes.MARK.FINAL) {
    e.target.radius(radius + 5);
  }

  layer.draw();
}

function circleOutEvent(e) {
  if (mode == modes.INSERT.STATE) return;

  hovering = false;
  e.target.radius(radius);

  switch (mode) {
    case modes.MARK.INITIAL: {
      if (temp_initial_arrow != null) {
        over_circle = null;
        temp_initial_arrow.destroy();
        temp_initial_arrow = null;
      }
      break;
    }

    case modes.MARK.FINAL: {
      if (temp_final_subcircle != null) {
        temp_final_subcircle.destroy();
        temp_final_subcircle = null;
      }

      break;
    }
  }

  layer.draw();
}

function circleMouseDownEvent(e) {
  if (
    mode == modes.SELECT ||
    mode == modes.INSERT.TRANSITION.TO ||
    mode == modes.INSERT.TRANSITION.FROM ||
    mode == modes.REMOVE
  ) {
    e.target.radius(radius);
    updateArrowPoints(temp_arrow, selected_circle, e.target);

    layer.draw();
  }
}

function circleMouseUpEvent(e) {
  if (
    mode == modes.SELECT ||
    mode == modes.INSERT.TRANSITION.TO ||
    mode == modes.INSERT.TRANSITION.FROM ||
    mode == modes.REMOVE
  ) {
    e.target.radius(radius + 5);
    updateArrowPoints(temp_arrow, selected_circle, e.target);

    layer.draw();
  }
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
  if (temp_self_arrow != null && cur == selected_circle) {
    temp_self_arrow.setX(cur.getX());
    temp_self_arrow.setY(cur.getY());
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
  updateArrowPoints(temp_arrow, selected_circle, cur);

  //redraws initial arrow and final subcircle if applicable
  if (start_circles[id] != undefined) {
    let temp = start_circles[id];
    temp.setX(cur.getX());
    temp.setY(cur.getY());
  }
  if (temp_initial_arrow != null) {
    temp_initial_arrow.setX(cur.getX());
    temp_initial_arrow.setY(cur.getY());
  }

  if (end_circles[id] != undefined) {
    let temp = end_circles[id];
    temp.setX(cur.getX());
    temp.setY(cur.getY());
  }
  if (temp_final_subcircle != null) {
    temp_final_subcircle.setX(cur.getX());
    temp_final_subcircle.setY(cur.getY());
  }

  layer.draw();
}

//generates a new circle at the current mouse position
function newCircle(is_hover = false) {
  var coords = getCoords();

  var circle = new Konva.Circle({
    x: coords.x,
    y: coords.y,
    radius: radius,
    stroke: stroke_color,
    strokeWidth: circle_width,
    draggable: true,
    name: "circle",
  });

  if (!is_hover) {
    circle.setAttr("id", circle_ids++);

    directed_in[circle.id()] = [];
    directed_out[circle.id()] = [];
    arrows[circle.id()] = {};

    circle.on("mouseover", circleOverEvent);
    circle.on("mouseout", circleOutEvent);
    circle.on("mousedown", circleMouseDownEvent);
    circle.on("mouseup", circleMouseUpEvent);
    circle.on("click", circleClickEvent);
    circle.on("dragmove", circleDragMoveEvent);
  }

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
    hover_circle = newCircle(true);

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
  switch (mode) {
    //has hover_circle follow mouse
    case modes.INSERT.STATE: {
      let coords = getCoords();

      hover_circle.x(coords.x);
      hover_circle.y(coords.y);

      layer.draw();
      break;
    }
    //adjusts arrow accordingly if currently inserting a transition
    case modes.INSERT.TRANSITION.TO: {
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
          temp_self_arrow.moveToBottom();

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
        let theta = selfArrowAngle(
          coords.x,
          coords.y,
          circle_coords.x,
          circle_coords.y
        );

        temp_self_arrow.rotation(theta);
        layer.draw();
      }
      break;
    }

    case modes.MARK.INITIAL: {
      if (temp_initial_arrow != null && over_circle != null) {
        let coords = getCoords();
        temp_initial_arrow.rotation(
          initialArrowAngle(
            coords.x,
            coords.y,
            over_circle.getX(),
            over_circle.getY()
          )
        );
        layer.draw();
      }
      break;
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

document.getElementById("mark_initial").addEventListener("click", function () {
  changeMode(modes.MARK.INITIAL);
});

document.getElementById("mark_final").addEventListener("click", function () {
  changeMode(modes.MARK.FINAL);
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
