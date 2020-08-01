import {BaseProps as BP} from '@components/utils'
import {useStore} from '@hooks/ParticipantsStore'
import {makeStyles} from '@material-ui/core/styles'
import {
  assert, crossProduct, extractRotation, extractScaleX, multiply,
  radian2Degree, rotate90ClockWise, rotateVector2D, transformPoint2D, vectorLength,
} from '@models/utils'
import {useObserver} from 'mobx-react-lite'
import React, {useEffect, useRef, useState} from 'react'
import {useDimensions} from 'react-dimensions-hook'
import {addV, subV, useGesture} from 'react-use-gesture'
import {createValue, Provider as TransformProvider} from '../utils/useTransform'


export const MAP_SIZE = 5000
const HALF = 0.5
export const MAP_CENTER:[number, number] = [MAP_SIZE * HALF, MAP_SIZE * HALF]

interface StyleProps {
  matrix: DOMMatrixReadOnly,
  mouse: [number, number],
}

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    userDrag: 'none',
    userSelect: 'none',
    overflow: 'scroll',
  },
  transform: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: (props: StyleProps) => props.matrix.toString(),
  },
})

type BaseProps = React.PropsWithChildren<BP>

const options = {
  minScale: 0.8,
  maxScale: 5,
}

export const Base: React.FC<BaseProps> = (props: BaseProps) => {
  const container = useRef<HTMLDivElement>(null)
  const participants = useStore()

  const localParticipantPosition = useObserver(() => participants.local.get().pose.position)

  const [mouse, setMouse] = useState<[number, number]>([0, 0])  // mouse position relative to outer container
  const [matrix, setMatrix] = useState<DOMMatrixReadOnly>(new DOMMatrixReadOnly())

  // changed only when event end, like drag end
  const [commitedMatrix, setCommitedMatrix] = useState<DOMMatrixReadOnly>(new DOMMatrixReadOnly())

  const [startDrag, setStartDrag] = useState(false)

  const MOUSE_RIGHT = 2
  const bind = useGesture(
    {
      onDragStart: ({event}) => {
        setStartDrag(true)
      },
      onDrag: ({down, delta, event, xy, buttons}) => {
        if (startDrag && down) {
          if (buttons === MOUSE_RIGHT) {  // right mouse drag - rotate map
            const center = transformPoint2D(matrix, localParticipantPosition)
            const target = addV(subV(xy, getDivAnchor(container)), subV(MAP_CENTER, centerOfOuter()))
            // console.log(`center:${center}  target:${target} divA:${getDivAnchor(container)}`)
            const radius1 = subV(target, center)
            const radius2 = subV(radius1, delta)

            const cosAngle = crossProduct(radius1, radius2) / (vectorLength(radius1) * vectorLength(radius2))
            const flag = crossProduct(rotate90ClockWise(radius1), delta) > 0 ? -1 : 1
            const angle = Math.acos(cosAngle) * flag
            if (isNaN(angle)) {  // due to accuracy, angle might be NaN when cosAngle is larger than 1
              return  // no need to update matrix
            }

            const changeMatrix = (new DOMMatrix()).rotateSelf(0, 0, radian2Degree(angle))

            const tm = (new DOMMatrix()).translate(
              ...subV([0, 0] as [number, number], center))
            const itm = (new DOMMatrix()).translateSelf(...center)

            const newMatrix = multiply([itm, changeMatrix, tm, matrix])
            setMatrix(newMatrix)

            participants.local.get().pose.orientation = -radian2Degree(extractRotation(newMatrix))
          } else {  // left mouse drag or touch screen drag - translate map
            const diff = rotateVector2D(matrix.inverse(), delta)
            const newMatrix = matrix.translate(...diff)
            setMatrix(newMatrix)
          }
        }
      },
      onDragEnd: () => {
        setCommitedMatrix(matrix)
        setStartDrag(false)
      },
      onPinch: ({da: [d, a], origin, event, memo}) => {
        if (memo === undefined) {
          return [d, a]
        }

        const [md, ma] = memo

        const center = subV(origin as [number, number], getDivAnchor(container))

        let scale = d / md
        scale = limitScale(Math.abs(extractScaleX(matrix)), scale)

        const changeMatrix = (new DOMMatrix()).scaleSelf(scale, scale, 1).rotateSelf(0, 0, a - ma)

        const tm = (new DOMMatrix()).translate(
          ...subV([0, 0] as [number, number], center))
        const itm = (new DOMMatrix()).translateSelf(...center)

        const newMatrix = multiply([itm, changeMatrix, tm, matrix])
        setMatrix(newMatrix)

        participants.local.get().pose.orientation = -radian2Degree(extractRotation(newMatrix))

        return [d, a]
      },
      onPinchEnd: () => setCommitedMatrix(matrix),
      onWheel: ({movement}) => {
        let scale = Math.pow(1.2, movement[1] / 1000)
        scale = limitScale(extractScaleX(matrix), scale)
        const newMatrix = matrix.scale(scale, scale, 1, ...transformPoint2D(matrix.inverse(), mouse))
        setMatrix(newMatrix)
      },
      onWheelEnd: () => setCommitedMatrix(matrix),
      onMove: ({xy}) => {
        setMouse(subV(xy, getDivAnchor(container)))
        const xyOnMap  = transformPoint2D(matrix.inverse(), addV(subV(xy, getDivAnchor(container)), MAP_CENTER));
        (global as any).mousePositionOnMap = xyOnMap
      },
    },
  )
  const outerDim = useDimensions()
  function centerOfOuter():[number, number] {
    return [outerDim.dimensions.clientWidth /2, outerDim.dimensions.clientHeight /2]
  }
  let outer:HTMLElement|null = null
  function outerRef(e:HTMLElement|null) {
    outerDim.ref(e)
    outer = e
  }
  //  scroll to center
  useEffect(
    () => {
      if (outer) {
        console.log('useEffect[outer] called')
        outer.scrollTo((MAP_SIZE - outer?.clientWidth) /2, (MAP_SIZE - outer?.clientHeight) /2)
      }
    },
    [outer],
  )
  // prevent show context menu with right mouse click
  useEffect(
    () => {
      assert(outer !== null)

      const cb = (e: Event) => {
        e.preventDefault()

        return false
      }
      outer?.addEventListener('contextmenu', cb)

      return () => outer?.removeEventListener('contextmenu', cb)
    },
    [outer],
  )

  const relativeMouse = matrix.inverse().transformPoint(new DOMPoint(...mouse))
  const styleProps: StyleProps = {
    matrix,
    mouse: [relativeMouse.x, relativeMouse.y],
  }
  const classes = useStyles(styleProps)

  const transfromValue = createValue(commitedMatrix, getDivAnchor(container))

  return (
    <div className={[classes.root, props.className].join(' ')} ref={outerRef} {...bind()}>
    <TransformProvider value={transfromValue}>
    <div id="map-transform" className={classes.transform} ref={container}>
          {props.children}
    </div>
      </TransformProvider>
    </div>
  )
}
Base.displayName = 'MapBase'

function limitScale(currentScale: number, scale: number): number {
  const targetScale = currentScale * scale

  if (targetScale > options.maxScale) {
    return options.maxScale / currentScale
  }

  if (targetScale < options.minScale) {
    return options.minScale / currentScale
  }

  return scale
}

function getDivAnchor(e: React.RefObject<HTMLDivElement>): [number, number] {
  const div = e.current

  if (div === null) {
    return [0, 0]
  }

  return [div.offsetLeft, div.offsetTop]
}
