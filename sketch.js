const camera = new Camera();
let editor;

function setup() {
  Explorer.init();

  let canvasDiv = document.getElementById("canvasDiv");

  canvasDiv.oncontextmenu = function (e) {
    e.preventDefault();
  };

  let canvas = createCanvas(canvasDiv.clientWidth, canvasDiv.clientHeight);
  canvas.parent("canvasDiv");

  editor = new Editor();
}

function keyPressed() {
  if (keyCode === 32)
    camera.reset();

}

function windowResized() {
  let canvasDiv = document.getElementById("canvasDiv");
  resizeCanvas(canvasDiv.clientWidth, canvasDiv.clientHeight);
}

function mouseDragged() {
  if (mouseButton === CENTER) 
    camera.drag();
}

function mouseWheel(event) {
  camera.updateScale(event.delta);
}

function draw() {
  push();
  camera.update();
  editor.draw();
  pop();

  editor.drawStatic();
}
