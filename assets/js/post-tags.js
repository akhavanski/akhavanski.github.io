// The tags in the note under a post: pointing at the key (or tapping it)
// unlocks them. The key slides in from the left and turns as in a lock,
// then the tags come out one by one (the animation is in assets/css/main.scss).
// It plays to the end once started; the next pointing replays it.
// The post layout loads this script only when the post has tags.
(function () {
  var tags = document.querySelector(".post-tags");
  var key = tags && tags.querySelector(".key");
  if (!key) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var last = tags.querySelectorAll(".tag");
  last = last[last.length - 1];
  var playing = false;

  key.addEventListener("pointerenter", function () {
    if (playing) return;
    playing = true;
    tags.classList.remove("is-open");
    void tags.offsetWidth; // restart the animation
    tags.classList.add("is-open");
  });

  (last || key).addEventListener("animationend", function () {
    playing = false;
  });
})();
