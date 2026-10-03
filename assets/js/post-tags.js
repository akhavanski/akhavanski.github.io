// The key before the tags in the note under a post: pointing at it
// (or tapping it) makes it slide in from the left and turn as in a lock
// (the animation is in assets/css/main.scss). The tags stay as they are.
// It plays to the end once started; the next pointing replays it.
// The post layout loads this script only when the post has tags.
(function () {
  var tags = document.querySelector(".post-tags");
  var key = tags && tags.querySelector(".key");
  if (!key) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var playing = false;

  key.addEventListener("pointerenter", function () {
    if (playing) return;
    playing = true;
    tags.classList.remove("is-open");
    void tags.offsetWidth; // restart the animation
    tags.classList.add("is-open");
  });

  key.addEventListener("animationend", function () {
    playing = false;
  });
})();
