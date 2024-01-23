import { ISharedContent } from '@/models/ISharedContent'
import {RemoteInformation, RemoteParticipant as IRemoteParticipant} from '@/models/Participant'
import {action, makeObservable, observable} from 'mobx'
import {Store} from '../utils'
import {ParticipantBase, TracksStore, TrackStates} from './ParticipantBase'


export class RemoteParticipant extends ParticipantBase {
  remoteInformationValue:RemoteInformation = {} as RemoteInformation
  informationReceived = false
  @observable.shallow tracks = new TracksStore()
  @observable trackStates = new TrackStates()
  @observable called = false
  @observable inLocalsZone = false
  @observable.ref closedZone: ISharedContent | undefined = undefined
  lastDistance = 0
  constructor(id:string) {
    console.log(`RemoteParticipant ${id} created`)
    super()
    this.remoteInformationValue = {
      name: '',
      avatar: '',
      avatarSrc: '',
      color: [],
      textColor: []
  };
    makeObservable(this)
    this.id = id
  }
  @action call(){
    this.called = true
  }
}
