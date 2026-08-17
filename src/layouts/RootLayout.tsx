import { Outlet } from 'react-router-dom';
import { Agentation } from 'agentation';

export default function RootLayout() {
  return (
    <div>
      <Outlet />
      {import.meta.env.DEV && <Agentation />}
    </div>
  );
}
