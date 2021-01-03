class UIElement {
    constructor(x, y, w, h) {
        this.parent = null;
        this.x = -1000;
        this.y = -1000;
        this.w = w;
        this.h = h;
        this.relativeX = x;
        this.relativeY = y;
        this.children = [];
        this.visible = true;
        this.isWorld = true;
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    mousePressed() {

    }

    listenMousePress() {
        for (let i = this.children.length - 1; i >= 0; i--) {
            if (this.children[i].listenMousePress()) 
                return true;
        }

        if (this.isOn()) {
            this.mousePressed();
            return true;
        }

        return false;
    }

    isOn() {
        if (this.isWorld)
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

class BottomMenu extends UIElement {
    constructor() {
        super(0, height - 32, width, 32);

        this.slider = createSlider(0.5, 2.5, 1.0, 0.1);
        this.slider.style('width', '100px');
        this.slider.input(() => this.sChanged());

        this.refreshMenu();
    }

    sChanged() {
        camera.scale = this.slider.value();
        camera.rawToPos();
    }

    refreshMenu() {
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

class TopMenu extends UIElement {
    constructor() {
        super(0, 0, width, 64);
    }

    draw() {
        stroke(200);
        fill(255);
        rect(this.x, this.y, width, this.h);
    }
}

class Button extends UIElement {
    constructor(val, x, y, clicked, size) {
        super(x, y, size || 100, 40);

        this.clicked = clicked;
        this.onColor = color(255);
        this.offColor = color(240);
        this.val = val;
    }

    mousePressed() {
        if (mouseButton == LEFT)
            this.clicked();
    }

    draw() {
        stroke(200);
        if (this.isOn()) {
            fill(this.onColor);
        } else {
            fill(this.offColor);
        }

        rect(this.x, this.y, this.w, this.h);
        if (this.val) {
            noStroke();
            fill(0);
            text(this.val, this.x + this.w / 3, this.y + this.h / 2 + 5);
        }
    }
}

class Node extends UIElement{
    constructor(x, y, parent, receiver) {
        super(x, y, 32, 32);
        this.onColor = color(255);
        this.offColor = color(240);

        this.parent = parent;
        this.receiver = receiver;

        if(receiver) {
            this.from = [];
        } else {
            this.to = null;
        }
    }

    mousePressed() {

    }

    draw() {
        stroke(100);
        if (this.isOn()) {
            fill(this.onColor);
        } else {
            fill(this.offColor);
        }
        
        rect(this.x, this.y, this.w, this.h);
        if(!this.receiver) {
            line(this.x, this.y + 16, this.x - 10, this.y + 16);
            fill(100);
        }else {
            line(this.x + 32, this.y + 16, this.x + 42, this.y + 16);
        }
        ellipse(this.x + 16, this.y + 16, 10, 10);
    }
}

class Panel extends UIElement {
    constructor(node, w, h) {
        super(node.data.x, node.data.y, w + 100, h);
        this.node = node;
        this.dragging = false;

        this.dragButton = new Button(this.node.text, 50, 0, () => {
            this.dragging = true;
            this.bringFront();
        }, w);

        this.receiver = new Node(-42, 44, this, true);

        this.addChild(new Button('✎', 0, 0, () => this.editButton(), 50));
        this.addChild(this.dragButton);
        this.addChild(new Button("X", 310, 0, () => this.closeButton(), 50));
        this.addChild(this.receiver);
    }

    mousePressed() {
        this.bringFront();
    }

    draw() {
        stroke(140);
        fill(230);
        rect(this.x, this.y, this.w, this.h);
    }

    bringFront() {}
    editButton() {}
    closeButton() {}

    sync() {
        super.sync();
        if (!mouseIsPressed || !mouseInScreen()) this.dragging = false;


        if (this.dragging) {
            this.relativeX += movedX / camera.scale;
            this.relativeY += movedY / camera.scale;
            this.relativeX = max(this.relativeX, 0);
            this.relativeY = max(this.relativeY, editor.topMenu.h / camera.scale);
        }
        this.node.data.x = this.relativeX;
        this.node.data.y = this.relativeY;

        this.dragButton.val = this.node.text;
    }
}