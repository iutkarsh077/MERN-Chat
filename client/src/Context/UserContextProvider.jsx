import React, { useEffect, useState } from 'react';
import UserContext from './UserContext.js';
import axios from 'axios';

const UserContextProvider = ({children}) =>{
    const [username1, setusername1] = useState(null);
    const [id1, setid1] = useState(null);
    useEffect(()=>{
        axios.get('/user/profile').then((response)=>{
            setid1(response.data.userId);
            setusername1(response.data.username);
        }).catch((error)=>{
            console.log(error);
        })
    }, [])

    return (
        <UserContext.Provider value={{username1, id1, setusername1, setid1}}>{children}</UserContext.Provider>
    )
}

export default UserContextProvider;