
let View = {
	displayMessage: function(msg) {
		let mesageArea = document.getElementById("messageArea");
		mesageArea.innerHTML = msg;
	},
	displayHit: function(coor) {
		let hitCell = document.getElementById(coor);
		hitCell.setAttribute("class", "hit");
	},
	displayMiss: function(coor) {
		let missCell = document.getElementById(coor);
		missCell.setAttribute("class", "miss"); 
	}
}

let Model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,
	cheatLocation: [],
	shipPosBank: [],
	ships: [{pos: [], hit: [false, false, false]},
			{pos: [], hit: [false, false, false]},
			{pos: [], hit: [false, false, false]}],

	createPosBank: function() {
		for (let i = 0; i < this.boardSize; i++) {
			for (let j = 0; j < this.boardSize; j++) {
				if (i < this.boardSize - 2) {
					let first = String(i) + String(j);
					let second = String(i + 1) + String(j);
					let third = String(i + 2) + String(j);
					let pos = [first, second, third];
					this.shipPosBank.push(pos);
				}
				if (j < this.boardSize - 2) {
					let first = String(i) + String(j);
					let second = String(i) + String(j + 1);
					let third = String(i) + String(j + 2);
					let pos = [first, second, third];
					this.shipPosBank.push(pos);
				}
			}
		}
	},
	initShipPos: function() {
		this.createPosBank();      
		for (let i = 0; i < this.numShips; i++) {
			let pickPos = Math.floor(Math.random() * this.shipPosBank.length);
			for (j = 0; j < this.shipLength; j++) {
				this.ships[i].pos.push(this.shipPosBank[pickPos][j]);	
			}
			for (j = 0; j < this.shipLength; j++) {
				let location = this.ships[i].pos[j];
				for (let k = 0; k < this.shipPosBank.length; k++) {
					if (this.shipPosBank[k] != undefined) {
						if (this.shipPosBank[k].indexOf(location) != -1) {
							this.shipPosBank[k] = undefined;
						}
					}
				}
			}
			this.resetBank(this.shipPosBank);      
		}   
	},
	resetBank: function(bank) {   
		let temp = bank;
		this.shipPosBank = [];
		for (let i = 0; i < temp.length; i++) {
			if (temp[i] != undefined) {
				this.shipPosBank.push(temp[i]);
			}
		}
	},
	fire: function(guess) {
		for (let j = 0; j < this.shipPosBank.length; j++) {
			if (this.shipPosBank[j] != undefined) {
				if(this.shipPosBank[j].indexOf(guess) != -1) {
					this.shipPosBank[j] = undefined;
				}
			}
		}
		this.resetBank(this.shipPosBank);

		for (let i = 0; i < this.numShips; i++) {
			let ship = this.ships[i];
			let index = ship.pos.indexOf(guess);
			if (index != -1) {

				
				if (this.shipsSunk == 2 && Controller.guesses < 18 && this.shipPosBank.length > 0) {
					let next = Math.floor(Math.random() * this.shipPosBank.length);
					this.cheatLocation = this.shipPosBank[next];
					ship.pos = this.cheatLocation;
					View.displayMiss(guess);
					View.displayMessage("You missed.");
					return false;
				}
				

				ship.hit[index] = true;
				View.displayHit(guess);
				View.displayMessage("HIT!");
				if (this.isSunk(ship)) {
					View.displayMessage("You sank my battleship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		View.displayMiss(guess);
		View.displayMessage("You missed.");
		return false;
	},
	isSunk: function(ship) {
		for (let i = 0; i < this.shipLength; i++) {
			if (!ship.hit[i]) {
				return false;
			}
		}
		return true;
	}
}

let Controller = {
	guesses: 0,
	prevGuess: new Set(),
	guessIsValid: function(guess) {
		if (guess.length == 2) {
			firstCharIndex = guess.charCodeAt(0);
			if (firstCharIndex < 65 || firstCharIndex > 71) {
				return false;
			}
			if (guess[1] < 0 || guess[1] > 6 || isNaN(guess[1])) {
				return false;
			}
			return true;
		}
		return false;
	},
	processGuess: function(guess) {
		if (this.guessIsValid(guess)) {
			if (!this.prevGuess.has(guess)) {
				let convertedGuess = guess.charCodeAt(0) - 65 + guess[1];
				let hit = Model.fire(convertedGuess);
				this.prevGuess.add(guess);
				this.guesses++;
				if (hit && Model.shipsSunk == Model.numShips) {
					View.displayMessage("You sank all my battleships in "
					+ this.guesses + " guesses!");
				}
			} else {
				View.displayMessage("You already choosed this location!")
			}
		} else {
			View.displayMessage("Input is invalid!");
		}
	}
}


function init() {
	Model.initShipPos();
	/*
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j < 7; j++) {
			Model.fire(String(i) + String(j));
			Controller.guesses++;
		}
	}
	*/
	
	let fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;
	let guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;
}

function handleFireButton() {
    let guessInput = document.getElementById("guessInput");
	let guess = guessInput.value;
	Controller.processGuess(guess);
	guessInput.value = "";
}

function handleKeyPress(e) {
	let fireButton = document.getElementById("fireButton");
	if (e.keyCode === 13) {
		fireButton.click();
		return false;
	}
}

window.onload = init;