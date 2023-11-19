import Container from '@mui/material/Container'
import BoardContent from './BoardContend/BoardContend'
import BoardBar from './BoardBar/BoardBar'
import Appbar from '~/components/AppBar/AppBar'
// import { mockData } from '~/apis/mock-data'
import { useState } from 'react'
import { useEffect } from 'react'
import {
  createNewCardsAPI,
  createNewColumnsAPI,
  fetchBoardDetailsAPI,
  updateBoardDetailsAPI,
  updateColumnsAPI,
  updateCardsAPI,
  deleteCardsAPI
} from '~/apis'
import { generatePlaceholderCard } from '~/utils/fomatters'
import { isEmpty, cloneDeep } from 'lodash'
// import { toast } from 'react-toastify'

function Board() {
  const [board, setboard] = useState(null)
  useEffect(() => {
    // Tạm thời fix cứng boardId, flow chuẩn chỉnh về sau khi học nâng cao trực tieps với trungquandev
    // là chúng ta sẽ sử dụng react-router-dom để lấy chuẩn boardId từ URL về.
    const boardId = '654c7cfd7c83cce6682f7609'
    // Call API
    fetchBoardDetailsAPI(boardId).then((res) => {
      res.Board.columns.forEach(column => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        }
      })
      setboard(res.Board)
    })
  }, [])

  // Func nà y có nhiệm vụ gọi API tạo mới column và làm lại dữ liệu State mới
  const createNewColumn = async (newColumnData) => {
    const createColumn = await createNewColumnsAPI({
      ...newColumnData,
      boardId: board?._id
    })
    // const updateBoard = board.add(createColumn)
    // setboard({
    //   ...updateBoard
    // })
    createColumn.cards = [generatePlaceholderCard(createColumn)]
    createColumn.cardOrderIds = [generatePlaceholderCard(createColumn)._id]
    // Cập nhật state board
    const newBoard = { ...board }
    newBoard.columns.push(createColumn)
    newBoard.columnOrderIds.push(createColumn._id)
    setboard(newBoard)
  }
  const createNewCard = async (newCardData) => {
    // eslint-disable-next-line no-unused-vars
    const createCard = await createNewCardsAPI({
      ...newCardData,
      boardId: board?._id
    })
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(column => column._id === createCard.columnId)
    // console.log('cloneCard', createCard.columnId)
    if (columnToUpdate) {
      columnToUpdate.cards.push(createCard)
      columnToUpdate.cardOrderIds.push(createCard._id)
    }
    setboard(newBoard)
    // Cập nhật state board
  }

  //Func này có nhiệm vụ gọi API và sử lý khi kéo thả Column xong xuôi
  const moveColumns = async (dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns
    newBoard.columnOrderIds = dndOrderedColumnsIds
    setboard(newBoard)

    await updateBoardDetailsAPI(newBoard._id, { columnOrderIds: newBoard.columnOrderIds })
    // Gọi API để update board
  }
  //Func này có nhiệm vụ kéo thả card trong cùng một column
  const moveCards = async (dndOrderedCards, idColumn) => {

    const dndOrderedCardsIds = dndOrderedCards.map(c => c._id)
    const newBoard = { ...board }
    const updateToColumn = newBoard.columns.find(c => c._id === idColumn)
    updateToColumn.cards = dndOrderedCards
    updateToColumn.cardOrderIds = dndOrderedCardsIds
    setboard(newBoard)

    await updateColumnsAPI(idColumn, { cardOrderIds: dndOrderedCardsIds })
  }
  // Func này có nhiệm vụ xóa card ra khỏi column cũ và đổi columnId của card
  const deleteCardOverColumn = async (cardId, updateData, oldColumn) => {
    // update state khi kéo khỏi column cũ
    const newBoard = { ...board }
    const columnFindId = newBoard.columns.find(c => c._id === oldColumn._id)
    columnFindId.cards = oldColumn.cards.filter(d => d._id !== cardId)
    columnFindId.cardOrderIds = columnFindId.cards.map(d => d._id)
    setboard(newBoard)
    // delete cardid ra khỏi column vừa kéo

    const newColumn = cloneDeep(columnFindId)
    const deleteIdTemp = newColumn.cards.filter(c => !c.FE_PlaceholderCard)
    const deleteOrderIdsTemp = deleteIdTemp.map(m => m._id)
    await updateColumnsAPI(oldColumn._id, { cardOrderIds:  deleteOrderIdsTemp })
    // // // Đổi columnId của card đang kéo
    await updateCardsAPI(cardId, { columnId: updateData.columnId })
  }
  // Func này có nhiệm vụ update column
  const pushCardNextColumn = async (dndOrderedCards, columnId) => {
    const dndOrderedCardsIds = dndOrderedCards.map(c => c._id)
    const newBoard = { ...board }
    const updateColumnId = newBoard.columns.find(c => c._id === columnId)
    updateColumnId.cardOrderIds = dndOrderedCardsIds
    updateColumnId.cards = dndOrderedCards
    setboard(newBoard)
    await updateColumnsAPI(updateColumnId._id, { cardOrderIds: updateColumnId.cardOrderIds })
  }
  // const deleteCard = async (card,overColumn) => {
  //   // eslint-disable-next-line no-unused-vars
  //   await deleteCardsAPI(
  //     card._id
  //   )
  //   const newBoard = { ...board }
  //   const columnToUpdate = newBoard.columns.find(column => column._id === overColumn._id)

  //   if (columnToUpdate) {
  //     columnToUpdate.cards.filter(i => i._id !== card._id && !i.FE_PlaceholderCard)
  //     columnToUpdate.cardOrderIds.filter(i => i !== card._id)
  //   }
  //   console.log('columnToUpdate', columnToUpdate)
  //   console.log('card._id',card._id)
  //   setboard(newBoard)
  //   // .then((data, err) => {
  //   //   if (data) {
  //   //     toast.success('Đã delete thành công')
  //   //   }
  //   //   if (err) {
  //   //     toast.error('Xóa không thành công')
  //   //   }
  //   // })
  // }
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <Appbar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCards={moveCards}
        deleteCardOverColumn={deleteCardOverColumn}
        pushCardNextColumn={pushCardNextColumn}
      />
    </Container>
  )
}

export default Board
