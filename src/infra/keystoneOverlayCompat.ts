// Keystone overlays (KsModal, KsPopover, KsTooltip, KsDrawer, etc.) render
// into the browser's top layer via <dialog>. The top layer sits above every
// z-index'd element, including the Agentation feedback toolbar that the
// playground portals into <body> at z-index ~100001. Without this shim, any
// open Keystone overlay hides the feedback toolbar.
//
// The KsOverlay component exposes `deprecatedDisableTopLayer` (+ optional
// `deprecatedZIndexOverride`) specifically for "compatibility with non-
// Keystone overlay components" — which is exactly our situation in dev.
// We set both attributes on every <ks-overlay-*> element as it enters the
// DOM (including inside the shadow roots of KsModal/KsDrawer/etc) so
// vibe-coded modals stay below the feedback toolbar.

// Sit below the Agentation toolbar (~100001) so the playground feedback UI
// remains interactive over any open KsModal.
const Z_INDEX_OVERRIDE = '99999';

function isOverlay(node: Node): node is HTMLElement {
  return node.nodeType === 1 && (node as Element).tagName.toLowerCase().startsWith('ks-overlay');
}

function patch(el: HTMLElement) {
  if (el.hasAttribute('deprecated-disable-top-layer')) return;
  el.setAttribute('deprecated-disable-top-layer', 'true');
  el.setAttribute('deprecated-z-index-override', Z_INDEX_OVERRIDE);
}

export function installKeystoneOverlayCompat() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if ((window as Window & { __ksOverlayCompatInstalled?: boolean }).__ksOverlayCompatInstalled) return;
  (window as Window & { __ksOverlayCompatInstalled?: boolean }).__ksOverlayCompatInstalled = true;

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node instanceof Element) walk(node);
      });
    }
  });

  const observe = (root: Node) => {
    observer.observe(root, { childList: true, subtree: true });
  };

  const walk = (root: ParentNode) => {
    if (root instanceof Element) {
      if (isOverlay(root)) patch(root);
      if (root.shadowRoot) {
        observe(root.shadowRoot);
        walk(root.shadowRoot);
      }
    }
    root.querySelectorAll?.('*').forEach((el) => {
      if (isOverlay(el)) patch(el as HTMLElement);
      if (el.shadowRoot) {
        observe(el.shadowRoot);
        walk(el.shadowRoot);
      }
    });
  };

  // Custom elements call attachShadow lazily on construction. Patch it so we
  // start observing each shadow root the instant it's created (this catches
  // the <ks-overlay-*> that KsModal renders inside its shadow root).
  const originalAttachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function attachShadow(init: ShadowRootInit) {
    const root = originalAttachShadow.call(this, init);
    observe(root);
    queueMicrotask(() => walk(root));
    return root;
  };

  const start = () => {
    walk(document.body);
    observe(document.body);
  };

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
}
