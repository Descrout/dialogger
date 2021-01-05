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
        this.isWorld = false;

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
        this.w = width;
        const canvasDiv = document.getElementById("canvasDiv");
        this.slider.position(canvasDiv.getBoundingClientRect().x + width - 120, height - 25);
    }


    draw() {
        stroke(200);
        fill(255);
        rect(this.x, this.y, this.w, this.h);
        fill(0);
        noStroke();
        text(`${camera.scale.toFixed(1)}`, this.x + width - 140, this.y + 22);
        text(`${floor(camera.x)}, ${floor(camera.y)}`, this.x + 10, this.y + 20);
    }
}

class TopMenu extends UIElement {
    constructor() {
        super(0, 0, width, 64);
        this.isWorld = false;
    }

    draw() {
        stroke(200);
        fill(255);
        rect(this.x, this.y, this.w, this.h);
    }
}

class Button extends UIElement {
    constructor(val, x, y, clicked, w, h) {
        super(x, y, w || 100, h || 40);

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

class LineRider {
    constructor(saveData, from, to) {
        this.saveData = saveData;
        this.from = from;
        this.to = to;
        
        this.dragPoint = -1;

        if(to.parent){
            to.parent.ins = to.parent.ins.filter((el) => {
                return el != from;
            });
            to.parent.ins.push(from);
        }  
    }

    draw() {
        if (!mouseIsPressed || !mouseInScreen())
            this.dragPoint = -1;

        if (this.dragPoint != -1) {
            this.saveData.points[this.dragPoint].x += movedX / camera.scale;
            this.saveData.points[this.dragPoint].y += movedY / camera.scale;
        }

        noFill();
        strokeWeight(3);
        stroke(110);
        beginShape();
        vertex(this.from.x + 16, this.from.y + 16);
        for(const p of this.saveData.points) {
            vertex(p.x, p.y);
            ellipse(p.x, p.y, 16, 16);
        }
        vertex(this.to.x + 16, this.to.y + 16);
        endShape();
    }
}

class Node extends UIElement{
    constructor(x, y, saveData, receiver) {
        super(x, y, 32, 32);
        this.onColor = color(255);
        this.offColor = color(240);
        this.receiver = receiver;
        this.saveData = saveData;
        if(!receiver && saveData.id && editor.panels.has(saveData.id)) {
            this.lineRider = new LineRider(saveData, this, editor.getPanel(saveData.id).receiver);

        }
    }

    mousePressed() {
        if(mouseButton != LEFT) return;

        if(this.receiver) 
            editor.nodeStop(this);
        else 
            editor.nodeStart(this);
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
        this.type = "panel";
        this.node = node;
        this.dragging = false;

        this.ins = [];
        this.outs = [];

        this.dragButton = new Button(this.node.text, 50, 0, () => {
            this.dragging = true;
            this.bringFront();
        }, w);

        this.receiver = new Node(-42, 44, null, true);

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

    focus() {
        camera.rawX = this.relativeX * camera.scale - width / 2 + this.w / 2 * camera.scale;
        camera.rawY = this.relativeY * camera.scale - height / 2 + this.h / 2 * camera.scale;
        camera.rawToPos();
        this.bringFront();
    }

    bringFront() {
        editor.panels.delete(this.node.id);
        editor.panels.set(this.node.id, this);
    }

    editButton() {}
    closeButton() {}
    createNodes() {}

    clearNodes() {
        for(const in_node of this.ins) {
            in_node.lineRider.saveData.id = "";
            in_node.lineRider.saveData.type = "";
            in_node.lineRider.saveData.points = [];
            in_node.lineRider = null;
        }
        
        for(const out_node of this.outs) {
            if(out_node.lineRider) {
                const nextPanel = out_node.lineRider.to.parent;
                nextPanel.ins = nextPanel.ins.filter((el) => {
                    return el != out_node;
                });
            }
        }
    }

    outView() {
        return (this.relativeX + this.w + 48 < camera.x || this.relativeX - 48 > camera.x + camera.w ||
                this.relativeY + this.h < camera.y || this.relativeY > camera.y + camera.h);
    }

    sync() {
        if(this.outView())  return;
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