var dom = {
    content: document.getElementById('content')
};

dom.content.innerHTML = templates['home'].render({username: ''});
