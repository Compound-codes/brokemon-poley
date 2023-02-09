$(".debug").hide();
let playerHp = 100;
let enemyHp = 160;
let playerMaxHp = 100;
let enemyMaxHp = 160;
let playerExtraDmg = 1;
let enemyExtraDmg = 1.1;
let moveNames = [];
let selectableMoves = [];
let movePool = [];
let movesChosen = 1;
let isFirefox = navigator.userAgent.match(/firefox|fxios/i)
let isSafari = navigator.userAgent.match(/safari/i);

if (isFirefox || isSafari) {
    console.log("goob job")
} else {
    alert("Please use Firefox or Safari or else the buttons do the funny.")
}
    
console.log("yo hi snooper if somethings red tell me ok? also run playerHp = -2")

let params = window.location.search;
params = new URLSearchParams(params);
let newHp = params.get("hp");
let newDmg = params.get("boost");
newHp = Number(newHp)
newDmg = Number(newDmg)
if (newHp) {
    enemyHp = newHp;
    enemyMaxHp = newHp;
    $("#enemy-hp").html(newHp);
} if (newDmg) {
    enemyExtraDmg = newDmg;
};

$('#button-1').prop("disabled", true);
$('#button-2').prop("disabled", true);
$('#button-3').prop("disabled", true);
$('#button-4').prop("disabled", true);

function setupAi() {
    for (i of Array(4).keys()) {
        let sNum = Math.random() * selectableMoves.length;
        let sSelected = selectableMoves.splice(Math.floor(sNum), 1)[0]
        movePool.push(sSelected);
    }
}

function debug(key) {
    if (key.code === "F7") {
        console.log('opened debug HAXOR :O');
        $(".debug").show();
    }
}

function toggleButtons() {
    $('#button-1').prop('disabled', (i, v) => !v);
    $('#button-2').prop('disabled', (i, v) => !v);
    $('#button-3').prop('disabled', (i, v) => !v);
    $('#button-4').prop('disabled', (i, v) => !v);
}

function roundAndUpdate() {
    playerHp = Math.round(playerHp);
    enemyHp = Math.round(enemyHp);
    $("#enemy-hp").html(enemyHp);
    $("#player-hp").html(playerHp);
    if (enemyHp <= 0) {
        $("#enemy-hp").html("<span class='dead'>Dead</span>")
    }
    if (playerHp <= 0) {
        $("#player-hp").html("<span class='dead'>Dead</span>")
    }
}

function display(top, bottom) {
    $("#top-bar").html("| " + top);
    $("#bottom-bar").html("| " + bottom);
}

function moveAi() {
    let num = Math.random() * movePool.length;
    let selected = movePool[Math.floor(num)];
    eval(`${selected}.useMove("enemy")`)
}

function loop1() {
    if (playerHp > 0 && enemyHp > 0) {
        display("Your turn!", "")
        toggleButtons()
    } else {
        setTimeout(handleWin, 1000)
    }
}

function loop2() {
    if(playerHp > 0 && enemyHp > 0) {
        display("Enemy turn!", "")
        setTimeout(loop3, 1000)
    } else {
        setTimeout(handleWin, 1000)
    }
}

function loop3() {
    moveAi()
    setTimeout(loop1, 1500)
}

function handleWin() {
    if (playerHp >= enemyHp) {
        display("You win!", "Good job!")
    } else {
        display("You lost.", "sad")
    }
}

function evalUse(name, user) {
    eval(`${name}.useMove("${user}")`)
}

class Move {
    constructor(name, dmg, target, effect, heal, codeName) {
        this.name = name;
        this.dmg = dmg;
        if (target != "$D") {
            this.target = target;
            this.effect = effect;
        }
        this.heal = heal;
        if (heal >= 0) {
            this.healType = "heal";
        } else {
            this.healType = "recoil";
        };
        this.codeName = codeName;
        moveNames.push(codeName);
        selectableMoves = [...moveNames]
        this.addFunction = `${codeName}.addToMoves()`
        this.useFunction = `${codeName}.useMove("player")`
        $("#moveSelector").append(`<button class="move" id="add-${codeName}" onclick="${this.addFunction}">${name}</button>`)
    }
    
    addToMoves() {
        $(`#button-${movesChosen}`).html(this.name);
        $(`#button-${movesChosen}`).attr("onclick", `${this.useFunction}`)
        movesChosen += 1;
        $(`#add-${this.codeName}`).remove();
        if (movesChosen === 5) {
            $("#moveSelector").remove();
            loop1();
        }
    }

    useMove(user) {
        switch (user) {
            case "player":
                let pDamageDealt = this.dmg * playerExtraDmg;
                let randomDamageBoost = Math.random() / 5
                randomDamageBoost += 0.9
                pDamageDealt *= randomDamageBoost
                enemyHp -= pDamageDealt;
                playerHp += this.heal * playerExtraDmg;
                playerHp = Math.min(playerHp, playerMaxHp);
                if (this.target === "user") {
                    playerExtraDmg += this.effect;
                } else if (this.target === "enemy") {
                    enemyExtraDmg += this.effect;
                }

                if (this.dmg != 0 && this.heal >= 0) {
                    display(`You used ${this.name}!`, `It dealt ${Math.round(pDamageDealt)} damage.`)
                } else if (this.target === "user") {
                    display(`You used ${this.name}!`, `Your attack increased by ${this.effect * 100}%.`)
                } else if (this.target === "enemy") {
                    display(`You used ${this.name}!`, `The opponent's attack decreased by ${this.effect * -100}%.`)
                } else if (this.heal > 0) {
                    display(`You used ${this.name}!`, `It brought your HP back up to ${Math.round(playerHp)}.`)
                } else if (this.heal < 0) {
                    display(`You use ${this.name}!`,  `It dealt ${Math.round(pDamageDealt)} damage with ${Math.round(this.heal * playerExtraDmg * -1)} recoil.`)
                }
                toggleButtons();
                setTimeout(loop2, 1500)
                break;
            case "enemy":
                let eDamageDealt = this.dmg * enemyExtraDmg;
                let eRandomDamageBoost = Math.random() / 5
                eRandomDamageBoost  += 0.9
                eDamageDealt *= eRandomDamageBoost
                playerHp -= eDamageDealt;
                enemyHp += this.heal * enemyExtraDmg;
                enemyHp = Math.min(enemyHp, enemyMaxHp);
                if (this.target === "user") {
                    enemyExtraDmg += this.effect;
                } else if (this.target === "enemy") {
                    playerExtraDmg += this.effect;
                }
                if (this.dmg != 0 && this.heal >= 0) {
                    display(`The opponent used ${this.name}!`, `It dealt ${Math.round(eDamageDealt)} damage.`)
                } else if (this.target === "user") {
                    display(`The opponent used ${this.name}!`, `The opponent's attack increased by ${this.effect * 100}%.`)
                } else if (this.target === "enemy") {
                    display(`The opponent used used ${this.name}!`, `Your  attack decreased by ${this.effect * -100}%.`)
                } else if (this.heal > 0) {
                    display(`The opponent used ${this.name}!`, `It brought its HP back up to ${Math.round(enemyHp)}.`)
                } else if (this.heal < 0) {
                    display(`The opponent used ${this.name}!`,  `It dealt ${Math.round(eDamageDealt)} damage with ${Math.round(this.heal * enemyExtraDmg * -1)} recoil.`)
                }

                break;
        }
    roundAndUpdate()
    }

}

// let name = new Move("name", dmg, effectTarget, effectPower, heal, "codename")
let bonk = new Move("Bonk", 40, "$D", 0, 0, "bonk");
let stronk = new Move("Stronkify", 0, "user", 0.2, 0, "stronk");
let belittle = new Move("Belittle", 0, "enemy", -0.15, 0, "belittle");
let tickle = new Move("Tickle", 10, "enemy", -0.1, 0, "tickle");
let lick = new Move("Lick Wounds", 0, "$D", 0, 30, "lick");
let hyperbonk = new Move("HYPERBONK", 50, "$D", 0, -30, "hyperbonk")
// Kalob was a special child. He belittled people so they could not lick their wounds using a baseball bat to bonk them
document.addEventListener("keydown", debug)
setupAi()