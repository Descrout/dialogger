const PlayerState = Object.freeze({
	TYPING: "typing",
	PRESENT_CHOICES: "present_choices",
	WAITING_INPUT: "waiting_input",
	TYPING_CHOICE: "typing_choice"
});

class DialogPlayer {
	constructor(data) {
		this.type_speed = 0.01;
		this.choice_speed = 0.3;

		this.blip1 = new Audio("js/play/blip1.wav");
		this.blip1.volume = 0.05;

		this.blip2 = new Audio("js/play/blip2.wav");
		this.blip2.volume = 0.05;

		this.blip3 = new Audio("js/play/blip3.wav");
		this.blip3.volume = 0.2;


		this.dom_text = document.getElementById("text");
		this.dom_text_holder = document.getElementById("dialog-text");
		this.dom_bar = document.getElementById("bar");
		this.dom_bottom = document.getElementById("bottom");

		this.dialog_state = new DialogState(data);
		this.reset(this.dialog_state.starting);
	}

	play(snd) {
		snd.currentTime = 0;
		snd.play();
	}

	end() {
		this.dom_text.innerHTML = "--END--";
		this.clear_choices();
		const restart = document.createElement("div");
		restart.classList.add("choice");
		restart.classList.add("fadeIn");
		restart.innerHTML = "> Restart";
		restart.onclick = (e) => location.reload();
		this.dom_bottom.appendChild(restart);
		this.state = "end";
	}

	reset(path) {
		if(!path || Object.keys(path).length === 0) {
			this.end();
			return;
		}
		this.clear_choices();
		this.state = PlayerState.TYPING;
		this.time = 0.0;
		this.current_ch = 0;
		this.current_choice_ch = 0;
		this.current_choice = 0;
		this.dom_text.innerHTML = "";
		this.dom_choice = null;
		this.choice = "";
		this.setBar(100);
		this.dialog = this.dialog_state.evaluate(path);
	}

	setBar(percent) {
		this.dom_bar.style.width = `${percent}vw`;
	}

	addChoice() {
		this.play(this.blip1);

		this.current_choice_ch = 0;
		const choice = this.dialog.options[this.current_choice];

		const dom_choice = document.createElement("div");
		dom_choice.setAttribute("data_idx", this.current_choice);
		dom_choice.classList.add("choice");
		dom_choice.classList.add("fadeIn");
		dom_choice.innerHTML = "> ";

		this.dom_bottom.appendChild(dom_choice);
		this.dom_bottom.scrollTop = this.dom_bottom.scrollHeight;

		this.dom_choice = dom_choice;
		this.choice = choice.text;
		this.current_choice += 1;
		this.state = PlayerState.TYPING_CHOICE;
	}

	type() {
		if(this.dialog.text.length === 0) return;
		const ch = this.dialog.text[this.current_ch];
		this.dom_text.innerHTML += ch;
		this.dom_text_holder.scrollTop = this.dom_text_holder.scrollHeight;
		if(ch != " ") {
			this.play(this.blip2);
		}
		this.current_ch += 1;
		if(this.current_ch === this.dialog.text.length) this.state = PlayerState.PRESENT_CHOICES;
	}

	type_choice() {
		if(this.choice.length === 0) {
			this.state = PlayerState.PRESENT_CHOICES;
			return;
		}

		const ch = this.choice[this.current_choice_ch];
		this.dom_choice.innerHTML += ch;
		this.dom_bottom.scrollTop = this.dom_bottom.scrollHeight;
		if(ch != " ") {
			// Add if you want a sound for choices as well
		}

		this.current_choice_ch += 1;
		if(this.current_choice_ch === this.choice.length) this.state = PlayerState.PRESENT_CHOICES;
	} 

	typing(dt, isChoice) {
		if(this.time < this.type_speed) this.time += dt;
		else {
			this.time = 0.0;
			if(isChoice) this.type_choice();
			else this.type();
		}
		
		return true;
	}

	clear_choices() {
		while (this.dom_bottom.firstChild) {
	    	this.dom_bottom.removeChild(this.dom_bottom.lastChild);
	    }
	}

	present_choices(dt) {
		if(this.current_choice === this.dialog.options.length) {
			for(const cho of this.dom_bottom.children) {
				cho.onclick = (e) => {
					this.play(this.blip3);
					this.reset(this.dialog.options[cho.getAttribute("data_idx")].path);
				}; 
			}
			this.state = PlayerState.WAITING_INPUT;
		} else this.addChoice();
		return true;
	}

	waiting_input(dt) {
		if(this.dialog.full_time) {
			this.dialog.time_limit -= dt;
			if(this.dialog.time_limit > 0) {
				this.setBar(this.dialog.time_limit / this.dialog.full_time * 100);
			} else this.reset(this.dialog.time_path);
		}
		return true;
	}

	update(dt) {
		switch(this.state) {
			case PlayerState.TYPING:
				return this.typing(dt, false);
			case PlayerState.PRESENT_CHOICES:
				return this.present_choices(dt);
			case PlayerState.WAITING_INPUT:
				return this.waiting_input(dt);
			case PlayerState.TYPING_CHOICE:
				return this.typing(dt, true);
			default:
				return false;
		}
	}
}