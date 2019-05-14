const { Plugin } = require('powercord/entities');
const { React } = require('powercord/webpack');

const Settings = require('./Settings');

module.exports = class WallpaperChanger extends Plugin {
  startPlugin () {
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'wallch-css';
    document.head.appendChild(this.styleElement);

    this.interval = setInterval(() => this.changeWallpaper(), this.settings.get('interval', 60) * 60 * 1000);
    this.changeWallpaper();

    this.registerSettings('wallpaper-changer', 'Wallpaper Changer', props => React.createElement(Settings, {
      ...props,
      plugin: this
    }));

    this.registerCommand(
      'wpshare',
      [ 'wps' ],
      'Sends the link of the current wallpaper in the chat',
      '{c} [--no-embed]',
      (args) => (this.wallpaper && {
        send: true,
        result: args[0] === '--no-embed' ? `<${this.wallpaper}>` : this.wallpaper
      })
    );
  }

  pluginWillUnload () {
    document.querySelector('#wallch-css').remove();
    clearInterval(this.interval);
  }

  updateInterval () {
    clearInterval(this.interval);
    this.interval = setInterval(() => this.changeWallpaper(), this.settings.get('interval', 60) * 60 * 1000);
  }

  async changeWallpaper () {
    console.log('changing')
    this.wallpaper = null;
    const wallpapers = this.settings.get('wallpapers', []);
    if (wallpapers.length === 0) {
      console.log('lol')
      this.styleElement.innerText = '';
      return;
    }
    console.log('ok')

    this.wallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
    const selector = this.settings.get('selector', 'body');
    this.styleElement.innerText = `${selector} { background-image: url('${encodeURI(this.wallpaper)}') }`;
    console.log('???')
  }
};
