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
        operation: null,
        path: {},
    };
}

function defaultConditionData(x, y) {
    return {
        x: x,
        y: y,
        if_path: {},
        else_path: {},
        if_operation: null,
        options: [],
    };
}


class Editor {
    constructor() {
        this.pause = false;
        this.dragRider = null;
        this.panels = new Map();

        this.scaleOut = createSpan("1.0");
        this.scaleOut.class("unselectable");
        
        this.slider = createSlider(0.5, 2.5, 1.0, 0.01);
        this.slider.style('width', '100px');
        this.slider.input(() => {
            camera.scale = this.slider.value();
            camera.rawX = camera.x * camera.scale;
            camera.rawY = camera.y * camera.scale;
            camera.rawToPos();
        });
    }

    mousePressed() {
        if (mouseButton == CENTER) return;
        this.tempRider = this.dragRider;
        this.dragRider = null;

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
                                else if(node.lineRider.dragPoint === -1)
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

    addSetter() {
        const x = camera.x + camera.w / 2;
        const y = camera.y + camera.h / 2;
        const data = defaultSetterData(x, y);
        const node_id = Explorer.tree().create_node(3, {
            text: `Setter ${this.panels.size + 1}`,
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
            text: `Condition ${this.panels.size + 1}`,
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
            text: `Dialog ${this.panels.size + 1}`,
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

    drawBg() {
        background(255);

        const tileSize = 32;

        const w = width / camera.scale;
        const h = height / camera.scale;

        const camX = floor(camera.x / tileSize);
        const camY = floor(camera.y / tileSize);

        const widthSize = floor(w / tileSize) + camX + 2;
        const heightSize = floor(h / tileSize) + camY + 2;

        strokeWeight(1);
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
        const cx = document.getElementById("canvasDiv").getBoundingClientRect().x;
        this.scaleOut.position(cx + width - 150, height + 54);
        this.slider.position(cx + width - 120, height + 54);
    }
}