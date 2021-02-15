//initializes options form
const diagram_types = document
  .getElementById("options")
  .querySelectorAll(".option-content");

diagram_types.forEach(function (diagram) {
  diagram.style.maxHeight = 0;
  diagram.style.overflow = "hidden";
});

let selected_type = document.getElementById("automata");
selected_type.style.maxHeight = selected_type.scrollHeight + "px";

//adds listening for resizing to adapt scrollbar settings accordingly
function updateScrollBars() {
  let options = document.getElementById("options");
  options.style.transition = "0s";

  let w = 200;

  if (options.scrollHeight > window.innerHeight - 60) {
    options.style.overflowY = "scroll";

    let scrollbox = new TempScrollBox();
    w = 200 - scrollbox.width;

    /*
    const textboxes = options.querySelectorAll(".label-textbox");
    textboxes.forEach(function (textbox) {
      console.log(textbox.parentElement.className);
      let v = textbox.parentElement.style.width;
      textbox.style.width = v + "px";
      console.log(v);
    });
    */

    scrollbox = null;
  } else {
    options.style.overflowY = "hidden";
  }

  const titles = options.querySelectorAll("label.title");
  titles.forEach(function (title) {
    title.style.width = w + "px";
  });

  options.style.height = window.innerHeight - 60 + "px";
}

window.addEventListener("resize", updateScrollBars);
updateScrollBars();

//handles changing the type (graph, transition diagrams, etc.)
document.getElementById("type").addEventListener("change", function () {
  let s = document.getElementById("type");
  let opt = s.options;

  for (let i = 0; i < opt.length; i++) {
    let temp = document.getElementById(opt[i].value);
    temp.style.maxHeight = 0;
    temp.style.overflow = "hidden";
  }

  let val = document.getElementById(s.value);
  val.style.maxHeight = val.scrollHeight + "px";

  updateScrollBars();

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

//populates the textboxes with placeholders
let transition_textbox = document.getElementById("transition-textbox");
transition_textbox.placeholder = String.fromCharCode(949) + ", a, b";

let state_textbox = document.getElementById("state-textbox");
state_textbox.placeholder = "0, 1, 2, A, B, ...";

changeMode(modes.INSERT.STATE);
