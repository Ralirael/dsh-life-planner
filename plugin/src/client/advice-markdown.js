// Advice is model output. Build React nodes so embedded HTML remains text.
function adviceInline(text, plain = false, depth = 0) {
  if (depth >= 6) return [text];
  const tokens = /\\(?<escaped>[\\`*_{}\[\]()#+!>-])|`(?<code>[^`\n]+)`|\[(?<label>[^\]\n]+)\]\((?<url>https?:\/\/[^\s)]+)\)|\*\*(?<strong>[^\n]+?)\*\*|__(?<strongAlt>[^\n]+?)__|\*(?<emphasis>[^*\n]+)\*|(?<!\w)_(?<italic>[^_\n]+)_(?!\w)/g;
  const result = [];
  let end = 0;
  for (const match of text.matchAll(tokens)) {
    const { escaped, code, label, url, strong, strongAlt, emphasis, italic } = match.groups;
    if (match.index > end) result.push(text.slice(end, match.index));
    end = match.index + match[0].length;
    const key = match.index;
    if (escaped) result.push(escaped);
    else if (code) result.push(plain ? code : h('code', { key }, code));
    else if (label) {
      const content = adviceInline(label, plain, depth + 1);
      result.push(...(plain ? content : [h('a', { key, href: url, target: '_blank', rel: 'noopener noreferrer' }, ...content)]));
    } else {
      const bold = strong || strongAlt;
      const content = adviceInline(bold || emphasis || italic, plain, depth + 1);
      result.push(...(plain ? content : [h(bold ? 'strong' : 'em', { key }, ...content)]));
    }
  }
  if (end < text.length) result.push(text.slice(end));
  return result;
}

function adviceListMarker(line) {
  const match = /^( *)([-+*]|\d{1,9}[.)]) +(.+)$/.exec(line || '');
  if (!match) return null;
  const ordered = /^\d/.test(match[2]);
  return { indent: match[1].length, ordered, start: ordered ? parseInt(match[2], 10) : undefined, text: match[3] };
}

function adviceBlocks(lines, depth = 0) {
  if (depth >= 8) return [h('p', { key: 0 }, lines.join('\n'))];
  const blocks = [];
  const heading = /^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/;
  const fence = /^(?:`{3,}|~{3,})/;
  const rule = /^(?:-\s*){3,}$|^(?:\*\s*){3,}$|^(?:_\s*){3,}$/;
  const startsBlock = (line) => heading.test(line) || fence.test(line) || line.startsWith('>') ||
    rule.test(line) || Boolean(adviceListMarker(line));
  for (let index = 0; index < lines.length;) {
    const key = index;
    const line = lines[index++];
    if (!line.trim()) continue;
    const title = heading.exec(line);
    if (title) {
      blocks.push(h('h' + Math.min(6, title[1].length + 2), { key }, ...adviceInline(title[2])));
    } else if (fence.test(line)) {
      const marker = line.match(fence)[0];
      const content = [];
      while (index < lines.length && !lines[index].trim().startsWith(marker)) content.push(lines[index++]);
      if (index < lines.length) index++;
      blocks.push(h('pre', { key }, h('code', null, content.join('\n'))));
    } else if (rule.test(line)) {
      blocks.push(h('hr', { key }));
    } else if (line.startsWith('>')) {
      const quote = [line.replace(/^> ?/, '')];
      while (index < lines.length && lines[index].startsWith('>')) quote.push(lines[index++].replace(/^> ?/, ''));
      blocks.push(h('blockquote', { key }, ...adviceBlocks(quote, depth + 1)));
    } else {
      const marker = adviceListMarker(line);
      if (marker) {
        const items = [];
        let item = marker;
        while (item && item.indent === marker.indent && item.ordered === marker.ordered) {
          const content = [item.text];
          while (index < lines.length) {
            const next = lines[index];
            if (!next.trim()) {
              const sibling = adviceListMarker(lines[index + 1]);
              if (sibling?.indent === marker.indent && sibling.ordered === marker.ordered) index++;
              else if ((lines[index + 1]?.match(/^ */)[0].length || 0) > marker.indent) {
                content.push('');
                index++;
                continue;
              }
              break;
            }
            const indent = next.match(/^ */)[0].length;
            if (indent <= marker.indent) break;
            content.push(next.slice(Math.min(indent, marker.indent + 2)));
            index++;
          }
          items.push(h('li', { key: items.length }, ...adviceBlocks(content, depth + 1)));
          item = adviceListMarker(lines[index]);
          if (item && item.indent === marker.indent && item.ordered === marker.ordered) index++;
        }
        blocks.push(h(marker.ordered ? 'ol' : 'ul', { key, start: marker.start }, ...items));
      } else {
        const paragraph = [line];
        while (index < lines.length && lines[index].trim() && !startsBlock(lines[index])) paragraph.push(lines[index++]);
        blocks.push(h('p', { key }, ...adviceInline(paragraph.join('\n'))));
      }
    }
  }
  return blocks;
}

function adviceExcerpt(lines) {
  const first = lines.find((line) => line.trim() && !/^(?:`{3,}|~{3,}|[-*_ ]{3,}$)/.test(line)) || '';
  const text = first.replace(/^(?:\s{0,3}>\s*)+/, '').replace(/^#{1,6}\s+(.+?)(?:\s+#+)?\s*$/, '$1').trim();
  return adviceInline(adviceListMarker(text)?.text || text, true).join('');
}
