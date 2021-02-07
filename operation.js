
class Operation {
	static ops = ["Reference", "Number", "String", "Bool", "+", "-", "*", "/", "%", "max", "min"];

	static reset(fs) {
		const id = `#${fs.id}`;
		$(id).empty();
        $(id).append("<legend>Operation</legend>");
	}

	static construct(fs, data) {
		const type = typeof data;

		if(type === "object") {
			if(data["var"]) {
				const _fs = Operation.createFieldset("Reference");
				_fs.setAttribute("data-type", "select");
				_fs.setAttribute("data-value", data["var"]);

				const select = document.createElement("select");
				CharacterEditor.fillWithVars(select);

				select.onchange = (e) => {
					_fs.setAttribute("data-value", e.target.value);
				};

				select.value = data["var"];

				_fs.appendChild(select);
				fs.appendChild(_fs);
				return;
			}

			if(Array.isArray(data)) {
				for(const d of data) {
					Operation.construct(fs, d);
				}
				return;
			}

			for(const key of Object.keys(data)) {
				const _fs = Operation.createFieldset(key);
				Operation.addOperationAdder(_fs);
				fs.appendChild(_fs);
				Operation.construct(_fs, data[key]);
				return;
			}
		}else if(type === "number") {
			const _fs = Operation.createFieldset("Number");
			Operation.addInput(_fs, "number", data);
			fs.appendChild(_fs);
		}else if(type === "string") {
			const _fs = Operation.createFieldset("String");
			Operation.addInput(_fs, "text", data);
			fs.appendChild(_fs);
		}else if(type === "boolean") {
			const _fs = Operation.createFieldset("Bool");
			Operation.addInput(_fs, "checkbox", data);
			fs.appendChild(_fs);
		}
	}

	static addSelect(fs) {
		const select = document.createElement("select");
		select.add(new Option("Select Operator", "nochange", true));

		for(const op of Operation.ops) {
			select.add(new Option(op, op));
		}

		select.onchange = (e) => {
			select.remove();
			Operation.setInside(fs, e.target.value);
		};

		fs.appendChild(select);
	}

	static addOperationAdder(fs) {
		const button = document.createElement("button");
		button.type = "button";
		button.innerHTML = "Add";
		button.style = "position:relative;left:15px;top:-26px;";
		button.onclick = () => {
			Operation.addSelect(fs);
		};

		fs.appendChild(button);
	}

	static createFieldset(txt) {
		const fs = document.createElement("fieldset");
	
		const legend = document.createElement("legend");
		legend.innerHTML = txt;
		fs.appendChild(legend);

		const closeButton = document.createElement("button");
		closeButton.innerHTML = "X";
		closeButton.style = "position:relative;left:-24px;";
		closeButton.onclick = (e) => {
			if(fs.parentElement.children.length <= 3 && fs.parentElement.nodeName == "FIELDSET"){
				Operation.addSelect(fs.parentElement);
			}
			fs.remove();
		};
		fs.appendChild(closeButton);

		return fs;
	}

	static addInput(fs, type, val) {
		const input = document.createElement("input");
		input.type = type;
		fs.setAttribute("data-type", type);
		fs.setAttribute("data-value", val);

		if(type == "number") input.step = 0.01;

		if(type == "checkbox") {
			input.checked = val;
			input.onchange = (e) => {
				fs.setAttribute("data-value", e.target.checked);
			};
		}else {
			input.value = val;
			input.onchange = (e) => {
				fs.setAttribute("data-value", e.target.value);
			};
		}
		
		fs.appendChild(input);
	}

	static setInside(fs, op) {
		const child = Operation.createFieldset(op);

		switch(op) {
			case "Reference":
				child.setAttribute("data-type", "select");
				
				const select = document.createElement("select");
				CharacterEditor.fillWithVars(select);

				select.onchange = (e) => {
					child.setAttribute("data-value", e.target.value);
				};

				child.appendChild(select);
			break;
			case "Number":
				Operation.addInput(child, "number", 0);
			break;
			case "String":
				Operation.addInput(child, "text", "Hello World");
			break;
			case "Bool":
				Operation.addInput(child, "checkbox", false);
			break;
			default:
				Operation.addOperationAdder(child);
		}

		fs.appendChild(child);
	}

	static getData(fs, refs) {
		const type = fs.getAttribute("data-type");
		const op = fs.firstChild.innerHTML;

		if(type) {
			const val = fs.getAttribute("data-value");
			let data = {};

			if(type === "select") {
				if(val) {
					data["var"] = val;
					refs.set(val, data);
				}else {
					alert("Please pick the reference.");
					return null;
				}
				
			} else if(type === "number") data = Number.parseFloat(val); 
			else if(type === "checkbox") data = (val === "true");
			else data = val;

			return data; // we out
		}

		if(op === "Operation") {
			if(fs.lastChild.nodeName != "FIELDSET") {
				alert("Pleace pick an operation.");
				return null;
			}
			return Operation.getData(fs.lastChild, refs);
		}

		const data = {};

		let fsCount = 0;
		data[op] = [];

		for(const _fs of fs.children) {
			if(_fs.nodeName === "FIELDSET") {
				fsCount++;
				const nextData = Operation.getData(_fs, refs);
				if(nextData != null) data[op].push(nextData);
				else return null;
			}
		}

		if(fsCount < 2) {
			alert("Error: Operations should atleast contain 2 child.")
			return null;
		}

		return data;
	}
}