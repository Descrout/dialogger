class CharacterEditor {
    static fields = null;
    static editedNode = null;

    static dialog = $("#character-creation").dialog({
        autoOpen: false,
        height: 450,
        width: 350,
        modal: true,
        buttons: {
            "Save": CharacterEditor.finishEditing,
            Cancel: () => {
                CharacterEditor.dialog.dialog("close");
            }
        },
        close: function () {
            $("#addField").off('click');
            CharacterEditor.form[0].reset();
            editor.pause = false;
        }
    });

    static form = this.dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        CharacterEditor.finishEditing();
    });

    static openEditing(node) {
        let title = "Create a Character";
        CharacterEditor.editedNode = node;

        if (node && node.data.fields) {
            CharacterEditor.fields = JSON.parse(JSON.stringify(node.data.fields));
        } else {
            CharacterEditor.fields = [];
        }

        CharacterEditor.refreshFields();

        if(node) {
            $("#name").val(node.text);
            title = "Edit the Character";
        }

        CharacterEditor.dialog.dialog("option", "title", title);
        CharacterEditor.dialog.dialog("open");
        editor.pause = true;
    }

    static finishEditing() {
        const tree = Explorer.tree();
        const name = $("#name").val();
        let node = CharacterEditor.editedNode;

        if (!CharacterEditor.checkCharName(tree, name, node)) return;
        if (!CharacterEditor.checkFields()) return;

        if (node) {
            node.data.fields = JSON.parse(JSON.stringify(CharacterEditor.fields));
            tree.rename_node(node, name);
            CharacterEditor.editedNode = null;
        } else {
            node = tree.create_node(1, {
                text: name,
                icon: 'jstree-file',
                a_attr: {
                    type: 'file',
                    draggable: false
                },
                data: {
                    fields: JSON.parse(JSON.stringify(CharacterEditor.fields))
                }
            });
        }

        tree.deselect_all();
        tree.select_node(node);

        CharacterEditor.dialog.dialog("close");
    }

    static refreshFields() {
        $("#addField").off('click');
        $("#addField").click(() => {
            CharacterEditor.addField();
        });

        $("#fieldHolder").empty();
        for (let field of CharacterEditor.fields) {
            const div = document.createElement("div");
            div.style.width = "100%";
            div.style.border = "1px solid";
            div.style.padding = "2px";
            div.style.marginTop = "5px";
            div.style.marginBottom = "5px";
            //div.style.float = "left";

            const nameField = document.createElement("input");
            nameField.setAttribute("type", "text");
            nameField.style.width = "55%";
            nameField.style.display = "inline-block";
            nameField.style.marginLeft = "5px";
            nameField.value = field.name;
            nameField.onchange = (e) => {
                field.name = e.target.value;
            };

            const valueField = document.createElement("input");
            valueField.setAttribute("type", "number");
            valueField.style.width = "30%";
            valueField.style.display = "inline-block";
            valueField.style.marginLeft = "5px";
            valueField.value = field.value;
            valueField.onchange = (e) => {
                field.value = e.target.value;
            };

            const removeButton = document.createElement("button");
            removeButton.setAttribute("type", "button");
            removeButton.innerHTML = "X";
            removeButton.onclick = () => {
                CharacterEditor.fields = CharacterEditor.fields.filter((ele) => {
                    return ele != field;
                });
                CharacterEditor.refreshFields();
            };

            div.appendChild(removeButton);
            div.appendChild(nameField);
            div.appendChild(valueField);

            $("#fieldHolder").append(div);
        }
    }

    static addField() {
        CharacterEditor.fields.push({
            name: "New Field",
            value: 0
        });
        CharacterEditor.refreshFields();
    }

    static checkCharName(tree, name, node) {
        if (name.length < 3) {
            alert("Pick a longer name!");
            return false;
        }

        for (let node_id of tree.get_node(1).children) {
            const character = tree.get_node(node_id);

            if (character.text == name && character != node) {
                alert("Pick a different name!");
                return false;
            }
        }

        return true;
    }

    static checkFields() {
        for (let field1 of CharacterEditor.fields) {
            for (let field2 of CharacterEditor.fields) {
                if (field1 != field2 && field1.name === field2.name) {
                    alert("Character fields should be unique!");
                    return false;
                }
            }
        }
        return true;
    }
}

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

                    switch (node.parent) {
                        case "#":
                            if (node.id == 1) {
                                return Explorer.getCharacterFolderContext(node);
                            } else if (node.id == 2) {
                                return Explorer.getDialogFolderContext(node);
                            }
                            case "1":
                                return Explorer.getCharacterContext(node);
                            case "2":
                                return Explorer.getDialogContext(node);
                    }
                }
            }
        });

        tree.bind("dblclick.jstree", (event) => {
            const node_li = $(event.target).closest("li");
            const node = Explorer.tree().get_node(node_li);
            if (node.parent == 1)
                CharacterEditor.openEditing(node);
            else if (node.parent == 2)
                Explorer.dialogDClick(node);

        });
    }

    static tree() {
        return $("#jsTreeDiv").jstree(true);
    }

    static dialogDClick(node) {
        camera.rawX = node.data.x - width / 2 + 100;
        camera.rawY = node.data.y - height / 2 + 100;
        camera.scale = 1.0;
        camera.rawToPos();
        editor.downPanel.slider.value(camera.scale);
    }

    static getDialogFolderContext(node) {
        return {
            "Create": {
                "seperator_before": false,
                "seperator_after": false,
                "label": "Create",
                "action": (obj) => {
                    editor.newDialog();
                }
            }
        };
    }

    static getCharacterFolderContext(node) {
        return {
            "Create": {
                "seperator_before": false,
                "seperator_after": false,
                "label": "Create",
                "action": (obj) => {
                    CharacterEditor.openEditing();
                }
            }
        };
    }

    static getDialogContext(node) {
        const tree = Explorer.tree();

        return {
            "Rename": {
                "separator_before": false,
                "separator_after": false,
                "label": "Rename",
                "action": function (obj) {
                    tree.edit(node);
                }
            },
            "Remove": {
                "separator_before": false,
                "separator_after": false,
                "label": "Remove",
                "action": function (obj) {
                    editor.removeDialogNode(node);
                }
            }
        };
    }

    static getCharacterContext(node) {
        const tree = Explorer.tree();
        return {
            "Rename": {
                "separator_before": false,
                "separator_after": false,
                "label": "Rename",
                "action": function (obj) {
                    const oldName = node.text;
                    tree.edit(node, null, (n, succ, canc) => {
                        if (succ && !canc && !CharacterEditor.checkCharName(tree, n.text, n)) {
                            tree.rename_node(n, oldName);
                        }
                    });
                }
            },
            "Remove": {
                "separator_before": false,
                "separator_after": false,
                "label": "Remove",
                "action": function (obj) {
                    tree.delete_node(node);
                }
            }
        };
    }
}