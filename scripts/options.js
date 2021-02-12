//initializes options form
let type_selector = document.getElementById("automata");
type_selector.style.maxHeight = type_selector.scrollHeight + "px";

//handles changing the type (graph, transition diagrams, etc.)
document.getElementById("type").addEventListener("change", function () {
  let s = document.getElementById("type");
  let opt = s.options;

  for (let i = 0; i < opt.length; i++) {
    document.getElementById(opt[i].value).style.maxHeight = null;
  }

  let val = document.getElementById(s.value);
  val.style.maxHeight = val.scrollHeight + "px";

  hideMainDisplays();
  openMainDisplay();
});

//handles changing the machine model for transition diagrams
document.getElementById("model").addEventListener("change", function () {
  openMainDisplay();
  clearSelections(true);
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

let transition_textbox = document.getElementById("transition-textbox");
transition_textbox.placeholder = String.fromCharCode(949) + ", a, b";

let state_textbox = document.getElementById("state-textbox");
state_textbox.placeholder = "0, 1, 2, A, B, ...";

changeMode(modes.INSERT.STATE);
