/**
 * @name parallax-banner
 * @function handle youtube video banner
 */

// initial parallax mouse movement
var scene1 = document.getElementById('scene1');
var scene2 = document.getElementById('scene2');
var scene3 = document.getElementById('scene3');
if (scene1) {
  var parallaxInstance1 = new Parallax(scene1);
}

if (scene2) {
  var parallaxInstance2 = new Parallax(scene2);
}

if (scene3) {
  var parallaxInstance3 = new Parallax(scene3);
}

/******** END Parallax banner ********/