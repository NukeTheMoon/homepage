var options1 = {
    targetId: 'shooting1',
    color: {
        r: 240,
        g: 255,
        b: 255,
        a: 1
    },
    color2: {
        r: 0,
        g: 46,
        b: 255,
        a: 1
    },
    distance: 220,
    linger: 35,
    decayTreshold: 0.3,
    speed: 5,
    delay: {
        min: 200,
        max: 10000
    }
};

var options2 = JSON.parse(JSON.stringify(options1));
options2.targetId = 'shooting2';


// options
//     targetId        (string) target canvas to render onto
//     color           (object) base color of the star. use with the rgba() function
//                     to convert to CSS color string
//      -> r               (0:255) amount of red
//      -> g               (0:255) amount of green
//      -> b               (0:255) amount of blue
//      -> a               (0.0:1.0) alpha (transparency)
//     distance       (0:infinity) max distance a star will travel in its lifetime,
//                    measured in draw frames
//     linger         (0:infinity) how long after a star has finished moving will it linger
//                    and decay, measured in draw frames
//     decayTreshold  (0.0:1.0) if the alpha of the trail end's color stop drops
//                    below this value, decay of the trail tip color stop will begin
//     speed          (0:infinity) star travel speed multiplier, 1 is 1px travelled per
//                    animation frame
//     delay          (object) random delay between star spawns. a new star won't spawn until
//                    the previous one is gone
//      -> min            (0:infinity) shortest random delay
//      -> max            (0:infinity) longest random delay
var ShootingStars = function(options) {
    var canvas = document.getElementById(options.targetId);
    var ctx = canvas.getContext('2d');
    var star = null;

    // timer used to delay star spawning
    var timer = function() {
        var lastSpawn = null;
        var delay = null;
        var reset = function() {
            this.lastSpawn = Date.now();
            this.delay = Math.floor(Math.random() * options.delay.max) + options.delay.min;
        };
        var isDue = function() {
            return Date.now() - this.lastSpawn > this.delay;
        };
        return {
            lastSpawn: lastSpawn,
            delay: delay,
            reset: reset,
            isDue: isDue
        };
    }();

    // main draw loop, called every animation frame
    var draw = function() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        if (star) {
            animateStar(star);
        } else {
            if (timer.isDue()) {
                spawnStar();
                timer.reset();
            }
        }

        // loop
        window.requestAnimationFrame(draw);
    };

    var spawnStar = function() {

        var start = {
            x: Math.floor(Math.random() * window.innerWidth),
            y: Math.floor(Math.random() * window.innerHeight)
        };

        // clamped to never start too close to canvas edge
        start.x = clamp(start.x, options.distance, window.innerWidth - options.distance );
        start.y = clamp(start.y, options.distance, window.innerHeight - options.distance);

        // initialize object
        star = {
            // starting coordinates
            start: start,
            // destination coordinates
            dest: {
                x: start.x + (plusOrMinus() * (Math.floor(Math.random() * options.distance) + 10)),
                y: start.y + (plusOrMinus() * (Math.floor(Math.random() * options.distance) + 10))
            },
            // initial gradient color stops
            // 0: end (oldest pixel) of trail
            // 1: tip (newest pixel) of trail
            stops: [
                {
                    r: options.color2.r,
                    g: options.color2.g,
                    b: options.color2.b,
                    a: options.color2.a
                },
                {
                    r: options.color.r,
                    g: options.color.g,
                    b: options.color.b,
                    a: options.color.a
                }
            ],
            // amount of animation frames the star has existed for, used for interpolation
            lifetime: 0
        };
    };

    var animateStar = function(s) {

        var totalLifetime = options.distance / options.speed + options.linger,
            vector = null;

        if (s.lifetime > options.distance / options.speed) {
            // star has travelled far enough, remain in place
            vector = {
                x: s.dest.x,
                y: s.dest.y
            }
        } else {
            // interpolate line tip
            vector = {
                x: easeInOutQuad(s.lifetime, s.start.x, s.dest.x - s.start.x, options.distance / options.speed),
                y: easeInOutQuad(s.lifetime, s.start.y, s.dest.y - s.start.y, options.distance / options.speed)
            };
        }

        // initialy the gradient is the same color on both sides.
        // as the star tip travels, the trail's end gradually becomes more transparent.
        // once the end's alpha is lower than decayTreshold, the tip starts to become
        // transparent too.
        if (s.stops[0].a.toFixed(2) !== '0.00') {
            s.stops[0].a = easeOutQuad(s.lifetime, options.color.a, -options.color.a, options.distance / options.speed);
        }
        if (s.stops[1].a.toFixed(2) !== '0.00' && s.stops[0].a < options.decayTreshold) {
            s.stops[1].a = easeInQuad(s.lifetime, options.color.a, -options.color.a, totalLifetime);
        }

        // the star and its trail is actually a simple 1px line, colored with a gradient
        var grad = ctx.createLinearGradient(s.start.x, s.start.y, vector.x, vector.y);
        grad.addColorStop(0, rgba(s.stops[0]));
        grad.addColorStop(1, rgba(s.stops[1]));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.start.x, s.start.y);
        ctx.lineTo(vector.x, vector.y);
        ctx.stroke();

        if (s.lifetime > totalLifetime) {
            // star has lived long enough, destroy it
            star = null;
        } else {
            // advance interpolation for next animation frame
            s.lifetime++;
        }
    };

    var rgba = function(obj) {
        return 'rgba(' + obj.r + ',' + obj.g + ',' + obj.b + ',' + obj.a + ')';
    };

    var clamp = function(val, min, max) {
        return Math.max(Math.min(val, max), min);
    };

    // t: current step
    // b: start value
    // c: amount of change (destination - start)
    // d: total steps
    var easeInOutQuad = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    };

    var easeInQuad = function(t, b, c, d) {
        t /= d;
        return c * t * t + b;
    };

    var easeOutQuad = function(t, b, c, d) {
        t /= d;
        return -c * t * (t - 2) + b;
    };

    var plusOrMinus = function() {
        return Math.random() < 0.5 ? -1 : 1;
    };

    var resizeCanvas = function() {
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);
    };

    window.addEventListener('resize', function() {
        resizeCanvas();
    });

    resizeCanvas();
    timer.reset();
    window.requestAnimationFrame(draw);
};

new ShootingStars(options1);
new ShootingStars(options2);
