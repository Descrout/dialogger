const dataStr = localStorage.getItem("export");
if(!dataStr) {
	alert("No export found.");
	window.close();
}

const data = JSON.parse(dataStr);
if(!data) {
	alert("Export parse error.");
	window.close();
}

function update(dt) {

}

// Loop
let start = 0;

function step(timestamp) {
	const dt = (timestamp - start) / 1000;
	start = timestamp;
	update(dt);
	window.requestAnimationFrame(step);
} 

window.requestAnimationFrame(step);