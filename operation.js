
class Operation {
	static logic_ops = ["and", "or", "==", "!=", ">", "<", ">=", "<=", "===", "!=="];
	static value_ops = ["Reference", "Number", "String", "Bool", "+", "-", "*", "/", "%", "max", "min"];

	static showAlerts = true;

	static isLogic(op) {
		return Operation.logic_ops.includes(op);
	}

	static canOnlyTwo(op) {
		return Operation.isLogic(op) && Operation.logic_ops.indexOf(op) > 1;
	}

	static isRoot(op) {
		return op === "Logic" || op === "Value";
	}

	static reset(fs, legend) {
		const id = `#${fs.id}`;
		$(id).empty();
        $(id).append(`<legend>${legend}</legend>`);
	}

	static construct(fs, data) {
		const type = typeof data;

		if(type === "object") {
			if(data["var"]) { // For Character Field References
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

			if(Array.isArray(data)) { // For Arrays
				for(const d of data) {
					Operation.construct(fs, d);
				}
				return;
			}

			for(const key of Object.keys(data)) { // For Object (Should contain just one key)
				const _fs = Operation.createFieldset(key);
				if(Operation.canOnlyTwo(key)){
					const otherChild1 = Operation.createFieldset("Value");
					Operation.construct(otherChild1, data[key][0]);
					const otherChild2 = Operation.createFieldset("Value");
					Operation.construct(otherChild2, data[key][1]);
					_fs.appendChild(otherChild1);
					_fs.appendChild(otherChild2);
				}else {
					Operation.addSelect(_fs);
					Operation.construct(_fs, data[key]);
				}
				fs.appendChild(_fs);
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
		const legend = fs.firstChild.innerHTML.replace("&gt;", ">").replace("&lt;", "<");
		const isRoot =  Operation.isRoot(legend);
		const arr = (Operation.isLogic(legend) ||  legend === "Logic")
		? Operation.logic_ops : Operation.value_ops;

		const select = document.createElement("select");
		select.add(new Option("Insert", "nochange", true));
		for(const op of arr) select.add(new Option(op, op));

		select.onchange = (e) => {
			Operation.setInside(fs, e.target.value);
			
			if(isRoot) e.target.remove();
			else e.target.selectedIndex = 0;
		};

		fs.appendChild(select);
	}

	static createFieldset(txt) {
		const fs = document.createElement("fieldset");
		const color = Math.random() * 360;
		fs.style.border = `2px solid hsla(${color}, 90%, 40%, 1)`;
		fs.style.backgroundColor = `hsla(${color}, 60%, 80%, 0.15)`;

		const legend = document.createElement("legend");
		legend.innerHTML = txt;
		fs.appendChild(legend);

		if(Operation.isRoot(txt)) return fs;

		const closeButton = document.createElement("button");
		closeButton.innerHTML = "X";
		closeButton.style = "display: inline;position:relative;left:-24px;";
		closeButton.onclick = (e) => {
			if(Operation.isRoot(fs.parentElement.firstChild.innerHTML))
				Operation.addSelect(fs.parentElement);
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
				if(Operation.canOnlyTwo(op)) {
					const otherChild1 = Operation.createFieldset("Value");
					Operation.addSelect(otherChild1);

					const otherChild2 = Operation.createFieldset("Value");
					Operation.addSelect(otherChild2);

					child.appendChild(otherChild1);
					child.appendChild(otherChild2);
				}else Operation.addSelect(child);
		}

		fs.appendChild(child);
	}

	static getData(fs) {
		const type = fs.getAttribute("data-type");
		const op = fs.firstChild.innerHTML.replace("&gt;", ">").replace("&lt;", "<");

		if(type) {
			const val = fs.getAttribute("data-value");
			let data = {};

			if(type === "select") {
				if(val) {
					data["var"] = val;
				}else {
					if(Operation.showAlerts) alert("Please pick the reference.");
					return null;
				}
				
			} else if(type === "number") data = Number.parseFloat(val); 
			else if(type === "checkbox") data = (val === "true");
			else data = val;

			return data; // we out
		}

		if(Operation.isRoot(op)) {
			if(fs.lastChild.nodeName != "FIELDSET") {
				if(Operation.showAlerts) alert("Pleace pick an operation.");
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
			if(Operation.showAlerts) alert("Error: Operations should atleast contain 2 child.")
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