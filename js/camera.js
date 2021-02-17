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
        this.posOut = document.getElementById("camPos");
    }

    set(x, y, scale) {
        this.scale = scale;
        this.rawX = x;
        this.rawY = y;
        this.rawToPos();
        editor.slider.value(this.scale);
    }

    reset() {
       this.set(5000, 5000, 1.0);
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
        editor.slider.value(this.scale);
    }

    rawToPos() {
        this.rawX = max(this.rawX, 0.0);
        this.rawY = max(this.rawY, 0.0);
        this.x = this.rawX / this.scale;
        this.y = this.rawY / this.scale;
        editor.scaleOut.html(`${this.scale.toFixed(1)}`);
        this.posOut.innerHTML = `${floor(this.x)}, ${floor(this.y)}`;
    }

    save() {
        const node = Explorer.tree().get_node("1");
        if(node && node.data && (this.rawX != 0 || this.rawY != 0 || this.scale != 1)) {
            node.data.camera = {rawX: this.rawX, rawY: this.rawY, scale: this.scale};
        }
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