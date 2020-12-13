let left_open = true;
let right_open = false;
let left_open_width = 250;
let right_open_width = 250;

function resetTransitionSpeeds() {
  document.getElementById("rightdivider").style.transition = "0.5s";
  document.getElementById("rightsidenav").style.transition = "0.5s";
  document.getElementById("canvas").style.transition = "0.5s";
}

function openLeftNav() {
  if (window.innerWidth < left_open_width + right_open_width) closeRightNav();

  left_open = true;

  resetTransitionSpeeds();

  document.getElementById("leftsidenav").style.width = "250px";
  document.getElementById("canvas").style.marginLeft = "250px";

  var btn = document.getElementById("leftnavbtn");
  btn.setAttribute("onClick", "closeLeftNav()");
  btn.innerHTML = "&laquo";
}

function closeLeftNav() {
  left_open = false;

  updateStageOffsets(32, undefined);
  resetTransitionSpeeds();

  document.getElementById("leftsidenav").style.width = "32px";
  document.getElementById("canvas").style.marginLeft = "32px";

  var btn = document.getElementById("leftnavbtn");
  btn.setAttribute("onClick", "openLeftNav()");
  btn.innerHTML = "&raquo";
}

function openRightNav() {
  if (window.innerWidth < left_open_width + right_open_width) closeLeftNav();

  right_open = true;

  resetTransitionSpeeds();

  document.getElementById("rightsidenav").style.width = right_open_width + "px";
  document.getElementById("canvas").style.marginRight = right_open_width + "px";

  let div = document.getElementById("rightdivider").style;
  div.width = "3px";
  div.right = right_open_width + "px";

  var btn = document.getElementById("rightnavbtn");
  btn.setAttribute("onClick", "closeRightNav()");
  btn.innerHTML = "&raquo";
}

function closeRightNav() {
  right_open = false;

  updateStageOffsets(undefined, 32);
  resetTransitionSpeeds();

  document.getElementById("rightsidenav").style.width = "32px";
  document.getElementById("canvas").style.marginRight = "32px";

  let div = document.getElementById("rightdivider").style;
  div.width = 0;
  div.right = "32px";

  var btn = document.getElementById("rightnavbtn");
  btn.setAttribute("onClick", "openRightNav()");
  btn.innerHTML = "&laquo";
}

function changeRightOpenWidth(new_right) {
  if (right_open) {
    right_open_width = new_right;

    document.getElementById("rightdivider").style.transition = "0s";
    document.getElementById("rightsidenav").style.transition = "0s";
    document.getElementById("canvas").style.transition = "0s";

    document.getElementById("rightdivider").style.right = new_right + "px";
    document.getElementById("rightsidenav").style.width = new_right + "px";
    document.getElementById("canvas").style.marginRight = new_right + "px";
  }
}

window.addEventListener("resize", function () {
  if (
    left_open &&
    right_open &&
    window.innerWidth < left_open_width + right_open_width
  )
    closeLeftNav();

  if (right_open && right_open_width > window.innerWidth - 32) {
    let new_right = window.innerWidth - 32;
    changeRightOpenWidth(new_right);
  }
});
