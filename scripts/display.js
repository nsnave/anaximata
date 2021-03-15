let acc = document.getElementsByClassName("accordion");

for (let i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function () {
    //toggle between adding and removing the "active" class,
    //  to highlight the button that controls the panel
    this.classList.toggle("accordion_active");

    //toggle between hiding and showing the active panel
    let panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
}

//sets certain panels to open
let open_panels = document.getElementsByClassName("panel_open_default");
for (let i = 0; i < open_panels.length; i++) {
  let panel = open_panels[i];
  panel.style.maxHeight = panel.scrollHeight + "px";
}

let active_accordions = document.getElementsByClassName(
  "accordion_active_default"
);
for (let i = 0; i < active_accordions.length; i++) {
  active_accordions[i].classList.add("accordion_active");
}

//shows appropriate main display
hideMainDisplays();
openMainDisplay();
