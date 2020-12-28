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

        if (!this.visible) return;

        this.draw();

        for (let child of this.children) {
            child.sync();
        }
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
    constructor(val, x, y, clicked) {
        super(x, y);
        this.w = 100;
        this.h = 40;
        this.clicked = clicked;
        this.onColor = color(150, 100, 50);
        this.offColor = color(240);
        this.pressColor = color(255, 0, 0);
        this.releasable = false;
        this.val = val;
    }

    isOn() {
        return (mouseX > this.x && mouseX < this.x + this.w && mouseY > this.y && mouseY < this.y + this.h);
    }

    pressing() {
        return (this.isOn() && mouseIsPressed);
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
        noStroke();
        fill(0);
        text(this.val, this.x + this.w / 2 - 12, this.y + this.h / 2 + 5);
    }
}