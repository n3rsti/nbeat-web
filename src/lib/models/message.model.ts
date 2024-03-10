import { SongBuilder, SongModel } from "./song.model";

export class MessageModel {
	private _id: string;
	private _content: string;
	private _author: string;
	private _type: string;

	constructor(id: string, content: string, author: string, type: string) {
		this._id = id;
		this._content = content;
		this._author = author;
		this._type = type;
	}

	get id() {
		return this._id;
	}

	get content() {
		return this._content;
	}

	get author() {
		return this._author;
	}

	get type() {
		return this._type;
	}

	get timestamp() {
		const timestampHex = this.id.substring(0, 8);
		const timestampInSeconds = parseInt(timestampHex, 16);
		const timestampInMilliseconds = timestampInSeconds * 1000;
		return timestampInMilliseconds;
	}

	get humanReadableTimestamp() {
		const date = new Date(this.timestamp);
		const currentDate = new Date();

		// Check if the date is today
		if (
			date.getDate() === currentDate.getDate() &&
			date.getMonth() === currentDate.getMonth() &&
			date.getFullYear() === currentDate.getFullYear()
		) {
			// Return hour:minutes in 24h format
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			return `${hours}:${minutes}`;
		} else {
			// Return day and hour:minutes in 24h format
			const day = date.getDate().toString().padStart(2, '0');
			const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			const month = monthNames[date.getMonth()];
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			return `${day} ${month} ${hours}:${minutes}`;
		}
	}

	get formattedSongMessage(): SongModel {
		const song = SongBuilder.buildFromJsonContent(this.content)
		return song
	}

	set id(id: string) {
		this._id = id;
	}

	set content(content: string) {
		this._content = content;
	}

	set author(author: string) {
		this._author = author;
	}

	set type(type: string) {
		this._type = type;
	}


}

export class MessageBuilder extends MessageModel {
	constructor() {
		super('', '', '', '');
	}

	setId(id: string) {
		this.id = id;
		return this;
	}

	setContent(content: string) {
		this.content = content;
		return this;
	}

	setAuthor(author: string) {
		this.author = author;
		return this;
	}

	setType(type: string) {
		this.type = type;
		return this;
	}

	build() {
		return new MessageModel(this.id, this.content, this.author, this.type);
	}
}
