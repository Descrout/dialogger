class Editor {
    constructor() {
        this.pause = false;

        this.upPanel = new UpPanel();
        this.downPanel = new DownPanel();

        this.dialogs = [];

        this.upPanel.addChild(new Button("Save", 10, 10, Editor.save));
        this.upPanel.addChild(new Button("Load", 120, 10, () => this.load()));

        this.upPanel.addChild(new Button("Dialogue", 300, 10, () => this.newDialog(), 120));
    }

    newDialog() {
        let x = 200,
            y = 200;

        if (this.dialogs.length > 0) {
            const last = this.dialogs[this.dialogs.length - 1];
            x = last.x + 400;
            y = last.y;
        }

        this.addDialog(x, y);
    }

    addDialog(x, y) {
        const dialog = new Dialog(x, y);
        this.dialogs.push(dialog);
        dialog.node = Explorer.tree().create_node(2, {
            text: dialog.data.name,
            icon: 'jstree-file',
            a_attr: {
                type: 'file'
            },
            data: dialog.data
        });
    }

    removeDialogNode(dia_node) {
        Explorer.tree().delete_node(dia_node);
        this.dialogs = this.dialogs.filter(function(ele) { 
            return ele.node != dia_node.id; 
        });
    }

    removeDialog(dia) {
        Explorer.tree().delete_node(dia.node);
        this.dialogs = this.dialogs.filter((ele) => { 
            return ele != dia; 
        });
    }

    static save() {
        saveJSON(Explorer.tree().get_json('#'), 'save.json');
    }

    load() {
        document.getElementById("saveOpener").addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            let reader = new FileReader();
            reader.onload = () => {
                if (!reader.result) {
                    alert("Cannot open!");
                    return;
                }

                const parsed = JSON.parse(reader.result);

                if (!parsed) {
                    alert("Cannot open!");
                    return;
                }

                this.dialogs = [];

                Explorer.tree().settings.core.data = parsed;
                Explorer.tree().refresh();

                for (let dia_node of parsed[1].children) {
                    const data = dia_node.data;
                    const dia = new Dialog(data.x, data.y, data);
                    dia.node = dia_node;
                    this.dialogs.push(dia);
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

        for (let dia of this.dialogs) {
            dia.sync();
        }
    }

    resize() {
        this.downPanel.refreshPanel();
    }

    drawStatic() {
        this.upPanel.sync();
        this.downPanel.sync();
    }
}