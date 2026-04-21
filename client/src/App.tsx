import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './src/pages/HomePage'
import LoginPage from './src/pages/LoginPage'
import RegisterPage from './src/pages/RegisterPage'
import NotFoundPage from './src/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App