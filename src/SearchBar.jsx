import React from 'react';

const SearchBar = ({ searchTerm, onSearch }) => {
  return (
    <div
      style={{
        backgroundColor: '#f0f0f0',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <input
        type="text"
        placeholder="Buscar música..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: '80%',
          maxWidth: '500px',
          padding: '0.75rem',
          fontSize: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />
    </div>
  );
};

export default SearchBar;
