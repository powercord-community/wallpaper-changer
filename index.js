/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { React, channels, getModule } = require('powercord/webpack');
const { Plugin } = require('powercord/entities');
const { get } = require('powercord/http');

const Settings = require('./Settings');

module.exports = class WallpaperChanger extends Plugin {
  async startPlugin () {
    const channelStore = await getModule([ 'getChannel', 'getDMFromUserId' ]);

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'wallch-css';
    document.head.appendChild(this.styleElement);

    this.interval = setInterval(() => this.changeWallpaper(), this.settings.get('interval', 60) * 60 * 1000);
    this.changeWallpaper();

    powercord.api.settings.registerSettings('wallpaper-changer', {
      category: this.entityID,
      label: 'Wallpaper Changer',
      render: props => React.createElement(Settings, {
        ...props,
        plugin: this
      })
    });

    powercord.api.commands.registerCommand({
      command: 'wpshare',
      aliases: [ 'wps' ],
      description: 'Sends the link of the current wallpaper in the chat',
      usage: '{c} [--no-embed]',
      executor: (args) => {
        if (this.wallpaper) {
          const chanId = channels.getChannelId();
          const channel = channelStore.getChannel(chanId);
          if (this.wallpaper.nsfw && !channel.nsfw && !args.includes('--force')) {
            return {
              send: false,
              result: 'NSFW in a non-nsfw channel, are you sure? Use --force to send anyway.'
            };
          }
          return {
            send: true,
            result: args.includes('--no-embed') ? `<${this.wallpaper.src}>` : this.wallpaper.src
          };
        }
      }
    });

    powercord.api.commands.registerCommand({
      command: 'wpnext',
      aliases: [ 'wpn' ],
      description: 'Changes the wallpaper',
      usage: '{c}',
      executor: this.changeWallpaper.bind(this)
    });
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('wallpaper-changer');
    powercord.api.commands.unregisterCommand('wpnext');
    powercord.api.commands.unregisterCommand('wpshare');
    document.querySelector('#wallch-css').remove();
    clearInterval(this.interval);
  }

  updateInterval () {
    clearInterval(this.interval);
    this.interval = setInterval(() => this.changeWallpaper(), this.settings.get('interval', 60) * 60 * 1000);
  }

  async changeWallpaper () {
    this.wallpaper = null;
    let wallpapers = [];
    switch (this.settings.get('source', 0)) {
      case 0:
        wallpapers = this.settings.get('wallpapers', []).map(w => ({
          src: w,
          nsfw: false
        }));
        break;
      case 1:
        /* eslint-disable */
        const cat = (
          (this.settings.get('wallhaven-c-gen', true) ? '1' : '0') +
          (this.settings.get('wallhaven-c-weeb', true) ? '1' : '0') +
          (this.settings.get('wallhaven-c-ppl', true) ? '1' : '0')
        );
        const pur = (
          (this.settings.get('wallhaven-p-sfw', true) ? '1' : '0') +
          (this.settings.get('wallhaven-p-uwu', true) ? '1' : '0') +
          ((this.settings.get('wallhaven-p-nsfw', true) && !!this.settings.get('wallhaven-key', '')) ? '1' : '0')
        );
        const search = encodeURIComponent(this.settings.get('wallhaven-search', ''));
        const api = !!this.settings.get('wallhaven-key', '') ? `&apikey=${this.settings.get('wallhaven-key')}` : '';
        const url = `https://wallhaven.cc/api/v1/search?q=${search}&categories=${cat}&purity=${pur}&sorting=random${api}`;
        wallpapers = ((await get(url).then(res => res.body)).data || []).map(w => ({
          src: w.path,
          nsfw: w.purity === 'nsfw'
        }));
        break;
      /* eslint-enable */
    }

    if (wallpapers.length === 0) {
      this.styleElement.innerText = '';
      return;
    }

    this.wallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
    const selector = this.settings.get('selector', 'body');
    this.styleElement.innerText = `${selector} { background-image: url('${encodeURI(this.wallpaper.src)}') !important }`;
  }
};
