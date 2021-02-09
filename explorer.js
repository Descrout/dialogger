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

                    if (node.a_attr.type == "folder") {
                        return Explorer.getFolderCtx(node);
                    } else {
                        return Explorer.getFileCtx(node);
                    }
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
                        editor.newPanel("dialog");
                    } else if (node.id == "3") {
                        editor.newPanel("setter");
                    } else if (node.id == "4") {
                        editor.newPanel("condition");
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