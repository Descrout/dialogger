class Dialog extends UIElement {
    constructor(x, y, data) {
        super(x, y);
        this.w = 300;
        this.h = 200;
        this.node = null;
        this.data = data || {
            name: "New Dialogue",
            x: x,
            y: y,
            text: "This is a dialogue",
        };
    }

    draw() {
        noStroke();
        fill(180);
        rect(this.x, this.y, this.w, this.h);
    }

    sync() {
        super.sync();
        this.data.x = this.x;
        this.data.y = this.y;
    }
}