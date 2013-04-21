(function (Ω) {

	"use strict";

	var MainScreen = Ω.Screen.extend({

		players: [],
		sheet: new Ω.SpriteSheet("res/tiles.png", 32),
		bg: new Ω.Image("res/background.png"),

		init: function () {

			var i;

			this.players = [new Player(Ω.env.w, true)];

			for (i = 1; i < 6; i++) {
				this.players.push(new Player(-(i * 40)));
			}

			this.camera = new Ω.Camera(0, 0, Ω.env.w, Ω.env.h);

			this.map = new Ω.Map(this.sheet, [
				[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			   	[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 9, 0, 0, 0, 0, 0, 0, 0, 3, 9],
				[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[ 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[ 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
				[ 7, 0, 0, 1, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
				[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			]);

		},

		tick: function (d) {

			var self = this;

			this.camera.x = this.players[0].x + (Math.sin(Date.now() / 1000) * 20) - (Ω.env.w / 2);
			this.camera.y = (Math.cos(Date.now() / 2000) * 20);

			this.players.forEach(function (p, i) {

				p.tick(d);

				if (p.x > self.map.w) {
					p.x = -20;
				}
				if (p.x < -32) {
					p.x = self.map.w - p.w;
				}

			});

			if (Ω.input.pressed("escape")) {
				game.setScreen(new TitleScreen());
			}

		},

		render: function (gfx) {

			var c = gfx.ctx,
				self = this;

			c.fillStyle = "hsl(195, 40%, 50%)";
			c.fillRect(0, 0, gfx.w, gfx.h);

			this.bg.draw(gfx, 0, 0);

			this.camera.render(gfx, [
				this.map,
				this.players
			]);

			gfx.drawTextShadow("[esc]", 2, 10, 1, "7pt MonoSpace");
		}
	});

	window.MainScreen = MainScreen;

}(Ω));
