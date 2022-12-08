import React from 'react'
import { MainView } from './components'

const App = () => {
  return (
    <html>
    <head>
      
      <script src='https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.js'></script>
      <link href='https://api.mapbox.com/mapbox-gl-js/v2.11.0/mapbox-gl.css' rel='stylesheet' />

    </head>
    <body>
      <div className="container">
      <MainView />
      </div>
    </body>
    </html>

  )
}

export default App
