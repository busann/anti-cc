module.exports = function antiCC(dispatch) {
	const command = require("command")(dispatch);

	let enabled = false;

	command.add("cc", () => {
		enabled = !enabled;
		command.message("Anti-CC enabled: " + enabled);
	});

	let gameId = 0,
	location = null,
	locRealTime = 0;

	dispatch.hook('C_PLAYER_LOCATION', 2, event => {
		location = event
		locRealTime = Date.now()
	});

	dispatch.hook('S_LOGIN', 10, event => {
		gameId = event.gameId;
	});

	dispatch.hook('S_EACH_SKILL_RESULT', 12, {order: -10000000}, event => {
		if (!enabled) return;

		if (event.target.equals(gameId) && event.reaction.enable) {
			dispatch.toServer('C_PLAYER_LOCATION', 2, Object.assign({}, location, {
				type: 2,
				time: location.time - locRealTime + Date.now() - 50
			}));
			dispatch.toServer('C_PLAYER_LOCATION', 2, Object.assign(location, {
				type: 7,
				time: location.time - locRealTime + Date.now() + 50
			}));
			event.reaction.enable = false;
			event.reaction.instantPush = false;
			event.reaction.air = false;
			event.reaction.airChain = false;
			event.reaction.loc.x = 0;
			event.reaction.loc.y = 0;
			event.reaction.loc.z = 0;
			event.reaction.w = 0;
			event.reaction.stage = 0;
			event.reaction.id = 0;
			event.reaction.movement = [];
			return true;
		}
	});
};
