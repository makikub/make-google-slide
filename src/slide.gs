// --- ３. メイン実行関数 ---  
let __SECTION_COUNTER = 0; // 章番号カウンタ（ゴースト数字用）

function generatePresentation() {  
  let presentation;  
  try {  
    presentation = SETTINGS.TARGET_PRESENTATION_ID  
      ? SlidesApp.openById(SETTINGS.TARGET_PRESENTATION_ID)  
      : SlidesApp.getActivePresentation();  
    if (!presentation) throw new Error('対象のプレゼンテーションが見つかりません。');

    if (SETTINGS.SHOULD_CLEAR_ALL_SLIDES) {  
      const slides = presentation.getSlides();  
      for (let i = slides.length - 1; i >= 0; i--) slides[i].remove();  
    }

    __SECTION_COUNTER = 0;

    const layout = Theme.getLayout(presentation.getPageWidth(), presentation.getPageHeight());

    let pageCounter = 0;  
    for (const data of slideData) {  
      const generator = slideGenerators[data.type];  
      if (data.type !== 'title' && data.type !== 'closing') pageCounter++;  
      if (generator) {  
        const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);  
        generator(slide, data, layout, pageCounter);  
          
        // スピーカーノートを設定する処理  
        if (data.notes) {  
          try {  
            const notesShape = slide.getNotesPage().getSpeakerNotesShape();  
            if (notesShape) {  
              notesShape.getText().setText(data.notes);  
            }  
          } catch (e) {  
            Logger.log(`スピーカーノートの設定に失敗しました: ${e.message}`);  
          }  
        }  
      }  
    }  

  } catch (e) {  
    Logger.log(`処理が中断されました: ${e.message}\nStack: ${e.stack}`);  
  }  
}

// --- 5. スライド生成ディスパッチャ ---  
const slideGenerators = {  
  title:    createTitleSlide,  
  section:  createSectionSlide,  
  content:  createContentSlide,  
  compare:  createCompareSlide,  
  process:  createProcessSlide,  
  timeline: createTimelineSlide,  
  diagram:  createDiagramSlide,  
  cards:    createCardsSlide,  
  table:    createTableSlide,  
  progress: createProgressSlide,  
  closing:  createClosingSlide  
};

// --- 6. スライド生成関数群 ---  
function createTitleSlide(slide, data, layout) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));

  const logoRect = layout.getRect('titleSlide.logo');  
  const logo = slide.insertImage(Theme.getLogo('header'));  
  const aspect = logo.getHeight() / logo.getWidth();  
  logo.setLeft(logoRect.left).setTop(logoRect.top).setWidth(logoRect.width).setHeight(logoRect.width * aspect);

  const titleRect = layout.getRect('titleSlide.title');  
  const titleShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, titleRect.left, titleRect.top, titleRect.width, titleRect.height);  
  setStyledText(titleShape, data.title, { size: Theme.getFontSize('title'), bold: true });

  const dateRect = layout.getRect('titleSlide.date');  
  const dateShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, dateRect.left, dateRect.top, dateRect.width, dateRect.height);  
  dateShape.getText().setText(data.date || '');  
  applyTextStyle(dateShape.getText(), { size: Theme.getFontSize('footer') });

  drawBottomBar(slide, layout);  
}

function createSectionSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('backgroundAlt'));

  // 透かし番号：sectionNo > タイトル先頭の数字 > 自動連番  
  __SECTION_COUNTER++;  
  const parsedNum = (() => {  
    if (Number.isFinite(data.sectionNo)) return Number(data.sectionNo);  
    const m = String(data.title || '').match(/^\s*(\d+)[\.．]/);  
    return m ? Number(m[1]) : __SECTION_COUNTER;  
  })();  
  const num = String(parsedNum).padStart(2, '0');

  const ghostRect = layout.getRect('sectionSlide.ghostNum');  
  const ghost = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, ghostRect.left, ghostRect.top, ghostRect.width, ghostRect.height);  
  ghost.getText().setText(num);  
  applyTextStyle(ghost.getText(), { size: Theme.getFontSize('ghostNum'), color: Theme.getColor('ghost'), bold: true });  
  try { ghost.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE); } catch(e) {}

  const titleRect = layout.getRect('sectionSlide.title');  
  const titleShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, titleRect.left, titleRect.top, titleRect.width, titleRect.height);  
  titleShape.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);  
  setStyledText(titleShape, data.title, { size: Theme.getFontSize('sectionTitle'), bold: true, align: SlidesApp.ParagraphAlignment.CENTER });

  addGoogleFooter(slide, layout, pageNum);  
}

// content（1/2カラム + 小見出し + 画像）  
function createContentSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  drawStandardTitleHeader(slide, layout, 'contentSlide', data.title);  
  const dy = drawSubheadIfAny(slide, layout, 'contentSlide', data.subhead);

  // アジェンダ安全装置  
  const isAgenda = isAgendaTitle(data.title || '');  
  let points = Array.isArray(data.points) ? data.points.slice(0) : [];  
  if (isAgenda && (!points || points.length === 0)) {  
    points = buildAgendaFromSlideData();  
    if (points.length === 0) points = ['本日の目的', '進め方', '次のアクション'];  
  }

  const hasImages = Array.isArray(data.images) && data.images.length > 0;  
  const isTwo = !!(data.twoColumn || data.columns);

  if ((isTwo && (data.columns || points)) || (!isTwo && points && points.length > 0)) {  
    if (isTwo) {  
      let L = [], R = [];  
      if (Array.isArray(data.columns) && data.columns.length === 2) {  
        L = data.columns[0] || []; R = data.columns[1] || [];  
      } else {  
        const mid = Math.ceil(points.length / 2);  
        L = points.slice(0, mid); R = points.slice(mid);  
      }  
      const leftRect = offsetRect(layout.getRect('contentSlide.twoColLeft'), 0, dy);  
      const rightRect = offsetRect(layout.getRect('contentSlide.twoColRight'), 0, dy);  
      const leftShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, leftRect.left, leftRect.top, leftRect.width, leftRect.height);  
      const rightShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, rightRect.left, rightRect.top, rightRect.width, rightRect.height);  
      setBulletsWithInlineStyles(leftShape, L);  
      setBulletsWithInlineStyles(rightShape, R);  
    } else {  
      const bodyRect = offsetRect(layout.getRect('contentSlide.body'), 0, dy);  
      const bodyShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, bodyRect.left, bodyRect.top, bodyRect.width, bodyRect.height);  
      setBulletsWithInlineStyles(bodyShape, points);  
    }  
  }

  // 画像（任意）  
  if (hasImages) {  
    const area = offsetRect(layout.getRect('contentSlide.body'), 0, dy);  
    renderImagesInArea(slide, layout, area, normalizeImages(data.images));  
  }

  drawBottomBarAndFooter(slide, layout, pageNum);  
}

// compare（左右ボックス：ヘッダー青＋白文字）  
function createCompareSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  drawStandardTitleHeader(slide, layout, 'compareSlide', data.title);  
  const dy = drawSubheadIfAny(slide, layout, 'compareSlide', data.subhead);

  const leftBox = offsetRect(layout.getRect('compareSlide.leftBox'), 0, dy);  
  const rightBox = offsetRect(layout.getRect('compareSlide.rightBox'), 0, dy);  
  drawCompareBox(slide, leftBox, data.leftTitle || '選択肢A', data.leftItems || []);  
  drawCompareBox(slide, rightBox, data.rightTitle || '選択肢B', data.rightItems || []);

  drawBottomBarAndFooter(slide, layout, pageNum);  
}  

function drawCompareBox(slide, rect, title, items) {  
  const box = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, rect.left, rect.top, rect.width, rect.height);  
  box.getFill().setSolidFill(Theme.getColor('cardBg'));  
  box.getBorder().getLineFill().setSolidFill(Theme.getColor('border'));  
  box.getBorder().setWeight(1);

  const th = 0.75 * 40; // 約30px相当  
  const titleBar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, rect.left, rect.top, rect.width, th);  
  titleBar.getFill().setSolidFill(Theme.getColor('primary'));  
  titleBar.getBorder().setTransparent();  
  setStyledText(titleBar, title, { size: Theme.getFontSize('laneTitle'), bold: true, color: Theme.getColor('background'), align: SlidesApp.ParagraphAlignment.CENTER });

  const pad = 0.75 * 12;  
  const textRect = { left: rect.left + pad, top: rect.top + th + pad, width: rect.width - pad * 2, height: rect.height - th - pad * 2 };  
  const body = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, textRect.left, textRect.top, textRect.width, textRect.height);  
  setBulletsWithInlineStyles(body, items);  
}

// process（角枠1px＋一桁数字）  
function createProcessSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  drawStandardTitleHeader(slide, layout, 'processSlide', data.title);  
  const dy = drawSubheadIfAny(slide, layout, 'processSlide', data.subhead);

  const area = offsetRect(layout.getRect('processSlide.area'), 0, dy);  
  const steps = Array.isArray(data.steps) ? data.steps : [];  
  const n = Math.max(1, steps.length);  
  const gapY = (area.height - layout.pxToPt(40)) / Math.max(1, n - 1);  
  const cx = area.left + layout.pxToPt(44);  
  const top0 = area.top + layout.pxToPt(10);

  const line = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, cx - layout.pxToPt(1), top0 + layout.pxToPt(6), layout.pxToPt(2), gapY * (n - 1));  
  line.getFill().setSolidFill(Theme.getColor('faint'));  
  line.getBorder().setTransparent();

  for (let i = 0; i < n; i++) {  
    const cy = top0 + gapY * i;  
    const sz = layout.pxToPt(28);  
    const numBox = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, cx - sz/2, cy - sz/2, sz, sz);  
    numBox.getFill().setSolidFill(Theme.getColor('background'));  
    numBox.getBorder().getLineFill().setSolidFill(Theme.getColor('primary'));  
    numBox.getBorder().setWeight(1);  
    const num = numBox.getText(); num.setText(String(i + 1));  
    applyTextStyle(num, { size: 12, bold: true, color: Theme.getColor('primary'), align: SlidesApp.ParagraphAlignment.CENTER });

    const txt = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, cx + layout.pxToPt(28), cy - layout.pxToPt(16), area.width - layout.pxToPt(70), layout.pxToPt(32));  
    setStyledText(txt, steps[i] || '', { size: Theme.getFontSize('processStep') });  
    try { txt.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE); } catch(e){}  
  }

  drawBottomBarAndFooter(slide, layout, pageNum);  
}

// timeline（左右余白広め）  
function createTimelineSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  drawStandardTitleHeader(slide, layout, 'timelineSlide', data.title);  
  const dy = drawSubheadIfAny(slide, layout, 'timelineSlide', data.subhead);

  const area = offsetRect(layout.getRect('timelineSlide.area'), 0, dy);  
  const milestones = Array.isArray(data.milestones) ? data.milestones : [];  
  if (milestones.length === 0) { drawBottomBarAndFooter(slide, layout, pageNum); return; }

  const inner = layout.pxToPt(60);  
  const baseY = area.top + area.height * 0.55;  
  const leftX = area.left + inner;  
  const rightX = area.left + area.width - inner;

  const line = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, leftX, baseY - layout.pxToPt(1), rightX - leftX, layout.pxToPt(2));  
  line.getFill().setSolidFill(Theme.getColor('faint'));  
  line.getBorder().setTransparent();

  const dotR = layout.pxToPt(8);  
  const gap = (rightX - leftX) / Math.max(1, (milestones.length - 1));

  milestones.forEach((m, i) => {  
    const x = leftX + gap * i - dotR / 2;  
    const dot = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, x, baseY - dotR / 2, dotR, dotR);  
    const state = (m.state || 'todo').toLowerCase();  
    if (state === 'done') { dot.getFill().setSolidFill(Theme.getColor('success')); dot.getBorder().setTransparent(); }  
    else if (state === 'next') { dot.getFill().setSolidFill(Theme.getColor('background')); dot.getBorder().getLineFill().setSolidFill(Theme.getColor('warning')); dot.getBorder().setWeight(2); }  
    else { dot.getFill().setSolidFill(Theme.getColor('background')); dot.getBorder().getLineFill().setSolidFill(Theme.getColor('textSecondary')); dot.getBorder().setWeight(1); }

    const t = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, x - layout.pxToPt(40), baseY - layout.pxToPt(40), layout.pxToPt(90), layout.pxToPt(20));  
    t.getText().setText(String(m.label || ''));  
    applyTextStyle(t.getText(), { size: Theme.getFontSize('small'), bold: true, align: SlidesApp.ParagraphAlignment.CENTER });

    const d = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, x - layout.pxToPt(40), baseY + layout.pxToPt(8), layout.pxToPt(90), layout.pxToPt(18));  
    d.getText().setText(String(m.date || ''));  
    applyTextStyle(d.getText(), { size: Theme.getFontSize('small'), color: Theme.getColor('textSecondary'), align: SlidesApp.ParagraphAlignment.CENTER });  
  });

  drawBottomBarAndFooter(slide, layout, pageNum);  
}

// diagram（Mermaid風・レーン＋カード＋自動矢印）  
function createDiagramSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  drawStandardTitleHeader(slide, layout, 'diagramSlide', data.title);  
  const dy = drawSubheadIfAny(slide, layout, 'diagramSlide', data.subhead);

  const lanes = Array.isArray(data.lanes) ? data.lanes : [];  
  const area0 = layout.getRect('diagramSlide.lanesArea');  
  const area = offsetRect(area0, 0, dy);

  const px = (p)=> layout.pxToPt(p);  
  const diagramStyle = Theme.getDiagramStyle();
  const laneGap = px(diagramStyle.laneGap);  
  const lanePad = px(diagramStyle.lanePad);  
  const laneTitleH = px(diagramStyle.laneTitleH);  
  const cardGap = px(diagramStyle.cardGap);  
  const cardMinH = px(diagramStyle.cardMinH);  
  const cardMaxH = px(diagramStyle.cardMaxH);  
  const arrowH = px(diagramStyle.arrowH);  
  const arrowGap = px(diagramStyle.arrowGap);

  const n = Math.max(1, lanes.length);  
  const laneW = (area.width - laneGap * (n - 1)) / n;

  const cardBoxes = [];

  for (let j = 0; j < n; j++) {  
    const lane = lanes[j] || { title: '', items: [] };  
    const left = area.left + j * (laneW + laneGap);  
    const top = area.top;

    const lt = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, left, top, laneW, laneTitleH);  
    lt.getFill().setSolidFill(Theme.getColor('cardBg'));  
    lt.getBorder().getLineFill().setSolidFill(Theme.getColor('border'));  
    lt.getBorder().setWeight(1);  
    lt.getText().setText(lane.title || '');  
    applyTextStyle(lt.getText(), { size: Theme.getFontSize('laneTitle'), bold: true, align: SlidesApp.ParagraphAlignment.CENTER });

    const items = Array.isArray(lane.items) ? lane.items : [];  
    const availH = area.height - laneTitleH - lanePad * 2;  
    const rows = Math.max(1, items.length);  
    const idealH = (availH - cardGap * (rows - 1)) / rows;  
    const cardH = Math.max(cardMinH, Math.min(cardMaxH, idealH));  
    const totalH = cardH * rows + cardGap * (rows - 1);  
    const firstTop = top + laneTitleH + lanePad + Math.max(0, (availH - totalH) / 2);

    cardBoxes[j] = [];  
    for (let i = 0; i < rows; i++) {  
      const cardTop = firstTop + i * (cardH + cardGap);  
      const cardLeft = left + lanePad;  
      const cardWidth = laneW - lanePad * 2;

      const card = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, cardLeft, cardTop, cardWidth, cardH);  
      card.getFill().setSolidFill(Theme.getColor('cardBg'));  
      card.getBorder().getLineFill().setSolidFill(Theme.getColor('cardBorder'));  
      card.getBorder().setWeight(1);  
      setStyledText(card, items[i] || '', { size: Theme.getFontSize('body') });

      try { card.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE); } catch(e){}  
      cardBoxes[j][i] = { left: cardLeft, top: cardTop, width: cardWidth, height: cardH };  
    }  
  }

  // 同行カード間を矢印で接続  
  const maxRows = Math.max(...cardBoxes.map(a => a.length));  
  for (let j = 0; j < n - 1; j++) {  
    const L = cardBoxes[j], R = cardBoxes[j + 1];  
    for (let i = 0; i < maxRows; i++) {  
      const a = L[i], b = R[i];  
      if (a && b) drawArrowBetweenRects(slide, a, b, arrowH, arrowGap);  
    }  
  }

  drawBottomBarAndFooter(slide, layout, pageNum);  
}

// cards（グレー枠のみ）— title/desc 両方でインライン装飾を有効化  
function createCardsSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  drawStandardTitleHeader(slide, layout, 'cardsSlide', data.title);  
  const dy = drawSubheadIfAny(slide, layout, 'cardsSlide', data.subhead);

  const area = offsetRect(layout.getRect('cardsSlide.gridArea'), 0, dy);  
  const items = Array.isArray(data.items) ? data.items : [];  
  const cols = Math.min(3, Math.max(2, Number(data.columns) || (items.length <= 4 ? 2 : 3)));  
  const gap = layout.pxToPt(16);  
  const rows = Math.ceil(items.length / cols);  
  const cardW = (area.width - gap * (cols - 1)) / cols;  
  const cardH = Math.max(layout.pxToPt(92), (area.height - gap * (rows - 1)) / rows);

  for (let idx = 0; idx < items.length; idx++) {  
    const r = Math.floor(idx / cols), c = idx % cols;  
    const left = area.left + c * (cardW + gap);  
    const top  = area.top  + r * (cardH + gap);

    const card = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, left, top, cardW, cardH);  
    card.getFill().setSolidFill(Theme.getColor('cardBg'));  
    card.getBorder().getLineFill().setSolidFill(Theme.getColor('cardBorder'));  
    card.getBorder().setWeight(1);

    const obj = items[idx];  
    if (typeof obj === 'string') {  
      setStyledText(card, obj, { size: Theme.getFontSize('body') });  
    } else {  
      const title = String(obj.title || '');  
      const desc  = String(obj.desc || '');  
      const combined = `${title}${desc ? '\n' + desc : ''}`;  
      setStyledText(card, combined, { size: Theme.getFontSize('body') });  
      if (title.length > 0) {  
        try { card.getText().getRange(0, title.length).getTextStyle().setBold(true); } catch(e){}  
      }  
    }  
    try { card.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE); } catch(e) {}  
  }

  drawBottomBarAndFooter(slide, layout, pageNum);  
}

// table（Slidesテーブルでもインライン装飾対応。失敗時は矩形代替でも対応）  
function createTableSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  drawStandardTitleHeader(slide, layout, 'tableSlide', data.title);  
  const dy = drawSubheadIfAny(slide, layout, 'tableSlide', data.subhead);

  const area = offsetRect(layout.getRect('tableSlide.area'), 0, dy);  
  const headers = Array.isArray(data.headers) ? data.headers : [];  
  const rows = Array.isArray(data.rows) ? data.rows : [];

  try {  
    if (headers.length > 0) {  
      const table = slide.insertTable(rows.length + 1, headers.length);  
      table.setLeft(area.left).setTop(area.top).setWidth(area.width);  
      for (let c = 0; c < headers.length; c++) {  
        const cell = table.getCell(0, c);  
        setStyledText(cell, String(headers[c] || ''), { bold: true, align: SlidesApp.ParagraphAlignment.CENTER });  
      }  
      for (let r = 0; r < rows.length; r++) {  
        const row = rows[r] || [];  
        for (let c = 0; c < headers.length; c++) {  
          const cell = table.getCell(r + 1, c);  
          setStyledText(cell, String(row[c] || ''), { align: SlidesApp.ParagraphAlignment.CENTER });  
        }  
      }  
    } else {  
      throw new Error('headers is empty');  
    }  
  } catch (e) {  
    const cols = Math.max(1, headers.length || 3);  
    const rcount = rows.length + 1;  
    const gap = layout.pxToPt(1);  
    const cellW = (area.width - gap * (cols - 1)) / cols;  
    const cellH = (area.height - gap * (rcount - 1)) / rcount;  
    const drawCell = (r, c, text, bold) => {  
      const left = area.left + c * (cellW + gap);  
      const top  = area.top  + r * (cellH + gap);  
      const cell = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, left, top, cellW, cellH);  
      cell.getFill().setSolidFill(Theme.getColor('background'));  
      cell.getBorder().getLineFill().setSolidFill(Theme.getColor('cardBorder'));  
      cell.getBorder().setWeight(1);  
      setStyledText(cell, String(text || ''), { bold: !!bold, align: SlidesApp.ParagraphAlignment.CENTER });  
      try { cell.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE); } catch(e){}  
    };  
    (headers.length ? headers : ['項目','値1','値2']).forEach((h, c) => drawCell(0, c, h, true));  
    for (let r = 0; r < rows.length; r++) {  
      const row = rows[r] || [];  
      for (let c = 0; c < (headers.length || 3); c++) drawCell(r + 1, c, row[c], false);  
    }  
  }

  drawBottomBarAndFooter(slide, layout, pageNum);  
}

// progress（進捗バー）  
function createProgressSlide(slide, data, layout, pageNum) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  drawStandardTitleHeader(slide, layout, 'progressSlide', data.title);  
  const dy = drawSubheadIfAny(slide, layout, 'progressSlide', data.subhead);

  const area = offsetRect(layout.getRect('progressSlide.area'), 0, dy);  
  const items = Array.isArray(data.items) ? data.items : [];  
  const n = Math.max(1, items.length);  
  const rowH = area.height / n;

  for (let i = 0; i < n; i++) {  
    const y = area.top + i * rowH + layout.pxToPt(6);  
    const label = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, area.left, y, layout.pxToPt(150), layout.pxToPt(18));  
    setStyledText(label, String(items[i].label || ''), { size: Theme.getFontSize('body') });

    const barLeft = area.left + layout.pxToPt(160);  
    const barW    = area.width - layout.pxToPt(210);  
    const barBG = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, barLeft, y, barW, layout.pxToPt(14));  
    barBG.getFill().setSolidFill(Theme.getColor('faint')); barBG.getBorder().setTransparent();

    const p = Math.max(0, Math.min(100, Number(items[i].percent || 0)));  
    const barFG = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, barLeft, y, barW * (p/100), layout.pxToPt(14));  
    barFG.getFill().setSolidFill(Theme.getColor('success')); barFG.getBorder().setTransparent();

    const pct = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, barLeft + barW + layout.pxToPt(6), y - layout.pxToPt(1), layout.pxToPt(40), layout.pxToPt(16));  
    pct.getText().setText(String(p) + '%');  
    applyTextStyle(pct.getText(), { size: Theme.getFontSize('small'), color: Theme.getColor('textSecondary') });  
  }

  drawBottomBarAndFooter(slide, layout, pageNum);  
}

function createClosingSlide(slide, data, layout) {  
  slide.getBackground().setSolidFill(Theme.getColor('background'));  
  const image = slide.insertImage(Theme.getLogo('closing'));  
  const imgW_pt = layout.pxToPt(450) * layout.scaleX;  
  const aspect = image.getHeight() / image.getWidth();  
  image.setWidth(imgW_pt).setHeight(imgW_pt * aspect);  
  image.setLeft((layout.pageW_pt - imgW_pt) / 2).setTop((layout.pageH_pt - (imgW_pt * aspect)) / 2);  
}

// --- 7. ユーティリティ関数群 ---  
function offsetRect(rect, dx, dy) {  
  return { left: rect.left + (dx || 0), top: rect.top + (dy || 0), width: rect.width, height: rect.height };  
}

function drawStandardTitleHeader(slide, layout, key, title) {  
  const logoRect = layout.getRect(`${key}.headerLogo`);  
  const logo = slide.insertImage(Theme.getLogo('header'));  
  const asp = logo.getHeight() / logo.getWidth();  
  logo.setLeft(logoRect.left).setTop(logoRect.top).setWidth(logoRect.width).setHeight(logoRect.width * asp);

  const titleRect = layout.getRect(`${key}.title`);  
  const titleShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, titleRect.left, titleRect.top, titleRect.width, titleRect.height);  
  setStyledText(titleShape, title || '', { size: Theme.getFontSize('contentTitle'), bold: true });

  const uRect = layout.getRect(`${key}.titleUnderline`);  
  const u = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, uRect.left, uRect.top, uRect.width, uRect.height);  
  u.getFill().setSolidFill(Theme.getColor('primary'));  
  u.getBorder().setTransparent();  
}

function drawSubheadIfAny(slide, layout, key, subhead) {  
  if (!subhead) return 0;  
  const rect = layout.getRect(`${key}.subhead`);  
  const box = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, rect.left, rect.top, rect.width, rect.height);  
  setStyledText(box, subhead, { size: Theme.getFontSize('subhead'), color: Theme.getColor('text') });  
  return layout.pxToPt(36);  
}

function drawBottomBar(slide, layout) {  
  const barRect = layout.getRect('bottomBar');  
  const bar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, barRect.left, barRect.top, barRect.width, barRect.height);  
  bar.getFill().setSolidFill(Theme.getColor('primary'));  
  bar.getBorder().setTransparent();  
}

function drawBottomBarAndFooter(slide, layout, pageNum) {  
  drawBottomBar(slide, layout);  
  addGoogleFooter(slide, layout, pageNum);  
}

function addGoogleFooter(slide, layout, pageNum) {  
  const leftRect = layout.getRect('footer.leftText');  
  const leftShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, leftRect.left, leftRect.top, leftRect.width, leftRect.height);  
  leftShape.getText().setText(Theme.getFooterText());  
  applyTextStyle(leftShape.getText(), { size: Theme.getFontSize('footer'), color: Theme.getColor('text') });

  if (pageNum > 0) {  
    const rightRect = layout.getRect('footer.rightPage');  
    const rightShape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, rightRect.left, rightRect.top, rightRect.width, rightRect.height);  
    rightShape.getText().setText(String(pageNum));  
    applyTextStyle(rightShape.getText(), { size: Theme.getFontSize('footer'), color: Theme.getColor('primary'), align: SlidesApp.ParagraphAlignment.END });  
  }  
}

function applyTextStyle(textRange, opt) {  
  const style = textRange.getTextStyle();  
  style.setFontFamily(Theme.getFontFamily());  
  style.setForegroundColor(opt.color || Theme.getColor('text'));  
  style.setFontSize(opt.size || Theme.getFontSize('body'));  
  style.setBold(opt.bold || false);  
  if (opt.align) {  
    try { textRange.getParagraphs().forEach(p => p.getRange().getParagraphStyle().setParagraphAlignment(opt.align)); } catch (e) {}  
  }  
}

function setStyledText(shapeOrCell, rawText, baseOpt) {  
  const parsed = parseInlineStyles(rawText || '');  
  const tr = shapeOrCell.getText();  
  tr.setText(parsed.output);  
  applyTextStyle(tr, baseOpt || {});  
  applyStyleRanges(tr, parsed.ranges);  
}

function setBulletsWithInlineStyles(shape, points) {  
  const joiner = '\n\n';  
  let combined = '';  
  const ranges = [];

  (points || []).forEach((pt, idx) => {  
    const parsed = parseInlineStyles(String(pt || ''));  
    const bullet = '• ' + parsed.output;  
    if (idx > 0) combined += joiner;  
    const start = combined.length;  
    combined += bullet;

    parsed.ranges.forEach(r => {  
      ranges.push({ start: start + 2 + r.start, end: start + 2 + r.end, bold: r.bold, color: r.color });  
    });  
  });

  const tr = shape.getText();  
  tr.setText(combined || '• —');  
  applyTextStyle(tr, { size: Theme.getFontSize('body') });

  try {  
    tr.getParagraphs().forEach(p => {  
      const ps = p.getRange().getParagraphStyle();  
      ps.setLineSpacing(100);  
      ps.setSpaceBelow(6);  
    });  
  } catch (e) {}

  applyStyleRanges(tr, ranges);  
}

function parseInlineStyles(s) {  
  const ranges = [];  
  let out = '';  
  for (let i = 0; i < s.length; ) {  
    // [[青太字]]  
    if (s[i] === '[' && s[i+1] === '[') {  
      const close = s.indexOf(']]', i + 2);  
      if (close !== -1) {  
        const content = s.substring(i + 2, close);  
        const start = out.length;  
        out += content;  
        const end = out.length;  
        ranges.push({ start, end, bold: true, color: Theme.getColor('primary') });  
        i = close + 2; continue;  
      }  
    }  
    // **太字**  
    if (s[i] === '*' && s[i+1] === '*') {  
      const close = s.indexOf('**', i + 2);  
      if (close !== -1) {  
        const content = s.substring(i + 2, close);  
        const start = out.length;  
        out += content;  
        const end = out.length;  
        ranges.push({ start, end, bold: true });  
        i = close + 2; continue;  
      }  
    }  
    out += s[i]; i++;  
  }  
  return { output: out, ranges };  
}

function applyStyleRanges(textRange, ranges) {  
  ranges.forEach(r => {  
    try {  
      const sub = textRange.getRange(r.start, r.end);  
      if (!sub) return;  
      const st = sub.getTextStyle();  
      if (r.bold)  st.setBold(true);  
      if (r.color) st.setForegroundColor(r.color);  
    } catch (e) {}  
  });  
}

function normalizeImages(arr) {  
  return (arr || []).map(v => {  
    if (typeof v === 'string') return { url: v };  
    if (v && typeof v.url === 'string') return { url: v.url, caption: v.caption || '' };  
    return null;  
  }).filter(Boolean).slice(0, 6);  
}

function renderImagesInArea(slide, layout, area, images) {  
  if (!images || images.length === 0) return;  
  const n = Math.min(6, images.length);  
  let cols = 1, rows = 1;  
  if (n === 1) { cols = 1; rows = 1; }  
  else if (n === 2) { cols = 2; rows = 1; }  
  else if (n <= 4) { cols = 2; rows = 2; }  
  else { cols = 3; rows = 2; }

  const gap = layout.pxToPt(10);  
  const cellW = (area.width - gap * (cols - 1)) / cols;  
  const cellH = (area.height - gap * (rows - 1)) / rows;

  for (let i = 0; i < n; i++) {  
    const r = Math.floor(i / cols), c = i % cols;  
    const left = area.left + c * (cellW + gap);  
    const top  = area.top  + r * (cellH + gap);  
    try {  
      const img = slide.insertImage(images[i].url);  
      const scale = Math.min(cellW / img.getWidth(), cellH / img.getHeight());  
      const w = img.getWidth() * scale;  
      const h = img.getHeight() * scale;  
      img.setWidth(w).setHeight(h);  
      img.setLeft(left + (cellW - w) / 2).setTop(top + (cellH - h) / 2);  
    } catch(e) {}  
  }  
}

function isAgendaTitle(title) {  
  const t = String(title || '').toLowerCase();  
  return /(agenda|アジェンダ|目次|本日お伝えすること)/.test(t);  
}  

function buildAgendaFromSlideData() {  
  const pts = [];  
  for (const d of slideData) {  
    if (d && d.type === 'section' && typeof d.title === 'string' && d.title.trim()) pts.push(d.title.trim());  
  }  
  if (pts.length > 0) return pts.slice(0, 5);  
  const alt = [];  
  for (const d of slideData) {  
    if (d && d.type === 'content' && typeof d.title === 'string' && d.title.trim()) alt.push(d.title.trim());  
  }  
  return alt.slice(0, 5);  
}

function drawArrowBetweenRects(slide, a, b, arrowH, arrowGap) {  
  const fromX = a.left + a.width;  
  const toX   = b.left;  
  const width = Math.max(0, toX - fromX - arrowGap * 2);  
  if (width < 8) return;  
  const yMid = ((a.top + a.height/2) + (b.top + b.height/2)) / 2;  
  const top = yMid - arrowH / 2;  
  const left = fromX + arrowGap;  
  const arr = slide.insertShape(SlidesApp.ShapeType.RIGHT_ARROW, left, top, width, arrowH);  
  arr.getFill().setSolidFill(Theme.getColor('primary'));  
  arr.getBorder().setTransparent();  
}