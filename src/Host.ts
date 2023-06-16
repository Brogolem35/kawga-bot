import { Message, Snowflake } from "discord.js";

export class Host
{
	id: Snowflake;
	message: Message;
	joined: Boolean;
	
	constructor(_id: string, _message: Message<boolean>)
	{
		this.id = _id;
		this.message = _message;
		this.joined = false;
	}
}