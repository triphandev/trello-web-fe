import { toast } from 'react-toastify'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Tooltip from '@mui/material/Tooltip'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import { Button, TextField } from '@mui/material'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import { useState } from 'react'
import ListCards from './ListCards/ListCards'
import { mapOrder } from '~/utils/sort'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import CloseIcon from '@mui/icons-material/Close'

function Column({ column, createNewCard }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, '_id')
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column._id, data: { ...column } })
  const dndKitColumnStyle = {
    // touchAction: 'none',
    transform: CSS.Translate.toString(transform),
    transition,
    //Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua một cái column
    //dài thì phải ké ở khi vực giữa rất khó chịu (demo ở video 32). Lưu ý lúc này phải kết hợp
    // với {...listeners} nằm ở Box chứ không phải ở div ngoài cùng để tránh trường hợp kéo vào vùng xanh.
    height: '100%',
    opacity: isDragging ? 0.5 : undefined
  }

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm)
  const [newCardTitle, setNewCardTitle] = useState('')
  const addNewCard = async () => {
    if (!newCardTitle) {
      // console.log('Hay nhap title di')
      toast.error('Add new card success !!!', { position: 'bottom-right' })
      return
    }
    // console.log(newColumnTitle)
    // Gọi API ở đây
    await createNewCard({
      title: newCardTitle,
      columnId: column?._id
    })
    //Đóng trạng thái thêm collumn mới & Clear Input
    toggleOpenNewCardForm()
    setNewCardTitle('')
    toast.success('Add new card success !!!', { position: 'bottom-right' })
  }
  return (
    <div ref={setNodeRef} style={dndKitColumnStyle} {...attributes} >
      <Box {...listeners} sx={{
        minWidth: '300px',
        maxWidth: '300px',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : '#ebecf0'),
        ml: 2,
        borderRadius: '6px',
        height: 'fit-content',
        // height:'100%',
        maxHeight: (theme) => `calc(${theme.trell.boarContent} - ${theme.spacing(5)})`
      }}>
        {/*Box header */}
        <Box sx={{
          height: (theme) => theme.trell.colunmHeaderHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography sx={{
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }} variant='h6'>
            {column.title}
          </Typography>
          <Box>
            <Tooltip title='more oprion'>
              <ExpandMoreIcon
                id="basic-button-workspaces"
                aria-controls={open ? 'basic-menu-colunm-dropdown' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ color: 'text.primary', cursor: 'pointer' }}
              />
            </Tooltip>
            <Menu
              id="basic-menu-workspaces"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-colunm-dropdown'
              }}
            >
              <MenuItem>
                <ListItemIcon>
                  <AddCardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon><DeleteForeverIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Remove this colunm</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon><Cloud fontSize="small" /></ListItemIcon>
                <ListItemText>Archive this colunm</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/*Box content */}
        <ListCards cards={orderedCards} />
        {/*Box footer */}
        <Box sx={{
          height: (theme) => theme.trell.colunmFooterHeight,
          p: 2
        }}>
          {!openNewCardForm
            ? <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
              <Button
                onClick={() => toggleOpenNewCardForm()}
                startIcon={<AddCardIcon />}>
                Add new card
              </Button>
              <Button >
                <Tooltip title='Drag to move'>
                  <DragHandleIcon sx={{ cursor: 'pointer' }} />
                </Tooltip>
              </Button>
            </Box>
            :
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
              <Box>
                <TextField
                  label="Enter card title ..."
                  type="text" size='small'
                  variant='outlined'
                  autoFocus
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  sx={{
                    '& label': { color: (theme) => theme.palette.primary.main },
                    '& input': {
                      color: (theme) => theme.palette.primary.main,
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                    },
                    '& label.Mui-focused': { color: (theme) => theme.palette.primary.main },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: (theme) => theme.palette.primary.main
                      },
                      '&:hover fieldset': {
                        borderColor: (theme) => theme.palette.primary.main
                      },
                      '&:.Mui-focused fieldset': {
                        borderColor: (theme) => theme.palette.primary.main
                      },
                      '& .MuiOutlinedInput-input': {
                        borderRadius: 1
                      }
                    }
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                <Button
                  variant='contained' color='success'
                  size='small'
                  sx={{
                    boxShadow: 'none',
                    border: '0.5px solid',
                    borderColor: (theme) => theme.palette.success.main,
                    '&:hover': { bgcolor: (theme) => theme.palette.success.main }
                  }}
                  onClick={() => addNewCard()}>
                  Add
                </Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleOpenNewCardForm()}
                />
              </Box>
            </Box>

          }
        </Box>
      </Box>
    </div>
  )
}

export default Column