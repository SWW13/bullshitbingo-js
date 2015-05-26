# bullshitbingo-js
HTML5 / NodeJS Bullshitbingo


# config
copy ```config/default.json``` to ```config/production.json``` and edit ```config/production.json```

edit ```public/assets/js/config.js``` to match ```config/production.json```


# install / run
install npm packages
```npm install```

run server
```
export NODE_ENV=production
npm start
```


# development
compile templates
```
npm run install-dev
npm run compile
```
