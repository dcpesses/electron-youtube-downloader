'use strict';

import electron from 'electron';
import Immutable from 'immutable';

import ytdl from 'ytdl-core';
import sfx from 'sfx';
import path from 'path';
import fs from 'fs';
import Constants from './Constants';

const App = electron.remote.app;
const Dialog = electron.remote.dialog;
const Shell = electron.remote.shell;

export default {
  parse(obj) {
    let parsed = JSON.parse(obj);
    if(parsed !== null){
      return Immutable.fromJS(parsed).get('DownloadsStore');
    }
    return null;
  },

  home() {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  },

  filepath(filename) {
    return this.home() + '/Desktop/' + filename + '.mp4';
  },

  cachepath(filename) {
    return App.getPath('userData') + '/' + Constants.app.videoCacheFolder + (filename ? '/'+filename+'.mp4' : '');
  },

  verify(id) {
    let downloads = this.parse(localStorage.getItem('downloads'));
    if(downloads !== null){
      let videos = downloads.map(download => {
        return download.get('id');
      });
      if(videos.toArray().indexOf(id) > -1){
        return false;
      }
    }
    return true;
  },

  prompt(item) {
    let self = this;
    return new Promise(resolve => {
      Dialog.showSaveDialog({
        title: 'Download video',
        defaultPath: self.filepath(item.snippet.title)
      }, function(filename){
          console.log(filename);
          if(filename !== undefined && item){
            resolve({ok: true, filename: filename});
          } else {
            resolve({ok: false, filename: null});
          }
        });
      });
  },

  cache(item) {
    let self = this;

    return new Promise(resolve => {
      console.log(self.cachepath(item.id));
      console.log(item);
      Dialog.showMessageBox({
        title: 'Download',
        message: 'Download video "' + item.snippet.title + '"?',
        // message: self.filepath(item.snippet.title),
        buttons: ['Cancel', 'OK'],
        type: 'question'
    }, function(value){
          let filename = self.cachepath(item.id);
          console.log(filename);
          if(filename !== undefined && value === 1){
            resolve({ok: true, filename: filename});
          } else {
            resolve({ok: false, filename: null});
          }
        });
      });
  },

  download(video, filename) {
    let url = `http://youtube.com/watch?v=${video.id}`;
    let writeStream = fs.createWriteStream(filename);
    let readStream = ytdl(url, {});

    return new Promise((resolve, reject) => {
      // error handler must be created before piping
      readStream.on('error', err => {
        console.log(err);
        Dialog.showMessageBox({
          type: 'warning',
          buttons: ['Ok'],
          title: 'Error',
          message: 'The video cannot be downloaded.'
        });
        reject(err);
      });

      readStream.pipe(writeStream);

      let download = {
        id: video.id,
        title: video.snippet.title,
        path: filename,
        stream: readStream
      };

      resolve(download);
    });
  },

  delete(item) {
      let self = this;
      let downloads = this.parse(localStorage.getItem('downloads'));
      let video = downloads.find(download => {
        return download.get('id') === item.id;
      });

      fs.unlink(item.path, err => {
        console.log('unable to delete file');
        console.log(err);
        reject(err);
      });

      this.save('downloads', downloads.filter(download => {
        return download.get('id') !== item.id;
      }));

  },

  duplicate(item) {
    let downloads = this.parse(localStorage.getItem('downloads'));
    let video = downloads.find(download => {
      return download.get('id') === item.id;
    });
    console.log(video.get('done'));
    let message = (video.get('done') ? 'The video has already been downloaded.' : 'The video is currently being downloaded.');

    return new Promise(resolve => {
      Dialog.showMessageBox({
        type: 'info',
        buttons: ['Go to downloads', 'Cancel'],
        message: message
      }, function(res){
        if(res === 0){
          if(!video.get('done')){
            resolve('active');
          }
          resolve('complete');
        }
      });
    });
  },

  live(id) {
    Dialog.showMessageBox({
      type: 'warning',
      buttons: ['Watch on youtube', 'Cancel'],
      title: 'Live broadcast content',
      message: 'Live or Upcoming videos cannot be downloaded.'
    }, function(res){
      if(res === 0){
        Shell.openExternal('http://youtube.com/watch?v=' + id);
      }
    });
  },

  show(filepath) {
    if(!fs.existsSync(filepath)){
      Dialog.showMessageBox({
        type: 'warning',
        buttons: ['Ok'],
        title: 'Video not found',
        message: 'The video must have been moved or deleted.'
      });
    } else {
      Shell.showItemInFolder(filepath);
    }
  },

  save(store, state) {
    localStorage.setItem(store, state);
  },

  load(store) {
    return localStorage.getItem(store);
  },

  clear() {
    let downloads = this.parse(localStorage.getItem('downloads'));
    let ids = downloads.filter(download => download.get('done') === true)
                        .map(download => download.get('id'))
    return Promise.resolve(ids);
  },

  remove(id) {
    let downloads = this.parse(localStorage.getItem('downloads'));
    let ids = downloads.filter(download => download.get('id') === id)
                        .map(download => download.get('id'))
    console.log(ids);
    return Promise.resolve(ids);
  },

  notify() {
    sfx.glass();
  }
};
