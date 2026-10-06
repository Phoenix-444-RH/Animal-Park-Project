import "../styles/globals.css";
import { AppProvider } from "../lib/app-state";
import ChatbotWidget from "../components/chatbot/ChatbotWidget";

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
      <ChatbotWidget />
    </AppProvider>
  );
}
