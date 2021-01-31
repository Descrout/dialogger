class Condition extends Panel {
	constructor(node) {
		super(node, 260, 200);
        this.type = "condition";
	}

	editButton(){
		alert("condition edit");
	}
}