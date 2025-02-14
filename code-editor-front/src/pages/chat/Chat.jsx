import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import "./Chat.css";

const Chat = () => {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatPartnerName, setChatPartnerName] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserId(decodedToken.sub); // Assuming 'sub' contains the user's ID

          const response = await axios.get(
            `http://127.0.0.1:8000/api/message/get/${chatId}`
          );

          const { chat_partner_name, messages } = response.data;
          setMessages(messages);
          setChatPartnerName(chat_partner_name);
        } else {
          console.error("Token not found");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chatId]);

  const sendMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.post(
          `http://127.0.0.1:8000/api/message/createMessage/${chatId}`,
          { message },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages([...messages, response.data.message]); // Adjust to match the response structure
        setMessage("");
      } else {
        console.error("Token not found");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">Chat with {chatPartnerName}</h1>
      <div className="messages-container">
        {messages &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender_id == userId ? "own-message" : "other-message"
              }`}
            >
              <strong>
                {msg.sender_id == userId ? "You" : msg.sender_name}
              </strong>{" "}
              {msg.message}
            </div>
          ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="message-input"
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
