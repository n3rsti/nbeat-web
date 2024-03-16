export class SongModel {
	private _id: string;
	private _songId: string;
	private _name: string;
	private _thumbnail: string;
	private _duration: number;
	private _startTime: number;

	constructor(id: string, name: string, thumbnail: string, duration: number, songId: string, startTime: number) {
		this._id = id;
		this._songId = songId;
		this._name = name;
		this._thumbnail = thumbnail;
		this._duration = duration;
		this._startTime = startTime;
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

	get thumbnail(): string {
		return this._thumbnail;
	}

	set thumbnail(value: string) {
		this._thumbnail = value;
	}

	get duration(): number {
		return this._duration;
	}

	set duration(value: number) {
		this._duration = value;
	}

	get songId(): string {
		return this._songId;
	}

	set songId(songId: string) {
		this._songId = songId;
	}

	get startTime() {
		return this._startTime;
	}

	set startTime(startTime: number) {
		this._startTime = startTime;
	}

	get readableDuration() {
		const seconds = this.duration;

		const hours: number = Math.floor(seconds / 3600);
		const minutes: number = Math.floor((seconds % 3600) / 60);
		const remainingSeconds: number = seconds % 60;

		const paddedHours = hours.toString().padStart(2, '0');
		const paddedMinutes = minutes.toString().padStart(2, '0');
		const paddedSeconds = remainingSeconds.toString().padStart(2, '0');

		return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
	}

}


export class SongBuilder extends SongModel {
	constructor() {
		super('', '', '', 0, '', 0);
	}

	setId(id: string) {
		this.id = id;
		return this;
	}

	setSongId(id: string) {
		this.songId = id;
		return this;
	}

	setName(name: string) {
		this.name = name;
		return this;
	}

	setThumbnail(thumbnail: string) {
		this.thumbnail = thumbnail;
		return this;
	}

	setDuration(duration: number) {
		this.duration = duration;
		return this;
	}

	setStartTime(startTime: number) {
		this.startTime = startTime;
		return this;
	}

	build(): SongModel {
		return new SongModel(this.id, this.name, this.thumbnail, this.duration, this.songId, this.startTime);
	}
}
