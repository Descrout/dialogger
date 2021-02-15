const camera = new Camera();
let editor;

function setup() {
  Explorer.init();
  CharacterEditor.refMap = new RefMap();
  
  const canvasDiv = document.getElementById("canvasDiv");

  const canvas = createCanvas(canvasDiv.clientWidth, canvasDiv.clientHeight);
  canvas.parent("canvasDiv");

  editor = new Editor();
  windowResized();
}

function keyPressed() {
  if (editor.pause) return;
  if (keyCode === 32)
    camera.reset();
}

function windowResized() {
  const jsTreeDiv = document.getElementById("jsTreeDiv");
  const canvasDiv = document.getElementById("canvasDiv");
  const topMenu = document.getElementById("topMenu");

  jsTreeDiv.style.width = `${Explorer.resizerPos}px`;
  const w = `${windowWidth - Explorer.resizerPos - 2}px`;
  canvasDiv.style.width = w;
  topMenu.style.width = w;

  resizeCanvas(canvasDiv.clientWidth, canvasDiv.clientHeight);
  editor.resize();
  render();
}

function mouseInScreen() {
  return !(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height);
}

function mousePressed() {
  if (editor.pause || !mouseInScreen()) return;
  Explorer.tree().deselect_all();
  editor.mousePressed();
}

function mouseDragged() {
  if (editor.pause) return;
  if (mouseButton === CENTER)
    camera.drag();
}

function mouseWheel(event) {
  if (editor.pause) return;
  camera.updateScale(event.delta);
}

function draw() {
  if (editor.pause) return;
  render();
}

function render() {
  camera.update();
  editor.draw();
}