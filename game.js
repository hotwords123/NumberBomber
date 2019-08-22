
'use strict';

$(document).ready(function() {
	let Game = new GameManager(
		UIManager,
		Renderer,
		LocalStorageManager,
		{
			'human': HumanReacter,
			'AI.v3': createAIReacterClass('AI/v3.js', 'AI_v3'),
			'AI.v1': createAIReacterClass('AI/v1.js', 'AI_v1'),
			'AI.v2': createAIReacterClass('AI/v2.js', 'AI_v2'),
			'AI.XMJ': createAIReacterClass('AI/XMJ.js', 'AI_XMJ')
		});
	Game.checkStorage();
});
