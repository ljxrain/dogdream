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
	() => import('./nodes/23')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/about": [3],
		"/admin": [4],
		"/admin/customer-service": [5],
		"/admin/database": [6],
		"/admin/product-manager": [7],
		"/clear-storage": [8],
		"/dashboard": [9],
		"/emoji-master": [10],
		"/help-feedback": [11],
		"/login": [12],
		"/me": [13],
		"/my-works": [14],
		"/orders": [15],
		"/photo-gallery": [16],
		"/photo-to-image": [17],
		"/register": [18],
		"/shop": [19],
		"/showcase": [20],
		"/test-douban-api": [21],
		"/test-images": [22],
		"/test-volcano-cv": [23]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
};

export { default as root } from '../root.svelte';