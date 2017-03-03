'use strict';

const {app, BrowserWindow, Menu, shell, ipc} = require('electron');
// import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

var fs = require('fs');
var path = require('path');


//require('crash-reporter').start();

if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
  const path = require('path'); // eslint-disable-line
  const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
  require('module').globalPaths.push(p); // eslint-disable-line
}


app.on('ready', function(){
  var mainWindow = new BrowserWindow({
    'width': 1000,
    'height': 600,
    'minWidth': 1000,
    'minHeight': 600,
    'resizable': true,
    'standard-window': false,
    // 'fullscreen': false,
    'frame': false,
    'show': false,
  });
  mainWindow.loadURL(path.normalize('file://' + path.join(__dirname, 'index.html')));

  app.on('activate-with-no-open-windows', function () {
    if (mainWindow) {
      mainWindow.show();
    }
    return false;
  });

  app.on('before-quit', function() {
    mainWindow.webContents.send('yoda:quit');
  });

  mainWindow.webContents.on('new-window', function (e) {
    e.preventDefault();
  });

  mainWindow.on('focus', function(){
    mainWindow.webContents.send('yoda:focus');
  });

  mainWindow.on('blur', function(){
    mainWindow.webContents.send('yoda:blur');
  });

  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.setTitle('Yoda');
    mainWindow.show();
    mainWindow.focus();
  });


  if (process.env.NODE_ENV !== 'production') {

    //   mainWindow.openDevTools(); // already does this...?

      mainWindow.webContents.on('context-menu', (e, props) => {
          const { x, y } = props;

          Menu.buildFromTemplate([{
              label: 'Inspect element',
              click() { mainWindow.inspectElement(x, y); }
          }]).popup(mainWindow);
      });




    //   installExtension(REACT_DEVELOPER_TOOLS)
    //       .then((name) => console.log(`Added Extension:  ${name}`))
    //       .catch((err) => console.log('An error occurred: ', err));

  }

});
// app.on('window-all-closed', function() {
//   if (process.platform != 'darwin')
//     app.quit();
// });
