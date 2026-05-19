import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.addEventListener('error', (event) => {
    console.error('GLOBAL ERROR:', event.error);
    const div = document.createElement('div');
    div.style.color = 'red';
    div.style.background = 'white';
    div.style.padding = '20px';
    div.style.position = 'fixed';
    div.style.top = '0';
    div.style.zIndex = '9999';
    div.innerText = event.error ? event.error.stack : 'Unknown error';
    document.body.appendChild(div);
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
console.log('Testing main.jsx connection');
