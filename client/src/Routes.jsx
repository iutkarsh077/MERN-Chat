import React, { useContext } from 'react'
import RegisterAndLoginForm from './Signup/RegisterAndLoginForm.jsx'
import UserContext from './Context/UserContext.js'
import Chat from './ChatBox/Chat.jsx';
const Routes = () => {

    const {username1, id1} = useContext(UserContext);
    
    if(username1){
        return <Chat/>
    }
  return (
    <>
      <RegisterAndLoginForm/>
    </>
  )
}

export default Routes
