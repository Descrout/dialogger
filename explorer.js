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

        $("#jsTreeDiv").on('refresh.jstree', () => {
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

    }

    static export() {

    }

    static save() {
        saveJSON(Explorer.tree().get_json('#'), 'save.json');
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


}