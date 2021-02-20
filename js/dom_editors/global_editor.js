class GlobalEditor {
	static uiOption = null;
    static type = null;

	static dialog = $("#global-edit").dialog({
        autoOpen: false,
        width: window.innerWidth,
        height: window.innerHeight,
        modal: true,
        buttons: {
            "Save": GlobalEditor.finishEditing,
            Cancel: () => {
                GlobalEditor.dialog.dialog("close");
            }
        },
        close: function () {
            GlobalEditor.form[0].reset();
            editor.pause = false;
        }
    });

    static form = GlobalEditor.dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        GlobalEditor.finishEditing();
        console.log("yo eyo");
    });

    static refreshFields() {
		const option = GlobalEditor.uiOption;

        if(GlobalEditor.type === "dialog") {
            $("#choice").val(option.data.text);
            $("#choice-div").css("display", "block");
        }else {
            $("#choice-div").css("display", "none");
        }

        const global_fs = document.getElementById("global_fs");
        Operation.reset(global_fs, "Logic");

        if(option.data.operation !== null && 
           option.data.operation !== undefined) Operation.construct(global_fs, option.data.operation);
        else Operation.addSelect(global_fs);
    }

    static openEditing(uiOption) {
        GlobalEditor.dialog.dialog("open");
        editor.pause = true;
        GlobalEditor.uiOption = uiOption;
        GlobalEditor.type = uiOption.parent.type;
        GlobalEditor.refreshFields();
    }

    static finishEditing() {
    	const option = GlobalEditor.uiOption;
        const global_fs = document.getElementById("global_fs");
        let shouldClose = option.setOperation(global_fs);

        if(GlobalEditor.type === "dialog") {
            $("#choice-div").css("display", "none");
            option.setText($("#choice").val());
            if(!shouldClose) {
                option.data.operation = null;
                shouldClose = true;
            }
        }else if(shouldClose) option.setText(Operation.getText(option.data.operation));
        
        if(shouldClose) {
            $("#global_fs").empty();
            option.parent.checkRefs();
            GlobalEditor.dialog.dialog("close");
            Explorer.changeHappened();
        }
    }
}