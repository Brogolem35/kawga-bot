import {EmbedBuilder} from "discord.js";

const HOST_LIFESPAN = 3600000; // How long the hosting message will be displayed in millis

export function updateHosts(client, hostMap, joinEmoji)
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

export function fetchChannels(client, sourceChannelIDs)
{
	const sourceChannels = [];

	for (const id of sourceChannelIDs) {
		client.channels.fetch(id)
		    .then((channel) => { sourceChannels.push(channel); })
		    .catch(() => { console.error(`Couldn't fetch the channel: ${id}`); });
	}

	return sourceChannels;
}

function removeUnwantedReactions(client, hostID, message, joinEmoji)
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