import {ISharedContent} from '@/models/ISharedContent'
import {PlaybackParticipant as IPlaybackParticipant, RemoteInformation} from '@/models/Participant'
import {action, makeObservable, observable} from 'mobx'
import {Store} from '../utils'
import {ParticipantBase, TrackStates} from './ParticipantBase'


export class PlaybackParticipant extends ParticipantBase implements Store<IPlaybackParticipant> {
  // information:RemoteInformation = {} as RemoteInformation
  get information(): RemoteInformation {
    return this.information_ as RemoteInformation;
  }
  set information(value: RemoteInformation) {
      this.information_ = value;
  }
  informationReceived = false
  @observable trackStates = new TrackStates()
  @observable called = false
  @observable inLocalsZone = false
  @observable.ref closedZone: ISharedContent | undefined = undefined
  @observable videoBlob: Blob|undefined
  @observable audioBlob: Blob|undefined
  lastDistance = 0
  constructor(id:string) {
    super()
    makeObservable(this)
    this.id = id
  }
  @action call(){
    this.called = true
  }
}
