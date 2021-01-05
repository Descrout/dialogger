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
    }

    createNodes() {
        const saveData = this.node.data.time_path;
        this.timePath = new Node(this.w + 10, 44, saveData, false);
        this.outs.push(this.timePath);
        this.addChild(this.timePath);
    }

    editButton() {
        DialogEditor.openEditing(this.node);
    }

    closeButton() {
        editor.removePanel(this);
    }

    draw() {
        super.draw();

        line(this.x, this.y + 80, this.x + this.w, this.y + 80);
        line(this.x + this.w / 2, this.y + 40, this.x + this.w / 2, this.y + 80);

        noStroke();
        fill(0);
        text(`Talker : ${this.characterNode.text}`, this.x + 5, this.y + 55, this.w / 2, 40);
        text(`Time-Limit : ${this.node.data.time_limit}s`, this.x + this.w / 2 + 70, this.y + 55, this.w / 2, 40);
        text(this.node.data.text, this.x + 5, this.y + 95, 350, this.h - 90);
    }
}