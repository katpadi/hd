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
    game.load.image('enemyBullet', 'assets/heart.png');
    game.load.image('specialEnemyBullet', 'assets/enemy-bullet.png');
    game.load.spritesheet('invader', 'assets/hearts.png', 31, 31);
    game.load.image('ship', 'assets/player.png');
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    game.load.image('starfield', 'assets/starfield.png');
    game.load.audio('bass', 'assets/bass.mp3');
    game.load.audio('shot', 'assets/laser.wav');
    game.load.audio('hit', 'assets/hit.wav');

}

var player;
var hearts;
var bullets;
var enemyBullets;
var specialEnemyBullets;
var bass;
var hit;
var shot;
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
var enemyBullet;
var firingTimer = 0;
var specialFiringTimer = 0;
var stateText;
var livingEnemies = [];
var level = 1;
var levelText;
var introText;
var bouncyCount = 0;
var specialTimer = 0;

// Credits
var text;
var index = 0;
var line = '';
var content = [
    " ",
    "Thanks for playing.",
    " ",
    "This game is called...",
    " ",
    "The Heart Breaker",
];


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

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;

    // The bouncing enemy bullets
    specialEnemyBullets = game.add.group();
    specialEnemyBullets.enableBody = true;
    specialEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    
    game.input.onTap.addOnce(actuallyStartGame, this);
    game.input.keyboard.onDownCallback = actuallyStartGame;

    //  The destroyer!
    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);

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
    game.add.text(game.world.width - 100, game.world.height - 10, '@katpadi', { font: '10px Press Start 2P', fill: '#fff' });

    //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '25px Press Start 2P', fill: '#FFCC33', align: "center" });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++)
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 35, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 45;
        ship.alpha = 0.4;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    creditsButton = game.input.keyboard.addKey(Phaser.Keyboard.C);
}

function actuallyStartGame() {
    game.input.keyboard.onDownCallback = null;
    introText.visible = false;

    // Sound
    bass.loopFull(0.6);
    bass.onLoop;

    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);
    
    specialEnemyBullets.createMultiple(1, 'specialEnemyBullet');
    specialEnemyBullets.setAll('anchor.x', 1);
    specialEnemyBullets.setAll('anchor.y', 1);
    specialEnemyBullets.setAll('outOfBoundsKill', false);
    specialEnemyBullets.setAll('checkWorldBounds', false);
    
    
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
}

function createHearts () {

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = hearts.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0,1, 2, 1], 2, true);
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

function descend() {

    hearts.y += 10;

}

function update() {
    //  Scroll the background
    starfield.tilePosition.y += 2;
    var cursorVelocity = 200;
    // Slightly increase velocity of cursor
    if(level % 5 == 0) {
        cursorVelocity =+ 100;
    }
    if (player.alive)
    {
        //  Reset the player, then check for movement keys
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown)
        {
            player.body.velocity.x = cursorVelocity - (cursorVelocity * 2);
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
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
        game.physics.arcade.overlap(specialEnemyBullets, player, specialBulletHitsPlayer, null, this);
    }

}

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    shot.play();
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (hearts.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        level++;

        stateText.text = "Gratz!\nYou're an awesome heartbreaker!\n\nClick or Press Up to level up.";
        stateText.visible = true;

        enemyBullets.forEach(function (c) { c.kill(); });
        specialEnemyBullets.forEach(function (c) { c.kill(); });
        bouncyCount = level + 1;

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

function gameOver() {
    player.kill();
    enemyBullets.forEach(function (c) { c.kill(); });
    specialEnemyBullets.forEach(function (c) { c.kill(); });

    stateText.text="YOU SUCK.\nClick to restart.";
    stateText.visible = true;

    //rollCredits();

    //the "click to restart" handler
    game.input.onTap.addOnce(restart,this);
    //creditsButton.onDown.addOnce(rollCredits, this);
    bouncyCount = 0;
    score = 0;
    scoreText.text = scoreString + score;
}

function specialFiyah() {
    specialEnemyBullet = specialEnemyBullets.getFirstExists(false);
    if (specialEnemyBullet)
    {   
        specialEnemyBullet.body.velocity.setTo(200, 200);

        //  This makes the game world bounce-able
        specialEnemyBullet.body.collideWorldBounds = true;

        //  This sets the image bounce energy for the horizontal 
        //  and vertical vectors (as an x,y point). "1" is 100% energy return
        specialEnemyBullet.body.bounce.setTo(1, 1);
        
        specialEnemyBullet.reset(game.rnd.integerInRange(50, game.width-50), 50);
        //specialEnemyBullet.lifespan = 10000 * level;
        bouncyCount ++;
        specialTimer = game.time.now + 5000;
        game.physics.arcade.moveToObject(specialEnemyBullet, player, 200);
    }
}


function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    hearts.forEachAlive(function(alien){
        // put every living enemy in an array
        livingEnemies.push(alien);
    });

    if (enemyBullet && livingEnemies.length > 0)
    {   
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y + 10);

        game.physics.arcade.moveToObject(enemyBullet,player, (level * 100) );
        firingTimer = game.time.now + 2000;
    }

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.angle = -90;
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

function nextLevel () {
    //  A new level starts
    //  And brings the hearts back from the dead :)
    hearts.removeAll();
    createHearts();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;
    levelText.text = 'Level: ' + level;
    bouncyCount = 0;
    specialTimer = game.time.now + 3000;
}


function rollCredits() {
    text = game.add.text(game.world.centerX-150,game.world.centerY+100, '', { font: "20pt Courier", fill: "#19cb65", stroke: "#119f4e", strokeThickness: 2 });
    nextLine();
}

function updateLine() {

    if (line.length < content[index].length)
    {
        line = content[index].substr(0, line.length + 1);
        // text.text = line;
        text.setText(line);
    }
    else
    {
        //  Wait 2 seconds then start a new line
        game.time.events.add(Phaser.Timer.SECOND, nextLine, this);
    }

}

function nextLine() {

    index++;

    if (index < content.length)
    {
        line = '';
        game.time.events.repeat(80, content[index].length + 1, updateLine, this);
    }

}
