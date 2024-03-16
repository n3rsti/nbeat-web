import type { MessageModel } from "./message.model";
import { SongBuilder, type SongModel } from "./song.model";

export class ChannelModel {
	private _id: string;
	private _name: string;
	private _owner: string;
	private _lastSong: SongModel;
	private _messages: MessageModel[];
	private _queue: SongModel[];

	constructor(id: string, name: string, owner: string, lastSong: SongModel, messages: MessageModel[], queue: SongModel[]) {
		this._id = id;
		this._name = name;
		this._owner = owner;
		this._messages = messages;
		this._lastSong = lastSong;
		this._queue = queue;
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

	get lastSong(): SongModel {
		return this._lastSong;
	}

	set lastSong(value: SongModel) {
		this._lastSong = value;
	}

	get messages(): MessageModel[] {
		return this._messages;
	}

	set messages(value: MessageModel[]) {
		this._messages = value;
	}

	get queue() {
		return this._queue;
	}

	set queue(queue: SongModel[]) {
		this._queue = queue;
	}
}

export class ChannelBuilder extends ChannelModel {
	constructor() {
		super('', '', '', new SongBuilder().build(), [], [])
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

	setLastSong(last_song: SongModel) {
		this.lastSong = last_song;
		return this;
	}

	setMessages(messages: MessageModel[]) {
		this.messages = messages;
		return this;
	}

	setQueue(queue: SongModel[]) {
		this.queue = queue;
		return this;
	}

	build() {
		return new ChannelModel(
			this.id,
			this.name,
			this.owner,
			this.lastSong,
			this.messages,
			this.queue,
		)
	}
}
