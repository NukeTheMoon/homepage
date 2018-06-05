var options = {
    targetId: 'starfield',
    amount: 600,
    color: '#FFFFFF',
    maxAlpha: 0.7,
    size: 1,
    pos: [],
    twinkle: {
        magnitude: 0.3,
        treshold: 0.5
    }
};

var Starfield = function(options) {
    var canvas = document.getElementById(options.targetId);
    var ctx = canvas.getContext('2d');

    var draw = function() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (var i = 0; i < options.amount; ++i) {
            if (options.pos[i]) {
                twinkle(options.pos[i]);
            } else {
                spawnStar();
            }
        }
        window.requestAnimationFrame(draw);
    };

    var spawnStar = function() {
        var x = Math.floor(Math.random() * window.innerWidth),
            y = Math.floor(Math.random() * window.innerHeight),
            alpha = Math.min(options.maxAlpha, Math.random().toFixed(2));
        options.pos.push({
            x: x,
            y: y,
            alpha: alpha
        })
    };

    var twinkle = function(s) {
        if (s.alpha > options.twinkle.treshold) {
            ctx.globalAlpha = Math.max(0, s.alpha - (Math.round(Math.random()) ? 0 : Math.random() * options.twinkle.magnitude));
        } else {
            ctx.globalAlpha = s.alpha;
        }

        ctx.fillStyle = options.color;
        ctx.fillRect(s.x, s.y, options.size, options.size);
    };

    var resizeCanvas = function() {
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
    };

    resizeCanvas();
    window.requestAnimationFrame(draw);
};

new Starfield(options);