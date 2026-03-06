import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='text-cyan-400 text-5xl'>
      Hello world!<br />
      Tailwind CSS is working!
    </div>
  )
}

export default App
