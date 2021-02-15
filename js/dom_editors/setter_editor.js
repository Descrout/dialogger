class SetterEditor {
	static tempNode = null;

	static dialog = $("#setter-edit").dialog({
        autoOpen: false,
        width: window.innerWidth / 1.3,
        height: window.innerHeight / 1.1,
        modal: true,
        buttons: {
            "Save": SetterEditor.finishEditing,
            Cancel: () => {
                SetterEditor.dialog.dialog("close");
            }
        },
        close: function () {
            SetterEditor.form[0].reset();
            editor.pause = false;
        }
    });

    static form = SetterEditor.dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        SetterEditor.finishEditing();
    });

    static refreshFields() {
		const node = SetterEditor.tempNode;
		$("#setter_name").val(node.text);

		const varSelect = document.getElementById("select_variable");
        $("#select_variable").empty();

        CharacterEditor.fillWithVars(varSelect);

        varSelect.value = node.data.variable || "undefined";

        varSelect.onchange = (e) => {
        	node.data.variable = e.target.value;
        	CharacterEditor.refMap.checkRef(node.data.variable, node.id);
        };

        const operation_fs = document.getElementById("operation_fs");
        Operation.reset(operation_fs, "Value");

        if(node.data.operation !== null && 
           node.data.operation !== undefined) Operation.construct(operation_fs, node.data.operation);
        else Operation.addSelect(operation_fs);
    }

    static openEditing(node) {
        SetterEditor.dialog.dialog("open");
        editor.pause = true;
        SetterEditor.tempNode = node;
        SetterEditor.refreshFields();
    }

    static finishEditing() {
    	const node = SetterEditor.tempNode;
        const name = $("#setter_name").val();
        const panel = editor.getPanel(node.id);

        if(panel.setOperation(document.getElementById("operation_fs"))) {
            Explorer.tree().rename_node(node.id, name);
            node.data.text = name;
            $("#operation_fs").empty();
            panel.checkRefs();
            SetterEditor.dialog.dialog("close");
            Explorer.changeHappened();
        }
    }
}

