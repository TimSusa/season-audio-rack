import {
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  withStyles
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import * as React from 'react'
import Tone from 'tone'

class MonoSynth extends React.Component {
  componentDidMount () {
    var synth = new Tone.MonoSynth({
      'oscillator': {
        'type': 'square'
      },
      'envelope': {
        'attack': 0.1
      }
    }).toMaster()

    this.setState({
      synth
    })
  }

  render () {
    return (
      <div style={{ border: '1px solid grey' }}>
        <Button onClick={this.handleClick}>
          Play MonoSynth Tone
        </Button>
      </div>
    )
  }

  handleClick = () => {
    this.state.synth.triggerAttackRelease('C4', '8n')
  }
}

class RackTable extends React.Component {
  onRowClick (rackItem) {
    if (rackItem.muted) {
      this.props.actions.unmuteRackItem(rackItem.id)
    } else {
      this.props.actions.muteRackItem(rackItem.id)
    }
  }

  render () {
    const { classes } = this.props

    return (
      <Paper className={classes.paper}>
        <MonoSynth />
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>Completed</TableCell>
              <TableCell>Text</TableCell>
              <TableCell>Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.rackItemList && this.props.rackItemList.map(n => {
              return (
                <TableRow
                  key={n.id}
                  hover
                  onClick={event => this.onRowClick(n)}
                >
                  <TableCell padding='checkbox'>
                    <Checkbox checked={n.muted} />
                  </TableCell>
                  <TableCell>{n.text}</TableCell>
                  <TableCell padding='checkbox'>
                    <IconButton
                      aria-label='Delete'
                      color='default'
                      onClick={() => this.props.actions.deleteRackItem(n.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>
    )
  }
}

const styles = theme => ({
  paper: {
    maxWidth: 1000,
    minWidth: 1000,
    display: 'inline-block'
  },
  table: {
    maxWidth: 1000
  }
})

export default withStyles(styles)(RackTable)
