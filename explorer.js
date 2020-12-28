class Explorer {
    static dialog = $("#character-creation").dialog({
        autoOpen: false,
        height: 400,
        width: 350,
        modal: true,
        buttons: {
            "Save": Explorer.manageCharacter,
            Cancel: () => {
                Explorer.dialog.dialog("close");
            }
        },
        close: function () {
            Explorer.form[0].reset();
        }
    });

    static form = this.dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        Explorer.manageCharacter();
    });

    static init() {
        const jsTreeDiv = document.getElementById("jsTreeDiv");
        jsTreeDiv.oncontextmenu = function (e) {
            e.preventDefault();
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

    static editedNode = null;

    static characterDClick(node) {
        Explorer.editedNode = node;
        $( "#name" ).val(node.text);
        Explorer.dialog.dialog( "option", "title", "Edit the Character" );
        Explorer.dialog.dialog("open");
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

    static manageCharacter() {
        const tree = Explorer.tree();
        const name =  $( "#name" ).val();
        let node = Explorer.editedNode;

        if(!Explorer.checkCharName(tree, name, node)) return;

        if(node) {
            tree.rename_node(node, name);
            Explorer.editedNode = null;
        }else {
            node = tree.create_node(1, { text: name, icon: 'jstree-file', a_attr:{type:'file'} });
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
                "action": function (obj) {
                    Explorer.editedNode = null;
                    Explorer.dialog.dialog( "option", "title", "Create a Character" );
                    Explorer.dialog.dialog("open");
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