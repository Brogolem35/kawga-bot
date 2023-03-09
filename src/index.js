import {Client, IntentsBitField} from "discord.js";
import * as dotenv from "dotenv"

import {messageCreateListener} from "./listeners/messageCreate.js";
import {updateHosts} from "./util.js";

dotenv.config();

const HOST_UPDATE_PERIOD = 100;

const client = new Client({
	intents : [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.MessageContent,
	]
});

client.on("ready", (c) => console.log(`${c.user.tag} is ready.`));
client.on("messageCreate", messageCreateListener);

await client.login(process.env.BOT_TOKEN);

export const sourceChannels = fetchSourceChannels();
export const hostingChannel = await client.channels.fetch(process.env.HOST_CHANNEL_ID);
export const hostMap = new Map();
export const joinEmoji = client.emojis.cache.get(process.env.JOIN_EMOJI_ID);

setInterval(() => {updateHosts(client, hostMap, joinEmoji)}, HOST_UPDATE_PERIOD);

// Prints out the IDs of the channels it couldn't fetch.
function fetchSourceChannels()
{
	const sourceChannelIDs = process.env.SOURCE_CHANNEL_IDS.split(",");
	const sourceChannels = [];

	for (const id of sourceChannelIDs) {
		client.channels.fetch(id)
		    .then((channel) => { sourceChannels.push(channel); })
		    .catch(() => { console.error(`Couldn't fetch the channel: ${id}`); });
	}

	return sourceChannels;
}