// --- テーマ抽象化レイヤー ---
// style.gsのCONFIGとslide.gsの間の抽象化層

/**
 * テーマAPI - slide.gsはこのAPIのみを使用
 * CONFIGの詳細を隠蔽し、意味的なインターフェースを提供
 */
const Theme = {
  // 色取得
  getColor: (semantic) => {
    const colorMap = {
      'primary': CONFIG.COLORS.primary_blue,
      'background': CONFIG.COLORS.background_white,
      'backgroundAlt': CONFIG.COLORS.background_gray,
      'text': CONFIG.COLORS.text_primary,
      'textSecondary': CONFIG.COLORS.neutral_gray,
      'success': CONFIG.COLORS.google_green,
      'warning': CONFIG.COLORS.google_yellow,
      'error': CONFIG.COLORS.google_red,
      'border': CONFIG.COLORS.lane_border,
      'cardBg': CONFIG.COLORS.card_bg,
      'cardBorder': CONFIG.COLORS.card_border,
      'faint': CONFIG.COLORS.faint_gray,
      'ghost': CONFIG.COLORS.ghost_gray
    };
    return colorMap[semantic] || CONFIG.COLORS.text_primary;
  },

  // フォントサイズ取得
  getFontSize: (semantic) => {
    const sizeMap = {
      'title': CONFIG.FONTS.sizes.title,
      'sectionTitle': CONFIG.FONTS.sizes.sectionTitle,
      'contentTitle': CONFIG.FONTS.sizes.contentTitle,
      'subhead': CONFIG.FONTS.sizes.subhead,
      'body': CONFIG.FONTS.sizes.body,
      'small': CONFIG.FONTS.sizes.small,
      'footer': CONFIG.FONTS.sizes.footer,
      'processStep': CONFIG.FONTS.sizes.processStep,
      'laneTitle': CONFIG.FONTS.sizes.laneTitle,
      'ghostNum': CONFIG.FONTS.sizes.ghostNum
    };
    return sizeMap[semantic] || CONFIG.FONTS.sizes.body;
  },

  // フォントファミリー
  getFontFamily: () => CONFIG.FONTS.family,

  // ロゴURL取得
  getLogo: (type) => {
    const logoMap = {
      'header': CONFIG.LOGOS.header,
      'closing': CONFIG.LOGOS.closing
    };
    return logoMap[type] || CONFIG.LOGOS.header;
  },

  // レイアウト取得（layoutManagerに委譲）
  getLayout: (pageW_pt, pageH_pt) => {
    return createLayoutManager(pageW_pt, pageH_pt);
  },

  // 図表スタイル取得
  getDiagramStyle: () => ({
    laneGap: CONFIG.DIAGRAM.laneGap_px,
    lanePad: CONFIG.DIAGRAM.lanePad_px,
    laneTitleH: CONFIG.DIAGRAM.laneTitle_h_px,
    cardGap: CONFIG.DIAGRAM.cardGap_px,
    cardMinH: CONFIG.DIAGRAM.cardMin_h_px,
    cardMaxH: CONFIG.DIAGRAM.cardMax_h_px,
    arrowH: CONFIG.DIAGRAM.arrow_h_px,
    arrowGap: CONFIG.DIAGRAM.arrowGap_px
  }),

  // フッターテキスト
  getFooterText: () => CONFIG.FOOTER_TEXT,

  // 基準サイズ
  getBaseSize: () => CONFIG.BASE_PX
};

/**
 * レイアウトマネージャー作成（既存のcreateLayoutManager関数を移動）
 */
function createLayoutManager(pageW_pt, pageH_pt) {
  const pxToPt = (px) => px * 0.75;
  const baseW_pt = pxToPt(CONFIG.BASE_PX.W);
  const baseH_pt = pxToPt(CONFIG.BASE_PX.H);
  const scaleX = pageW_pt / baseW_pt;
  const scaleY = pageH_pt / baseH_pt;

  const getPositionFromPath = (path) => path.split('.').reduce((obj, key) => obj[key], CONFIG.POS_PX);
  return {
    scaleX, scaleY, pageW_pt, pageH_pt, pxToPt,
    getRect: (spec) => {
      const pos = typeof spec === 'string' ? getPositionFromPath(spec) : spec;
      let left_px = pos.left;
      if (pos.right !== undefined && pos.left === undefined) {
        left_px = CONFIG.BASE_PX.W - pos.right - pos.width;
      }
      return {
        left:   left_px !== undefined ? pxToPt(left_px) * scaleX : undefined,
        top:    pos.top !== undefined ? pxToPt(pos.top) * scaleY : undefined,
        width:  pos.width !== undefined ? pxToPt(pos.width) * scaleX : undefined,
        height: pos.height !== undefined ? pxToPt(pos.height) * scaleY : undefined,
      };
    }
  };
}