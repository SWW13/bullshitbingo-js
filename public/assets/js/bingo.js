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

dom.content.innerHTML = templates['create-game'].render({username: ''});
dom.content.innerHTML += templates['game-list'].render({games: games});
dom.content.innerHTML += templates['word-list'].render({words: words});