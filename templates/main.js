'use strict';
{
  const tagDataList =
  {
    "music": "#49d5eb",
    "chiptune": "#49d5eb",
    "composition": "#49d5eb",
    "game": "#0acc2a",
    "creation": "#0acc2a",
    "ai": "#0acc2a",
    "tD": "#0acc2a",
    "programming": "#0acc2a",
    "windows": "#0acc2a",
    "adobe": "#0acc2a",
    "professional": "#cc8aeb",
    "problem": "#fe9800",
    "trifling": "#fe9800",
    "life": "#fe9800",
    "notes": "#fe9800",
    "memory": "#fe9800",
    "true": "#fe9800",
    "advance": "#ff619d",
    "backstory": "#ff619d",
    "advertisement": "#cbcfde",
    "news": "#cbcfde",
    "test": "#ded523",
    "memo": "#ded523",
    "other": "#ded523",
    "underground": "#000000",
    "VDA": "#000000"
  };
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
  document.querySelectorAll('li[tag]').forEach(el => {
    const tag = el.getAttribute('tag');
    el.style.backgroundColor = tagDataList[tag];
    if (tag === "underground" || tag === "VDA") {
      el.style.color = "#FFFFFF";
      el.style.border = "1px solid #FFFFFF";
    }
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