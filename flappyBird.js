$(document).ready(function () {
    const canvas = document.querySelector('canvas');
    const c = canvas.getContext('2d');
    const startContainer = document.getElementById('start-container');
    const gameContainer = document.getElementById('game-container');
    const resetContainer = document.getElementById('lost-container');
    const pauseContainer = document.getElementById('pause-container');
    const settingContainer = document.getElementById('setting-container');

    const scoreGame = document.getElementById('game-span-score');
    const scoreBox = document.getElementsByClassName('box-span-score');
    const scoreDiv = document.getElementById('game-score');
    const pauseButton = document.getElementById('pause-button');

    canvas.height = 450;
    canvas.width = 800;

    var keyMove = 15;
    var cancelReq;
    var thickness = 1;

    var obstrucleArray = [];
    var index = 0;

    var vel= 0;
    var horizontalX = 0;
    var scoreCount = 0;
    var bird;

    // bird's dimension
    var birdX = 140;
    var birdY = 50;
    var birdWidth = 35;
    var birdHeight = 35;
    var birdColor = '#F23838';
    var birdGravity = 0.04;


    // Obstrucle's dimension
    var obstrucleColor = '#07D977';
    var obstrucleWidth = 45;
    var obstrucleSpeed = 2;
    var builtFrequency = 180;
    var obstrucleFrequency = canvas.width - builtFrequency;

    class Bird {
        constructor(x, y) {
            this.x = x;
            this.y = y;

            this.draw = function () {
                drawBorder(this.x, this.y, birdWidth, birdHeight, thickness);

                c.fillStyle = birdColor;
                c.fillRect(this.x, this.y, birdWidth, birdHeight);
            };

            this.update = function () {
                vel += birdGravity;
                this.y += vel;
                this.x += horizontalX;
                this.draw();
                this.check();
            };

            this.check = function () { // this is the checking for the boundary of the game, not for the obstrucle
                // 150 is the default size of the canvas window(300 x 150)
                if (this.y + birdHeight + thickness >= canvas.height || this.y - thickness <= 0) { 
                    resetUpdate();
                }
            };
        }
    }

    class Obstrucle {
        constructor(x, completePass, builtPass) {

            this.x = x;
            this.completePass = completePass;
            this.builtPass = builtPass;

            var topHeight = Math.floor(Math.random() * 110 + 90);
            var gap = Math.floor(Math.random() * 60) + 70;
            var bottomHeight = canvas.height - topHeight - gap;

            this.draw = function () {
                // This is for the upper obstrucle
                drawBorder(this.x, 0, obstrucleWidth, topHeight, thickness); // black border
                c.fillStyle = obstrucleColor;
                c.fillRect(this.x, 0, obstrucleWidth, topHeight); // green block


                // This is for the lower obstrucle
                drawBorder(this.x, topHeight + gap, obstrucleWidth, bottomHeight, thickness); // black border
                c.fillStyle = obstrucleColor;
                c.fillRect(this.x, topHeight + gap, obstrucleWidth, bottomHeight); // green block
            };

            this.update = function () {
                this.x -= obstrucleSpeed; // speed of the obstrucle
                this.check();
                this.draw();
            };

            this.check = function () { // this is the check for the bird hitting the obstrucle
                if (birdWidth + birdX + thickness >= this.x && (bird.y < topHeight || bird.y + birdHeight > topHeight + gap) && this.completePass) {
                    resetUpdate();
                }
            };
        }
    }

    function animate () {
        cancelReq = requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height);
        
        bird.update();
        bird.check();

        for(var i = 0; i < obstrucleArray.length; i++) {
            obstrucleArray[i].update();
        }
    
        if(obstrucleArray[0].x + obstrucleWidth < 0) {
            obstrucleArray.shift();
            index--;
        }

        if((obstrucleArray[index].x < obstrucleFrequency) && obstrucleArray[index].builtPass) { // time after which the new obstrucle will come
            obstrucleArray[index].builtPass = false;
            index++;
            obstrucleArray.push(new Obstrucle(canvas.width, true, true));
        }

        scoreUpdate();
    }

    function start() {
        keyMove = 15;
        time = 0;
        cancelReq;
        thickness = 1;
        obstrucleArray = [];
        birdGravity = 0.04;
        vel= 0;
        horizontalX = 0;
        scoreCount = 0;
        index = 0;

        bird = new Bird(birdX, birdY);
        obstrucleArray.push(new Obstrucle(canvas.width, true, true)); // 300 is the canvas width so it will start form the last

        scoreDiv.style.display = 'block';
        pauseButton.style.display = 'block';
        scoreGame.textContent = scoreCount;

        animate();
    }

    window.addEventListener('keyup', function(event) { // action for the space bar 
        if(event.key === " ") {
            bird.y -= keyMove; 
            vel = 0; 
        }
    });

    $('canvas').click(function() {
        bird.y -= keyMove; 
        vel = 0; 
    });

    function blinker() {
        $('#info-para').fadeOut(500);
        $('#info-para').fadeIn(500);
    }
    blinker();
    setInterval(blinker,1000);

    document.getElementById('start-button').addEventListener('click', function() {
        gameContainer.style.zIndex = 40;
        startContainer.style.display = 'none';

        start();
    })

    document.getElementById('pause-button').addEventListener('click', function() {
        window.cancelAnimationFrame(cancelReq);
        gameContainer.style.opacity = 0.2;
        pauseContainer.style.zIndex = 200;
        pauseContainer.style.display = 'block';
        displayScoreBox();
        scoreDiv.style.display = 'none';
        pauseButton.style.display = 'none';
    })

    document.getElementById('resume-button').addEventListener('click', function() {
        gameContainer.style.opacity = 1;
        pauseContainer.style.zIndex = 20;
        pauseContainer.style.display = 'none';

        animate();

        scoreDiv.style.display = 'block';
        pauseButton.style.display = 'block';
        scoreGame.textContent = scoreCount;
    })

    document.getElementById('setting-done-button').addEventListener('click', function() {
        startContainer.style.opacity = 1;
        resetContainer.style.opacity = 1;
        settingContainer.style.display = 'none';
        settingContainer.style.zIndex = 18;

        updateValue();
    })

    var resetButtonList = document.getElementsByClassName('reset-button');
    var quitButtonList = document.getElementsByClassName('quit-button');
    var settingButtonList = document.getElementsByClassName('setting-button');

    for(i = 0; i < resetButtonList.length; i++) {
        resetButtonList[i].addEventListener('click', function() {
            gameContainer.style.opacity = 1;
            resetContainer.style.zIndex = 20;
            resetContainer.style.display = 'none';
            pauseContainer.style.display = 'none';

            start();        
        })
    }

    for(i = 0; i < quitButtonList.length; i++) {
        quitButtonList[i].addEventListener('click', function() {
            startContainer.style.display = 'block';
            gameContainer.style.opacity = 1;
            startContainer.style.zIndex = 60;
            resetContainer.style.display = 'none';
            pauseContainer.style.display = 'none';
            c.clearRect(0, 0, canvas.width, canvas.height);
            scoreGame.textContent = 0;
        })
    }

    for(i = 0; i < settingButtonList.length; i++) {
        settingButtonList[i].addEventListener('click', function() {
            startContainer.style.opacity = 0.2;
            resetContainer.style.opacity = 0.2;
            settingContainer.style.display = 'block';
            settingContainer.style.zIndex = 200;
        })
    }

    function drawBorder(xPos, yPos, width, height, thickness = 1) {
        c.fillStyle='#000';
        c.fillRect(xPos - (thickness), yPos - (thickness), width + (thickness * 2), height + (thickness * 2));
    }

    function scoreUpdate () {
        if((bird.x > obstrucleArray[0].x + obstrucleWidth) && obstrucleArray[0].completePass) {
            scoreCount++;
            obstrucleArray[0].completePass = false;
            scoreGame.textContent = scoreCount;
        } 
    }

    function resetUpdate () {
        window.cancelAnimationFrame(cancelReq);
        gameContainer.style.opacity = 0.2;
        resetContainer.style.zIndex = 200;
        resetContainer.style.display = 'block';
        displayScoreBox();
        scoreDiv.style.display = 'none';
        pauseButton.style.display = 'none';
    }

    function displayScoreBox() {
        for(i = 0; i < scoreBox.length; i++) {
            scoreBox[i].textContent = scoreCount;
        }   
    }

    function updateValue() {
        birdColor = document.getElementById('bird-color').value;
        birdHeight = document.getElementById('bird-height').value * 7;
        birdWidth = document.getElementById('bird-width').value * 7;
        birdGravity = document.getElementById('bird-gravity').value * 0.04;

        obstrucleColor = document.getElementById('obstrucle-color').value;
        obstrucleWidth = document.getElementById('obstrucle-width').value * 5;
        obstrucleSpeed = document.getElementById('obstrucle-speed').value * 1;
        builtFrequency = 180 - ((document.getElementById('obstrucle-frequency').value * 1) - 1) * 20;
        obstrucleFrequency = canvas.width - builtFrequency;
    }

    $('ul.tabs li').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('ul.tabs li').removeClass('active-tab');
		$('.tab-content').removeClass('active-tab');

		$(this).addClass('active-tab');
		$("#"+tab_id).addClass('active-tab');
	})

})