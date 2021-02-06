function defaultDialogData(x, y) {
    return {
        x: x,
        y: y,
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        character: null, //id
        time_limit: 0,
        time_path: {},
        options: [],
    };
}

function defaultSetterData(x, y) {
    return {
        x: x,
        y: y,
        variable: null,// ref id
        path: {}
    };
}

function defaultConditionData(x, y) {
    return {
        x: x,
        y: y
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

        this.topMenu.addChild(new Button("Dialogue", 320, 10, () => this.newPanel("dialog"), 116, null, 26));
        this.topMenu.addChild(new Button("Setter", 448, 10, () => this.newPanel("setter"), 90, null, 22));
        this.topMenu.addChild(new Button("Condition", 550, 10, () => this.newPanel("condition"), 116, null, 26));

        for (const el of this.topMenu.children) {
            el.isWorld = false;
        }
    }

    mousePressed() {
        if (mouseButton == CENTER) return;
        this.tempRider = this.dragRider;
        this.dragRider = null;

        if (this.topMenu.listenMousePress())
            return;

        if (this.bottomMenu.listenMousePress())
            return;

        const panels = Array.from(this.panels.values()).reverse();
        for (const panel of panels) {
            if (panel.listenMousePress())
                return;
        }

        if (!this.tempRider) {
            for (const panel of this.panels.values()) {
                for (const node of panel.ins) {
                    if (node.lineRider) {
                        const points = node.lineRider.saveData.points;
                        for (let i = 0; i < points.length; i++) {
                            let dx = camera.mouseX - points[i].x;
                            let dy = camera.mouseY - points[i].y;
                            if (dx * dx < 64 && dy * dy < 64) {
                                if (mouseButton == LEFT)
                                    node.lineRider.dragPoint = i;
                                else
                                    points.splice(i, 1);
                                return;
                            }
                        }
                    }
                }
            }
        } else if (mouseButton == LEFT) {
            this.tempRider.saveData.points.push({
                x: camera.mouseX,
                y: camera.mouseY
            });
            this.dragRider = this.tempRider;
        }

    }

    nodeStart(startNode) {
        this.dragRider = new LineRider({
            points: []
        }, startNode, {
            x: camera.mouseX,
            y: camera.mouseY
        });
    }

    nodeStop(endNode) {
        if (this.tempRider && this.tempRider.from.parent != endNode.parent) {
            const node = this.tempRider.from;
            const points = this.tempRider.saveData.points;

            node.saveData.id = endNode.parent.node.id;
            node.saveData.type = endNode.parent.type;
            node.saveData.points = points;

            if(this.tempRider.from.lineRider){
                const before = this.tempRider.from.lineRider.to.parent;
                before.ins = before.ins.filter((el) => {
                    return el != node;
                });
            }

            node.lineRider = new LineRider(node.saveData, node, endNode);
            this.tempRider = null;
        }
    }

    newPanel(type) {
        switch (type) {
            case "dialog":
                this.addDialog();
                break;
            case "setter":
                this.addSetter();
                break;
            case "condition":
                this.addCondition();
                break;
        }
    }



    addSetter() {
        const x = camera.x + camera.w / 2;
        const y = camera.y + camera.h / 2;
        const data = defaultSetterData(x, y);
        const node_id = Explorer.tree().create_node(3, {
            text: "Setter",
            icon: 'jstree-file',
            a_attr: {
                type: 'file',
                draggable: false
            },
            data: data
        });

        const setter = new Setter(Explorer.tree().get_node(node_id));
        setter.initLazy();
        this.panels.set(node_id, setter);
        setter.focus();
    }

    addCondition() {
        const x = camera.x + camera.w / 2;
        const y = camera.y + camera.h / 2;
        const data = defaultConditionData(x, y);
        const node_id = Explorer.tree().create_node(4, {
            text: "Condition",
            icon: 'jstree-file',
            a_attr: {
                type: 'file',
                draggable: false
            },
            data: data
        });

        const condition = new Condition(Explorer.tree().get_node(node_id));
        condition.initLazy();
        this.panels.set(node_id, condition);
        condition.focus();
    }

    addDialog() {
        const x = camera.x + camera.w / 2;
        const y = camera.y + camera.h / 2;
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
        dialog.initLazy();
        this.panels.set(node_id, dialog);
        dialog.focus();
    }

    getPanel(node_id) {
        return this.panels.get(node_id);
    }

    removePanelViaNode(panel_node) {
        CharacterEditor.refMap.clearPanel(panel_node.id);
        Explorer.tree().delete_node(panel_node);
        this.getPanel(panel_node.id).clearNodes();
        this.panels.delete(panel_node.id);
    }

    removePanel(panel) {
        CharacterEditor.refMap.clearPanel(panel.node.id);
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
                    CharacterEditor.refMap = new RefMap();

                    ////Dialogs
                    for (let node_id of Explorer.tree().get_node(2).children) {
                        const dia_node = Explorer.tree().get_node(node_id);
                        const dia = new Dialog(dia_node);
                        this.panels.set(node_id, dia);
                    }

                    ////Setters
                    for (let node_id of Explorer.tree().get_node(3).children) {
                        const setter_node = Explorer.tree().get_node(node_id);
                        const setter = new Setter(setter_node);
                        this.panels.set(node_id, setter);
                    }

                    ////Conditions
                    for (let node_id of Explorer.tree().get_node(4).children) {
                        const condition_node = Explorer.tree().get_node(node_id);
                        const condition = new Condition(condition_node);
                        this.panels.set(node_id, condition);
                    }

                    /////all panel nodes
                    for (const panel of this.panels.values()) {
                        panel.initLazy();
                        panel.checkRefs();
                        panel.sync();
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
            if(!panel.outView())panel.sync();
        }

        for (const panel of this.panels.values()) {
            for (const node of panel.ins) {
                if (node.lineRider) node.lineRider.draw();
            }
        }

        if (this.dragRider) {
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