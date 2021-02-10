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
        charSelect.add(new Option("undefined", "undefined"));

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
        
        Explorer.tree().rename_node(node.id, $("#dialog_name").val());
        node.data.text = $("#dialog_text").val();
        node.data.time_limit = $("#time_limit").val();

        const selOp = charSelect.options[charSelect.selectedIndex];
        if (selOp.value != "undefined") {
            node.data.character = selOp.value;
            editor.getPanel(node.id).characterNode = Explorer.tree().get_node(selOp.value);
        }else{
            node.data.character = null;
            editor.getPanel(node.id).characterNode = {text: "undefined"};
        }

        DialogEditor.tempNode = null;

        editor.getPanel(node.id).checkRefs();

        DialogEditor.dialog.dialog("close");
    }
}

class Dialog extends OptionPanel {
    constructor(node) {
        super(node, 260, 200);
        this.type = "dialog";
        this.characterNode = Explorer.tree().get_node(node.data.character);
        
        this.addOptionButton = new Button("Add Dialog Choice", 0, this.h, () => {
            this.addOption();
        }, this.w, 40);
        this.addChild(this.addOptionButton);
    }

    optionClicked(option) {
        Operation.showAlerts = false;
        GlobalEditor.openEditing(option);
    }

    checkRefs() {
        CharacterEditor.refMap.clearPanel(this.node.id);

        const vars = CharacterEditor.parseForValues(this.node.data.text);
        for(const variable of vars) {
            CharacterEditor.refMap.checkRef(variable, this.node.id);
        }

        for(const option of this.options) {
            for(const ref of option.refs.keys()) {
                CharacterEditor.refMap.checkRef(ref, this.node.id);
            }

            const opt_vars = CharacterEditor.parseForValues(option.data.text);
            for(const variable of opt_vars) {
                CharacterEditor.refMap.checkRef(variable, this.node.id);
            }
        }
    }

    renameRef(oldName, newName) {
        this.node.data.text = this.node.data.text.replaceAll("${"+oldName+"}", "${"+newName+"}");

        for(const option of this.options) {
            const temps = option.refs.get(oldName);
            if(temps) {
                for(const temp of temps) {
                    temp.var = newName;
                }

                option.refs.delete(oldName);
                option.refs.set(newName, temps);
            }

            option.setText(option.data.text.replaceAll("${"+oldName+"}", "${"+newName+"}"));
        }
    }

    initLazy() {
        super.initLazy();

        const saveData = this.node.data.time_path;
        this.timePath = new Node(this.w + 10, 44, saveData, false);
        this.outs.push(this.timePath);
        this.addChild(this.timePath);
    }

    editButton() {
        DialogEditor.openEditing(this.node);
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
    }
}