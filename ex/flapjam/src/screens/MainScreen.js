(function (Ω) {

    "use strict";

    var MainScreen = Ω.Screen.extend({

        speed: 2,
        bird: null,
        pipes: null,

        score: 0,
        state: null,

        bg: 0,
        bgOffset: 0,

        sounds: {
            "point": new Ω.Sound("res/audio/sfx_point", 1)
        },

        init: function () {
            this.reset();

        },

        reset: function () {
            this.score = 0;
            var offset = Ω.env.w * 1;
            this.state = new Ω.utils.State("BORN");
            this.bird = new window.Bird(Ω.env.w * 0.24, Ω.env.h * 0.46, this);
            this.bg = Ω.utils.rand(2);
            this.bird.setColor(Ω.utils.rand(3));
            this.pipes = [
                new window.Pipe(0, "up", offset + Ω.env.w, Ω.env.h - 170, this.speed),
                new window.Pipe(0, "down", offset + Ω.env.w, - 100, this.speed),

                new window.Pipe(1, "up", offset + (Ω.env.w * 1.5), Ω.env.h - 170, this.speed),
                new window.Pipe(1, "down", offset + (Ω.env.w * 1.5), - 100, this.speed),

                new window.Pipe(2, "up", offset + (Ω.env.w * 2), Ω.env.h - 170, this.speed),
                new window.Pipe(2, "down", offset + (Ω.env.w * 2), - 100, this.speed)
            ];

            this.setHeight(0);
            this.setHeight(1);
            this.setHeight(2);
        },

        tick: function () {
            this.state.tick();

            this.bird.tick();
            switch (this.state.get()) {
                case "BORN":
                    this.state.set("GETREADY");
                    this.bird.state.set("CRUSING");
                    break;
                case "GETREADY":
                    if (this.state.count > 30 && Ω.input.pressed("jump")) {
                        this.bird.state.set("RUNNING");
                        this.state.set("RUNNING");
                    }
                    this.moveLand();
                    break;
                case "RUNNING":
                    this.tick_RUNNING();
                    break;
                case "DYING":
                    if (this.state.count > 20) {
                        this.state.set("GAMEOVER");
                    }
                    break;
                case "GAMEOVER":
                    if (this.state.first()) {
                        if (this.score > window.game.best) {
                            window.game.best = this.score;
                        }
                    }
                    if (this.state.count > 30 && Ω.input.pressed("jump")) {
                        window.game.setScreen(new MainScreen(), {type:"inout", time: 50});
                    }
                    break;
            }

        },

        tick_RUNNING: function () {

            this.moveLand();

            this.pipes = this.pipes.filter(function (p) {
                p.tick();
                if (!p.counted && p.x < this.bird.x) {
                    p.counted = true;
                    this.score += 0.5;
                    this.sounds.point.play();
                }

                if (p.reset) {
                    this.setHeight(p.group);
                }
                return true;
            }, this);

            Ω.Physics.checkCollision(this.bird, this.pipes);
        },

        moveLand: function () {
            this.bgOffset -= this.speed;
            if (this.bgOffset < -Ω.env.w) {
                this.bgOffset += Ω.env.w;
            }
        },

        setHeight: function (group) {
            var h = (Math.random() * 160 | 0) + 130;
            this.pipes.filter(function (p) {
                return p.group === group;
            }).forEach(function (p) {
                p.y = p.dir == "up" ? h + 60 : h - p.h - 60;
            });
        },

        render: function (gfx) {
            var atlas = window.game.atlas;

            this.renderBG(gfx, atlas);
            this.renderGame(gfx, atlas);

            switch (this.state.get()) {
                case "GETREADY":
                    this.renderGetReady(gfx, atlas);
                    break;
                case "GAMEOVER":
                    this.renderGameOver(gfx, atlas);
                    break;
                case "RUNNING":
                    this.renderRunning(gfx, atlas);
                    break;
            }

            this.renderFG(gfx, atlas);

        },

        renderBG: function (gfx, atlas) {
            atlas.render(gfx, "bg_" + (this.bg === 1 ? "night" : "day"), 0, 0);
        },

        renderGame: function (gfx) {
            this.pipes.forEach(function (p) {
                p.render(gfx);
            });
            this.bird.render(gfx);
        },

        renderFG: function (gfx, atlas) {
            atlas.render(gfx, "land", this.bgOffset, gfx.h - 112);
            atlas.render(gfx, "land", Ω.env.w + this.bgOffset, gfx.h - 112);
        },

        renderRunning: function (gfx, atlas) {
            if (this.state.count < 30) {
                gfx.ctx.globalAlpha = 1 - (this.state.count / 30);
                this.renderGetReady(gfx, atlas);
                gfx.ctx.globalAlpha = 1;
            }
            this.renderScore(gfx, atlas);
        },

        renderGameOver: function (gfx, atlas) {
            atlas.render(gfx, "text_game_over", 40, gfx.h * 0.25);
            atlas.render(gfx, "score_panel", 24, gfx.h * 0.37);

            var sc = this.score + "";
            for (var i = 0; i < sc.length; i++) {
                atlas.render(gfx, "number_context_0" + sc[i], i * 15 + 200, 227);
            }

            sc = window.game.best + "";
            for (i = 0; i < sc.length; i++) {
                atlas.render(gfx, "number_context_0" + sc[i], i * 15 + 200, 267);
            }

            atlas.render(gfx, "button_play", 20, gfx.h - 172);
            atlas.render(gfx, "button_score", 152, gfx.h - 172);
        },

        renderGetReady: function (gfx, atlas) {
            atlas.render(gfx, "text_ready", 46, gfx.h * 0.285);
            atlas.render(gfx, "tutorial", 88, gfx.h * 0.425);

            this.renderScore(gfx, atlas);
        },

        renderScore: function (gfx, atlas) {
            var sc = this.score + "";
            for (var i = 0; i < sc.length; i++) {
                atlas.render(gfx, "number_score_0" + sc[i], i * 18 + 140, gfx.h * 0.16);
            }
        }
    });

    window.MainScreen = MainScreen;

}(window.Ω));
