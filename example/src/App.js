import React from 'react'
import { useMyHook } from 'discord-context'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App