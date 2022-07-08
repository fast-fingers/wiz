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
let ws = new WebSocket("ws://3.8.122.91:3000")
 
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
		"x": canvas.width,
		"y": canvas.height,
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
		const payLoad = {
			"method": "click",
			"clientId":clientId,
			"x": event.clientX,
			"y": event.clientY
		}

		ws.send(JSON.stringify(payLoad))
		
	}	
})


const tile_size = 640;
const render_distance = 2500;


//tiles
const grass1 = new Image()
const flower1 = new Image()

//static sprites
const treeSprite = new Image()
const rockSprite = new Image()

grass1.src = 'images/grass1.png'
//flower1.src = 'images/flower1.png'

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
		for (let i = 0; i < object_list.length; i++) {
			//only render in surrounding trees and rocks and shit
			if ((object_list[i].x > x - render_distance) && (object_list[i].x < x + render_distance) && (object_list[i].y > y - render_distance) && (object_list[i].y < y + render_distance)){
				if (object_list[i].img == 'treeSprite') {c.drawImage(treeSprite, object_list[i].x - x, object_list[i].y - y, object_list[i].length, object_list[i].height)}
				if (object_list[i].img == 'rockSprite') {c.drawImage(rockSprite, object_list[i].x - x, object_list[i].y - y, object_list[i].length, object_list[i].height)}
			}
		}
	}
	catch (err) {
		console.log(err)
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
	
	for (let i = 0; i< enemies.length; i++) {
		c.drawImage(goblinSprite, enemies[i][0] - backCamera.x - 50, enemies[i][1] - backCamera.y - 50, 100, 100)
		handleHealth(enemies[i][0], backCamera.x, enemies[i][1], backCamera.y, enemies[i][2])
	}

	for (let i = 0; i < players.length; i++) {


			for (let x = 0; x< projectiles.length; x++) {
				drawProjectile(projectiles[x][0] - backCamera.x, projectiles[x][1] - backCamera.y, 'red', 7)
			}

			handleNames(players[i][0] - backCamera.x, players[i][1] - backCamera.y, players[i][5])
			handleLevel(players[i][0] - backCamera.x, players[i][1] - backCamera.y, players[i][6])	

			if (players[i][3] == 1) {
					c.drawImage(playerSprite, players[i][0] - backCamera.x - 27.5, players[i][1] - backCamera.y - 30, 55, 60) //if facing right draw facing right image
			} else {
				c.drawImage(playerSprite1, players[i][0] - backCamera.x - 27.5, players[i][1] - backCamera.y - 30, 55, 60)
			}


			handleHealth(players[i][0], backCamera.x, players[i][1], backCamera.y, players[i][2])




			for (let c = 0;c < players[i][4].length; c++) {
				if (players[i][4][c].timer >= 5) {
					drawProjectile(players[i][4][c].worldCoords.x - (backCamera.x), players[i][4][c].worldCoords.y - (backCamera.y), 'blue', 3)
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
			c.drawImage(goblinSprite, enemies[i][0] - camera.x - 50, enemies[i][1] - camera.y - 50, 100, 100)
			handleHealth(enemies[i][0], camera.x, enemies[i][1], camera.y, enemies[i][2])

		}

		for (let i = 0; i < players.length; i++) {
			
			if (players[i][7] == clientId) {
				
					for (let x = 0; x< projectiles.length; x++) {
						
						drawProjectile(projectiles[x][0] - camera.x, projectiles[x][1] - camera.y, 'red', 7)
					}
					
					handleNames(-(players[i][0] - players[i][0] - (canvasDimensions.x / 2)),-( players[i][1] - players[i][1] - (canvasDimensions.y / 2)), players[i][5])
					handleLevel(-(players[i][0] - players[i][0] - (canvasDimensions.x / 2)), -(players[i][1] - players[i][1] - (canvasDimensions.y / 2)), players[i][6])
					handleInfo(players[i][0], players[i][1], ( Math.floor(100 * 1.1**(players[i][6]-1)) - players[i][8]   ), players[i][2])


					try {
						draw(players[i][0]  - (canvasDimensions.x / 2), players[i][1]  - (canvasDimensions.y / 2), tile_list)
						
					}
					catch(err) {
						console.log(err)
					}	

					camera.x = players[x][0] - (canvasDimensions.x / 2)
					camera.y = players[x][1] - (canvasDimensions.y / 2)

					x = i

					if (players[i][3] == 1) {
						
						
						c.drawImage(playerSprite, -(players[i][0] - players[i][0] - (canvasDimensions.x / 2))- 27.5, -(players[i][1] - players[i][1] - (canvasDimensions.y / 2)) - 30, 55, 60) // if playerid is socket id draw it at middle aka if its you draw in middle of screen
					} else {
						c.drawImage(playerSprite1, -(players[i][0] - players[i][0] - (canvasDimensions.x / 2)) - 27.5, -(players[i][1] - players[i][1] - (canvasDimensions.y / 2) )- 30, 55, 60)
					}

					
					handleHealth(players[i][0], players[i][0] - (canvasDimensions.x / 2), players[i][1], players[i][1] - (canvasDimensions.y / 2), players[i][2])
					
					try {
						drawObjects(players[i][0] - (canvasDimensions.x / 2), players[i][1] - (canvasDimensions.y / 2), object_list)
					}
					catch(err) {
						drawObjects({x:(2560 - (canvas.x / 2)), y:(2240 - (canvas.y / 2))})
					}
				
			} else {
				handleNames(players[i][0] - camera.x, players[i][1] - camera.y, players[i][5])
				handleLevel(players[i][0] - camera.x, players[i][1] - camera.y, players[i][6])

				
				if (players[i][3] == 1) {
						c.drawImage(playerSprite, players[i][0] - camera.x - 27.5, players[i][1] - camera.y - 30, 55, 60) //if facing right draw facing right image
				} else {
						c.drawImage(playerSprite1, players[i][0] - camera.x - 27.5, players[i][1] - camera.y - 30, 55, 60)
				}


				handleHealth(players[i][0], players[x][0] - (canvasDimensions.x / 2), players[i][1], players[x][1] - (canvasDimensions.y / 2), players[i][2])

			}

			
			for (let c = 0;c < players[i][4].length; c++) {
				if (players[i][4][c].timer >= 5) {
					drawProjectile(players[i][4][c].worldCoords.x - (players[x][0] - (canvasDimensions.x / 2)), players[i][4][c].worldCoords.y - (players[x][1] - (canvasDimensions.y / 2)), 'blue', 3)
				}
			}
			
		}

		//var end = performance.now();
		//console.log(`Execution time: ${(Math.round((end - start) * 100) / 100)} ms`);
		requestAnimationFrame(handleWorld);

}
setTimeout(()=> {
	backgroundWorld()

}, 1000)
