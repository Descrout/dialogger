class DialogState {
	constructor(data) {
		this.starting = data.starting;
		this.characters = data.characters;
		this.panels = DialogState.construct_panels(data);
		this.char_map = DialogState.construct_char_map(data.characters);
	}

	static construct_panels(data) {
		const panels = {};

		for(const [id, value] of Object.entries(data.dialog)) {
			panels[id] = value;
		}

		for(const [id, value] of Object.entries(data.setter)) {
			panels[id] = value;
		}

		for(const [id, value] of Object.entries(data.condition)) {
			panels[id] = value;
		}

		return panels;
	}

	static construct_char_map(characters) {
		const char_map = {};

		for(const [char_name, fields] of Object.entries(characters)) {
			for(const field_name of Object.keys(fields)) {
				const key = "${" + char_name + "." + field_name + "}";
				char_map[key] = [char_name, field_name];
			}
		}

		return char_map;
	}

	kickstart() {
		return this.evaluate(this.starting);
	}

	render_dialog(id) {
		const dialog = JSON.parse(JSON.stringify(this.panels[id]));

		dialog.options = dialog.options.filter((option) => {
			if(option.operation && !jsonLogic.apply(option.operation, this.characters)) return false;
			return true;
		});

		// Check for option logic
		for(let i = 0; i < dialog.options.length; i++) {
			const option = dialog.options[i];
			if(option.operation) {
				if(jsonLogic.apply(option.operation, this.characters) == false) dialog.options.splice(i, 1); 
			}
		}

		// Replace all variable templates (${name.field} things)
		for(const [key, [char_name, field_name]] of Object.entries(this.char_map)) {
			dialog.text = dialog.text.replaceAll(key, this.characters[char_name][field_name]);
			for(const option of dialog.options) {
				option.text = option.text.replaceAll(key, this.characters[char_name][field_name]);
			}
		}

		if(dialog.time_limit) dialog.full_time = dialog.time_limit;

		return dialog;
	}

	evaluate(path) {
		switch(path.type) {
			case "setter":
				const setter = this.panels[path.id];
				const [name, field] = setter.variable.split('.');
				this.characters[name][field] = jsonLogic.apply(setter.operation, this.characters);
				return this.evaluate(setter.path);
			case "condition":
				const condition = this.panels[path.id];
				const idx = jsonLogic.apply(condition.operation, this.characters);
				return this.evaluate(condition.paths[idx]);
			case "dialog":
				return this.render_dialog(path.id);
			default:
				alert("Unkown path type !");
				return null;
		}
	}
}