import { AppBar, Button, Badge, Divider, Drawer, Hidden, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, withStyles } from '@material-ui/core'
import TodoIcon from '@material-ui/icons/FormatListNumbered'
import HomeIcon from '@material-ui/icons/Home'
import MenuIcon from '@material-ui/icons/Menu'
import { createBrowserHistory } from 'history'
import * as React from 'react'
import { connect } from 'react-redux'
import { Route, Router } from 'react-router'
import HomePage from './pages/HomePage'
import TodoPage from './pages/TodoPage'
import RackPage from './pages/RackPage'
import withRoot from './withRoot'
import Tone from 'tone'
import { store } from './ReduxRoot'

const history = createBrowserHistory()

class AudioMeter extends React.Component {
  state = {
    meter: new Tone.Meter(),
    value: null,
    intervalId: null
  }

  componentWillMount () {
    const {meter} = this.state
    // connect mic to the meter
    Tone.Master.connect(meter)

    // the current level of the mic input in decibels
    this.setState({
      meter,
      value: meter.getValue()
    })
  }

  componentDidMount () {
    const intervalId = setInterval(() => {
      const value = this.state.meter.getValue()
      this.setState({
        value,
        intervalId
      })
    }, 300)
  }

  componentWillUnmount () {
    clearInterval(this.state.intervalId)
  }

  render () {
    return (
      <div onClick={this.handleGetMeterClick}>
        Level {this.state.value}
      </div>
    )
  }
}

class App extends React.Component {
  state = {
    mobileOpen: true,
    isStarted: false
  };

  componentDidMount () {
    window.addEventListener(
      'beforeunload',
      this.saveStateToLocalStorage.bind(this)
    )
  }

  componentWillUnmount () {
    window.removeEventListener(
      'beforeunload',
      this.saveStateToLocalStorage.bind(this)
    )

    // saves if component has a chance to unmount
    this.saveStateToLocalStorage()
  }

  routes = (
    <div className={this.props.classes.content}>
      <Route exact path='/' component={HomePage} />
      <Route exact path='/home' component={HomePage} />
      <Route exact path='/todo' component={TodoPage} />
      <Route exact path='/rack' component={RackPage} />
    </div>
  );

  render () {
    let drawer = (
      <div>
        <div className={this.props.classes.drawerHeader} />
        <Divider />
        <List>
          <ListItem button onClick={() => history.push('/')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary='Home' />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button onClick={() => history.push('/todo')}>
            <ListItemIcon>
              {this.renderTodoIcon()}
            </ListItemIcon>
            <ListItemText primary='Todo' />
          </ListItem>
        </List>
        <List>
          <ListItem button onClick={() => history.push('/rack')}>
            <ListItemIcon>
              {this.renderRackIcon()}
            </ListItemIcon>
            <ListItemText primary='Rack' />
          </ListItem>
        </List>
        <div style={{ height: 10000 }} />
      </div>
    )

    return (
      <Router history={history}>
        <div className={this.props.classes.root}>
          <div className={this.props.classes.appFrame}>
            <AppBar className={this.props.classes.appBar}>
              <Toolbar>
                <IconButton
                  color='inherit'
                  aria-label='open drawer'
                  onClick={this.handleDrawerToggle}
                  className={this.props.classes.navIconHide}
                >
                  <MenuIcon />
                </IconButton>
                <Typography variant='title' color='inherit' noWrap>
                  Season Audio Rack
                </Typography>
              </Toolbar>
              <Button onClick={this.handleStartStop}>
                start / stop
              </Button>
              <AudioMeter />
            </AppBar>
            <Hidden mdUp>
              <Drawer
                variant='temporary'
                anchor={'left'}
                open={this.state.mobileOpen}
                classes={{
                  paper: this.props.classes.drawerPaper
                }}
                onClose={this.handleDrawerToggle}
                ModalProps={{
                  keepMounted: true // Better open performance on mobile.
                }}
              >
                {drawer}
              </Drawer>
            </Hidden>
            <Hidden smDown implementation='css'>
              <Drawer
                variant='permanent'
                open
                classes={{
                  paper: this.props.classes.drawerPaper
                }}
              >
                {drawer}
              </Drawer>
            </Hidden>
            {this.routes}
          </div>
        </div>
      </Router>
    )
  }

  handleStartStop = (e) => {
    const nextVal = !this.state.isStarted
    this.setState({
      isStarted: nextVal
    })

    if (!nextVal) {
      Tone.Transport.stop()
    } else {
      Tone.Transport.start()
    }
  }

  renderTodoIcon () {
    let uncompletedTodos = this.props.rackItemList.filter(t => t.muted === false)

    if (uncompletedTodos.length > 0) {
      return (
        <Badge color='secondary' badgeContent={uncompletedTodos.length}>
          <TodoIcon />
        </Badge>
      )
    } else {
      return (
        <TodoIcon />
      )
    }
  }

  renderRackIcon () {
    let uncompletedTodos = this.props.todoList.filter(t => t.completed === false)

    if (uncompletedTodos.length > 0) {
      return (
        <Badge color='secondary' badgeContent={uncompletedTodos.length}>
          <TodoIcon />
        </Badge>
      )
    } else {
      return (
        <TodoIcon />
      )
    }
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen })
  }

  saveStateToLocalStorage = () => {
    const state = store.getState()
    window.localStorage.setItem(
      'state',
      JSON.stringify(state)
    )
  }
}

const drawerWidth = 240
const styles = theme => ({
  root: {
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden'
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    position: 'absolute'
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  drawerHeader: theme.mixins.toolbar,
  drawerPaper: {
    width: 250,
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      position: 'relative',
      height: '100%'
    }
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64
    }
  }
})

function mapStateToProps ({ todoList, rackItemList }) {
  return {
    todoList,
    rackItemList
  }
}

export default (withRoot(withStyles(styles)(connect(mapStateToProps)(App))))
