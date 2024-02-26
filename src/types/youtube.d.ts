declare global {
	interface Window {
		onYouTubeIframeAPIReady: () => void;
	}

	namespace YT {
		class Player {
			constructor(id: string, options: PlayerOptions);
			// Basic player controls
			playVideo(): void;
			getDuration(): number;
			pauseVideo(): void;
			stopVideo(): void;
			seekTo(seconds: number, allowSeekAhead: boolean): void;
			mute(): void;
			unMute(): void;
			isMuted(): boolean;
			setVolume(volume: number): void;
			getVolume(): number;
			// Playback status
			getPlayerState(): number;
			getCurrentTime(): number;
			// Video details
			getVideoUrl(): string;
			getVideoEmbedCode(): string;
			// Events
			addEventListener(event: string, listener: (event: any) => void): void;
			// Etc. - Add more methods and properties as needed

			// Load a video by ID
			loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
			// Cue a video by ID
			cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;

			// Load a video by URL
			loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
			// Cue a video by URL
			cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
		}

		interface PlayerOptions {
			height: string;
			width: string;
			videoId: string;
			playerVars?: PlayerVars;
			events?: PlayerEvents;
		}

		interface PlayerVars {
			autoplay?: 0 | 1;
			cc_load_policy?: 1;
			color?: 'red' | 'white';
			controls?: 0 | 1;
			loop?: 0 | 1;
			modestbranding?: 1;
			rel?: 0 | 1;
			showinfo?: 0 | 1;
			start?: number;
			end?: number;
			// Etc. - Add more player variable options as needed
		}

		interface PlayerEvents {
			onReady?: (event: { target: YT.Player }) => void;
			onStateChange?: (event: { data: number }) => void;
			onError?: (event: { data: number }) => void;
			// Etc. - Add more event handlers as needed
		}

		// Enumeration for player states for better readability
		enum PlayerState {
			UNSTARTED = -1,
			ENDED = 0,
			PLAYING = 1,
			PAUSED = 2,
			BUFFERING = 3,
			CUED = 5
		}
	}
}

// This line is necessary to allow type declarations in a module.
export { };
