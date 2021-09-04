# sengal-psycho
A breakout clone in javascript

## Notes (0.4.0)

* Used simple particle system
	
	A simple particle system and explosion physics to display bricks shattering effect on collision with ball

* Used Custom DOM events

	Custom events to trigger action on collision detection, trigger state changes and trigger reaction to inputs.

* Used custom VT323 font
* Used State management for different game states

	Game has the following states viz: Start state, Game play state, paused state, Win state and game over state.

* Moved to Class based from functional programming
* Used basic shapes for Game props

	Used rectangle for bricks and paddle. And used circle for ball.

* Used simple physics for collision detection

	Used the coordinates of the centre of the ball and the ball's radius to detect the world bounds.
	Used the coordinates of the centre of the ball to check if the centre is within the bounds of the rectangle (paddle & brick) to detect collision.

* Used a scoring system to provide scores for the player
* Used a lives system to liven up the game play and to detect when the game is over.
