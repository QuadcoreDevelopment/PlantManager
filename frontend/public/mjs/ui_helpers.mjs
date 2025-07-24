/**
 * Creates a div that will center it self in the center of its parent.
 * The created div will not be attached to the DOM.
 * It will center in both x and y
 * 
 * @returns {*} the created div
 */
export function createCenteredDiv()
{
	let div = $("<div>");
	div.prop("class", "text-center justify-content-center w-100 position-relative top-50 start-0 translate-middle-y");
	div.prop("style","margin-top:40vh; margin-bottom:-30vh;");
	return div;
}

/**
 * Creates a Bootstrap loading spinner with a message displayed under it.
 * The created spinner gets appended to the parentDiv.
 * @param {*} parentDiv The parent to which the spinner will be appended.
 * @param {*} message will be displayed under the spinner.
 */
export function createSpinner(parentDiv, message)
{
	let spinner = $('<div class="spinner-border text-primary" role="status">');
	let text = $('<p>');
	text.text(message);
	parentDiv.append(spinner);
	parentDiv.append(text);
}

/**
 * Creates a large Bootstrap icon with a small text that will be attached to the supplied parent.
 * @param {*} parent the parent to which it will be attached.
 * @param {string} bsicon the Bootstrap icon string like "bi-leaf".
 * @param {string} text the message that will be displayed under the icon
 */
export function createCenteredIconAndText(parent, bsicon, text)
{
	let centeredDiv = createCenteredDiv();
	parent.html(centeredDiv);
	let icon = $("<i>");
	icon.prop("class","bi text-primary " + bsicon);
	icon.prop("style","font-size: 5rem;")
	centeredDiv.append(icon);
	let p = $("<p>");
	p.text(text);
	centeredDiv.append(p);
}