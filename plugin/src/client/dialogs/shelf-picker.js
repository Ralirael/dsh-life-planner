function ShelfPicker(props) {
  const t = props.t;
  const items = props.items || [];
  const selected = props.selected || [];
  const toggle = (id) =>
    props.onChange(selected.includes(id) ? selected.filter((one) => one !== id) : [...selected, id]);
  const menu = useAnchoredMenu({
    count: items.length,
    activeIndex: -1,
    minWidth: 260,
    itemHeight: 30,
    maxHeight: 260,
    // Picking here toggles one item; the menu stays open for the next one.
    closeOnChoose: false,
    onChoose: (index) => {
      const item = items[index];
      if (item) toggle(item.id);
    },
  });
  const chosen = items.filter((item) => selected.includes(item.id));
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 } },
    chosen.length === 0
      ? null
      : h(
          'div',
          { className: 'lp-taglist' },
          chosen.map((item) =>
            h(
              'button',
              {
                key: item.id,
                type: 'button',
                className: 'lp-chip',
                'data-active': 'true',
                onClick: () => toggle(item.id),
              },
              `${item.title} ×`,
            ),
          ),
        ),
    h(
      'div',
      { className: 'lp-dd' },
      h(
        'button',
        {
          className: 'lp-select lp-dd-btn',
          type: 'button',
          ref: menu.anchorRef,
          'aria-haspopup': 'listbox',
          'aria-expanded': String(menu.open),
          'aria-controls': menu.open ? menu.menuId : undefined,
          'aria-activedescendant':
            menu.open && menu.active >= 0 && menu.active < items.length
              ? `${menu.menuId}-opt-${menu.active}`
              : undefined,
          onClick: menu.toggle,
          onKeyDown: menu.onKeyDown,
        },
        h('span', { className: 'lp-dd-value' }, `${t('studyTaskShelf')} · ${selected.length}`),
        h('span', { className: 'lp-dd-caret', 'aria-hidden': true }, '▾'),
      ),
      menu.open && menu.pos
        ? h(
            'div',
            null,
            h('div', { className: 'lp-pop-backdrop', onClick: menu.hide }),
            h(
              'div',
              {
                className: 'lp-dd-menu',
                role: 'listbox',
                'aria-multiselectable': 'true',
                id: menu.menuId,
                tabIndex: -1,
                style: {
                  left: menu.pos.left,
                  top: menu.pos.top,
                  width: menu.pos.width,
                  maxHeight: 260,
                  overflow: 'auto',
                  display: 'block',
                },
                onKeyDown: menu.onKeyDown,
              },
              items.length === 0
                ? h('div', { className: 'lp-meta', style: { padding: '6px 10px' } }, t('studyTaskNoShelf'))
                : items.map((item, index) =>
                    h(
                      'button',
                      Object.assign({}, menu.getItemProps(index, selected.includes(item.id)), {
                        className: 'lp-dd-item',
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: 2,
                          width: '100%',
                        },
                      }),
                      h(
                        'span',
                        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                        h(
                          'span',
                          {
                            style: {
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'var(--dsw-alias-label-primary)',
                            },
                          },
                          item.title,
                        ),
                        (item.tags || []).map((tag) =>
                          h(
                            'span',
                            {
                              key: tag,
                              className: 'lp-badge',
                              style: {
                                fontSize: 'var(--lp-meta-fs, 11px)',
                                color: 'var(--dsw-alias-brand-primary)',
                                borderColor: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent)',
                              },
                            },
                            tag,
                          ),
                        ),
                        selected.includes(item.id)
                          ? h(
                              'span',
                              { className: 'lp-meta', style: { color: 'var(--dsw-alias-state-success-primary)' } },
                              '✓',
                            )
                          : null,
                      ),
                      h(
                        'span',
                        {
                          className: 'lp-meta',
                          style: {
                            fontSize: 'var(--lp-meta-fs, 11px)',
                            textAlign: 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            opacity: 0.75,
                          },
                        },
                        item.path,
                      ),
                    ),
                  ),
            ),
          )
        : null,
    ),
  );
}
