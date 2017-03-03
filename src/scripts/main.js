'use strict';

import electron from 'electron';
import React from 'react';
import Join from 'react/lib/joinClasses';
import Router from 'react-router';
import RouterContainer from './Router';
import Utils from './Utils';
import routes from './AppRoutes';
import fs from 'fs';
import Constants from './Constants';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

var ipc = electron.ipcRenderer;
var remote = electron.remote;
let Menu = remote.Menu;
let MenuTemplate = Utils.menu();
let AppMenuTemplate = Menu.buildFromTemplate(MenuTemplate);
Menu.setApplicationMenu(AppMenuTemplate);


var installReactDevtools = null;

if (process.env.NODE_ENV === 'development') {
  // installReactDevtools = require('electron-react-devtools');
  // installExtension = require('electron-devtools-installer');
}

function bootstrap(){
  Utils.inspect();
  Utils.addLiveReload();
  Utils.disableGlobalBackspace();
  Menu.setApplicationMenu(AppMenuTemplate);

  let mountNode = document.body.children[0];
  let AppRouter = Router.create({
    routes: routes
  });

  ipc.on('yoda:quit', (event, data) => {
    localStorage.removeItem('channels');
  });

  ipc.on('yoda:focus', (event, data) => {
    mountNode.className = 'app-container';
  });

  ipc.on('yoda:blur', (event, data) => {
    mountNode.className += ' app-blur';
  });

  AppRouter.run((Root, state) => {
    var params = state.params;
    React.render(<Root params={params} />, mountNode);
  });
  RouterContainer.set(AppRouter);

  if (process.env.NODE_ENV !== 'production') {
    // installReactDevtools.inject();
    // installReactDevtools.install();
      installExtension(REACT_DEVELOPER_TOOLS)
          .then((name) => console.log(`Added Extension:  ${name}`))
          .catch((err) => console.log('An error occurred: ', err));
  }

  // this.initVideoCache();
  let videoCache = remote.app.getPath('userData') + '/' + Constants.app.videoCacheFolder;
  if (!fs.existsSync(videoCache)) {
      fs.mkdirSync(videoCache);
  }
}

function initVideoCache(){
    let videoCache = remote.app.getPath('userData') + '/' + Constants.app.videoCacheFolder;
    if (!fs.existsSync(videoCache)) {
        fs.mkdirSync(videoCache);
    }

}

Promise.all([
  new Promise((resolve) => {
    if (window.addEventListener) {
      window.addEventListener('DOMContentLoaded', resolve);
    } else {
      window.attachEvent('onload', resolve);
    }
  })
]).then(bootstrap);
