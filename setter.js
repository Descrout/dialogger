class SetterEditor {
	static tempNode = null;

	static dialog = $("#setter-edit").dialog({
        autoOpen: false,
        width: window.innerWidth / 1.5,
        height: window.innerHeight / 1.2,
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
    	const tree = Explorer.tree();

		const node = SetterEditor.tempNode;
		$("#setter_name").val(node.text);

		const varSelect = document.getElementById("select_variable");
        $("#select_variable").empty();
        varSelect.add(new Option("undefined", "undefined"));

		for (const node_id of tree.get_node(1).children) {
            const character = tree.get_node(node_id);
            const optgroup = document.createElement("optgroup");
            optgroup.setAttribute("label", character.text);
            
            optgroup.appendChild(new Option("name", `${character.text}.name`));

            for (let i = 0; i < character.data.fields.length; i++) {
            	const field = character.data.fields[i];
            	const option = new Option(field.name, `${character.text}.${field.name}`);
            	optgroup.appendChild(option);
            }

            varSelect.appendChild(optgroup);
        }

        varSelect.value = node.data.variable || "undefined";

        varSelect.onchange = (e) => {
        	node.data.variable = e.target.value;
        	CharacterEditor.refMap.checkRef(node.data.variable, node.id);
        };
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
        Explorer.tree().rename_node(node.id, name);
        node.data.text = name;

        editor.getPanel(node.id).checkRefs();

    	SetterEditor.dialog.dialog("close");
    }
}

class Setter extends Panel {
	constructor(node) {
		super(node, 180, 80);
        this.type = "setter";
	}

    checkRefs() {
    	CharacterEditor.refMap.clearPanel(this.node.id);

        CharacterEditor.refMap.checkRef(this.node.data.variable, this.node.id);
    }

    renameRef(oldName, newName) {
        if(oldName === this.node.data.variable) this.node.data.variable = newName;
    }

    invalidateRef(refID) {
    }

    validateRef(refID) {
    }

	editButton(){
		SetterEditor.openEditing(this.node);
	}

	initLazy() {
		const saveData = this.node.data.path;
		this.path = new Node(this.w + 10, 44, saveData, false);
        this.outs.push(this.path);
        this.addChild(this.path);
	}
}