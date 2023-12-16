import React, { useContext, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import UserContext from "../Context/UserContext.js";
import Logo from "../Logo.jsx";
import './Chat.css'
import axios from "axios";
import { uniqBy } from "lodash";
const Chat = () => {
  const [Ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageTest, setNewMessageTest] = useState("");
  const [userMessages, setUserMessage] = useState([]);
  const { username1, id1 } = useContext(UserContext);
  const divUnderMessages = useRef();
  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:3000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected, trying to Reconnect");
        connectToWs();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    // console.log(peopleArray);
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    // console.log(people);
    setOnlinePeople(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      // console.log({ e, messageData });
      setUserMessage((prev) => [...prev, { ...messageData }]);
    }
  }

  function sendMessage(e) {
    e.preventDefault();
    // console.log(newMessageTest);
    Ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageTest,
      })
    );
    setUserMessage((prev) => [
      ...prev,
      {
        text: newMessageTest,
        sender: id1,
        recipient: selectedUserId,
        _id: Date.now(),
      },
    ]);
    setNewMessageTest("");
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      // console.log(div);
      div.scrollIntoView({ behaviour: "smooth", block: "end" });
    }
  }, [userMessages]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("user/messages/" + selectedUserId).then((res) => {
        setUserMessage(res.data);
      });
    }
  }, [selectedUserId]);

  const onlineExclOurUser = { ...onlinePeople };
  delete onlineExclOurUser[id1];

  const messageWithoutDupes = uniqBy(userMessages, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-blue-100 w-1/3 p-2">
        <Logo />
        {Object.keys(onlineExclOurUser).map((userId) => (
          <div
            key={userId}
            onClick={() => setSelectedUserId(userId)}
            className={
              "border-b hover:cursor-pointer border-gray-100 py-2 md:text-lg text-sm font-semibold flex items-center gap-2 " +
              (selectedUserId === userId ? "bg-blue-200" : "")
            }
          >
            <Avatar username={onlinePeople[userId]} userId={userId} />
            <span>{onlinePeople[userId]}</span>
          </div>
        ))}
      </div>
      <div className="bg-blue-300 w-2/3 p-2 flex flex-col">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex items-center justify-center h-1/2">
              <div className="md:text-3xl text-md font-bold opacity-50 text-blue-50 font-mono">
                &larr; Select a Person from Sidebar
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll scrollbar-hide absolute top-0 left-0 right-0 bottom-2">
                {messageWithoutDupes.map((messages) => (
                  <div
                    key={messages._id}
                    className={
                      messages.sender === id1 ? "text-right" : "text-left"
                    }
                  >
                    <div
                      className={
                        "text-left inline-block my-2 rounded-md text-sm md:text-md p-2 " +
                        (messages.sender === id1
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500")
                      }
                    >
                      {messages.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              type="text"
              className="flex-grow rounded-sm outline-none hover:placeholder:text-green-700 bg-white border"
              placeholder="Chat here"
              value={newMessageTest}
              onChange={(e) => setNewMessageTest(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 rounded-sm text-white p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
