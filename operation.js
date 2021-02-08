
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
				//Operation.addOperationAdder(_fs);
				Operation.addSelect(_fs);
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
		const isFirst = fs.firstChild.innerHTML === "Operation";
		select.add(new Option("Insert", "nochange", true));

		for(const op of Operation.ops) {
			select.add(new Option(op, op));
		}

		select.onchange = (e) => {
			Operation.setInside(fs, e.target.value);
			
			if(isFirst) e.target.remove();
			else e.target.selectedIndex = 0;
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
		const color = Math.random() * 360;
		fs.style.border = `2px solid hsla(${color}, 90%, 40%, 1)`;
		fs.style.backgroundColor = `hsla(${color}, 60%, 80%, 0.15)`;

		const legend = document.createElement("legend");
		legend.innerHTML = txt;
		fs.appendChild(legend);

		const closeButton = document.createElement("button");
		closeButton.innerHTML = "X";
		closeButton.style = "display: inline;position:relative;left:-24px;";
		closeButton.onclick = (e) => {
			if(fs.parentElement.firstChild.innerHTML === "Operation"){
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
		input.style = "display: inline;";
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
				//Operation.addOperationAdder(child);
				Operation.addSelect(child);
		}

		fs.appendChild(child);
	}

	static getData(fs) {
		const type = fs.getAttribute("data-type");
		const op = fs.firstChild.innerHTML;

		if(type) {
			const val = fs.getAttribute("data-value");
			let data = {};

			if(type === "select") {
				if(val) {
					data["var"] = val;
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
			return Operation.getData(fs.lastChild);
		}

		const data = {};

		let fsCount = 0;
		data[op] = [];

		for(const _fs of fs.children) {
			if(_fs.nodeName === "FIELDSET") {
				fsCount++;
				const nextData = Operation.getData(_fs);
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

	static getRefs(data, _refs) {
        const refs = _refs || new Map();

        if(typeof data === "object") {
        	if(data === null) return refs;
            if(data["var"]) {
            	refs.set(data["var"], data);
            }

            if(Array.isArray(data)) {
                for(const d of data) {
                    Operation.getRefs(d, refs);
                }
            }

            for(const val of Object.values(data)) {
                Operation.getRefs(val, refs);
            }
        }

        return refs;
    }

    static getText(data, op) {
    	const type = typeof data;

        if(type === "object") {
        	if(data === null) return "undefined";
            if(data["var"]) return "${" + data["var"] + "}";

            if(Array.isArray(data)) {
                let txt = "(";
                for(const d of data) {
                    txt += Operation.getText(d, op) + ` ${op} `;
                }
                txt = txt.substr(0, txt.length - (op.length + 2));
                return txt + ")";
            }

            let txt = "";
            for(const key of Object.keys(data)) {
                txt += Operation.getText(data[key], key);
            }
            return txt;

        }else if(type === "string") return `"${data}"`;
        else return data; // number and boolean
    }
}