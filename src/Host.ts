import {Message} from "discord.js";

export class Host
{
	id: string;
	message: Message;
	joined: boolean;
	joinDate: number|null; // The date that the "joined" is set to true, in Unix time

	public constructor(_id: string, _message: Message<boolean>)
	{
		this.id = _id;
		this.message = _message;
		this.joined = false;
		this.joinDate = null;
	}

	public join()
	{
		this.joined = true;
		this.joinDate = Date.now();
	}
}