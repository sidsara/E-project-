import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, selectedUser]);

  const addMessageToConversation = useCallback((conversationId, message) => {
    setConversations((prev) => {
      const conversation = [...(prev[conversationId] || [])];

      // Vérification plus robuste des doublons
      const messageExists = conversation.some(
        (m) =>
          m.text === message.text &&
          Math.abs(
            new Date(m.timestamp).getTime() -
              new Date(message.timestamp).getTime()
          ) < 1000 && // tolérance de 1 seconde
          m.from === message.from
      );

      if (!messageExists) {
        conversation.push({
          ...message,
          timestamp: new Date(message.timestamp),
        });
        // Trier par timestamp pour maintenir l'ordre chronologique
        conversation.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      }

      return {
        ...prev,
        [conversationId]: conversation,
      };
    });
  }, []);

  // Récupérer l'utilisateur actuel
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  useEffect(() => {
    let socketInstance = null;

    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/chat/users", {
          credentials: "include",
        });

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const formattedUsers = data.map((user) => ({
          ...user,
          displayName: user.prenom ? `${user.nom} ${user.prenom}` : user.nom,
          roleLabel: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    const initializeSocket = () => {
      socketInstance = io("http://localhost:3000", {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected with ID:", socketInstance.id);
      });

      socketInstance.on("receiveMessage", (messageData) => {
        console.log("Message reçu:", messageData);
        // Utiliser l'ID de l'expéditeur pour identifier la conversation
        const conversationId = messageData.from.toString();
        addMessageToConversation(conversationId, {
          ...messageData,
          timestamp: new Date(messageData.timestamp),
        });
      });

      socketInstance.on("messageSent", (messageData) => {
        console.log("Message envoyé confirmé:", messageData);
        // Utiliser l'ID du destinataire pour identifier la conversation
        const conversationId = messageData.to.toString();
        addMessageToConversation(conversationId, {
          ...messageData,
          timestamp: new Date(messageData.timestamp),
        });
      });

      socketInstance.on("messageError", (error) => {
        console.error("Message error:", error);
        setError(error.message);
        setTimeout(() => setError(null), 3000);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setError("Connection failed");
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      setSocket(socketInstance);
    };

    // Initialiser dans l'ordre
    fetchCurrentUser().then(() => {
      initializeSocket();
      fetchUsers();
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [navigate, addMessageToConversation]);

  const sendMessage = useCallback(() => {
    if (message.trim() && socket && selectedUser && socket.connected) {
      const messageData = {
        text: message.trim(),
        to: selectedUser.id, // Utiliser l'ID avec préfixe
        timestamp: new Date().toISOString(),
      };

      console.log("Envoi du message:", messageData);
      console.log("Selected user:", selectedUser);
      socket.emit("sendMessage", messageData);
      setMessage("");
    } else {
      if (!socket?.connected) {
        setError("Connection lost. Please refresh the page.");
      }
    }
  }, [message, socket, selectedUser]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => user.id.toString() !== currentUserId?.toString()) // Comparer les IDs corrects
    : [];

  if (loading) {
    return (
      <div className="loading">
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="users-list">
        <div className="users-header">
          <h3>Conversations</h3>
          <div className="connection-status">
            <span
              className={`status-indicator ${
                socket?.connected ? "connected" : "disconnected"
              }`}
            >
              {socket?.connected ? "🟢" : "🔴"}
            </span>
          </div>
        </div>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`user-item ${
                selectedUser?.id === user.id ? "active" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="user-avatar">
                {user.nom ? user.nom[0].toUpperCase() : "?"}
              </div>
              <div className="user-info">
                <span className="user-name">{user.displayName}</span>
                <span className="user-role">{user.roleLabel}</span>
              </div>
              {conversations[user.id]?.length > 0 && (
                <div className="message-count">
                  {conversations[user.id].length}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-users">
            <p>No users available</p>
          </div>
        )}
      </div>

      <div className="chat-container">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <h2>
                {selectedUser.displayName}
                <span className="user-role-small">
                  {selectedUser.roleLabel}
                </span>
              </h2>
            </div>
            <div className="messages">
              {(conversations[selectedUser.id] || []).map((msg, i) => {
                // Déterminer si le message est reçu ou envoyé
                const isReceived =
                  msg.from.toString() === selectedUser.id.toString();

                return (
                  <div
                    key={`${msg.timestamp}-${i}`}
                    className={`message ${isReceived ? "received" : "sent"}`}
                  >
                    <p>{msg.text}</p>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-area">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={handleKeyPress}
                disabled={!socket?.connected}
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || !socket?.connected}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
