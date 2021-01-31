class DialogEditor {
    static tempNode = null;

    static dialog = $("#dialog-edit").dialog({
        autoOpen: false,
        height: 450,
        width: 350,
        modal: true,
        buttons: {
            "Save": DialogEditor.finishEditing,
            Cancel: () => {
                DialogEditor.dialog.dialog("close");
            }
        },
        close: function () {
            DialogEditor.form[0].reset();
            editor.pause = false;
        }
    });

    static form = DialogEditor.dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        DialogEditor.finishEditing();
    });

    static refreshFields() {
        const node = DialogEditor.tempNode;
        $("#dialog_name").val(node.text);
        $("#time_limit").val(node.data.time_limit);
        $("#dialog_text").val(node.data.text);

        const charSelect = document.getElementById("select_character");
        $("#select_character").empty();
        for (const char_id of Explorer.tree().get_node(1).children) {
            const character = Explorer.tree().get_node(char_id);
            const option = new Option(character.text, char_id);
            if (node.data.character == char_id)
                option.selected = true;
            charSelect.add(option);
        }
    }

    static openEditing(node) {
        DialogEditor.dialog.dialog("open");
        editor.pause = true;
        DialogEditor.tempNode = node;
        DialogEditor.refreshFields();
    }

    static finishEditing() {
        const node = DialogEditor.tempNode;

        const charSelect = document.getElementById("select_character");
        const selOp = charSelect.options[charSelect.selectedIndex];

        Explorer.tree().rename_node(node.id, $("#dialog_name").val());
        node.data.time_limit = $("#time_limit").val();
        node.data.text = $("#dialog_text").val();

        if (selOp) {
            node.data.character = selOp.value;
            editor.getPanel(node.id).characterNode = Explorer.tree().get_node(selOp.value);
        }

        DialogEditor.tempNode = null;
        DialogEditor.dialog.dialog("close");
    }
}

class Dialog extends Panel {
    constructor(node) {
        super(node, 260, 200);
        this.type = "dialog";
        this.characterNode = Explorer.tree().get_node(node.data.character);
        this.dragOption = null;
        this.options = [];

        this.addOptionButton = new Button("Add Option", 0, this.h, () => {
            this.addOption();
        }, this.w, 40);
        this.addOptionButton.toffX = 145;
        this.addChild(this.addOptionButton);
    }

    outView() {
        return (this.relativeX + this.w + 48 < camera.x || this.relativeX - 48 > camera.x + camera.w ||
            this.relativeY + this.h + (this.options.length * 40) < camera.y || this.relativeY > camera.y + camera.h);
    }

    addOption(preset) {
        const opt = new UIOption(this, preset);
        this.addChild(opt);
        this.options.push(opt);
    }

    initLazy() {
        for(const opt of this.node.data.options) {
            this.addOption(opt);
        }

        const saveData = this.node.data.time_path;
        this.timePath = new Node(this.w + 10, 44, saveData, false);
        this.outs.push(this.timePath);
        this.addChild(this.timePath);
    }

    editButton() {
        DialogEditor.openEditing(this.node);
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

    sync(){
        super.sync();
        if(this.dragOption && this.optionOrderChangeable()){
            const y_pos = this.y + this.h + 40 + (40 * this.dragOption.to);
            stroke(0);
            strokeWeight(3);
            line(this.x, y_pos, this.x + this.w, y_pos);
            strokeWeight(1);
        }
    }

    draw() {
        super.draw();
        

        line(this.x, this.y + 80, this.x + this.w, this.y + 80);
        line(this.x + this.w / 2, this.y + 40, this.x + this.w / 2, this.y + 80);

        textSize(12);
        noStroke();
        fill(0);
        text(`Talker : ${this.characterNode.text}`, this.x + 5, this.y + 55, this.w / 2, 40);
        text(`Time-Limit : ${this.node.data.time_limit}s`, this.x + this.w / 2 + 70, this.y + 55, this.w / 2, 40);
        text(this.node.data.text, this.x + 5, this.y + 95, 350, this.h - 90);

        if(this.dragOption) {
            if(!mouseIsPressed) {
                this.changeOptionOrder();
            }else {
                const bottom = this.y + this.h + 40;
                this.dragOption.to = min(this.options.length, floor(max(0, camera.mouseY - bottom) / 40));
            }
        }
        ////
    }
}