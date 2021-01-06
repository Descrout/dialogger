class Camera {
    constructor() {
        this.rawX = 0;
        this.rawY = 0;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.scale = 1.0;
    }

    reset() {
        this.scale = 1.0;
        this.rawX = 0;
        this.rawY = 0;
        this.rawToPos();
        editor.bottomMenu.slider.value(camera.scale);
    }

    drag() {
        this.rawX -= movedX;
        this.rawY -= movedY;
        this.rawToPos();
    }

    updateScale(delta) {
        this.scale += delta / 500;
        this.scale = constrain(this.scale, 0.5, 2.5);
        this.rawX = this.x * this.scale;
        this.rawY = this.y * this.scale;
        this.rawToPos();
        editor.bottomMenu.slider.value(camera.scale);
    }

    rawToPos() {
        this.rawX = max(this.rawX, 0.0);
        this.rawY = max(this.rawY, 0.0);
        this.x = this.rawX / this.scale;
        this.y = this.rawY / this.scale;
    }

    update() {
        this.mouseX = mouseX / this.scale + this.x;
        this.mouseY = mouseY / this.scale + this.y;
        this.w = width / this.scale;
        this.h = height / this.scale;
        translate(-this.rawX, -this.rawY);
        scale(this.scale);
    }
}