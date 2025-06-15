export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/about": [3],
		"/admin": [4],
		"/admin/customer-service": [5],
		"/admin/database": [6],
		"/admin/emoji-stats": [7],
		"/admin/product-manager": [8],
		"/auth-debug": [9],
		"/auth-test": [10],
		"/clear-storage": [11],
		"/dashboard": [12],
		"/emoji-gallery": [13],
		"/emoji-master": [14],
		"/help-feedback": [15],
		"/login": [16],
		"/me": [17],
		"/my-works": [18],
		"/orders": [19],
		"/photo-gallery": [20],
		"/photo-to-image": [21],
		"/register": [22],
		"/shop": [23],
		"/showcase": [24],
		"/test-douban-api": [25],
		"/test-images": [26],
		"/test-volcano-cv": [27]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';