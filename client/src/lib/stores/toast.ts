import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastData[]>([]);

	function show(type: ToastType, message: string, duration = 3000) {
		const id = Math.random().toString(36).substring(2, 9);
		const toast: ToastData = { id, type, message, duration };

		update((toasts) => [...toasts, toast]);
		return id;
	}

	return {
		subscribe,
		success: (message: string, duration?: number) => show('success', message, duration),
		error: (message: string, duration?: number) => show('error', message, duration),
		warning: (message: string, duration?: number) => show('warning', message, duration),
		info: (message: string, duration?: number) => show('info', message, duration),
		dismiss: (id: string) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		},
		clear: () => {
			update(() => []);
		}
	};
}

export const toast = createToastStore();
