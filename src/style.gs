
// --- 2. マスターデザイン設定 (Google Design Ver.) ---  
const CONFIG = {  
BASE_PX: { W: 960, H: 540 },

// レイアウトの基準となる不変のpx値  
POS_PX: {  
titleSlide: {  
logo:       { left: 55,  top: 105,  width: 135 },  
title:      { left: 50,  top: 230, width: 800, height: 90 },  
date:       { left: 50,  top: 340, width: 250, height: 40 },  
},

// 共通ヘッダーを持つ各スライド  
contentSlide: {  
  headerLogo:     { right: 20, top: 20, width: 75 },  
  title:          { left: 25, top: 60,  width: 830, height: 65 },  
  titleUnderline: { left: 25, top: 128, width: 260, height: 4 },  
  subhead:        { left: 25, top: 140, width: 830, height: 30 },  
  body:           { left: 25, top: 172, width: 910, height: 303 },  
  twoColLeft:     { left: 25,  top: 172, width: 440, height: 303 },  
  twoColRight:    { left: 495, top: 172, width: 440, height: 303 }  
},  
compareSlide: {  
  headerLogo:     { right: 20, top: 20, width: 75 },  
  title:          { left: 25, top: 60,  width: 830, height: 65 },  
  titleUnderline: { left: 25, top: 128, width: 260, height: 4 },  
  subhead:        { left: 25, top: 140, width: 830, height: 30 },  
  leftBox:        { left: 25,  top: 172, width: 430, height: 303 },  
  rightBox:       { left: 505, top: 172, width: 430, height: 303 }  
},  
processSlide: {  
  headerLogo:     { right: 20, top: 20, width: 75 },  
  title:          { left: 25, top: 60,  width: 830, height: 65 },  
  titleUnderline: { left: 25, top: 128, width: 260, height: 4 },  
  subhead:        { left: 25, top: 140, width: 830, height: 30 },  
  area:           { left: 25, top: 172, width: 910, height: 303 }  
},  
timelineSlide: {  
  headerLogo:     { right: 20, top: 20, width: 75 },  
  title:          { left: 25, top: 60,  width: 830, height: 65 },  
  titleUnderline: { left: 25, top: 128, width: 260, height: 4 },  
  subhead:        { left: 25, top: 140, width: 830, height: 30 },  
  area:           { left: 25, top: 172, width: 910, height: 303 }  
},  
diagramSlide: {  
  headerLogo:     { right: 20, top: 20, width: 75 },  
  title:          { left: 25, top: 60,  width: 830, height: 65 },  
  titleUnderline: { left: 25, top: 128, width: 260, height: 4 },  
  subhead:        { left: 25, top: 140, width: 830, height: 30 },  
  lanesArea:      { left: 25, top: 172, width: 910, height: 303 }  
},  
cardsSlide: {  
  headerLogo:     { right: 20, top: 20, width: 75 },  
  title:          { left: 25, top: 60,  width: 830, height: 65 },  
  titleUnderline: { left: 25, top: 128, width: 260, height: 4 },  
  subhead:        { left: 25, top: 140, width: 830, height: 30 },  
  gridArea:       { left: 25, top: 172, width: 910, height: 303 }  
},  
tableSlide: {  
  headerLogo:     { right: 20, top: 20, width: 75 },  
  title:          { left: 25, top: 60,  width: 830, height: 65 },  
  titleUnderline: { left: 25, top: 128, width: 260, height: 4 },  
  subhead:        { left: 25, top: 140, width: 830, height: 30 },  
  area:           { left: 25, top: 172, width: 910, height: 303 }  
},  
progressSlide: {  
  headerLogo:     { right: 20, top: 20, width: 75 },  
  title:          { left: 25, top: 60,  width: 830, height: 65 },  
  titleUnderline: { left: 25, top: 128, width: 260, height: 4 },  
  subhead:        { left: 25, top: 140, width: 830, height: 30 },  
  area:           { left: 25, top: 172, width: 910, height: 303 }  
},

// 章扉（背景に大きなゴースト番号）  
sectionSlide: {  
  title:      { left: 55, top: 230, width: 840, height: 80 },  
  ghostNum:   { left: 35, top: 120, width: 300, height: 200 }  
},

footer: {  
  leftText:  { left: 15, top: 505, width: 250, height: 20 },  
  rightPage: { right: 15, top: 505, width: 50,  height: 20 }  
},  
bottomBar: { left: 0, top: 534, width: 960, height: 6 }  

},

FONTS: {  
family: 'Arial',  
sizes: {  
title: 45,  
date: 16,  
sectionTitle: 38,  
contentTitle: 28,  
subhead: 18,  
body: 14,  
footer: 9,  
chip: 11,  
laneTitle: 13,  
small: 10,  
processStep: 14,  
axis: 12,  
ghostNum: 180  
}  
},  
COLORS: {  
primary_blue: '#4285F4',  
google_red: '#EA4335',  
google_yellow: '#FBBC04',  
google_green: '#34A853',  
text_primary: '#333333',  
background_white: '#FFFFFF',  
background_gray: '#f8f9fa',  
faint_gray: '#e8eaed',  
lane_title_bg: '#f5f5f3',  
lane_border: '#dadce0',  
card_bg: '#ffffff',  
card_border: '#dadce0',  
neutral_gray: '#9e9e9e',  
ghost_gray: '#efefed'  
},  
DIAGRAM: {  
laneGap_px: 24, lanePad_px: 10, laneTitle_h_px: 30,  
cardGap_px: 12, cardMin_h_px: 48, cardMax_h_px: 70,  
arrow_h_px: 10, arrowGap_px: 8  
},

LOGOS: {  
header: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1024px-Google_2015_logo.svg.png',  
closing: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1024px-Google_2015_logo.svg.png'  
},

FOOTER_TEXT: `© ${new Date().getFullYear()} Your Organization`  
};
