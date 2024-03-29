"use strict";

var home = 'home';

window.onpopstate = (event) => {
	loadPage()
};

window.onhashchange = (event) => {
	loadPage()
};

window.onload = (event) => {
	loadPage()
};

function loadPage() {
	// Grab hash and load appropriate template
	var hash = window.location.hash.slice(1).toLowerCase() || home
	hash = hash.replaceAll('-', '_')
	let template = window.house.templates[hash]
	
	// Remove hidden class on elements
	$('#content').removeClass('hidden')

	// Set template HTML on content div
	let contentDiv = $('#content')
	contentDiv.html(template)
}