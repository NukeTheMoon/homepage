var options = {
    targetId: 'starfield',
    amount: {
        mobile: 200,
        tablet: 400,
        desktop: 600
    },
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

    var isHighDensity = function() {
        // https://stackoverflow.com/a/20413768
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
    }

    var amountByDevice = function() {
        if (window.innerWidth < 640 || (isHighDensity() && window.innerWidth < 320)) {
            return options.amount.mobile;
        } else if (window.innerWidth < 1920 || (isHighDensity() && window.innerWidth < 960)) {
            return options.amount.tablet;
        }
        return options.amount.desktop;
    };

    var draw = function() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (var i = 0; i < amountByDevice(); ++i) {
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

    var windowExpandedTooMuch = function() {
        var treshold = 50;
        return window.innerWidth - canvas.getAttribute('width') > treshold
            || window.innerHeight - canvas.getAttribute('height') > treshold;
    };

    var windowShrunk = function() {
        return window.innerWidth < canvas.getAttribute('width')
            || window.innerHeight < canvas.getAttribute('height');
    };

    window.addEventListener('resize', function(){
        if (windowExpandedTooMuch()) {
            resizeCanvas();
            options.pos = [];
        } else if (windowShrunk()) {
            resizeCanvas();
        }
    });

    resizeCanvas();
    window.requestAnimationFrame(draw);
};

new Starfield(options);