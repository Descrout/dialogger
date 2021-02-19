class Explorer {
    static resizerPos = 200;

    static init() {
        document.addEventListener('contextmenu', event => event.preventDefault());

        const resizer = document.getElementById("resizer");
        resizer.ondrag = (e) => {
            if (e.clientX < 100 || e.clientX > 400) return;
            Explorer.resizerPos = e.clientX;
            windowResized();
        };

        const tree = $('#jsTreeDiv').jstree({
            'core': {
                "check_callback": true,
                'data': {
                    "url": "root.json",
                    "dataType": "json"
                }
            },
            "plugins": ["contextmenu"],
            "contextmenu": {
                "items": (node) => {
                    if (node.a_attr.type == "folder") 
                        return Explorer.getFolderCtx(node);

                    return Explorer.getFileCtx(node);
                }
            }
        });

        tree.bind("dblclick.jstree", (event) => {
            const node_li = $(event.target).closest("li");
            const node = Explorer.tree().get_node(node_li);
            if (node.parent == 1)
                CharacterEditor.openEditing(node);
            else if (node.a_attr.type == "file")
                editor.getPanel(node.id).focus();
        });

        tree.bind("loaded.jstree", () => {
            Explorer.populateStarting(document.getElementById("startingPanel"));
            Explorer.loadFromLocal();
        });

        tree.bind("create_node.jstree", () => {
            Explorer.populateStarting(document.getElementById("startingPanel"));
        });

        tree.bind("rename_node.jstree", () => {
            Explorer.populateStarting(document.getElementById("startingPanel"));
            Explorer.saveToLocal();
        });

        tree.bind("delete_node.jstree", () => {
            Explorer.populateStarting(document.getElementById("startingPanel"));
        });

        tree.bind('refresh.jstree', () => {
            CharacterEditor.refMap = new RefMap();
            const tree = Explorer.tree();

            ////Dialogs
            for (let node_id of tree.get_node(2).children) {
                const dia_node = tree.get_node(node_id);
                const dia = new Dialog(dia_node);
                editor.panels.set(node_id, dia);
            }

            ////Setters
            for (let node_id of tree.get_node(3).children) {
                const setter_node = tree.get_node(node_id);
                const setter = new Setter(setter_node);
                editor.panels.set(node_id, setter);
            }

            ////Conditions
            for (let node_id of tree.get_node(4).children) {
                const condition_node = tree.get_node(node_id);
                const condition = new Condition(condition_node);
                editor.panels.set(node_id, condition);
            }

            /////all panel nodes
            for (const panel of editor.panels.values()) {
                panel.initLazy();
                panel.checkRefs();
                panel.sync();
            }

            const node = tree.get_node("1");
            if(node.data && node.data.camera) {
                camera.set(node.data.camera.rawX, node.data.camera.rawY, node.data.camera.scale);
            } else camera.reset();

            Explorer.populateStarting(document.getElementById("startingPanel"));
            Explorer.saveToLocal();
        });
    }

    static saveToLocal() {
        localStorage.removeItem("current");
        localStorage.setItem("current", JSON.stringify(Explorer.tree().get_json('#')));
    }

    static loadFromLocal() {
          const current = localStorage.getItem("current");
          if(current) {
              const data = JSON.parse(current);
              if(data) Explorer.newProject(data);
          }
    }

    static newProject(data) {
        const tree = Explorer.tree();
        editor.panels.clear();
        tree.settings.core.data = data || {"url": "root.json", "dataType": "json"};
        tree.refresh();
    }

    static play() {
    	const exp = Explorer.export();
    	if(!exp) return;

        localStorage.removeItem("export");
        localStorage.setItem("export", JSON.stringify(exp));
        window.open("/play.html");
    }

    static export() {
        const tree = Explorer.tree();
        const result = {};
        const node = tree.get_node("1");
        if(!node.data.starting) {
            alert("Pick starting panel!");
            return;
        }
        const sPanel = editor.getPanel(node.data.starting);
        if(!sPanel) {
            alert("Pick starting panel!");
            return;
        }

        const pathFromPanel = (panel) => {
            return {id: panel.node.id, type: panel.type};
        };

        const pathWithoutPoints = (p) => {
            return {id: p.id, type: p.type};
        }; 

        result.starting = pathFromPanel(sPanel);
        result.characters = {};

        for (const node_id of tree.get_node(1).children) {
            const character = tree.get_node(node_id);
            
            result.characters[character.text] = {name: character.text};

            for (const field of character.data.fields) {
                result.characters[character.text][field.name] = field.value;
            }
        }

        result.dialog = {};

        for (const node_id of tree.get_node(2).children) {
            const dialog = tree.get_node(node_id);
            result.dialog[node_id] = {character: tree.get_node(dialog.data.character).text};
            result.dialog[node_id].time_limit = parseFloat(dialog.data.time_limit);
            result.dialog[node_id].text = dialog.data.text;

            if(dialog.data.time_path && Object.keys(dialog.data.time_path).length != 0) {
               result.dialog[node_id].time_path = pathWithoutPoints(dialog.data.time_path);
            } else result.dialog[node_id].time_path = null;

            const options = [];

            for(const option of dialog.data.options) {
                options.push({
                    text: option.text, 
                    operation: option.operation, 
                    path: pathWithoutPoints(option.path)
                });
            }

            result.dialog[node_id].options = options;
        }

        result.setter = {};
        for (const node_id of tree.get_node(3).children) {
            const setter = tree.get_node(node_id);
            result.setter[node_id] = {};
            result.setter[node_id].variable = setter.data.variable;
            result.setter[node_id].operation = setter.data.operation;
            result.setter[node_id].path = pathWithoutPoints(setter.data.path);
        }

        result.condition = {};
        for (const node_id of tree.get_node(4).children) {
            const condition = tree.get_node(node_id);
            result.condition[node_id] = {};
            const paths = [];
            result.condition[node_id].operation = {"if": []};

            paths.push(pathWithoutPoints(condition.data.if_path));
            result.condition[node_id].operation.if.push(condition.data.if_operation);
            result.condition[node_id].operation.if.push(0);

            let counter = 0;

            for(const option of condition.data.options) {
                counter++;
                paths.push(pathWithoutPoints(option.path));
                result.condition[node_id].operation.if.push(option.operation);
                result.condition[node_id].operation.if.push(counter);
            }

            paths.push(pathWithoutPoints(condition.data.else_path));
            result.condition[node_id].operation.if.push(counter + 1);

            result.condition[node_id].paths = paths;
        }

        return result;
    }

    static loadExample() {
    	Explorer.newProject({"url": "example.json", "dataType": "json"});
    	camera.set(0, 0, 1.0);
    }

    static saveExport() {
    	const exp = Explorer.export();
    	if(!exp) return;
    	saveJSON(exp, 'export.json');
    }

    static save() {
        saveJSON(Explorer.tree().get_json('#'), 'project.json');
    }

    static load() {
        document.getElementById("saveOpener").addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            let reader = new FileReader();
            reader.onload = () => {
                if (!reader.result) {
                    alert("Cannot open!");
                    return;
                }

                const parsed = JSON.parse(reader.result);
                Explorer.newProject(parsed);
            };
            reader.readAsText(file);
        });
        $("#saveOpener").trigger("click");
    }

    static tree() {
        return $("#jsTreeDiv").jstree(true);
    }

    static getFolderCtx(node) {
        return {
            "Create": {
                "seperator_before": false,
                "seperator_after": false,
                "label": "Create",
                "action": (obj) => {
                    if (node.id == "1") {
                        CharacterEditor.openEditing();
                    } else if (node.id == "2") {
                        editor.addDialog();
                    } else if (node.id == "3") {
                        editor.addSetter();
                    } else if (node.id == "4") {
                        editor.addCondition();
                    }
                }
            }
        };
    }

    static getFileCtx(node) {
        const tree = Explorer.tree();

        return {
            "Rename": {
                "separator_before": false,
                "separator_after": false,
                "label": "Rename",
                "action": function (obj) {
                    if (node.parent == "1") {
                        const oldName = node.text;
                        tree.edit(node, null, (n, success, cancel) => {
                            if (success && !cancel) {
                                if(CharacterEditor.checkCharName(tree, n.text, n)) 
                                    CharacterEditor.refMap.renameCharacter(oldName, n.text);  
                                 else 
                                    tree.rename_node(n, oldName);
                            }
                        });
                    } else tree.edit(node);
                }
            },
            "Remove": {
                "separator_before": false,
                "separator_after": false,
                "label": "Remove",
                "action": function (obj) {
                    if (node.parent == "1"){
                        CharacterEditor.refMap.removeCharacter(node.text);
                        tree.delete_node(node);
                    }else editor.removePanelViaNode(node);
                }
            }
        };
    }

    static populateStarting(select) {
        const tree = Explorer.tree();
        
        $("#startingPanel").empty();
        select.add(new Option("Starting Panel", "undefined"));

        const appendCategory = (label, num) => {
            const optgroup = document.createElement("optgroup");
            optgroup.setAttribute("label", label);
            for (const node_id of tree.get_node(num).children) {
                const node = tree.get_node(node_id);
                optgroup.appendChild(new Option(node.text, node.id));
            }
            select.appendChild(optgroup);
        };

        appendCategory("Dialogs", 2);
        appendCategory("Setters", 3);
        appendCategory("Conditions", 4);

        const node = Explorer.tree().get_node("1");
        if(node && node.data) {
            select.value = node.data.starting;
            if(!select.value) {
                select.value = "undefined";
                node.data.starting = "undefined";
            }
        }
        
        select.onchange = (e) => {
            if(node) {
                node.data.starting = e.target.value;
                Explorer.changeHappened();
            }
        };
    }

    static changeHappened() {
        camera.save();
        Explorer.saveToLocal();
    }
}