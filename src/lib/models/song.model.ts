export class SongModel {
	private _id: string;
	private _name: string;
	private _thumbnail: string;
	private _duration: string;

	constructor(id: string, name: string, thumbnail: string, duration: string) {
		this._id = id;
		this._name = name;
		this._thumbnail = thumbnail;
		this._duration = duration;
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

	get duration(): string {
		return this._duration;
	}

	get formattedDuration() {
		const regex = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
		const matches = this.duration.match(regex);

		return {
			years: matches && matches[1] ? parseInt(matches[1], 10) : 0,
			months: matches && matches[2] ? parseInt(matches[2], 10) : 0,
			days: matches && matches[3] ? parseInt(matches[3], 10) : 0,
			hours: matches && matches[4] ? parseInt(matches[4], 10) : 0,
			minutes: matches && matches[5] ? parseInt(matches[5], 10) : 0,
			seconds: matches && matches[6] ? parseInt(matches[6], 10) : 0,
		};
	}

	get durationSeconds() {
		const formattedDuration = this.formattedDuration;
		return formattedDuration.hours * 60 * 60 + formattedDuration.minutes * 60 + formattedDuration.seconds;
	}

	get readableDuration() {
		const formattedDuration = this.formattedDuration;

		const hours = formattedDuration.hours;
		const minutes = formattedDuration.minutes;
		const seconds = formattedDuration.seconds;


		const paddedMinutes = minutes.toString().padStart(2, '0');
		const paddedSeconds = Math.ceil(seconds).toString().padStart(2, '0');

		if (hours === 0) {
			return `${paddedMinutes}:${paddedSeconds}`
		}

		return `${hours}:${paddedMinutes}:${paddedSeconds}`;
	}

	set duration(value: string) {
		this._duration = value;
	}
}


export class SongBuilder extends SongModel {
	constructor() {
		super('', '', '', '');
	}

	setId(id: string) {
		this.id = id;
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

	setDuration(duration: string) {
		this.duration = duration;
		return this;
	}

	build(): SongModel {
		return new SongModel(this.id, this.name, this.thumbnail, this.duration);
	}

	static buildFromJsonContent(content) {
		const parsedContent = JSON.parse(content).items[0];

		const song = new SongBuilder()
			.setId(parsedContent.id)
			.setName(parsedContent.snippet.title)
			.setThumbnail(parsedContent.snippet.thumbnails.default.url)
			.setDuration(parsedContent.contentDetails.duration)
			.build();

		return song;
	}
}
