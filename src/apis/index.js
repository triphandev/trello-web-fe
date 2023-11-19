import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

//Board
export const fetchBoardDetailsAPI = async (boardId) => {
  const request = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
  return request.data
}
export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const request = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
  return request.data
}
//Columns
export const createNewColumnsAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
  return response.data
}
export const updateColumnsAPI = async (columnId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
  return response.data
}


//Cards
export const createNewCardsAPI = async (newCarData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCarData)
  // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
  return response.data
}
export const updateCardsAPI = async (cardId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/cards/${cardId}`, updateData)
  // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
  return response.data
}
export const deleteCardsAPI = async (cardId) => {
  const response = await axios.delete(`${API_ROOT}/v1/cards/${cardId}`)
  // Lưu ý: axios sẽ trả kết quả về qua property của nó là data
  return response
}