'use strict';

const {app, BrowserWindow, Menu, shell, ipc} = require('electron');

var fs = require('fs');
var path = require('path');

//require('crash-reporter').start();

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

  }

});
// app.on('window-all-closed', function() {
//   if (process.platform != 'darwin')
//     app.quit();
// });
