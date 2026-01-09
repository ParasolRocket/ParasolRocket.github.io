'use strict';
{
  fetch('../config/tags.json')
    .then(response => response.json())
    .then(tagConfig => {
      const hasUnderground = Array.from(document.querySelectorAll('li[tag]')).some(el => {
        const tag = el.getAttribute('tag');
        const config = tagConfig[tag];
        return config['category'] === 'UNDERGROUND';
      });
      console.log('hasUnderground:', hasUnderground);
      if (hasUnderground) {
        document.body.style.overflow = 'hidden';
        const container = document.getElementById('attentionContainer');
        container.innerHTML = `
          <div class="attention">
            <h2>ご案内</h2>
            <p>このページには以下の内容が含まれています</p>
            <ul>
              <li>少し刺激の強い内容</li>
              <li>好みの分かれる表現</li>
              <li>職場や公共の場での閲覧に適さない可能性のある要素</li>
            </ul>
            <p>無理のないタイミングで、大丈夫そうであれば、下の「入場する」ボタンから入場してください</p>
            <button onclick="this.parentElement.style.opacity='0'; document.body.style.overflow='auto'; setTimeout(() => this.parentElement.remove(), 500)">入場する</button>
          </div>
        `;
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