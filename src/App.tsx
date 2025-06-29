import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { ChatPage } from '@/pages/chat-page';
import { CalendarPage } from '@/pages/calendar-page';
import { SettingsPage } from '@/pages/settings-page';
import { SharePage } from '@/pages/share-page';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Routes>
        <Route path="/share/:chatId" element={<SharePage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;