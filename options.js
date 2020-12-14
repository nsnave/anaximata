//initializes options form
let type = document.getElementById("automata");
type.style.maxHeight = type.scrollHeight + "px";

//handles changing the type (graph, transition digrapm, etc.)
document.getElementById("type").addEventListener("change", function () {
  let s = document.getElementById("type");
  let opt = s.options;

  for (let i = 0; i < opt.length; i++) {
    document.getElementById(opt[i].value).style.maxHeight = null;
  }

  let val = document.getElementById(s.value);
  val.style.maxHeight = val.scrollHeight + "px";
});

//handles changing color of selected tool button
let mode_btns = document.getElementsByClassName("mode_button");

for (let i = 0; i < mode_btns.length; i++) {
  mode_btns[i].addEventListener("click", function () {
    for (let j = 0; j < mode_btns.length; j++) {
      mode_btns[j].classList.remove("mode_button_active");
    }

    this.classList.add("mode_button_active");
  });
}
