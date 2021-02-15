class Setter extends Panel {
	constructor(node) {
		super(node, 260, 80);
        this.type = "setter";
	}

    setOperation(field) {
        const operation = Operation.getData(field);
        if(operation != null) {
            this.node.data.operation = operation;
            this.refs = Operation.getRefs(operation); 
            this.text = Operation.getText(operation); 
            return true;
        }
        return false;
    }

    checkRefs() {
    	CharacterEditor.refMap.clearPanel(this.node.id);

        CharacterEditor.refMap.checkRef(this.node.data.variable, this.node.id);
        
        for(const ref of this.refs.keys()) {
            CharacterEditor.refMap.checkRef(ref, this.node.id);
        }
    }

    renameRef(oldName, newName) {
        if(oldName === this.node.data.variable) this.node.data.variable = newName;
        const temps = this.refs.get(oldName);
        if(temps) {
            for(const temp of temps) {
                temp.var = newName;
            }

            this.refs.delete(oldName);
            this.refs.set(newName, temps);
            this.text = this.text.replaceAll("${"+oldName+"}", "${"+newName+"}");
        }
    }
    
	editButton(){
		SetterEditor.openEditing(this.node);
	}

	initLazy() {
        this.text = Operation.getText(this.node.data.operation); 
        this.refs = Operation.getRefs(this.node.data.operation);

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

        const result = `${this.node.data.variable} = ${this.text}`;
        this.h = floor(textWidth(result) / this.w) * 12 + 80;
        text(result, this.x + 5, this.y + 55, this.w - 10, this.h - 40);
	}
}