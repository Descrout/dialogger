const dataStr = localStorage.getItem("export");
if(!dataStr) {
	alert("No export found.");
} else {
	const data = JSON.parse(dataStr);
	if(!data) {
		alert("Export parse error.");
	}else {
		const dialog_player = new DialogPlayer(data);
		let start = 0;

		function step(timestamp) {
			const dt = (timestamp - start) / 1000;
			start = timestamp;
			if(dialog_player.update(dt))
				window.requestAnimationFrame(step);
		} 
		window.requestAnimationFrame(step);
	}
}