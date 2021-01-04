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

                    if(node.a_attr.type == "folder")  {
                        return Explorer.getFolderCtx(node);
                    }else {
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
            else if(node.a_attr.type == "file")
                Explorer.doubleClickPanel(node);
        });
    }

    static tree() {
        return $("#jsTreeDiv").jstree(true);
    }

    static doubleClickPanel(node) {
        camera.rawX = node.data.x - width / 2 + 100;
        camera.rawY = node.data.y - height / 2 + 100;
        camera.scale = 1.0;
        camera.rawToPos();
        editor.bottomMenu.slider.value(camera.scale);
        editor.getPanel(node.id).bringFront();
    }

    static getFolderCtx(node) {
        return {
            "Create": {
                "seperator_before": false,
                "seperator_after": false,
                "label": "Create",
                "action": (obj) => {
                    if(node.id == "1") {
                        CharacterEditor.openEditing();
                    }else if(node.id == "2") {
                        editor.newPanel("dialog");
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
                    if(node.parent == "1") {
                        const oldName = node.text;
                        tree.edit(node, null, (n, succ, canc) => {
                            if (succ && !canc && !CharacterEditor.checkCharName(tree, n.text, n)) {
                                tree.rename_node(n, oldName);
                            }
                        });
                    }else tree.edit(node);
                }
            },
            "Remove": {
                "separator_before": false,
                "separator_after": false,
                "label": "Remove",
                "action": function (obj) {
                    if(node.parent == "1") 
                        tree.delete_node(node);
                    else 
                        editor.removePanelViaNode(node);
                }
            }
        };
    }

  
}