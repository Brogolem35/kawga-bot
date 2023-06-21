import {Message} from "discord.js";

export class Host
{
	id: string;
	message: Message;
	joined: Boolean;

	constructor(_id: string, _message: Message<boolean>)
	{
		this.id = _id;
		this.message = _message;
		this.joined = false;
	}
}