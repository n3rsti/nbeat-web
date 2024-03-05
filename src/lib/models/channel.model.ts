export class ChannelModel {
	private _id: string;
	private _name: string;
	private _owner: string;
	private _last_song: string;
	private _last_song_played_at: number;
	private _messages: string[];

	constructor(id: string, name: string, owner: string, last_song: string, last_song_played_at: number, messages: string[]) {
		this._id = id;
		this._name = name;
		this._owner = owner;
		this._last_song = last_song;
		this._last_song_played_at = last_song_played_at;
		this._messages = messages;
	}

	get id(): string {
		return this._id;
	}

	set id(value: string) {
		this._id = value;
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get owner(): string {
		return this._owner;
	}

	set owner(value: string) {
		this._owner = value;
	}

	get last_song(): string {
		return this._last_song;
	}

	set last_song(value: string) {
		this._last_song = value;
	}

	get last_song_played_at(): number {
		return this._last_song_played_at;
	}

	set last_song_played_at(value: number) {
		this._last_song_played_at = value;
	}

	get messages(): string[] {
		return this._messages;
	}

	set messages(value: string[]) {
		this._messages = value;
	}
}

export class ChannelBuilder extends ChannelModel {
	constructor() {
		super('', '', '', '', 0, [])
	}

	setId(id: string) {
		this.id = id;
		return this;
	}

	setName(name: string) {
		this.name = name;
		return this;
	}

	setOwner(owner: string) {
		this.owner = owner;
		return this;
	}

	setLastSong(last_song: string) {
		this.last_song = last_song;
		return this;
	}

	setLastSongPlayedAt(last_song_played_at: number) {
		this.last_song_played_at = last_song_played_at;
		return this;
	}

	setMessages(messages: string[]) {
		this.messages = messages;
		return this;
	}

	build() {
		return new ChannelModel(
			this.id,
			this.name,
			this.owner,
			this.last_song,
			this.last_song_played_at,
			this.messages
		)
	}
}
