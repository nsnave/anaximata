//handles resizing the right sidenav
document.getElementById("rightdivider").onmousedown = dividerMouseDown;

function dividerMouseDown(e) {
  document.onmouseup = dividerMouseUp;
  document.onmouseleave = dividerMouseUp;

  document.onmousemove = dividerMouseMove;
  console.log("down");
}

function dividerMouseUp(e) {
  document.onmouseup = null;
  document.onmousemove = null;
  console.log("up");
}

function dividerMouseMove(e) {
  let new_right = window.innerWidth - e.clientX - 1;

  if (new_right < 32) new_right = 32;

  let left_bound = left_open ? left_open_width : 32;
  if (new_right > window.innerWidth - left_bound)
    new_right = window.innerWidth - left_bound;

  right_open_width = new_right;
  console.log(right_open_width);

  document.getElementById("rightdivider").style.transition = "0s";
  document.getElementById("rightsidenav").style.transition = "0s";
  document.getElementById("canvas").style.transition = "0s";

  document.getElementById("rightdivider").style.right = new_right + "px";
  document.getElementById("rightsidenav").style.width = new_right + "px";
  document.getElementById("canvas").style.marginRight = new_right + "px";

  updateStageOffsets();
}
