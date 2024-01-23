import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { NavBar } from './components/nav-bar'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className='flex flex-row flex-grow min-h-screen bg-slate-200'>
      <NavBar />
      <div className="flex-1 flex flex-col">
        <App />
        <div className='flex w-full items-center justify-end pr-6 h-11 bg-slate-100 text-slate-500 text-[10px] mt-auto'>
          Powered by Crió © 2023
        </div>
      </div>
    </div>
  </React.StrictMode>,
)
