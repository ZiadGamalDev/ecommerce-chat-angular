# E-Commerce Live Chat (Angular)

This is a minimal **Angular** app designed to simulate the customer side of a **live chat system**. Customers can open the chat interface and communicate in real-time with available support agents using **Socket.IO**.

This app is **integrated with the full customer support backend** and is fully dynamic — you don't need to register the customer beforehand.

---

## 💬 Features

- 🔐 Chat initiated without login (anonymous or via user ID)
- 💬 Real-time messaging via Socket.IO
- 📶 Typing indicator for customers and agents
- 🚀 Automatically assigns to an available agent
- 🧠 Smart behavior: If agents are busy/away, the chat is queued

---

## 🔗 Real-time Flow

Once a customer opens the chat and sends a message:

1. The backend checks for available agents.
2. If one is available, the chat is assigned instantly.
3. If no agents are available, chat is marked as **new** and queued.
4. Customer gets notified when agent responds.

---

## 🚀 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/ZiadGamalDev/ecommerce-chat-angular.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `src/environments/environment.ts`:
   ```ts
   export const environment = {
     production: false,
     socketUrl: 'http://localhost:5000',
    socketUrl: 'http://localhost:3000'
   };
   ```

4. Run the app:
   ```bash
   ng serve
   ```

---

## 🌍 Connect to the Backend

For this to work, make sure to run the backend from:
👉 [Customer Support Node Backend](https://github.com/ZiadGamalDev/customer-support-node)

Or you can
👉 [View Root Repository](https://github.com/ZiadGamalDev/customer-support-system)

---

## 📄 License

MIT – plug it into your own e-commerce systems or build on top of it.
