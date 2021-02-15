class RefMap {
	constructor() {
		this.fields = new Map();
		this.waiting = new Map();

		const tree = Explorer.tree();
		if(tree.get_node(1).children) {
			for (const node_id of tree.get_node(1).children) {
	            const character = tree.get_node(node_id);
	            this.fields.set(`${character.text}.name`, new Set());            
	            for(const field of character.data.fields) {
					const id = `${character.text}.${field.name}`;
					this.fields.set(id, new Set());
				}
	        }
		}
	}

	addRefs(char_name, _fields) {
		const fields = [].concat({name:"name", type: "text"}, _fields);
		for(const field of fields) {
			const id = `${char_name}.${field.name}`;
			const waiting_panels = this.waiting.get(id);
			if(waiting_panels) {
				this.fields.set(id, new Set(waiting_panels));
				for(const panel_id of waiting_panels) {
					const panel = editor.getPanel(panel_id);
					if(panel) panel.validateRef(id);
				}
				this.waiting.delete(id);
			}else {
				this.fields.set(id, new Set());
			}
		}
	}

	removeCharacter(charName) {
		for(const id of this.fields.keys()) {
			let [name, field] = id.split('.');
			if(name == charName) {
				this.removeRef(id);
			}
		}
	}

	renameCharacter(old_char_name, new_char_name) {
		const renameTable = new Map();

		for(const id of this.fields.keys()) {
			let [char_name, field] = id.split('.');
			if(char_name == old_char_name) {
				renameTable.set(id, {temp: this.fields.get(id), newID: `${new_char_name}.${field}`});
			}
		}

		this.renameRefs(renameTable);
	}

	removeRef(id) {
		const temp = this.fields.get(id);
		this.fields.delete(id);
		for(const panel_id of temp) {
			editor.getPanel(panel_id).invalidateRef(id);
			this.addWaiter(id, panel_id);
		}
	}

	renameRefs(renameTable) {
		for(const key of renameTable.keys()) {
			this.fields.delete(key);
		}

		for(const [key, value] of renameTable.entries()) {
			this.fields.set(value.newID, value.temp);
			for(const panel_id of value.temp) {
				const panel = editor.getPanel(panel_id);
				if(panel) panel.renameRef(key, value.newID);
			}
		}
	}


	refresh(character, _fields) {
		const usedFields = [];
		const renameTable = new Map();
		const fields = [].concat({name:"name", type: "text"}, _fields);

		for(const field of fields) {
			const id = `${character}.${field.name}`;
			usedFields.push(id);

			if(field.before && field.before != field.name) {
				const currID = `${character}.${field.before}`;
				renameTable.set(currID, {temp: this.fields.get(currID), newID: id});
				delete field.before;
			}else {
				if(!this.fields.has(id)) {
					const waiting_panels = this.waiting.get(id);
					if(waiting_panels) {
						this.fields.set(id, new Set(waiting_panels));
						for(const panel_id of waiting_panels) {
							const panel = editor.getPanel(panel_id);
							if(panel) panel.validateRef(id);
						}
						this.waiting.delete(id);
					}else {
						this.fields.set(id, new Set());
					}
				}
			}
		}

		if(renameTable.size > 0)
			this.renameRefs(renameTable);

		for(const id of this.fields.keys()) {
			const char = id.split('.')[0];
			if(!usedFields.includes(id) && char === character) {
				this.removeRef(id);
			}
		}
	} 

	addWaiter(refID, panelID) {
		if(!this.waiting.has(refID))
			this.waiting.set(refID, new Set());

		this.waiting.get(refID).add(panelID);
	}

	checkRef(refID, panelID) {
		if(this.fields.has(refID)) {
			this.fields.get(refID).add(panelID);
			return true;
		}
		if(refID && refID != "undefined" && refID.split('.').length == 2) 
			this.addWaiter(refID, panelID);
		
		return false;
	}

	clearPanel(panel_id) {
		for(const panels of this.fields.values()) {
			panels.delete(panel_id);
		}

		for(const panels of this.waiting.values()) {
			panels.delete(panel_id);
		}
	}
}