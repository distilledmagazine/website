---
layout: post
status: publish
published: true
title: Against The Odds Of Catching Four Foul Balls
author:
  display_name: ''
  login: ''
  email: ''
  url: ''
excerpt: Last week, the media showed again it doesn't get probability, when Greg Van
  Niel caught four foul balls at a baseball game
wordpress_id: 5742
wordpress_url: http://distilledmagazine.com/?p=5742
date: '2013-07-19 17:47:10 +0000'
date_gmt: '2013-07-19 17:47:10 +0000'
---
<p>There is one thing that all introductory statistics textbooks have in common. Open them up to the section on probability, and they will relentlessly mock all “those people” who do not understand basic probability. Look at all the people who play the lottery or the people gambling in Las Vegas. What fools! Anyone can see that is a losing bet. Should you buy insurance for your printer? Of course not, the expected return is terrible!</p>
<p>&nbsp;</p>
<p>I would like to talk to people who <em>have</em> read introductory statistics textbooks and who then want to use this information to help everyone else understand the world. Stop. Please, just stop. Real-world situations are not games. Your rules don’t work like you think they do.</p>
<p class="break">
<p class="break">In this vein, I read a short article about a man who caught four foul balls at a Cleveland Indians game recently. This is astoundingly unlikely. How unlikely? <a href="http://distilledmagazine.com/wp-content/uploads/2013/07/fan-catches-four-foul-balls-cleveland-indians-game" target="_blank">According to ESPN</a> the odds are one trillion to one. This is where we need to stop. 1,000,000,000,000 to 1? With 2,430 regular-season games, this would mean that this event should happen less than once every 411 million seasons for an individual fan. This is once every 13,500 seasons for any fan, assuming 30,000 fans per game.  Astounding? Maybe we should check our assumptions.</p>
<p>&nbsp;</p>
<p>The one trillion to one figure was found with some very simple probability calculations. ESPN Stats &amp; Information tells us that the odds of catching a foul ball in any given game <a href="http://distilledmagazine.com/wp-content/uploads/2013/07/fan-catches-four-foul-balls-cleveland-indians-game" target="_blank">are about one thousand to one</a>. For the sake of argument, let’s assume this figure is true, that any given fan has a one in one thousand chance. To reach the 1,000,000,000,000 to 1 figure, the stat team over at ESPN simply took that number and multiplied it by itself four times. If this were a game, that would be a great calculation because the rules of the game never change while playing. One thousand to one is one thousand to one.</p>
<p>&nbsp;</p>
<p>Unfortunately, this is where our heroes went off track. In the real world, one event gives us more information about subsequent probabilities. Greg Van Niel, our intrepid foul ball catcher, was not just any given fan. He was a tall fan who brought his mitt and had shown an active interest in catching foul balls. He also was not just in any seat; he was in prime foul ball territory along the third-base line, where left-handed batters are much more likely to spray their foul balls than any other random seat in the game.</p>
<p class="break">
<p class="break">The fact that a fan catches one foul ball makes it significantly more likely that this fan was more like Greg Van Neil — a tall, attentive fan wearing a glove in prime seats to catch foul balls than that he was a random fan. This makes it significantly more likely that he will catch a second ball than just any random fan. Once he catches a second ball, it becomes even more likely that this fan is like Greg Van Niel and, therefore, more likely that he will catch another ball. These are not independent events; they are new information that allows us to update our initial estimate of one thousand to one.</p>
<p>&nbsp;</p>
<p>The pattern goes on to the fourth ball. It is called Bayesian updating, and it is every bit as simple conceptually as Stats 101, but it requires a bit more information. Without that information, there is really no way to do the full calculation, but a conservative “ballpark figure” might look like this: 1/1000 times 1/400 times 1/175 times 1/150. This would be one in 10.5 billion. The probabilities fall as we go along, because it becomes ever more likely that our fan is the type that is considerably more likely to catch a ball. Just with the knowledge that he has caught one ball, we can eliminate the idea that he may be very young or elderly, where his odds would be significantly reduced. Think about how many fans have essentially zero chance to catch a ball. We know he is capable of catching a foul ball. Once he has caught two, it is prohibitively likely that he is tall, has a glove, and is sitting in prime seats. After three, it is virtually certain.</p>
<p>&nbsp;</p>
<p>This probability, however, would not be our final estimate for Greg himself. Once we know that he is in fact tall, attentive, and sitting in prime seats with a glove, we can single in on his individual probability. Assuming that he does not get more attentive after the first ball (a shaky but probably not significant assumption), the probability might be 1/150 times four. This makes for odds of 506 million to 1, almost 2000 times more likely than one trillion to one. If there were 1000 fans equally situated to Greg, then the event would happen once every 208 seasons. More realistically, there would be a sliding scale of likelihood based on individual characteristics. It would still be incredible event, still very unlikely, but much less so.</p>
<p class="break">
<p class="break">What is the point of all of this? I am certainly not trying to correct their number with my ballpark estimates. Those estimates could also be off by several orders of magnitude. The point is that a little knowledge of statistics can get analysts in a whole lot of trouble. Mistaking real-life probabilities for independent, game-like probabilities can lead to conclusions that are many degrees off of the true estimate. This is, essentially, the same reason that Wall Street quants cannot understand why “one in one trillion crashes” have happened over and over again in financial markets around the world. If one event depends upon another, the odds will change quickly and change drastically.</p>
<p>&nbsp;</p>
<p>I may not know the exact probability of catching a foul ball four times in a game. Under my Bayesian system, I simply do not have enough information to calculate it. However, I do know that I don't know the probability. If you think that you do because the rest of us idiots must not have ever taken Stats 101, please, just stop.</p>
