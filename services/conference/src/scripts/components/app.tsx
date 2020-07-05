import {StoreProvider as ParticipantsProvider} from '@hooks/ParticipantsStore'
import {makeStyles} from '@material-ui/core/styles'
import participantsStore from '@stores/participants/Participants'
import React from 'react'
import {Footer} from './footer/footer'
import {Map} from './map/map'

const useStyles = makeStyles({
  map: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
})

export const App: React.FC<{}> = () => {
  const classes = useStyles()

  return (
    <ParticipantsProvider value={participantsStore}>
    <div className={classes.map}>
      <Map />
      <Footer />
    </div>
    </ParticipantsProvider>
  )
}
App.displayName = 'App'
