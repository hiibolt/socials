/** Mount node under document.body so overflow:hidden ancestors can't clip it. */
export function portal(node: HTMLElement) {
	const parent = document.body;
	parent.appendChild(node);
	return {
		destroy() {
			if (node.parentNode === parent) parent.removeChild(node);
		}
	};
}
