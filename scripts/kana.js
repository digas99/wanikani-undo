const separateRomaji = input => {
	let finalArray = [];
	let word = "";

	for (let i = 0; i < input.length; i++) {
		const c = input.charAt(i);
		word += c;
		// if it is hiragana/katakana/punctuation, or a value, or the last char
		if (c.match(/[\u3000-\u30ff]/) || i == input.length-1) {
			finalArray.push(word);
			word = "";
		}
			
	}
		
	return finalArray;
}

const convertToKana = text => {
	let finalValue = "";
	const vowels = ["a", "i", "u", "e", "o", "A", "I", "U", "E", "O"];
	const split = separateRomaji(text);
	for (const word of split) {
		let kanaValue = kana[word];
		// handle situations like 'kanji' -> 'kannji'
		if (!kanaValue && word.length > 1 && word.charAt(0) == "n" && !vowels.includes(word.charAt(1)) && word.charAt(1) !== 'y')
			kanaValue = kana[/[a-z]/.test(word.charAt(0)) ? 'nn' : 'NN']+word.charAt(1);
		// handle situations like 'kko' -> 'っこ' and 'shussha' -> 'しゅっしゃ'
		else if (!kanaValue && word.length >=3 && word.charAt(0) === word.charAt(1) && vowels.includes(word.charAt(word.length-1)))
			kanaValue = kana[/[a-z]/.test(word.charAt(0)) ? 'll' : 'LL']+kana[word.slice(1)];
		finalValue += kanaValue ? kanaValue : word;
	}
	return finalValue;
}

const kana = {
	"a": "あ",
	"i": "い",
	"u": "う",
	"e": "え",
	"o": "お",
	"ka": "か",
	"ki": "き",
	"ku": "く",
	"ke": "け",
	"ko": "こ",
	"ga": "が",
	"gi": "ぎ",
	"gu": "ぐ",
	"ge": "げ",
	"go": "ご",
	"sa": "さ",
	"shi": "し",
	"si": "し",
	"su": "す",
	"se": "せ",
	"so": "そ",
	"za": "ざ",
	"ji": "じ",
	"zu": "ず",
	"ze": "ぜ",
	"zo": "ぞ",
	"ta": "た",
	"chi": "ち",
	"ti": "ち",
	"tsu": "つ",
	"tu": "つ",
	"te": "て",
	"to": "と",
	"da": "だ",
	"di": "ぢ",
	"du": "づ",
	"de": "で",
	"do": "ど",
	"na": "な",
	"ni": "に",
	"nu": "ぬ",
	"ne": "ね",
	"no": "の",
	"ha": "は",
	"hi": "ひ",
	"hu": "ふ",
	"fu": "ふ",
	"he": "へ",
	"ho": "ほ",
	"ba": "ば",
	"bi": "び",
	"bu": "ぶ",
	"be": "べ",
	"bo": "ぼ",
	"pa": "ぱ",
	"pi": "ぴ",
	"pu": "ぷ",
	"pe": "ぺ",
	"po": "ぽ",
	"ma": "ま",
	"mi": "み",
	"mu": "む",
	"me": "め",
	"mo": "も",
	"ra": "ら",
	"ri": "り",
	"ru": "る",
	"re": "れ",
	"ro": "ろ",
	"ya": "や",
	"yu": "ゆ",
	"ye": "いぇ",
	"yo": "よ",
	"wa": "わ",
	"wi": "うぃ",
	"we": "うぇ",
	"wo": "を",
	"nn": "ん",
	"ja": "じゃ",
	"ju": "じゅ",
	"je": "じぇ",
	"jo": "じょ",
	"ca": "か",
	"ci": "し",
	"cu": "く",
	"ce": "せ",
	"co": "こ",
	"qa": "くぁ",
	"qi": "くぃ",
	"qu": "く",
	"qe": "くぇ",
	"qo": "くぉ",
	"fa": "ふぁ",
	"fi": "ふぃ",
	"fe": "ふぇ",
	"fo": "ふぉ",
	"la": "ぁ",
	"li": "ぃ",
	"lu": "ぅ",
	"le": "ぇ",
	"lo": "ぉ",
	"xa": "ぁ",
	"xi": "ぃ",
	"xu": "ぅ",
	"xe": "ぇ",
	"xo": "ぉ",
	"va": "ゔぁ",
	"vi": "ゔぃ",
	"vu": "ゔ",
	"ve": "ゔぇ",
	"vo": "ゔぉ",
	"-": "ー",
	",": "、",
	".": "。",
	"ll": "っ",
	"xx": "っ",
	"kya": "きゃ",
	"kyi": "きぃ",
	"kyu": "きゅ",
	"kye": "きぇ",
	"kyo": "きょ",
	"gya": "ぎゃ",
	"gyi": "ぎぃ",
	"gyu": "ぎゅ",
	"gye": "ぎぇ",
	"gyo": "ぎょ",
	"sha": "しゃ",
	"sya": "しゃ",
	"syi": "しぃ",
	"shu": "しゅ",
	"syu": "しゅ",
	"she": "しぇ",
	"sye": "しぇ",
	"sho": "しょ",
	"syo": "しょ",
	"ja": "じゃ",
	"jya": "じゃ",
	"zya": "じゃ",
	"jyi": "じぃ",
	"zyi": "じぃ",
	"ju": "じゅ",
	"jyu": "じゅ",
	"zyu": "じゅ",
	"je": "じぇ",
	"jye": "じぇ",
	"zye": "じぇ",
	"jo": "じょ",
	"jyo": "じょ",
	"zyo": "じょ",
	"cha": "ちゃ",
	"tya": "ちゃ",
	"tyi": "ちぃ",
	"chu": "ちゅ",
	"tyu": "ちゅ",
	"che": "ちぇ",
	"tye": "ちぇ",
	"cho": "ちょ",
	"tyo": "ちょ",
	"dya": "ぢゃ",
	"dyi": "ぢぃ",
	"dyu": "ぢゅ",
	"dye": "ぢぇ",
	"dyo": "ぢょ",
	"hya": "ひゃ",
	"hyi": "ひぃ",
	"hyu": "ひゅ",
	"hye": "ひぇ",
	"hyo": "ひょ",
	"bya": "びゃ",
	"byi": "びぃ",
	"byu": "びゅ",
	"bye": "びぇ",
	"byo": "びょ",
	"pya": "ぴゃ",
	"pyi": "ぴぃ",
	"pyu": "ぴゅ",
	"pye": "ぴぇ",
	"pyo": "ぴょ",
	"fya": "ふゃ",
	"fyu": "ふゅ",
	"fyo": "ふょ",
	"mya": "みゃ",
	"myi": "みぃ",
	"myu": "みゅ",
	"mye": "みぇ",
	"myo": "みょ",
	"nya": "にゃ",
	"nyi": "にぃ",
	"nyu": "にゅ",
	"nye": "にぇ",
	"nyo": "にょ",
	"rya": "りゃ",
	"ryi": "りぃ",
	"ryu": "りゅ",
	"rye": "りぇ",
	"ryo": "りょ",
	"cya": "ちゃ",
	"cyi": "ちぃ",
	"cyu": "ちゅ",
	"cye": "ちぇ",
	"cyo": "ちょ",
	"lya": "ゃ",
	"lyi": "ぃ",
	"lyu": "ゅ",
	"lye": "ぇ",
	"lyo": "ょ",
	"xya": "ゃ",
	"xyi": "ぃ",
	"xyu": "ゅ",
	"xye": "ぇ",
	"xyo": "ょ",
	"vya": "ゔゃ",
	"vyi": "ゔぃ",
	"vyu": "ゔゅ",
	"vye": "ゔぇ",
	"vyo": "ゔょ",
	"A": "ア",
	"I": "イ",
	"U": "ウ",
	"E": "エ",
	"O": "オ",
	"KA": "カ",
	"KI": "キ",
	"KU": "ク",
	"KE": "ケ",
	"KO": "コ",
	"GA": "ガ",
	"GI": "ギ",
	"GU": "グ",
	"GE": "ゲ",
	"GO": "ゴ",
	"SA": "サ",
	"SHI": "シ",
	"SI": "シ",
	"SU": "ス",
	"SE": "セ",
	"SO": "ソ",
	"ZA": "ザ",
	"JI": "ジ",
	"ZU": "ズ",
	"ZE": "ゼ",
	"ZO": "ゾ",
	"TA": "タ",
	"CHI": "チ",
	"TI": "チ",
	"TSU": "ツ",
	"TU": "ツ",
	"TE": "テ",
	"TO": "ト",
	"DA": "ダ",
	"DI": "ヂ",
	"DU": "ヅ",
	"DE": "デ",
	"DO": "ド",
	"NA": "ナ",
	"NI": "ニ",
	"NU": "ヌ",
	"NE": "ネ",
	"NO": "ノ",
	"HA": "ハ",
	"HI": "ヒ",
	"HU": "フ",
	"FU": "フ",
	"HE": "ヘ",
	"HO": "ホ",
	"BA": "バ",
	"BI": "ビ",
	"BU": "ブ",
	"BE": "ベ",
	"BO": "ボ",
	"PA": "パ",
	"PI": "ピ",
	"PU": "プ",
	"PE": "ペ",
	"PO": "ポ",
	"MA": "マ",
	"MI": "ミ",
	"MU": "ム",
	"ME": "メ",
	"MO": "モ",
	"RA": "ラ",
	"RI": "リ",
	"RU": "ル",
	"RE": "レ",
	"RO": "ロ",
	"YA": "ヤ",
	"YU": "ユ",
	"YE": "イェ",
	"YO": "ヨ",
	"WA": "ワ",
	"WI": "ウィ",
	"WE": "ウェ",
	"WO": "ヲ",
	"NN": "ン",
	"LL": "ッ",
	"XX": "ッ",
	"JA": "ジャ",
	"JU": "ジュ",
	"JE": "ジェ",
	"JO": "ジョ",
	"CA": "カ",
	"CI": "シ",
	"CU": "ク",
	"CE": "セ",
	"CO": "コ",
	"QA": "クァ",
	"QI": "クィ",
	"QU": "ク",
	"QE": "クェ",
	"QO": "クォ",
	"FA": "ファ",
	"FI": "フィ",
	"FE": "フェ",
	"FO": "フォ",
	"LA": "ァ",
	"LI": "ィ",
	"LU": "ゥ",
	"LE": "ェ",
	"LO": "ォ",
	"XA": "ァ",
	"XI": "ィ",
	"XU": "ゥ",
	"XE": "ェ",
	"XO": "ォ",
	"VA": "ヴァ",
	"VI": "ヴィ",
	"VU": "ヴ",
	"VE": "ヴェ",
	"VO": "ヴォ",
	"KYA": "キャ",
	"KYI": "キィ",
	"KYU": "キュ",
	"KYE": "キェ",
	"KYO": "キョ",
	"GYA": "ギャ",
	"GYI": "ギィ",
	"GYU": "ギュ",
	"GYE": "ギェ",
	"GYO": "ギョ",
	"SHA": "シャ",
	"SYA": "シャ",
	"SYI": "シィ",
	"SHU": "シュ",
	"SYU": "シュ",
	"SHE": "シェ",
	"SYE": "シェ",
	"SHO": "ショ",
	"SYO": "ショ",
	"JA": "ジャ",
	"JYA": "ジャ",
	"ZYA": "ジャ",
	"JYI": "ジィ",
	"ZYI": "ジィ",
	"JU": "ジュ",
	"JYU": "ジュ",
	"ZYU": "ジュ",
	"JE": "ジェ",
	"JYE": "ジェ",
	"ZYE": "ジェ",
	"JO": "ジョ",
	"JYO": "ジョ",
	"ZYO": "ジョ",
	"CHA": "チャ",
	"TYA": "チャ",
	"TYI": "チィ",
	"CHU": "チュ",
	"TYU": "チュ",
	"CHE": "チェ",
	"TYE": "チェ",
	"CHO": "チョ",
	"TYO": "チョ",
	"DYA": "ヂャ",
	"DYI": "ヂィ",
	"DYU": "ヂュ",
	"DYE": "ヂェ",
	"DYO": "ヂョ",
	"HYA": "ヒャ",
	"HYI": "ヒィ",
	"HYU": "ヒュ",
	"HYE": "ヒェ",
	"HYO": "ヒョ",
	"BYA": "ビャ",
	"BYI": "ビィ",
	"BYU": "ビュ",
	"BYE": "ビェ",
	"BYO": "ビョ",
	"PYA": "ピャ",
	"PYI": "ピィ",
	"PYU": "ピュ",
	"PYE": "ピェ",
	"PYO": "ピョ",
	"FYA": "フャ",
	"FYU": "フュ",
	"FYO": "フョ",
	"MYA": "ミャ",
	"MYI": "ミィ",
	"MYU": "ミュ",
	"MYE": "ミェ",
	"MYO": "ミョ",
	"NYA": "ニャ",
	"NYI": "ニィ",
	"NYU": "ニュ",
	"NYE": "ニェ",
	"NYO": "ニョ",
	"RYA": "リャ",
	"RYI": "リィ",
	"RYU": "リュ",
	"RYE": "リェ",
	"RYO": "リョ",
	"CYA": "チャ",
	"CYI": "チィ",
	"CYU": "チュ",
	"CYE": "チェ",
	"CYO": "チョ",
	"LYA": "ャ",
	"LYI": "ィ",
	"LYU": "ュ",
	"LYE": "ェ",
	"LYO": "ョ",
	"XYA": "ャ",
	"XYI": "ィ",
	"XYU": "ュ",
	"XYE": "ェ",
	"XYO": "ョ",
	"VYA": "ヴャ",
	"VYI": "ヴィ",
	"VYU": "ヴュ",
	"VYE": "ヴェ",
	"VYO": "ヴョ",
}