import React from 'react';
import ProductList from './components/ProductList';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <ProductList />
      </main>
    </div>
  );
}

export default App; 