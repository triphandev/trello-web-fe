// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import theme from './theme'
import GlobalStyles from '@mui/material/GlobalStyles'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const inputGlobalStyles = <GlobalStyles styles={{ div: {} }} />
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <CssVarsProvider theme={theme}>
    <CssBaseline />
    {inputGlobalStyles}
    <App />
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  </CssVarsProvider>
  /* </React.StrictMode> */
)