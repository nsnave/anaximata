let mode_btns = document.getElementsByClassName("mode_button");

for (let i = 0; i < mode_btns.length; i++) {
  mode_btns[i].addEventListener("click", function () {
    for (let j = 0; j < mode_btns.length; j++) {
      mode_btns[j].classList.remove("mode_button_active");
    }

    this.classList.add("mode_button_active");
  });
}
