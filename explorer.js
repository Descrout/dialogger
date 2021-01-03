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
                Explorer.doubleClickDialog(node);

        });
    }

    static tree() {
        return $("#jsTreeDiv").jstree(true);
    }

    static doubleClickDialog(node) {
        camera.rawX = node.data.x - width / 2 + 100;
        camera.rawY = node.data.y - height / 2 + 100;
        camera.scale = 1.0;
        camera.rawToPos();
        editor.downPanel.slider.value(camera.scale);
        editor.dialogs.get(node.id).bringFront();
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