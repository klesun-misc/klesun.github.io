
[//]: # (You can look at rendered version of this document at https://github.com/klesun/midiana.lv/blob/master/entry/public_personal/artur_klesun_cv.md)

<table><tr>
	<td><table>
		<tr><td> Backend Developer  </td><td> Artur Klesun                                                               </td></tr>
		<tr><td colspan="2">
			<a href="https://github.com/klesun/riddle-needle">C#</a> |
			<a href="https://github.com/klesun/deep-assoc-completion">Java</a> |
			<a href="https://github.com/klesun/trilemma.online">js/node.js</a> |
			<a href="https://github.com/klesun/deep-js-completion">Scala</a> |
			<a href="https://github.com/klesun/midiana.lv/tree/master/htbin">Python</a> |
			<a href="https://github.com/klesun/green-envy-xmas-defense">Lua</a> |
			<a href="https://www.asaptickets.com/">PHP</a>
		</td></tr>
		<tr><td> github        </td><td> <a href="https://github.com/klesun?tab=repositories">klesun</a>                 </td></tr>
		<tr><td> stackoverflow </td><td> <a href="https://stackoverflow.com/users/2750743/artur-klesun">artur-klesun</a> </td></tr>
		<tr><td> Web-Site      </td><td> <a href="https://klesun-productions.com/entry/">klesun-productions.com</a>      </td></tr>
		<tr><td> E-mail        </td><td> arturklesun@gmail.com                                                           </td></tr>
		<tr><td> Location      </td><td>Riga, Latvia, Center                                                             </td></tr>
	</table></td>
	<td><img src="https://user-images.githubusercontent.com/5202330/59568034-bcca1380-9064-11e9-8e99-7fec3025c6d0.jpg" align="right" width="65%"/></td>
</tr></table>

 Work Experience
----------------

- 2014 - 2020 (6 years)<br/><br/>
    Backend Developer at "[ASAP Tickets](https://www.asaptickets.com/)" travel agency.<br/>
    [GDS](https://en.wikipedia.org/wiki/Global_distribution_system) integration department.
    
    I maintain a node.js project that connects to different distribution systems, like
    [Galileo (United Airlines)](https://en.wikipedia.org/wiki/Galileo_GDS), 
    [Sabre (American Airlines)](https://www.sabre.com/about/), 
    [Amadeus](http://www.amadeus.com/web/amadeus/ru_1A-corporate/Hotels/Our-portfolio/Connect/Distribute-&-sell-through-more-channels/Hotels_Product_AmadeusGDS/1319572127006-Solution_C-AMAD_ProductDetailPpal-1319578304458?industrySegment=1259068355773&level2=1319608960115&level3=1319610649867), 
    [Hertz](https://www.hertz.com/rentacar/reservation/), 
    [Delpaso](https://www.delpasocarhire.com/), 
    etc... usually via [SOAP XML](https://en.wikipedia.org/wiki/SOAP) protocol and does stuff there. 

    A major part of my work is to make life of travel agents easier.
    I give them a single terminal GUI that provides access to all systems we support 
    at once. That involves a lot of  airline terminal text parsing; a lot of work with 
    [MySQL](https://www.mysql.com/) databases; arranging 
    hundreds cron jobs for parallel data processing with [Redis](https://redis.io/); implementing various interesting ideas our travel business guys 
    request... Most of the code is always covered with [mocha](https://github.com/mochajs/mocha) tests.
    My job also involves 
    developing frontend stuff occasionally.

    In years of co-operation with my colleagues I learned both good practices and how not to not repeat their mistakes.
    I write clean code, keeping files small, yet not too numerous, making commits atomic,
    delivering basic functionality quickly and extending it according to client wishes after they have something to click...<br/>
    <br/>
    If you track history of ITN, you could tell that the 2014 was the start a golden age for 
    this company. Before I started developing it, it was just a relatively small travel agency. 
    Now it shows on the first pages in google and has [mostly very positive ratings by customers](https://www.trustpilot.com/review/www.asaptickets.com) .

 Skills
--------
Languages:
- English: technical fluent
- Russian: fluent
- Javascript: native
- Latvian: average

Programming:
- Actively worked (at least 10k lines of code each) with: C#, Java, node/Javascript, Scala, Python, Lua, PHP
(see "[Personal Projects](#user-content-personal-projects)" below)
- Had a lot of experience with SQL at my present work, tried hundreds things with alive DB with billions of
records in search of optimization tricks, choosing right indexes and stuff. Later started working with Redis.
- Capable of maintaining a [Unix sever](https://midiana.lv/entry/denisbook/views/) on either node or Apache. And in general am pretty comfortable in Linux environment.
- Academically familliar with: C, C++, Pascal
- My forte is recursive algorithms. Most people can't easily understand them, but I can. I wrote numerous beautiful things starting from [Hanoi Tower resolver](https://github.com/klesun/Progmeistars_tasks/tree/master/Sem5_PointersRecursions_Vlad/e11) in school and ending with my present [php semi-compiler](https://github.com/klesun/deep-assoc-completion/blob/master/src/org/klesun/deep_assoc_completion/resolvers/DirectTypeResolver.java) for [IDEA](https://github.com/JetBrains/intellij-community).
- Am a good and responsive team lead.

 Personal Projects
-------------------

- ### [deep-assoc-completion](https://plugins.jetbrains.com/plugin/9927-deep-assoc-completion)
    [Intellij IDEA](https://www.jetbrains.com/idea/) plugin that adds type inference based completion in PHP code. 
    1834+ active users currently. Written in Java. [Source Code](https://github.com/klesun/deep-assoc-completion)

    ![alt tag](https://raw.githubusercontent.com/klesun/phpstorm-deep-keys/master/imgs/screenshot.png)

- ### [deep-js-completion](https://plugins.jetbrains.com/plugin/11478-deep-js-completion)
    Another IDEA/Webstorm plugin that gives same deep type inference, but in JS code. 
    424+ active users currenly. Written in Scala.
    [Source Code](https://github.com/klesun/deep-js-completion)
    ![alt tag](https://user-images.githubusercontent.com/5202330/50492169-c01e0400-0a1e-11e9-9eff-44d2cfebe09b.png)

- ### [midiana](http://midiana.lv/entry/compose/)
    Browser sheet music editor using [connected MIDI device](https://developer.mozilla.org/en-US/docs/Web/API/MIDIAccess). Written in pure javascript. 
    [Source Code](https://github.com/klesun/midiana.lv)
    ![alt tag](https://github.com/klesun/midiana.lv/raw/master/screenshot_compose.png)

- ### [starve_game](http://midiana.lv/entry/starve_game/)
    A word game where you have to come up with a word meaning a food starting with a specific letter. 
    To generate food word database I processed all existing Wikipedia articles (dozens of GiB) with a lexical analysis algorithm I invented. 
    The data processing part was written in python.
    [Source Code](https://github.com/klesun/midiana.lv/blob/master/htbin/scr/wiki_dump/hell_wrapper.py)
![alt tag](https://cloud.githubusercontent.com/assets/5202330/26429290/babeb7f2-40ee-11e7-98e0-ab4b04306c41.png)

- ### [green-envy-xmas-defense](https://steamcommunity.com/sharedfiles/filedetails/?id=1170060197)
    A mod for Dota 2 I wrote with my friend for a contest. Written in Lua.
    [Source Code](https://github.com/klesun/green-envy-xmas-defense)
    ![alt tag](https://steamuserimages-a.akamaihd.net/ugc/867368888873667911/D53C89CC75A47AC50C09409D0BFBA4CF97242F80/)

- ### [riddle-needle](https://github.com/klesun/riddle-needle)
    A Unity game written in C#. Temporarily on hiatus, but great job was done nevertheless.
    ![alt tag](https://github.com/klesun/riddle-needle/blob/master/screenshots/village.png?raw=true)

 Education
-----------

- "[Progmeistars](http://progmeistars.lv/index.php?lang=ru&act=aboutseniors)" courses: 5 main semesters, 3 spec-courses: OOP (Delphi), C (low-level programming), Java
- A lot of programming related self-study.
- Riga secondary school No. 65, 12 years.

 Misc
------

Most of my skills are programming related. But I also have some valuable experience in Image/Video editing 
software like Adobe Photoshop, After Effects, Gimp. In my schools years I was a lead of a school TV team 
and learned a lot of special effect tricks like chroma-keying, motion capture, etc...:
https://www.youtube.com/watch?v=xlgqaG2gFfs
