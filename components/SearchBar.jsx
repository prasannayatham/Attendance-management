import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

function SearchBar({ placeholder = "Search...", onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <InputGroup>
        <InputGroup.Text style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          border: 'none',
          color: 'white'
        }}>
          🔍
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
          style={{
            border: '2px solid #e2e8f0',
            borderLeft: 'none',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </InputGroup>
    </div>
  );
}

export default SearchBar;
