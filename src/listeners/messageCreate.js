import {EmbedBuilder} from "discord.js";

import {Host} from "../Host.js"

const IP_PORT_REGEX =
    /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}:((6553[0-5])|(655[0-2]\d)|(65[0-4]\d{2})|(6[0-4]\d{3})|([1-5]\d{4})|(\d{1,4}))$/; // Regex for IPv4 with port. Taken from
																  // https://stackoverflow.com/a/36760050 and
																  // modified.
const HOST_IP_PORT_REGEX =
    /^!host +((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}:((6553[0-5])|(655[0-2]\d)|(65[0-4]\d{2})|(6[0-4]\d{3})|([1-5]\d{4})|(\d{1,4})) */; // !host + IP_PORT_REGEX

class Command
{	
	constructor(_type, _ip, _note, _sourceMsg)
	{
		this.type = _type;
		this.ip = _ip;
		this.note = _note;
		this.sourceMsg = _sourceMsg;
	}
}

export const messageCreateListener =
    (message, hostingChannel, hostMap, joinEmoji, sourceChannels) => {
	    const hostID = message.author.id;
	    const channel = message.channel;

	    if (!sourceChannels.includes(channel))
		    return;

	    const command = parseMessage(message);

	    if (command === null)
		    return;

	    if (command.type === "!unhost") {
		    unhostCommand(hostID, hostMap);
		    return;
	    }

	    if (command.type === "!host" && command.ip !== null)
		    hostCommand(command, hostingChannel, hostMap, joinEmoji);
    };

function hostCommand(command, hostingChannel, hostMap, joinEmoji)
{
	const {ip, note, sourceMsg : msg} = command;
	const sender = msg.author;

	const embed =
	    new EmbedBuilder()
		.setColor(0x0099FF)

		.setAuthor(
		    {name : sender.tag, iconURL : sender.displayAvatarURL(), url : msg.url})
		.setTitle(`IP: ${ip}` + (note !== "" ? `\nNot: ${note}` : ""));


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

function unhostCommand(hostID, hostMap)
{
	const host = hostMap.get(hostID);

	if (host === undefined)
		return;

	hostMap.delete(hostID);
	host.message.delete().catch(console.error);
}

function parseMessage(message)
{
	const content = message.content;

	if (content.charAt(0) !== "!")
		return null;

	const parts = content.split(/ +/);
	const command = parts[0];
	const ip = parts[1];

	if (parts.length < 2) {
		if (command === "!unhost")
			return new Command(command, null, null, message);
	}

	if (command !== "!host" || ip.match(IP_PORT_REGEX) === null)
		return null;

	const noteFull = content.replace(HOST_IP_PORT_REGEX, '').split(/\n+/)[0];
	const note = noteFull.length > 103 ? noteFull.substring(0, 100) + "..." : noteFull;
	return new Command(command, ip, note, message);
}