var player = {
    currencies: {
        matter: new ExpantaNum("10"), // Matter amount.
    },

    generators: {
        normal: {
            1: {                                        // Same thing for all the generators.
                amnt: new ExpantaNum("0"),             // Amount.
                bght: new ExpantaNum("0"),            // Bought.
                mult: new ExpantaNum("1"),           // Multiplier.
                bost: new ExpantaNum("1"),          // Boost.
                cost: new ExpantaNum("10"),        // Cost.
                icst: new ExpantaNum("10"),       // Initial cost.
                visb: false,                     // Visibility.
            },

            2: {
                amnt: new ExpantaNum("0"),
                bght: new ExpantaNum("0"),
                mult: new ExpantaNum("1"),
                bost: new ExpantaNum("1"),
                cost: new ExpantaNum("100"),
                icst: new ExpantaNum("100"),
                visb: false,
            },

            3: {
                amnt: new ExpantaNum("0"),
                bght: new ExpantaNum("0"),
                mult: new ExpantaNum("1"),
                bost: new ExpantaNum("1"),
                cost: new ExpantaNum("10000"),
                icst: new ExpantaNum("10000"),
                visb: false,
            },

            4: {
                amnt: new ExpantaNum("0"),
                bght: new ExpantaNum("0"),
                mult: new ExpantaNum("1"),
                bost: new ExpantaNum("1"),
                cost: new ExpantaNum("1e6"),
                icst: new ExpantaNum("1e6"),
                visb: false,
            },

            total: 4,                                // Number of generators.
            shown: [],                              // Array of all the shown generators.
            coloredgens: 0,                        // Whether the generators are colored or not.
            boost: new ExpantaNum("1"),           // A boost to all of the generators.
            cgbm: new ExpantaNum("1"),           // Current gen booster multiplier.
            pgbm: new ExpantaNum("1"),          // Pending gen booster multiplier.
            vgbm: false,                       // Whether the gen booster multiplier button is visible or not.
            hung: 0,                          // Highest unlocked normal generator
        },
    },

    info: {
        sigdig: 3,                                                                // Significant digits (for scientific notation).
        lastUpdate: Date.now(),                                                  // Delta time related stuff.
        currentTab: {generators: true, options: false, statistics: false},		// For changing tabs.
    },

    stats: {
        mattertotal: new ExpantaNum("0"),             // All-time gained matter.
        highestmatter: new ExpantaNum("0"),          // Highest amount of matter you've ever gotten.
        spentmatter: new ExpantaNum("0"),           // The amount of matter that you've spent.
        gboostmatter: new ExpantaNum("0"),         // Matter gained in current genboost.
        gboosts: new ExpantaNum("0"),             // The amount of genboosts you've done.
    },

    unlocks: {
        progress: new ExpantaNum(0),
        list: [ // The first element is the requirement, the second is whether it is unlocked or not and the third is the name.
            [new ExpantaNum("1e10"), false, "Genboost"],
        ],

        percent: new ExpantaNum(0),
        unln: 0,
    }
}

function init() { // This function only runs once when the page is loaded.
    for (let i = 1; i <= player.generators.normal.total; i++) { // This colors all the generators in pastel colors. The only thing that varies from generator to generator is the hue.
        if (player.generators.normal.coloredgens < player.generators.normal.total) {
            var gencol = "hsl(" + (45 * (i - 1) + 0) + ", 100%, 77%)"
            document.getElementById("ng" + i + "mu").style.color = gencol

            player.generators.normal.coloredgens += 1
        }
    }

    for (let i = 1; i < player.generators.normal.total; i++) { // This makes it so all of the generator's (except 4th) percentages per second are invisible.
        document.getElementById("ng" + i + "pps").style.display = "none"
    }
}

function buynormalgen(n) { // Function for buying normal generators
    if (ExpantaNum.gte(player.currencies.matter, player.generators.normal[n].cost)) {
        player.generators.normal[n].amnt = ExpantaNum.add(player.generators.normal[n].amnt, "1")
        player.generators.normal[n].bght = ExpantaNum.add(player.generators.normal[n].bght, "1")

        player.currencies.matter = ExpantaNum.sub(player.currencies.matter, player.generators.normal[n].cost)
        player.stats.spentmatter = ExpantaNum.add(player.stats.spentmatter, player.generators.normal[n].cost)
        player.generators.normal[n].cost = ExpantaNum.pow(ExpantaNum.pow(100, n).mul(10), ExpantaNum.floor(ExpantaNum.div(player.generators.normal[n].bght, 10))).mul(player.generators.normal[n].icst)
    }
}

function maxnormalgen() { // Function to max out all gens. This prioritizes highest to lowest. [THIS WILL BE MASSIVELY OPTIMIZED IN THE NEAR FUTURE]
    for (i = 0; i < player.generators.normal.total; i++) {
        while (true) {
            if (ExpantaNum.lt(player.currencies.matter, player.generators.normal[4-i].cost)) {
                break
            }

            buynormalgen(4-i)
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key == "m" || event.key == "m") {
        maxnormalgen()
    }
}, false)

document.getElementById("importbox").addEventListener('click', (event) => {
    document.getElementById("importbox").value = ""
}, false)

function changeTab(tab) { // Changing tabs.
    for (const a in player.info.currentTab) {
        if (player.info.currentTab[a]) { // Make everything in the currentTab array false first.
            player.info.currentTab[a] = false
        }

        player.info.currentTab[tab] = true; // And then make the tab that you clicked true.
    }
}

function expimp(which) { // Exporting and importing (0 = export | 1 = import). Currently doesn't work.
    if (which === 0) {
        var exp = btoa(JSON.stringify(player))
        navigator.clipboard.writeText(exp).then(() => {
            alert('Succesfully copied to clipboard.')
        })} else {
            player = JSON.parse(atob(document.getElementById("importbox").value))
        }
}

function multgen(factor, gen = null) { // Multiply all generators (or a specific one)
    if (!gen) { 
        player.generators.normal.boost = ExpantaNum.mul(player.generators.normal.boost, factor)
    } else {
        player.generators.normal[gen].bost = ExpantaNum.mul(player.generators.normal[gen].bost, factor) // "bost" is not a typo, I tried to keep all generator variables at a maximum of 4 characters.
    }
}


function genBooster() {
    if (ExpantaNum.gte(player.generators.normal.pgbm, player.generators.normal.cgbm)) {
        multgen(ExpantaNum.div(player.generators.normal.pgbm, player.generators.normal.cgbm))
        for (let i = 1; i <= player.generators.normal.total; i++) {
            player.generators.normal[i].bght = new ExpantaNum("0")
            player.generators.normal[i].amnt = new ExpantaNum("0")
        }
    
        player.generators.normal.cgbm = player.generators.normal.pgbm
        player.currencies.matter = new ExpantaNum("10")
        player.stats.gboostmatter = new ExpantaNum("0")
        player.stats.gboosts = ExpantaNum.add(player.stats.gboosts, 1)
    }
}

function format(a,  digits = player.info.sigdig - 1, b1kfixed = true) { // Formatting ExpantaNum numbers. "b1kfixed" means "below 1,000 fixed".
    if (!a.array[1]) {
        var a01 = a.array[0][1]
        if (a01 < 1e3) {
            if (b1kfixed == true) {
                return (a01.toFixed(digits))
            } else {
                return (a01)
            }
        } else if (a01 < 1e9) {
            return (a01.toFixed(0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") // Formatting with commas.
        } else {
            return (a01/Math.pow(10, Math.floor(Math.log10(a01)))).toFixed(player.info.sigdig) + "×10<sup>" + Math.floor(Math.log10(a01)) + "</sup>" 
        } 
    } else {
        var a11 = a.array[1][1]
        var a01 = a.array[0][1]
        
        if (a11 == 1) {
            if (a01 < 1e9) {
                return Math.pow(10, (a01 - Math.floor(a01))).toFixed(player.info.sigdig) + "×10<sup>" + (Math.floor(a01)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "</sup>"
            } else {
                return (a01/Math.pow(10, Math.floor(Math.log10(a01)))).toFixed(player.info.sigdig) + "e<sub>" + (a11 + 1) + "</sub>" + Math.floor(Math.log10(a01))
            }
        } else {
            return "> 9.007e<sub>2</sub>15"
        }
    }
}

function prodloop(diff) { //
    player.currencies.matter = ExpantaNum.add(player.currencies.matter, ExpantaNum.mul(player.generators.normal[1].amnt, player.generators.normal[1].mult).mul(diff))
    player.stats.mattertotal = ExpantaNum.add(player.stats.mattertotal, ExpantaNum.mul(player.generators.normal[1].amnt, player.generators.normal[1].mult).mul(diff))
    player.stats.gboostmatter = ExpantaNum.add(player.stats.gboostmatter, ExpantaNum.mul(player.generators.normal[1].amnt, player.generators.normal[1].mult).mul(diff))
   
    for (let i = 2; i <= player.generators.normal.total; i++) {
        player.generators.normal[i - 1].amnt = ExpantaNum.add(player.generators.normal[i - 1].amnt, ExpantaNum.mul(player.generators.normal[i].amnt, ExpantaNum.mul(player.generators.normal[i].mult, diff / 10)))
    }
}

function arrayElementCheck(a) {
    return arr.every(element => element === true);
}

function update() {
    for (let i = 1; i <= player.generators.normal.total; i++) {
        if (player.generators.normal[i].visb == false && ExpantaNum.gte(player.currencies.matter, ExpantaNum.div(player.generators.normal[i].icst, 2))) { // Generator visibility
            player.generators.normal[i].visb = true
            player.generators.normal.shown.push(i)
        }

        if (ExpantaNum.gte(player.currencies.matter, player.generators.normal[i].cost)) {
            document.getElementById("genBtn" + i).classList.remove("unbuyable")
        } else {
            document.getElementById("genBtn" + i).classList.add("unbuyable")
        }

        player.generators.normal[i].cost = ExpantaNum.pow(ExpantaNum.pow(100, i).mul(10), ExpantaNum.floor(ExpantaNum.div(player.generators.normal[i].bght, 10))).mul(player.generators.normal[i].icst)
        player.generators.normal[i].mult = (ExpantaNum.pow(2.5, ExpantaNum.floor(ExpantaNum.div(player.generators.normal[i].bght, 10)))).mul(ExpantaNum.mul(player.generators.normal.boost, player.generators.normal[i].bost))

        document.getElementById("gen" + i).style.display = (player.generators.normal[i].visb) ? "revert" : "none"
        document.getElementById("ng" + i + "mu").innerHTML =  "x" + format(player.generators.normal[i].mult, 3)
        document.getElementById("ng" + i + "am").innerHTML = format(player.generators.normal[i].amnt)
        document.getElementById("ng" + i + "bg").innerHTML = "[" + format(player.generators.normal[i].bght, false) + "]"
        document.getElementById("ng" + i + "pr").innerHTML = format(player.generators.normal[i].cost, false)
    }

    for (var i = 1; i < player.generators.normal.total; i++) {
        var shown2 = player.generators.normal.shown.slice(0)
        shown2.pop()
        var aps = ExpantaNum.mul(player.generators.normal[i+1].amnt, player.generators.normal[i+1].mult) // Amount per second.
        var genpercent = (ExpantaNum.gt(aps, 0)) ? ExpantaNum.div(aps, player.generators.normal[i].amnt).mul(10) : new ExpantaNum(0)

        document.getElementById("ng" + i + "pps").innerHTML = "(+" + format(genpercent) + "%/s)"
        
        if (shown2.length != 0) {
            for (const a in shown2) {
                document.getElementById("ng" + (shown2[a]) + "pps").style.display = "revert"
            }
        }
    }

    if (ExpantaNum.gte(player.stats.gboosts, 1) && document.getElementById("maxbtn").style.display == "none") {
        document.getElementById("maxbtn").style.display = "revert";
    }

    var ngen = player.generators.normal; // Just a little shortcut for the line related to "nextgenmatter".

    if (ExpantaNum.gt(player.currencies.matter, player.stats.highestmatter)) {
        player.stats.highestmatter = player.currencies.matter
    }

    player.generators.normal.pgbm = ExpantaNum.max(ExpantaNum.pow(ExpantaNum.sub(ExpantaNum.log10(ExpantaNum.max(player.currencies.matter, "1e10")), 9), 2), player.generators.normal.cgbm)

    if (ExpantaNum.gt(player.currencies.matter, "1e10")) {
        player.generators.normal.vgbm = true
    }

    if (player.unlocks.list[0][1]) {
        document.getElementById("gboostmatter").innerHTML = format(player.stats.gboostmatter)
        document.getElementById("currentgenbooster").innerHTML = format(player.generators.normal.cgbm, 3)
        document.getElementById("pendinggenbooster").innerHTML = format(player.generators.normal.pgbm, 3)
        document.getElementById("ratiogenbooster").innerHTML = format(ExpantaNum.div(player.generators.normal.pgbm, player.generators.normal.cgbm), 3) + "x"
        document.getElementById("genboostamt").innerHTML = format(player.stats.gboosts, false)
        document.getElementById("gbooststats").style.display = "revert"
        document.getElementById('genboosterdiv').style.display = "revert"
    } else {
        document.getElementById("gbooststats").style.display = "none"
        document.getElementById('genboosterdiv').style.display = "none"
    }

    for (let i = 0; i < player.unlocks.list.length; i++) {
        if (i === player.unlocks.unln && player.unlocks.unln != 1) {
            if (ExpantaNum.gte(player.currencies.matter, player.unlocks.list[i][0])) {
                player.unlocks.unln += 1
                player.unlocks.list[i][1] = true
                console.log(player.unlocks.list[i][1])
            }

            document.getElementById("progtext").innerHTML = player.unlocks.percent.toFixed(2) + "%"
            document.getElementById("whatunlocks").innerHTML = player.unlocks.list[i][2]
            document.getElementById("unlreq").innerHTML = "Requires → " + format(player.unlocks.list[i][0]) + " matter."
            player.unlocks.percent = ExpantaNum.max(ExpantaNum.min(ExpantaNum.div(ExpantaNum.log10(player.currencies.matter), ExpantaNum.log10(player.unlocks.list[i][0])).mul(100), 100), 0)
        } else {
            document.getElementById("progtext").innerHTML = "Completed."
            document.getElementById("whatunlocks").innerHTML = "Nothing left."
            document.getElementById("unlreq").innerHTML = "─"
            player.unlocks.percent = 100
        }
    } 

    document.getElementById("nextgenmatter").innerHTML = (player.generators.normal.shown.length < 4) ? "The next generator will show up when you get to " + format(ExpantaNum.div(ngen[ngen.shown[ngen.shown.length - 1] + 1].icst, 2), false) + " matter.": "All of the generators are visible."
    document.getElementById("matteramt").innerHTML = format(player.currencies.matter)
    document.getElementById("matterpersec").innerHTML = format((player.generators.normal[1].amnt).mul(player.generators.normal[1].mult))
    document.getElementById("allgainmatter").innerHTML = format(player.stats.mattertotal)
    document.getElementById("highestmatter").innerHTML = format(player.stats.highestmatter)
    document.getElementById("spentmatter").innerHTML = format(player.stats.spentmatter, false)
    document.getElementById("currprog").style.width = player.unlocks.percent + "%"
    
    for (const a in player.info.currentTab) {
        document.getElementById(a + "Tab").style.display = (player.info.currentTab[a]) ? "revert" : "none"
    }
}

function mainloop() {
    let diff = (Date.now() - player.info.lastUpdate) / 1000
    
    prodloop(diff)
    update()

    player.info.lastUpdate = Date.now()
}

init()

window.setInterval(mainloop, 1000/15)
