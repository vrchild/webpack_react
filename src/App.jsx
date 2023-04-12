import React, { Suspense, lazy } from 'react'
import {Link, Route, Routes} from 'react-router-dom'
// import Home from './Home/index'
// import About from './About/index'

// 路由懒加载
const Home = lazy(() => import(/* webpackChunkName: "home" */ './Home/index'))
const About = lazy(() => import(/* webpackChunkName: "about" */ './About/index'))

function App() {
  return (
    <div>
      <h1>react</h1>
      <ul>
        <li><Link to='/home'>Home</Link></li>
        <li><Link to='/about'>About</Link></li>
      </ul>
      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          {/*  <Route path="/" element={<App />}>*/}
          <Route path='/home' element={<Home />} />
          <Route path='/about' element={<About />} />
          {/*</Route>*/}
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
