import React, { useState, useEffect } from 'react';
import api from '../api';
import { Save, FileText, CheckCircle, Trash2 } from 'lucide-react';
import '../styles/FileCreation.css';

const FileCreation = () => {
    const [companies, setCompanies] = useState([]);
    const [racks, setRacks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [files, setFiles] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        creation_date: new Date().toISOString().split('T')[0],
        creator_name: '',
        company_id: '',
        rack_id: '',
        category_id: ''
    });

    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMasters();
        fetchFiles();
    }, []);

    const fetchMasters = async () => {
        try {
            const [compRes, rackRes, catRes] = await Promise.all([
                api.get('/masters/companies/'),
                api.get('/masters/racks/'),
                api.get('/masters/categories/')
            ]);
            setCompanies(compRes.data);
            setRacks(rackRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error("Error fetching masters", err);
        }
    };

    const fetchFiles = async () => {
        try {
            const res = await api.get('/files/');
            setFiles(res.data);
        } catch (err) {
            console.error("Error fetching files", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setGeneratedCode('');

        try {
            const response = await api.post('/files/', formData);
            setGeneratedCode(response.data.reference_code);
            fetchFiles();
            // Reset form but keep some fields like creator? No, reset all for now or keep date.
            setFormData({
                name: '',
                creation_date: new Date().toISOString().split('T')[0],
                creator_name: '',
                company_id: '',
                rack_id: '',
                category_id: ''
            });
        } catch (err) {
            setError('Failed to create file. Please check input.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) {
            return;
        }
        try {
            await api.delete(`/files/${fileId}`);
            fetchFiles();
        } catch (err) {
            console.error('Failed to delete file', err);
        }
    };


    return (
        <div className="file-creation-page fade-in">
            <div className="page-header">
                <h1 className="page-title">Create New File</h1>
            </div>

            <div className="content-grid">
                <div className="form-section">
                    <h2>File Details</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>File Name</label>
                            <input
                                type="text"
                                name="name"
                                className="input-control"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>Creation Date</label>
                                <input
                                    type="date"
                                    name="creation_date"
                                    className="input-control"
                                    value={formData.creation_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>File Creator Name</label>
                                <input
                                    type="text"
                                    name="creator_name"
                                    className="input-control"
                                    value={formData.creator_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>Company</label>
                                <select
                                    name="company_id"
                                    className="input-control"
                                    value={formData.company_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Company</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Rack</label>
                                <select
                                    name="rack_id"
                                    className="input-control"
                                    value={formData.rack_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Rack</option>
                                    {racks.map(r => <option key={r.id} value={r.id}>{r.code}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <select
                                    name="category_id"
                                    className="input-control"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Save size={18} /> {loading ? 'Saving...' : 'Save File'}
                        </button>
                    </form>

                    {error && <div className="alert error">{error}</div>}

                    {generatedCode && (
                        <div className="alert success fade-in">
                            <div className="success-content">
                                <CheckCircle size={24} />
                                <div>
                                    <strong>File Created Successfully!</strong>
                                    <p>Reference Code: <span className="ref-code">{generatedCode}</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="files-list-section">
                    <h2>Recent Files</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ref Code</th>
                                    <th>File Name</th>
                                    <th>Company</th>
                                    <th>Rack</th>
                                    <th>Category</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.length === 0 ? (
                                    <tr><td colSpan="6">No files created yet.</td></tr>
                                ) : (
                                    files.slice().reverse().map(file => (
                                        <tr key={file.id}>
                                            <td className="font-mono">{file.reference_code}</td>
                                            <td>{file.name}</td>
                                            <td>{file.company.name}</td>
                                            <td>{file.rack.code}</td>
                                            <td>{file.category.name}</td>
                                            <td>
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDeleteFile(file.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileCreation;
