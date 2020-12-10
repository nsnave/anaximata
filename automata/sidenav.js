/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openLeftNav() {
  document.getElementById("settings").style.width = "250px";
  let canvas = document.getElementById("canvas");
  canvas.style.marginLeft = "250px";
  console.log(canvas.style.width);

  var btn = document.getElementById("leftnavbtn");
  btn.setAttribute("onClick", "closeLeftNav()");
  btn.innerHTML = "&laquo";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeLeftNav() {
  document.getElementById("settings").style.width = "32px";
  document.getElementById("canvas").style.marginLeft = "32px";

  var btn = document.getElementById("leftnavbtn");
  btn.setAttribute("onClick", "openLeftNav()");
  btn.innerHTML = "&raquo";
}
