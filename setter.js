class Setter extends Panel {
	constructor(node) {
		super(node, 180, 80);
        this.type = "setter";
	}

	editButton(){
		alert("setter edit");
	}

	initLazy() {
		const saveData = this.node.data.path;
		this.path = new Node(this.w + 10, 44, saveData, false);
        this.outs.push(this.path);
        this.addChild(this.path);
	}
}