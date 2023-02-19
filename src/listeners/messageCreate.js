import {EmbedBuilder} from "discord.js";

import {Host} from "../Host.js"
import {hostingChannel, hostMap, joinEmoji, sourceChannels} from "../index.js"

const IP_PORT_REGEX =
    /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}:\d+$/; // Regex for IPv4 with port. Taken from
						       // https://stackoverflow.com/a/36760050 and
						       // modified.
const HOST_IP_PORT_REGEX =
    /^!host +((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}:\d+ */; // !host + IP_PORT_REGEX

export const messageCreateListener = (message) => {
	const content = message.content.trim();
	const sender = message.author;
	const hostID = sender.id;
	const channel = message.channel;

	if (!sourceChannels.includes(channel))
		return;

	const {command, ip, note} = parseMessage(content);

	if (command === null)
		return;

	if (command === "!unhost") {
		unhostCommand(hostID);
		return;
	}

	if (command === "!host" && ip !== null)
		hostCommand(sender, ip, note, message);
};

function hostCommand(sender, ip, note, hostMessage)
{
	const embed =
	    new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor(
		    {name : sender.tag, iconURL : sender.displayAvatarURL(), url : hostMessage.url})
		.setTitle(`IP: ${ip}` + (note !== "" ? `\nNote: ${note}` : ""));

	hostingChannel.send({embeds : [ embed ], allowedMentions : {"users" : []}})
	    .then((ret) => {
		    const prevHost = hostMap.get(sender.id);

		    if (prevHost !== undefined)
			    prevHost.message.delete(sender.id).catch(console.error);

		    hostMap.set(sender.id, new Host(sender.id, ret));
		    ret.react(joinEmoji).catch(console.error);
	    })
	    .catch(console.error);
}

function unhostCommand(hostID)
{
	const host = hostMap.get(hostID);
	hostMap.delete(hostID);
	host.message.delete().catch(console.error);
}

function parseMessage(messageContent)
{
	if (messageContent.charAt(0) !== "!")
		return {command : null, ip : null, note : null};

	const parts = messageContent.split(/ +/);
	const command = parts[0];
	const ip = parts[1];

	if (parts.length < 2) {
		if (command === "!unhost")
			return {command, ip : null, note : null};
	}

	if (command !== "!host" || ip.match(IP_PORT_REGEX) === null)
		return {command : null, ip : null, note : null};

	const noteFull = messageContent.replace(HOST_IP_PORT_REGEX, '').split(/\n+/)[0];
	const note = noteFull.length > 103 ? noteFull.substring(0, 100) + "..." : noteFull;
	return {command, ip, note};
}