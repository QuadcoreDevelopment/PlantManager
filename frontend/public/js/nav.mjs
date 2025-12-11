// Set the active link based on the current page
document.querySelectorAll('.nav-link').forEach(link => {
	const currentPage = location.pathname.split('/').pop() || 'index.html';
	if (link.getAttribute('href') === currentPage) {
		link.classList.add('active');
	}
});