const operators = ["==", "!=", ">", "<", ">=", "<=", "and", "or"];

const elif_container = document.getElementById("else_if_container");

logicSelect(document.getElementById("first_if"));

function createFieldset(txt){
	const fs = document.createElement("fieldset");
	
	const legend = document.createElement("legend");
	legend.innerHTML = txt;
	fs.appendChild(legend);

	const closeButton = document.createElement("button");
	closeButton.innerHTML = "X";
	closeButton.style = "position:relative;left:-24px;";
	closeButton.onclick = (e) => {
		if(fs.parentElement.children.length <= 5 && fs.parentElement.nodeName == "FIELDSET"){
			logicSelect(fs.parentElement);
		}
		fs.remove();
	};
	fs.appendChild(closeButton);

	const moveUpButton = document.createElement("button");
	moveUpButton.innerHTML = "↑";
	moveUpButton.style = "position:relative;left:26px;top:-26px;";
	moveUpButton.onclick = () => {moveUp(fs)};
	fs.appendChild(moveUpButton);

	const moveDownButton = document.createElement("button");
	moveDownButton.innerHTML = "↓";
	moveDownButton.style = "position:relative;left:35px;top:-26px;";
	moveDownButton.onclick = () => {moveDown(fs)};
	fs.appendChild(moveDownButton);

	return fs;
}

function addElseIf(){
	const elif = createFieldset("Else If");

	logicSelect(elif);

	elif_container.appendChild(elif);
}

function logicSelect(elif) {
	const select = document.createElement("select");
	
	const sel_op = new Option("Select Operator", "nochange", true);
	select.add(sel_op);
	
	for(const op of operators) {
		select.add(new Option(op, op));
	}

	select.onchange = (e) => {
		select.remove();
		setInside(elif, select.options[select.selectedIndex].value);
	};

	elif.appendChild(select);
}

function addLogicButton(logic_fs) {
	const button = document.createElement("button");
	button.innerHTML = "Add Logic";
	button.style = "position:relative;left:45px;top:-26px;";
	button.onclick = () => {
		logicSelect(logic_fs);
	};

	logic_fs.appendChild(button);
}

function setInside(elif, op) {
	const logic_fs = createFieldset(op);

	if(op == "and" || op == "or") {
		addLogicButton(logic_fs);
	}

	elif.appendChild(logic_fs);
}

function moveUp(fs) {
	if(fs.previousSibling && fs.previousSibling.nodeName == "FIELDSET") {
		fs.parentNode.insertBefore(fs, fs.previousSibling);
	}
}

function moveDown(fs) {
	if(fs.nextSibling && fs.nextSibling.nodeName == "FIELDSET") {
		fs.parentNode.insertBefore(fs.nextSibling, fs);
	}
}