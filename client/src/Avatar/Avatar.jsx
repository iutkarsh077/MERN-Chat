import React from "react";

const Avatar = ({ username, userId }) => {
  const colors = [
    "bg-orange-200",
    "bg-amber-200",
    "bg-green-200",
    "bg-red-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-yellow-200",
    "bg-teal-200",
    "bg-pink-200",
    "bg-indigo-200",
    "bg-gray-200",
    "bg-brown-200",
    "bg-lime-200",
    "bg-cyan-200",
    "bg-emerald-200",
    "bg-lightBlue-200",
    "bg-warmGray-200",
    "bg-trueGray-200",
    "bg-coolGray-200",
  ];

  const getFirstCharacter = (str) => (str && str.length > 0 ? str[0] : "");

  const getColorIndex = (id) => {
    const userBase10 = parseInt(id.substring(10), 16);
    return userBase10 % colors.length;
  };

  const first = getFirstCharacter(username);
  const colorIndex = getColorIndex(userId);
  const color = colors[colorIndex];

  return (
    <div className={`w-8 h-8 rounded-full flex items-center text-center ${color}`}>
      <div className="uppercase text-center w-full opacity-70">{first}</div>
    </div>
  );
};

export default Avatar;
