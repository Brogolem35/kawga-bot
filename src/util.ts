import {APIEmbed, Client, EmbedBuilder, Emoji, Message, TextChannel, User} from "discord.js";

import {HOST_LIFESPAN, JOIN_LIFESPAN, REMOVE_UNWANTED_REACTIONS} from "./config.js";
import {Host} from "./Host";

export function updateHosts(client: Client, hostMap: Map<string, Host>, joinEmoji: Emoji)
{
	for (const [hostID, host] of hostMap.entries()) {
		// deletes "joined" messages when they stay longer than JOIN_LIFESPAN
		if (JOIN_LIFESPAN > 0) {
			if (host.joined && host.joinDate !== null &&
			    (Date.now() - host.joinDate) >= JOIN_LIFESPAN) {
				hostMap.delete(hostID);
				host.message.delete().catch(console.error);
				continue;
			}
		}

		// deletes messages when they stay longer than HOST_LIFESPAN
		if ((Date.now() - host.message.createdTimestamp) >= HOST_LIFESPAN) {
			hostMap.delete(hostID);
			host.message.delete().catch(console.error);
			continue;
		}

		if (REMOVE_UNWANTED_REACTIONS)
			removeUnwantedReactions(client, hostID, host.message, joinEmoji);

		updateJoin(host, joinEmoji);
	}
}

export function fetchChannels(client: Client, sourceChannelIDs: string[]): TextChannel[]
{
	const sourceChannels: TextChannel[] = [];

	for (const id of sourceChannelIDs) {
		client.channels.fetch(id)
		    .then((channel) => { sourceChannels.push(channel as TextChannel); })
		    .catch(() => { console.error(`Couldn't fetch the channel: ${id}`); });
	}

	return sourceChannels;
}

export function validateEnv(): {res: Boolean, err: string|null}
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

function removeUnwantedReactions(client: Client, hostID: string, message: Message, joinEmoji: Emoji)
{
	const unwantedReactions =
	    message.reactions.cache.filter((react) => react.emoji.id !== joinEmoji.id);

	for (const reaction of unwantedReactions.values())
		reaction.remove().catch((err) =>
					    console.error(`Failed to remove reactions: ${err}`));

	const joinReaction = message.reactions.cache.get(joinEmoji.id!);

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
	const joinReaction = message.reactions.cache.get(joinEmoji.id!);

	if (joinReaction === undefined || joinReaction.users.cache.get(host.id) === undefined)
		return;

	host.join();
	const newEmbed =
	    new EmbedBuilder(message.embeds[0] as APIEmbed).setDescription("Someone joined!");
	message.edit({embeds : [ newEmbed ]});
}
