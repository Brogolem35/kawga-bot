import {APIEmbed,
	Client,
	EmbedBuilder,
	Emoji,
	Message,
	Snowflake,
	TextChannel,
	User} from "discord.js";

import {Host} from "./Host";

const HOST_LIFESPAN = 3600000; // How long the hosting message will be displayed in millis

export function updateHosts(client: Client, hostMap: Map<Snowflake, Host>, joinEmoji: Emoji)
{
	for (const [hostID, host] of hostMap.entries()) {
		// deletes messages when they stay longer than HOST_LIFESPAN
		if ((Date.now() - host.message.createdTimestamp) >= HOST_LIFESPAN) {
			hostMap.delete(hostID);
			host.message.delete().catch(console.error);
		}

		removeUnwantedReactions(client, hostID, host.message, joinEmoji);
		updateJoin(host, joinEmoji);
	}
}

export function fetchChannels(client: Client, sourceChannelIDs: Snowflake[]): TextChannel[]
{
	const sourceChannels: TextChannel[] = [];

	for (const id of sourceChannelIDs) {
		client.channels.fetch(id)
		    .then((channel) => { sourceChannels.push(channel as TextChannel); })
		    .catch(() => { console.error(`Couldn't fetch the channel: ${id}`); });
	}

	return sourceChannels;
}

export function validateEnv(): {res: Boolean, err: String|null}
{
	const env = process.env;

	if (env.SOURCE_CHANNEL_IDS === undefined)
		return {res : false, err : "SOURCE_CHANNEL_IDS"};

	if (env.HOST_CHANNEL_ID === undefined)
		return {res : false, err : "HOST_CHANNEL_ID"};

	if (env.JOIN_EMOJI_ID === undefined)
		return {res : false, err : "JOIN_EMOJI_ID"};

	return {res : true, err : null};
}

function removeUnwantedReactions(client: Client, hostID: Snowflake, message: Message,
				 joinEmoji: Emoji)
{
	const unwantedReactions =
	    message.reactions.cache.filter((react) => react.emoji.id !== joinEmoji.id);

	for (const reaction of unwantedReactions.values())
		reaction.remove().catch((err) =>
					    console.error(`Failed to remove reactions: ${err}`));

	const joinReaction = message.reactions.cache.get(joinEmoji.identifier);

	if (joinReaction === undefined)
		return;

	const unwantedReactionUsers = joinReaction.users.cache.filter(
	    (user) => (user.id !== hostID && user.id !== client.user?.id));

	for (const user of unwantedReactionUsers.values())
		joinReaction.users.remove(user).catch(
		    (err) => console.error(`Failed to remove reactions: ${err}`));
}

function updateJoin(host: Host, joinEmoji: Emoji)
{
	if (host.joined)
		return;

	const message = host.message;
	const joinReaction = message.reactions.cache.get(joinEmoji.identifier);

	if (joinReaction === undefined || joinReaction.users.cache.get(host.id) === undefined)
		return;

	host.joined = true;
	const newEmbed =
	    new EmbedBuilder(message.embeds[0] as APIEmbed).setDescription("Someone joined!");
	message.edit({embeds : [ newEmbed ]});
}
