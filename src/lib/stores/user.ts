import { writable } from 'svelte/store';
import type { User } from '$lib/auth-client';

export const userStore = writable<User | null>(null);
