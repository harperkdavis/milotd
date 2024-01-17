const input = { keys: {}, mouse: {} }
const game = {
    over: false,
    win: false,

    money: 1000,
    speed: 1,
    xp: 0,
    level: 1,
    wave: 0,
    resources: new Array(8).fill(0),
    board: [],
    prevEntities: [],
    entities: [],
    networks: [],
    path: [],
    tick: 0,
    acc: 0,

    moneyMultiplier: 1,
    resourceMultiplier: 1,

    minigames: {
        stocks: {
            current: new Array(3).fill(100),
            history: new Array(3).fill([]).map(() => new Array(100).fill(100)),
            bought: new Array(3).fill(0),
            bias: new Array(3).fill(0),
            news: new Array(4).fill(''),
        },
        blackjack: {
            deck: [],
            dealer: [],
            hands: [],
            willShuffle: false,
            message: '',
            playing: false,
            bet: 100,
        },
    },
    currentMinigame: 'stocks',

    running: false,
    waveTick: 0,
    toSpawn: [],

    zones: [],
    numbers: [],

    moneyHistory: [1000],

    placing: null,
    selling: false,
};

const enemies = [
    { // 0
        image: '0.png',
        health: 10,
        speed: 0.5,
        value: 5,
        spawns: [],
    },
    { // 1
        image: 'adam-0.png',
        health: 20,
        speed: 0.75,
        value: 20,
        spawns: [],
    },
    { // 2
        image: '1.png',
        health: 50,
        speed: 0.5,
        value: 100,
        spawns: [0, 0],
    },
    { // 3
        image: 'nathan-0.png',
        health: 200,
        speed: 0.25,
        value: 500,
        spawns: [0, 0, 0, 0],
    },
    { // 4
        image: '2.png',
        health: 250,
        speed: 0.5,
        value: 200,
        spawns: [2, 2, 2, 2],
    },
    { // 5
        image: 'adam-1.png',
        health: 200,
        speed: 1,
        value: 400,
        spawns: [1, 1],
    },
    { // 6
        image: 'nathan-1.png', // Boss 1
        health: 2000,
        speed: 0.1,
        value: 10000,
        spawns: [0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3],
    },
    { // 7
        image: '3.png',
        health: 500,
        speed: 0.5,
        value: 1000,
        spawns: [4, 4, 4, 4],
    },
    { // 8
        image: 'adam-2.png',
        health: 500,
        speed: 1,
        value: 2000,
        spawns: [2, 2, 2, 2],
    },
    { // 9
        image: 'nathan-2.png', // Boss 2
        health: 20000,
        speed: 0.1,
        value: 20000,
        spawns: [4, 4, 4, 4, 4, 4, 4, 4, 6, 6],
    },
    { // 10
        image: 'nathan-3.png', // Boss 3
        health: 200000,
        speed: 0.1,
        value: 40000,
        spawns: [7, 7, 7, 7, 7, 7, 7, 7, 9, 9],
    },
    { // 11
        image: 'nathan-4.png', // Boss 4
        health: 2000000,
        speed: 0.1,
        value: 100000,
        spawns: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // because why not
    },
    { // 12
        image: '4.png',
        health: 2000,
        speed: 0.5,
        value: 4000,
        spawns: [8, 8, 3, 3],
    },
    { // 13
        image: '5.png',
        health: 4000,
        speed: 0.5,
        value: 10000,
        spawns: [12, 12, 12, 12],
    }
];

const sounds = {
    end: 'boom.mp3'
}

function upgradeDefaults(count) {
    return new Array(count).fill(0);
}

const towers = [
    {
        name: 'Harvester',
        type: 'automation',
        cost: 100,
        resourceCost: [0, 0, 0, 0, 0, 0, 0, 0],
        costScale: 1.5,
        resourceCostScale: 0,
        placeRules: [
            { type: 'resource', relative: [0, 1] }
        ],
        upgrades: [
            {
                name: 'harvest rate',
                levels: 7,
                cost: 400,
                costScale: 3.2,
                resourceCost: [0, 0.4, 1, 0, 0.1, 0, 0, 0],
                resourceCostScale: 2.4,
            },
        ],
        power: { draw: 0, gen: 0 },
        default: { xp: 0, dir: 0, upgrades: upgradeDefaults(1) },
    },
    {
        name: 'Belt',
        type: 'automation',
        cost: 10,
        resourceCost: [0, 0, 0, 0, 0, 0, 0, 0],
        costScale: 1.05,
        resourceCostScale: 0,
        below: true,
        power: { draw: 0, gen: 0 },
        default: { xp: 0, dir: 0 },
        multiplace: true,
    },
    {
        name: 'Generator',
        type: 'automation',
        cost: 200,
        resourceCost: [0, 1, 2, 0, 0, 0, 0, 0],
        costScale: 2.0,
        resourceCostScale: 1.5,
        upgrades: [
            {
                name: 'power output',
                levels: 5,
                cost: 1000,
                costScale: 3.1,
                resourceCost: [0, 1.2, 1, 0, 0.3, 0, 0, 0],
                resourceCostScale: 2.5,
            },
            {
                name: 'fuel capacity',
                levels: 5,
                cost: 100,
                costScale: 1.8,
                resourceCost: [0, 0.9, 1, 0, 0.1, 0, 0, 0],
                resourceCostScale: 1.9,
            },
            {
                name: 'fuel efficiency',
                levels: 5,
                cost: 400,
                costScale: 2.1,
                resourceCost: [0, 1.1, 1, 0, 0.15, 0, 0, 0],
                resourceCostScale: 2.3,
            }
        ],
        power: { draw: 0, gen: 20 },
        range: { radius: 2, color: [127, 63, 0] },
        default: { xp: 0, fuel: 100, upgrades: upgradeDefaults(3) },
    },
    {
        name: 'Power Pole',
        type: 'automation',
        cost: 50,
        resourceCost: [0, 1, 0, 0, 0, 0, 0, 0],
        costScale: 1.7,
        resourceCostScale: 1.5,
        power: { draw: 0, gen: 0 },
        range: { radius: 5, color: [127, 63, 0] },
        default: { xp: 0 },
    },
    {
        name: 'Tunnel',
        type: 'automation',
        cost: 100,
        resourceCost: [0, 0, 1, 0, 0, 0, 0, 0],
        costScale: 1.2,
        resourceCostScale: 0,
        power: { draw: 0, gen: 0 },
        default: { xp: 0, dir: 0 },
    },
    {
        name: 'Splitter',
        type: 'automation',
        cost: 100,
        resourceCost: [0, 0, 1, 0, 0, 0, 0, 0],
        costScale: 1.2,
        resourceCostScale: 1.2,
        below: true,
        power: { draw: 0, gen: 0 },
        default: { xp: 0, dir: 0, parity: 0 },
    },
    {
        name: 'Factory',
        type: 'automation',
        cost: 2000,
        resourceCost: [0, 1, 1, 0, 0, 0, 0, 0],
        costScale: 1.5,
        resourceCostScale: 1.5,
        power: { draw: 5, gen: 0 },
        default: { xp: 0, dir: 0, inside: [], wait: -1 },
    },
    {
        name: 'Combiner',
        type: 'automation',
        cost: 8000,
        resourceCost: [0, 10.4, 10, 0, 0, 0, 0, 0],
        costScale: 1.4,
        resourceCostScale: 2.4,
        power: { draw: 10, gen: 0 },
        default: { xp: 0, dir: 0, inside: [], wait: -1 },
    },
    {
        name: 'Zapper',
        type: 'defense',
        cost: 100,
        resourceCost: [1, 0.5, 0, 0, 0, 0, 0, 0],
        costScale: 1.3,
        resourceCostScale: 1.4,
        upgrades: [
            {
                name: 'damage',
                levels: 10,
                cost: 100,
                costScale: 1.6,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 1.7,
            },
            {
                name: 'range',
                levels: 3,
                cost: 300,
                costScale: 5.7,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 4.7,
            },
            {
                name: 'fire rate',
                levels: 3,
                cost: 400,
                costScale: 7.3,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 4.5,
            },
        ],
        power: { draw: 1, gen: 0 },
        range: { radius: 3, color: [255, 0, 0] },
        defense: { damage: 10, range: 3, rate: 4 },
        default: { xp: 0, upgrades: upgradeDefaults(3) },
    },
    {
        name: 'Magnet',
        type: 'defense',
        cost: 400,
        resourceCost: [1, 0.2, 0.4, 0, 0, 0, 0, 0],
        costScale: 1.2,
        resourceCostScale: 1.2,
        upgrades: [
            {
                name: 'range',
                levels: 3,
                cost: 600,
                costScale: 7.7,
                resourceCost: [1, 0.4, 0, 0, 0, 0.3, 0, 0],
                resourceCostScale: 8.7,
            },
            {
                name: 'slow',
                levels: 3,
                cost: 400,
                costScale: 7,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 6.4,
            },
            {
                name: 'pulse width',
                levels: 4,
                cost: 300,
                costScale:  6.3,
                resourceCost: [1, 0.2, 0, 0, 0, 0.4, 0, 0],
                resourceCostScale: 3.7,
            }
        ],
        power: { draw: 3, gen: 0 },
        range: { radius: 3, color: [0, 0, 255] },
        defense: { range: 3, slow: 0.5 },
        default: { xp: 0, upgrades: upgradeDefaults(3) },
    },
    {
        name: 'Turret',
        type: 'defense',
        cost: 4000,
        resourceCost: [1.4, 1, 0, 0, 0, 0, 0, 0],
        costScale: 1.1,
        resourceCostScale: 1.2,
        upgrades: [
            {
                name: 'damage',
                levels: 10,
                cost: 200,
                costScale: 1.6,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 1.7,
            },
            {
                name: 'range',
                levels: 5,
                cost: 600,
                costScale: 5.7,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 4.7,
            },
            {
                name: 'fire rate',
                levels: 3,
                cost: 1000,
                costScale: 7.8,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 4.9,
            },
        ],
        power: { draw: 2, gen: 0 },
        range: { radius: 4, color: [255, 0, 0] },
        defense: { damage: 20, range: 4, rate: 4 },
        default: { xp: 0, upgrades: upgradeDefaults(3), ammo: [0, 0, 0, 0, 0, 0, 0, 0] },
    },
    {
        name: 'Field',
        type: 'defense',
        cost: 2000,
        resourceCost: [1.4, 0, 1, 0, 0, 0, 0, 0],
        costScale: 1.3,
        resourceCostScale: 1.4,
        upgrades: [
            {
                name: 'range',
                levels: 5,
                cost: 300,
                costScale: 2.6,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 4.7,
            },
            {
                name: 'power',
                levels: 10,
                cost: 400,
                costScale: 1.9,
                resourceCost: [1, 0.4, 0, 0, 0, 0.2, 0, 0],
                resourceCostScale: 2.7,
            }
        ],
        range: { radius: 2, color: [0, 255, 0] },
        power: { draw: 8, gen: 0 },
        defense: { damage: 0, range: 2, rate: 0 },
        default: { xp: 0, inside: [], wait: -1, upgrades: upgradeDefaults(2) },
    },
    {
        name: 'Mint',
        type: 'special',
        cost: 1000,
        resourceCost: [0, 0, 1, 0.02, 0, 0, 0, 0],
        costScale: 1.4,
        resourceCostScale: 1.7,
        upgrades: [
            {
                name: 'money',
                levels: 10,
                cost: 1000,
                costScale: 1.9,
                resourceCost: [1, 0.4, 0, 0.1, 0, 0, 0, 0],
                resourceCostScale: 1.7,
            }
        ],
        power: { draw: 2, gen: 0 },
        default: { xp: 0, upgrades: upgradeDefaults(1) },
    },
    {
        name: 'Research',
        type: 'special',
        cost: 10000,
        resourceCost: [0, 0, 0, 3, 3, 3, 0, 0],
        costScale: 4    ,
        resourceCostScale: 10,
        upgrades: [
            {
                name: 'xp output',
                levels: 10,
                cost: 100,
                costScale: 1.9,
                resourceCost: [0, 0, 0, 3, 3, 3, 0, 0],
                resourceCostScale: 1.7,
            },
            {
                name: 'resources',
                levels: 10,
                cost: 40000,
                costScale: 1.9,
                resourceCost: [0, 0, 0, 10, 10, 10, 0, 0],
                resourceCostScale: 1.5,
            },
            {
                name: 'global money',
                levels: 10,
                cost: 100,
                costScale: 1.9,
                resourceCost: [0, 0, 0, 3, 3, 3, 0, 0],
                resourceCostScale: 1.7,
            }
        ],
        power: { draw: 20, gen: 0 },
        default: { xp: 0, upgrades: upgradeDefaults(3) },
    },
    {
        name: 'Magic',
        type: 'defense',
        cost: 100_000,
        resourceCost: [0, 0, 0, 0, 0, 0, 10, 0.3],
        costScale: 1.7,
        resourceCostScale: 2.4,
        upgrades: [
            {
                name: 'damage',
                levels: 10,
                cost: 10000,
                costScale: 1.9,
                resourceCost: [0, 0, 0, 0, 0, 0, 10, 0.4],
                resourceCostScale: 1.7,
            },
            {
                name: 'range',
                levels: 3,
                cost: 20000,
                costScale: 2.6,
                resourceCost: [0, 0, 0, 0, 0, 0, 10, 0.4],
                resourceCostScale: 4.7,
            },
            {
                name: 'poison',
                levels: 5,
                cost: 40000,
                costScale: 2.4,
                resourceCost: [0, 0, 0, 0, 0, 0, 10, 0.45],
                resourceCostScale: 2.6,
            }
        ],
        range: { radius: 6, color: [0, 0, 0] },
        defense: { damage: 10, range: 6, rate: 1 },
        power: { draw: 5, gen: 0 },
        default: { xp: 0, upgrades: upgradeDefaults(3) },
    },
    {
        name: 'End',
        type: 'special',
        cost: 1_000_000_000,
        resourceCost: [0, 0, 0, 0, 0, 0, 1000, 1000],
        costScale: 0,
        resourceCostScale: 0,
        power: { draw: 0, gen: 0 },
        default: { xp: 0 },
    },

]

let colors = [];

const anim = {
    money: 0,
    damage: 0,
    range: 0,
    selling: 0,
    running: 0,
    xp: 0,
    zaps: [],
    end: 0,
    over: 0,
}

const TICK_RATE = 2;
const CELL_SIZE = 24;
const BOARD_WIDTH = 32;
const BOARD_HEIGHT = 24;
const TUNNEL_LENGTH = 4;

const SELL_RATE = 1.0;

let BASE_X = 28;
let BASE_Y = 20;

const ENEMY_X = 0;
const ENEMY_Y = 6;

let loseImage, winImage;

function preload() {
    for (let i = 0; i < enemies.length; i += 1) {
        enemies[i].image = loadImage(`./enemies/${enemies[i].image}`);
    }
    for (const name in sounds) {
        sounds[name] = loadSound(`./assets/${sounds[name]}`);
    }
    loseImage = loadImage('./assets/lose.jpg');
    winImage = loadImage('./assets/win.jpg');
}

function setup() {
    createCanvas(1100, 640);
    textFont('monospace');
    reset();

    colors = [
        color(255, 0, 0),
        color(255, 255, 0),
        color(0, 0, 255),
        color(0, 255, 0),
        color(0, 255, 255),
        color(255, 0, 255),
        color(0, 0, 0),
        color(255, 255, 255),
    ];

    let x = 0;
    let y = 6;
    for (let i = 0; i < 10; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 1, 0);
        game.path.push({ x, y });
        x += 1;
    }
    for (let i = 0; i < 5; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 0, 1);
        game.path.push({ x, y });
        y += 1;
    }
    for (let i = 0; i < 5; i += 1) {
        game.board[index(x, y)] = makePath(x, y, -1, 0);
        game.path.push({ x, y });
        x -= 1;
    }
    for (let i = 0; i < 5; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 0, 1);
        game.path.push({ x, y });
        y += 1;
    }
    for (let i = 0; i < 9; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 1, 0);
        game.path.push({ x, y });
        x += 1;
    }
    for (let i = 0; i < 12; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 0, -1);
        game.path.push({ x, y });
        y -= 1;
    }
    for (let i = 0; i < 12; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 1, 0);
        game.path.push({ x, y });
        x += 1;
    }
    for (let i = 0; i < 10; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 0, 1);
        game.path.push({ x, y });
        y += 1;
    }
    for (let i = 0; i < 4; i += 1) {
        game.board[index(x, y)] = makePath(x, y, -1, 0);
        game.path.push({ x, y });
        x -= 1;
    }
    for (let i = 0; i < 6; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 0, -1);
        game.path.push({ x, y });
        y -= 1;
    }
    for (let i = 0; i < 4; i += 1) {
        game.board[index(x, y)] = makePath(x, y, -1, 0);
        game.path.push({ x, y });
        x -= 1;
    }
    for (let i = 0; i < 10; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 0, 1);
        game.path.push({ x, y });
        y += 1;
    }
    for (let i = 0; i < 8; i += 1) {
        game.board[index(x, y)] = makePath(x, y, 1, 0);
        game.path.push({ x, y });
        x += 1;
    }

    BASE_X = x;
    BASE_Y = y;

    noiseSeed(0xcabba6e);
    for (let i = 0; i < 8; i += 1) {
        const { x: redX, y: redY } = randomOpen();
        game.board[index(redX, redY)] = makeResource(redX, redY, 0);
        const { x: blueX, y: blueY } = randomOpen();
        game.board[index(blueX, blueY)] = makeResource(blueX, blueY, 1);
        const { x: yellowX, y: yellowY } = randomOpen();
        game.board[index(yellowX, yellowY)] = makeResource(yellowX, yellowY, 2);
    }

    generateStocks();
    generateBlackjack();
}

const corps = [ 'CHNC', 'DVNI', 'MILO' ];
const fullCorps = ['chenmeister concrete', 'devon incorporated', 'milling industrial logistics'];
const generalNews = {
    '++': [
        'the market is booming!',
        'stocks are way up today!',
        'the economy is doing great!',
        'invest now!'
    ],
    '+': [
        'the market is up today!',
        'stocks are up today!',
        'the economy is doing well!',
        'consider investing!'
    ],
    '~': [
        'the market is stable today.',
        'stocks aren\'t moving much today.',
        'the economy is doing fine.',
        'no major changes today.'
    ],
    '-': [
        'the market is down today.',
        'stocks are down today.',
        'the economy is doing poorly.',
        'consider your options carefully.',
    ],
    '--': [
        'the market is crashing!',
        'stocks are way down today!',
        'the economy is doing terribly!',
        'sell now!'
    ]
}
const specificNews = {
    '++': [
        '%c creates cancer cure!',
        '%c solves world hunger!',
        '%c launches revolutionary new product!',
        '%c announces record profits!',
        '%c acquires successful subsidiary!',
        '%c develops exciting new product line!',
        '%c announces new partnership!',
    ],
    '+': [
        '%c is up today.',
        '%c announces new product.',
        '%c has a good quarter.',
        '%c\'s profits are increasing.',
        '%c opens new factory.',
        '%c is expanding.',
    ],
    '~': [
        '%c is stable today.',
        '%c is doing fine.',
        '%c is holding steady.',
        '%c ceo reports "things are looking alright".',
        '%c opens new office.',
    ],
    '-': [
        '%c is down today.',
        '%c announces layoffs.',
        '%c is struggling.',
        '%c is having a bad quarter.',
        '%c reports losses.',
        '%c is closing factories.',
    ],
    '--': [
        '%c is crashing!',
        '%c is going bankrupt!',
        '%c is in freefall!',
        '%c reports worst quarter yet!',
        '%c murdered my whole family!',
        '%c announces mass layoffs!',
    ]
}

function categorizeBias(bias) {
    if (bias > 0.5) {
        return '++';
    } else if (bias > 0.1) {
        return '+';
    } else if (bias > -0.1) {
        return '~';
    } else if (bias > -0.5) {
        return '-';
    } else {
        return '--';
    }
}

function randomNews(type, bias) {
    const category = categorizeBias(bias);
    return type[category][floor(random(generalNews[category].length))];
}

function buyStock(id, count) {
    const cost = round(game.minigames.stocks.current[id] * count);
    if (game.money >= cost) {
        game.money -= cost;
        game.minigames.stocks.bought[id] += count;
    }
}

function sellStock(id, count) {
    const cost = round(game.minigames.stocks.current[id] * count);
    if (game.minigames.stocks.bought[id] >= count) {
        game.money += cost;
        game.minigames.stocks.bought[id] -= count;
    }
}
    

function generateStocks() {
    game.minigames.stocks.bias = game.minigames.stocks.bias.map(() => random(-1, 1) ** 3);
    const averageBias = game.minigames.stocks.bias.reduce((a, b) => a + b, 0) / game.minigames.stocks.bias.length;
    game.minigames.stocks.news = [
        randomNews(generalNews, averageBias),
        ... game.minigames.stocks.bias.map(b => randomNews(specificNews, b).replace('%c', fullCorps[game.minigames.stocks.bias.indexOf(b)])),
    ];
}

const deck = [
    'As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Xs', 'Js', 'Qs', 'Ks',
    'Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Xh', 'Jh', 'Qh', 'Kh',
    'Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Xd', 'Jd', 'Qd', 'Kd',
    'Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Xc', 'Jc', 'Qc', 'Kc',
];

function shuffle(array) {
    const shuffled = [];
    while (array.length > 0) {
        const index = floor(random(array.length));
        shuffled.push(array[index]);
        array.splice(index, 1);
    }
    return shuffled;
}

function newDeck() {
    return shuffle(new Array(6).fill([]).map(() => [...deck]).flat().concat('SHUFFLE'));
}

function generateBlackjack() {
    game.minigames.blackjack.deck = newDeck();
    game.minigames.blackjack.dealer = [];
    game.minigames.blackjack.hands = [];
}

function drawCard() {
    const card = game.minigames.blackjack.deck.pop();
    if (card === 'SHUFFLE') {
        game.minigames.blackjack.willShuffle = true;
        game.minigames.blackjack.message = 'will shuffle';
        return drawCard();
    }
    if (!card) {
        game.minigames.blackjack.deck = newDeck();
        game.minigames.blackjack.willShuffle = false;
        return drawCard();
    }
    return card;
}

const TEN_CARDS = ['X', 'J', 'Q', 'K'];
function isBlackjack(hand) {
    return hand.length === 2 && (TEN_CARDS.includes(hand[0][0]) && hand[1][0] === 'A') || (TEN_CARDS.includes(hand[1][0]) && hand[0][0] === 'A');
}

const BLACKJACK_STATE = {
    playing: 0,
    stand: 1,
    double: 2,
    lost: 3,
}

function emptyHand() {
    return { state: 0, message: '', cards: [] };   
}

function newBlackjack() {
    if (game.money < game.minigames.blackjack.bet) {
        return;
    }
    if (game.minigames.blackjack.willShuffle) {
        game.minigames.blackjack.deck = newDeck();
        game.minigames.blackjack.willShuffle = false;
    }
    game.minigames.blackjack.playing = true;
    game.money -= game.minigames.blackjack.bet;
    game.minigames.blackjack.dealer = [];
    game.minigames.blackjack.hands = [emptyHand()];
    
    game.minigames.blackjack.hands[0].cards.push(drawCard());
    game.minigames.blackjack.dealer.push(drawCard());
    game.minigames.blackjack.hands[0].cards.push(drawCard());
    game.minigames.blackjack.dealer.push(drawCard());

    handValueMessage(game.minigames.blackjack.hands[0]);

    game.minigames.blackjack.message = '';

    if (isBlackjack(game.minigames.blackjack.hands[0].cards)) {
        game.minigames.blackjack.message = 'blackjack!';
        game.minigames.blackjack.hands[0].state = 1;
        game.money += game.minigames.blackjack.bet * 2.5;
        game.minigames.blackjack.playing = false;
    }

    if (isBlackjack(game.minigames.blackjack.dealer)) {
        game.minigames.blackjack.message = 'dealer blackjack!';
        game.minigames.blackjack.hands[0].state = 3;
        game.minigames.blackjack.playing = false;
    }
    
}

function handValues(hand) {
    let value = 0;
    let aces = 0;
    for (let card of hand) {
        if (card[0] === 'A') {
            aces += 1;
        } else if (TEN_CARDS.includes(card[0])) {
            value += 10;
        } else {
            value += parseInt(card[0]);
        }
    }
    const possibleValues = [value + aces, ...new Array(aces).fill(0).map((_, i) => value + aces + (i + 1) * 10)].filter(v => v <= 21);
    return possibleValues;
}

function cardValue(card) {
    if (card[0] === 'A') {
        return 11;
    } else if (TEN_CARDS.includes(card[0])) {
        return 10;
    } else {
        return parseInt(card[0]);
    }
}

function handValueMessage(hand) {
    const values = handValues(hand.cards);
    hand.message = 'hand value: ' + values.join(', ');
}

function turnOptions(hand) {
    if (hand.state === 0) {
        if (hand.cards.length === 2 && cardValue(hand.cards[0]) === cardValue(hand.cards[1]) && game.money >= game.minigames.blackjack.bet) {
            return ['h', 's', 'dd', 'sp'];
        } else if (hand.cards.length === 2 && game.money >= game.minigames.blackjack.bet) {
            return ['h', 's', 'dd'];
        } else {
            return ['h', 's'];
        }
    }
    return [];
}

function makeBlackjackMove(move, index) {
    const hand = game.minigames.blackjack.hands[index];
    if (move === 'h') {
        hand.cards.push(drawCard());
        const values = handValues(hand.cards);
        if (values.length === 0) {
            hand.message = 'bust!';
            hand.state = 3;
        } else if (values.includes(21)) {
            hand.message = '21!';
            hand.state = 1;
        } else {
            hand.message = 'hand value: ' + values.join(', ');
        }
    } else if (move === 's' || move === 'dd') {
        hand.state = move === 'dd' ? 2 : 1;
        if (move === 'dd') {
            hand.cards.push(drawCard());
            if (handValues(hand.cards).length === 0) {
                hand.message = 'bust!';
                hand.state = 3;
            }
        }
    } else if (move === 'sp') {
        const firstCard = hand.cards.pop();
        const secondCard = hand.cards.pop();
        game.minigames.blackjack.hands.push({... emptyHand(), cards: [firstCard, drawCard()]});
        game.minigames.blackjack.hands.push({... emptyHand(), cards: [secondCard, drawCard()]});
        handValueMessage(game.minigames.blackjack.hands[game.minigames.blackjack.hands.length - 1]);
        handValueMessage(game.minigames.blackjack.hands[game.minigames.blackjack.hands.length - 2]);
        game.minigames.blackjack.hands.splice(index, 1);
    }

    console.log(game.minigames.blackjack.hands.map(h => h.state));
    if (game.minigames.blackjack.hands.every(hand => hand.state !== 0)) {
        game.minigames.blackjack.playing = false;
        // dealer plays
        // dealer hits on soft 17
        while (handValues(game.minigames.blackjack.dealer).some(v => v < 17)) {
            game.minigames.blackjack.dealer.push(drawCard());
        }
        let dealerBust = false;
        if (handValues(game.minigames.blackjack.dealer).length === 0) {
            game.minigames.blackjack.message = 'dealer bust!';
            game.minigames.blackjack.playing = false;
            dealerBust = true;
        }

        for (const hand of game.minigames.blackjack.hands) {
            if (hand.state === 3) {
                continue;
            }
            const factor = hand.state;
            const playerValues = handValues(hand.cards);
            const dealerValues = handValues(game.minigames.blackjack.dealer);
            const playerValue = max(...playerValues);
            const dealerValue = max(...dealerValues);
            if (dealerBust || playerValue > dealerValue) {
                hand.message = 'you win!';
                game.money += game.minigames.blackjack.bet * (factor + 1);
            } else if (playerValue < dealerValue) {
                hand.message = 'you lose!';
                if (hand.state === 2) {
                    game.money -= game.minigames.blackjack.bet;
                }
            } else {
                hand.message = 'push!';
                game.money += game.minigames.blackjack.bet;
            }
        }
    }

}

function avaliable(x, y) {
    return (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) 
        && !game.board[index(x, y)] 
        && ((x < BASE_X - 1 || x > BASE_X + 1) || (y < BASE_Y - 1 || y > BASE_Y + 1));
}


function randomOpen() {
    let randomX = floor(random(BOARD_WIDTH));
    let randomY = floor(random(BOARD_HEIGHT));
    const adjacent = [ [0, 1], [1, 0], [0, -1], [-1, 0] ];
    while (!avaliable(randomX, randomY) 
        || !isWithin(randomX, randomY, 2, 2, BOARD_WIDTH - 3, BOARD_HEIGHT - 3)
        || !((randomX < BASE_X - 3 || randomX > BASE_X + 3) || (randomY < BASE_Y - 3 || randomY > BASE_Y + 3)) 
        || adjacent.some(([ dx, dy ]) => !avaliable(randomX + dx, randomY + dy))
    ) {
        randomX = floor(random(BOARD_WIDTH));
        randomY = floor(random(BOARD_HEIGHT));
    }
    return { x: randomX, y: randomY };
}

function reset() {
    game.resources = new Array(8).fill(0);
    game.resources[0] = 10;
    game.resources[1] = 10;
    game.resources[2] = 10;
    game.board = new Array(BOARD_HEIGHT * BOARD_WIDTH).fill(null);
}

function requiredXp(level) {
    return level * level * 10;
}

function levelUpReward(level) {
    return 100 * pow(2, level);
}

function keyPressed() {
    input.keys[keyCode] = 0;
}

function keyReleased() {
    input.keys[keyCode] = -1;
}

function mousePressed() {
    input.mouse[mouseButton] = 0;
}

function mouseReleased() {
    input.mouse[mouseButton] = -1;
}

function updateInput() {
    for (let key in input.keys) {
        if (input.keys[key] >= 0) {
            input.keys[key] += 1;
        }
    }
    for (let button in input.mouse) {
        if (input.mouse[button] >= 0) {
            input.mouse[button] += 1;
        }
    }
}

function towerCount(id) {
    return game.board.filter(e => e && e.type === 'tower' && e.id === id).length;
}

function towerRange(id, data = {}) {
    const tower = towers[id];
    if (tower.type === 'automation') {
        return towers[id].range ? towers[id].range.radius : 0;
    } else if (tower.type === 'defense') {
        if (towers[id].upgrades) {
            const rangeUpgradeIndex = towers[id].upgrades.findIndex(u => u.name === 'range');
            return tower.defense.range + (rangeUpgradeIndex >= 0 ? data.upgrades[rangeUpgradeIndex] : 0);
        } else {
            return tower.defense.range;
        }
    }
    return 0;
}

function enemyDamage(wave) {
    return round(exp(wave / 4) * 10);
}

function canAfford(id) {
    const { cost, resourceCost } = calcPrices(id, towerCount(id));
    return game.money >= cost && game.resources.every((r, i) => r >= resourceCost[i]);
}

function selectTower(id) {
    if (canAfford(id)) {
        game.placing = makeTower(0, 0, id);
    }
}

function validPlace(x, y, id, data = {}) {
    const tower = towers[id];
    return avaliable(x, y) && canAfford(id) && (!tower.placeRules || tower.placeRules.every(rule => {
        const [ dx, dy ] = rotateRelative(... rule.relative, data.dir || 0);
        const cell = game.board[index(x + dx, y + dy)];
        return cell && cell.type === rule.type;
    }));
}

function purchaseTower(id) {
    const { cost, resourceCost } = calcPrices(id, towerCount(id));
    game.money -= cost;
    game.resources = game.resources.map((r, i) => r - resourceCost[i]);
}

function placeTower(x, y, id, data = {}) {
    purchaseTower(id);
    game.board[index(x, y)] = JSON.parse(JSON.stringify(makeTower(x, y, id, data)));
}


function coords(index) {
    return {
        x: index % BOARD_WIDTH,
        y: Math.floor(index / BOARD_WIDTH),
    };
}

function tunnelDistance(x, y, dir) {
    const [ dx, dy ] = getDxDy(dir);
    for (let i = 1; i <= TUNNEL_LENGTH; i += 1) {
        if (isWithin(x + dx * i, y + dy * i, 0, 0, BOARD_WIDTH, BOARD_HEIGHT)) {
            const cell = game.board[index(x + dx * i, y + dy * i)];
            if (cell && cell.type === 'tower' && cell.id === 4) {
                return i;
            }
        } else {
            return 0;
        }
    }
    return 0;
}

function validTunnel(x, y, dir) {
    return tunnelDistance(x, y, dir) > 0;
}

function splitterRoutes(x, y, dir, entity) {
    const routes = [ getDxDy(mod(dir + 1, 4)), getDxDy(mod(dir, 4)), getDxDy(mod(dir + 3, 4)) ];
    // check if belt or tunnel or another splitter on each route, then its valid
    return routes.filter(([ dx, dy ]) => {
        const cell = game.board[index(x + dx, y + dy)];
        if (cell && cell.type === 'tower' && willAccept(cell.id, cell.data, entity)) {
            return true;
        }
        return false;
    });
}

function splitterDxDy(x, y, dir, parity, entity) {
    const routes = splitterRoutes(x, y, dir, entity);
    return routes[mod(parity, routes.length)] || [0, 0];
}

function normAmmo(ammo) {
    const total = ammo.reduce((a, b) => a + b, 0);
    return ammo.map(a => a / total);
}

function ammoColor(ammo) {
    return normAmmo(ammo).reduce((a, b, i) => [a[0] + b * red(colors[i]), a[1] + b * green(colors[i]), a[2] + b * blue(colors[i])], [0, 0, 0]);
}


function willAccept(id, data = {}, entity) {
    switch (id) {
        case 0: return false; // Harvester
        case 1: return true; // Belt
        case 2: return data.fuel <= 100 * pow(2, data.upgrades[1]) - 10 && entity.resource === 1; // Generator
        case 3: return false; // Power Pole
        case 4: return true; // Tunnel
        case 5: return true; // Splitter
        case 6: return data.wait === -1; // Factory
        case 7: return data.wait !== 0 && data.inside.length < 3 && ([0, 1, 2, 6].includes(entity.resource)) && (entity.resource === 6 || !data.inside.includes(entity.resource)); // Combiner
        case 8: return false; // Zapper
        case 9: return false; // Magnet
        case 10: return entity.ammo && data.ammo.reduce((a, b) => a + b, 0) <= 90; // Turret
        case 11: return data.wait === -1; // Field
    }
    return false;
}

function index(x, y) {
    return y * BOARD_WIDTH + x;
}

let ent = 0;
function makeEntity(x, y) {
    return {
        ent: ent++,
        x, y, squish: 1,
    };
}

function makePath(x, y, dx, dy) {
    return {
        ... makeEntity(x, y),
        type: 'path',
        dx, dy,
    };
}

function makeEnemy(x, y, id, data = {}) {
    return {
        ... makeEntity(x, y),
        type: 'enemy',
        tick: 0,
        progress: 0,
        id,
        health: enemies[id].health,
        effects: {
            slow: 0,
            stun: 0,
            money: 0,
            damage: 0,
            poison: 0,
        }
    };
}

function makeResource(x, y, type) {
    return {
        ... makeEntity(x, y),
        type: 'resource',
        resource: type,
        ammo: false,
    };
}

function makeProjectile(x, y, dir, hits, damage, properties) {
    return {
        ... makeEntity(x, y),
        type: 'projectile',
        hits,
        damage,
        dir,
        properties,
    };
}

function makeTower(x, y, id, data = {}) {
    return {
        ... makeEntity(x, y),
        type: 'tower',
        id,
        data: { ... JSON.parse(JSON.stringify(towers[id].default)), ... JSON.parse(JSON.stringify(data)) },
    };
}

const introductions = [
    0, // enemy 0 introduced at wave 0
    5,
    10,
    15,
    20,
    25,
    70, // boss 1
    30,
    35,
    80, // boss 2
    90, // boss 3
    1000, // boss 4 (too broken)
    40,
    50,
];

const damping = [
    5,
    7,
    7,
    7,
    10,
    10,
    100,
    10,
    15,
    100,
    100,
    100,
    100,
    100,
]

const bossWaves = [
    [[6, 1, 0, 0]],
    [[6, 10, 40, 0]],
    [[9, 1, 0, 0]],
    [[9, 10, 20, 0], [6, 10, 20, 0]],
    [[10, 1, 0, 0]],
    [[10, 10, 20, 0], [9, 10, 20, 40], [6, 100, 20, 40]],
    [[10, 100, 1, 0]],
    [[11, 1, 0, 0]],
    [[11, 10, 10, 0]],
    [[11, 100, 1, 0]],
    [[11, 100, 1, 0]],
];

function generateWaves() {
    const waves = [];
    for (let i = 0; i < 200; i += 1) {
        if (i >= 100) {
            waves.push([[11, 100 * ((i - 99) ** 2), 1, 0]]); // ensure you just die after wave 100
            continue;
        }
        if (i % 10 === 9) {
            waves.push(bossWaves[Math.floor(i / 10)]);
            continue;
        }
        const latest = [...introductions.entries()].filter(([_, intro]) => intro <= i).sort(([_, a], [__, b]) => b - a)[0][0];
        const latestWave = introductions[latest];
        const wave = [];
        const newIntroDamp = Math.min(Math.max(1 - (i - latestWave) / 3, 0), 1);
        for (let j = 0; j < enemies.length; j += 1) {
            if (j === latest && i === latestWave) {
                wave.push([j, 10, 10, 0]);
                continue;
            }
            if (introductions[j] > i) {
                continue;
            }
            
            const wavesSinceIntro = i - introductions[j] + 1;
            const countDamping = j === latest ? 1 : (1 - newIntroDamp * 0.5);
            const countDecay = Math.exp(-Math.max(wavesSinceIntro / damping[j] - 1, 0));
            const count = Math.round(Math.min(Math.max(wavesSinceIntro, 1), 5) * 10 * countDamping * countDecay);
            
            const interval = Math.max(Math.round(20 * Math.exp(-wavesSinceIntro / 4) * newIntroDamp), 2);
            const offset = Math.min(wavesSinceIntro * 5, 40);
            if (count > 0) {
                wave.push([j, count, interval, offset]);
            }
        }
        waves.push(wave);
    }
    console.log(waves);
    const tableData = [...waves.entries()].map(([i, w]) => ({wave: JSON.stringify(w), count: w.reduce((a, b) => a + b[1], 0), health: waveHealth(w), value: waveValue(w) + (i + 1) * 100, difficulty: waveDifficulty(w)}));
    tableData.forEach((d, i) => {
        d.diffWentUp = (i === 0 ? true : d.difficulty > tableData[i - 1].difficulty) ? '' : 'DIFFICULTY WENT DOWN!';
        const newEnemy = introductions.findIndex(intro => intro === i);
        d.otherStuff = i % 10 === 9 ? 'BOSS' : (
            newEnemy >= 0 ? ('INTRO TO ' + newEnemy) : ''
        );
    });
    console.table(tableData);
    return waves;
}

const waves = generateWaves();

function enemyValue(id) {
    return enemies[id].value + enemies[id].spawns.reduce((a, b) => a + enemyValue(b), 0);
}

function enemyHealth(id) {
    return enemies[id].health + enemies[id].spawns.reduce((a, b) => a + enemyHealth(b), 0);
}

function enemyDifficulty(id) {
    return enemies[id].health * enemies[id].speed + enemies[id].spawns.reduce((a, b) => a + enemyDifficulty(b), 0);
}

function waveValue(wave) {
    return wave.reduce((a, b) => a + enemyValue(b[0]) * b[1], 0);
}

function waveHealth(wave) {
    return wave.reduce((a, b) => a + enemyHealth(b[0]) * b[1], 0);
}

function waveDifficulty(wave) {
    return wave.reduce((a, b) => a + enemyDifficulty(b[0]) * b[1] / (b[2] + 1), 0);
}


function generateEnemies(wave) {
    if (wave >= waves.length) {
        return [];
    }
    const waveData = waves[wave];
    const toSpawn = [];
    for (const [ id, count, interval, offset ] of waveData) {
        for (let i = 0; i < count; i += 1) {
            toSpawn.push({ id, tick: interval * i + offset });
        }
    }
    return toSpawn;
}

function startWave() {
    game.waveTick = 0;
    game.running = true;
    game.toSpawn = generateEnemies(game.wave);
}

function endWave() {
    game.wave += 1;
    game.money += 100 * game.wave * game.moneyMultiplier;
    game.xp += round(log(game.wave + 2) / log(2)) * 10;
    game.moneyHistory.push(game.money);
    game.waveTick = 0;
    game.running = false;
    game.toSpawn = [];

    generateStocks();
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function angleLerp(a, b, t) {
    const diff = mod(b - a, TWO_PI);
    if (diff > PI) {
        return mod(a + diff * t, TWO_PI);
    } else {
        return mod(a - diff * t, TWO_PI);
    }
}

function getDxDy(dir) {
    switch (mod(dir, 4)) {
        case 0: return [0, -1];
        case 1: return [1, 0];
        case 2: return [0, 1];
        case 3: return [-1, 0];
        default: return [0, 0];
    }
}

function rotateRelative(dx, dy, dir) {
    switch (mod(dir, 4)) {
        case 0: return [dx, dy];
        case 1: return [-dy, dx];
        case 2: return [-dx, -dy];
        case 3: return [dy, -dx];
        default: return [0, 0];
    }
}

function drawTower(tower, x, y) {
    const [ dx, dy ] = getDxDy(tower.data.dir || 0);

    switch (tower.id) {
        case 0: { // Harvester
            const spin = 0.002 * millis();
        
            fill(180);
            stroke(0);
            beginShape();
            const sawX = x + CELL_SIZE / 2 + 8 * -dx;
            const sawY = y + CELL_SIZE / 2 + 8 * -dy;
            for (let i = 0; i < 8; i += 1) {
                const outAngle = TWO_PI * i / 8 + spin;
                const inAngle = TWO_PI * (i + 0.5) / 8 + spin;
                const outRadius = 8;
                const inRadius = 6;
                vertex(sawX + outRadius * cos(outAngle), sawY + outRadius * sin(outAngle));
                vertex(sawX + inRadius * cos(inAngle), sawY + inRadius * sin(inAngle));
            }
            endShape(CLOSE);


            fill(200);
            stroke(0);
            rect(x + (dy !== 0 ? 2 : 4), y + (dx !== 0 ? 2 : 4), CELL_SIZE - (dy !== 0 ? 4 : 8), CELL_SIZE - (dx !== 0 ? 4 : 8), 4);
            fill(220);
            noStroke();
            rect(x + 6, y + 6, CELL_SIZE - 12, CELL_SIZE - 12, 2);

            stroke(0);
            fill(220);
            strokeWeight(1);
            switch (mod(tower.data.dir, 4)) {
                case 0: {
                    triangle(x + CELL_SIZE / 2, y, x + CELL_SIZE / 2 - 4, y + 6, x + CELL_SIZE / 2 + 4, y + 6);
                    break;
                }
                case 1: {
                    triangle(x + CELL_SIZE, y + CELL_SIZE / 2, x + CELL_SIZE - 6, y + CELL_SIZE / 2 - 4, x + CELL_SIZE - 6, y + CELL_SIZE / 2 + 4);
                    break;
                }
                case 2: {
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE, x + CELL_SIZE / 2 - 4, y + CELL_SIZE - 6, x + CELL_SIZE / 2 + 4, y + CELL_SIZE - 6);
                    break;
                }
                case 3: {
                    triangle(x, y + CELL_SIZE / 2, x + 6, y + CELL_SIZE / 2 - 4, x + 6, y + CELL_SIZE / 2 + 4);
                    break;
                }
            }

            break;
        }
        case 1: { // Belt
            noStroke();
            fill(200);
            rect(x, y, CELL_SIZE, CELL_SIZE);

            fill(220);
            noStroke();
            switch (mod(tower.data.dir, 4)) {
                case 0: {
                    triangle(x + CELL_SIZE / 2, y, x, y + CELL_SIZE / 2, x + CELL_SIZE, y + CELL_SIZE / 2);
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, x, y + CELL_SIZE, x + CELL_SIZE, y + CELL_SIZE);
                    break;
                }
                case 1: {
                    triangle(x + CELL_SIZE, y + CELL_SIZE / 2, x + CELL_SIZE / 2, y, x + CELL_SIZE / 2, y + CELL_SIZE);
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, x, y, x, y + CELL_SIZE);
                    break;
                }
                case 2: {
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE, x, y + CELL_SIZE / 2, x + CELL_SIZE, y + CELL_SIZE / 2);
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, x, y, x + CELL_SIZE, y);
                    break;
                }
                case 3: {
                    triangle(x, y + CELL_SIZE / 2, x + CELL_SIZE / 2, y, x + CELL_SIZE / 2, y + CELL_SIZE);
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, x + CELL_SIZE, y, x + CELL_SIZE, y + CELL_SIZE);
                    break;
                }
            }

            stroke(0);
            noFill();
            beginShape(LINES);
            if (dy !== 0) {
                vertex(x, y); vertex(x, y + CELL_SIZE);
                vertex(x + CELL_SIZE, y); vertex(x + CELL_SIZE, y + CELL_SIZE);
            } else {
                vertex(x, y); vertex(x + CELL_SIZE, y);
                vertex(x, y + CELL_SIZE); vertex(x + CELL_SIZE, y + CELL_SIZE);
            }
            endShape();
            break;
        }
        case 2: { // Generator
            fill(200);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(220);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 2);
            stroke(0);
            fill(0);
            circle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE - 10);
            stroke(0);
            fill(255, 255, 0);
            circle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, map(tower.data.fuel, 0, 100 * pow(2, tower.data.upgrades[1]) - 10, 0, CELL_SIZE - 10));

            break;
        }
        case 3: { // Power Pole
            fill(200);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(220);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 2);
            stroke(0);
            fill(100);
            rect(x + CELL_SIZE / 2 - 2, y + 4, 4, CELL_SIZE - 8);
            rect(x + 4, y + CELL_SIZE / 2 - 2, CELL_SIZE - 8, 4);

            fill(0);
            noStroke();

            break;
        }
        case 4: { // Tunnel
            fill(100);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(120);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 2);
            stroke(0);
            fill(100);
            switch (mod(tower.data.dir, 4)) {
                case 0: {
                    triangle(x + CELL_SIZE / 2, y + 4, x + 4, y + CELL_SIZE - 4, x + CELL_SIZE - 4, y + CELL_SIZE - 4);
                    break;
                }
                case 1: {
                    triangle(x + CELL_SIZE - 4, y + CELL_SIZE / 2, x + 4, y + 4, x + 4, y + CELL_SIZE - 4);
                    break;
                }
                case 2: {
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE - 4, x + 4, y + 4, x + CELL_SIZE - 4, y + 4);
                    break;
                }
                case 3: {
                    triangle(x + 4, y + CELL_SIZE / 2, x + CELL_SIZE - 4, y + 4, x + CELL_SIZE - 4, y + CELL_SIZE - 4);
                    break;
                }
            }
            break;
        }
        case 5: { // Splitter
            fill(100);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            fill(120);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
            stroke(0);
            
            switch (mod(tower.data.dir, 4)) {
                case 0: {
                    fill(200);
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE - 10, x + 8, y + CELL_SIZE - 3, x + CELL_SIZE - 8, y + CELL_SIZE - 3);
                    fill(120);
                    triangle(x + CELL_SIZE / 2, y + 2, x + 8, y + 6, x + CELL_SIZE - 8, y + 6);
                    triangle(x + 2, y + CELL_SIZE / 2, x + 6, y + 8, x + 6, y + CELL_SIZE - 8);
                    triangle(x + CELL_SIZE - 2, y + CELL_SIZE / 2, x + CELL_SIZE - 6, y + 8, x + CELL_SIZE - 6, y + CELL_SIZE - 8);
                    break;
                }
                case 1: {
                    fill(200);
                    triangle(x + 10, y + CELL_SIZE / 2, x + 3, y + 8, x + 3, y + CELL_SIZE - 8);
                    fill(120);
                    triangle(x + CELL_SIZE - 2, y + CELL_SIZE / 2, x + CELL_SIZE - 6, y + 8, x + CELL_SIZE - 6, y + CELL_SIZE - 8);
                    triangle(x + CELL_SIZE / 2, y + 2, x + 8, y + 6, x + CELL_SIZE - 8, y + 6);
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE - 2, x + 8, y + CELL_SIZE - 6, x + CELL_SIZE - 8, y + CELL_SIZE - 6);
                    break;
                }
                case 2: {
                    fill(200);
                    triangle(x + CELL_SIZE / 2, y + 10, x + 8, y + 3, x + CELL_SIZE - 8, y + 3);
                    fill(120);
                    triangle(x + 2, y + CELL_SIZE / 2, x + 6, y + 8, x + 6, y + CELL_SIZE - 8);
                    triangle(x + CELL_SIZE - 2, y + CELL_SIZE / 2, x + CELL_SIZE - 6, y + 8, x + CELL_SIZE - 6, y + CELL_SIZE - 8);
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE - 2, x + 8, y + CELL_SIZE - 6, x + CELL_SIZE - 8, y + CELL_SIZE - 6);
                    break;
                }
                case 3: {
                    fill(200);
                    triangle(x + CELL_SIZE - 10, y + CELL_SIZE / 2, x + CELL_SIZE - 3, y + 8, x + CELL_SIZE - 3, y + CELL_SIZE - 8);
                    fill(120);
                    triangle(x + CELL_SIZE / 2, y + 2, x + 8, y + 6, x + CELL_SIZE - 8, y + 6);
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE - 2, x + 8, y + CELL_SIZE - 6, x + CELL_SIZE - 8, y + CELL_SIZE - 6);
                    triangle(x + 2, y + CELL_SIZE / 2, x + 6, y + 8, x + 6, y + CELL_SIZE - 8);
                    break;
                }
                 
            }
            break;
        }
        case 6: { // Factory
            fill(200);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(220);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 2);
            stroke(0);
            fill(100);
            beginShape();
            vertex(x + CELL_SIZE / 2, y + 6);
            vertex(x + 6, y + CELL_SIZE / 2);
            vertex(x + CELL_SIZE / 2, y + CELL_SIZE - 6);
            vertex(x + CELL_SIZE - 6, y + CELL_SIZE / 2);
            endShape(CLOSE);

            fill(220);
            stroke(0);
            switch (mod(tower.data.dir, 4)) {
                case 0: {
                    triangle(x + CELL_SIZE / 2, y - 2, x + CELL_SIZE / 2 - 4, y + 4, x + CELL_SIZE / 2 + 4, y + 4);
                    break;
                }
                case 1: {
                    triangle(x + CELL_SIZE + 2, y + CELL_SIZE / 2, x + CELL_SIZE - 4, y + CELL_SIZE / 2 - 4, x + CELL_SIZE - 4, y + CELL_SIZE / 2 + 4);
                    break;
                }
                case 2: {
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE + 2, x + CELL_SIZE / 2 - 4, y + CELL_SIZE - 4, x + CELL_SIZE / 2 + 4, y + CELL_SIZE - 4);
                    break;
                }
                case 3: {
                    triangle(x - 2, y + CELL_SIZE / 2, x + 4, y + CELL_SIZE / 2 - 4, x + 4, y + CELL_SIZE / 2 + 4);
                    break;
                }
            }

            break;
        }
        case 7: { // Combiner
            fill(200);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(220);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 2);
            stroke(0);
            const spin = 0.001 * millis();
            fill(colors[tower.data.inside[0] ?? 6]);
            circle(x + CELL_SIZE / 2 + cos(spin) * 4, y + CELL_SIZE / 2 + sin(spin) * 4, 6);
            fill(colors[tower.data.inside[1] ?? 6]);
            circle(x + CELL_SIZE / 2 + cos(spin + TWO_PI / 3) * 4, y + CELL_SIZE / 2 + sin(spin + TWO_PI / 3) * 4, 6);
            fill(colors[tower.data.inside[2] ?? 6]);
            circle(x + CELL_SIZE / 2 + cos(spin + TWO_PI * 2 / 3) * 4, y + CELL_SIZE / 2 + sin(spin + TWO_PI * 2 / 3) * 4, 6);

            fill(220);
            stroke(0);
            switch (mod(tower.data.dir, 4)) {
                case 0: {
                    triangle(x + CELL_SIZE / 2, y - 2, x + CELL_SIZE / 2 - 4, y + 4, x + CELL_SIZE / 2 + 4, y + 4);
                    break;
                }
                case 1: {
                    triangle(x + CELL_SIZE + 2, y + CELL_SIZE / 2, x + CELL_SIZE - 4, y + CELL_SIZE / 2 - 4, x + CELL_SIZE - 4, y + CELL_SIZE / 2 + 4);
                    break;
                }
                case 2: {
                    triangle(x + CELL_SIZE / 2, y + CELL_SIZE + 2, x + CELL_SIZE / 2 - 4, y + CELL_SIZE - 4, x + CELL_SIZE / 2 + 4, y + CELL_SIZE - 4);
                    break;
                }
                case 3: {
                    triangle(x - 2, y + CELL_SIZE / 2, x + 4, y + CELL_SIZE / 2 - 4, x + 4, y + CELL_SIZE / 2 + 4);
                    break;
                }
            }
            break;
        }
        // DEFENSE TOWERS
        case 8: { // Zapper
            fill(200);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(220);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 2);
            stroke(0);
            fill(100);
            beginShape();
            vertex(x + CELL_SIZE / 2, y + 6 + 2);
            vertex(x + 6, y + CELL_SIZE / 2 + 2);
            vertex(x + CELL_SIZE / 2, y + CELL_SIZE - 6 + 2);
            vertex(x + CELL_SIZE - 6, y + CELL_SIZE / 2 + 2);
            endShape(CLOSE);
            fill(255, 0, 0);
            beginShape();
            vertex(x + CELL_SIZE / 2, y + 6 - 2);
            vertex(x + 6, y + CELL_SIZE / 2 - 2);
            vertex(x + CELL_SIZE / 2, y + CELL_SIZE - 6 - 2);
            vertex(x + CELL_SIZE - 6, y + CELL_SIZE / 2 - 2);
            endShape(CLOSE);
            break;
        }
        case 9: { // Magnet
            fill(200);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(220);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 2);
            stroke(0);
            fill(100);
            beginShape();
            vertex(x + CELL_SIZE / 2, y + 6 + 2);
            vertex(x + 6, y + CELL_SIZE / 2 + 2);
            vertex(x + CELL_SIZE / 2, y + CELL_SIZE - 6 + 2);
            vertex(x + CELL_SIZE - 6, y + CELL_SIZE / 2 + 2);
            endShape(CLOSE);
            fill(0, 0, 255);
            beginShape();
            vertex(x + CELL_SIZE / 2, y + 6 - 2);
            vertex(x + 6, y + CELL_SIZE / 2 - 2);
            vertex(x + CELL_SIZE / 2, y + CELL_SIZE - 6 - 2);
            vertex(x + CELL_SIZE - 6, y + CELL_SIZE / 2 - 2);
            endShape(CLOSE);
            break;
        }
        case 10: { // Turret
            fill(200);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(220);
            noStroke();
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 2);
            stroke(0);
            fill(100);

            triangle(x + CELL_SIZE / 2, y + 12, x + 6, y + CELL_SIZE / 2 + 6, x + CELL_SIZE - 6, y + CELL_SIZE / 2 + 6);

            fill(30);
            beginShape();
            vertex(x + CELL_SIZE / 2, y + 6 - 2);
            vertex(x + 6, y + CELL_SIZE / 2 - 2);
            vertex(x + CELL_SIZE / 2, y + CELL_SIZE - 6 - 2);
            vertex(x + CELL_SIZE - 6, y + CELL_SIZE / 2 - 2);
            endShape(CLOSE);

            const ammoAmount = tower.data.ammo.reduce((a, b) => a + b, 0);
            if (ammoAmount > 0) {
                const radius = 6 * sqrt(ammoAmount / 100);
                const averageColor = ammoColor(tower.data.ammo);
                fill(...averageColor);
                beginShape();
                vertex(x + CELL_SIZE / 2, y + CELL_SIZE / 2 - radius - 2);
                vertex(x + CELL_SIZE / 2 - radius, y + CELL_SIZE / 2 - 2);
                vertex(x + CELL_SIZE / 2, y + CELL_SIZE / 2 + radius - 2);
                vertex(x + CELL_SIZE / 2 + radius, y + CELL_SIZE / 2 - 2);
                endShape(CLOSE);
            }
            break;
        }
        case 11: { // Field
            fill(200);
            stroke(0);
            ellipse(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE - 2, CELL_SIZE - 2);
            fill(220);
            noStroke();
            ellipse(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE - 6, CELL_SIZE - 6);
            stroke(0);
            fill(colors[tower.data.inside[0] ?? 6]);
            ellipse(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE - 10, CELL_SIZE - 10);
            
            break;
        }
        case 12: { // Mint
            fill(50, 200, 50);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(50, 220, 50);
            noStroke();
            rect(x + 5, y + 5, CELL_SIZE - 10, CELL_SIZE - 10, 2);

            stroke(0);
            fill(50, 180, 50);
            rect(x + 8, y + 8, CELL_SIZE - 16, CELL_SIZE - 16, 2);
            break;
        }
        case 13: {  // Research
            fill(50, 200, 200);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(50, 220, 220);
            noStroke();
            rect(x + 5, y + 5, CELL_SIZE - 10, CELL_SIZE - 10, 2);

            stroke(0);
            fill(50, 180, 180);
            rect(x + 8, y + 8, CELL_SIZE - 16, CELL_SIZE - 16, 2);
            break;
        }
        case 14: { // Magic
            fill(50);
            stroke(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 2);
            fill(0);
            noStroke();
            rect(x + 5, y + 5, CELL_SIZE - 10, CELL_SIZE - 10, 2);

            stroke(0);
            fill(255, 0, 0);
            triangle(x + CELL_SIZE / 2, y + 8, x + 8, y + CELL_SIZE - 8, x + CELL_SIZE - 8, y + CELL_SIZE - 8);
            break; 
        }
        case 15: { // the end.
            const points = new Array(100).fill(0).map((_, i) => {
                return {
                    x: cos(i / 100 * TWO_PI * i + millis()),
                    y: sin(i / 100 * TWO_PI * i + millis()),
                }
            });

            stroke(51);
            fill(0);
            rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
            rect(x + 5, y + 5, CELL_SIZE - 10, CELL_SIZE - 10);
            rect(x + 7, y + 7, CELL_SIZE - 14, CELL_SIZE - 14);
            rect(x + 9, y + 9, CELL_SIZE - 18, CELL_SIZE - 18);

            stroke(255);
            noFill();
            beginShape();
            for (const { x: px, y: py } of points) {
                vertex(x + CELL_SIZE / 2 + px * 10, y + CELL_SIZE / 2 + py * 10);
            }
            endShape(CLOSE);
        }
    }
    

    if (tower.unpowered) {
        strokeWeight(2);
        stroke(0);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(16);
        textStyle(BOLD);
        text('!', x + CELL_SIZE / 2, y + sin(0.002 * millis()) * 4);
    }

    
    strokeWeight(1);
    fill(0);
    noStroke();
    if (tower.powerData) {
        const { draw, gen } = tower.powerData;
        const maximum = max(draw, gen);
        rect(x + 4, y + CELL_SIZE / 2 - 2, CELL_SIZE - 8, 4);
        const drawWidth = map(draw, 0, maximum, 0, CELL_SIZE - 10);
        const genWidth = map(gen, 0, maximum, 0, CELL_SIZE - 10);
        fill(255, 0, 0);
        rect(x + 5, y + CELL_SIZE / 2 - 1, drawWidth, 1);
        fill(0, 255, 0);
        rect(x + 5, y + CELL_SIZE / 2, genWidth, 1);
    }
}

function drawDottedCircle(segmentCount, x, y, radius, spinSpeed) {
    noFill();
    for (let i = 0; i < segmentCount; i += 1) {
        const angle = TWO_PI * i / segmentCount + spinSpeed * 0.001 * millis();
        arc(x, y, radius * 2, radius * 2, angle, angle + PI / segmentCount);
    }
}

function calcPrices(towerId, count) {
    const tower = towers[towerId];
    return price(tower.cost, tower.resourceCost, tower.costScale, tower.resourceCostScale, count);
}

function calcUpgradePrices(towerId, counts = []) {
    const tower = towers[towerId];
    return counts.map((count, i) => price(tower.upgrades[i].cost, tower.upgrades[i].resourceCost, tower.upgrades[i].costScale, tower.upgrades[i].resourceCostScale, count));
}

function price(cost, resourceCost, costScale, resourceCostScale, count) {
    return {
        cost: round(cost * pow(costScale, count)),
        resourceCost: resourceCost.map(r => round(r * pow(resourceCostScale, count))),
    };
}

function rewardMoney(x, y, amount) {
    let multiplier = 1;
    for (const zone of game.zones) {
        if (dist(x, y, zone.x, zone.y) <= zone.radius) {
            if (zone.type === 'money') multiplier *= zone.value;
        }
    }
    const add = round(amount * multiplier);
    game.money += add * game.moneyMultiplier;
    addNumber(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, 'money', add);
}

function addNumber(x, y, type, number) {
    while (game.numbers.length > 100) game.numbers.shift();
    game.numbers.push({
        x, y, type, number: round(number), xv: random(-2, 2), yv: -random(8, 12), tick: 0,
    });
}
    
function applyDamage(entity, damage) {
    let damageMultiplier = log(entity.effects['damage'] + 2) / log(2);
    for (const zone of game.zones) {
        if (dist(entity.x, entity.y, zone.x, zone.y) <= zone.radius) {
            if (zone.type === 'damage') damageMultiplier *= zone.value;
        }
    }
    
    const realDamage = damage * damageMultiplier;
    entity.health -= realDamage;
    addNumber(entity.x * CELL_SIZE + CELL_SIZE / 2, entity.y * CELL_SIZE + CELL_SIZE / 2, 'damage', realDamage);
}

function getProgress(progress) {
    progress = constrain(progress, 0, game.path.length - 1);
    const prevNode = game.path[floor(progress)] || game.path[0];
    const nextNode = game.path[ceil(progress)] || game.path[game.path.length - 1];
    return { x: lerp(prevNode.x, nextNode.x, progress % 1), y: lerp(prevNode.y, nextNode.y, progress % 1) };
}

function spawnEnemy(id, progress = 0, speed = 1) {
    const pProgress = constrain(progress - speed, 0, game.path.length - 1);
    const { x, y } = getProgress(progress);
    const { x: px, y: py } = getProgress(pProgress);
    const newEnemy = makeEnemy(x, y, id);
    game.prevEntities.push({ ...newEnemy, progress: pProgress, x: px, y: py });
    game.entities.push({ ...newEnemy, progress });
}
    

function isWithin(px, py, x, y, w, h) {
    return px >= x && px < x + w && py >= y && py < y + h;
}

function mouseIsWithin(x, y, w, h) {
    return isWithin(mouseX, mouseY, x, y, w, h);
}

function drawButton(x, y, w, h, t = '', onClick = () => {}) {
    stroke(0);
    if (mouseIsWithin(x, y, w, h)) {
        fill(220);
        if (input.mouse[LEFT] === 1) {
            fill(200);
            onClick();
        }
    } else {
        fill(200);
    }
    rect(x, y, w, h);
    if (t) {
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        text(t, x + w / 2, y + h / 2);
    }
}

function drawWire(x1, y1, x2, y2) {
    noFill();
    stroke(0, 100);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const dist = sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    const hang = 0.2 * dist;
    beginShape();
    vertex(x1, y1);
    vertex(midX, midY - hang);
    vertex(x2, y2);
    endShape();
}

function distToLineSegment(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) {
        param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return sqrt(dx * dx + dy * dy);
}

function tick() {

    // step 1: consume resources
    game.moneyMultiplier = max(game.board.filter(c => c && c.type === 'tower' && c.id === 13).reduce((a, b) => a * pow(1.05, b.data.upgrades[2]), 1), 1);
    game.resourceMultiplier = max(game.board.filter(c => c && c.type === 'tower' && c.id === 13).reduce((a, b) => a * pow(2, b.data.upgrades[1] / 2), 1), 1);

    console.log(game.moneyMultiplier);
    for (const entity of game.entities) {
        if (entity.type === 'resource') {
            if (isWithin(entity.x, entity.y, BASE_X - 1, BASE_Y - 1, 3, 3)) {
                game.resources[entity.resource] += game.resourceMultiplier;
                entity.consumed = true;
            }
            const cell = game.board[index(entity.x, entity.y)];
            if (cell && cell.type === 'tower') {
                switch (cell.id) {
                    case 2: { // Generator
                        if (entity.resource === 1 && cell.data.fuel <= 100 * pow(2, cell.data.upgrades[1]) - 10) {
                            cell.data.fuel = min(100 * pow(2, cell.data.upgrades[1]) - 10, cell.data.fuel + 10 * pow(2, cell.data.upgrades[2]));
                            entity.consumed = true;
                        }
                        break;
                    }
                    case 4: { // Tunnel
                        if (validTunnel(entity.x, entity.y, cell.data.dir)) {
                            const [ dx, dy ] = getDxDy(cell.data.dir);
                            const dist = tunnelDistance(entity.x, entity.y, cell.data.dir);
                            const nextX = entity.x + dx * dist;
                            const nextY = entity.y + dy * dist;
                            if (!game.entities.some(e => e.x === nextX && e.y === nextY)) {
                                game.entities.push({ ... entity, x: nextX, y: nextY });
                                entity.consumed = true;
                            }
                        }
                        break;
                    }
                    case 6: { // Factory
                        if (cell.data.wait === -1) {
                            cell.data.wait = 4;
                            cell.data.inside = [ entity.resource ];
                            entity.consumed = true;
                        }
                        break;
                    }
                    case 7: { // Combiner
                        if (cell.data.wait !== 0 && cell.data.inside.length < 3) {
                            cell.data.wait = 8;
                            if (([0, 1, 2, 6].includes(entity.resource)) && (entity.resource === 6 || !cell.data.inside.includes(entity.resource))) {
                                cell.data.inside.push(entity.resource);
                            }
                            entity.consumed = true;
                        }
                        break;
                    }
                    case 10: { // Turret
                        if (cell.data.ammo.reduce((a, b) => a + b, 0) <= 90) {
                            cell.data.ammo[entity.resource] += 10;
                            entity.consumed = true;
                        }
                        break;
                    }
                    case 11: { // Field
                        if (cell.data.inside.length < 1 && cell.data.wait === -1) {
                            cell.data.wait = 32;
                            cell.data.inside.push(entity.resource);
                            entity.consumed = true;
                        }
                        break;
                    }
                }
            }
        }
    }
    game.entities = game.entities.filter(e => !e.consumed);

    // step 2: power
    const networks = [];
    // add generators and reduce fuel
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const ind = index(x, y);
            const cell = game.board[ind];
            if (cell && cell.type === 'tower' && cell.id === 2 && cell.data.fuel > 0) {
                networks.push([{ x, y, cell }]);
                if (game.tick % (cell.data.upgrades[2] + 1) === 0) {
                    cell.data.fuel -= 1;
                }
            }
        }
    }

    // add power poles
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const ind = index(x, y);
            const cell = game.board[ind];
            if (cell && cell.type === 'tower' && cell.id === 3) {
                let applicableNetworks = networks.filter(n => n.some(c => round(dist(x, y, c.x, c.y)) <= max(towers[c.cell.id].range.radius, towers[cell.id].range.radius)));
                // if one network, add to it
                if (applicableNetworks.length === 1) {
                    applicableNetworks[0].push({ x, y, cell });
                } else if (applicableNetworks.length > 1) {
                    // if multiple networks, merge them
                    const mergedNetwork = applicableNetworks.reduce((a, b) => a.concat(b));
                    mergedNetwork.push({ x, y, cell });
                    networks.splice(networks.indexOf(applicableNetworks[0]), applicableNetworks.length, mergedNetwork);
                }
            }
        }
    }

    // add power draws
    const networkPowers = networks.map(n => n.reduce((a, b) => (
        { 
            draw: a.draw + towers[b.cell.id].power.draw, 
            gen: a.gen + towers[b.cell.id].power.gen * (towers[b.cell.id].upgrades ? b.cell.data.upgrades[0] + 1 : 1) // upgrade power
        }
    ), { draw: 0, gen: 0 }));
    const draws = networks.map(_ => []);
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const ind = index(x, y);
            const cell = game.board[ind];
            if (cell && cell.type === 'tower' && cell.id !== 2 && cell.id !== 3 && towers[cell.id].power.draw > 0) {
                let net = networks.findIndex(n => n.some(c => round(dist(x, y, c.x, c.y)) <= towers[c.cell.id].range.radius));
                if (net >= 0) {
                    draws[net].push({ x, y, cell });
                    networkPowers[net].draw += towers[cell.id].power.draw;
                }
            }
        }
    }

    const unpowered = networkPowers.map(n => n.draw > n.gen);
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const cell = game.board[index(x, y)];
            if (cell) {
                cell.unpowered = false;
                if (
                    (unpowered.some((u, i) => u && draws[i].some(c => c.x === x && c.y === y))) 
                    || (cell.type === 'tower' && towers[cell.id].power.draw > 0 && !draws.some(d => d.some(c => c.x === x && c.y === y)))
                ) {
                    cell.unpowered = true;
                }
                if (cell.type === 'tower' && (cell.id === 3 || cell.id === 2)) { // put power data on power poles
                    cell.powerData = { ... networkPowers[networks.findIndex(n => n.some(c => c.x === x && c.y === y))] };
                }
            }
        }
    }
    
    // step 3: harvest resources and generate zones
    game.zones = [];
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const ind = index(x, y);
            const cell = game.board[ind];
            if (cell && cell.type === 'tower') {
                switch (cell.id) {
                    case 0: { // Harvester
                        if (game.tick % (8 - cell.data.upgrades[0]) === 0) {
                            const [ dx, dy ] = getDxDy(cell.data.dir || 0);
                            const resource = game.board[index(x - dx, y - dy)];
                            if (resource && resource.type === 'resource' && !game.entities.some(e => e.x === x && e.y === y)) {
                                game.entities.push(makeResource(x, y, resource.resource));
                            }
                        }
                        break;
                    }
                    case 6: { // Factory
                        if (cell.data.wait > 0) {
                            cell.data.wait -= 1;
                        } else if (cell.data.wait === 0) {
                            cell.data.wait = -1;
                            const resource = cell.data.inside[0] || 0;
                            game.entities.push({ ... makeResource(x, y, resource), ammo: true, priority: 1 });
                            cell.data.inside = [];
                        }
                        break;
                    }
                    case 7: { // Combiner
                        if (cell.data.wait > 0 && cell.data.inside.length >= 2) {
                            cell.data.wait -= 1;
                        } else if (cell.data.wait === 0) {
                            cell.data.wait = -1;
                            const counts = [ cell.data.inside.filter(r => r === 0).length, cell.data.inside.filter(r => r === 1).length, cell.data.inside.filter(r => r === 2).length, cell.data.inside.filter(r => r === 6).length ];
                            const str = counts.join('');
                            const produced = {
                                // red + yellow = green
                                '1100': 3,
                                '2100': 3,
                                '1200': 3,
                                // yellow + blue = cyan
                                '0110': 4,
                                '0210': 4,
                                '0120': 4,
                                // blue + red = purple
                                '1010': 5,
                                '2010': 5,
                                '1020': 5,
                                // red + yellow + blue = black
                                '1110': 6,
                                // black + black = white
                                '0002': 7,
                            }[str] || 6;
                            game.entities.push({ ... makeResource(x, y, produced), priority: 1 });
                            cell.data.inside = [];
                        }
                        break;
                    }
                    case 9: { // Magnet
                        if (round(game.tick + x * 4 + y * 4) % 16 < 4 + cell.data.upgrades[2] * 3) {
                            game.zones.push({ x, y, radius: towerRange(cell.id, cell.data), type: 'slow', value: 0.5 - cell.data.upgrades[1] * 0.08 });
                        }
                        break;
                    }
                    case 11: { // Field
                        if (cell.data.wait >= 0) {
                            
                            cell.data.wait -= 1;
                            const resource = cell.data.inside[0] || 0;
                            const power = pow(2, 1 + cell.data.upgrades[0]);
                            
                            switch (resource) {
                                case 0: { // Red, damage
                                    game.zones.push({ x, y, radius: towerRange(cell.id, cell.data), type: 'damage', value: power });
                                    break;
                                }
                                case 2: { // Blue, slow
                                    game.zones.push({ x, y, radius: towerRange(cell.id, cell.data), type: 'slow', value: 0.5 - cell.data.upgrades[0] * 0.04 });
                                    break;
                                }
                                case 3: { // Green, money
                                    game.zones.push({ x, y, radius: towerRange(cell.id, cell.data), type: 'money', value: power });
                                    break;
                                }
                            }

                            if (cell.data.wait < 0) {
                                cell.data.inside = [];
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    game.prevEntities = [ ... game.entities ];

    const newEntities = [];
    let moved = true;
    while (moved) {
        moved = false;
        for (const entity of game.entities.sort((a, b) => (b.priority || 0) - (a.priority || 0))) {
            if (entity.type === 'resource') {
                const cell = game.board[index(entity.x, entity.y)];
                const MOVERS = [ 0, 1, 5, 6, 7 ];
                if (cell && (MOVERS.includes(cell.id) || (cell.id === 4 && validTunnel(cell.x, cell.y, mod(cell.data.dir + 2, 4))))) { // try to move
                    const [ dx, dy ] = cell.id === 5 ? splitterDxDy(cell.x, cell.y, cell.data.dir, cell.data.parity, entity) : getDxDy(cell.data.dir || 0);
                    if (cell.id === 5) {
                        cell.data.parity += 1;
                    }
                    
                    const nextX = entity.x + dx;
                    const nextY = entity.y + dy;
                    const nextCell = game.board[index(nextX, nextY)];
                    if (nextCell && (nextCell.type === 'resource' || (nextCell.type === 'tower' && (!willAccept(nextCell.id, nextCell.data, entity) || nextCell.unpowered)))) {
                        continue;
                    }
                    if (!game.entities.some(e => e.x === nextX && e.y === nextY) && !newEntities.some(e => e.x === nextX && e.y === nextY)) {
                        newEntities.push({ ... entity, x: nextX, y: nextY, priority: 0 });
                        entity.moved = true;
                        moved = true;
                    }
                }
            }
        }
        game.entities = game.entities.filter(e => !e.moved);
    }

    // copy over any entities that didn't move
    for (const entity of game.entities) {
        if (entity.type === 'resource' || entity.type === 'enemy' || entity.type === 'projectile') {
            newEntities.push({ ... entity, priority: (entity.priority ?? 0) + 1 });
        }
    }
    
    game.entities = [ ... newEntities ].filter(e => isWithin(e.x, e.y, 0, 0, BOARD_WIDTH, BOARD_HEIGHT));

    // now, enemies
    const toSpawn = game.toSpawn.filter(e => e.tick <= game.waveTick);
    game.toSpawn = game.toSpawn.filter(e => e.tick > game.waveTick);
    for (const enemy of toSpawn) {
        spawnEnemy(enemy.id);
    }

    // step 4: enemies
    const activeEnemies = game.entities.filter(e => e.type === 'enemy');
    for (const entity of activeEnemies) {
        
        let speedFactor = enemies[entity.id].speed;
        
        for (const effect in entity.effects) {
            const value = entity.effects[effect];
            if (value > 0) {
                entity.effects[effect] -= 1;
                if (effect === 'slow') {
                    speedFactor *= 0.5;
                } else if (effect === 'stun') {
                    speedFactor *= 0;
                } else if (effect === 'poison') {
                    applyDamage(entity, value);
                    console.log(entity.health);
                } else if (effect === 'money') {
                    rewardMoney(entity.x, entity.y, value);
                }
            }
        }
        for (const zone of game.zones) {
            if (dist(entity.x, entity.y, zone.x, zone.y) <= zone.radius) {
                switch (zone.type) {
                    case 'slow': {
                        speedFactor *= zone.value;
                        break;
                    }
                }
            }
        }
        for (const projectile of game.entities.filter(e => e.type === 'projectile')) {
            if (dist(entity.x, entity.y, projectile.x, projectile.y) <= 1.5) {
                if (projectile.hits > 0) {
                    const [
                        _, // red, damage
                        stun, // yellow, stun
                        slow, // blue, slow
                        money, // green, money
                        poison, // cyan, poison
                        damage, // purple, damage
                        __, // black, homing
                        ___, // white, special effect
                    ] = projectile.properties.map(p => round((p ** 2) * 20));
                    if (stun > 0) {
                        entity.effects['stun'] += stun;
                        entity.progress -= stun / 5;
                    }
                    if (slow > 0) {
                        entity.effects['slow'] += slow;
                    }
                    if (money > 0) {
                        entity.effects['money'] += money;
                    }
                    if (poison > 0) {
                        entity.effects['poison'] += poison;
                    }
                    if (damage > 0) {
                        entity.effects['damage'] += damage;
                    }
                    applyDamage(entity, projectile.damage);
                    projectile.hits -= 1;
                }
            }
        }

        entity.progress += speedFactor;
        if (entity.progress >= game.path.length - 1) {
            entity.health = 0;
            entity.noreward = true;
            game.money -= enemyDamage(game.wave);
            anim.damage = 1;
        } else {
            const { x, y } = getProgress(entity.progress);
            entity.x = x;
            entity.y = y;
            entity.tick += 1;
        }
    }

    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const ind = index(x, y);
            const cell = game.board[ind];
            if (cell && cell.type === 'tower' && !cell.unpowered) {
                const focusEnemy = activeEnemies.sort((a, b) => b.progress - a.progress).filter(e => dist(e.x, e.y, x, y) <= towerRange(cell.id, cell.data))[0];
                switch (cell.id) {
                    case 8: { // Zapper
                        if (focusEnemy && game.tick % (towers[cell.id].defense.rate - cell.data.upgrades[2]) === 0) {
                            anim.zaps.push({ x, y, ex: focusEnemy.x, ey: focusEnemy.y, t: 1 });
                            applyDamage(focusEnemy, towers[cell.id].defense.damage * pow(2, cell.data.upgrades[0]));
                        }
                        break;
                    }
                    case 10: { // Turret
                        const ammoToConsume = cell.data.ammo.findIndex(a => a > 0);
                        if (focusEnemy && game.tick % (towers[cell.id].defense.rate - cell.data.upgrades[2]) === 0 && ammoToConsume >= 0) {
                            cell.data.ammo[ammoToConsume] -= 1;
                            
                            let travelTime = dist(x, y, focusEnemy.x, focusEnemy.y);
                            let ex, ey;
                            for (let i = 0; i < 2; i += 1) {
                                let progressAfterTravel = focusEnemy.progress + travelTime * enemies[focusEnemy.id].speed;
                                const {x: px, y: py} = getProgress(progressAfterTravel);
                                ex = px;
                                ey = py;
                                travelTime = dist(x, y, ex, ey);
                            }
                            const dir = atan2(ey - y, ex - x);
                            const properties = normAmmo(cell.data.ammo);
                            const hits = round(1 + ((properties[0] ** 2) * 4 + 1) * ((properties[5] ** 2) * 16 + 1));
                            const damage = towers[cell.id].defense.damage * pow(2, cell.data.upgrades[0] / 2) * ((properties[0] + 1) ** 2) * ((properties[5] + 1) ** 4);
                            const newProjectile = makeProjectile(x + 0.5, y + 0.5, dir, hits, damage, properties);
                            if (cell.data.ammo[7] > 0) {
                                const leftProjectile = makeProjectile(x + 0.5, y + 0.5, dir - PI / 8, hits, damage, properties);
                                const rightProjectile = makeProjectile(x + 0.5, y + 0.5, dir + PI / 8, hits, damage, properties);
                                game.prevEntities.push({ ... leftProjectile });
                                game.prevEntities.push({ ... rightProjectile });
                                game.entities.push({ ... leftProjectile });
                                game.entities.push({ ... rightProjectile });
                            }
                            game.prevEntities.push({ ... newProjectile });
                            game.entities.push({ ... newProjectile });
                        }
                        break;
                    }
                    case 12: { // Mint
                        rewardMoney(x, y, pow(2, cell.data.upgrades[0]));
                        break;
                    }
                    case 13: { // Research
                        if (game.tick % 8 === 0) {
                            game.xp += pow(2, cell.data.upgrades[0]);
                        }
                        break;
                    }
                    case 14: { // Magic
                        if (focusEnemy) {
                            const dir = atan2(focusEnemy.y - y, focusEnemy.x - x);
                            const fromX = x + 0.5;
                            const fromY = y + 0.5;
                            const range = towerRange(cell.id, cell.data);
                            const toX = x + 0.5 + cos(dir) * range;
                            const toY = y + 0.5 + sin(dir) * range;
                            for (const enemy of activeEnemies) {
                                if (distToLineSegment(enemy.x, enemy.y, fromX, fromY, toX, toY) <= 1.0) {
                                    applyDamage(enemy, towers[cell.id].defense.damage * pow(2, cell.data.upgrades[0] / 2));
                                    enemy.effects['poison'] += 10 * pow(2, cell.data.upgrades[2]);
                                }
                            }

                            for (let i = 0; i < 4; i += 1) {
                                anim.zaps.push({ x: fromX + random(-0.1, 0.1) - 0.5, y: fromY + random(-0.1, 0.1) - 0.5, ex: toX + random(-0.1, 0.1) - 0.5, ey: toY + random(-0.1, 0.1) - 0.5, t: 1 });
                            }
                        }
                    }
                }

            }
        }
    }

    for (const entity of game.entities) {
        if (entity.type === 'enemy' && entity.health <= 0) {
            if (!entity.noreward) {
                const moneyMultiplier = log(entity.effects['money'] + 2) / log(2);
                rewardMoney(entity.x, entity.y, enemies[entity.id].value * moneyMultiplier);
                game.xp += 1;
                let i = 0;
                for (const index of enemies[entity.id].spawns) {
                    spawnEnemy(index, entity.progress - i * 0.5, enemies[index].speed);
                    i += 1;
                }
            }
        } else if (entity.type === 'projectile') {
            entity.x += cos(entity.dir) * 1;
            entity.y += sin(entity.dir) * 1;

            if (entity.properties[6] > 0) {
                const target = game.entities.filter(e => e.type === 'enemy').sort((a, b) => dist(entity.x, entity.y, a.x, a.y) - dist(entity.x, entity.y, b.x, b.y))[0];
                if (target) {
                    entity.dir = angleLerp(entity.dir, atan2(entity.y - target.y,  entity.x - target.x), entity.properties[6]);
                }
            }
        }
    }
    game.entities = game.entities.filter(e => e.type !== 'enemy' || e.health > 0);
    game.entities = game.entities.filter(e => e.type !== 'projectile' || (e.hits > 0 && isWithin(e.x, e.y, 0, 0, BOARD_WIDTH, BOARD_HEIGHT)));

    for (let i = 0; i < 3; i += 1) {
        const val = (random(-1, 1) + game.minigames.stocks.bias[i] * 0.1) ** 3 * 20;
        game.minigames.stocks.current[i] += val;

        game.minigames.stocks.current[i] = max(game.minigames.stocks.current[i], 1);
        game.minigames.stocks.current[i] = min(game.minigames.stocks.current[i], 1000);
        const lowStockBonus = game.minigames.stocks.current[i] < 50 ? 1 + (50 - game.minigames.stocks.current[i]) / 50 : 1;
        game.minigames.stocks.current[i] *= lowStockBonus;


        game.minigames.stocks.history[i].push(game.minigames.stocks.current[i]);
        if (game.minigames.stocks.history[i].length > 100) {
            game.minigames.stocks.history[i].shift();
        }
    }

    if (game.running && game.toSpawn.length === 0 && game.entities.filter(e => e.type === 'enemy').length === 0) {
        endWave();
    }

    while (game.xp >= requiredXp(game.level)) {
        game.xp -= requiredXp(game.level);
        game.money += levelUpReward(game.level) * game.moneyMultiplier;
        game.level += 1;
    }

    if (game.money < 0) {
        game.money = 0;
        game.over = true;
        game.win = false;
        sounds.end.play();
        anim.over = 1;
    }

    game.tick += 1;
    game.waveTick += 1;
}

function update() {
    let dt = frameRate() === 0 ? 0 : 1 / frameRate();
    if (game.running) {
        game.acc += dt * TICK_RATE * game.speed;
    }
    while (game.acc >= 1) {
        tick();
        game.acc -= 1;
    }

    if (input.keys[SHIFT] >= 0 && input.keys['J'.charCodeAt(0)] === 30) { // shhhhh
        game.money += 1000000000;
        game.resources = game.resources.map(() => Infinity);
    }

    if (input.keys[' '.charCodeAt(0)] === 0) {
        game.selling = !game.selling;
        game.placing = null;
    }

    anim.money = lerp(anim.money, game.money, 0.1);
    anim.damage = lerp(anim.damage, 0, 0.1);
    anim.selling = lerp(anim.selling, +game.selling, 0.5);
    anim.running = lerp(anim.running, +game.running, 0.2);

    anim.zaps = anim.zaps.map(z => ({ ... z, t: lerp(z.t, 0, 0.1)})).filter(z => z.t > 0.01);

    game.numbers = game.numbers.map(n => ({ ... n, tick: n.tick + 1, xv: n.xv * 0.9, yv: n.yv * 0.9, x: n.x + n.xv, y: n.y + n.yv })).filter(n => n.tick < 60);

    if (!game.running && input.keys[ENTER] === 0) {
        startWave();
    }

    const tileX = floor(mouseX / CELL_SIZE);
    const tileY = floor(mouseY / CELL_SIZE);

    const mouseOnBoard = mouseIsWithin(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
    let animRangeTarget = 0;
    if (input.mouse[RIGHT] === 0 || input.keys[ESCAPE] === 0 || (!mouseOnBoard && input.mouse[LEFT] === 0)) {
        game.placing = null;
        game.selling = false;
    }
    if (game.selling) {
        if (input.mouse[LEFT] >= 0 && mouseOnBoard) {
            const cell = game.board[index(tileX, tileY)];
            if (cell && cell.type === 'tower') {
                const { cost, resourceCost } = calcPrices(cell.id, towerCount(cell.id) - 1);
                game.money += round(cost * SELL_RATE);
                game.resources = game.resources.map((r, i) => r + round(resourceCost[i] * SELL_RATE));
                game.board[index(tileX, tileY)] = null;
            }
        }
    }
    if (game.placing) {
        if (input.keys['R'.charCodeAt(0)] === 1 && game.placing.data.dir !== undefined) {
            game.placing.data.dir = mod(game.placing.data.dir + 1, 4);
        }
        if (((towers[game.placing.id].multiplace && input.mouse[LEFT] >= 0) || input.mouse[LEFT] === 0) && mouseOnBoard) {
            if (validPlace(tileX, tileY, game.placing.id, game.placing.data)) {
                placeTower(tileX, tileY, game.placing.id, { ... game.placing.data });
                anim.damage = 1;
                if (game.placing.id === 15) {
                    anim.end = 0.01;
                }
                if (!input.keys[SHIFT] && !towers[game.placing.id].multiplace) {
                    game.placing = null;
                }
                
            }
        }

        if (mouseOnBoard) {
            animRangeTarget = 1;
        }
    }
    if (!game.placing && !game.selling && mouseOnBoard) {
        const cell = game.board[index(tileX, tileY)];
        if (cell && cell.type === 'tower' && towers[cell.id].upgrades) {
            animRangeTarget = 1;
            const upgrades = towers[cell.id].upgrades;
            const prices = calcUpgradePrices(cell.id, cell.data.upgrades);
            let select = -1;
            if (input.keys['1'.charCodeAt(0)] === 0) {
                select = 0;
            } else if (input.keys['2'.charCodeAt(0)] === 0) {
                select = 1;
            } else if (input.keys['3'.charCodeAt(0)] === 0) {
                select = 2;
            }
            if (select !== -1 && select < upgrades.length && cell.data.upgrades[select] < upgrades[select].levels && prices[select]) {
                const { cost, resourceCost } = prices[select];
                if (game.money >= cost && resourceCost.every((r, i) => game.resources[i] >= r)) {
                    game.money -= cost;
                    game.resources = game.resources.map((r, i) => r - resourceCost[i] || 0);
                    cell.data.upgrades[select] += 1;
                    anim.damage = 1;

                }
            }
        }
    }
    anim.range = lerp(anim.range, animRangeTarget, 0.1);

    anim.xp = lerp(anim.xp, game.xp / requiredXp(game.level), 0.1);

    if (game.board.some(c => c && c.type === 'tower' && c.id === 15)) {
        anim.end *= 1.01;
        anim.end = constrain(anim.end, 0, 1);

        if (anim.end === 1) {
            sounds.end.play();
            game.over = true;
            game.win = true;
            anim.over = 1;
        }
    }
}

function drawResourcePrice(x, y, resource, count) {
    const color = colors[resource];
    fill(color);
    stroke(0);
    rect(x - 12, y, 8, 8);

    textSize(12);
    textAlign(RIGHT, TOP);
    fill(0);
    noStroke();
    text(count, x - 16, y - 1);
}

function draw() {
    if (game.over) {
        anim.over = lerp(anim.over, 0, 0.01);

        background(0);

        fill(255);
        noStroke();
        if (game.win) {
            textSize(64);
            textAlign(CENTER, CENTER);
            text('You Win!', width / 2, height / 2 - 64);
            textSize(32);
            text('thank you for playing.', width / 2, height / 2 + 64);
        } else {
            textSize(64);
            textAlign(CENTER, CENTER);
            text('IN DEBT.', width / 2, height / 2 - 64);
            textSize(32);
            text('the tax people are after you. reload to restart.', width / 2, height / 2 + 64);
        }

        stroke(255);
        noFill();
        const maxMoney = max(...game.moneyHistory);
        const minMoney = min(...game.moneyHistory);
        beginShape();
        for (let i = 0; i < game.moneyHistory.length; i += 1) {
            const x = lerp(0, width - 200, i / (game.moneyHistory.length - 1)) + 100;
            const y = map(game.moneyHistory[i], minMoney, maxMoney, height - 100, 100);
            vertex(x, y);
        }
        endShape();

        tint(255, 255 * (anim.over * 4));
        image(game.win ? winImage : loseImage, -200 - 50 * anim.over, -10 - 50 * anim.over, width + 400 + 100 * anim.over, height + 10 + 100 * anim.over);

        return;
    }

    update();
    updateInput();
    background(250);
    
    noFill();
    stroke(230);
    beginShape(LINES);
    const end = game.board.find(c => c && c.type === 'tower' && c.id === 15);
    const isEnding = !!end;
    let endX = (end?.x ?? 0) + 0.5;
    let endY = (end?.y ?? 0) + 0.5;
    for (let i = 0; i < BOARD_WIDTH; i++) {
        vertex(lerp(i * CELL_SIZE, endX * CELL_SIZE, anim.end ** 2), 0);
        vertex(lerp(i * CELL_SIZE, endX * CELL_SIZE, anim.end ** 2), BOARD_HEIGHT * CELL_SIZE);
    }
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        vertex(0, lerp(i * CELL_SIZE, endY * CELL_SIZE, anim.end ** 2));
        vertex(BOARD_WIDTH * CELL_SIZE, lerp(i * CELL_SIZE, endY * CELL_SIZE, anim.end ** 2));
    }
    endShape();

    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const ind = index(x, y);
            const cell = game.board[ind];
            const speed = isEnding ? (noise(x * 0.1, y * 0.1) * 2) + 1.5 : 0;
            const dx = isEnding ? lerp(x * CELL_SIZE, (endX - 0.5) * CELL_SIZE, pow(anim.end, speed)) : x * CELL_SIZE;
            const dy = isEnding ? lerp(y * CELL_SIZE, (endY - 0.5) * CELL_SIZE, pow(anim.end, speed)) : y * CELL_SIZE;
            if (cell) {
                if (cell.type === 'path') {
                    const next = game.board[index(x + cell.dx, y + cell.dy)];
                    if (next && next.type === 'path') {
                        stroke(100);
                        line(dx + CELL_SIZE / 2, dy + CELL_SIZE / 2, dx + cell.dx * CELL_SIZE + CELL_SIZE / 2, dy + cell.dy * CELL_SIZE + CELL_SIZE / 2);
                    }
                } else if (cell.type === 'resource') {
                    const color = colors[cell.resource];
                    fill(color);
                    stroke(0);
                    ellipse(dx + CELL_SIZE / 2, dy + CELL_SIZE / 2, CELL_SIZE - 4, CELL_SIZE - 4);
                } else if (cell.type === 'tower' && towers[cell.id].below) {
                    drawTower(cell, dx, dy);
                }
            }
        }
    }

    // draw entities
    for (const entity of game.entities) {
        if (entity.type === 'resource') {
            const color = colors[entity.resource];
            fill(color);
            stroke(0);
            const prev = game.prevEntities.find(e => e.ent === entity.ent);
            let entX = entity.x;
            let entY = entity.y;
            if (prev) {
                const prevX = prev.x;
                const prevY = prev.y;
                entX = lerp(prevX, entX, game.acc);
                entY = lerp(prevY, entY, game.acc);
            }

            if (entity.ammo) {
                beginShape();
                vertex(entX * CELL_SIZE + CELL_SIZE / 2, entY * CELL_SIZE + 6);
                vertex(entX * CELL_SIZE + 6, entY * CELL_SIZE + CELL_SIZE / 2);
                vertex(entX * CELL_SIZE + CELL_SIZE / 2, entY * CELL_SIZE + CELL_SIZE - 6);
                vertex(entX * CELL_SIZE + CELL_SIZE - 6, entY * CELL_SIZE + CELL_SIZE / 2);
                endShape(CLOSE);
            } else {
                rect(entX * CELL_SIZE + 6, entY * CELL_SIZE + 6, CELL_SIZE - 12, CELL_SIZE - 12, 2);
            }
        } else if (entity.type === 'enemy') {
            const prev = game.prevEntities.find(e => e.ent === entity.ent);
            let entX = entity.x;
            let entY = entity.y;
            if (prev) {
                const prevX = prev.x;
                const prevY = prev.y;
                entX = lerp(prevX, entX, game.acc);
                entY = lerp(prevY, entY, game.acc);
            }

            image(enemies[entity.id].image, entX * CELL_SIZE, entY * CELL_SIZE, CELL_SIZE, CELL_SIZE);

            noFill();
            stroke(0);
            rect(entX * CELL_SIZE, entY * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (entity.type === 'projectile') {
            const { x, y, dir, properties } = entity;
            const color = ammoColor(properties);
            fill(...color);

            const prev = game.prevEntities.find(e => e.ent === entity.ent);
            let entX = x;
            let entY = y;
            if (prev) {
                const prevX = prev.x;
                const prevY = prev.y;
                entX = lerp(prevX, entX, game.acc);
                entY = lerp(prevY, entY, game.acc);
            }

            triangle(
                entX * CELL_SIZE + 10 * cos(dir), entY * CELL_SIZE + 10 * sin(dir),
                entX * CELL_SIZE + 10 * cos(dir + PI - 0.8), entY * CELL_SIZE + 10 * sin(dir + PI - 0.8),
                entX * CELL_SIZE + 10 * cos(dir - PI + 0.8), entY * CELL_SIZE + 10 * sin(dir - PI + 0.8),
            );

        }
    }

    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const ind = index(x, y);
            const cell = game.board[ind];
            if (cell) {
                if (cell.type === 'tower' && !towers[cell.id].below) {
                    drawTower(cell, x * CELL_SIZE, y * CELL_SIZE);
                }
            }
        }
    }

    // power lines
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
            const ind = index(x, y);
            const cell = game.board[ind];
            if (cell && cell.type === 'tower') {
                if (cell.id === 2) {
                    const radius = towers[cell.id].range.radius;
                    for (let xx = -radius; xx <= radius; xx += 1) {
                        for (let yy = -radius; yy <= radius; yy += 1) {
                            if (round(dist(0, 0, xx, yy)) <= radius) {
                                const other = game.board[index(x + xx, y + yy)];
                                if (other && other.type === 'tower' && other.id === 3) {
                                    drawWire(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, (x + xx) * CELL_SIZE + CELL_SIZE / 2, (y + yy) * CELL_SIZE + CELL_SIZE / 2);
                                }
                            }
                        }
                    }

                } else if (cell.id === 3) {
                    const radius = towers[cell.id].range.radius;
                    for (let xx = -radius; xx <= radius; xx += 1) {
                        for (let yy = -radius; yy <= radius; yy += 1) {
                            if (round(dist(0, 0, xx, yy)) <= radius) {
                                const other = game.board[index(x + xx, y + yy)];
                                if (other && other.type === 'tower' && (towers[other.id].power.draw > 0 || other.id === 3)) {
                                    drawWire(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, (x + xx) * CELL_SIZE + CELL_SIZE / 2, (y + yy) * CELL_SIZE + CELL_SIZE / 2);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    for (const zone of game.zones) {
        switch (zone.type) {
            case 'slow': {
                fill(0, 255, 255, 20);
                stroke(0, 255, 255);
                break;
            }
            case 'damage': {
                fill(255, 0, 0, 20);
                stroke(255, 0, 0);
                break;
            }
            case 'money': {
                fill(0, 255, 0, 20);
                stroke(0, 255, 0);
                break;
            }
        }
        ellipse(zone.x * CELL_SIZE + CELL_SIZE / 2, zone.y * CELL_SIZE + CELL_SIZE / 2, zone.radius * 2 * CELL_SIZE, zone.radius * 2 * CELL_SIZE);
    }

    for (const zap of anim.zaps) {
        stroke(255, 0, 0, 255 * zap.t);
        line(zap.x * CELL_SIZE + CELL_SIZE / 2, zap.y * CELL_SIZE + CELL_SIZE / 2, zap.ex * CELL_SIZE + CELL_SIZE / 2, zap.ey * CELL_SIZE + CELL_SIZE / 2);
    }

    for (const number of game.numbers) {
        textSize(16 * (1 - (number.tick / 60) ** 3));
        textAlign(CENTER, CENTER);
        noStroke();
        textStyle(NORMAL);
        switch (number.type) {
            case 'damage': {
                fill(255 * (1 - number.tick / 60), 0, 0);
                text(`-${number.number}`, number.x, number.y);
                break;
            }
            case 'money': {
                fill(0, 255 * (1 - number.tick / 60), 0);
                text(`+$${number.number}`, number.x, number.y);
                break;
            }
        }
        
    }

    stroke(0);
    fill(100);
    rect(BASE_X * CELL_SIZE, (BASE_Y - 1.25) * CELL_SIZE, CELL_SIZE, CELL_SIZE * 3.5);
    rect((BASE_X - 1.25) * CELL_SIZE, BASE_Y * CELL_SIZE, CELL_SIZE * 3.5, CELL_SIZE);

    fill(200);
    rect((BASE_X - 1) * CELL_SIZE, (BASE_Y - 1) * CELL_SIZE, CELL_SIZE * 3, CELL_SIZE * 3);

    if (anim.selling > 0.0001) {
        noFill();
        stroke(255, 0, 0, 100 * anim.selling);
        strokeWeight(16 * anim.selling);
        rect(8 * anim.selling, 8 * anim.selling, BOARD_WIDTH * CELL_SIZE - 16 * anim.selling, BOARD_HEIGHT * CELL_SIZE - 16 * anim.selling);
    }

    strokeWeight(1);

    stroke(0);
    line(BOARD_WIDTH * CELL_SIZE, 0, BOARD_WIDTH * CELL_SIZE, height);
    line(0, BOARD_HEIGHT * CELL_SIZE, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);

    noStroke();
    textAlign(LEFT, TOP);
    textSize(32);
    fill(0);
    textStyle(BOLD);
    text('$', 6, BOARD_HEIGHT * CELL_SIZE + 10);

    const bottom = BOARD_HEIGHT * CELL_SIZE;
    const right = BOARD_WIDTH * CELL_SIZE;

    textSize(64);
    textStyle(NORMAL);
    const displayMoney = nf(round(anim.money), 12, 0);
    let zeros = true;
    for (let i = 0; i < 12; i += 1) {
        if (displayMoney[i] !== '0') {
            zeros = false;
        }
        if (zeros) {
            fill(200);
        } else {
            fill(255 * anim.damage, 0, 0);
        }
        text(displayMoney[i], i * 34 + 24, bottom + 4);
    }

    const colorIndices = [0, 1, 2, 6, 3, 4, 5, 7];
    textSize(12);
    for (let i = 0; i < 8; i += 1) {
        const color = colors[colorIndices[i]];
        const x = floor(i / 4);
        const y = i % 4;
        fill(color);
        stroke(0);
        rect(450 + x * 60, bottom + y * 14 + 8, 8, 8);

        noStroke();
        if (game.resources[colorIndices[i]] > 0) {
            fill(0);
        } else {
            fill(200);
        }

        const displayResource = nf(round(game.resources[colorIndices[i]]), 5, 0);
        zeros = true;
        for (let j = 0; j < 5; j += 1) {
            if (displayResource[j] !== '0') {
                zeros = false;
            }
            if (zeros) {
                fill(200);
            } else {
                if (anim.money < 0) {
                    fill(255, 0, 0);
                } else {
                    fill(0);
                }
            }
            text(displayResource[j], 463 + x * 60 + j * 7, bottom + y * 14 + 7);
        }
    }

    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(12);
    textStyle(BOLD);
    text(`wave ${nf(game.wave + 1, 3, 0)}   damage $${enemyDamage(game.wave)}`, 565, bottom + 5);
    text(`level ${nf(game.level, 2, 0)}   xp ${game.xp} / ${requiredXp(game.level)}`, 565, bottom + 20);
    
    textAlign(RIGHT, TOP);
    text(`+$${round(levelUpReward(game.level) * game.moneyMultiplier)}`, 750, bottom + 50);

    fill(255);
    stroke(0);
    rect(565, bottom + 35, 185, 10);
    fill(150, 100, 255);
    rect(565, bottom + 35, 185 * anim.xp, 10);


    // Shop
    for (const [i, tower] of towers.entries()) {
        const x = i % 2;
        const y = floor(i / 2);

        const xOff = x * 160 + right + 10;
        const yOff = y * 50 + 10;
        const w = 155;
        const h = 45;

        const example = makeTower(0, 0, i);
        const count = towerCount(i);
        const { cost, resourceCost } = calcPrices(i, count);

        const afford = canAfford(i);
        drawButton(xOff, yOff, w, h, '', () => {
            if (afford) {
                selectTower(i);
            }
        });

        noStroke();
        fill(255);
        rect(xOff + 5, yOff + 5, 35, 35);
        stroke(230);
        beginShape(LINES);
        vertex(xOff + 5, yOff + 5 + 5); vertex(xOff + 5 + 35, yOff + 5 + 5);
        vertex(xOff + 5, yOff + 5 + 5 + CELL_SIZE); vertex(xOff + 5 + 35, yOff + 5 + 5 + CELL_SIZE);
        vertex(xOff + 5 + 5, yOff + 5); vertex(xOff + 5 + 5, yOff + 5 + 35);
        vertex(xOff + 5 + 5 + CELL_SIZE, yOff + 5); vertex(xOff + 5 + 5 + CELL_SIZE, yOff + 5 + 35);
        endShape();

        drawTower(example, xOff + 5 + 5, yOff + 5 + 5);

        strokeWeight(1);
        stroke(0);
        noFill();
        rect(xOff + 5, yOff + 5, 35, 35);

        textSize(12);
        textStyle(BOLD);
        textAlign(LEFT, TOP);
        fill(0);
        noStroke();
        text(tower.name, xOff + 45, yOff + 5);
        

        textAlign(RIGHT, TOP);
        text(`$${cost}`, xOff + w - 5, yOff + 5);

        textStyle(NORMAL);

        let j = 0;
        for (const [i, count] of resourceCost.entries()) {
            
            if (count > 0) {
                drawResourcePrice(xOff + w - floor(j / 2) * 30, yOff + 18 + (j % 2) * 12, i, count);

                j += 1;
            }
        }

        textAlign(LEFT, TOP);
        textStyle(NORMAL);
        noStroke();
        const powerDiff = tower.power.gen - tower.power.draw;
        if (powerDiff !== 0) {
            if (powerDiff > 0) {
                fill(0, 200, 0);
            } else {
                fill(200, 0, 0);
            }
            text((powerDiff > 0 ? '+' : '') + powerDiff, xOff + 45, yOff + 18);
        }
        fill(0);
        text(count, xOff + 45, yOff + 30);

        if (!afford) {
            fill(255, 0, 0, 100);
            noStroke();
            rect(xOff, yOff, w, h);
        }
        
    }

    drawButton(right + 10, bottom, 155, 30, 'start wave (enter)', () => {
        startWave();
    });
    drawButton(right + 170, bottom, 155, 30, 'sell towers (space)', () => {
        game.selling = !game.selling;
        game.placing = null;
    });

    drawButton(right + 10, bottom + 35, 45, 25, '<', () => {
        game.speed = 0.5;
    });
    drawButton(right + 60, bottom + 35, 45, 25, '>', () => {
        game.speed = 1;
    });
    drawButton(right + 110, bottom + 35, 45, 25, '>>', () => {
        game.speed = 2;
    });
    drawButton(right + 160, bottom + 35, 45, 25, '>>>', () => {
        game.speed = 4;
    });
    drawButton(right + 210, bottom + 35, 45, 25, '>>>>', () => {
        game.speed = 16;
    });
    drawButton(right + 260, bottom + 35, 65, 25, '>>>>>', () => {
        game.speed = 200;
    });

    // minigames

    drawButton(right + 10, 410, 155, 15, 'stocks', () => {
        game.currentMinigame = 'stocks';
    });
    drawButton(right + 170, 410, 155, 15, 'blackjack', () => {
        game.currentMinigame = 'blackjack';
    });

    if (game.currentMinigame === 'stocks') {
        const concatNews = '   ' + game.minigames.stocks.news.join('   ') + '   ';
        textSize(12);
        textAlign(LEFT, TOP);
        fill(0);
        noStroke();
        const off = mod(millis() / 200, concatNews.length);
        const slice = (concatNews + concatNews).slice(off, off + 47);
        text(slice, right + 10, 430);

        for (let i = 0; i < 3; i += 1) {
            const y = 450 + i * 40;
            const name = corps[i];
            const current = game.minigames.stocks.current[i];
            const bought = game.minigames.stocks.bought[i];
            const history = game.minigames.stocks.history[i];
            const minv = min(...history, 0);
            const maxv = max(...history, 200);

            const upticks = [];
            const downticks = [];
            for (let j = 1; j < history.length; j += 1) {
                if (history[j - 1] <= history[j]) {
                    upticks.push(j);
                } else {
                    downticks.push(j);
                }
            }
            noFill();
            stroke(0);
            rect(right + 10, y, 155, 30);

            function drawTick(tick) {
                const val = history[tick];
                const prev = history[tick - 1];
                const x = map(tick, 0, history.length - 1, right + 10, right + 10 + 155);
                const ny = map(val, minv, maxv, y + 30, y);
                const py = map(prev, minv, maxv, y + 30, y);
                vertex(x, py);
                vertex(x, ny);
            }
            stroke(0, 255, 0);
            beginShape(LINES);
            for (const tick of upticks) {
                drawTick(tick);
            }
            endShape();
            stroke(255, 0, 0);
            beginShape(LINES);
            for (const tick of downticks) {
                drawTick(tick);
            }
            endShape();
            strokeWeight(1);

            textStyle(BOLD);
            textAlign(LEFT, TOP);
            fill(0);
            noStroke();
            text(`${name} (${bought}: $${round(bought * current)})`, right + 170, y);

            textStyle(NORMAL);
            textAlign(RIGHT, TOP);
            text(`$${round(current)}`, right + 320, y);

            drawButton(right + 170, y + 15, 20, 15, 'sM', () => {
                sellStock(i, bought);
            });
            drawButton(right + 195, y + 15, 25, 15, 's10', () => {
                sellStock(i, 10);
            });
            drawButton(right + 225, y + 15, 20, 15, 's1', () => {
                sellStock(i, 1);
            });
            drawButton(right + 250, y + 15, 20, 15, 'b1', () => {
                buyStock(i, 1);
            });
            drawButton(right + 275, y + 15, 25, 15, 'b10', () => {
                buyStock(i, 10);
            });
            drawButton(right + 305, y + 15, 20, 15, 'bM', () => {
                buyStock(i, floor(game.money / current));
            });
        }

    } else if (game.currentMinigame === 'blackjack') {
        function drawCard(card, x, y) {
            const [value, suit] = card;
            fill(255);
            stroke(0);
            rect(x, y, 20, 30, 2);

            switch (suit) {
                case 's': {
                    fill(0);
                    noStroke();
                    textSize(12);
                    textAlign(CENTER, TOP);
                    text('♠', x + 10, y);
                    text('♠', x + 10, y + 30 - 10);
                    break;
                }
                case 'h': {
                    fill(255, 0, 0);
                    noStroke();
                    textSize(12);
                    textAlign(CENTER, TOP);
                    text('♥', x + 10, y);
                    text('♥', x + 10, y + 30 - 10);
                    break;
                }
                case 'c': {
                    fill(0);
                    noStroke();
                    textSize(12);
                    textAlign(CENTER, TOP);
                    text('♣', x + 10, y);
                    text('♣', x + 10, y + 30 - 10);
                    break;
                }
                case 'd': {
                    fill(255, 0, 0);
                    noStroke();
                    textSize(12);
                    textAlign(CENTER, TOP);
                    text('♦', x + 10, y);
                    text('♦', x + 10, y + 30 - 10);
                    break;
                }
            }
            textSize(12);
            textAlign(CENTER, TOP);
            fill(0);
            noStroke();
            text(value === 'X' ? '10' : value, x + 10, y + 10);
        }

        function drawCardBack(x, y) {
            fill(100, 100, 200);
            stroke(0);
            rect(x, y, 20, 30, 2);
        }

        textAlign(LEFT, TOP);
        fill(0);
        noStroke();
        textSize(12);
        textStyle(BOLD);
        text(`blackjack (bet $${game.minigames.blackjack.bet})`, right + 10, 430);

        textStyle(BOLD);
        textAlign(RIGHT, TOP);
        text('dealer', right + 325, 440);

        textAlign(LEFT, TOP);
        textStyle(NORMAL);
        text(game.minigames.blackjack.message, right + 170, 430);
        if (!game.minigames.blackjack.playing) {
            let i = 0;
            for (const card of game.minigames.blackjack.dealer) {
                drawCard(card, right + 305 - 25 * i, 455);
                i += 1;
            }
        } else {
            drawCardBack(right + 305, 460);
            drawCard(game.minigames.blackjack.dealer[1], right + 280, 460);
        }

        for (const [index, hand] of game.minigames.blackjack.hands.entries()) {
            const x = (index % 2) * 140 + right + 10;
            const y = floor(index / 2) * 67 + 442;

            noStroke();
            fill(0);
            textAlign(LEFT, TOP);
            textStyle(NORMAL);
            text(hand.message, x, y);
            let i = 0;
            for (const card of hand.cards) {
                drawCard(card, x + 25 * i, y + 15);
                i += 1;
            }
            i = 0;
            for (const action of turnOptions(hand)) {
                drawButton(x + 25 * i, y + 50, 20, 15, action, () => {
                    makeBlackjackMove(action, index);
                });
                i += 1;
            }
        }

        textAlign(LEFT, TOP);
        if (!game.minigames.blackjack.playing) {
            textStyle(NORMAL);
            text(`bet: $${game.minigames.blackjack.bet}`, right + 10, 540);

            drawButton(right + 100, 537, 15, 15, '0', () => {
                game.minigames.blackjack.bet = 0;
            });
            drawButton(right + 120, 537, 30, 15, 'min', () => {
                game.minigames.blackjack.bet = 100;
            });
            drawButton(right + 155, 537, 25, 15, '100', () => {
                game.minigames.blackjack.bet += 100;
            });
            drawButton(right + 185, 537, 20, 15, '1k', () => {
                game.minigames.blackjack.bet += 1000;
            });
            drawButton(right + 210, 537, 25, 15, '1m', () => {
                game.minigames.blackjack.bet += 1000000;
            });
            drawButton(right + 240, 537, 20, 15, '1%', () => {
                game.minigames.blackjack.bet += floor(game.money / 100);
            });
            drawButton(right + 265, 537, 25, 15, '10%', () => {
                game.minigames.blackjack.bet += floor(game.money / 10);
            });
            drawButton(right + 295, 537, 30, 15, 'max', () => {
                game.minigames.blackjack.bet += game.money;
            });

            if (game.minigames.blackjack.bet > game.money) {
                game.minigames.blackjack.bet = game.money;
            }
            if (game.minigames.blackjack.bet >= 100) {
                drawButton(right + 270, 557, 55, 15, 'deal', () => {
                    newBlackjack();
                });
            }
        }
    }

    // other stuff

    if (anim.running < 0.9999) {
        noStroke();
        fill(0, 20 * (1 - anim.running));
        rect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);

    }

    const tileX = floor(mouseX / CELL_SIZE);
    const tileY = floor(mouseY / CELL_SIZE);
    if (game.placing && mouseIsWithin(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)) {
        drawTower(game.placing, tileX * CELL_SIZE, tileY * CELL_SIZE);
        const tower = towers[game.placing.id];
        if (tower.range) {
            const { radius, color } = tower.range;
            stroke(... color);
            drawDottedCircle(4, tileX * CELL_SIZE + CELL_SIZE / 2, tileY * CELL_SIZE + CELL_SIZE / 2, radius * CELL_SIZE * anim.range, 1);
        }
        if (tower.placeRules) {
            for (const rule of tower.placeRules) {
                const [ dx, dy ] = rotateRelative(... rule.relative, game.placing.data.dir || 0);
                const posX = tileX + dx;
                const posY = tileY + dy;
                const tile = game.board[index(posX, posY)];
                
                function drawSelector() {
                    beginShape(LINES);
                    vertex(posX * CELL_SIZE, posY * CELL_SIZE); vertex(posX * CELL_SIZE + CELL_SIZE / 4, posY * CELL_SIZE);
                    vertex(posX * CELL_SIZE, posY * CELL_SIZE); vertex(posX * CELL_SIZE, posY * CELL_SIZE + CELL_SIZE / 4);

                    vertex(posX * CELL_SIZE + CELL_SIZE, posY * CELL_SIZE); vertex(posX * CELL_SIZE + CELL_SIZE - CELL_SIZE / 4, posY * CELL_SIZE);
                    vertex(posX * CELL_SIZE + CELL_SIZE, posY * CELL_SIZE); vertex(posX * CELL_SIZE + CELL_SIZE, posY * CELL_SIZE + CELL_SIZE / 4);

                    vertex(posX * CELL_SIZE, posY * CELL_SIZE + CELL_SIZE); vertex(posX * CELL_SIZE + CELL_SIZE / 4, posY * CELL_SIZE + CELL_SIZE);
                    vertex(posX * CELL_SIZE, posY * CELL_SIZE + CELL_SIZE); vertex(posX * CELL_SIZE, posY * CELL_SIZE + CELL_SIZE - CELL_SIZE / 4);

                    vertex(posX * CELL_SIZE + CELL_SIZE, posY * CELL_SIZE + CELL_SIZE); vertex(posX * CELL_SIZE + CELL_SIZE - CELL_SIZE / 4, posY * CELL_SIZE + CELL_SIZE);
                    vertex(posX * CELL_SIZE + CELL_SIZE, posY * CELL_SIZE + CELL_SIZE); vertex(posX * CELL_SIZE + CELL_SIZE, posY * CELL_SIZE + CELL_SIZE - CELL_SIZE / 4);
                    endShape();
                }
                strokeWeight(4);
                if (tile && tile.type === rule.type) {
                    stroke(0, 200, 200);
                } else {
                    stroke(200, 0, 0);
                }
                drawSelector();
                strokeWeight(2);
                if (tile && tile.type === rule.type) {
                    stroke(0, 255, 255);
                } else {
                    stroke(255, 0, 0);
                }
                drawSelector();
                strokeWeight(1);
            }
        }
        if (!validPlace(tileX, tileY, game.placing.id, game.placing.data )) {
            fill(255, 0, 0, 100);
            noStroke();
            rect(tileX * CELL_SIZE, tileY * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        
        for (let y = 0; y < BOARD_HEIGHT; y += 1) {
            for (let x = 0; x < BOARD_WIDTH; x += 1) {
                const cell = game.board[index(x, y)];
                
                if (cell && cell.type === 'tower') {
                    const radius = towerRange(cell.id, cell.data);
                    if (radius) {
                        const { color } = towers[cell.id].range;
                        stroke(... color);
                        drawDottedCircle(4, x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, radius * CELL_SIZE * anim.range, 1);
                    }
                }
            }
        }
    }
    if (game.selling && mouseIsWithin(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)) {
        stroke(255, 0, 0, 100);
        noFill();
        rect(tileX * CELL_SIZE - 4, tileY * CELL_SIZE - 4, CELL_SIZE + 8, CELL_SIZE + 8);
        const cell = game.board[index(tileX, tileY)];
        if (cell && cell.type === 'tower') {
            const { cost, resourceCost } = calcPrices(cell.id, towerCount(cell.id) - 1);
            textSize(12);
            textAlign(RIGHT, TOP);
            fill(0);
            noStroke();
            textStyle(BOLD);
            text(`+$${cost}`, tileX * CELL_SIZE - 4, tileY * CELL_SIZE - 16);
            textStyle(NORMAL);
            let j = 0;
            for (const [i, count] of resourceCost.entries()) {
                if (count > 0) {
                    drawResourcePrice(tileX * CELL_SIZE, tileY * CELL_SIZE - 4 - j * 12, i, count);
                    j += 1;
                }
            }
        }
    }

    if (!game.selling && !game.placing && mouseIsWithin(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)) {
        const cell = game.board[index(tileX, tileY)];
        if (cell && cell.type === 'tower' && towers[cell.id].upgrades) {
            if (towers[cell.id].range) {
                
                const radius = towerRange(cell.id, cell.data);
                const { color } = towers[cell.id].range;
                stroke(... color);
                drawDottedCircle(4, tileX * CELL_SIZE + CELL_SIZE / 2, tileY * CELL_SIZE + CELL_SIZE / 2, radius * CELL_SIZE * anim.range, 1);
            }

            const upgrades = towers[cell.id].upgrades;
            const height = 1 + upgrades.length * 2;
            const width = 6;
            const panelX = (tileX > BOARD_WIDTH / 2 ? tileX - width - 1 : tileX + 2) * CELL_SIZE;
            const panelY = (tileY > BOARD_HEIGHT / 2 ? tileY - height - 1 : tileY + 2) * CELL_SIZE;
            
            fill(250);
            stroke(0);
            rect(panelX, panelY, width * CELL_SIZE, height * CELL_SIZE);
            
            fill(0);
            noStroke();
            textSize(12);
            textAlign(LEFT, TOP);
            textStyle(BOLD);
            text(towers[cell.id].name, panelX + 5, panelY + 5);

            textStyle(NORMAL);
            if (cell.id === 2) { // generator
                text(`pwr: ${towers[cell.id].power.gen * (cell.data.upgrades[0] + 1)}`, panelX + 5, panelY + 16);
            } else if (cell.id === 8) { // zapper
                const damage = towers[cell.id].defense.damage * pow(2, cell.data.upgrades[0]);
                const fireRate = towers[cell.id].defense.rate - cell.data.upgrades[1];
                text(`dpt: ${round(damage / fireRate)}`, panelX + 5, panelY + 16);
            }
            
            const prices = calcUpgradePrices(cell.id, cell.data.upgrades);
            for (let i = 0; i < upgrades.length; i += 1) {
                fill(0);
                noStroke();
                textStyle(NORMAL);
                textAlign(LEFT, TOP);
                text(`[${i + 1}] ${upgrades[i].name}`, panelX + 5, panelY + 5 + (i + 0.5) * CELL_SIZE * 2);

                let progress = cell.data.upgrades[i] / upgrades[i].levels;
                fill(0);
                rect(panelX + 5, panelY + 5 + (i + 0.8) * CELL_SIZE * 2, width * CELL_SIZE - 10, 12);
                fill(255);
                rect(panelX + 6, panelY + 6 + (i + 0.8) * CELL_SIZE * 2, (width * CELL_SIZE - 12) * progress, 10);

                stroke(0);
                beginShape(LINES);
                for (let j = 0; j < upgrades[i].levels - 1; j += 1) {
                    const x = panelX + 5 + (j + 1) * (width * CELL_SIZE - 10) / (upgrades[i].levels);
                    vertex(x, panelY + 5 + (i + 0.8) * CELL_SIZE * 2 + 1);
                    vertex(x, panelY + 5 + (i + 0.8) * CELL_SIZE * 2 + 11);
                }
                endShape();
                noStroke();

                if (cell.data.upgrades[i] >= upgrades[i].levels) {
                    fill(0, 200, 0);
                    noStroke();
                    textAlign(CENTER, TOP);
                    textStyle(BOLD);
                    text('MAX', panelX + width * CELL_SIZE / 2, panelY + 5 + (i + 1.1) * CELL_SIZE * 2);
                } else {
                    textStyle(BOLD);
                    textAlign(LEFT, TOP);
                    fill(0);
                    noStroke();
                    text(`$${prices[i].cost}`, panelX + 5, panelY + 5 + (i + 1.1) * CELL_SIZE * 2);
                    let j = 0;
                    textStyle(NORMAL);
                    for (const [r, count] of prices[i].resourceCost.entries()) {
                        if (count > 0) {
                            drawResourcePrice(panelX + width * CELL_SIZE - j * 30 - 2, panelY + 5 + (i + 1.1) * CELL_SIZE * 2, r, count);
                            j += 1;
                        }
                    }
                }
            }
        }
    }


    if (Object.keys(input.mouse).length === 0) {
        fill(0);
        noStroke();
        textAlign(LEFT, TOP);
        textStyle(BOLD);
        textSize(32);
        text('milo.td', 16, 16);
        textSize(16);
        textStyle(NORMAL);
        text('a game for a friend,', 16, 48);
        text('a spiritual successor to thomas tower defense,', 16, 64);
        text('and a classic example of too much effort', 16, 80);

        text('by harper k davis', 16, 112);
    }
    
}