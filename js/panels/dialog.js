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

    changeText(text) {
        textSize(12);
        this.node.data.text = text;
        const height = (ceil(textWidth(text) / (this.w - 10) )) * 14;
        this.h = min(350, height + 120);
        this.addOptionButton.relativeY = this.h;
        this.bottom = this.h + 40 + this.options.length * 40;
        this.refreshOptionPositions();
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

        this.changeText(this.node.data.text);

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
        text(this.node.data.text, this.x + 5, this.y + 95, this.w - 10, this.h - 80);
    }
}