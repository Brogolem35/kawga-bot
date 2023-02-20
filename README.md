# Kawga Bot
Discord bot to organize fighting game hosting. Made specifically for games like MBAACC and EFZ.  
Originally developed for the [MBTK](https://discord.gg/vj62m6PMbh).  
Must be self-hosted.  
  
## Hosting
0. Install Node.js
1. Run `git clone https://github.com/Brogolem35/kawga-bot.git` to get the code. It is advised to use `master` branch.
2. Run `npm install`
3. Create a file named `.env` and copy the contents of the `.env.example` into it, then fill the variables accordingly.
4. run `npm start`  
  
## Usage
Write `!host <ip:port> <note|optional>` on one of the `SOURCE_CHANNEL_IDS` to host a game. The bot will send an embedded message on the `HOST_CHANNEL_ID` and will leave a reaction to it with `JOIN_EMOJI_ID`. If the host reacts to this message with the `JOIN_EMOJI_ID`, the bot will edit the embed to indicate someone has joined the game.  

## License
This software is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html).
