import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Building2, Server, Tags } from 'lucide-react';
import '../styles/Masters.css';

const Masters = () => {
    const [activeTab, setActiveTab] = useState('company');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const pluralMap = {
        company: 'Companies',
        rack: 'Racks',
        category: 'Categories'
    };

    const fetchMasters = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'company' ? '/masters/companies/' :
                activeTab === 'rack' ? '/masters/racks/' :
                    '/masters/categories/';
            const response = await api.get(endpoint);
            setData(response.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasters();
        setFormData({ name: '', code: '' });
        setError('');
        setSuccess('');
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            let endpoint = '';
            let payload = {};

            if (activeTab === 'company') {
                endpoint = '/masters/companies/';
                payload = { name: formData.name };
            } else if (activeTab === 'rack') {
                endpoint = '/masters/racks/';
                payload = { code: formData.code };
            } else {
                endpoint = '/masters/categories/';
                payload = { name: formData.name, code: formData.code };
            }

            await api.post(endpoint, payload);
            setSuccess(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} added successfully!`);
            setFormData({ name: '', code: '' });
            fetchMasters();
        } catch (err) {
            console.error("Full error object:", err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.data && err.response.data.detail) {
                    const detail = err.response.data.detail;
                    if (Array.isArray(detail)) {
                        // Handle Pydantic validation errors (list of objects)
                        const msg = detail.map(e => `${e.loc ? e.loc.join('.') : ''}: ${e.msg}`).join(', ');
                        setError(`Validation Error: ${msg}`);
                    } else {
                        // Handle standard HTTP exceptions (string)
                        setError(detail);
                    }
                } else {
                    setError(`Server Error: ${err.response.status} ${err.response.statusText}`);
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError('Network Error: Could not connect to the backend. Is it running on port 8000?');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="masters-page fade-in">
            <div className="page-header">
                <h1 className="page-title">Master Data Management</h1>
                <p className="page-description">Manage Companies, Racks, and Categories for the filing system.</p>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
                    onClick={() => setActiveTab('company')}
                >
                    <Building2 size={18} /> Companies
                </button>
                <button
                    className={`tab-btn ${activeTab === 'rack' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rack')}
                >
                    <Server size={18} /> Racks
                </button>
                <button
                    className={`tab-btn ${activeTab === 'category' ? 'active' : ''}`}
                    onClick={() => setActiveTab('category')}
                >
                    <Tags size={18} /> Categories
                </button>
            </div>

            <div className="content-grid">
                <div className="form-section">
                    <h2>Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                    <form onSubmit={handleSubmit}>
                        {activeTab !== 'rack' && (
                            <div className="input-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    className="input-control"
                                    placeholder={`Enter ${activeTab} name`}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        {(activeTab === 'rack' || activeTab === 'category') && (
                            <div className="input-group">
                                <label>Code</label>
                                <input
                                    type="text"
                                    className="input-control"
                                    placeholder={`Enter ${activeTab} code`}
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                                {activeTab === 'category' && <small className="hint">Used for file reference generation (3 letters)</small>}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary">
                            <Plus size={18} /> Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </button>
                    </form>
                    {error && <div className="alert error">{error}</div>}
                    {success && <div className="alert success">{success}</div>}
                </div>

                <div className="card list-section">
                    <h2>Existing {pluralMap[activeTab] || (activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + 's')}</h2>
                    {loading ? <p>Loading...</p> : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    {activeTab !== 'rack' && <th>Name</th>}
                                    {(activeTab === 'rack' || activeTab === 'category') && <th>Code</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr><td colSpan="3">No records found.</td></tr>
                                ) : (
                                    data.map((item) => (
                                        <tr key={item.id}>
                                            <td>#{item.id}</td>
                                            {activeTab !== 'rack' && <td>{item.name}</td>}
                                            {(activeTab === 'rack' || activeTab === 'category') && <td>{item.code}</td>}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Masters;
