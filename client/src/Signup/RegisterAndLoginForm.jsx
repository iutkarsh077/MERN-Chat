import React, { useContext, useState } from "react";
import axios from "axios";
import UserContext from "../Context/UserContext.js";
const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setusername1, setid1} = useContext(UserContext);
  const [isLoginorRegister, setIsLoginorRegister] = useState("register");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLoginorRegister === "register" ? "register" : "Login";
    await axios
      .post(`/user/${url}`, { username, password })
      .then((response) => {
        console.log(response.data);
        setusername1(username);
        setid1(response.data.id);
      })
      .catch((error) => {
        console.log("Error in receiving data", error);
      });
  };

  return (
    <>
      <div className="bg-blue-100 h-screen flex items-center">
        <form className="w-64 mx-auto">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 rounded-md my-2 outline-none border-2 block"
            placeholder="Username"
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-md my-2 outline-none border-2 block"
            placeholder="Password"
          />
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-blue-500 p-2 my-2 text-white text-lg"
          >
            {isLoginorRegister === "register" ? "Register" : "Login"}
          </button>
          <div className="text-center mt-2">
            {isLoginorRegister === "register" && (
              <div>
                Already a member ?
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoginorRegister("Login");
                  }}
                >
                  <p className="ml-1 font-semibold text-blue-700">Login here</p>
                </button>
              </div>
            )}
            {isLoginorRegister === "Login" && (
              <div>
                Don't have account ?
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLoginorRegister("register");
                  }}
                >
                  <p className="ml-1 font-semibold text-blue-700">Register</p>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default RegisterAndLoginForm;
