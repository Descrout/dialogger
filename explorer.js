class Explorer {
    static tempFields = null;
    static editedNode = null;
    static resizerPos = 200;

    static dialog = $("#character-creation").dialog({
        autoOpen: false,
        height: 450,
        width: 350,
        modal: true,
        buttons: {
            "Save": Explorer.manageCharacter,
            Cancel: () => {
                Explorer.dialog.dialog("close");
            }
        },
        close: function () {
            $("#addField").off('click');
            Explorer.form[0].reset();
            editor.pause = false;
        }
    });

    static form = this.dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        Explorer.manageCharacter();
    });

    static init() {
        document.addEventListener('contextmenu', event => event.preventDefault());


        const resizer = document.getElementById("resizer");
        resizer.ondrag = (e) => {
            if(e.clientX < 100 || e.clientX > 400) return;
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
                        return Explorer.getFolderContext(node);
                    else
                        return Explorer.getFileContext(node);
                }
            }
        });
        
        tree.bind("dblclick.jstree",  (event) => {
            const node_li = $(event.target).closest("li");
            const node = Explorer.tree().get_node(node_li);
            if (node.parent == 1) 
                Explorer.characterDClick(node);
            else if(node.parent == 2) 
                Explorer.dialogDClick(node);
            
         });
    }

    static tree() {
        return $("#jsTreeDiv").jstree(true);
    }

    static refreshFields() {
        $("#fieldHolder").empty();
        for(let field of Explorer.fields) {
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
                Explorer.fields = Explorer.fields.filter(function(ele){ 
                    return ele != field; 
                });
                Explorer.refreshFields();
            };

            div.appendChild(removeButton);
            div.appendChild(nameField);
            div.appendChild(valueField);

            $("#fieldHolder").append(div);
        }
    }

    static addField() {
        Explorer.fields.push({name:"New Field", value: 0});
        Explorer.refreshFields();
    }

    static characterDClick(node) {
        Explorer.editedNode = node;

        if(node.data.fields){
            Explorer.fields = JSON.parse(JSON.stringify(node.data.fields));
        }else {
            Explorer.fields = [];
        }
        
        Explorer.refreshFields();
                    
        $("#addField").click( () => {
            Explorer.addField();
        });

        $( "#name" ).val(node.text);
        Explorer.dialog.dialog( "option", "title", "Edit the Character" );
        Explorer.dialog.dialog("open");
        editor.pause = true;
    }

    static dialogDClick(node) {

    }

    static checkCharName(tree, name, node) {
        if(name.length < 3) {
            alert("Pick a longer name!");
            return false;
        }

        for(let node_id of tree.get_node(1).children) {
            const character = tree.get_node(node_id);

            if(character.text == name && character != node) {
                alert("Pick a different name!");
                return false;
            }
        }

        return true;
    }

    static checkFields() {
        for(let field1 of Explorer.fields) {
            for(let field2 of Explorer.fields) {
                if(field1 != field2 && field1.name === field2.name) {
                    alert("Character fields should be unique!");
                    return false;
                }
            }  
        }
        return true;
    }

    static manageCharacter() {
        const tree = Explorer.tree();
        const name =  $( "#name" ).val();
        let node = Explorer.editedNode;

        if(!Explorer.checkCharName(tree, name, node)) return;
        if(!Explorer.checkFields()) return;

        if(node) {
            node.data.fields = JSON.parse(JSON.stringify(Explorer.fields));
            tree.rename_node(node, name);
            Explorer.editedNode = null;
        }else {
            node = tree.create_node(1, { text: name, icon: 'jstree-file', a_attr:{type:'file'}, data: {fields: JSON.parse(JSON.stringify(Explorer.fields))}});
        }
        
        tree.deselect_all();
        tree.select_node(node);

        Explorer.dialog.dialog("close");
    }

    static getFolderContext(node) {
        if (node.id != 1) return;
        return {
            "Create": {
                "seperator_before": false,
                "seperator_after": false,
                "label": "Create",
                "action":  (obj) => {
                    Explorer.editedNode = null;
                    Explorer.fields = [];
                    Explorer.refreshFields();

                    $("#addField").click( () => {
                        Explorer.addField();
                    });
                    
                    Explorer.dialog.dialog( "option", "title", "Create a Character" );
                    Explorer.dialog.dialog("open");
                    editor.pause = true;
                }
            }
        };
    }

    static getFileContext(node) {
        const tree = Explorer.tree();

        return {
            "Rename": {
                "separator_before": false,
                "separator_after": false,
                "label": "Rename",
                "action": function (obj) {
                    const oldName = node.text;
                    tree.edit(node, null, (n, succ, canc) => {
                        if(succ && !canc  && !Explorer.checkCharName(tree, n.text, n)) {
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