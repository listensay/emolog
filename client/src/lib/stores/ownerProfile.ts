import { writable } from 'svelte/store';

export interface OwnerProfile {
	id?: number;
	nickname?: string;
	avatar?: string;
	profileBackground?: string;
	bio?: string;
	links?: Array<{ order: number; icon: string; name: string; url: string }>;
}

interface OwnerProfileState {
	isLoaded: boolean;
	profile: OwnerProfile;
}

function createOwnerProfileStore() {
	const { subscribe, set } = writable<OwnerProfileState>({
		isLoaded: false,
		profile: {}
	});

	return {
		subscribe,
		setProfile: (profile: OwnerProfile | null) => {
			set({
				isLoaded: true,
				profile: profile || {}
			});
		}
	};
}

export const ownerProfile = createOwnerProfileStore();
