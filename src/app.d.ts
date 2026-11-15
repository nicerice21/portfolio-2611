import type { Component } from 'svelte';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '*.md' {
	export const metadata: Record<string, unknown>;
	const component: Component;
	export default component;
}

export {};
