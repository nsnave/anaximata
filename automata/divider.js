//handles resizing the right sidenav
document.getElementById("rightdivider").onmousedown = dividerMouseDown;

function dividerMouseDown(e) {
  document.onmouseup = dividerMouseUp;
  document.onmouseleave = dividerMouseUp;

  document.onmousemove = dividerMouseMove;
}

function dividerMouseUp(e) {
  document.onmouseup = null;
  document.onmousemove = null;
}

function dividerMouseMove(e) {
  let new_right = window.innerWidth - e.clientX - 1;

  if (new_right < 32) new_right = 32;

  let left_bound = left_open ? left_open_width : 32;
  if (new_right > window.innerWidth - left_bound)
    new_right = window.innerWidth - left_bound;

  changeRightOpenWidth(new_right);

  updateStageOffsets();
}
