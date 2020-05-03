import {Information, Participant as IParticipant, Perceptibility, Pose2DMap, Stream} from '@models/Participant'
import {shallowObservable, Store} from './utils'

export class Participant implements Store<IParticipant> {
  id: string
  pose = shallowObservable<Pose2DMap>({
    position: [0, 0],
    orientation: 0,
  })
  information = shallowObservable<Information>({
    name: 'Name',
    email: undefined,
    md5Email: undefined,
  })
  perceptibility = shallowObservable<Perceptibility>({
    audibility: true,
  })
  stream = shallowObservable<Stream>({
    videoStream: [],
    audioStream: [],
  })

  constructor(id: string) {
    this.id = id
  }
}
