import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './homepage';
import Signin from './signin';
import Signup from './signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<Signin/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
