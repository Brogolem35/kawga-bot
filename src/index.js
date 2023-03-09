import {Client, EmbedBuilder, IntentsBitField} from "discord.js";
import * as dotenv from "dotenv"

import {messageCreateListener} from "./listeners/messageCreate.js";

dotenv.config();

const HOST_LIFESPAN = 3600000; // How long the hosting message will be displayed in millis
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

setInterval(() => {updateHosts(hostMap, joinEmoji)}, HOST_UPDATE_PERIOD);

function updateHosts(hostMap, joinEmoji)
{
	for (const [hostID, host] of hostMap.entries()) {
		// deletes messages when they stay longer than HOST_LIFESPAN
		if ((Date.now() - host.message.createdTimestamp) >= HOST_LIFESPAN) {
			hostMap.delete(hostID);
			host.message.delete().catch(console.error);
		}

		removeUnwantedReactions(hostID, host.message, joinEmoji);
		updateJoin(host, joinEmoji);
	}
}

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

function removeUnwantedReactions(hostID, message, joinEmoji)
{
	const unwantedReactions =
	    message.reactions.cache.filter((react) => react.emoji.id !== joinEmoji.id);

	for (const reaction of unwantedReactions.values())
		reaction.remove().catch((err) =>
					    console.error(`Failed to remove reactions: ${err}`));

	const joinReaction = message.reactions.cache.get(joinEmoji.id);

	if (joinReaction === undefined)
		return;

	const unwantedReactionUsers = joinReaction.users.cache.filter(
	    (user) => (user.id !== hostID && user.id !== client.user.id));

	for (const user of unwantedReactionUsers.values())
		joinReaction.users.remove(user).catch(
		    (err) => console.error(`Failed to remove reactions: ${err}`));
}

function updateJoin(host, joinEmoji)
{
	if (host.joined)
		return;

	const message = host.message;
	const joinReaction = message.reactions.cache.get(joinEmoji.id);

	if (joinReaction === undefined || joinReaction.users.cache.get(host.id) === undefined)
		return;

	host.joined = true;
	const newEmbed = new EmbedBuilder(message.embeds[0]).setDescription("Someone joined!");
	message.edit({embeds : [ newEmbed ]});
}