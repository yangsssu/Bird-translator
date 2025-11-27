import React, { useState, useEffect, useRef } from 'react';
import { Mic, Activity, Zap, Scan, Power, Aperture, Radio, BarChart3, Languages, ChevronDown, RefreshCw } from 'lucide-react';

export default function AvianTranslator() {
  const [systemState, setSystemState] = useState('IDLE'); // IDLE, SCANNING, DECODING, ACTIVE
  const [currentLang, setCurrentLang] = useState('en'); 
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const [detectedResult, setDetectedResult] = useState(null); 
  
  // 音频数据状态
  const [audioData, setAudioData] = useState({ vol: 0, dominantFreq: 0 });
  const [errorMsg, setErrorMsg] = useState(null);
  
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const lastDetectionTime = useRef(0);
  
  const sampleRateRef = useRef(44100);

  // --- 多语言配置 ---
  const LANGUAGES = {
    en: { label: 'English', flag: '🇺🇸' },
    zh: { label: '中文', flag: '🇨🇳' },
    ja: { label: '日本語', flag: '🇯🇵' },
    fr: { label: 'Français', flag: '🇫🇷' },
    it: { label: 'Italiano', flag: '🇮🇹' },
    de: { label: 'Deutsch', flag: '🇩🇪' }
  };

  const UI_TEXT = {
    en: { title: "Bird DECODER", subtitle: "Bio-Acoustic Analysis System", init: "Initialize System", standby: "SYSTEM STANDBY", scanning: "SCANNING FREQUENCY...", decoding: "ANALYZING PATTERN...", match: "MATCH CONFIRMED", freq: "FREQ", gain: "GAIN", transmission: "DECODED TRANSMISSION", id: "ENTITY ID", time: "TIMESTAMP" },
    zh: { title: "鸟语解码器", subtitle: "生物声学分析系统", init: "启动系统", standby: "系统待机", scanning: "正在扫描频段...", decoding: "解析声纹特征...", match: "匹配确认", freq: "频率", gain: "增益", transmission: "解码信息", id: "实体编号", time: "时间戳" },
    ja: { title: "鳥語翻訳機", subtitle: "生体音響解析システム", init: "システム起動", standby: "スタンバイ", scanning: "周波数スキャン中...", decoding: "パターン分析中...", match: "一致確認", freq: "周波数", gain: "ゲイン", transmission: "解読された通信", id: "実体ID", time: "タイムスタンプ" },
    fr: { title: "DÉCODEUR AVIAIRE", subtitle: "Système d'Analyse Bio-Acoustique", init: "Initialiser", standby: "EN ATTENTE", scanning: "SCAN DE FRÉQUENCE...", decoding: "ANALYSE DU MOTIF...", match: "CORRESPONDANCE", freq: "FRÉQ", gain: "GAIN", transmission: "TRANSMISSION DÉCODÉE", id: "ID ENTITÉ", time: "HORODATAGE" },
    it: { title: "DECODIFICATORE AVIARE", subtitle: "Sistema di Analisi Bioacustica", init: "Inizializza", standby: "STANDBY", scanning: "SCANSIONE FREQUENZA...", decoding: "ANALISI PATTERN...", match: "CORRISPONDENZA", freq: "FREQ", gain: "GUADAGNO", transmission: "TRASMISSIONE DECODIFICATA", id: "ID ENTITÀ", time: "ORARIO" },
    de: { title: "VOGEL-DECODER", subtitle: "Bioakustisches Analysesystem", init: "Starten", standby: "BEREIT", scanning: "FREQUENZ-SCAN...", decoding: "MUSTERANALYSE...", match: "TREFFER BESTÄTIGT", freq: "FREQ", gain: "VERSTÄRKUNG", transmission: "DECODIERTE NACHRICHT", id: "ENTITÄTS-ID", time: "ZEITSTEMPEL" }
  };

  // --- 扩充后的鸟类数据库 (15种) ---
  const BIRD_DB = [
    // --- 低频区 (200Hz - 800Hz) ---
    { 
      id: 'pigeon', 
      icon: '🕊️', 
      color: '#a8a29e', 
      range: [200, 450], 
      names: { en: "Rock Dove (Pigeon)", zh: "原鸽 (鸽子)", ja: "カワラバト", fr: "Pigeon biset", it: "Piccione", de: "Felsentaube" },
      scientific: "Columba livia",
      messages: {
        en: ["Coo... looking for crumbs.", "Head bobbing check.", "Is that a statue?", "Flying home."],
        zh: ["咕咕...在找面包屑。", "点头确认安全。", "那是雕像吗？我想停在上面。", "准备飞回家。"],
        ja: ["クルックー...パン屑探し。", "首を振って確認。", "あれは銅像か？", "家に帰る。"],
        fr: ["Roucoule... cherche des miettes.", "Vérification de tête.", "C'est une statue ?", "Rentre à la maison."],
        it: ["Tubare... cerco briciole.", "Controllo testa.", "È una statua?", "Volo a casa."],
        de: ["Gurren... suche Krümel.", "Kopfnicken.", "Ist das eine Statue?", "Fliege nach Hause."]
      }
    },
    { 
      id: 'rooster', 
      icon: '🐓', 
      color: '#ef4444', 
      range: [450, 700], 
      names: { en: "Rooster", zh: "公鸡", ja: "雄鶏", fr: "Coq", it: "Gallo", de: "Hahn" },
      scientific: "Gallus gallus",
      messages: {
        en: ["Wake up! The sun is rising!", "This is my yard!", "Protecting the hens.", "Danger! Predator nearby!"],
        zh: ["起床啦！太阳晒屁股了！", "这院子归我管！", "别碰我的母鸡们。", "警戒！有捕食者！"],
        ja: ["起きろ！日が昇るぞ！", "ここは俺の庭だ！", "雌鶏たちを守るんだ。", "危険だ！捕食者がいる！"],
        fr: ["Réveillez-vous ! Le soleil se lève !", "C'est ma cour !", "Je protège les poules.", "Danger ! Prédateur proche !"],
        it: ["Sveglia! Il sole sta sorgendo!", "Questo è il mio cortile!", "Proteggo le galline.", "Pericolo! Predatore vicino!"],
        de: ["Aufwachen! Die Sonne geht auf!", "Das ist mein Hof!", "Ich beschütze die Hennen.", "Gefahr! Raubtier in der Nähe!"]
      }
    },
    { 
      id: 'goose', 
      icon: '🪿', 
      color: '#cbd5e1', 
      range: [300, 800], 
      names: { en: "Goose", zh: "鹅", ja: "ガチョウ", fr: "Oie", it: "Oca", de: "Gans" },
      scientific: "Anserini",
      messages: {
        en: ["HONK! Get away!", "This path is blocked.", "Protecting the flock.", "Hissing warning!"],
        zh: ["嘎！离远点！", "此路不通，绕行！", "保护我的队伍。", "嘶——（攻击警告）"],
        ja: ["ガァ！どけ！", "ここは通さない。", "群れを守る。", "シャーッ！（威嚇）"],
        fr: ["HONK ! Dégagez !", "Passage bloqué.", "Protection du troupeau.", "Sifflement d'avertissement !"],
        it: ["HONK! Via!", "Strada bloccata.", "Proteggo lo stormo.", "Sibilare!"],
        de: ["TRÖT! Weg da!", "Weg versperrt.", "Beschütze die Herde.", "Zisch-Warnung!"]
      }
    },
    { 
      id: 'duck', 
      icon: '🦆', 
      color: '#10b981', 
      range: [700, 1000], 
      names: { en: "Mallard Duck", zh: "绿头鸭", ja: "マガモ", fr: "Canard colvert", it: "Germano reale", de: "Stockente" },
      scientific: "Anas platyrhynchos",
      messages: {
        en: ["Quack! Water looks good.", "Staying in formation.", "Found some algae.", "Heading south."],
        zh: ["嘎嘎！水温不错。", "保持队形。", "发现一些藻类。", "准备向南飞。"],
        ja: ["ガーガー！水がいい感じ。", "隊列を維持して。", "藻を見つけた。", "南へ向かう。"],
        fr: ["Coin-coin ! L'eau est bonne.", "On reste en formation.", "J'ai trouvé des algues.", "Direction le sud."],
        it: ["Qua qua! L'acqua sembra buona.", "Restiamo in formazione.", "Trovato delle alghe.", "Direzione sud."],
        de: ["Quak! Das Wasser ist gut.", "In Formation bleiben.", "Algen gefunden.", "Richtung Süden."]
      }
    },
    // --- 中频区 (1000Hz - 2500Hz) ---
    { 
      id: 'crow', 
      icon: '🦅', 
      color: '#94a3b8', 
      range: [1000, 1400], 
      names: { en: "Carrion Crow", zh: "小嘴乌鸦", ja: "ハシボソガラス", fr: "Corneille noire", it: "Cornacchia nera", de: "Rabenkrähe" },
      scientific: "Corvus corone",
      messages: {
        en: ["This is my territory!", "Shiny object detected.", "Caw! Intruder alert!", "Calling all kin for backup."],
        zh: ["这是我的地盘！滚开！", "发现发光的东西了！", "哇！有入侵者！", "呼叫同伴支援！"],
        ja: ["ここは俺の縄張りだ！", "光るものを見つけた。", "カァ！侵入者だ！", "仲間を呼べ！"],
        fr: ["C'est mon territoire !", "Objet brillant détecté.", "Croa ! Intrus !", "Appel de renforts."],
        it: ["Questo è il mio territorio!", "Oggetto luccicante individuato.", "Cra! Intruso!", "Chiamo rinforzi."],
        de: ["Das ist mein Revier!", "Glänzendes Objekt gefunden.", "Krah! Eindringling!", "Rufe Verstärkung."]
      }
    },
    { 
      id: 'owl', 
      icon: '🦉', 
      color: '#a78bfa', 
      range: [1400, 1800], 
      names: { en: "Barn Owl", zh: "仓其鸮 (猫头鹰)", ja: "メンフクロウ", fr: "Effraie des clochers", it: "Barbagianni", de: "Schleiereule" },
      scientific: "Tyto alba",
      messages: {
        en: ["The mouse moved... I saw it.", "Silent flight engaged.", "Who cooks for you?", "Scanning the darkness."],
        zh: ["那只老鼠动了...我看见了。", "静音飞行模式开启。", "是谁在黑暗中？", "正在扫描暗处。"],
        ja: ["ネズミが動いた...見えたぞ。", "静音飛行開始。", "暗闇をスキャン中。", "誰だ？"],
        fr: ["La souris a bougé... Je l'ai vue.", "Vol silencieux engagé.", "Qui est là ?", "Scan de l'obscurité."],
        it: ["Il topo si è mosso...", "Volo silenzioso attivato.", "Chi c'è?", "Scansiono l'oscurità."],
        de: ["Die Maus hat sich bewegt...", "Lautloser Flug.", "Wer ist da?", "Scanne die Dunkelheit."]
      }
    },
    { 
      id: 'magpie', 
      icon: '🐧', 
      color: '#1e293b', 
      range: [1800, 2400],
      names: { en: "Magpie", zh: "喜鹊", ja: "カササギ", fr: "Pie bavarde", it: "Gazza", de: "Elster" },
      scientific: "Pica pica",
      messages: {
        en: ["Chattering good news!", "Stealing that shiny coin.", "Watch out for the cat!", "Building a fortress nest."],
        zh: ["喳喳喳！报喜啦！", "那个硬币归我了。", "小心那只猫！", "正在加固我的巢。"],
        ja: ["いい知らせだ！", "あの光るコインを盗むぞ。", "猫に気をつけろ！", "要塞のような巣を作る。",],
        fr: ["Bavardage de bonnes nouvelles !", "Je vole cette pièce brillante.", "Attention au chat !", "Construction d'un nid forteresse."],
        it: ["Gracchiando buone notizie!", "Rubo quella moneta luccicante.", "Attenti al gatto!", "Costruendo un nido fortezza."],
        de: ["Schnattern gute Nachrichten!", "Stehle diese glänzende Münze.", "Achtung vor der Katze!", "Baue ein Festungsnest."]
      }
    },
    { 
      id: 'eagle', 
      icon: '🦅', 
      color: '#ea580c', 
      range: [2400, 3000], 
      names: { en: "Golden Eagle", zh: "金雕", ja: "イヌワシ", fr: "Aigle royal", it: "Aquila reale", de: "Steinadler" },
      scientific: "Aquila chrysaetos",
      messages: {
        en: ["Thermal current located.", "Target locked: Rabbit.", "I rule these skies.", "Screeching warning!"],
        zh: ["发现热气流，准备爬升。", "锁定目标：野兔。", "这片天空归我管。", "发出警告尖啸！"],
        ja: ["上昇気流を確認。", "ターゲットロック：ウサギ。", "この空は私が支配する。", "警告の叫び！"],
        fr: ["Courant thermique localisé.", "Cible verrouillée : Lapin.", "Je règne sur ces cieux.", "Cri d'avertissement !"],
        it: ["Corrente termica individuata.", "Bersaglio bloccato: Coniglio.", "Domino questi cieli.", "Grido di avvertimento!"],
        de: ["Thermik gefunden.", "Ziel erfasst: Hase.", "Ich beherrsche diesen Himmel.", "Warnschrei!"]
      }
    },
    { 
      id: 'seagull', 
      icon: '🌊', 
      color: '#e0f2fe', 
      range: [2000, 3500],
      names: { en: "Seagull", zh: "海鸥", ja: "カモメ", fr: "Mouette", it: "Gabbiano", de: "Möwe" },
      scientific: "Laridae",
      messages: {
        en: ["Mine! Mine! Mine!", "Is that a french fry?", "Storm is coming.", "Gliding over the waves."],
        zh: ["我的！我的！全是我的！", "那是薯条吗？", "暴风雨要来了。", "在波浪上滑翔。"],
        ja: ["俺のだ！俺のだ！", "あれはフライドポテトか？", "嵐が来るぞ。", "波の上を滑空する。"],
        fr: ["À moi ! À moi !", "C'est une frite ?", "La tempête arrive.", "Planant sur les vagues."],
        it: ["Mio! Mio! Mio!", "È una patatina fritta?", "Arriva la tempesta.", "Planando sulle onde."],
        de: ["Meins! Meins! Meins!", "Ist das eine Pommes?", "Sturm kommt.", "Gleiten über den Wellen."]
      }
    },
    // --- 高频区 (3000Hz+) ---
    { 
      id: 'woodpecker', 
      icon: '🪵', 
      color: '#b91c1c', 
      range: [3000, 4000], 
      names: { en: "Woodpecker", zh: "啄木鸟", ja: "キツツキ", fr: "Pic", it: "Picchio", de: "Specht" },
      scientific: "Picidae",
      messages: {
        en: ["Drumming on the tree.", "Found a grub!", "This wood is hollow.", "Knock knock!"],
        zh: ["笃笃笃！敲击树干中。", "发现虫子了！", "这木头是空的。", "有人在家吗？"],
        ja: ["木をドラミング中。", "幼虫を見つけた！", "この木は空洞だ。", "コンコン！"],
        fr: ["Tambourinant sur l'arbre.", "Trouvé une larve !", "Ce bois est creux.", "Toc toc !"],
        it: ["Tamburellando sull'albero.", "Trovato una larva!", "Questo legno è vuoto.", "Toc toc!"],
        de: ["Trommeln am Baum.", "Larve gefunden!", "Dieses Holz ist hohl.", "Klopf klopf!"]
      }
    },
    { 
      id: 'parrot', 
      icon: '🦜', 
      color: '#4ade80', 
      range: [3500, 4500], 
      names: { en: "Macaw", zh: "金刚鹦鹉", ja: "コンゴウインコ", fr: "Ara", it: "Ara", de: "Ara" },
      scientific: "Ara macao",
      messages: {
        en: ["Hello! Hello!", "Give me a nut!", "Mimicking human sounds...", "Pretty bird!"],
        zh: ["你好！你好！", "给我坚果！", "模仿人类声音中...", "漂亮的小鸟！"],
        ja: ["こんにちは！", "ナッツをくれ！", "人間の声を真似中...", "可愛い鳥！"],
        fr: ["Bonjour ! Bonjour !", "Donne-moi une noix !", "Imitation de sons humains...", "Bel oiseau !"],
        it: ["Ciao! Ciao!", "Dammi una noce!", "Imito suoni umani...", "Bel uccello!"],
        de: ["Hallo! Hallo!", "Gib mir eine Nuss!", "Ahme menschliche Geräusche nach...", "Hübscher Vogel!"]
      }
    },
    { 
      id: 'cuckoo', 
      icon: '🕰️', 
      color: '#d1d5db', 
      range: [4000, 5000],
      names: { en: "Common Cuckoo", zh: "大杜鹃 (布谷鸟)", ja: "カッコウ", fr: "Coucou gris", it: "Cuculo", de: "Kuckuck" },
      scientific: "Cuculus canorus",
      messages: {
        en: ["Cuckoo! Cuckoo!", "Laying eggs in another nest.", "Spring is here.", "Calling for a mate."],
        zh: ["布谷！布谷！", "借个巢下个蛋。", "春天来了。", "呼唤伴侣中。"],
        ja: ["カッコウ！カッコウ！", "他の巣に卵を産む。", "春が来た。", "パートナーを呼んでいる。"],
        fr: ["Coucou ! Coucou !", "Je ponds dans un autre nid.", "Le printemps est là.", "Appel d'un partenaire."],
        it: ["Cucù! Cucù!", "Depongo uova in un altro nido.", "La primavera è qui.", "Chiamo un compagno."],
        de: ["Kuckuck! Kuckuck!", "Lege Eier in ein fremdes Nest.", "Der Frühling ist da.", "Rufe nach einem Partner."]
      }
    },
    { 
      id: 'sparrow', 
      icon: '🐦', 
      color: '#fcd34d', 
      range: [5000, 6500], 
      names: { en: "Eurasian Tree Sparrow", zh: "麻雀", ja: "スズメ", fr: "Moineau friquet", it: "Passera mattugia", de: "Feldsperling" },
      scientific: "Passer montanus",
      messages: {
        en: ["Danger from above! Hide!", "Found some bread crumbs here.", "Chirp chirp! Good morning!", "Gathering the flock!"],
        zh: ["小心头顶！有老鹰！", "这儿有面包屑，快来！", "叽叽喳喳！早上好！", "集合！大家都过来！"],
        ja: ["上空に注意！隠れろ！", "パン屑を見つけたよ。", "チュンチュン！おはよう！", "みんな集まれ！"],
        fr: ["Danger venant du ciel !", "J'ai trouvé des miettes ici.", "Cui-cui ! Bonjour !", "Rassemblement !"],
        it: ["Pericolo dall'alto!", "Ho trovato delle briciole.", "Cip cip! Buongiorno!", "Raduniamo il stormo!"],
        de: ["Gefahr von oben!", "Hier gibt es Krümel.", "Tschilp tschilp! Guten Morgen!", "Schwarm sammeln!"]
      }
    },
    { 
      id: 'swallow', 
      icon: '✂️', 
      color: '#3b82f6', 
      range: [6500, 7500],
      names: { en: "Barn Swallow", zh: "家燕", ja: "ツバメ", fr: "Hirondelle", it: "Rondine", de: "Rauchschwalbe" },
      scientific: "Hirundo rustica",
      messages: {
        en: ["Flying fast and low.", "Rain is coming.", "Catching insects mid-air.", "Building nest with mud."],
        zh: ["低空极速飞行。", "要下雨了。", "空中捕虫成功。", "正在衔泥筑巢。"],
        ja: ["低く速く飛ぶ。", "雨が降るぞ。", "空中で虫をキャッチ。", "泥で巣を作っている。"],
        fr: ["Vol rapide et bas.", "La pluie arrive.", "Insectes attrapés en vol.", "Construction du nid avec de la boue."],
        it: ["Volo veloce e basso.", "Arriva la pioggia.", "Catturo insetti in volo.", "Costruendo nido col fango."],
        de: ["Fliege schnell und tief.", "Regen kommt.", "Insekten im Flug fangen.", "Baue Nest aus Schlamm."]
      }
    },
    { 
      id: 'robin', 
      icon: '🎼', 
      color: '#fb7185', 
      range: [7500, 9000], 
      names: { en: "European Robin", zh: "欧亚鸲 (知更鸟)", ja: "コマドリ", fr: "Rouge-gorge", it: "Pettirosso", de: "Rotkehlchen" },
      scientific: "Erithacus rubecula",
      messages: {
        en: ["I am singing for love.", "Keep away from my bush.", "Winter is coming.", "Beautiful evening, isn't it?"],
        zh: ["我在为爱情歌唱。", "离我的灌木丛远点。", "冬天快到了。", "今晚夜色真美，不是吗？"],
        ja: ["愛のために歌っています。", "私の茂みに近づくな。", "冬が来ている。", "美しい夕暮れですね？"],
        fr: ["Je chante pour l'amour.", "Éloignez-vous de mon buisson.", "L'hiver arrive.", "Belle soirée, n'est-ce pas ?"],
        it: ["Canto per amore.", "Via dal mio cespuglio.", "L'inverno sta arrivando.", "Bella serata, vero?"],
        de: ["Ich singe für die Liebe.", "Weg von meinem Busch.", "Der Winter naht.", "Schöner Abend, nicht wahr?"]
      }
    }
  ];

  const getCurrentTranslation = () => {
    if (!detectedResult) return null;
    const bird = BIRD_DB.find(b => b.id === detectedResult.birdId);
    if (!bird) return null;

    const msgs = bird.messages[currentLang] || bird.messages['en'];
    const msg = msgs[detectedResult.messageIndex] || msgs[0];
    const name = bird.names[currentLang] || bird.names['en'];

    return { ...detectedResult, bird, msg, name };
  };

  const toggleSystem = async () => {
    if (systemState !== 'IDLE') {
      shutdownSystem();
    } else {
      startUpSystem();
    }
  };

  const startUpSystem = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
      });
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      sampleRateRef.current = audioContextRef.current.sampleRate; // 获取真实采样率

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048; // 频段分辨率
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      setSystemState('SCANNING');
      visualize();
    } catch (err) {
      console.error(err);
      setErrorMsg("MIC ERROR: Please allow microphone access.");
    }
  };

  const shutdownSystem = () => {
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setSystemState('IDLE');
    setDetectedResult(null);
    setAudioData({ vol: 0, dominantFreq: 0 });
  };

  // --- 核心算法优化：计算主频 (Dominant Frequency) ---
  const calculateDominantFrequency = (dataArray) => {
    let maxVal = -1;
    let maxIndex = -1;
    
    // 忽略超低频噪音 (< 100Hz)
    // 假设 sampleRate = 44100, fftSize = 2048
    // binSize = 44100/2048 ≈ 21.5 Hz
    // 100Hz ≈ index 5
    const startBin = 5; 

    for (let i = startBin; i < dataArray.length; i++) {
      if (dataArray[i] > maxVal) {
        maxVal = dataArray[i];
        maxIndex = i;
      }
    }

    if (maxVal < 50) return 0; // 噪音底噪过滤

    const binSize = sampleRateRef.current / analyserRef.current.fftSize;
    return maxIndex * binSize;
  };

  const processBioSignal = (vol, dataArray) => {
    const now = Date.now();
    
    // 1. 计算主频
    const dominantFreq = calculateDominantFrequency(dataArray);
    setAudioData({ vol, dominantFreq });

    // 2. 触发识别逻辑
    // 必须有足够的音量，且频率在合理的鸟叫范围内 (200Hz - 9000Hz)
    if (vol > 30 && dominantFreq > 200 && dominantFreq < 10000 && now - lastDetectionTime.current > 1000) {
      triggerDetection(dominantFreq);
      lastDetectionTime.current = now;
    }
  };

  const triggerDetection = (freq) => {
    setSystemState('DECODING');
    
    // 3. 算法升级：基于【中心频率距离】匹配鸟类，而非简单的范围过滤
    // 这样即使频率有偏差，也能匹配到最接近的鸟
    const candidates = BIRD_DB.map(bird => {
        const center = (bird.range[0] + bird.range[1]) / 2;
        const distance = Math.abs(freq - center);
        const inRange = freq >= bird.range[0] && freq <= bird.range[1];
        
        // 评分逻辑：距离越小越好。如果在范围内，给予巨大奖励（减少分数）
        // 如果不在范围内，分数 = 距离 + 惩罚值
        let score = distance + (inRange ? 0 : 2000); 
        
        return { bird, score };
    });

    // 按分数排序（越小越匹配）
    candidates.sort((a, b) => a.score - b.score);
    const bestMatch = candidates[0].bird;

    const msgCount = bestMatch.messages['en'].length;
    const msgIndex = Math.floor(Math.random() * msgCount);

    setTimeout(() => {
      setDetectedResult({
        birdId: bestMatch.id,
        messageIndex: msgIndex,
        timestamp: new Date().toLocaleTimeString(),
        confidence: (85 + Math.random() * 14).toFixed(1),
        detectedFreq: Math.round(freq)
      });
      setSystemState('ACTIVE');
    }, 800); // 略微加快显示速度
  };

  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for(let i=0; i<bufferLength; i++) sum += dataArray[i];
      const avgVol = sum / bufferLength;
      
      processBioSignal(avgVol, dataArray);

      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // --- 1. 声纹频谱 (Spectrogram) ---
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      const visualizerHeight = height * 0.6;
      const centerY = visualizerHeight / 2 + 50; 

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.5; 

        // 颜色映射：根据频率 (i) 和强度 (barHeight)
        // 低频: 青色/蓝色, 高频: 紫色/粉色
        const hue = 180 + (i / bufferLength) * 160; 
        const saturation = 50 + (dataArray[i] / 255) * 50;
        const lightness = 30 + (dataArray[i] / 255) * 40;

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight / 2);
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`; 
        ctx.fillRect(x, centerY, barWidth, barHeight / 2);

        x += barWidth + 1;
      }

      // --- 2. 波形线 (Waveform) ---
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      const sliceWidth = width * 1.0 / bufferLength;
      x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; 
        const y = centerY + (v - 1) * 120; // 增加振幅

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      // --- 3. 扫描线效果 ---
      if (systemState === 'SCANNING' || systemState === 'DECODING') {
         const scanLineY = (Date.now() / 8) % visualizerHeight;
         ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
         ctx.lineWidth = 1;
         ctx.beginPath();
         ctx.moveTo(0, scanLineY);
         ctx.lineTo(width, scanLineY);
         ctx.stroke();
      }
    };
    draw();
  };

  useEffect(() => {
    const handleResize = () => {
      if(canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    return () => shutdownSystem();
  }, []);

  const t = UI_TEXT[currentLang]; 
  const currentResult = getCurrentTranslation();

  return (
    <div className="relative min-h-screen bg-[#020617] text-white font-sans overflow-hidden select-none flex flex-col">
      
      {/* 1. 声波可视化区域 */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#020617] h-full"></div>
      </div>

      {/* 2. 顶部导航栏 (HUD) */}
      <div className="relative z-20 p-4 md:p-6 flex justify-between items-start bg-gradient-to-b from-[#020617]/80 to-transparent">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border backdrop-blur-md ${systemState !== 'IDLE' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
              <Activity className={`w-6 h-6 ${systemState === 'SCANNING' ? 'animate-pulse text-cyan-400' : 'text-slate-500'}`} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2 drop-shadow-md">
                {t.title}
              </h1>
              <p className="text-[10px] md:text-xs text-cyan-400/80 tracking-widest uppercase font-mono">
                {systemState === 'IDLE' ? t.standby : systemState === 'DECODING' ? t.decoding : t.scanning}
              </p>
            </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="hidden md:flex flex-col items-end text-[10px] text-cyan-600 font-mono gap-1">
             <div className="flex items-center gap-2">
               <span>{t.freq}:</span>
               <span className={`text-white ${audioData.dominantFreq > 0 ? 'animate-pulse' : ''}`}>
                 {audioData.dominantFreq > 0 ? `${Math.round(audioData.dominantFreq)} Hz` : '--'}
               </span>
             </div>
             <div>{t.gain}: <span className="text-white">{audioData.vol.toFixed(1)} dB</span></div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 backdrop-blur-md hover:bg-slate-800 border border-slate-700 rounded-lg text-sm transition-all shadow-lg"
            >
              <span className="text-lg">{LANGUAGES[currentLang].flag}</span>
              <span className="hidden md:inline font-medium">{LANGUAGES[currentLang].label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            
            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200">
                {Object.entries(LANGUAGES).map(([code, data]) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCurrentLang(code);
                      setShowLangMenu(false);
                    }}
                    className={`px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-cyan-500/20 transition-colors
                      ${currentLang === code ? 'text-cyan-400 bg-cyan-500/10 font-bold' : 'text-slate-300'}
                    `}
                  >
                    <span>{data.flag}</span>
                    {data.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]"></div>

      {/* 4. 底部翻译控制区 */}
      <div className="relative z-20 pb-8 px-4 flex justify-center">
        
        {systemState === 'IDLE' && (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-10 duration-500">
            <button 
              onClick={toggleSystem}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 hover:border-cyan-500 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_rgba(6,182,212,0.3)] hover:scale-110"
            >
              <Power className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
            <p className="mt-4 text-sm text-slate-500 tracking-widest font-mono">{t.init.toUpperCase()}</p>
          </div>
        )}

        {systemState !== 'IDLE' && (
          <div className="w-full max-w-2xl">
             <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 min-h-[200px] flex flex-col relative">
                
                <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 w-full"></div>

                {!currentResult ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
                     <div className="relative w-16 h-16">
                        <Scan className="w-full h-full text-cyan-500/50 animate-pulse" />
                        <div className="absolute inset-0 border-t-2 border-cyan-400 animate-spin rounded-full"></div>
                     </div>
                     <p className="text-cyan-400 font-mono tracking-widest animate-pulse text-sm">
                       {systemState === 'DECODING' ? t.decoding : t.scanning}
                     </p>
                     {/* 实时频率反馈 */}
                     <div className="text-[10px] text-slate-500 font-mono bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800">
                        {t.freq}: {audioData.dominantFreq > 0 ? Math.round(audioData.dominantFreq) : '--'} Hz
                     </div>
                  </div>
                ) : (
                  <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start animate-in slide-in-from-bottom-4 duration-300">
                     
                     <div className="flex flex-col items-center md:items-start min-w-[120px]">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-slate-700 flex items-center justify-center text-5xl shadow-inner mb-3 transform hover:scale-105 transition-transform">
                          {currentResult.bird.icon}
                        </div>
                        <h2 className="text-xl font-bold text-white leading-tight text-center md:text-left">
                          {currentResult.name}
                        </h2>
                        <p className="text-[10px] text-slate-400 italic font-mono mt-1">
                          {currentResult.bird.scientific}
                        </p>
                        <div className="mt-2 text-[10px] bg-cyan-950/50 text-cyan-400 px-2 py-1 rounded border border-cyan-900 flex flex-col gap-0.5">
                           <span>{t.match}: {currentResult.confidence}%</span>
                           <span className="text-slate-500">{currentResult.detectedFreq} Hz</span>
                        </div>
                     </div>

                     <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-2">
                           <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                           <span className="text-[10px] text-red-400 font-bold tracking-wider uppercase">
                             {t.transmission}
                           </span>
                        </div>
                        
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 md:p-6 relative group">
                           <span className="absolute top-2 left-2 text-4xl text-slate-700 font-serif leading-none">“</span>
                           <p className="relative z-10 text-lg md:text-2xl text-cyan-50 font-medium leading-relaxed text-center md:text-left">
                             {currentResult.msg}
                           </p>
                           <span className="absolute bottom-[-10px] right-4 text-4xl text-slate-700 font-serif leading-none rotate-180">“</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono mt-3 px-1">
                           <span>{t.id}: {currentResult.bird.id.toUpperCase()}-{Math.floor(Math.random()*1000)}</span>
                           <span>{t.time}: {currentResult.timestamp}</span>
                        </div>
                     </div>
                  </div>
                )}
             </div>

             <button 
               onClick={toggleSystem}
               className="absolute -top-4 -right-4 bg-slate-800 text-slate-400 p-2 rounded-full border border-slate-700 hover:bg-red-900/80 hover:text-red-200 hover:border-red-500 transition-colors shadow-lg"
               title="Stop System"
             >
               <Power className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>

      {/* Copyright Footer */}
      <div className="absolute bottom-1 w-full text-center text-[10px] text-slate-600 font-mono z-10 pointer-events-none opacity-50">
        © Yang Su, École Normale Supérieure - PSL
      </div>

    </div>
  );
}
