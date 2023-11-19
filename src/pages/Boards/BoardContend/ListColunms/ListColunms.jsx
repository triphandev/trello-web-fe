import { toast } from 'react-toastify'
import Box from '@mui/material/Box'
import Column from './Colunm/Colunm'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { TextField } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

function ListColunms({ columns, createNewColumn, createNewCard }) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => setOpenNewColumnForm(!openNewColumnForm)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please , title empty !!!', { position: 'bottom-left' })
      return
    }
    // console.log(newColumnTitle)
    // Gọi API ở đây
    const newColumnData = {
      title: newColumnTitle
    }
    /**
     * Gọi lên props function createNewColumn nằm ở component cha cao nhất {boards/_id.jsx}
     * Lưu ý: Về sau ở học phần MERN Stack Advance nâng cao học trực tiếp mình sẽ với mình thì chúng ta
     * sẽ đưa dữ liệu Board ra ngoài redux Global Store,
     * Thì lúc này chúng ta có thể gọi luôn API ở đây là xong thay vì phải lần lượt gọi ngược lên những component cha
     * phía bên trên. (Đối với coponent con nằm càng sâu thì càng khổ)
     * - Với việc sử dụng Redux như vậy thì code sẽ clean chuẩn chỉnh hơn rất nhiều.
     */
    await createNewColumn(newColumnData)
    //Đóng trạng thái thêm collumn mới & Clear Input
    toast.success('Add new column success !!!', { position: 'bottom-left' })
    setNewColumnTitle('')
    toggleOpenNewColumnForm()
  }
  return (
    <SortableContext items={columns?.map(c => c._id)} strategy={horizontalListSortingStrategy}>
      <Box
        sx={{
          bgcolor: 'inherit',
          width: '100%',
          height: '100%',
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          '::-webkit-scrollbar-track': {
            m: 2
          }
        }}
      >
        {columns?.map(column => <Column key={column._id} column={column} createNewCard={createNewCard} />)}
        {!openNewColumnForm ?
          <Box sx={{
            minWidth: '250px',
            maxWidth: '250px',
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button
              startIcon={<NoteAddIcon sx={{
                color: 'white'
              }} />}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: '8px'
              }}
              onClick={() => toggleOpenNewColumnForm()}
            >
              Add new column
            </Button>
          </Box>

          : <Box
            sx={{
              minWidth: '250px',
              maxWidth: '250px',
              mx: 2,
              p: 1,
              borderRadius: '6px',
              height: 'fit-content',
              bgcolor: '#ffffff3d',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <TextField
              label="Enter column title ..."
              type="text" size='small'
              variant='outlined'
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                '& label': { color: 'white' },
                '& input': { color: 'white' },
                '& label.Mui-focused': { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white'
                  },
                  '&:hover fieldset': {
                    borderColor: 'white'
                  },
                  '&:.Mui-focused fieldset': {
                    borderColor: 'white'
                  }
                }
              }}
            />
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Button
                variant='contained' color='success'
                size='small'
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                }}
                onClick={() => addNewColumn()}
              >
                Add Column
              </Button>
              <CloseIcon
                fontSize='small'
                sx={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': { color: (theme) => theme.palette.warning.light }
                }}
                onClick={() => toggleOpenNewColumnForm()}
              />
            </Box>
          </Box>
        }
      </Box>

    </SortableContext>
  )
}

export default ListColunms
