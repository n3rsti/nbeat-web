export class MessageModel {
	private _id: string;
	private _content: string;
	private _author: string;

	constructor(id: string, content: string, author: string) {
		this._id = id;
		this._content = content;
		this._author = author;
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

	set id(id: string) {
		this._id = id;
	}

	set content(content: string) {
		this._content = content;
	}

	set author(author: string) {
		this._author = author;
	}


}

export class MessageBuilder extends MessageModel {
	constructor() {
		super('', '', '');
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

	build() {
		return new MessageModel(this.id, this.content, this.author);
	}
}
