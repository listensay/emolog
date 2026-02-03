import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$lib/types/user';

interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	token: string | null;
}

function createAuthStore() {
	// 从localStorage初始化状态
	const initialState: AuthState = {
		isAuthenticated: false,
		user: null,
		token: null
	};

	if (browser) {
		const token = localStorage.getItem('token');
		const userStr = localStorage.getItem('user');

		if (token && userStr) {
			try {
				initialState.token = token;
				initialState.user = JSON.parse(userStr);
				initialState.isAuthenticated = true;
			} catch (error) {
				console.error('Failed to parse user data:', error);
			}
		}
	}

	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		login: (token: string, user: User) => {
			if (browser) {
				localStorage.setItem('token', token);
				localStorage.setItem('user', JSON.stringify(user));
			}
			set({
				isAuthenticated: true,
				user,
				token
			});
		},
		logout: () => {
			if (browser) {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			}
			set({
				isAuthenticated: false,
				user: null,
				token: null
			});
		},
		updateUser: (userData: Partial<User>) => {
			update(state => {
				if (!state.user) return state;
				const newUser = { ...state.user, ...userData };
				if (browser) {
					localStorage.setItem('user', JSON.stringify(newUser));
				}
				return {
					...state,
					user: newUser
				};
			});
		},
		checkAuth: () => {
			if (!browser) return false;

			const token = localStorage.getItem('token');
			const userStr = localStorage.getItem('user');

			if (token && userStr) {
				try {
					const user = JSON.parse(userStr);
					update(state => ({
						...state,
						isAuthenticated: true,
						user,
						token
					}));
					return true;
				} catch (error) {
					console.error('Failed to parse user data:', error);
					return false;
				}
			}
			return false;
		}
	};
}

export const auth = createAuthStore();
