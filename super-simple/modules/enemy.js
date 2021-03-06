/* global createjs, $, superSimple, player, snap, enemyController */

////////////////////////
// ENEMY CLASS
////////////////////////

// Constructor
var Enemy = function(type, size, velocity, x) {
    this.type = type;
    this.color = type.color;
    this.size = size;
    this.velocity = velocity;
    this.x = x;
    this.y = 0 - this.size;
    this.rect = null;
    this.easel = null;
    // If it's been disposed
    this.disposed = false;
    // all the different enemy standardColor for the different enemies
    this.standardColor = "#339933";
    this.powerUpColors = ["#e60000", "#0033cc"];
    // Initialize
    this.init();
};

Enemy.getRandomType = function() {
    // Standard
    var standard = {
        id: 0,
        type: "standard",
        color: "#CC6699"
    };
    // Special
    var enemyTypes = [{
        id: 1,
        type: "speed",
        color: "#e60000" // red
    }, {
        id: 2,
        type: "invincible",
        color: "#0033cc" // blue
    }, {
        id: 3,
        type: "double",
        color: "#cc0099" // purple
    }];

    // 70% of the time it will be standard
    if (Math.random() > 0.1) {
        // return standard
        return standard;
    }
    else {
        // return random special
        var randNum = Math.floor(Math.random() * enemyTypes.length);
        return enemyTypes[randNum];
    }
};

// Prototype
var EnemyProto = {
    // Initializes the enemy
    init: function() {
        this.cache();
        // Add it to the stage
        superSimple.stage.addChild(this.easel); // not possible with Rectangle object
        // Set X
        this.easel.x = this.x;
        this.easel.y = this.y;
        // Start moving downwards
        this.slide(0, this.velocity);
    },
    cache: function() {
        // Create it
        this.rect = new createjs.Rectangle(0, 0, this.size, this.size);
        this.easel = new createjs.Shape();
        this.easel.graphics.beginFill(this.color).drawRect(0, 0, this.size, this.size);
    },
    getSize: function() {
        return this.size;
    },
    // Removes the enemy from the stage
    dispose: function() {
        if (!this.disposed) {
            // remove from stage
            superSimple.stage.removeChild(this.easel);
            // Set as disposed
            this.disposed = true;
            // remove from E controller
            enemyController.removeEnemy(this);
        }
    },
    // Moves the enemy
    move: function(x, y) {
        this.rect.y += y;
        this.easel.y += y;
        this.rect.x += x;
        this.easel.x += x;
    },
    // Keeps moving enemy in a direction
    slide: function(x, y) {
        var _this = this;
        this.slider = setInterval(function() {
            _this.move(x, y);
        }, 16);
    },
    // Stop sliding the enemy
    stop: function() {
        clearInterval(this.slider);
    },
    /* Sets the size of the enemy */
    setSize: function(size) {
        this.size = size;
        this.update();
    },
    // Make sure enemy rect has same values as easel
    correctRect: function() {
        this.rect.x = this.easel.x;
        this.rect.y = this.easel.y;
    },
    checkCollision: function() {
        // Correct Rect values
        this.correctRect();
        player.correctRect();
        var EcontainsP = this.rect.contains(player.easel.x, player.easel.y, player.size, player.size);
        var PcontainsE = player.rect.contains(this.easel.x, this.easel.y, this.size, this.size);
        /* enemy contains player */
        if (EcontainsP && !player.isInvincible()) {
            superSimple.controller.gameOver();
            snap.dead(player.easel.x, player.easel.y, player.size);
            return;
        }
        /* player contains enemy */
        else if (PcontainsE) {
            player.eat(this);
            this.dispose();
            snap.ate(this.easel.x, this.easel.y, this.size);
            return;
        }
    },
    tick: function() {
        this.correctRect();
        this.checkCollision();
        this._printDebug();
        this._checkOutOfBounds();
    },
    _checkOutOfBounds: function() {
        if (this.easel.y > 100 + superSimple.height) {
            this.dispose();
        }
    },
    // DEBUGGING STUFF
    _debug_text: null,
    _printDebug: function() {
        if (superSimple.DEBUG_MODE) {
            var str = "X: " + this.easel.x + " Y: " + this.easel.y;
            if (this._debug_text === null) {
                this._debug_text = new createjs.Text(str, "10px Arial", "#000000");
                this._debug_text.textBaseline = "alphabetic";
                superSimple.stage.addChild(this._debug_text);
            }
            else {
                this._debug_text.text = str;
                this._debug_text.x = this.easel.x;
                this._debug_text.y = this.easel.y;
            }
        }
    }
};

// Adds all of the functions in EnemyProto to the Enemy prototype object
$.extend(Enemy.prototype, EnemyProto);

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ End of section