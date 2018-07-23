import * as React from 'react'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core'
import Slider from '@material-ui/lab/Slider'
import LinearProgress from '@material-ui/core/LinearProgress'
import MidiKeyboard from '../components/Midikeyboard'
import Tone from 'tone'
import { Note } from 'tonal'

class Synthpage extends React.Component {
  state = {
    open: false,
    midiAccess: null,
    volume: -6,
    attack: 0.05,
    decay: 0.2,
    sustain: 0.2,
    release: 1.5,
    meter: null,
    meterVal: 0,
    chorusSend: -100,
    chorusDelayTime: 2,
    reverbSend: -100,
    chebySend: -100
  };
  synth = null
  animateToFrame = null
  sendsGainValue = {
    chorusSend: null,
    chebySend: null,
    reverbSend: null
  }
  sendsFx = {
    chorus: null,
    cheby: null,
    reverb: null
  }

  constructor (props) {
    super(props)

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({ sysex: true })
        .then(this.onMIDISuccess, this.onMIDIFailure)
    } else {
      window.alert('WebMIDI is not supported in this browser.')
    }

    this.synth = new Tone.Synth({
      'oscillator': {
        'type': 'amtriangle',
        'harmonicity': 0.5,
        'modulationType': 'sine'
      },
      'envelope': {
        'attackCurve': 'exponential',
        'attack': 0.05,
        'decay': 0.2,
        'sustain': 0.2,
        'release': 1.5
      },
      'portamento': 0.05
    }).toMaster()

    // make some effects
    this.sendsFx = {
      chorus: new Tone.Chorus()
        .receive('chorus')
        .toMaster(),
      cheby: new Tone.Chebyshev(50)
        .receive('cheby')
        .toMaster(),
      reverb: new Tone.Freeverb(0.8, 4000)
        .receive('reverb')
        .toMaster()
    }
    // const chorus = new Tone.Chorus()
    //   .receive('chorus')
    //   .toMaster()
    // chorus.delayTime = 200
    // const cheby = new Tone.Chebyshev(50)
    //   .receive('cheby')
    //   .toMaster()
    // const reverb = new Tone.Freeverb(0.8, 4000)
    //   .receive('reverb')
    //   .toMaster()
    // console.log(this.sendsFx.chorus)
    this.state = {
      ...this.state,
      meter: new Tone.Meter()
    }

    this.sendsGainValue = {
      chorusSend: this.synth.send('chorus', -Infinity),
      chebySend: this.synth.send('cheby', -Infinity),
      reverbSend: this.synth.send('reverb', -Infinity)
    }

    this.synth.connect(this.state.meter).toMaster()
  }

  componentDidMount () {
    this.animateToFrame()
  }

  render () {
    return (
      <div>
        <LinearProgress variant='determinate' value={this.state.meterVal} />

        <div style={{ display: 'flex' }}>
          {this.renderSlider({
            label: 'Volume',
            value: this.state.volume,
            onChange: this.handleVolumeChange,
            min: -100,
            max: 0,
            step: 1
          })}
          {this.renderSlider({
            label: 'Attack',
            value: this.state.attack,
            onChange: this.handleEnvChange.bind(this, 'attack'),
            min: 0.05,
            max: 1,
            step: 0.01
          })}
          {this.renderSlider({
            label: 'Decay',
            value: this.state.decay,
            onChange: this.handleEnvChange.bind(this, 'decay'),
            min: 0.05,
            max: 1,
            step: 0.01
          })}
          {this.renderSlider({
            label: 'Sustain',
            value: this.state.sustain,
            onChange: this.handleEnvChange.bind(this, 'sustain'),
            min: 0.0,
            max: 1,
            step: 0.01
          })}
          {this.renderSlider({
            label: 'Release',
            value: this.state.release,
            onChange: this.handleEnvChange.bind(this, 'release'),
            min: 0.2,
            max: 2,
            step: 0.01
          })}
          {this.renderSlider({
            label: 'Chorus',
            value: this.state.chorusSend,
            onChange: this.handleSendFxChange.bind(this, 'chorusSend'),
            min: -100,
            max: 0,
            step: 0.5
          })}
          {this.renderSlider({
            label: 'Delay Time',
            value: this.state.chorusDelayTime,
            onChange: this.handleChorusDelayTime.bind(this, 'chorusDelayTime'),
            min: 2,
            max: 2000,
            step: 1
          })}
          {this.renderSlider({
            label: 'Reverb',
            value: this.state.reverbSend,
            onChange: this.handleSendFxChange.bind(this, 'reverbSend'),
            min: -100,
            max: 0,
            step: 0.5
          })}
          {this.renderSlider({
            label: 'ChebyChev',
            value: this.state.chebySend,
            onChange: this.handleSendFxChange.bind(this, 'chebySend'),
            min: -100,
            max: 0,
            step: 0.5
          })}
        </div>
      </div>
    )
  }

  renderSlider = ({ label, value, onChange, min, max, step }) => {
    const { classes } = this.props
    return (
      <div className={classes.sliderContainer}>
        <Typography>{label}</Typography>
        <Slider
          classes={{
            root: classes.sliderRoot,
            vertical: classes.vertical,
            activated: classes.activated,
            jumped: classes.jumped,
            track: classes.track,
            trackBefore: classes.trackBefore,
            trackAfter: classes.trackAfter,
            thumb: classes.thumb
          }}
          style={{ height: 'calc(100vh - 88px - 80px)' }}
          vertical
          reverse
          value={value || 0}
          onChange={onChange}
          max={max}
          min={min}
          step={step}
        />
        <Typography>{value || 0}</Typography>
      </div>
    )
  }
  onMIDISuccess = (midiAccess) => {
    if (midiAccess.inputs.size > 0) {
      this.listeningToMidi(midiAccess)
      this.setState({ midiAccess })
    } else {
      console.log('There are not midi-drivers available. Tip: Please create a virtual midi driver at first and then restart the application.')
    }
  }

  onMIDIFailure = () => {
    window.alert('Could not access your MIDI devices.')
  }
  setMeterValueToState = () => {
    let level = this.state.meter.getLevel()
    level = Tone.dbToGain(level) * 100 // scale it between 0 - 1
    this.setState({ meterVal: level })
    // if (level > 0.1) {
    //   this.setState({ meterVal: level })
    // }
  }

  animateToFrame = () => {
    window.requestAnimationFrame(this.animateToFrame)
    this.setMeterValueToState()
  }

  listeningToMidi = (midiAccess, indexOfPort) => {
    const onMidiInput = (event) => {
      // var str = 'MIDI message received at timestamp ' + event.timestamp + '[' + event.data.length + ' bytes]: '
      // for (var i = 0; i < event.data.length; i++) {
      //   str += '0x' + event.data[i].toString(16) + ' '
      // }
      // console.log(str)

      const cmd = event.data[0] >> 4
      const channel = event.data[0] & 0xf
      const noteNumber = event.data[1]
      const velocity = event.data[2]

      // console.log({cmd, channel, noteNumber, velocity})
      if (cmd === 9) {
        console.log('note on', Note.fromMidi(noteNumber), 0.01, velocity)
        this.synth.triggerAttack(Note.fromMidi(noteNumber))
      } else if (cmd === 8) {
        this.synth.triggerRelease()
        console.log('note off')
      }
    }

    midiAccess.inputs.forEach(function (entry) { entry.onmidimessage = onMidiInput })
    MidiKeyboard(midiAccess)
  }

  handleVolumeChange = (e, val) => {
    this.synth.volume.setValueAtTime(val, 0.01)
    this.setState({ volume: val })
  }

  handleEnvChange = (field, e, val) => {
    this.synth.envelope[field] = val
    this.setState({ [field]: val })
  }

  handleSendFxChange = (field, e, val) => {
    this.sendsGainValue[field].gain.value = val
    this.setState({ [field]: val })
  }
  handleChorusDelayTime= (field, e, val) => {
    this.sendsFx.chorus.delayTime = val
    this.setState({ [field]: val })
  }
}
const styles = theme => ({

  sliderContainer: {
    width: 50,
    margin: '0 16px 0 16px'
  },
  vertical: {
    // left: 0
  },
  activated: {},
  jumped: {
    transition: 'none'
  },
  track: {
    '&$vertical': {
      width: 50,
      border: 'solid 1px rgba(0,0,0,0.1)',
      borderRadius: 2
      // left: 0
    }
  },
  trackBefore: {
    background: theme.palette.secondary.dark,
    '&$activated': {
    }
  },
  trackAfter: {
    background: theme.palette.primary.light,
    '&$activated': {
      background: theme.palette.primary.light
    },
    '&$jumped': {
      background: theme.palette.primary.light
    }
  },
  thumb: {
    width: 50,
    height: 40,
    borderRadius: 2,
    // left: 0,
    left: '50%',
    border: 'solid 1px rgba(0,0,0,0.2)',

    '&$activated': {
      boxShadow: '0 0 3px 3px grey',
      width: 74,
      height: 40,

      background: theme.palette.primary.dark
    },
    '&$jumped': {
      width: 74,
      height: 40
    }
  },
  sliderRoot: {
    width: 50,
    cursor: 'default',

    '&$vertical': {
      margin: 0,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  button: {
    margin: theme.spacing.unit,
    background: theme.palette.secondary.light
  },
  iconColor: {
    color: theme.palette.primary.contrastText,
    cursor: 'pointer'
  },
  labelReadOnly: {
    padding: '6px 0 7px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  input: {
    width: 50,
    margin: theme.spacing.unit,
    color: theme.palette.primary.contrastText, // 'rgba(0, 0, 0, 0.54)',
    fontSize: '1rem',
    fontWeight: 400,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.375em'
  },
  inputInput: {
    padding: 0
  },
  formControl: {
    margin: theme.spacing.unit,
    maxWidth: 140
  },
  labelTop: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: theme.palette.primary.contrastText,
    margin: theme.spacing.unit,
    fontSize: '1rem',
    fontWeight: 400,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.375em'
  },
  label: {
    color: theme.palette.primary.contrastText
  },
  select: {
    width: 50,
    color: theme.palette.primary.contrastText,
    lineHeight: '1.375em'
  },
  caption: {
    marginTop: theme.spacing.unit,
    color: theme.palette.primary.contrastText,
    fontSize: '1rem',
    fontWeight: 400,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: '1.375em'
  }
})

export default (withStyles(styles)(Synthpage))
