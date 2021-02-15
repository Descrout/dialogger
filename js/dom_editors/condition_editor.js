class ConditionEditor {
	static tempNode = null;

	static dialog = $("#condition-edit").dialog({
        autoOpen: false,
        width: window.innerWidth / 1.3,
        height: window.innerHeight / 1.1,
        modal: true,
        buttons: {
            "Save": ConditionEditor.finishEditing,
            Cancel: () => {
                ConditionEditor.dialog.dialog("close");
            }
        },
        close: function () {
            ConditionEditor.form[0].reset();
            editor.pause = false;
        }
    });

    static form = ConditionEditor.dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        ConditionEditor.finishEditing();
    });

    static refreshFields() {
		const node = ConditionEditor.tempNode;
		$("#condition_name").val(node.text);

        const condition_fs = document.getElementById("condition_fs");
        Operation.reset(condition_fs, "Logic");

        if(node.data.if_operation !== null && 
           node.data.if_operation !== undefined) Operation.construct(condition_fs, node.data.if_operation);
        else Operation.addSelect(condition_fs);
    }

    static openEditing(node) {
        ConditionEditor.dialog.dialog("open");
        editor.pause = true;
        ConditionEditor.tempNode = node;
        Operation.showAlerts = true;
        ConditionEditor.refreshFields();
    }

    static finishEditing() {
    	const node = ConditionEditor.tempNode;
        const name = $("#condition_name").val();
        const panel = editor.getPanel(node.id);

        if(panel.setOperation(document.getElementById("condition_fs"))) {
            Explorer.tree().rename_node(node.id, name);
            node.data.text = name;
            $("#condition_fs").empty();
            panel.checkRefs();
            ConditionEditor.dialog.dialog("close");
            Explorer.changeHappened();
        }
    }
}