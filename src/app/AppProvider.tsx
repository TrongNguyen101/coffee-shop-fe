import { App } from 'antd';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from '@/store/store';
import { AuthProvider } from './AuthProvider';
import { router } from './router';

export function AppProvider() {
  return (
    <Provider store={store}>
      <App>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </App>
    </Provider>
  );
}
