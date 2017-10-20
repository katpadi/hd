var game = new Phaser.Game(800, 600, Phaser.AUTO, 'screen', { preload: preload, create: create, update: update });

//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = {
    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Press Start 2P']
    }

};

function preload() {
    //  Load the Google WebFont Loader script
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.image('bullet', 'assets/fiyah.png');
    game.load.image('yosi', 'assets/cigarette.png');
    game.load.image('blueBullet', 'assets/bullet.png');
    game.load.image('heartBullet', 'assets/heart.png');
    game.load.image('boucingBullet', 'assets/enemy-bullet.png');
    game.load.spritesheet('invader', 'assets/hearts.png', 31, 31);
    game.load.image('ship', 'assets/pig_chef.png');
    game.load.spritesheet('piggy', 'assets/hd_pig_01.png', 32, 32);
    game.load.image('food', 'assets/burger.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.spritesheet('explode2', 'assets/explode2.png', 25, 25);
    game.load.image('starfield', 'assets/starfield.png');
    game.load.audio('bass', 'assets/bass.mp3');
    game.load.audio('shot', 'assets/enemy-fire.wav');
    game.load.audio('hit', 'assets/hit.wav');
    game.load.audio('powerup', 'assets/powerup.wav');
    game.load.audio('gg', 'assets/gg.mp3');

}

var player;
var hearts;
var bullets;
var heartBullets;
var boucingBullets;
var bass;
var hit;
var shot;
var gg;
var powerup;
var bulletTime = 0;
var cursors;
var fireButton;
var creditsButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var heartBullet;
var firingTimer = 0;
var specialFiringTimer = 0;
var stateText;
var livingEnemies = [];
var level = 1;
var levelText;
var introText;
var bouncyCount = 0;
var specialTimer = 9999;
var cursorVelocity = 200;
var food;
var foodCount = 0;
var foodTimer = 9999;
var foodEatenText;
var gameStarted = false; 
var highScore = getHighScore();
var highScoreText = '';
var normalBulletFlag = true;
var yosi;
var yosiTimer = 9999;
var yosiCount = 0;
var explosions2;

// Settings
var explosionPoolCount = 30;
var enemyBulletsPoolCount = 30;
var specialEnemyBulletsPoolCount = 30;
var bulletsPoolCount = 30;

var baseCursorVelocity = 200;
var velocityIncrease = 100;
var speedUpEveryXLevel = 2;

var cursorConfig = {
    base: 200,
    increase: 100,
    increaseEveryXLevel: 3    
}

function create() {
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.minWidth = 240;
    this.scale.minHeight = 170;
    this.scale.maxWidth = 800;
    this.scale.maxHeight = 600;

    //screen size will be set automatically
    this.scale.updateLayout(true);

    game.scale.pageAlignHorizontally = true;

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    introText = game.add.text(game.world.centerX, 400, 'Click To Start', { font: "30px Press Start 2P", fill: "#FFCC33", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    // Sound
    bass = game.add.audio('bass');
    shot = game.add.audio('shot');
    hit = game.add.audio('hit');
    gg = game.add.audio('gg');
    powerup = game.add.audio('powerup');

    //  heartbreaker's bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    // heartbreaker's blue bullets
    blueBullets = game.add.group();
    blueBullets.enableBody = true;
    blueBullets.physicsBodyType = Phaser.Physics.ARCADE;

    // The enemy's bullets
    heartBullets = game.add.group();
    heartBullets.enableBody = true;
    heartBullets.physicsBodyType = Phaser.Physics.ARCADE;
    
    // The bouncing enemy bullets
    boucingBullets = game.add.group();
    boucingBullets.enableBody = true;
    boucingBullets.physicsBodyType = Phaser.Physics.ARCADE;

    game.input.onTap.addOnce(actuallyStartGame, this);
    game.input.keyboard.onDownCallback = actuallyStartGame;

    //  The destroyer!
    player = game.add.sprite(400, 500, 'piggy')
    player.anchor.setTo(0.5, 0.5);
    player.animations.add('fly', [ 0, 1], 3, true);
    player.play('fly');
    
    game.physics.enable(player, Phaser.Physics.ARCADE);
    // Do not allow passing through world bounds
    player.body.collideWorldBounds = true;

    //  The hearts!
    hearts = game.add.group();
    hearts.enableBody = true;
    hearts.physicsBodyType = Phaser.Physics.ARCADE;

    createHearts();
    
    //  The score
    scoreString = 'Hearts Destroyed: ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '10px Press Start 2P', fill: '#fff' });

    // Level
    levelText = game.add.text(10, 30, 'Level: ' + level, { font: '11px Press Start 2P', fill: '#fff' });

    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives: ', { font: '10px Press Start 2P', fill: '#fff' });

    // Katpadi
    game.add.text(game.world.width - 100, game.world.height - 15, '@katpadi', { font: '10px Press Start 2P', fill: '#fff' });
    
    // High score
    highScoreText = game.add.text(10, game.world.height - 15, 'High Score: ' + getHighScore(), { font: '10px Press Start 2P', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '25px Press Start 2P', fill: '#FFCC33', align: "center" });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;
    
    //playerDisplay = game.add.sprite(game.world.centerX,game.world.centerY, 'ship');

    
    for (var i = 0; i < 3; i++)
    {
        var pig_chef_life = lives.create(game.world.width - 100 + 6 + (20 * i), 35, 'piggy');
        pig_chef_life.scale.setTo(0.75, 0.75);
        pig_chef_life.anchor.setTo(0.5, 0.5);
        pig_chef_life.alpha = 0.7;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    explosions2 = game.add.group();
    explosions2.createMultiple(30, 'explode2');
    explosions2.forEach(setupPigExplosion, this);

    
    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    creditsButton = game.input.keyboard.addKey(Phaser.Keyboard.C);
}

function actuallyStartGame() {
    game.input.keyboard.onDownCallback = null;
    introText.visible = false;

    player.anchor.setTo(0.5, 0.5);
    
    // Sound
    bass.loopFull(0.6);
    bass.onLoop;

    heartBullets.createMultiple(30, 'heartBullet');
    heartBullets.setAll('anchor.x', 0.5);
    heartBullets.setAll('anchor.y', 1);
    heartBullets.setAll('outOfBoundsKill', true);
    heartBullets.setAll('checkWorldBounds', true);

    boucingBullets.createMultiple(30, 'boucingBullet');
    boucingBullets.setAll('anchor.x', 1);
    boucingBullets.setAll('anchor.y', 1);
    boucingBullets.setAll('outOfBoundsKill', false);
    boucingBullets.setAll('checkWorldBounds', false);

    bullets.createMultiple(bulletsPoolCount, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    
    blueBullets.createMultiple(30, 'blueBullet');
    blueBullets.setAll('anchor.x', 0.5);
    blueBullets.setAll('anchor.y', 1);
    blueBullets.setAll('outOfBoundsKill', true);
    blueBullets.setAll('checkWorldBounds', true);
    
    foodTimer = game.time.now + pickRandomDelay();
    specialTimer = game.time.now + pickRandomDelay() + pickRandomDelay();
    
    gameStarted = true;
}

function createHearts () {

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = hearts.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 1], 2, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }

    hearts.x = 100;
    hearts.y = 80;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to,
    // rather than the invaders directly.
    var tween = game.add.tween(hearts).to( { x: 250 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function setupPigExplosion (pig) {

    pig.anchor.x = 1;
    pig.anchor.y = 1;
    pig.animations.add('kaboom');

}

function descend() {

    hearts.y += 10;

}

function update() {
    //  Scroll the background
    starfield.tilePosition.y += 2;

    if (player.alive && gameStarted)
    {
        //  Reset the player, then check for movement keys
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -cursorVelocity;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = cursorVelocity;
        }

        //  Firing?
        if (fireButton.isDown)
        {
            fireBullet();
        }

        if(level > foodCount) {
            if (game.time.now > foodTimer) {
                foodPopper();
            }
        }

        if(level > yosiCount) {
            if (game.time.now > yosiTimer) {
                yosiPopper();
            }
        }
        
        if (level > bouncyCount )
        {
            if (game.time.now > specialTimer) {
                specialFiyah();
            }

        }

        if (game.time.now > firingTimer)
        {
            enemyFires();
        }

        //  Run collision
        game.physics.arcade.overlap(bullets, hearts, collisionHandler, null, this);
        game.physics.arcade.overlap(heartBullets, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(boucingBullets, player, specialBulletHitsPlayer, null, this);
        game.physics.arcade.overlap(player, food, playerEatsFood, null, this);
    }

}

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 10;
    shot.play();
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    // Means you won the level
    if (hearts.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        stateText.text = "Gratz!\nYou're an awesome heartbreaker!\n\nClick or Press Up to level up.";
        stateText.visible = true;

        heartBullets.forEach(function (c) { c.kill(); });
        boucingBullets.forEach(function (c) { c.kill(); });
        
        //the "click to restart" handler
        var nextLevelBtn = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        nextLevelBtn.onDown.addOnce(nextLevel, this);
        game.input.onTap.addOnce(nextLevel,this);
    }

}

function specialBulletHitsPlayer (player, bullet) {
    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);
    hit.play();

    // When the player dies
    if (lives.countLiving() < 1)
    {
        gameOver();
    }

}

function enemyHitsPlayer (player,bullet) {

    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }

    //  And create an explosion :)
    var explosion = explosions2.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);
    hit.play();

    // When the player dies
    if (lives.countLiving() < 1)
    {
        gameOver();
    }

}

function playerEatsFood () {
    food.kill();
    var txt = game.add.text(player.body.x + 15, player.body.y + 25, '+50', { font: '10px Press Start 2P', fill: '#ff0' });
    var tween = game.add.tween(txt).to( { y: player.body.y - 50, x: player.body.x + 20, alpha: 1 }, 2000, Phaser.Easing.Linear.Out, true);
    tween.onComplete.add(function() { 
        txt.visible = false; 
    }, this);    
    
    powerup.play();
    score += 50;

}

function yosiPopper() {
    yosiCount++;
    yosi = game.add.sprite(game.rnd.integerInRange(50, game.width-10), 50, 'yosi');
    game.physics.enable(yosi, Phaser.Physics.ARCADE);
    
    var tween = game.add.tween(yosi.body).to( { y: player.body.y }, 1000, Phaser.Easing.Exponential.None, true);
    tween.onComplete.add(fadeYosi, this);
    
    yosiTimer = game.time.now + pickRandomDelay();
}
function fadeYosi() {
    var tween = game.add.tween(food).to( { alpha: 0 }, 3000, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(function () { yosi.kill(); }, this);
}

function foodPopper() {
    foodCount++;
    food = game.add.sprite(game.rnd.integerInRange(50, game.width-20), 50, 'food');
    food.scale.setTo(0.75, 0.75);
    
    game.physics.enable(food, Phaser.Physics.ARCADE);
    
    var tween = game.add.tween(food.body).to( { y: player.body.y }, 3000, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(fadeFood, this);
    foodTimer = game.time.now + pickRandomDelay();
}

function fadeFood() {
    var tween = game.add.tween(food).to( { alpha: 0 }, 4000, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(function () { food.kill(); }, this);
}

function getHighScore() {
    var hs = localStorage.getItem('highScore');
    if(hs === null){
        return 0;
    }
    else {
        return hs;
    }
}

function gameOver() {
    player.kill();
    gg.play();
    heartBullets.forEach(function (c) { c.kill(); });
    boucingBullets.forEach(function (c) { c.kill(); });

    stateText.text="YOU SUCK.\n\nClick to restart.";
    stateText.visible = true;

    if(score > getHighScore()){
        localStorage.setItem('highScore', score);

    }
    highScoreText.text = 'High Score: ' + getHighScore();
    //the "click to restart" handler
    game.input.onTap.addOnce(restart,this);
    bouncyCount = 0;
}

function specialFiyah() {
    boucingBullet = boucingBullets.getFirstExists(false);
    if (boucingBullet)
    {
        boucingBullet.body.velocity.setTo(200, 200);

        //  This makes the game world bounce-able
        boucingBullet.body.collideWorldBounds = true;

        //  This sets the image bounce energy for the horizontal
        //  and vertical vectors (as an x,y point). "1" is 100% energy return
        boucingBullet.body.bounce.setTo(1, 1);

        boucingBullet.reset(game.rnd.integerInRange(50, game.width-50), 50);
        //boucingBullet.lifespan = 10000 * level;
        bouncyCount ++;
        specialTimer = game.time.now + pickRandomDelay();
        
                             
        game.physics.arcade.moveToObject(boucingBullet, player, 200);
    }
}

function pickRandomDelay() {
    return Phaser.Timer.SECOND * game.rnd.integerInRange(2, 10);
}

function enemyFires () {

    //  Grab the first bullet we can from the pool
    heartBullet = heartBullets.getFirstExists(false);
    
    livingEnemies.length=0;

    hearts.forEachAlive(function(alien){
        // put every living enemy in an array
        livingEnemies.push(alien);
    });

    if (heartBullet && livingEnemies.length > 0)
    {
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        heartBullet.reset(shooter.body.x, shooter.body.y + 10);

        game.physics.arcade.moveToObject(heartBullet,player, (level * 100) );
        firingTimer = game.time.now + 2000;
    }

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        if(normalBulletFlag) {
            bullet = bullets.getFirstExists(false);
            bullet.angle = -90;
        }
        else {
            bullet = blueBullets.getFirstExists(false);
        }
        
        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 300;
        }
    }

}

function restart () {
    level = 1;
    levelText.text = 'Level: ' + level;
    bouncyCount = 0;
    // Reset score
    score = 0;
    scoreText.text = scoreString + score;

    //resets the life count
    lives.callAll('revive');
    //  And brings the hearts back from the dead :)
    hearts.removeAll();
    createHearts();
    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;
}

//  A new level starts
function nextLevel () {
    //  And brings the hearts back from the dead :)
    hearts.removeAll();
    createHearts();

    //revives the player
    player.revive();
    bouncyCount = 0;
    foodCount = 0;
    level++;
    
    // Hide congratulatory text
    stateText.visible = false;
    
    // Update level on upper left
    levelText.text = 'Level: ' + level;

    specialTimer = game.time.now + pickRandomDelay();
    foodTimer = game.time.now + pickRandomDelay();
    
    // Slightly increase velocity of cursor
    cursorVelocity = cursorConfig.base + (Math.floor(level/cursorConfig.increaseEveryXLevel) * cursorConfig.increase); 
}
