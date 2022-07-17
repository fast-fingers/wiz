// JavaScript source code
const canvas = document.getElementById('canvas');
const canvas1 = document.getElementById('background');
const c = canvas.getContext('2d');
const ctx = canvas1.getContext('2d');

canvas.width = innerWidth 
canvas.height = innerHeight

canvas1.width = innerWidth 
canvas1.height = innerHeight
canvas1Dimensions = {
	x: canvas1.width,
	y: canvas1.height,
}

let terrain_list = [];

let projectiles;
let enemies;
let players;
let clientId;

let name;
let ws = new WebSocket("ws://localhost:3000")
 
let playerStatus = false; //false for in main menu, true for in game

let canvasDimensions = {
	x: canvas.width,
	y: canvas.height,
}

//--------- handle form --------------
function handleSubmit(event) {
	

    event.preventDefault();

    const data = new FormData(event.target);

    const value = Object.fromEntries(data.entries());

   	value.topics = data.getAll("topics");

	playerStatus = true;

	

	let name = value.username

	const payLoad = {
		"method": "join",
		"clientId": clientId,
		"x": canvasDimensions.x,
		"y": canvasDimensions.y,
		"username": name,
	}
	
	ws.send(JSON.stringify(payLoad)) //<---player begins playing omg this cunt sets it to false 

	

	document.getElementById('center').style.display = "none";
	document.getElementById('main-title').style.display = "none";
	document.getElementById('chat').style.display = "block";


}
function handleSubmitChat(event) {
	
	
    event.preventDefault();

    const data = new FormData(event.target);

    const value = Object.fromEntries(data.entries());

   	value.topics = data.getAll("topics");

	let message = value.chat

	const payLoad = {
		"method": "chat",
		"clientId": clientId,
		"message": message,
	}
	ws.send(JSON.stringify(payLoad))
	elem.value = ""

}



const form = document.getElementById("usernameForm");
const form1 = document.getElementById("chatForm")

form1.addEventListener("submit", handleSubmitChat);
form.addEventListener("submit", handleSubmit);

let grass_list = []

//-----------------------handle chat-------------------------
let mouseOver = false;



ws.onmessage = message => {
	//console.log(JSON.parse(message.data))
	
	const response = JSON.parse(message.data);
	if (response.method === "game-state") {
		
		projectiles = response["projectiles"]
		enemies = response["enemies"]	 
		players = response["players"]
		
	}  else if (response.method === "chat"){
		for (let i=0; i < 11; i++) {
			document.getElementById("line-" + (i + 1)).innerHTML = response["lines"][i]
		}
	} else if (response.method === "connect") {
		clientId = response["clientId"];
	} else if (response.method === "world-data") {
		tile_list = response["tile_list"]
		object_list = response["object_list"]
		grass_list = response["grass_list"]
	} 
}

function textFocused() {
	if (elem === document.activeElement) {
		mouseOver = true;
	} else {
		mouseOver = false;
	}
}
const elem = document.getElementById('chatText');


// -----------------------------------------------

const playerSprite = new Image()
const playerSprite1 = new Image()

const goblinSprite = new Image()

goblinSprite.src = 'images/goblin1.png'

playerSprite.src = 'images/wizard_sprite.png'
playerSprite1.src = 'images/wizard_sprite1.png'

function drawProjectile(x,y, colour, size) {
	
	c.beginPath() 
	c.arc(x, y, size, 0, Math.PI * 2, false)
	c.fillStyle = colour
	c.fill()		
}

function drawHealthSegment(x,y, colour) {
	c.beginPath();
	c.rect(x, y, 10, 5);
	c.fillStyle = colour
	c.fill()
}


document.onkeypress = function (e) {
	if (playerStatus) {
		const payLoad = {
			"method": "keypress",
			"code" : e.keyCode,
			"clientId":clientId,
		}
		if (mouseOver == false) {
			ws.send(JSON.stringify(payLoad))
		}
	}
}


document.onkeyup = function(e){
	if (playerStatus) {
		const payLoad = {
			"method": "keyup",
			"code" : e.keyCode,
			"clientId":clientId,
		}
		ws.send(JSON.stringify(payLoad))
	}	

}


document.addEventListener('click', (event) => {
	if (playerStatus) {
		let camX = camera.x
		let camY = camera.y

		const payLoad = {
			"method": "click",
			"clientId":clientId,
			"x": event.clientX,
			"y": event.clientY,
			"cx": camX,
			"cy": camY,
		}

		ws.send(JSON.stringify(payLoad))
		
	}	
})


const tile_size = 640;
let render_distance = 0

if (canvas.width > canvas.height) {

	render_distance = canvas.width + 200;
} else {
	render_distance = canvas.height + 200;
}




//tiles
const grass1 = new Image()
const flower1 = new Image()

//static sprites
const treeSprite = new Image()
const rockSprite = new Image()
const rock2 = new Image()
const rock3 = new Image()
const bigGrass1 = new Image()
const bigGrass2 = new Image()
const stump1 = new Image()


grass1.src = 'images/grass1.png'

//flower1.src = 'images/flower1.png'
stump1.src = 'images/stump1.png'
rock2.src = 'images/rock2.png'
rock3.src = 'images/rock3.png'
bigGrass1.src = 'images/bigGrass1.png'
bigGrass2.src = 'images/bigGrass2.png'
treeSprite.src = 'images/tree1.png'
rockSprite.src = 'images/rock1.png'

		
function draw(x, y, tile_list) {
	try {
	//tiles
		for (let i = 0; i < tile_list.length; i++) {
		//console.log('drawing')
			//only render in surrounding tiles
			if ((tile_list[i].x > x - render_distance) && (tile_list[i].x < x + render_distance) && (tile_list[i].y > y - render_distance) && (tile_list[i].y < y + render_distance)){
				if (tile_list[i].img == 'grass1') {ctx.drawImage(grass1, tile_list[i].x - x, tile_list[i].y - y, tile_list[i].length, tile_list[i].height)}
				//if (tile_list[i].img == 'flower1') {ctx.drawImage(flower1, tile_list[i].x - x, tile_list[i].y - y, tile_list[i].length, tile_list[i].height)}			
			}
		}
	}
	catch (err) {
		console.log(err)
	}
}

function handleNames(x,y, name) {
	c.font = "15px Comic Sans MS";
	c.fillStyle = "black";

	this.offsetX = (name.length * 15) / 4

	c.fillText(name,x - this.offsetX, y - 50)
}

function handleLevel(x,y,level) {
	c.font = "15px Comic Sans MS";
	c.fillStyle = "black";

	

	c.fillText( "level: " + String(level) ,x - 26.25, y + 50)
}

function handleInfo(x, y, experienceReq, health) {
	c.font = "15px Comic Sans MS";
	c.fillStyle = "black";

	

	c.fillText( "x: " + String(x) + "  " + "y: " + String(y),30,30)
	c.fillText( "Health: " + String(health), 30, 60)
	c.fillText( "Experience Required: " + String(experienceReq), 30, 90)
}

function handleHealth(x, cx, y, cy, health) {

	this.offset = {

		x: 25,
		y: 40,
	}

	if (health >= 75) {
		drawHealthSegment( x - cx - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 10 - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 20 - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 30 - this.offset.x, y - cy - this.offset.y, 'green')
	} else if (health >= 50) {
		drawHealthSegment( x - cx - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 10 - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 20 - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 30 - this.offset.x, y - cy - this.offset.y, 'red')
	} else if (health >= 25) {
		drawHealthSegment( x - cx - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 10 - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 20 - this.offset.x, y - cy - this.offset.y, 'red')
		drawHealthSegment( x - cx + 30 - this.offset.x, y - cy - this.offset.y, 'red')
	} else if (health > 0) {
		drawHealthSegment( x - cx - this.offset.x, y - cy - this.offset.y, 'green')
		drawHealthSegment( x - cx + 10 - this.offset.x, y - cy - this.offset.y, 'red')
		drawHealthSegment( x - cx + 20 - this.offset.x, y - cy - this.offset.y, 'red')
		drawHealthSegment( x - cx + 30 - this.offset.x, y - cy - this.offset.y, 'red')
	} else if (health <= 0) {
		drawHealthSegment( x - cx - this.offset.x, y - cy - this.offset.y, 'red')
		drawHealthSegment( x - cx + 10 - this.offset.x, y - cy - this.offset.y, 'red')
		drawHealthSegment( x - cx + 20 - this.offset.x, y - cy - this.offset.y, 'red')
		drawHealthSegment( x - cx + 30 - this.offset.x, y - cy - this.offset.y, 'red')
		}
}

function drawObjects(x,y, object_list) {
	try {
		//not tiles
		for (let i = 0; i < object_list.length; i++) { //you could totally write this in one line
			//only render in surrounding trees and rocks and shit
			if ((object_list[i].x > x - render_distance) && (object_list[i].x < x + render_distance) && (object_list[i].y > y - render_distance) && (object_list[i].y < y + render_distance)){
				if (object_list[i].img == 'treeSprite') {c.drawImage(treeSprite, object_list[i].x - x, object_list[i].y - y, object_list[i].length, object_list[i].height)}
				if (object_list[i].img == 'rockSprite') {c.drawImage(rockSprite, object_list[i].x - x, object_list[i].y - y, object_list[i].length, object_list[i].height)}
				if (object_list[i].img == 'stump1') {c.drawImage(stump1, object_list[i].x - x, object_list[i].y - y, object_list[i].length, object_list[i].height)}
				if (object_list[i].img == 'rock2') {c.drawImage(rock2, object_list[i].x - x, object_list[i].y - y, object_list[i].length, object_list[i].height)}
			}
		}

	}
	catch (err) {
		console.log(err)
	}
}

function drawGrass(x, y, grass_list) {
	for (let i = 0; i < grass_list.length; i++) {
		if ((grass_list[i].x > x - render_distance) && (grass_list[i].x < x + render_distance) && (grass_list[i].y > y - render_distance) && (grass_list[i].y < y + render_distance)) {
			if (grass_list[i].img == 'bigGrass1') {ctx.drawImage(bigGrass1, grass_list[i].x - x, grass_list[i].y - y, grass_list[i].length, grass_list[i].height)}
			if (grass_list[i].img == 'bigGrass2') {ctx.drawImage(bigGrass2, grass_list[i].x - x, grass_list[i].y - y, grass_list[i].length, grass_list[i].height)}		
			if (grass_list[i].img == 'rock3') {ctx.drawImage(rock3, grass_list[i].x - x, grass_list[i].y - y, grass_list[i].length, grass_list[i].height)}
			
		}

	}

}

tile_list = []
object_list = []



let x = 0;

let camera = {
	x:0,
	y:0
}



let backCamera = {
	x:3840,
	y:3840,
}
let requestID;
function backgroundWorld() {
	
	
	if (backCamera.x > 7000) {
		backCamera.x = 2000
	} 
	backCamera.x += 1
	

	c.clearRect(0, 0, canvasDimensions.x, canvasDimensions.y)
	ctx.clearRect(0, 0, canvasDimensions.x, canvasDimensions.y)


	draw(backCamera.x, backCamera.y, tile_list)
	drawObjects(backCamera.x, backCamera.y, object_list)
	drawGrass(backCamera.x, backCamera.y, grass_list)

	for (let i = 0; i< enemies.length; i++) {
		c.drawImage(goblinSprite, enemies[i].x - backCamera.x - 50, enemies[i].y - backCamera.y - 50, 100, 100)
		handleHealth(enemies[i].x, backCamera.x, enemies[i].y, backCamera.y, enemies[i].health)
	}

	for (let i = 0; i < players.length; i++) {


			for (let x = 0; x< projectiles.length; x++) {
				drawProjectile(projectiles[x].x - backCamera.x, projectiles[x].y - backCamera.y, 'red', 7)
			}

			handleNames(players[i].x - backCamera.x, players[i].y - backCamera.y, players[i].name)
			handleLevel(players[i].x - backCamera.x, players[i].y - backCamera.y, players[i].level)	
			
			if (players[i].direction == 1) {
					c.drawImage(playerSprite, players[i].x - backCamera.x - 27.5, players[i].y - backCamera.y - 30, 55, 60) //if facing right draw facing right image
			} else {
				c.drawImage(playerSprite1, players[i].x - backCamera.x - 27.5, players[i].y - backCamera.y - 30, 55, 60)
			}


			handleHealth(players[i].x, backCamera.x, players[i].y, backCamera.y, players[i].health)




			for (let c = 0;c < players[i].projectiles.length; c++) {
				if (players[i].projectiles[c].timer >= 5) {
					drawProjectile(players[i].projectiles[c].x - (backCamera.x), players[i].projectiles[c].y - (backCamera.y), 'blue', 3)
				}
			}
		
	}

	requestID = requestAnimationFrame(backgroundWorld);


	if (playerStatus) {
		cancelAnimationFrame(requestID);
		handleWorld()
		
	}
	
}

function handleWorld() {
	//var start = performance.now();
		
		textFocused()
		c.clearRect(0, 0, canvasDimensions.x, canvasDimensions.y)
		ctx.clearRect(0, 0, canvasDimensions.x, canvasDimensions.y)



		for (let i = 0; i< enemies.length; i++) {
			c.drawImage(goblinSprite, enemies[i].x - camera.x - 50, enemies[i].y - camera.y - 50, 100, 100)
			handleHealth(enemies[i].x, camera.x, enemies[i].y, camera.y, enemies[i].health)

		}

		for (let i = 0; i < players.length; i++) {
			
			if (players[i].id == clientId) {
					camera.x = players[i].x - (canvasDimensions.x / 2)
					camera.y = players[i].y - (canvasDimensions.y / 2)
					x = i
					
					
					for (let c = 0;c < players[i].projectiles.length; c++) {
						if (players[i].projectiles[c].timer >= 5) {
							drawProjectile(players[i].projectiles[c].worldCoords.x - camera.x, players[i].projectiles[c].worldCoords.y - camera.y, 'blue', 3)
						}
					}
					for (let x = 0; x< projectiles.length; x++) {
						
						drawProjectile(projectiles[x].x - camera.x, projectiles[x].y - camera.y, 'red', 7)
					}



					try {
						draw(players[i].x  - (canvasDimensions.x / 2), players[i].y  - (canvasDimensions.y / 2), tile_list)
						
					}
					catch(err) {
						console.log(err)
					}	

					drawGrass(camera.x, camera.y, grass_list)

					if (players[i].direction == 1) {
						
						
						c.drawImage(playerSprite, players[i].x - camera.x - 27.5, players[i].y - camera.y - 30, 55, 60) // if playerid is socket id draw it at middle aka if its you draw in middle of screen
					} else {
						c.drawImage(playerSprite1, players[i].x - camera.x - 27.5, players[i].y - camera.y - 30, 55, 60)
					}

					
					handleHealth(players[i].x, camera.x, players[i].y, camera.y, players[i].health)
					
					try {
						drawObjects(camera.x, camera.y, object_list)
					}
					catch(err) {
						drawObjects({x:(2560 - (canvas.x / 2)), y:(2240 - (canvas.y / 2))})
					}
					
					
					handleNames(players[i].x - camera.x, players[i].y - camera.y, players[i].name)
					handleLevel(players[i].x - camera.x, players[i].y - camera.y, players[i].level)
					handleInfo(players[i].x, players[i].y, ( Math.floor(100 * 1.1**(players[i].level-1)) - players[i].xp ), players[i].health)

			} else {

				camera.x = players[x].x - (canvasDimensions.x / 2)
				camera.y = players[x].y - (canvasDimensions.y / 2)
				


				
				for (let c = 0;c < players[i].projectiles.length; c++) {
					if (players[i].projectiles[c].timer >= 5) {
						drawProjectile(players[i].projectiles[c].worldCoords.x - camera.x, players[i].projectiles[c].worldCoords.y - camera.y, 'blue', 3)
					}
				}

				if (players[i].direction == 1) {
						c.drawImage(playerSprite, players[i].x - camera.x - 27.5, players[i].y - camera.y - 30, 55, 60) //if facing right draw facing right image
				} else {
						c.drawImage(playerSprite1, players[i].x - camera.x - 27.5, players[i].y - camera.y - 30, 55, 60)
				}


				handleHealth(players[i].x, camera.x, players[i].y, camera.y, players[i].health)
				handleNames(players[i].x - camera.x, players[i].y - camera.y, players[i].name)
				handleLevel(players[i].x - camera.x, players[i].y - camera.y, players[i].level)
			}

			

			
		}

		//var end = performance.now();
		//console.log(`Execution time: ${(Math.round((end - start) * 100) / 100)} ms`);
		requestAnimationFrame(handleWorld);

}
setTimeout(()=> {
	backgroundWorld()

}, 1000)
