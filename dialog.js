class Dialog extends UIElement {
    constructor(node) {
        super(node.data.x, node.data.y, 300 ,200);
        this.node = node;
        this.dragging = false;

        this.dragButton = new Button(null, 0, 0, () => {
            this.dragging = true;
            editor.dialogs.delete(this.node.id);
            editor.dialogs.set(this.node.id, this);
        }, 250);
        this.dragButton.isWorld = true;

        this.closeButton = new Button("X", 250, 0, () => {
            editor.removeDialog(this);
        }, 50);
        this.closeButton.isWorld = true;

        this.addChild(this.dragButton);
        this.addChild(this.closeButton);
    }

    mousePressed() {

    }

    draw() {
        stroke(140);
        fill(180);
        rect(this.x, this.y, this.w, this.h);
    }

    sync() {
        super.sync();
        if(!mouseIsPressed || !mouseInScreen()) this.dragging = false;


        if(this.dragging) {
            this.relativeX += movedX / camera.scale;
            this.relativeY += movedY / camera.scale;
            this.relativeX = max(this.relativeX, 0);
            this.relativeY = max(this.relativeY, editor.upPanel.h / camera.scale);
        }
        this.node.data.x = this.relativeX;
        this.node.data.y = this.relativeY;
        

    }
}