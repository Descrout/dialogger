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
        Operation.reset(operation_fs);

        if(node.data.operation) Operation.construct(operation_fs, node.data.operation);
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
        Explorer.tree().rename_node(node.id, name);
        node.data.text = name;

        const panel = editor.getPanel(node.id);

        panel.setOperation(document.getElementById("operation_fs"));
        $("#operation_fs").empty();

        panel.checkRefs();

    	SetterEditor.dialog.dialog("close");
    }
}

class Setter extends Panel {
	constructor(node) {
		super(node, 180, 80);
        this.type = "setter";
        this.text = "undefined";
	}

    static getText(data, op) {
        const type = typeof data;

        if(type === "object") {
            if(data["var"]) {
                return "${" + data["var"] + "}";
            }

            if(Array.isArray(data)) {
                let txt = "(";
                for(const d of data) {
                    txt += Setter.getText(d, op) + ` ${op} `;
                }
                txt = txt.substr(0, txt.length - (op.length + 2));
                return txt + ")";
            }

            let txt = "";
            for(const key of Object.keys(data)) {
                txt += Setter.getText(data[key], key);
            }
            return txt;
        }else if(type === "number") {
            return data;
        }else if(type === "string") {
            return `"${data}"`;
        }else if(type === "boolean") {
            return data;
        }
    }

    setOperation(field) {
        this.node.data.operation = Operation.getData(field);
        this.text = Setter.getText(this.node.data.operation) || "undefined";
    }

    checkRefs() {
    	CharacterEditor.refMap.clearPanel(this.node.id);

        CharacterEditor.refMap.checkRef(this.node.data.variable, this.node.id);
        // TODO : check operation refs
    }

    renameRef(oldName, newName) {
        if(oldName === this.node.data.variable) this.node.data.variable = newName;
        // TODO : rename operation refs
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

	draw() {
		super.draw();
		textSize(12);
        noStroke();
        fill(0);

        const result = `${this.node.data.variable || "undefined"} = ${this.text}`;
        text(result, this.x + 5, this.y + 55, this.w - 10, 40);
	}
}