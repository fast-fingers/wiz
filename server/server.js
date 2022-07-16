// Importing the required modules
const WebSocketServer = require('ws');
 
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 3000 })


const {performance} = require('perf_hooks');

let canvas = {
	x: 0,
	y: 0,
}
const world_size = {
	x: 7680,
	y: 7680,
}

class Player {
	constructor(x, y, health, id, cameraX, cameraY, name, canvasx, canvasy) {
		this.x = x
		this.y = y		
		this.velocity = {
			x:0,
			y:0,
		}
		this.health = health
		this.id = id
		this.cameraCoords = {
			x:cameraX,
			y:cameraY,
		}
		this.name = name
		this.cameraVelocity = {
			x: 0,
			y: 0,
		}
		this.direction = 1 //1 is right 0 is left
		this.animationFrame = 0
		this.keys = []
		this.projectiles = []
		this.healthImmunity = 50
		this.experience = 0
		this.level = 1
		this.totalExperience = 0
		this.index = 0;
		this.canvasx = canvasx;
		this.canvasy = canvasy;
	}
	handleExperience() {
		if (this.health <= 0) {// on death

			console.log('player ' + (this.index + 1) + ' has died')
			this.health = 100
			this.x = (world_size.x / 2)
			this.y = (world_size.y / 2)
			

			let experienceLost = 0;

			experienceLost = (this.totalExperience) / 100 * 10 //lose 10% of health on death

			if (this.experience - experienceLost < 0) { //maybe add something that makes you lost 5% of your total experience because it gets harder to gain levels as u get more op
				this.level -= 1
				this.experience = experienceLost - this.experience
			} else {
				this.experience -= experienceLost
			}
		}
	}
	borders() {
		//to fix the border bug replace camera coords wiht world coords, welcumz
		if (this.x > world_size.x - 1000) {
			this.x = world_size.x - 1000
		} 
		if (this.x < 1000) {
			this.x = 1000
			 
		} 
		if (this.y > world_size.y - 1000) {
			this.y = world_size.y - 1000
			
		}  
		if (this.y < 1000){
			this.y = 1000 
		} 	
	}
	handlemovement() {
		if (this.keys) {
			if (this.keys[0] == 'keyW') {this.velocity.y = -2.5, this.cameraVelocity.y = -2.5}
			if (this.keys[0] == 'keyA') {this.cameraVelocity.x = -2.5, this.velocity.x = -2.5, this.direction = 0}
			if (this.keys[0] == 'keyS') {this.velocity.y = 2.5, this.cameraVelocity.y = 2.5}
			if (this.keys[0] == 'keyD') {this.cameraVelocity.x = 2.5, this.velocity.x = 2.5, this.direction = 1}

		} 

	}
	objectCollision () {
		for (let c = 0; c < world.object_list.length; c++) {
			if (world.object_list[c].object == 'tree') {

				this.offsetX = -5 //changes x of hitbox less is to the left
				this.offsetL = -60 //changes length larger is shroter
				this.offsetY = 30//height of hitbox below 
				this.deltaOffSetY = 10 // height of hitbox above
				
				//remember coords are top right of player, player is 50 long 60 high
				if ((this.x + this.velocity.x >= world.object_list[c].x + this.offsetX && this.x + this.velocity.x <= world.object_list[c].x + this.offsetX + world.object_list[c].length / 2 - this.offsetL)
				&& (this.y >= world.object_list[c].y + this.deltaOffSetY && this.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) { //collide with object x
					this.velocity.x = 0
					this.cameraVelocity.x = 0
				}
				
				if ((this.x >= world.object_list[c].x + this.offsetX && this.x < world.object_list[c].x + this.offsetX + world.object_list[c].length / 2 - this.offsetL)
				&& (this.y + this.velocity.y >= world.object_list[c].y + this.deltaOffSetY && this.y + this.velocity.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) {
					this.velocity.y = 0
					this.cameraVelocity.y = 0
				}
					
			}
			if (world.object_list[c].object == 'rock') {
					
				this.offsetX = 20
				this.offsetL = 0
				this.offsetY = 23
				this.deltaOffSetX = 30

				if ((this.x + this.deltaOffSetX + this.velocity.x >= world.object_list[c].x + this.offsetX && this.x  + this.velocity.x < world.object_list[c].x + this.offsetX + world.object_list[c].length - this.offsetL)
				&& (this.y >= world.object_list[c].y && this.y  < world.object_list[c].y + this.offsetY + world.object_list[c].height)) { //collide with object x 	
					this.velocity.x = 0
					this.cameraVelocity.x = 0
				}
				if ((this.x + this.deltaOffSetX >= world.object_list[c].x + this.offsetX && this.x < world.object_list[c].x + this.offsetX + world.object_list[c].length - this.offsetL)
				&& (this.y + this.velocity.y >= world.object_list[c].y && this.y + this.velocity.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) {
					this.velocity.y = 0
					this.cameraVelocity.y = 0
				}
			}
			if (world.object_list[c].object == 'stump1') {

				this.offsetX = 12.5 //changes x of hitbox less is to the left
				this.offsetL = -30 //changes length larger is shroter
				this.offsetY = 0//height of hitbox below 
				this.deltaOffSetY = 0 // height of hitbox above
				
				//remember coords are top right of player, player is 50 long 60 high
				if ((this.x + this.velocity.x >= world.object_list[c].x + this.offsetX && this.x + this.velocity.x <= world.object_list[c].x + this.offsetX + world.object_list[c].length / 2 - this.offsetL)
				&& (this.y >= world.object_list[c].y + this.deltaOffSetY && this.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) { //collide with object x
					this.velocity.x = 0
					this.cameraVelocity.x = 0
				}
				
				if ((this.x >= world.object_list[c].x + this.offsetX && this.x < world.object_list[c].x + this.offsetX + world.object_list[c].length / 2 - this.offsetL)
				&& (this.y + this.velocity.y >= world.object_list[c].y + this.deltaOffSetY && this.y + this.velocity.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) {
					this.velocity.y = 0
					this.cameraVelocity.y = 0
				}
					
			}
		}
	}
	handleProjectiles() {
	//update projectiles and delete if past border and collision :D
	for (let x = 0; x < enemyProj.length; x++) { //enemy proj collision
		const distance = Math.hypot(this.x - (enemyProj[x].x), this.y - (enemyProj[x].y))
		
		if (distance < 40 ) {
			if (this.healthImmunity <= 0) { 
				this.health -= 5
				this.healthImmunity = 50;
				

			}
			setTimeout(() => {
				enemyProj.splice(x, 1)	
				gameState.projectiles.splice(x,1)
			}, 0)
		}
	}
	for (let c = 0; c < this.projectiles.length; c++) {
		this.projectiles[c].update()
		
			for (let x = 0; x < enemies.length; x++) {
				const dis = Math.hypot(enemies[x].x - this.projectiles[c].worldCoords.x, enemies[x].y - this.projectiles[c].worldCoords.y)
				if (dis < 50) { //if u hit an enemy lol
					if (enemies[x].health - 10 <= 0) {
						this.experience += 10 //gain 10 xp from enemy kill 
						this.totalExperience += 10
					}
					enemies[x].health -= 10
					
					setTimeout(() => {
						this.projectiles.splice(c, 1)	
						gameState.projectiles.splice(c,1)
					}, 0)
				}
			}

			if (this.projectiles[c].x + this.projectiles[c].radius < 0 || this.projectiles[c].x + this.projectiles[c].radius > this.canvasx || this.projectiles[c].y + this.projectiles[c].radius < 0 || this.projectiles[c].y + this.projectiles[c].radius > this.canvasy) {
				setTimeout(() => {
					this.projectiles.splice(c, 1)	
					gameState.projectiles.splice(c,1)
					
				}, 0)
			}
			for (let d = 0; d < players.length; d++) {
				// check if its you (so that you dont kill urself)
				if (players[d].id != this.id) {
					try {
						const dist = Math.hypot(players[d].x - (this.projectiles[c].worldCoords.x), players[d].y - (this.projectiles[c].worldCoords.y))
				
						if (dist < 40 ) { // on collision
							setTimeout(() => {
								this.projectiles.splice(c, 1)
								gameState.projectiles.splice(c,1)	
							}, 0)
	
							if (players[d].healthImmunity <= 0) { 
								players[d].health -= 5
								players[d].healthImmunity = 50;
								console.log(players[d].health)
							}
						}
					}
					catch(err) {
						console.log(err)
					}
				}
			}
		}	

	}
	projCollision () {
		if (this.projectiles[0] || enemyProj[0]) {
		for (let c = 0; c < world.object_list.length; c++) {
			if (world.object_list[c].object == 'tree') {
					this.hitbox = {
						length: 100,
						height: 100,
						offsetX: 50,
						deltaOffSetX: 35,
					}

					for (let p = 0; p < this.projectiles.length; p++) {
						if ((this.projectiles[p].worldCoords.x + this.hitbox.length + this.projectiles[p].velocity.x >= world.object_list[c].x + this.hitbox.offsetX && this.projectiles[p].worldCoords.x - this.hitbox.deltaOffSetX + this.projectiles[p].velocity.x < world.object_list[c].x + this.hitbox.offsetX)
						&& (this.projectiles[p].worldCoords.y >= world.object_list[c].y && this.projectiles[p].worldCoords.y < world.object_list[c].y + this.hitbox.height)) { //collide with object x 	
							setTimeout(() => {
								this.projectiles.splice(p, 1)
								gameState.projectiles.splice(p,1)	
							}, 0)
						}
						if ((this.projectiles[p].worldCoords.x + this.hitbox.length >= world.object_list[c].x + this.hitbox.offsetX && this.projectiles[p].worldCoords.x - this.hitbox.deltaOffSetX < world.object_list[c].x + this.hitbox.offsetX)
						&& (this.projectiles[p].worldCoords.y + this.projectiles[p].velocity.y >= world.object_list[c].y && this.projectiles[p].worldCoords.y + this.projectiles[p].velocity.y < world.object_list[c].y + this.hitbox.height)) {
							setTimeout(() => {
								this.projectiles.splice(p, 1)	
								gameState.projectiles.splice(p,1)
							}, 0)
						}	
					}
					for (let p = 0; p < enemyProj.length; p++) {
						if ((enemyProj[p].x + this.hitbox.length + enemyProj[p].velocity.x >= world.object_list[c].x + this.hitbox.offsetX && enemyProj[p].x - this.hitbox.deltaOffSetX + enemyProj[p].velocity.x < world.object_list[c].x + this.hitbox.offsetX)
						&& (enemyProj[p].y >= world.object_list[c].y && enemyProj[p].y < world.object_list[c].y + this.hitbox.height)) { //collide with object x 	
							setTimeout(() => {
								enemyProj.splice(p, 1)	
								gameState.projectiles.splice(p,1)
							}, 0)
						}
						if ((enemyProj[p].x + this.hitbox.length >= world.object_list[c].x + this.hitbox.offsetX && enemyProj[p].x - this.hitbox.deltaOffSetX < world.object_list[c].x + this.hitbox.offsetX)
						&& (enemyProj[p].y + enemyProj[p].velocity.y >= world.object_list[c].y && enemyProj[p].y + enemyProj[p].velocity.y < world.object_list[c].y + this.hitbox.height)) {
							setTimeout(() => {
								enemyProj.splice(p, 1)
								gameState.projectiles.splice(p,1)	
							}, 0)
						}	
					}
					

			}
			if (world.object_list[c].object == 'rock' || world.object_list[c].object == 'stump1') {
				for (let p = 0; p < this.projectiles.length; p++) {
					if ((this.projectiles[p].worldCoords.x + this.projectiles[p].velocity.x + 20 >= world.object_list[c].x && this.x - 25 + this.projectiles[p].velocity.x < world.object_list[c].x + world.object_list[c].length)
					&& (this.y + 35 >= world.object_list[c].y && this.y - 25 < world.object_list[c].y + world.object_list[c].height)) { //collide with object x 	
						setTimeout(() => {
							this.projectiles.splice(p, 1)	
							gameState.projectiles.splice(p,1)
						}, 0)
					}
					if ((this.projectiles[p].worldCoords.x + 20 >= world.object_list[c].x && this.projectiles[p].worldCoords.x - 25 < world.object_list[c].x + world.object_list[c].length)
					&& (this.projectiles[p].worldCoords.y + 35 + this.projectiles[p].velocity.y >= world.object_list[c].y && this.projectiles[p].worldCoords.y - 25 + this.projectiles[p].velocity.y < world.object_list[c].y + world.object_list[c].height)) {
						setTimeout(() => {
							this.projectiles.splice(p, 1)	
							gameState.projectiles.splice(p,1)
						}, 0)
					}
				}
				for (let p = 0; p < enemyProj.length; p++) {
					if ((enemyProj[p].x + enemyProj[p].velocity.x + 20 >= world.object_list[c].x && this.x - 25 + enemyProj[p].velocity.x < world.object_list[c].x + world.object_list[c].length)
					&& (enemyProj[p].y + 35 >= world.object_list[c].y && enemyProj[p].y - 25 < world.object_list[c].y + world.object_list[c].height)) { //collide with object x 	
						setTimeout(() => {
							enemyProj.splice(p, 1)	
							gameState.projectiles.splice(p,1)
						}, 0)
					}
					if ((enemyProj[p].x + 20 >= world.object_list[c].x && enemyProj[p].x - 25 < world.object_list[c].x + world.object_list[c].length)
					&& (enemyProj[p].y + 35 + enemyProj[p].velocity.y >= world.object_list[c].y && enemyProj[p].y - 25 + enemyProj[p].velocity.y < world.object_list[c].y + world.object_list[c].height)) {
						setTimeout(() => {
							enemyProj.splice(p, 1)	
							gameState.projectiles.splice(p,1)
						}, 0)
					}
				}
			}

		}
		}

	
}

	update() {
		
		this.projCollision()
		this.borders()
		this.handlemovement()
		this.objectCollision()
		this.handleExperience()
		this.handleProjectiles()

		if (this.healthImmunity <= -100) {
			this.healthImmunity = -100
		}
		this.healthImmunity -= 1
		this.angle += this.angleVelo
		this.x += this.velocity.x
		this.y += this.velocity.y
		this.cameraCoords.x += this.cameraVelocity.x
		this.cameraCoords.y += this.cameraVelocity.y

		
		if (this.level < 1) {
			this.level = 1
		}
		if (this.experience >= Math.floor(100 * 1.1**(this.level-1))) {
			this.level += 1
			this.experience = 0
		}


	}
}

	
class Projectile {
	constructor(x,y, radius, velocity, id, worldX, worldY) {
		this.x = x
		this.y = y
		this.radius = radius
		this.velocity = velocity
		this.id = id
		this.worldCoords = {
			x: worldX,
			y: worldY,
		}
		this.timer = 0
	}
		
	update() {
		this.timer += 1
		this.x += this.velocity.x
		this.y += this.velocity.y
		this.worldCoords.x += this.velocity.x
		this.worldCoords.y += this.velocity.y
	}
}

const tile_size = 340;


class World {
	constructor (data) {
		this.tile_list = []
		this.object_list = []
		this.grass_list = []

		//handle tiles
		data.forEach((row, rowIndex) => {
			row.forEach((tile, tileIndex) => {
				let grass1 = 'grass1'
				let flower1 = 'flower1'
				let img_to_push
				if (tile==1) {
					img_to_push = grass1
				} else if (tile==2) {
					img_to_push = flower1
				}
	
				this.tile_list.push({
						img: img_to_push,
						x: tileIndex * tile_size,
						y: rowIndex * tile_size,
						length: tile_size,
						height: tile_size,
				})
			})
		})

		this.numRows = 24;
		this.numCols = 26;
		this.grassDensity = 1 ;
		this.shakyWaky = 1600;


			for (let i = 0; i < this.numRows; i++) {
				for (let c = 0; c < this.numCols; c++) {

					this.number = Math.floor(Math.random() * (8 - 1) + 1);
					let treeSprite = 'treeSprite'
					let rockSprite = 'rockSprite'
					let grassSprite1 = 'bigGrass1'
					let grassSprite2 = 'bigGrass2'
					let stump1 = 'stump1'

					if (this.number == 1 || this.number == 2) {
						this.object_list.push({
								img: treeSprite,
								x: 300+ (Math.random() * ((c * tile_size + 100 + this.shakyWaky) - c * tile_size - this.shakyWaky) + c * tile_size - this.shakyWaky) , //spawns randomly within its tile
								y: 300 +(Math.random() * ((i * tile_size + 125 + this.shakyWaky) - i * tile_size - this.shakyWaky) + i * tile_size - this.shakyWaky) ,
								length: 100,
								height: 125,
								object: 'tree',
								
						})
					} else if (this.number == 3) {
						this.object_list.push({
								img: rockSprite,
								x: 300 +(Math.random() * ((c * tile_size + 100 + this.shakyWaky) - c * tile_size - this.shakyWaky) + c * tile_size - this.shakyWaky) ,
								y: 300 +(Math.random() * ((i * tile_size + 125 + this.shakyWaky) - i * tile_size - this.shakyWaky) + i * tile_size - this.shakyWaky) ,
								length: 100,
								height: 125,
								object: 'rock',
						})

					} else if (this.number == 4) {
						this.object_list.push({
								img: stump1,
								x: 300 +(Math.random() * ((c * tile_size + 100 + this.shakyWaky) - c * tile_size - this.shakyWaky) + c * tile_size - this.shakyWaky) ,
								y: 300 +(Math.random() * ((i * tile_size + 125 + this.shakyWaky) - i * tile_size - this.shakyWaky) + i * tile_size - this.shakyWaky) ,
								length: 100,
								height: 125,
								object: 'stump1',
						})	
					}
					this.shakyWaky = 200
					for (let d = 0; d < this.grassDensity; d++) {
						this.grass_list.push({
							img: grassSprite1,
							x: 300 +(Math.random() * ((c * tile_size + 1000 + this.shakyWaky) - c * tile_size - this.shakyWaky) + c * tile_size - this.shakyWaky),
							y: 300 +(Math.random() * ((i * tile_size + 1250 + this.shakyWaky) - i * tile_size - this.shakyWaky) + i * tile_size - this.shakyWaky),
							length: 40,
							height: 50,

						})	
						this.grass_list.push({
							img: grassSprite2,
							x: 300 +(Math.random() * ((c * tile_size + 1000 + this.shakyWaky) - c * tile_size - this.shakyWaky) + c * tile_size - this.shakyWaky),
							y: 300 +(Math.random() * ((i * tile_size + 1250 + this.shakyWaky) - i * tile_size - this.shakyWaky) + i * tile_size - this.shakyWaky),
							length: 40,
							height: 50,

						})					
					}

			}
		}


}
}	
world_data = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

]




class Enemy {
	constructor (x,y, health) {
		this.x = x
		this.y = y
		this.velocity = {
			x:0,
			y:0,
		}
		this.shootDelay = 75
		this.health = health

	}
	changeVelo(max, min) {
		let dista = []
		for (let c = 0; c < players.length; c++) {
			dista[c] = Math.hypot(players[c].x - (this.x), players[c].y - (this.y))
		}


		for (let c = 0; c < players.length; c++) {
			
			

			let minimum = dista[0]
			let location = 0;
			for (let d = 0; d < players.length; d++) {
				if (dista[d] < minimum) {
					minimum = dista[d]
					location = d
				}
			}
			this.velocity.x = Math.floor(Math.random() * ((max * (1 - (( 0 < this.x - players[location].x ) * (500 > this.x - players[location].x)) )) - (min * (1- ((-500 < this.x - players[location].x) * (this.x - players[location].x < 0))  )))) + min * (1- ((-500 < this.x - players[location].x) * (this.x - players[location].x < 0))  );
			this.velocity.y = Math.floor(Math.random() * ((max * (1 - (( 0 < this.y - players[location].y ) * (500 > this.y - players[location].y)) )) - (min * (1- ((-500 < this.y - players[location].y) * (this.y - players[location].y < 0))  )))) + min * (1- ((-500 < this.y - players[location].y) * (this.y - players[location].y < 0))  );
			
			

		}
			
	}
	enemyProjectiles() {


		for (let i = 0; i < players.length; i++) {
	
			const dist = Math.hypot(players[i].x - (this.x), players[i].y - (this.y))
	
	
			if (dist < 500) {
				if (this.shootDelay < 2) {

					
					this.shootDelay = 75
					

					let velocity = {
						x: (players[i].x - this.x) * speed / dist,
						y: (players[i].y - this.y) * speed / dist,
					}
	
					setTimeout(() => {
						enemyProj.push(new Projectile(this.x, this.y,
						3, velocity, 'penis', this.x, this.y))
					}, 0)
				}
			}
	
	
		}
		
	} 	
	enemyCollision() {
		for (let c = 0; c < world.object_list.length; c++) {
			if (world.object_list[c].object == 'tree') {
				this.offsetX = -5 //changes x of hitbox less is to the left
				this.offsetL = -60 //changes length larger is shroter
				this.offsetY = 30//height of hitbox below 
				this.deltaOffSetY = 10 // height of hitbox above
				
				if ((this.x + this.velocity.x >= world.object_list[c].x + this.offsetX && this.x + this.velocity.x <= world.object_list[c].x + this.offsetX + world.object_list[c].length / 2 - this.offsetL)
				&& (this.y >= world.object_list[c].y + this.deltaOffSetY && this.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) { //collide with object x
					this.velocity.x = 0
				}
				
				if ((this.x >= world.object_list[c].x + this.offsetX && this.x < world.object_list[c].x + this.offsetX + world.object_list[c].length / 2 - this.offsetL)
				&& (this.y + this.velocity.y >= world.object_list[c].y + this.deltaOffSetY && this.y + this.velocity.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) {
					this.velocity.y = 0
				}
						
			}
			if (world.object_list[c].object == 'rock') {
					
				this.offsetX = 20
				this.offsetL = 0
				this.offsetY = 23
				this.deltaOffSetX = 30
	
				if ((this.x + this.deltaOffSetX + this.velocity.x >= world.object_list[c].x + this.offsetX && this.x  + this.velocity.x < world.object_list[c].x + this.offsetX + world.object_list[c].length - this.offsetL)
				&& (this.y >= world.object_list[c].y && this.y  < world.object_list[c].y + this.offsetY + world.object_list[c].height)) { //collide with object x 	
					this.velocity.x = 0
	
				}
				if ((this.x + this.deltaOffSetX >= world.object_list[c].x + this.offsetX && this.x < world.object_list[c].x + this.offsetX + world.object_list[c].length - this.offsetL)
				&& (this.y + this.velocity.y >= world.object_list[c].y && this.y + this.velocity.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) {
					this.velocity.y = 0
	
				}
			}
			if (world.object_list[c].object == 'stump1') {

				this.offsetX = 12.5 //changes x of hitbox less is to the left
				this.offsetL = -30 //changes length larger is shroter
				this.offsetY = 0//height of hitbox below 
				this.deltaOffSetY = 0 // height of hitbox above
				
				//remember coords are top right of player, player is 50 long 60 high
				if ((this.x + this.velocity.x >= world.object_list[c].x + this.offsetX && this.x + this.velocity.x <= world.object_list[c].x + this.offsetX + world.object_list[c].length / 2 - this.offsetL)
				&& (this.y >= world.object_list[c].y + this.deltaOffSetY && this.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) { //collide with object x
					this.velocity.x = 0
					
				}
				
				if ((this.x >= world.object_list[c].x + this.offsetX && this.x < world.object_list[c].x + this.offsetX + world.object_list[c].length / 2 - this.offsetL)
				&& (this.y + this.velocity.y >= world.object_list[c].y + this.deltaOffSetY && this.y + this.velocity.y < world.object_list[c].y + this.offsetY + world.object_list[c].height)) {
					this.velocity.y = 0
					
				}
					
			}
		}
	}
	enemyBorders(world_size) {
		if (this.x > world_size.x) {
			this.x = world_size.x
		} 
		if (this.x < 0) {
			this.x = 0
		} 
		if (this.y > world_size.y) {
			this.y = world_size.y
		}  
		if (this.y < 0){
			this.y = 0
		} 	
	}
	update() {

		this.enemyCollision()
		this.enemyProjectiles()
		this.enemyBorders(world_size)

		this.shootDelay -= 1
		 
		this.x += this.velocity.x
		this.y += this.velocity.y
	}
}




let enemies = [];

let playerIdList = [];
let players = [];

world = new World(world_data)

let lines = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]
let bulletSpeed = 5;
let clients = [];


wss.on("connection", ws => {
    //connect
   
    ws.on("close", () => console.log(clientId + " disconnected"))
    ws.on("message", message => {
		
        const result = JSON.parse(message)
        //I have received a message from the client

		if (result.method === "join") {


			console.log(`player ${(players.length + 1)} has connected with id: ${clientId}`)


	
			players.push(new Player((world_size.x / 2), (world_size.y / 2), 100, result.clientId, ((world_size.x / 2) - (result.x / 2)), ((world_size.y / 2) - (result.y / 2)), result.username, result.x, result.y)) //spawns at middle of world
		}

		for (let i = 0; i < players.length; i++) {
			if (result.clientId === players[i].id) {
			
				if (result.method === "chat") {
					lines.unshift(players[i].name + " > " + result.message)
					
					let payLoad = {
						"method": "chat",
						"lines": lines,
					}

					for (let i=0; i < clients.length; i++) {
						clients[i].connection.send(JSON.stringify(payLoad))
					}
				} else if (result.method === "keypress") {
					if (result.code == 119) {
						if (players[i].keys.indexOf('keyW') == -1) {players[i].keys.unshift('keyW');}
					}
					if (result.code == 100) {
						if (players[i].keys.indexOf('keyD') == -1) {players[i].keys.unshift('keyD');}
					}
					if (result.code == 115) {
						if (players[i].keys.indexOf('keyS') == -1) {players[i].keys.unshift('keyS');}
					}
					if (result.code == 97) {
						if (players[i].keys.indexOf('keyA') == -1) {players[i].keys.unshift('keyA');}
					}
				} else if (result.method ==="keyup") {
					switch (result.code){
						case 87: return players[i].keys.splice(players[i].keys.indexOf('keyW'), 1), players[i].velocity.y = 0, players[i].cameraVelocity.y = 0; //W
						case 65: if (players[i].direction == 0 && players[i].keys.indexOf('keyA') > -1) {return players[i].keys.splice(players[i].keys.indexOf('keyA'), 1), players[i].velocity.x = 0, players[i].cameraVelocity.x = 0;}; //A
						case 83: return players[i].keys.splice(players[i].keys.indexOf('keyS'), 1), players[i].velocity.y = 0, players[i].cameraVelocity.y = 0; //S
						case 68: if (players[i].direction == 1 && players[i].keys.indexOf('keyD') > -1) {return players[i].keys.splice(players[i].keys.indexOf('keyD'), 1), players[i].velocity.x = 0, players[i].cameraVelocity.x = 0;}; //D

					}
				} else if (result.method === "click") {

					const dist = Math.hypot(result.x - (players[i].x - result.cx), result.y - (players[i].y - result.cy))

					var velocity = {
						x: (result.x - (players[i].x - result.cx)) * bulletSpeed / dist,
						y: (result.y - (players[i].y - result.cy)) * bulletSpeed / dist,
					}
					let playerProjWorld = {
						x:(players[i].x),
						y:(players[i].y),
					}


					setTimeout(() => {
					players[i].projectiles.push(new Projectile(players[i].x - result.cx, players[i].y - result.cy,
					3, velocity, result.clientId, playerProjWorld.x, playerProjWorld.y))
					}, 0)
					
				}
			}
		}
    })
	const clientId = guid();
			
	let payLoad = {
		"method": "connect",
		"clientId": clientId
	}
	//send back the client connect
	ws.send(JSON.stringify(payLoad))
	
	clients.push({
		"clientId": clientId,
		"connection": ws
	})
	
	payLoad = {
		"method": "world-data",
		"tile_list": world.tile_list,
		"object_list": world.object_list,
		"grass_list": world.grass_list,
	}

    ws.send(JSON.stringify(payLoad))



	
    
})
// -------------------------------- ENEMIES---------------------------------


let enemyProj = [];
let speed = 5;

function updateProjectiles() {
	for (let i = 0; i < enemyProj.length; i++) {
		
		enemyProj[i].update()
		
		if (enemyProj[i].timer > 100) {
			setTimeout(() => {
				
				enemyProj.splice(i, 1)	
				gameState.projectiles.splice(i,1)
			}, 0)
		}
		gameState.projectiles[i] = {x:enemyProj[i].x, y:enemyProj[i].y}
		//console.log(gameState.projectiles[i])
	}
}

function spawnEnemies() {

	enemyCount = 20;
	setInterval(() => {
		if (enemies.length < enemyCount) {
			enemies.push(new Enemy(Math.floor(Math.random() * 7680),Math.floor(Math.random() * 7680), 100))
			//enemies.push(new Enemy(3840,3840))
		}
	}, 1)

}


function changeEnemiesDirection() {
	setInterval(()=> {
		for (let i = 0; i < enemies.length; i++) {
			enemies[i].changeVelo(2, -2)
		}
		//console.log(`Execution time: ${(Math.round((end - start) * 100) / 100)} ms`)
	}, 1000)
}


function updateEnemies(enemy, i) {
	for (let c = 0; c < players.length; c++) {
		const renderDistance = Math.hypot(players[c].x - (enemy.x), players[c].y - (enemy.y))
		if (renderDistance < 1000) {
			enemy.update()
		}
	}
	



	if (enemy.health <= 0) {
		setTimeout(() => {
			enemies.splice(i, 1)	
		}, 0)
	}

	gameState.enemies[i] = {x: enemy.x,y: enemy.y, health: enemy.health}
}


changeEnemiesDirection()
spawnEnemies()
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
//-------------------------------------------------- PLAYERS-------------------------------------------------
function updatePlayers(player, i) {
	for (let c = 0; c < players.length; c++) {
		if (player.id == players[c].id) {
			player.index = c
		}
	}
	player.update()
	gameState.players[i] = {x:player.x, y:player.y, health:player.health, direction:player.direction, projectiles:player.projectiles, name:player.name, level:player.level, id:player.id, xp:player.experience}
	
} 


function healthRegen() {
	setInterval(() => {
		for (let i = 0; i < players.length; i++) {
			if (players[i].health < 100) {
				players[i].health += 5
			}
		}
		for (let i = 0;i < enemies.length; i++) {
			if (enemies[i].health < 100) {
				enemies[i].health += 5
			}
		}
		
		
	}, 10000)
}

healthRegen()





var start;
var end;
let gameState = {
	"method": "game-state",
	"players": [],
	"enemies":[],
	"projectiles":[],
}
//---------------server game loop ----------------
setInterval(() => {

	//start = performance.now();
	for (let i = 0; i < players.length; i++) {
		updatePlayers(players[i], i)		
	}

	for (let i = 0; i < enemies.length; i++) {
		updateEnemies(enemies[i], i)
	}

	updateProjectiles()
	
	for (let i=0; i < clients.length; i++) {
        clients[i].connection.send(JSON.stringify(gameState))
    }
	//end = performance.now();
	
}, 9)

//instrument(io, {auth:false})Math.round(num * 100) / 100

