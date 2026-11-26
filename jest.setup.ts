import "@testing-library/jest-dom";

// jsdom has no PointerEvent, which Base UI checkboxes dispatch on click.
if (typeof window !== "undefined" && !window.PointerEvent) {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
}
