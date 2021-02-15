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
        Explorer.changeHappened();
    }
}

