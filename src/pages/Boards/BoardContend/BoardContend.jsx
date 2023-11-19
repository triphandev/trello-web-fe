import Box from '@mui/material/Box'
import ListColunms from './ListColunms/ListColunms'
import { mapOrder } from '~/utils/sort'
import Column from './ListColunms/Colunm/Colunm'
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cloneDeep, isEmpty } from 'lodash'
import { arrayMove } from '@dnd-kit/sortable'
import Card from './ListColunms/Colunm/ListCards/Card/Card'
import { generatePlaceholderCard } from '~/utils/fomatters'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({
  board, createNewColumn,
  createNewCard,
  moveColumns,
  moveCards,
  pushCardNextColumn,
  deleteCardOverColumn
}) {


  const [orderedColumnsState, setOrderedColumnsState] = useState([])
  // Cùng một thời điểm chỉ có một phần tử dang được kéo (column hoăc card)
  const [activeDragitemId, setactiveDragitemId] = useState(null)
  const [activeDragitemType, setactiveDragitemType] = useState(null)
  const [activeDragitemData, setactiveDragitemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // Điểm va chạm cuối cùng sử lý thuật toán phát hiện va chạm
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumnsState(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])
  const findColumnByCardId = (cardId) => {
    return orderedColumnsState.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }
  // function chung xử lý việc cạp nhật lại state trong trường hợp di chuyển Card giữa các Column khác nhau.
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDragingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumnsState(prevColumns => {
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán "cardIndex mới" (trên hoặc dưới của overCard) lấy chuẩn ra từ code của thư viện
      //- nhiều khi muốn từ chối hiểu
      let newCardIndex
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top >
        over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lý data rồi return
      // - cập nhật lại OrderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)
      // Column cũ
      if (nextActiveColumn) {
        //Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang column khác)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDragingCardId)
        // Them Placehoder Card neu column roong: bi keo het card di

        if (isEmpty(nextActiveColumn?.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        // Cập nhật lại mang cardOrderIds cho chẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }
      //sang column mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa, nếu có thì xóa nó đi
        nextOverColumn.cards = nextOverColumn.cards.filter(card => card._id !== activeDragingCardId)
        // Đối với trường hợp dragEnd thì phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card
        //giữa 2 column khác nhau.
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeDraggingCardData
        )
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)
        // Cập nhật lại amngr cardOrderIds cho chẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }
      return nextColumns
    })
  }
  const handleDragStart = (event) => {
    setactiveDragitemId(event?.active?.id)
    setactiveDragitemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD : ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setactiveDragitemData(event?.active?.data?.current)
    if (event?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }
  const handleDragOver = (event) => {

    if (activeDragitemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    const { active, over } = event
    if (!active || !over) return

    //activeDraggingCardData : Là card đang được kéo
    const { id: activeDragingCardId, data: { current: activeDraggingCardData } } = active
    //overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên.
    const { id: overCardId } = over

    //tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDragingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Nếu không tồn tại một trong 2 column thì không làm gì hết, tránh crash trang web
    if (!activeColumn || !overColumn) return
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDragingCardId,
        activeDraggingCardData
      )
    }
  }
  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || !active) return
    //Sử lý kéo thả card
    if (activeDragitemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      //activeDraggingCardData : Là card đang được kéo
      const { id: activeDragingCardId, data: { current: activeDraggingCardData } } = active
      //overCard: là cái card đang tương tác trên hoặc dưới so với cái card được kéo ở trên.
      const { id: overCardId } = over

      //tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDragingCardId)
      const overColumn = findColumnByCardId(overCardId)
      // Nếu không tồn tại một trong 2 column thì không làm gì hết, tránh crash trang web
      if (!activeColumn || !overColumn) return

      // Hành động kéo thả card giữa 2 column khác nhau
      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id
      //(set vào state từ bước handleDragStart) chứ không phải activeData trong scope handleDragEnd
      //này vì sau khi đi qua onDragOver tới đây là state của card đã bị cập nhật một lần rồi.
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDragingCardId,
          activeDraggingCardData
        )
        // console.log('activeColumn', activeColumn)
        // console.log('activeDragingCardId', activeDragingCardId)
        // console.log('activeDraggingCardData', activeDraggingCardData)
        // console.log('oldColumnWhenDraggingCard', oldColumnWhenDraggingCard)
        deleteCardOverColumn(activeDragingCardId, activeDraggingCardData, oldColumnWhenDraggingCard)
        pushCardNextColumn(activeColumn.cards, activeColumn._id)

        // const cloneCard = { title: activeDraggingCardData.title, columnId: activeDraggingCardData.columnId }
        // await createNewCard(cloneCard)
        // await deleteCard(activeDraggingCardData, overColumn)
      } else {
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragitemId)
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)
        await moveCards(dndOrderedCards, oldColumnWhenDraggingCard._id)
        setOrderedColumnsState(prevColumns => {
          const nextColumns = cloneDeep(prevColumns)
          const targetColumn = nextColumns.find(c => c._id === overColumn._id)

          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(i => i._id)
          return nextColumns
        })
      }
    }
    //Sử lý kéo thả column
    if (activeDragitemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        // console.log('handleDkragEnd', event)
        // Vi trí cũ của colunm
        const oldColumnIndex = orderedColumnsState.findIndex(c => c._id === active.id)
        //Lấy vị trí mới từ thằng over
        const newColumnIndex = orderedColumnsState.findIndex(c => c._id === over.id)

        // Code của arayMove ở đây: dnd-kit/packages/sortable/src/utilities/arayMove.ts
        const dndOrderedColumns = arrayMove(orderedColumnsState, oldColumnIndex, newColumnIndex)
        // console.log('handleDragEnd', dndOrderedColumns)
        moveColumns(dndOrderedColumns)

        // Vẫn gọi update State ở đây để tránh delay hoặc Flickering giao diện lúc kéo thả cần phải chời gọi API
        setOrderedColumnsState(dndOrderedColumns)
        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // console.log('handleDragEnd', dndOrderedColumnsIds)
      }
    }

    //Những dữ liêu sau khi kéo thả này luôn phải trả về giá trị ban đầu
    setactiveDragitemId(null)
    setactiveDragitemType(null)
    setactiveDragitemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10
    }
  })
  const touchSensor = useSensor(TouchSensor,
    {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 500
      }
    }
  )

  const sensors = useSensors(
    mouseSensor,
    touchSensor
  )
  const dropAnimation = { sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: 0.5 } } }) }
  // Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm tối ưu cho việc kéo thả card
  // giữa nhiều columns
  // args = arguments = Các đối số, tham số
  const collisionDetectionStrategy = useCallback((args) => {
    // Trường hợp kéo column thì dùng thuật toán closetCenter là chuẩn nhất
    if (activeDragitemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // Tìm các điểm giao nhau, va chạm - intersection với con trỏ
    const pointerIntersections = pointerWithin(args)
    if (!pointerIntersections?.length) return
    //Thật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đây
    //
    // const intersections = !!pointerIntersections?.length
    //   ? pointerIntersections
    //   : rectIntersection(args)

    // Tìm overId đầu tiên trong đám pointerIntersections ở trên
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      // Nếu cái over là column thì sẽ tìm tới cái cardid gần nhất bên trong khu vục va chạm đó dựa vào thuật toán phát hiện
      // va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên ở đây dùng closestCenter mình thấy mượt mà hơn
      const checkColumn = orderedColumnsState.find(column => column._id === overId)
      if (checkColumn) {
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            container => {
              return (container.id !== overId)
                && (checkColumn?.cardOrderIds?.includes(container.id))
            }
          )
        })[0]?.id
      }
      lastOverId.current = overId
      return [{ id: overId }]
    }

    //Nếu overId là null thì trả về mảng rổng - tránh bug crash trang
    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragitemType, orderedColumnsState])
  return (
    <>
      <DndContext
        onDragEnd={handleDragEnd}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        // collisionDetection={closestCorners}
        collisionDetection={collisionDetectionStrategy}
      >
        <Box sx={{
          backgroundColor: 'primary.main',
          width: '100%',
          height: (theme) => theme.trell.boarContent,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
          p: '10px 0'
        }}>
          {/*Box colunm */}
          <ListColunms columns={orderedColumnsState} createNewColumn={createNewColumn} createNewCard={createNewCard} />
          <DragOverlay dropAnimation={dropAnimation}>
            {(!activeDragitemType) && null}
            {(activeDragitemId && activeDragitemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragitemData} />}
            {(activeDragitemId && activeDragitemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragitemData} />}
          </DragOverlay>
        </Box>
      </DndContext>
    </>
  )
}

export default BoardContent
