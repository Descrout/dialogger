class UIElement {
    constructor(x, y) {
        this.parent = null;
        this.x = 0;
        this.y = 0;
        this.relativeX = x;
        this.relativeY = y;
        this.children = [];
        this.visible = true;
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    draw() {

    }

    sync() {
        this.x = this.relativeX;
        this.y = this.relativeY;

        if (this.parent) {
            this.x += this.parent.x;
            this.y += this.parent.y;
        }

        this.x = max(this.x, 0);
        this.y = max(this.y, 0);

        if (!this.visible) return;

        this.draw();

        for (let child of this.children) {
            child.sync();
        }
    }
}

class DownPanel extends UIElement {
    constructor() {
        super(0, height - 32);
        this.h = 32;

        this.slider = createSlider(0.40, 4.0, 1.0, 0.1);
        this.slider.style('width', '100px');
        this.slider.input(() => this.sChanged());

        this.refreshPanel();
    }

    sChanged() {
        camera.scale = this.slider.value();
        camera.rawToPos();
    }

    refreshPanel() {
        this.relativeY = height - 32;

        const canvasDiv = document.getElementById("canvasDiv");
        this.slider.position(canvasDiv.getBoundingClientRect().x + width - 120, height - 25);
    }

    draw() {
        stroke(200);
        fill(255);
        rect(this.x, this.y, width, this.h);
        fill(0);
        noStroke();
        text(`${camera.scale.toFixed(1)}`, this.x + width - 140, this.y + 22);
        text(`${floor(camera.x)}, ${floor(camera.y)}`, this.x + 10, this.y + 20);
    }
}

class UpPanel extends UIElement {
    constructor() {
        super(0, 0);
        this.h = 64;
    }

    draw() {
        stroke(200);
        fill(255);
        rect(this.x, this.y, width, this.h);
    }
}

class Button extends UIElement {
    constructor(val, x, y, clicked, size) {
        super(x, y);
        this.w = size || 100;
        this.h = 40;
        this.clicked = clicked;
        this.onColor = color(150, 100, 50);
        this.offColor = color(240);
        this.pressColor = color(255, 0, 0);
        this.releasable = false;
        this.val = val;
        this.isWorld = false;
    }

    isOn() {
        if(this.isWorld) 
            return this.isOnWorld();

        return (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h);
    }

    isOnWorld() {
        const x = this.x * camera.scale - camera.rawX;
        const y = this.y * camera.scale - camera.rawY;
        const w = this.w * camera.scale;
        const h = this.h * camera.scale;

        return (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h);
    }

    pressing() {
        return (this.isOn() && mouseIsPressed && mouseButton == LEFT);
    }


    draw() {
        stroke(200);
        if(this.pressing()) {
            this.releasable = true;
            fill(this.pressColor);
        }else if(this.isOn()){
            fill(this.onColor);
        }else {
            this.releasable = false;
            fill(this.offColor);
        }

        if(!mouseIsPressed && this.releasable){
            this.releasable = false;
            this.clicked();
        }
            

        rect(this.x, this.y, this.w, this.h);
        if(this.val){
            noStroke();
            fill(0);
            text(this.val, this.x + this.w / 3, this.y + this.h / 2 + 5);
        }
    }
}