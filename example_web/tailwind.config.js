/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['index.html'],
	theme: {
		extend: {},
	},
	darkMode: 'class',
	plugins: [require('rippleui')],
	rippleui: {
		removeThemes: ['dark']
	},
};
