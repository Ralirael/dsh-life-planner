// skin.js — generated from the original single-file client; edit here, then run node build-client.mjs.
const CSS = `
.lp-page{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;background-color:var(--lp-bg-color,var(--dsw-alias-bg-base));background-image:var(--lp-bg-fade,none),var(--lp-bg-overlay,none),var(--lp-bg-image,none);background-size:cover,cover,cover;background-position:center,center,center;background-repeat:no-repeat;color:var(--dsw-alias-label-primary);position:relative;}
.lp-page input[type="checkbox"],.lp-page input[type="radio"]{accent-color:var(--dsw-alias-brand-primary);}
.lp-page :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;}
.lp-page ::placeholder{color:var(--dsw-alias-label-secondary);opacity:.85;}
.lp-head{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l2);-webkit-app-region:drag;app-region:drag;}
/* Frameless hosts drag the window by this bar; controls must stay clickable. */
.lp-head button,.lp-head input,.lp-head select,.lp-head textarea,.lp-head a,.lp-head [role="button"],.lp-head .lp-dd,.lp-head .lp-select{-webkit-app-region:no-drag;app-region:no-drag;}
.lp-tabs{display:flex;gap:4px;flex:1;}
.lp-tab{border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:8px;padding:6px 12px;font:inherit;cursor:pointer;}
.lp-tab[data-active="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary);}
.lp-body{flex:1;min-height:0;overflow:auto;padding:16px;}
.lp-cal-scroll{flex:1;min-height:0;overflow:auto;position:relative;overflow-anchor:none;overscroll-behavior:contain;}
.lp-cal-sticky{position:sticky;top:0;z-index:5;overflow:hidden;background:var(--lp-surface-bg,var(--dsw-alias-bg-base));border:1px solid var(--dsw-alias-border-l2);border-radius:var(--lp-r-lg,12px);margin:8px 10px 0;height:var(--lp-cal-h,420px);transition:height .2s ease;}
.lp-cal-month{position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;transition:opacity .18s ease;}
.lp-cal-expand{position:absolute;right:10px;top:50%;transform:translateY(-50%);z-index:6;width:26px;height:26px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:var(--lp-control-bg,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1;font-size:12px;display:inline-flex;align-items:center;justify-content:center;}
.lp-cal-expand:hover{color:var(--dsw-alias-label-primary);}
.lp-cal-week{position:absolute;left:0;right:0;top:0;height:64px;display:flex;align-items:center;gap:6px;padding:0 12px;box-sizing:border-box;transition:opacity .18s ease;}
.lp-cal-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-cal-side{flex:1;display:flex;align-items:center;gap:6px;}
.lp-cal-side[data-right="true"]{justify-content:flex-end;}
.lp-iconbtn{width:28px;height:28px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;padding:0;line-height:1;}
.lp-iconbtn:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-cal-title{font-weight:600;font-size:var(--lp-title-fs,15px);text-align:center;white-space:nowrap;}
.lp-wd{display:grid;grid-template-columns:repeat(7,1fr);color:var(--dsw-alias-label-secondary);font-size:var(--lp-cal-fs,12px);text-align:center;padding:7px 0;border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-grid{display:grid;grid-template-columns:repeat(7,1fr);grid-auto-rows:1fr;flex:1;min-height:0;}
.lp-cell{border-right:1px solid var(--dsw-alias-border-l2);border-bottom:1px solid var(--dsw-alias-border-l2);border-right-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);border-bottom-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);padding:6px 8px;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:2px;overflow:hidden;min-height:0;}
.lp-cell:nth-child(7n){border-right:none;}
.lp-cell[data-edge-left="true"]{border-left:1px solid var(--dsw-alias-border-l2);border-left-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);}
.lp-cell[data-edge-right="true"]{border-right:1px solid var(--dsw-alias-border-l2);border-right-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);}
.lp-cell[data-edge-top="true"]{border-top:1px solid var(--dsw-alias-border-l2);border-top-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);}
.lp-cell[data-edge-bottom="true"]{border-bottom:1px solid var(--dsw-alias-border-l2);border-bottom-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);}
.lp-cell[data-dim="true"]{border-right-color:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);border-bottom-color:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-cell[data-dim="true"] .lp-num,
.lp-cell[data-dim="true"] .lp-cell-title,
.lp-cell[data-dim="true"] .lp-cell-more,
.lp-cell[data-dim="true"] .lp-count{opacity:.5;}
.lp-cell[data-selected="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);}
.lp-cell[data-selected="true"] .lp-cell-title{color:var(--dsw-alias-label-primary);}
.lp-cell[data-today="true"]{box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary);}
.lp-cell:hover{background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);}
.lp-cell-top{display:flex;align-items:center;justify-content:space-between;gap:4px;}
.lp-num{font-size:var(--lp-cal-fs,12px);font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);}
.lp-count{font-size:var(--lp-cal-fs,12px);line-height:1;padding:2px 5px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);}
.lp-cell-title{font-size:var(--lp-cal-fs,12px);color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
.lp-cell-more{font-size:var(--lp-cal-fs,12px);color:var(--dsw-alias-label-secondary);}
.lp-weekcell{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 0;border-radius:8px;border:1px solid transparent;cursor:pointer;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;}
.lp-weekcell[data-today="true"]{border-color:var(--dsw-alias-brand-primary);}
.lp-weekcell[data-selected="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 20%,transparent);}
.lp-weekcell span{font-size:var(--lp-meta-fs,11px);color:var(--dsw-alias-label-secondary);}
/* The strip's generic span rule must not repaint the count badge. */
.lp-weekcell .lp-count{font-size:var(--lp-meta-fs,11px);line-height:1;padding:2px 5px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);}
.lp-day{padding:56px 16px 28px;}
.lp-day-title{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-weight:600;font-size:var(--lp-title-fs,15px);}
.lp-day-sub{color:var(--dsw-alias-label-secondary);font-weight:400;font-size:var(--lp-fs-sm,12px);}
.lp-add{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
.lp-input{flex:1;min-width:140px;padding:8px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;}
.lp-select{padding:8px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;}
.lp-btn{padding:8px 12px;border-radius:8px;border:1px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font:inherit;cursor:pointer;}
.lp-btn[disabled]{opacity:.5;cursor:default;}
.lp-btn-ghost{padding:6px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;}
.lp-page[data-scheme="dark"] .lp-btn{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);}
.lp-page[data-scheme="dark"] .lp-modal{box-shadow:0 14px 56px rgba(0,0,0,.5);}
/* The study page reuses the planning page's components; one shared scale keeps
   the two panels identical in rhythm. */
.lp-study .lp-toolbar{padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l2);margin-bottom:4px;}
.lp-study .lp-toolbar .lp-input{flex:1;min-width:140px;max-width:none;}
.lp-study .lp-head .lp-meta{font-variant-numeric:tabular-nums;}
.lp-study .lp-tree-row{min-height:var(--lp-row);padding:4px 8px;border-color:transparent;border-radius:var(--lp-r-sm);gap:var(--lp-gap);}
.lp-study .lp-tree-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);border-color:transparent;}
.lp-study-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin-top:8px;}
/* Mistakes must never be clipped or push the panel sideways. */
.lp-mistake-grid{grid-template-columns:repeat(var(--lp-mistake-cols,auto-fill),minmax(260px,1fr));}
.lp-mistake-grid .lp-card{min-width:0;max-width:100%;height:var(--lp-mistake-h,auto);overflow:hidden;}
.lp-mistake-grid .lp-card-title{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;line-height:1.45;font-size:var(--lp-mistake-title-fs,15px);}
.lp-mistake-grid .lp-card-meta{white-space:normal;overflow-wrap:anywhere;}
/* Answer and reason have their own size; clamping only applies when the user
   fixes the card height, otherwise the full text stays visible. */
.lp-mistake-grid .lp-mistake-answer{font-size:var(--lp-mistake-answer-fs,13px);white-space:normal;overflow-wrap:anywhere;}
.lp-mistake-grid .lp-mistake-reason{font-size:var(--lp-mistake-reason-fs,12px);white-space:normal;overflow-wrap:anywhere;}
.lp-mistake-grid[data-fixed="true"] .lp-mistake-title,
.lp-mistake-grid[data-fixed="true"] .lp-mistake-answer,
.lp-mistake-grid[data-fixed="true"] .lp-mistake-reason{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;}
.lp-mistake-grid[data-fixed="true"] .lp-mistake-title{-webkit-line-clamp:2;}
.lp-mistake-grid[data-fixed="true"] .lp-mistake-answer{-webkit-line-clamp:3;}
.lp-mistake-grid[data-fixed="true"] .lp-mistake-reason{-webkit-line-clamp:4;}
.lp-body .lp-toolbar .lp-input{min-width:0;}
.lp-mistake-preview{width:min(760px,100%);max-height:80vh;overflow:auto;}
.lp-mistake-preview .lp-pre-block{margin-top:10px;}
.lp-mistake-preview .lp-pre-body{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;padding:10px 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);}
.lp-bar{display:block;height:8px;min-width:2px;border-radius:4px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);}
.lp-dd{position:relative;display:flex;min-width:0;width:100%;}
.lp-dd-btn{width:100%;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer;}
.lp-dd-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lp-dd-caret{color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);}
.lp-dd-menu{position:fixed;z-index:70;max-height:240px;overflow:auto;padding:6px;border-radius:12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:0 12px 32px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:2px;}
.lp-dd-item{flex:0 0 auto;padding:7px 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--lp-fs,13px);line-height:1.4;text-align:left;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lp-dd-item:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-dd-item[data-active="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);}
/* aria-selected marks the chosen option when the keyboard highlight is elsewhere. */
.lp-dd-item[aria-selected="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent);}
.lp-toolbar{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l2);flex-wrap:wrap;}
.lp-chip{padding:4px 10px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--lp-tag-fs,12px);cursor:pointer;}
.lp-chip[data-active="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary);}
.lp-search{padding:6px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;min-width:150px;}
.lp-node{position:relative;}
.lp-row{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:6px;position:relative;}
.lp-row:hover{background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);}
.lp-row[data-selected="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary);}
.lp-row[data-context="true"]{opacity:.72;}
.lp-row[data-done="true"] .lp-title{opacity:.55;text-decoration:line-through;}
.lp-row[data-drop="before"]{box-shadow:inset 0 2px 0 var(--dsw-alias-brand-primary);}
.lp-row[data-drop="after"]{box-shadow:inset 0 -2px 0 var(--dsw-alias-brand-primary);}
.lp-row[data-drop="inside"]{box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary);}
.lp-row[data-dragging="true"]{opacity:.45;}
.lp-ico{width:16px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);flex:none;}
/* Hierarchy is already visible as indentation; colour is reserved for task types. */
.lp-children{margin-left:18px;border-left:1px solid var(--dsw-alias-border-l2);}
.lp-actions{display:flex;gap:2px;opacity:0;transition:opacity .12s;flex:none;}
.lp-row:hover .lp-actions{opacity:1;}
.lp-mini{width:22px;height:22px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit;padding:0;}
.lp-mini:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);color:var(--dsw-alias-label-primary);}
.lp-inline{flex:1;min-width:0;padding:4px 8px;border-radius:6px;border:1px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;}
.lp-progress{font-size:var(--lp-meta-fs,11px);color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none;}
.lp-fill{flex:1;min-width:8px;align-self:stretch;}
.lp-caret{width:18px;height:18px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit;padding:0;flex:none;}
.lp-caret[data-empty="true"]{cursor:default;opacity:0;}
.lp-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default;}
.lp-meta{color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);white-space:nowrap;}
.lp-meta[data-overdue="true"]{color:var(--dsw-alias-state-error-primary);}
.lp-badge{font-size:var(--lp-meta-fs,11px);padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary);white-space:nowrap;}
.lp-menu{position:absolute;right:8px;top:32px;z-index:20;min-width:130px;padding:4px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:0 6px 24px rgba(0,0,0,.18);}
.lp-menu button{display:block;width:100%;text-align:left;padding:6px 10px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;}
.lp-menu button:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);}
.lp-tree-row{position:relative;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;border:1px solid transparent;}
.lp-tree-row:hover{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l2);}
.lp-tree-row[data-done="true"] .lp-title{opacity:.5;text-decoration:line-through;}
.lp-tree-row[data-overdue="true"] .lp-title{color:var(--dsw-alias-state-error-primary);}
.lp-backdrop{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:24px;}
.lp-modal{width:min(560px,100%);max-height:85vh;overflow:auto;border-radius:14px;border:1px solid var(--dsw-alias-border-l2);background:var(--lp-modal-bg,var(--lp-surface-bg,var(--dsw-alias-bg-base))) !important;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:0 12px 48px rgba(0,0,0,.32);}
.lp-modal-title{font-weight:600;font-size:var(--lp-title-fs,15px);}
.lp-field{display:flex;flex-direction:column;gap:4px;}
.lp-field label{font-size:var(--lp-meta-fs,11px);color:var(--dsw-alias-label-secondary);}
.lp-row2{display:flex;gap:12px;}
.lp-row2 > *{flex:1;min-width:0;}
.lp-deps{max-height:160px;overflow:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px;}
.lp-deps label{display:flex;align-items:center;gap:8px;font-size:var(--lp-fs,13px);color:var(--dsw-alias-label-primary);}
.lp-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px;}
.lp-form-section{display:flex;align-items:center;gap:10px;font-size:var(--lp-meta-fs,11px);color:var(--dsw-alias-label-secondary);margin:10px 0 0;}
.lp-settings-body{display:flex;flex-direction:column;gap:8px;max-height:min(70vh,620px);overflow-y:auto;overflow-x:hidden;padding:2px 4px 2px 2px;}
/* Settings never scrolls sideways: rows reflow instead. */
.lp-page .lp-settings{width:min(720px,100%);overflow-x:hidden;}
.lp-page .lp-settings .lp-settings-body{width:100%;box-sizing:border-box;}
.lp-page .lp-settings .lp-row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;align-items:start;}
/* Compact field groups: as many columns as the width allows. */
.lp-page .lp-settings .lp-setting-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px 14px;align-items:start;}
.lp-page .lp-settings .lp-setting-grid .lp-field{min-width:0;}
.lp-page .lp-settings .lp-field{min-width:0;}
.lp-page .lp-settings .lp-field label{white-space:normal;overflow-wrap:anywhere;}
.lp-page .lp-settings .lp-toolbar{flex-wrap:wrap;padding:0;border:0;}
.lp-page .lp-settings .lp-input,
.lp-page .lp-settings .lp-select,
.lp-page .lp-settings .lp-search{min-width:0;max-width:100%;width:100%;flex:0 0 auto;box-sizing:border-box;}
/* Only a horizontal row lets an input share space with its neighbours. */
.lp-page .lp-settings .lp-toolbar .lp-input,
.lp-page .lp-settings .lp-toolbar .lp-select,
.lp-page .lp-settings .lp-toolbar .lp-search{flex:1 1 140px;width:auto;}
.lp-page .lp-settings input[type="range"]{flex:1 1 120px;width:auto;}
.lp-page .lp-settings .lp-btn,
.lp-page .lp-settings .lp-btn-ghost{flex:none;white-space:nowrap;}
.lp-page .lp-settings .lp-taglist{flex-wrap:wrap;}
.lp-page .lp-settings .lp-meta{white-space:normal;overflow-wrap:anywhere;}
.lp-page .lp-settings .lp-section{white-space:normal;overflow-wrap:anywhere;}
.lp-page .lp-settings .lp-week{grid-template-columns:repeat(auto-fit,minmax(72px,1fr));}
/* Study panels follow the same surface rule so a background shows through. */
.lp-page .lp-study .lp-input,
.lp-page .lp-study .lp-select,
.lp-page .lp-study .lp-search{background:var(--lp-control-bg,var(--lp-surface-bg,var(--dsw-alias-bg-layer-1))) !important;backdrop-filter:blur(6px);}
/* Planning controls follow the same rule so one background looks consistent. */
.lp-page:not(.lp-study) .lp-input,
.lp-page:not(.lp-study) .lp-select,
.lp-page:not(.lp-study) .lp-search,
.lp-page:not(.lp-study) .lp-dd-btn{background:var(--lp-control-bg,var(--lp-surface-bg,var(--dsw-alias-bg-layer-1))) !important;backdrop-filter:blur(6px);}
.lp-page .lp-study .lp-dd-btn{background:var(--lp-control-bg,var(--lp-surface-bg,var(--dsw-alias-bg-layer-1))) !important;backdrop-filter:blur(6px);}
.lp-page .lp-study .lp-card{background:var(--lp-surface-bg,var(--dsw-alias-bg-layer-1));}
.lp-week{display:grid;grid-template-columns:repeat(7,minmax(64px,1fr));gap:6px;margin:6px 0;}
.lp-week-day{display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--lp-r-sm,#6px);}
.lp-week-day .lp-input{width:100%;min-width:0;}
.lp-week-day .lp-week-value{font-size:var(--lp-task-fs,13px);color:var(--dsw-alias-label-primary);}
.lp-form-section::after{content:'';flex:1;height:1px;background:var(--dsw-alias-border-l2);}
.lp-page .lp-modal-actions{position:sticky;bottom:-20px;z-index:2;background:var(--dsw-alias-bg-base);padding:12px 0 0;border-top:1px solid var(--dsw-alias-border-l2);}
.lp-plan{width:100%;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--lp-surface-bg,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit;line-height:1.6;resize:vertical;}
.lp-empty{color:var(--dsw-alias-label-secondary);padding:24px 0;text-align:center;}
.lp-section{color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);margin:12px 0 4px;padding:0 0 6px;border-top:none;border-bottom:1px solid var(--dsw-alias-border-l2);font-weight:500;}
.lp-page .lp-tree-row[data-selected="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary);}
.lp-longterm{margin-top:26px;}
.lp-err{color:var(--dsw-alias-state-error-primary);font-size:var(--lp-fs-sm,12px);margin:8px 0;}
.lp-feedback{color:var(--dsw-alias-brand-primary);margin:8px 0;font-size:var(--lp-fs-sm,12px);}
.lp-notices{position:absolute;right:16px;top:64px;z-index:30;display:flex;flex-direction:column;gap:6px;max-width:340px;}
.lp-notice{padding:8px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:var(--lp-fs,13px);cursor:pointer;}
.lp-notice:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-notice-title{font-weight:600;font-size:var(--lp-fs-sm,12px);margin-bottom:2px;}
.lp-notice-body{font-size:var(--lp-fs-sm,12px);color:var(--dsw-alias-label-secondary);}
.lp-prio{width:3px;align-self:stretch;min-height:14px;border-radius:2px;flex:none;opacity:.9;}
.lp-tag{font-size:var(--lp-tag-fs,12px);padding:0 6px;border-radius:6px;white-space:nowrap;flex:none;}
.lp-taglist{display:flex;flex-wrap:wrap;gap:6px;}
.lp-type{font-size:var(--lp-type-fs,11px);line-height:1.5;padding:0 6px;border-radius:6px;border:1px solid currentColor;opacity:.9;white-space:nowrap;flex:none;}
.lp-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px var(--lp-pad);border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-filters .lp-dd{width:150px;flex:none;}
.lp-group{margin-top:6px;}
.lp-group-toggle{cursor:pointer;user-select:none;}
.lp-group-add{margin-left:auto;width:22px;height:22px;padding:0;font-size:14px;line-height:1;display:inline-flex;align-items:center;justify-content:center;opacity:.65;}
.lp-group-toggle:hover .lp-group-add{opacity:1;}
.lp-caret{display:inline-block;width:12px;text-align:center;font-size:10px;transition:transform .15s ease;}
.lp-caret[data-open="false"]{transform:rotate(-90deg);}
.lp-group-head{display:flex;align-items:center;gap:6px;font-size:var(--lp-type-fs,11px);color:var(--dsw-alias-label-secondary);padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-group-dot{width:9px;height:9px;border-radius:50%;flex:none;}
.lp-swatch-panel{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px;}
.lp-swatch{width:18px;height:18px;border-radius:5px;border:1px solid var(--dsw-alias-border-l2);cursor:pointer;padding:0;}
.lp-swatch[data-active="true"]{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px;}
.lp-cell[data-priority="low"]:not([data-selected="true"]){background:color-mix(in srgb,var(--lp-tone-low) 12%,transparent);}
.lp-cell[data-priority="medium"]:not([data-selected="true"]){background:color-mix(in srgb,var(--lp-tone-medium) 12%,transparent);}
.lp-cell[data-priority="high"]:not([data-selected="true"]){background:color-mix(in srgb,var(--lp-tone-high) 12%,transparent);}
.lp-cell[data-priority="highest"]:not([data-selected="true"]){background:color-mix(in srgb,var(--lp-tone-highest) 14%,transparent);}
.lp-pop{position:absolute;z-index:60;left:50%;top:50%;transform:translate(-50%,-50%);width:min(320px,calc(100% - 24px));padding:12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--lp-modal-bg,var(--lp-surface-bg,var(--dsw-alias-bg-base))) !important;box-shadow:0 10px 30px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:8px;}
.lp-pop-title{font-weight:600;font-size:var(--lp-fs,13px);}
.lp-pop-list{font-size:var(--lp-fs-sm,12px);color:var(--dsw-alias-label-secondary);max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:2px;}
.lp-pop-actions{display:flex;justify-content:flex-end;gap:6px;}
.lp-pop-backdrop{position:absolute;inset:0;z-index:55;}
.lp-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:12px;align-items:start;}
.lp-col{display:flex;flex-direction:column;gap:8px;min-width:0;}
.lp-col-head{font-size:var(--lp-title-fs,15px);color:var(--dsw-alias-label-secondary);padding:4px 2px;border-bottom:1px solid var(--dsw-alias-border-l2);}.lp-card{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px;background:var(--lp-surface-bg,var(--dsw-alias-bg-layer-1));cursor:pointer;display:flex;flex-direction:column;gap:4px;align-items:flex-start;}
.lp-card:hover{border-color:var(--dsw-alias-brand-primary);}
.lp-card[data-done="true"]{opacity:.6;}
.lp-card-title{font-size:var(--lp-task-fs,13px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lp-card-meta{display:flex;gap:8px;align-items:center;color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);}
.lp-card-prio{font-variant-numeric:tabular-nums;font-weight:600;min-width:22px;flex:none;}
.lp-switch{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--lp-meta-fs,11px);cursor:pointer;white-space:nowrap;}
.lp-switch:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-switch[data-on="true"]{color:var(--dsw-alias-brand-primary);}
.lp-switch-track{position:relative;display:inline-block;width:28px;height:16px;border-radius:999px;background:var(--dsw-alias-state-idle-primary);transition:background .15s ease;}
.lp-switch-knob{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:var(--dsw-alias-bg-base);transition:transform .15s ease;}
.lp-switch[data-on="true"] .lp-switch-track{background:var(--dsw-alias-brand-primary);}
.lp-switch[data-on="true"] .lp-switch-knob{transform:translateX(12px);}
.lp-switch-state{min-width:1em;line-height:1;}
/* The label keeps the switch's own 11px scale so the header control never grows. */
.lp-switch-label{font-size:var(--lp-meta-fs,11px);white-space:nowrap;}
/* Per-area font tokens: each block of the calendar page follows its own setting. */
.lp-tab{font-size:var(--lp-tab-fs,13px);}
.lp-modal-title,.lp-cal-title{font-size:var(--lp-title-fs,15px);}
.lp-cal-sticky,.lp-cell,.lp-weekcell{font-size:var(--lp-cal-fs,12px);}
.lp-tree-row,.lp-row,.lp-card,.lp-plan{font-size:var(--lp-task-fs,13px);}
.lp-type{font-size:var(--lp-type-fs,11px);}
.lp-tag,.lp-chip{font-size:var(--lp-tag-fs,12px);}
.lp-meta{font-size:var(--lp-meta-fs,11px);}
.lp-chip{height:var(--lp-tag-h,22px);display:inline-flex;align-items:center;}
/* Default boolean control: oval slider, right aligned in its row. */
.lp-switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;}
/* A switch that follows its label on the same line. */
.lp-switch-inline{display:inline-flex;align-items:center;gap:8px;}
.lp-switch-inline label{white-space:nowrap;}
.lp-toggle{flex:none;display:inline-flex;align-items:center;justify-content:flex-end;padding:0;border:0;background:transparent;cursor:pointer;}
/* Off state needs a visible groove: a plain layer colour disappears on dark pages. */
.lp-toggle-track{position:relative;width:42px;height:24px;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 30%, transparent);box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--dsw-alias-label-primary) 45%, transparent);transition:background .18s ease,box-shadow .18s ease;}
.lp-toggle-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.5),0 0 0 1px rgba(0,0,0,.22);transition:transform .18s ease;}
.lp-toggle[data-on="true"] .lp-toggle-track{background:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--dsw-alias-brand-primary) 70%, #000);}
.lp-toggle[data-on="true"] .lp-toggle-knob{transform:translateX(18px);}
.lp-toggle:hover .lp-toggle-track{box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--dsw-alias-label-primary) 65%, transparent);}
.lp-toggle[disabled]{opacity:.5;cursor:default;}
/* --- polish pass: one type/spacing scale, consistent controls --- */
.lp-page{--lp-tone-low:#60a5fa;--lp-tone-medium:#34d399;--lp-tone-high:#fbbf24;--lp-tone-highest:#f87171;--lp-fs-sm:12px;--lp-fs:13px;--lp-fs-lg:15px;--lp-h:28px;--lp-r-sm:6px;--lp-r:8px;--lp-r-lg:12px;--lp-gap:8px;--lp-pad:14px;--lp-row:30px;--lp-cal-fs:12px;--lp-task-fs:13px;--lp-tag-fs:12px;--lp-title-fs:15px;--lp-type-fs:11px;--lp-meta-fs:11px;--lp-tab-fs:13px;--lp-tag-h:22px;--lp-cal-h:420px;background-image:var(--lp-bg-fade,none),var(--lp-bg-overlay,none),var(--lp-bg-image,none);background-size:cover,cover,var(--lp-bg-size,cover);background-position:center,center,var(--lp-bg-pos,center);background-repeat:no-repeat;font-size:var(--lp-fs,13px);line-height:1.5;}
.lp-page .lp-head{padding:10px var(--lp-pad);gap:10px;flex-wrap:nowrap;}
.lp-page .lp-tabs{gap:2px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent;min-width:0;align-items:center;padding-block:2px;}
.lp-page .lp-tabs::-webkit-scrollbar{height:6px;}
.lp-page .lp-tabs::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:999px;}
.lp-page .lp-tabs::-webkit-scrollbar-track{background:transparent;}
/* The settings dialog keeps a fixed 13px tab size and wraps instead of scrolling:
   settings tabs must not follow the panel's --lp-tab-fs, so 13px stays literal. */
.lp-page .lp-modal .lp-tabs{flex-wrap:wrap;overflow:visible;gap:6px;padding-block:0;}
.lp-page .lp-modal .lp-tab{height:auto;min-height:28px;font-size:13px;padding:6px 12px;line-height:1.25;}
.lp-page .lp-tab{flex:none;white-space:nowrap;}
.lp-page .lp-head > .lp-btn-ghost{flex:none;}
.lp-page .lp-tab{height:auto;min-height:calc(var(--lp-tab-fs,13px) + 16px);padding:4px 12px;border-radius:var(--lp-r);font-size:var(--lp-tab-fs,13px);line-height:1.3;display:inline-flex;align-items:center;justify-content:center;transition:background .12s ease,color .12s ease,border-color .12s ease;}
.lp-page .lp-body{padding:var(--lp-pad);}
.lp-page .lp-btn,.lp-page .lp-btn-ghost,.lp-page .lp-input,.lp-page .lp-select,.lp-page .lp-search,.lp-page .lp-dd-btn{box-sizing:border-box;font-size:var(--lp-fs);line-height:1.25;transition:background .12s ease,border-color .12s ease,color .12s ease;}
.lp-page .lp-btn,.lp-page .lp-btn-ghost{display:inline-flex;align-items:center;justify-content:center;height:var(--lp-h);padding:0 12px;border-radius:var(--lp-r);white-space:nowrap;}
.lp-page .lp-input,.lp-page .lp-select,.lp-page .lp-search{min-height:var(--lp-h);padding:5px 10px;border-radius:var(--lp-r);}
.lp-page .lp-dd-btn{min-height:var(--lp-h);padding:5px 10px;border-radius:var(--lp-r);}
.lp-page .lp-search{min-width:180px;}
.lp-page .lp-toolbar{gap:var(--lp-gap);padding:8px var(--lp-pad);}
.lp-page .lp-chip{height:var(--lp-tag-h,22px);padding:0 10px;line-height:1;font-size:var(--lp-tag-fs,12px);transition:background .12s ease,border-color .12s ease,color .12s ease;}
.lp-page .lp-row .lp-title,.lp-page .lp-tree-row .lp-title{font-size:var(--lp-task-fs,13px);}
.lp-page .lp-cal-scroll{font-size:var(--lp-cal-fs,12px);}
.lp-page .lp-badge{font-size:var(--lp-meta-fs,11px);}
.lp-page .lp-row,.lp-page .lp-tree-row{min-height:var(--lp-row);padding:4px 8px;gap:var(--lp-gap);border-radius:var(--lp-r-sm);transition:background .12s ease;}
.lp-page .lp-actions:focus-within{opacity:1;}
.lp-page .lp-ico{font-size:var(--lp-fs);}
.lp-page .lp-meta{font-size:var(--lp-meta-fs,11px);}
.lp-page .lp-empty{display:flex;align-items:center;justify-content:center;min-height:180px;padding:24px;font-size:var(--lp-fs);}
.lp-page .lp-section{margin:12px 0 4px;padding:0 0 6px;font-size:var(--lp-meta-fs,11px);}
.lp-page .lp-card{padding:10px;border-radius:var(--lp-r);gap:6px;transition:border-color .12s ease;}
.lp-page .lp-col-head{position:sticky;top:0;z-index:2;background:var(--lp-surface-bg,var(--dsw-alias-bg-base));padding:9px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--lp-r-lg,12px);text-align:center;color:var(--dsw-alias-label-primary);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.08);}
.lp-page .lp-board{padding:var(--lp-pad);gap:12px;}
.lp-page .lp-modal{padding:20px;gap:14px;}
.lp-page .lp-modal-title{font-size:var(--lp-title-fs,15px);}
.lp-page .lp-pop{padding:14px;}
.lp-page .lp-notices{top:56px;gap:8px;}
.lp-page .lp-notice{padding:9px 11px;border-radius:var(--lp-r);}
.lp-page .lp-menu{padding:5px;border-radius:var(--lp-r-lg);}
.lp-page .lp-menu button{padding:6px 10px;border-radius:var(--lp-r-sm);font-size:var(--lp-fs);}
.lp-page .lp-dd-menu{padding:5px;border-radius:var(--lp-r-lg);}
.lp-page .lp-cal-bar{padding:10px var(--lp-pad);}
.lp-page *::-webkit-scrollbar{width:10px;height:10px;}
.lp-page *::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--dsw-alias-label-primary) 20%,transparent);border-radius:999px;border:3px solid transparent;background-clip:padding-box;}
.lp-page *::-webkit-scrollbar-track{background:transparent;}
.lp-page .lp-tab[data-active="true"]{background:color-mix(in srgb,var(--lp-accent,var(--dsw-alias-brand-primary)) 18%,transparent);color:var(--dsw-alias-label-primary);border-color:var(--lp-accent,var(--dsw-alias-brand-primary));} 
.lp-page .lp-row[data-done="true"] .lp-ico,.lp-page .lp-tree-row[data-done="true"] .lp-ico{color:var(--dsw-alias-state-success-primary);}
.lp-page .lp-row[data-done="true"] .lp-prio{opacity:.35;}
@media (prefers-reduced-motion: reduce){.lp-page *{transition:none !important;}}
`;

// The stylesheet must exist for every panel, not only while the planning
// panel happens to be mounted, so it is attached to the document once.
if (typeof document !== 'undefined' && !document.getElementById('life-planner-styles')) {
  const sheet = document.createElement('style');
  sheet.id = 'life-planner-styles';
  sheet.textContent = CSS;
  document.head.appendChild(sheet);
}
