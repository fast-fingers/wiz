// JavaScript source code
const { instrument } = require('@socket.io/admin-ui')
const io = require('socket.io')(3000, {
	cors: {
		origin: ["http://localhost:8080", "https://admin.socket.io"],
		credentials: true,

	},
})

let donald;

let canvas = {
	x: 0,
	y: 0,
}
class Player {
	constructor(x, y, health, id, screenX, screenY, cameraX, cameraY) {
		this.x = x
		this.screenCoords = {
			x: screenX,
			y: screenY,
		}			
		this.y = y
		this.color = 'white'
		this.velocity = {
			x:0,
			y:0,
		}
		this.velocity.x = 0
		this.velocity.y = 0
		this.health = health
		this.id = id
		this.cameraCoords = {
			x:cameraX,
			y:cameraY,
		}
		this.cameraVelocity = {
			x: 0,
			y: 0,
		}
		this.direction = 1 //1 is right 0 is left
		this.animationFrame = 0
		this.keyW = false
		this.keyA = false
		this.keyS = false
		this.keyD = false
		this.keyP = false
		this.keyupW = false
		this.keyupA = false
		this.keyupS = false
		this.keyupD = false

	}
	update() {
		this.x += this.velocity.x
		this.y += this.velocity.y
		this.cameraCoords.x += this.cameraVelocity.x
		this.cameraCoords.y += this.cameraVelocity.y
	
}}
let whichIndexReborn = 0;
	
class Projectile {
	constructor(x,y, radius, velocity, id, worldX, worldY, cameraX, cameraY) {
		this.x = x
		this.y = y
		this.radius = radius
		this.velocity = velocity
		this.id = id
		this.worldCoords = {
			x: worldX,
			y: worldY,
		}
		this.cameraCoords = {
			x: cameraX,
			y: cameraY,
		}

	}
	calcWorldCoord() {
	
		projectiles.forEach((projectile, projectileIndex) => {

			if (this.id === playerIdList[projectileIndex]) {
				whichIndexReborn = projectileIndex
				this.x -= (players[projectileIndex].cameraVelocity.x)
				this.y -= (players[projectileIndex].cameraVelocity.y)
				// this.worldCoords.x -= (players[projectileIndex].cameraVelocity.x)
				// this.worldCoords.y -= (players[projectileIndex].cameraVelocity.y)
			} 
			
		})
	
	}
	update() {
		this.calcWorldCoord()
		this.x += this.velocity.x
		this.y += this.velocity.y
		this.worldCoords.x += this.velocity.x
		this.worldCoords.y += this.velocity.y
	}
}



let projectile = new Projectile( 500, 325, 3,{x : 1,y : 1});
let projectiles = [];
let playerIdList = [];
let players = [];


io.on("connection", socket => {
	socket.on("disconnect", (reason) => {
		for (let i = 0; i < players.length; i++) {
			if (socket.id === playerIdList[i]) {
				players.splice([i], 1)
				playerIdList.splice([i], 1)
				console.log(`player ${(i + 1)} has disconnected`)
			}
		}
	})
	
	
 	
	playerIdList.push(socket.id)
	let player = new Player(2560, 2240, 100, socket.id, (1000 / 2), (1000 / 2));
	

	io.emit('id-list', playerIdList)


	socket.on('keypress', keyPressCode => {

		for (let i = 0;i < playerIdList.length; i++) {
 
			if (keyPressCode.id == playerIdList[i]) {
				players[i].keyupW = false
				players[i].keyupA = false
				players[i].keyupS = false
				players[i].keyupD = false


				switch (keyPressCode.code) {
					case 119: return players[i].keyW = true
					case 100: return players[i].keyD = true
					case 115: return players[i].keyS = true
					case 97: return players[i].keyA = true
				}

			}
		}

		})


	socket.on('keyup', keyUpCode => {

		for (let i = 0;i < playerIdList.length; i++) {
			if (keyUpCode.id == playerIdList[i]) {
				players[i].keyW = false
				players[i].keyA = false
				players[i].keyS = false
				players[i].keyD = false


				switch (keyUpCode.code){
					case 87: return players[i].keyupW = true 
					case 65: return players[i].keyupA = true
					case 83: return players[i].keyupS = true
					case 68: return players[i].keyupD = true 


			}
		}
		}

	})

	for (let i = 0; i < players.length; i++) {
		if (socket.id === playerIdList[i]) {
			console.log(`player ${(i + 1)} has connected with id: ${playerIdList[i]}`)
		}
	}

	socket.on('click', (mouseCoords) => {

	for (let i = 0; i < players.length; i++) {
		if (socket.id === playerIdList[i]) {
			var angle = Math.atan2(
				mouseCoords.y - (players[i].y - players[i].cameraCoords.y),
				mouseCoords.x - (players[i].x - players[i].cameraCoords.x),
				)

			var velocity = {
				x: Math.cos(angle) * 7,
				y: Math.sin(angle) * 7,
			}
			
			playerProjWorld = {
				x:(players[i].x),
				y:(players[i].y),
			}
			setTimeout(() => {
			projectiles.push(new Projectile(players[i].x - players[i].cameraCoords.x, players[i].y - players[i].cameraCoords.y,
			 3, velocity, socket.id, playerProjWorld.x, playerProjWorld.y, players[i].cameraCoords.x, players[i].cameraCoords.y))
			 }, 0)
//			console.log(`${players[i].x} , ${players[i].y}`)
	}}		


	}) 



socket.on('canvas', canvasDimensions => {
	canvas.x = canvasDimensions.x
	canvas.y = canvasDimensions.y

	players.push(new Player(2560, 2240, 100, socket.id, (canvas.x / 2), (canvas.y / 2), (2560 - (canvas.x / 2)), (2240 - (canvas.y / 2)))) //spawns at middle of world
})

		// ----------INSIDE GAME LOOP---------------	
	socket.on('game-loop', dddd => {
	function borders() {
		players.forEach((player, index) => {
				
			if (players[index].cameraCoords.x > 5120 - canvas.x) {
				players[index].x = (5120 - canvas.x) + (canvas.x / 2)
				players[index].cameraCoords.x = 5120 - canvas.x
			} 
				if (players[index].cameraCoords.x < 0) {
				players[index].x = 0 + (canvas.x / 2)
				players[index].cameraCoords.x = 0
			} 
				if (players[index].cameraCoords.y > 4480 - canvas.y) {
				players[index].y = 4480 - canvas.y + (canvas.y / 2)
				players[index].cameraCoords.y = 4480 - canvas.y
			}  
			if (players[index].cameraCoords.y < 0){
				players[index].y = 0 + (canvas.y / 2)
				players[index].cameraCoords.y = 0
			} 	
	})
	}
	borders()

	})

//------------------end of game loop---------------- 


}) //end of on connect


function handlemovement() {
	for (let i = 0; i < players.length; i++) {
			if (players[i].keyW === true) {
				players[i].velocity.y = -10
				players[i].cameraVelocity.y = -10 						
			}
			if (players[i].keyA === true) {
			players[i].cameraVelocity.x = -10
				players[i].velocity.x = -10
				players[i].direction = 0
			}	
			if (players[i].keyS === true) {
				players[i].cameraVelocity.y = 10
				players[i].velocity.y = 10
				

			}
			if (players[i].keyD === true) {
				players[i].cameraVelocity.x = 10
				players[i].velocity.x = 10
				players[i].direction = 1

				
			} 
			if (players[i].keyupW || players[i].keyupS) {
				players[i].velocity.y = 0
				players[i].cameraVelocity.y = 0
				players[i].keyW = false
				players[i].keyA = false
				players[i].keyS = false
				players[i].keyD = false
			} 
			if (players[i].keyupA || players[i].keyupD) {
				players[i].velocity.x = 0
				players[i].cameraVelocity.x = 0
				

				players[i].keyW = false
				players[i].keyA = false
				players[i].keyS = false
				players[i].keyD = false

			}
}
}

function updatePlayers() {
	players.forEach((player, index) => {
		player.update()
})
}

function updateProjectiles() {
	projectiles.forEach((projectile, projectileIndex) => {
		projectile.update()
	})
}

/*
		if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.x || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.y) {
			setTimeout(() => {
			projectiles.splice(projectileIndex, 1)
					
			}, 0)
		}
*/


//---------------server game loop ----------------

setInterval(() => {

	handlemovement()
	updatePlayers()
	updateProjectiles()
	io.emit('fill-canvas', donald)
	io.emit('players-coords', players)
	io.emit('projectiles-coords', projectiles)	
}, 10)

instrument(io, {auth:false})



