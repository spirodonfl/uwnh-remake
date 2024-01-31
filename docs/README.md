# What is this?

An exploration game set in the 1600's mainly using naval ships to travel the world.

# Local Development Setup

## Installing Zig

### Linux

```sh
wget https://ziglang.org/download/0.11.0/zig-linux-x86_64-0.11.0.tar.xz -O zig-linux-x86_64-0.11.0.tar.xz && tar -xf zig-linux-x86_64-0.11.0.tar.xz
```
## Building the zig stuff
```sh
~/zig-linux-x86_64-0.11.0/zig build
```
## Web frontend

- Simply launch the web server of choice in the `web` directory.


# General mechanics and details

Ports
- Standard ones
- Smaller ones you get to name 

Trading
- Each port is aligned to a nation
- Taxes are applied to prices
-- You can get a tax free license
- Minimum market rate is 50% and max is 150%
-- Supply and demand
- Economy investing unlocks specialty trading for some ports
- Each month, market rates stabilize to 100% by unknown percentage 

Ship building
- Industry investing makes better building options and faster building in some ports
- Ports offer different types of ships based on location and nationality 

Adventuring
- Finding random villages lets you
-- Stay with them and mingle
-- Pillage
-- Search surrounding area and they help you
--- Can find rare animals or treasure or water
- Storms can ruin your ship unless you anchor to land and then take slight damage
- Sirens, mermaids and other weird things
- Scurvy
- Rats vs cat
- Telescope to see farther 

Fighting
- Can duel captain if you fight their ship directly
- Can control each ship directly
- Can fight man to man or shoot different types of cannons
-- Some cannons do more hull damage or more man damage
- If you win a fight, you can take their cargo, food, water and even ships or scuttle ships to salvage for repair materials to repair your own ships 

Ships
- Need food and water based on crew size and cargo space
- Need cannon balls for cannons
- Can control rations but at cost of sailor happiness and efficiency
- Need a minimum number of crew to run at slowest speed. More crew is usually a faster ship

Ship movement
- Wind affected by time of day, location, time of year (winter vs spring) and your character stats (and ship captain stats) and ship stats
- Only as fast as slowest ship

Crew
- Can have one captain per ship
- Capital ship can have you or someone else as captain
- Some captains can auto navigate
- Can have an accountant
- There was something else you could have? A third option of some kind? 

Taverns
- Charm helps to hire people
- The more fancy the port the more it costs per man when you buy treats 

Hiring
- Can destroy fleet then track down captain in a nearby port
- Some people are just free 

Cartography
- Just turn in explored map 

Where do you turn in villages or rare findings? 

Hardest part: automating other fleets and captains and what they do 

Kingdoms sphere of influence based on investing in ports 

Armor and swords for player


## Ideas to make game more unique 

When you find a village, go into it, do quests or trades to gain trust and take a party out to search? 

Build your own port from a small port you normally only get to name? 

Trade disruptions? In your own port, you have to bring items in to trade? 

Separate your fleet to do other things while you play?

## Engine decision

Use literate programming mechanism you have to generalize the code. Then you can target web and/or Godot. Those are the only two options you have and you might want to do both, even!
