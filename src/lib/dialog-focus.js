// Keep keyboard navigation inside an open dialog and return focus on close.
export function dialogFocus(node) {
  const previous = document.activeElement;
  const focusable = () =>
    [
      ...node.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled):not([hidden]), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
      ),
    ].filter((el) => el.getClientRects().length);
  node.setAttribute("tabindex", "-1");
  (focusable()[0] || node).focus();
  const trap = (event) => {
    if (event.key !== "Tab") return;
    const targets = focusable();
    const first = targets[0] || node,
      last = targets.at(-1) || node;
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        !node.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        !node.contains(document.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  };
  node.addEventListener("keydown", trap);
  return {
    destroy() {
      node.removeEventListener("keydown", trap);
      if (previous?.isConnected) previous.focus();
    },
  };
}
