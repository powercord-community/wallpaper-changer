const { React } = require('powercord/webpack');
const { TextInput, ButtonItem, Category, SliderInput } = require('powercord/components/settings');

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
        <Category
          name='Wallpapers'
          description='List of wallpapers you want to use'
          opened={this.state.editing}
          onChange={() => this.setState({ editing: !this.state.editing })}>
          <>
            {this.generateInputs()}
          </>
        </Category>

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
          note='CSS selector where will be applied background-image'
        >
          Selector
        </TextInput>

        <ButtonItem
          note={'Triggers a wallpaper change. This won\'t affect interval'}
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
