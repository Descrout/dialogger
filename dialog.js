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
        for(const char_id of Explorer.tree().get_node(1).children) {
            const character = Explorer.tree().get_node(char_id);
            const option = new Option(character.text, char_id);
            if(node.data.character == char_id)
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

        if(selOp) {
            node.data.character = selOp.value;
            editor.getDialog(node.id).characterNode = Explorer.tree().get_node(selOp.value);
        }
        
        DialogEditor.tempNode = null;
        DialogEditor.dialog.dialog("close");
    }
}

class Dialog extends UIElement {
    constructor(node) {
        super(node.data.x, node.data.y, 360 , 200);
        this.node = node;
        this.characterNode = Explorer.tree().get_node(node.data.character);
        this.dragging = false;

        this.editButton = new Button('✎', 0, 0, () => {
            DialogEditor.openEditing(this.node);
        }, 50);
        this.editButton.isWorld = true;

        this.dragButton = new Button(this.node.text, 50, 0, () => {
            this.dragging = true;
            editor.dialogs.delete(this.node.id);
            editor.dialogs.set(this.node.id, this);
        }, 260);
        this.dragButton.isWorld = true;

        this.closeButton = new Button("X", 310, 0, () => {
            editor.removeDialog(this);
        }, 50);
        this.closeButton.isWorld = true;

        this.addChild(this.editButton);
        this.addChild(this.dragButton);
        this.addChild(this.closeButton);
    }

    mousePressed() {

    }

    draw() {
        stroke(140);
        fill(230);
        rect(this.x, this.y, this.w, this.h);
        
        line(this.x, this.y + 80, this.x + this.w, this.y + 80);
        line(this.x + this.w / 2, this.y + 40, this.x + this.w / 2, this.y + 80);

        noStroke();
        fill(0);
        text(`Talker : ${this.characterNode.text}`, this.x + 5, this.y + 55, this.w / 2, 40);
        text(`Time-Limit : ${this.node.data.time_limit}s`, this.x + this.w / 2 + 70, this.y + 55, this.w / 2, 40);
        text(this.node.data.text, this.x + 5, this.y + 95, 350, this.h - 90);
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
        
        this.dragButton.val = this.node.text;
    }
}