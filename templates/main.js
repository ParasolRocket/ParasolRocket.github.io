'use strict';
{
  fetch('../config/tags.json')
    .then(response => response.json())
    .then(tagConfig => {
      const hasUnderground = Array.from(document.querySelectorAll('li[tag]')).some(el => {
        const tag = el.getAttribute('tag');
        const config = tagConfig[tag];
        return config && config['category'] === 'UNDERGROUND';
      });
      if (!hasUnderground) {
        document.body.style.overflow = 'auto';
        document.querySelectorAll('div.attention').forEach(el => {
          el.remove();
        });
      }
  });
  document.querySelectorAll('span[col]').forEach(el => {
    el.style.color = el.getAttribute('col');
  });
  document.querySelectorAll('span[hgl]').forEach(el => {
    el.style.backgroundColor = el.getAttribute('hgl');
  });
  document.querySelectorAll('span[wgt]').forEach(el => {
    el.style.fontWeight = el.getAttribute('wgt');
  });
  document.querySelectorAll('span[fsz]').forEach(el => {
    el.style.fontSize = el.getAttribute('fsz');
  });
  document.querySelectorAll('div.outline').forEach(el => {
    const text = el.getAttribute('text') || '';
    const fw = el.getAttribute('font-weight') || 'normal';
    const fs = el.getAttribute('font-size') || '1rem';

    // oN属性をすべて取得
    let outlines = [];
    let n = 1;
    while (el.hasAttribute(`o${n}`)) {
      const val = el.getAttribute(`o${n}`);
      const [size, color] = val.split(' ');
      outlines.push({ size, color });
      n++;
    }

    // ネストしたHTML生成
    let inner = '';
    for (let i = outlines.length - 1; i >= 0; i--) {
      const { size, color } = outlines[i];
      let style = '';
      if (size === '0') {
        style = `color:${color}; -webkit-text-stroke:0;`;
      } else {
        style = `color:${color}; -webkit-text-stroke:${size} ${color};`;
      }
      inner = `<div style="${style}" class="outlineChild">${text}${inner}</div>`;
    }

    // 最上位のdiv生成
    el.outerHTML = `<div style="font-weight:${fw}; font-size:${fs};" class="outlineST">${text}${inner}</div>`;
  });
}