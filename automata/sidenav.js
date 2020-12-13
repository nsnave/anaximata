let left_open = true;
let right_open = false;
let right_width = 32;

function openLeftNav() {
  if (window.innerWidth < 500) closeRightNav();

  left_open = true;

  document.getElementById("settings").style.width = "250px";
  document.getElementById("canvas").style.marginLeft = "250px";

  var btn = document.getElementById("leftnavbtn");
  btn.setAttribute("onClick", "closeLeftNav()");
  btn.innerHTML = "&laquo";
}

function closeLeftNav() {
  left_open = false;

  document.getElementById("settings").style.width = "32px";
  document.getElementById("canvas").style.marginLeft = "32px";

  var btn = document.getElementById("leftnavbtn");
  btn.setAttribute("onClick", "openLeftNav()");
  btn.innerHTML = "&raquo";
}

function openRightNav() {
  if (window.innerWidth < 500) closeLeftNav();

  right_open = true;

  document.getElementById("display").style.width = "250px";
  document.getElementById("canvas").style.marginRight = "250px";

  let div = document.getElementById("rightdivider").style;
  div.width = 0;

  var btn = document.getElementById("rightnavbtn");
  btn.setAttribute("onClick", "closeRightNav()");
  btn.innerHTML = "&raquo";
}

function closeRightNav() {
  right_open = false;

  document.getElementById("display").style.width = "32px";
  document.getElementById("canvas").style.marginRight = "32px";

  var btn = document.getElementById("rightnavbtn");
  btn.setAttribute("onClick", "openRightNav()");
  btn.innerHTML = "&laquo";
}

window.addEventListener("resize", function () {
  if (window.innerWidth < 500 && left_open && right_open) closeLeftNav();
});
/*
//handles resizing the right sidenav
document.getElementById("rightdivider").onmousedown = dividerMouseDown;

function dividerMouseDown(e) {}

function dividerMouseMove(e) {}

function dividerMouseUp(e) {}
*/
