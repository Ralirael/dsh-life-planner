function Icon(props) {
  const size = props.size || 18;
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, style: { display: 'block' } },
    h('path', {
      d: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h4l1.6 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.6,
      strokeLinejoin: 'round',
    }),
    h('path', {
      d: 'M8.5 13.5l2 2 4-4.5',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
  );
}

// The default boolean control: an oval slider, placed at the right edge of its
// row by the caller (`lp-switch-row`).
function Switch(props) {
  const on = Boolean(props.value);
  return h(
    'button',
    {
      type: 'button',
      role: 'switch',
      'aria-label': props.label,
      'aria-checked': String(on),
      className: 'lp-toggle',
      'data-on': String(on),
      disabled: props.disabled ? true : undefined,
      onClick: () => props.onChange && props.onChange(!on),
    },
    h('span', { className: 'lp-toggle-track' }, h('span', { className: 'lp-toggle-knob' })),
  );
}

/** Enter/Space on a custom row or card re-runs its click behaviour. */
function keyActivate(handler) {
  return (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    event.preventDefault();
    handler(event);
  };
}

/**
 * One dialog shell for every modal: a fixed backdrop, Esc to close, the first
 * focusable child focused on open, Tab cycling inside, and a click on the
 * backdrop closing it. Callers keep their own title and action buttons.
 */
function Modal(props) {
  const panelRef = React.useRef(null);
  const closeRef = React.useRef(props.onClose);
  React.useEffect(() => {
    closeRef.current = props.onClose;
  });
  React.useEffect(() => {
    const node = panelRef.current;
    if (!node || typeof document === 'undefined') return undefined;
    const previous = document.activeElement;
    const focusables = () =>
      Array.from(
        node.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]',
        ),
      ).filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0);
    const first = focusables()[0];
    if (first && typeof first.focus === 'function') first.focus();
    const onKeyDown = (event) => {
      const dialogs = document.querySelectorAll('.lp-backdrop .lp-modal');
      if (dialogs[dialogs.length - 1] !== node || event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (typeof closeRef.current === 'function') closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) {
        event.preventDefault();
        return;
      }
      const index = list.indexOf(document.activeElement);
      const last = list.length - 1;
      if (event.shiftKey) {
        if (index <= 0) {
          event.preventDefault();
          list[last].focus();
        }
        return;
      }
      if (index === -1 || index === last) {
        event.preventDefault();
        list[0].focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, []);
  const className = props.className ? `lp-modal ${props.className}` : 'lp-modal';
  const children = Array.isArray(props.children)
    ? props.children
    : props.children === undefined
      ? []
      : [props.children];
  return h(
    'div',
    {
      className: 'lp-backdrop',
      onClick: (event) => {
        if (event.target === event.currentTarget && typeof props.onClose === 'function') props.onClose();
      },
    },
    h(
      'div',
      {
        className,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': typeof props.title === 'string' ? props.title : undefined,
        'data-lp-confirm': props.confirm ? 'centered' : undefined,
        ref: panelRef,
        style: props.wide ? { width: 'min(760px,100%)' } : undefined,
        onClick: (event) => event.stopPropagation(),
      },
      // Spread the children back into argument position: an array child would
      // make React ask for keys on dialog content that never needs any.
      ...[props.title ? h('div', { className: 'lp-modal-title' }, props.title) : null, ...children],
    ),
  );
}

// Anchored menus share one placement model: fixed coordinates measured from
// the trigger, recomputed while the page scrolls (capture, so inner scrollers
// count) or resizes, and removed as soon as the menu closes.
let anchoredMenuSeq = 0;

function anchoredMenuPosition(rect, viewport, { minWidth, maxHeight, height, align }) {
  const margin = 8;
  const gap = 4;
  const width = Math.min(Math.max(rect.width, minWidth), Math.max(0, viewport.width - 2 * margin));
  const left = Math.max(margin, Math.min(align === 'end' ? rect.right - width : rect.left, viewport.width - width - margin));
  const below = Math.max(0, viewport.height - margin - rect.bottom - gap);
  const above = Math.max(0, rect.top - gap - margin);
  const desired = Math.min(maxHeight, height);
  const openBelow = below >= desired || below >= above;
  const cap = Math.min(maxHeight, openBelow ? below : above);
  const top = openBelow ? rect.bottom + gap : rect.top - gap - Math.min(desired, cap);
  return { left, top, width, maxHeight: cap };
}

function useAnchoredMenu(config) {
  const options = React.useRef(config);
  options.current = config;
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const [active, setActive] = React.useState(-1);
  const [menuId] = React.useState(() => `lp-menu-${(anchoredMenuSeq += 1)}`);
  const anchorRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const measure = () => {
    const node = anchorRef.current;
    if (!node || !node.isConnected || typeof window === 'undefined') return null;
    const current = options.current || {};
    const count = Number(current.count) || 0;
    const rect = node.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return null;
    return anchoredMenuPosition(rect, { width: window.innerWidth, height: window.innerHeight }, {
      minWidth: Number(current.minWidth) || 190,
      maxHeight: Number(current.maxHeight) || 240,
      height: menuRef.current ? menuRef.current.scrollHeight + 2 : Math.max(1, count) * (Number(current.itemHeight) || 34) + 12,
      align: current.align,
    });
  };

  const show = (anchor) => {
    if (typeof anchor?.getBoundingClientRect === 'function') anchorRef.current = anchor;
    const current = options.current || {};
    const next = measure();
    if (next) setPos(next);
    const count = Number(current.count) || 0;
    const start = Number(current.activeIndex);
    setActive(Number.isInteger(start) && start >= 0 && start < count ? start : -1);
    setOpen(true);
  };

  const hide = (restoreFocus = false) => {
    setOpen(false);
    setActive(-1);
    options.current.onClose?.();
    if (restoreFocus === true) anchorRef.current?.focus();
  };

  const toggle = () => (open ? hide() : show());

  const choose = (index) => {
    const current = options.current || {};
    const count = Number(current.count) || 0;
    if (index < 0 || index >= count) return;
    if (typeof current.onChoose === 'function') current.onChoose(index);
    if (current.closeOnChoose !== false) hide();
  };

  const onKeyDown = (event) => {
    const current = options.current || {};
    const count = Number(current.count) || 0;
    if (event.key === 'Escape') {
      if (!open) return;
      // Keep Esc inside the popup so an enclosing Modal stays open; the native
      // stop covers React delegating keydown at the document root.
      event.preventDefault();
      event.stopPropagation();
      if (event.nativeEvent && typeof event.nativeEvent.stopImmediatePropagation === 'function') {
        event.nativeEvent.stopImmediatePropagation();
      }
      hide(true);
      return;
    }
    if (open && event.key === 'Tab') {
      hide();
      return;
    }
    if (!open) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Spacebar' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp'
      ) {
        event.preventDefault();
        show();
        if (event.key === 'ArrowUp') setActive(count > 0 ? count - 1 : -1);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (count === 0 ? -1 : (index + 1 + count) % count));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (count === 0 ? -1 : (index - 1 + count) % count));
      return;
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      choose(active);
    }
  };

  React.useEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const next = measure();
      if (!next) {
        hide();
        return;
      }
      setPos((previous) =>
        previous && previous.left === next.left && previous.top === next.top && previous.width === next.width &&
          previous.maxHeight === next.maxHeight
          ? previous
          : next,
      );
    };
    const outside = (event) => {
      if (!anchorRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) hide();
    };
    const escape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      hide(true);
    };
    place();
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', escape, true);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    const observer = anchorRef.current && typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => { if (entry && !entry.isIntersecting) hide(); })
      : null;
    if (observer) observer.observe(anchorRef.current);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', escape, true);
      observer?.disconnect();
    };
  }, [open, config.count]);

  return {
    open,
    pos,
    active,
    anchorRef,
    menuRef,
    menuId,
    show,
    hide,
    toggle,
    onKeyDown,
    getItemProps: (index, selected) => ({
      key: `${menuId}-opt-${index}`,
      id: `${menuId}-opt-${index}`,
      className: 'lp-dd-item',
      type: 'button',
      role: 'option',
      tabIndex: -1,
      'aria-selected': String(Boolean(selected)),
      'data-active': String(active === index),
      onMouseEnter: () => setActive(index),
      onClick: () => choose(index),
    }),
  };
}

function Dropdown(props) {
  const options = Array.isArray(props.options) ? props.options : [];
  const selectedIndex = options.findIndex((option) => option.value === props.value);
  const current = options[selectedIndex];
  const menu = useAnchoredMenu({
    count: options.length,
    activeIndex: selectedIndex,
    minWidth: 190,
    itemHeight: 34,
    maxHeight: 240,
    onChoose: (index) => {
      const option = options[index];
      if (!option) return;
      if (option.value !== props.value) props.onChange(option.value);
    },
  });

  return h(
    'div',
    { className: 'lp-dd' },
    h(
      'button',
      {
        className: 'lp-select lp-dd-btn',
        type: 'button',
        ref: menu.anchorRef,
        // Inline fill: the toolbar control must be visibly translucent even if
        // an outer stylesheet rule is missing or loses the cascade.
        style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
        'data-lp-surface': 'control',
        'aria-haspopup': 'listbox',
        'aria-expanded': String(menu.open),
        'aria-controls': menu.open ? menu.menuId : undefined,
        'aria-activedescendant':
          menu.open && menu.active >= 0 && menu.active < options.length
            ? `${menu.menuId}-opt-${menu.active}`
            : undefined,
        onClick: menu.toggle,
        onKeyDown: menu.onKeyDown,
      },
      h('span', { className: 'lp-dd-value' }, current ? current.label : props.placeholder || ''),
      h('span', { className: 'lp-dd-caret', 'aria-hidden': true }, '▾'),
    ),
    menu.open && menu.pos
      ? h(
          'div',
          null,
          h(
            'div',
            {
              className: 'lp-dd-menu',
              role: 'listbox',
              ref: menu.menuRef,
              id: menu.menuId,
              tabIndex: -1,
              style: menu.pos,
              onKeyDown: menu.onKeyDown,
            },
            options.map((option, index) =>
              h('button', menu.getItemProps(index, option.value === props.value), option.label),
            ),
          ),
        )
      : null,
  );
}

/** Tag chips plus the location marker, shown wherever a task appears. */
function TagChips(props) {
  const item = props.item || {};
  const list = props.tags || item.tags || [];
  const location = item.location;
  if (list.length === 0 && !location) return null;
  const max = props.max || 2;
  const shown = list.slice(0, max);
  const rest = list.length - shown.length;
  return h(
    React.Fragment,
    null,
    shown.map((tag) =>
      h(
        'span',
        {
          key: tag,
          className: 'lp-tag',
          title: tag,
          style: { color: colorOfName(tag, props.colorOverrides, 'tag'), border: `1px solid ${colorOfName(tag, props.colorOverrides, 'tag')}` },
        },
        tag,
      ),
    ),
    rest > 0 ? h('span', { className: 'lp-meta' }, `+${rest}`) : null,
    location ? h('span', { className: 'lp-meta', title: location }, `📍${location}`) : null,
  );
}

/** Task type chip; an unset type still shows so the slot stays readable. */
function TypeChip(props) {
  const type = props.type || '';
  return h(
    'span',
    {
      className: 'lp-type',
      title: props.fallback,
      style: { color: type ? colorOfName(type, props.colorOverrides) : 'var(--dsw-alias-label-secondary)' },
    },
    type || props.fallback,
  );
}
