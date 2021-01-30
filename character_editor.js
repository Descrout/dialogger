class CharacterEditor {
    static fields = null;
    static editedNode = null;

    static dialog = $("#character-edit").dialog({
        autoOpen: false,
        height: 480,
        width: 450,
        modal: true,
        buttons: {
            "Save": CharacterEditor.finishEditing,
            Cancel: () => {
                CharacterEditor.dialog.dialog("close");
            }
        },
        close: function () {
            $("#addNumber").off('click');
            $("#addString").off('click');
            $("#addBoolean").off('click');
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

        if (node) {
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
        $("#addNumber").off('click');
        $("#addNumber").click(() => {
            CharacterEditor.addField("number");
        });

        $("#addString").off('click');
        $("#addString").click(() => {
            CharacterEditor.addField("string");
        });

        $("#addBoolean").off('click');
        $("#addBoolean").click(() => {
            CharacterEditor.addField("boolean");
        });

        $("#fieldHolder").empty();
        $("#fieldHolder").append("<legend>Fields</legend>");
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
            nameField.style.width = "40%";
            nameField.style.display = "inline-block";
            nameField.style.marginLeft = "5px";
            nameField.value = field.name;
            nameField.onchange = (e) => {
                field.name = e.target.value;
            };

            const valueField = document.createElement("input");
            valueField.setAttribute("type", field.type);
            valueField.style.width = "48%";
            valueField.style.display = "inline-block";
            valueField.style.marginLeft = "5px";
            valueField.value = field.value;

            if(field.type == "checkbox") {
                valueField.style.width = "44%";
                valueField.checked = field.value;
                valueField.onchange = (e) => {
                    field.value = e.target.checked;
                    e.target.value = e.target.checked;
                };
            }else {
                if(field.type == "number") {
                    valueField.step = 0.01;    
                }

                valueField.onchange = (e) => {
                    field.value = e.target.value;
                };
            }

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

    static addField(type) {
        switch(type){
            case "number":
            CharacterEditor.fields.push({
                name: "New Number",
                value: 0,
                type: "number"
            });
            break;
            case "string":
            CharacterEditor.fields.push({
                name: "New String",
                value: "Hello world.",
                type: "text"
            });
            break;
            case "boolean":
            CharacterEditor.fields.push({
                name: "New Boolean",
                value: true,
                type: "checkbox"
            });
            break;
            default:
        }
        
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