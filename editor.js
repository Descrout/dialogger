class Editor {
    constructor() {
        this.upPanel = new UpPanel();

        this.upPanel.addChild(new Button("Save", 10, 10, Editor.save));
        this.upPanel.addChild(new Button("Load", 120, 10, Editor.load));
    }

    static save() {
        saveJSON(Explorer.tree().get_json('#'), 'save.json');
    }

    static load() {
        document.getElementById("saveOpener").addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            let reader = new FileReader();
            reader.onload = () => {
                const parsed = JSON.parse(reader.result);
                if (parsed) {
                    Explorer.tree().settings.core.data = parsed;
                    Explorer.tree().refresh();
                }
            };
            reader.readAsText(file);

        });
        $("#saveOpener").trigger("click");
    }

    drawBg() {
        background(255);

        const tileSize = 32;

        const w = width / camera.scale;
        const h = height / camera.scale;

        const camX = floor(camera.x / tileSize);
        const camY = floor(camera.y / tileSize);

        const widthSize = floor(w / tileSize) + camX + 2;
        const heightSize = floor(h / tileSize) + camY + 2;

        stroke(200);

        for (let i = camX; i < widthSize; i++) {
            line(i * tileSize, 0, i * tileSize, h + camera.y);
        }

        for (let j = camY; j < heightSize; j++) {
            line(0, j * tileSize, w + camera.x, j * tileSize);
        }
    }

    draw() {
        this.drawBg();
    }

    drawStatic() {
        this.upPanel.sync();
    }
}