class UIElement {
    constructor(x, y, w, h) {
        this.parent = null;
        this.x = 0;
        this.y = 0;
        this.w = w;
        this.h = h;
        this.relativeX = x;
        this.relativeY = y;
        this.children = [];
        this.visible = true;
    }

    remove(){
        if(this.parent){
            this.parent.children = this.parent.children.filter((el) => {
                return el != this;
            });
        }
    }
    
    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    mousePressed() {}

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
        const x = this.x * camera.scale - camera.rawX;
        const y = this.y * camera.scale - camera.rawY;
        const w = this.w * camera.scale;
        const h = this.h * camera.scale;

        return (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h);
    }

    draw() {}

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

class Button extends UIElement {
    constructor(val, x, y, clicked, w, h, toffX) {
        super(x, y, w || 100, h || 40);
        this.toffX = toffX || (this.w / 3);
        this.toffY = this.h / 2 + 5;
        this.clicked = clicked;
        this.color = color(240, 255);
        this.val = val;
    }

    mousePressed() {
        if (mouseButton == LEFT)
            this.clicked();
    }

    draw() {
        stroke(200);

        fill(255);
        rect(this.x, this.y, this.w, this.h);

        if (this.isOn()) {
            this.color.setAlpha(100);
        } else {
            this.color.setAlpha(255);
        }
        
        fill(this.color);
        rect(this.x, this.y, this.w, this.h);

        if (this.val) {
            noStroke();
            fill(0);
            textSize(16);
            text(this.val, this.x + this.toffX, this.y + this.toffY);
        }
    }
}

class LineRider {
    constructor(saveData, from, to) {
        this.saveData = saveData;
        this.from = from;
        this.to = to;

        this.dragPoint = -1;

        if (to.parent) {
            to.parent.ins.push(from);
        }
    }

    draw() {
        if ((!mouseIsPressed || !mouseInScreen()) && this.dragPoint != -1) {
            this.dragPoint = -1;
            Explorer.changeHappened();
        }

        if (this.dragPoint != -1) {
            this.saveData.points[this.dragPoint].x += movedX / camera.scale;
            this.saveData.points[this.dragPoint].y += movedY / camera.scale;
        }

        noFill();
        strokeWeight(3);
        stroke(110);
        beginShape();
        vertex(this.from.x + 16, this.from.y + 16);
        for (const p of this.saveData.points) {
            vertex(p.x, p.y);
            ellipse(p.x, p.y, 16, 16);
        }
        vertex(this.to.x + 16, this.to.y + 16);
        endShape();
    }
}

class Node extends UIElement {
    constructor(x, y, saveData, receiver) {
        super(x, y, 32, 32);
        this.onColor = color(255);
        this.offColor = color(240);
        this.receiver = receiver;
        this.saveData = saveData;
        if (!receiver && saveData.id && editor.panels.has(saveData.id)) {
            this.lineRider = new LineRider(saveData, this, editor.getPanel(saveData.id).receiver);
        }
    }

    remove() {
        super.remove();
        if (this.lineRider) {
            const nextPanel = this.lineRider.to.parent;
            nextPanel.ins = nextPanel.ins.filter((el) => {
                return el != this;
            });
        }
    }

    mousePressed() {
        if (mouseButton != LEFT) return;

        if (this.receiver)
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
        if (!this.receiver) {
            line(this.x, this.y + 16, this.x - 10, this.y + 16);
            fill(100);
        } else {
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
        this.addChild(new Button("X", this.w - 50, 0, () => this.closeButton(), 50));
        this.addChild(this.receiver);
    }

    renameRef(oldName, newName) {}

    invalidateRef(refID) {}

    validateRef(refID) {}

    checkRefs() {}

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
    closeButton() {
        editor.removePanel(this);
    }
    initLazy() {}

    clearNodes() {
        for (const in_node of this.ins) {
            in_node.lineRider.saveData.id = "";
            in_node.lineRider.saveData.type = "";
            in_node.lineRider.saveData.points = [];
            in_node.lineRider = null;
        }

        for (const out_node of this.outs) {
            out_node.remove();
        }
    }

    outView() {
        return (this.relativeX + this.w + 48 < camera.x || this.relativeX - 48 > camera.x + camera.w ||
            this.relativeY + this.h < camera.y || this.relativeY > camera.y + camera.h);
    }

    sync() {
        super.sync();

        if ((!mouseIsPressed || !mouseInScreen()) && this.dragging) {
            this.dragging = false;
            Explorer.changeHappened();
        }

        if (this.dragging) {
            this.relativeX += movedX / camera.scale;
            this.relativeY += movedY / camera.scale;
            this.relativeX = max(this.relativeX, 0);
            this.relativeY = max(this.relativeY, 0);
        }

        this.node.data.x = this.relativeX;
        this.node.data.y = this.relativeY;

        this.dragButton.val = this.node.text;
    }
}

class OptionPanel extends Panel {
    constructor(node, w, h) {
        super(node, w, h);
        this.dragOption = null;
        this.options = [];
        this.bottom = this.h + 40;
    }

    optionClicked(option) {}

    addOption(preset) {
        const opt = new UIOption(this, preset);
        this.addChild(opt);
        this.options.push(opt);
        this.calcBottom();
        return opt;
    }

    calcBottom() {
        this.bottom = this.h + 40 + this.options.length * 40;
        Explorer.changeHappened();
    }

    initLazy() {
        for(const opt of this.node.data.options) {
            this.addOption(opt);
        }
    }

    outView() {
        return (this.relativeX + this.w + 48 < camera.x || this.relativeX - 48 > camera.x + camera.w ||
            this.relativeY + this.bottom < camera.y || this.relativeY > camera.y + camera.h);
    }

    optionOrderChangeable() {
        const from = this.dragOption.from;
        const to = this.dragOption.to;

        return (from != to && to != from + 1);
    }

    changeOptionOrder() {
        if(this.optionOrderChangeable()) {
            const put = {};
            put.opt = this.options.splice(this.dragOption.from, 1);
            put.data = this.node.data.options.splice(this.dragOption.from, 1);

            if(this.dragOption.from > this.dragOption.to) this.splitOptions(this.dragOption.to, put);
            else this.splitOptions(this.dragOption.to - 1, put);
            Explorer.changeHappened();
        }
        this.dragOption = null;
    }

    splitOptions(index, put) {
        const jump = put ? 0 : 1;

        const before = this.options.slice(0, index);
        const after = this.options.slice(index + jump);

        const beforeData = this.node.data.options.slice(0, index);
        const afterData = this.node.data.options.slice(index + jump);
        
        if(put) {
            this.options = before.concat(put.opt, after);
            this.node.data.options = beforeData.concat(put.data, afterData);
        }else {
            this.options = before.concat(after);
            this.node.data.options = beforeData.concat(afterData);
        }
        
        for(let i = 0; i < this.options.length; i++) {
            this.options[i].setNewIndex(i);
        }
    }

    sync() {
        super.sync();
        
        if(this.dragOption) {
            if(!mouseIsPressed) {
                this.changeOptionOrder();
            }else {
                const bottom = this.y + this.h + 40;
                this.dragOption.to = min(this.options.length, floor(max(0, camera.mouseY - bottom) / 40));
                this.drawLine();
            }
        }
    }

    drawLine() {
        if(this.optionOrderChangeable()){
            const y_pos = this.y + this.h + 40 + (40 * this.dragOption.to);
            stroke(0);
            strokeWeight(3);
            line(this.x, y_pos, this.x + this.w, y_pos);
            strokeWeight(1);
        }
    }
}

class UIOption extends UIElement {
    constructor(parent, preset){
        super(0, 0, parent.w, 40);
        this.parent = parent;

        this.data = preset || {
            text: "Empty",
            path: {},
            operation: null
        };

        this.optNode = new Node(this.w + 10, 4, this.data.path, false);
        parent.outs.push(this.optNode);

        if(!preset) {
            this.refs = new Map();
            parent.node.data.options.push(this.data);
        } else {
            this.refs = Operation.getRefs(this.data.operation);
        }
        
        this.index = parent.options.length;
        this.relativeY = parent.h + 40 + 40 * this.index;
        
        this.textButton = new Button(this.data.text, 42, 0, () => {this.parent.optionClicked(this)}, this.w - 84, this.h, 5);
        this.textButton.color = color(random(255), random(255), random(255)); //placeholder

        this.addChild(new Button("X", 0, 0, () => {this.remove()}, 42, this.h));
        this.addChild(this.textButton);
        this.addChild(new Button("⇅", this.w - 42, 0, () => {this.changePos()}, 42, this.h));
        this.addChild(this.optNode);
    }

    setOperation(field) {
        const operation = Operation.getData(field);
        if(operation) {
            this.data.operation = operation;
            this.refs = Operation.getRefs(operation); 
            return true;
        }
        return false;
    }

    setText(txt) {
        this.data.text = txt;
        let result = "";
        let maxLen = 0;

        for(let i = 0; maxLen < this.textButton.w - 24; i++) {
            const char = txt[i];
            if(!char) break;
            maxLen += textWidth(char);
            result += char;
        }

        if(txt.length - result.length >= 3) result += "...";
        this.textButton.val = result;
    }

    remove(){
        super.remove();
        this.optNode.remove();
        this.parent.splitOptions(this.index, null);
        this.parent.calcBottom();
        this.parent.checkRefs();
    }

    setNewIndex(i) {
        this.index = i;
        this.relativeY = this.parent.h + 40 + 40 * this.index;
    }

    changePos() {
        this.parent.dragOption = {from: this.index, to: this.index};
    }
}