import React from 'react';

const NavBar = ({ currentView, setView }) => {
  return (
    <nav className="navbar">
      <button onClick={() => setView('graph')}>Graph View</button>
      <button onClick={() => setView('matrix')}>Adjacency Matrix View</button>
      <button onClick={() => setView('text')}>Text View</button>
    </nav>
  );
};

export default NavBar;