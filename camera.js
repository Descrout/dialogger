class Camera {
    constructor() {
        this.rawX = 0;
        this.rawY = 0;
        this.x = 0;
        this.y = 0;
        this.scale = 1.0;
    }

    reset() {
        this.scale = 1.0;
        this.rawX = 0;
        this.rawY = 0;
        this.rawToPos();
        editor.downPanel.slider.value(camera.scale);
    }

    drag() {
        this.rawX -= movedX;
        this.rawY -= movedY;
        this.rawToPos();
    }

    updateScale(delta) {
        this.scale += delta / 500;
        this.scale = constrain(this.scale, 0.40, 4.0);
        this.rawToPos();
        editor.downPanel.slider.value(camera.scale);
    }

    rawToPos() {
        this.rawX = max(this.rawX, 0.0);
        this.rawY = max(this.rawY, 0.0);
        this.x = this.rawX / this.scale;
        this.y = this.rawY / this.scale;
    }

    update() {
        translate(-camera.rawX, -camera.rawY);
        scale(camera.scale);
    }
}