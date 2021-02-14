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

class Condition extends OptionPanel {
	constructor(node) {
		super(node, 260, 85);
        this.type = "condition";

        this.addElseIf = new Button("Add Else If", 0, this.h, () => {
            this.addOption();
        }, this.w, 40);
        this.addElseIf.toffX = 138;
        this.addChild(this.addElseIf);
	}

	optionClicked(option) {
		Operation.showAlerts = true;
        GlobalEditor.openEditing(option);
    }

	setOperation(field) {
        const operation = Operation.getData(field);
        if(operation != null) {
            this.node.data.if_operation = operation;
            this.refs = Operation.getRefs(operation); 
            this.if_text = Operation.getText(operation); 
            return true;
        }
        return false;
    }

	checkRefs() {
    	CharacterEditor.refMap.clearPanel(this.node.id);
        
        for(const ref of this.refs.keys()) {
            CharacterEditor.refMap.checkRef(ref, this.node.id);
        }

        for(const option of this.options) {
            for(const ref of option.refs.keys()) {
	            CharacterEditor.refMap.checkRef(ref, this.node.id);
	        }
        }
    }

    renameRef(oldName, newName) {
        const temps = this.refs.get(oldName);
        if(temps) {
            for(const temp of temps) {
                temp.var = newName;
            }

            this.refs.delete(oldName);
            this.refs.set(newName, temps);
            this.if_text = this.if_text.replaceAll("${"+oldName+"}", "${"+newName+"}");
        }

        for(const option of this.options) {
        	const temps = option.refs.get(oldName);
	        if(temps) {
	            for(const temp of temps) {
                	temp.var = newName;
            	}
            	
	            option.refs.delete(oldName);
	            option.refs.set(newName, temps);
	            option.setText(option.data.text.replaceAll("${"+oldName+"}", "${"+newName+"}"));
	        }
        }
    }

	editButton(){
		ConditionEditor.openEditing(this.node);
	}

	initLazy() {
		for(const opt of this.node.data.options) {
            const option = this.addOption(opt);
            option.setText(Operation.getText(opt.operation));
        }

        this.if_text = Operation.getText(this.node.data.if_operation); 
        this.refs = Operation.getRefs(this.node.data.if_operation);

		const if_path = this.node.data.if_path;
		const else_path = this.node.data.else_path;

		this.if_path = new Node(this.w + 10, 44, if_path, false);
        this.outs.push(this.if_path);
        this.addChild(this.if_path);

        this.else_path = new Node(this.w + 10, 84, else_path, false);
        this.outs.push(this.else_path);
        this.addChild(this.else_path);
	}

	draw() {
		super.draw();
		textSize(12);
		noStroke();
		fill(0);
		const result = `IF : ${this.if_text}`;
		text(result, this.x + 5, this.y + 55, this.w - 10, 80);

		stroke(140);
        fill(230);
        rect(this.x, this.y + this.bottom, this.w, 40);

        noStroke();
        fill(0);
        text("ELSE", this.x + 154, this.y + this.bottom + 26);
        this.else_path.relativeY = this.bottom + 4;
	}
}