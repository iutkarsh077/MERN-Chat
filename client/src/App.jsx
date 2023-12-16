import UserContextProvider from './Context/UserContextProvider.jsx'
import Routes from './Routes.jsx'

function App() {

  return (
   <UserContextProvider>
   <Routes/>
   </UserContextProvider>
  )
}

export default App
