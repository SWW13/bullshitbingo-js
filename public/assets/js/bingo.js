var dom = {
    content: document.getElementById('content')
};

var games = [
    {id: 'uuid', name: "Round 1", width: 5, height: 5, players: ['User A', 'User B'], stage: 'words', words: ['Word A', 'Word B']}
];
var words = [
    {name: 'Word 1', user: 'User A'},
    {name: 'Word 2', user: 'User B'},
    {name: 'Word 3', user: 'User C'},
    {name: 'Word 4', user: 'User A'},
    {name: 'Word 5', user: 'User C'}
];
var lines = [
    [
        {name: 'Word 1', user: 'User A'},
        {name: 'Word 2', user: 'User B', 'class': 'primary'},
        {name: 'Word 3', user: 'User C'},
        {name: 'Word 4', user: 'User A'},
        {name: 'Word 5', user: 'User C'}
    ],
    [
        {name: 'Word 1', user: 'User A'},
        {name: 'Word 2', user: 'User B'},
        {name: 'Word 3', user: 'User C'},
        {name: 'Word 4', user: 'User A', 'class': 'info'},
        {name: 'Word 5', user: 'User C', 'class': 'primary'}
    ],
    [
        {name: 'Word 1', user: 'User A', 'class': 'warning'},
        {name: 'Word 2', user: 'User B'},
        {name: 'Word 3', user: 'User C'},
        {name: 'Word 4', user: 'User A'},
        {name: 'Word 5', user: 'User C'}
    ],
    [
        {name: 'Word 1', user: 'User A'},
        {name: 'Word 2', user: 'User B'},
        {name: 'Word 3', user: 'User C', 'class': 'danger'},
        {name: 'Word 4', user: 'User A', 'class': 'primary'},
        {name: 'Word 5', user: 'User C'}
    ],
    [
        {name: 'Word 1', user: 'User A'},
        {name: 'Word 2', user: 'User B', 'class': 'primary'},
        {name: 'Word 3', user: 'User C'},
        {name: 'Word 4', user: 'User A'},
        {name: 'Word 5', user: 'User C', 'class': 'primary'}
    ]
];
var players = [
    {id: 'uuid', name: 'User A', lines: lines},
    {id: 'uuid', name: 'User B', lines: lines, status: 'info'},
    {id: 'uuid', name: 'User C', lines: lines, status: 'warning'},
    {id: 'uuid', name: 'User D', lines: lines, status: 'danger'},
    {id: 'uuid', name: 'User E', lines: lines}
];

dom.content.innerHTML = templates['create-game'].render({username: ''});
dom.content.innerHTML += templates['game-list'].render({games: games});
dom.content.innerHTML += templates['word-list'].render({words: words});
dom.content.innerHTML += templates['bingo-board'].render({lines: lines});
dom.content.innerHTML += templates['bingo-board-other'].render({players: players});