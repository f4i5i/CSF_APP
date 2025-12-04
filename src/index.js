import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import reducer from './context/reducer';
import { StateProvider } from './context/StateProvider';
import { initialState } from './context/initialState';
import { AuthProvider } from './context/auth';
import { ApiProvider } from './components/providers/ApiProvider';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApiProvider>
      <AuthProvider>
        <BrowserRouter>
          <StateProvider initialState={initialState} reducer={reducer}>
            <Routes>
              <Route path="/*" element={<App loading={true}/>} />
            </Routes>
          </StateProvider>
        </BrowserRouter>
      </AuthProvider>
    </ApiProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
