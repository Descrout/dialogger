function defaultDialogData(x, y) {
    return {
        x: x,
        y: y,
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        character: null, //id
        time_limit: 0
    };
}

class Editor {
    constructor() {
        this.pause = false;

        this.upPanel = new UpPanel();
        this.downPanel = new DownPanel();

        this.dialogs = new Map();

        this.upPanel.addChild(new Button("Save", 10, 10, Editor.save));
        this.upPanel.addChild(new Button("Load", 120, 10, () => this.load()));

        this.upPanel.addChild(new Button("Dialogue", 300, 10, () => this.newDialog(), 120));

        for(const el of this.upPanel.children) {
            el.isWorld = false;
        }
    }

    mousePressed() {
        this.upPanel.listenMousePress();

        const dialogs = Array.from(this.dialogs.values()).reverse();
        for(const dia of dialogs) {
            if(dia.listenMousePress()) break;
        }
    }

    newDialog() {
        let x = 200,
            y = 200;

        if (this.dialogs.size > 0) {
            const last = Array.from(this.dialogs)[this.dialogs.size-1][1];
            x = last.x + 400;
            y = last.y;
        }

        this.addDialog(x, y);
    }

    addDialog(x, y) {
        const data = defaultDialogData(x, y);

        const node_id = Explorer.tree().create_node(2, {
            text: "New Dialogue",
            icon: 'jstree-file',
            a_attr: {
                type: 'file',
                draggable: false
            },
            data: data
        });

        const dialog = new Dialog(Explorer.tree().get_node(node_id));
        this.dialogs.set(node_id, dialog);
    }

    getDialog(node_id) {
        return this.dialogs.get(node_id);
    }

    removeDialogNode(dia_node) {
        Explorer.tree().delete_node(dia_node);
        this.dialogs.delete(dia_node.id);
    }

    removeDialog(dia) {
        Explorer.tree().delete_node(dia.node);
        this.dialogs.delete(dia.node.id);
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

                this.dialogs.clear();

                Explorer.tree().settings.core.data = parsed;
                Explorer.tree().refresh();

                $("#jsTreeDiv").on('refresh.jstree', () => {
                    for (let node_id of Explorer.tree().get_node(2).children) {
                        const dia_node = Explorer.tree().get_node(node_id);
                        const dia = new Dialog(dia_node);
                        this.dialogs.set(node_id, dia);
                    }
                });
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

        for (const dia of this.dialogs.values()) {
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