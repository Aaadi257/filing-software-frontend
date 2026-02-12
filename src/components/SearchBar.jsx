import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Search } from 'lucide-react';
import '../styles/SearchBar.css';

const SearchBar = ({ onSelect, placeholder = "Search for a file..." }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        // Click outside handler
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 1) {
                setLoading(true);
                try {
                    const response = await api.get(`/files/?search=${query}`);
                    setResults(response.data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (file) => {
        setQuery(`${file.reference_code} - ${file.name}`);
        onSelect(file);
        setIsOpen(false);
    };

    return (
        <div className="search-wrapper" ref={wrapperRef}>
            <div className="search-input-container">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                />
                {loading && <div className="spinner"></div>}
            </div>

            {isOpen && results.length > 0 && (
                <div className="search-dropdown">
                    {results.map((file) => (
                        <div
                            key={file.id}
                            className="search-item"
                            onClick={() => handleSelect(file)}
                        >
                            <div className="search-item-code">{file.reference_code}</div>
                            <div className="search-item-name">{file.name}</div>
                        </div>
                    ))}
                </div>
            )}
            {isOpen && results.length === 0 && !loading && (
                <div className="search-dropdown">
                    <div className="search-item no-results">No files found</div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
