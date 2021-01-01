class Dialog extends UIElement {
    constructor(node) {
        super(node.data.x, node.data.y);
        this.w = 300;
        this.h = 200;
        this.node = node;
        this.dragging = false;

        this.dragButton = new Button(null, 0, 0, () => {}, 250);
        this.dragButton.isWorld = true;
        this.addChild(this.dragButton);
    }

    draw() {
        noStroke();
        fill(180);
        rect(this.x, this.y, this.w, this.h);
    }

    sync() {
        super.sync();
        this.node.data.x = this.relativeX;
        this.node.data.y = this.relativeY;
        
        if(this.dragging) {
            this.relativeX += movedX / camera.scale;
            this.relativeY += movedY / camera.scale;
        }
        this.relativeY = max(this.relativeY, editor.upPanel.h);

        if(this.dragButton.pressing()) {
            this.dragging = true;
        }

        if(!mouseIsPressed) this.dragging = false;
    }
}