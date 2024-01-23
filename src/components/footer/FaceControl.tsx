import {BMProps, dialogStyle} from '@/components/utils'
import Container from '@material-ui/core/Container'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import {useTranslation} from '@/models/locales'
import {Observer} from 'mobx-react-lite'
import React from 'react'

export const FaceControl: React.FC<BMProps> = (props: BMProps) => {
  const local = props.stores.participants.local
  const faceSwitch = <Observer>{ () =>
    <Switch checked={local.localInformationValue.faceTrack} name="face" style={dialogStyle}
      onChange={event => {
        local.localInformationValue.faceTrack = !local.localInformationValue.faceTrack
        local.saveInformationToStorage(true)
        local.sendInformation()
      } } />
  }</Observer>
  const {t} = useTranslation()

  return <Container>
    <FormControlLabel
      control={faceSwitch}
      label={<span style={dialogStyle}>
        {local.localInformationValue.avatarSrc.slice(-4)==='.vrm' ? t('trackWholeBody') :  t('showTrackedFace')}
      </span>}/>
  </Container>
}
FaceControl.displayName = 'FaceControl'
