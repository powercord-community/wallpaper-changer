const { React } = require('powercord/webpack');
const { RadioGroup, TextInput, ButtonItem, Category, SliderInput, SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);
    this.render_key = 0;
    this.state = {
      editing: false
    };
  }

  render () {
    return (
      <div>
        <RadioGroup
          onChange={e => this.props.updateSetting('source', e.value)}
          value={this.props.getSetting('source', 0)}
          options={[
            {
              name: 'Manual',
              desc: 'Manually add your own favorite wallpapers.',
              value: 0
            },
            {
              name: 'Wallhaven',
              desc: <>Pull wallpapers from <a href='https://wallhaven.cc' target="_blank" onClick={e => e.stopPropagation()}>wallhaven.cc</a>.</>,
              value: 1
            }
          ]}
        >
          Wallpapers Source
        </RadioGroup>
        {this.props.getSetting('source', 0) === 0
          ? <>
            <Category
              name='Wallpapers'
              description='List of wallpapers you want to use.'
              opened={this.state.editing}
              onChange={() => this.setState({ editing: !this.state.editing })}>
              <>
                {this.generateInputs()}
              </>
            </Category>
          </>
          : <>
            <TextInput
              defaultValue={this.props.getSetting('wallhaven-search', '')}
              onChange={k => this.props.updateSetting('wallhaven-search', k)}
              note={<>What the plugin will use to find wallpapers. See <a href='https://wallhaven.cc/help/api#search' target="_blank">this</a> for more details.</>}
            >
              Search terms
            </TextInput>
            <TextInput
              defaultValue={this.props.getSetting('wallhaven-key', '')}
              onChange={k => this.props.updateSetting('wallhaven-key', k)}
              note='An API key is required to get NSFW wallpapers, kinky boi. You can find it in your settings.'
            >
              API Key
            </TextInput>
            <SwitchItem
              value={this.props.getSetting('wallhaven-c-gen', true)}
              onChange={() => this.props.toggleSetting('wallhaven-c-gen')}
              note='Includes wallpapers categorized as General.'
            >
              Category: General
            </SwitchItem>
            <SwitchItem
              value={this.props.getSetting('wallhaven-c-weeb', true)}
              onChange={() => this.props.toggleSetting('wallhaven-c-weeb')}
              note='Includes wallpapers categorized as Anime.'
            >
              Category: Anime
            </SwitchItem>
            <SwitchItem
              value={this.props.getSetting('wallhaven-c-ppl', true)}
              onChange={() => this.props.toggleSetting('wallhaven-c-ppl')}
              note='Includes wallpapers categorized as People.'
            >
              Category: People
            </SwitchItem>
            <SwitchItem
              value={this.props.getSetting('wallhaven-p-sfw', true)}
              onChange={() => this.props.toggleSetting('wallhaven-p-sfw')}
              note='Includes wallpapers categorized as Safe for Work.'
            >
              Purity: SFW
            </SwitchItem>
            <SwitchItem
              value={this.props.getSetting('wallhaven-p-uwu', false)}
              onChange={() => this.props.toggleSetting('wallhaven-p-uwu')}
              note='Includes wallpapers categorized as Sketchy.'
            >
              Purity: Sketchy
            </SwitchItem>
            <SwitchItem
              disabled={!this.props.getSetting('wallhaven-key', '')}
              value={this.props.getSetting('wallhaven-p-nsfw', false)}
              onChange={() => this.props.toggleSetting('wallhaven-p-nsfw')}
              note='Includes wallpapers categorized as Not Safe for Work. kinky boy. Requires an API key.'
            >
              Purity: NSFW
            </SwitchItem>
          </>}

        <SliderInput
          equidistant
          stickToMarkers
          defaultValue={this.props.getSetting('interval', 60)}
          markers={[ 5, 10, 15, 30, 60, 120, 180, 360, 720, 3600 ]}
          onMarkerRender={(e) => e < 60 ? `${e}min` : `${e / 60}hr`}
          onValueChange={e => {
            this.props.updateSetting('interval', e);
            this.props.plugin.updateInterval();
          }}
        >
          Interval
        </SliderInput>

        <TextInput
          defaultValue={this.props.getSetting('selector', 'body')}
          onChange={p => {
            this.props.updateSetting('selector', !p ? 'body' : p);
            this.props.plugin.changeWallpaper();
          }}
          note='CSS selector where will be applied background-image.'
        >
          Selector
        </TextInput>

        <ButtonItem
          note={'Triggers a wallpaper change. This won\'t affect interval.'}
          button='Change now'
          onClick={() => this.props.plugin.changeWallpaper()}
        >
          Change wallpaper
        </ButtonItem>
      </div>
    );
  }

  generateInputs () {
    const list = this.props.getSetting('wallpapers', []).concat([ '' ]);

    return list.map((n, i) => {
      this.render_key++;
      return (
        <div key={this.render_key}> {/* for ur health, never do that in react */}
          <TextInput
            placeholder='https://...'
            defaultValue={n}
            onBlur={e => {
              if (e.target.value === '') {
                list.splice(i, 1);
                if (list.length === 0) {
                  return;
                }
              } else {
                list[i] = e.target.value;
              }

              this.props.updateSetting('wallpapers', list.filter(v => v !== ''));
            }}
          />
        </div>
      );
    });
  }
};
