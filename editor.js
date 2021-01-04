function defaultDialogData(x, y) {
    return {
        x: x,
        y: y,
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        character: null, //id
        time_limit: 0,
        time_path: {},
    };
}


class Editor {
    constructor() {
        this.pause = false;
        this.dragRider = null;

        this.topMenu = new TopMenu();
        this.bottomMenu = new BottomMenu();

        this.panels = new Map();

        this.topMenu.addChild(new Button("Save", 10, 10, Editor.save));
        this.topMenu.addChild(new Button("Load", 120, 10, () => this.load()));

        this.topMenu.addChild(new Button("Dialogue", 320, 10, () => this.newPanel("dialog"), 120));

        for(const el of this.topMenu.children) {
            el.isWorld = false;
        }
    }

    mousePressed() {
        if(mouseButton == CENTER) return;
        this.tempRider = this.dragRider;
        this.dragRider = null;

        let emptyPress = !this.topMenu.listenMousePress();

        if(this.bottomMenu.listenMousePress()) {
            emptyPress = false;
        }

        const panels = Array.from(this.panels.values()).reverse();
        for(const panel of panels) {
            if(panel.listenMousePress()) {
                emptyPress = false;
                break;
            }
        }


        if(emptyPress && this.tempRider && mouseButton == LEFT) {
            this.tempRider.saveData.points.push({x: camera.mouseX, y: camera.mouseY});
            this.dragRider = this.tempRider;
        }
        
    }

    nodeStart(startNode) {
        this.dragRider = new LineRider({points: []}, startNode, {x: camera.mouseX, y: camera.mouseY});
    }

    nodeStop(endNode) {
        if(this.tempRider && this.tempRider.from.parent != endNode.parent){
            const node = this.tempRider.from;

            node.parent.node.data.time_path = {id: endNode.parent.node.id, 
                type: endNode.parent.type, 
                points: this.tempRider.saveData.points
            };

            node.lineRider = new LineRider(node.parent.node.data.time_path, node, endNode);
            this.tempRider = null;
        }
    }

    newPanel(type) {
        let x = 200,
            y = 200;

        if (this.panels.size > 0) {
            const last = Array.from(this.panels)[this.panels.size-1][1];
            x = last.x + 500;
            y = last.y;
        }

        switch(type) {
            case "dialog":
            this.addDialog(x, y);
            break;
        }
        
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
        dialog.createNodes();
        this.panels.set(node_id, dialog);
    }

    getPanel(node_id) {
        return this.panels.get(node_id);
    }

    removePanelViaNode(panel_node) {
        Explorer.tree().delete_node(panel_node);
        this.getPanel(panel_node.id).clearNodes();
        this.panels.delete(panel_node.id);
    }

    removePanel(panel) {
        Explorer.tree().delete_node(panel.node);
        this.getPanel(panel.node.id).clearNodes();
        this.panels.delete(panel.node.id);
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

                this.panels.clear();

                Explorer.tree().settings.core.data = parsed;
                Explorer.tree().refresh();

                $("#jsTreeDiv").on('refresh.jstree', () => {
                    ////Dialogs
                    for (let node_id of Explorer.tree().get_node(2).children) {
                        const dia_node = Explorer.tree().get_node(node_id);
                        const dia = new Dialog(dia_node);
                        this.panels.set(node_id, dia);
                    }

                    /////all panel nodes
                    for(const panel of this.panels.values()) {
                        panel.createNodes();
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

        for (const panel of this.panels.values()) {
            panel.sync();
        }
        
        for (const panel of this.panels.values()) {
            for(const node of panel.ins) {
                if(node.lineRider) node.lineRider.draw();
            }
        }
   

        if(this.dragRider) {
            this.dragRider.to.x = camera.mouseX - 16;
            this.dragRider.to.y = camera.mouseY - 16;
            this.dragRider.draw();
        }
    }

    resize() {
        this.bottomMenu.refreshMenu();
        this.topMenu.w = width;
    }

    drawStatic() {
        this.topMenu.sync();
        this.bottomMenu.sync();
    }
}