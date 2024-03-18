class UserModel {
	private _id: string;
	private _followedChannels: string[];

	constructor(id: string, followedChannels: string[]) {
		this._id = id;
		this._followedChannels = followedChannels;
	}


	get id(): string {
		return this._id;
	}

	set id(id: string) {
		this._id = id;
	}

	get followedChannels(): string[] {
		return this._followedChannels;
	}

	set followedChannels(channels: string[]) {
		this._followedChannels = channels;
	}
}

class UserBuilder extends UserModel {

	constructor() {
		super("", []);
	}

	setId(id: string) {
		this.id = id;
		return this;
	}

	setFollowedChannels(channels: string[]) {
		this.followedChannels = channels;
		return this;
	}


	build(): UserModel {
		return new UserModel(this.id, this.followedChannels);
	}
}

export { UserModel, UserBuilder };
