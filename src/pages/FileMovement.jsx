import React, { useState, useEffect } from 'react';
import api from '../api';
import SearchBar from '../components/SearchBar';
import { ArrowRight, Check, History } from 'lucide-react';
import '../styles/FileMovement.css';

const FileMovement = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        handed_over_to: '',
        transfer_date: new Date().toISOString().split('T')[0],
        expected_return_date: '',
        purpose: ''
    });
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMovements();
    }, []);

    const fetchMovements = async () => {
        try {
            const response = await api.get('/movements/');
            setMovements(response.data);
        } catch (err) {
            console.error("Failed to fetch movements", err);
        }
    };

    const handleSelectFile = (file) => {
        setSelectedFile(file);
        setError('');
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file first.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/movements/', {
                ...formData,
                file_id: selectedFile.id
            });
            fetchMovements();
            // Reset form
            setFormData({
                handed_over_to: '',
                transfer_date: new Date().toISOString().split('T')[0],
                expected_return_date: '',
                purpose: ''
            });
            setSelectedFile(null); // Optional: clear selection
            // We might want to clear the SearchBar input too, but that requires state lifting or ref.
            // For now, let's just proceed.
        } catch (err) {
            setError('Failed to record movement.');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (movementId) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            await api.put(`/movements/${movementId}/return`, {
                actual_return_date: today,
                status: "Received"
            });
            fetchMovements();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    // Filter movements for the list
    const filteredMovements = movements.filter(m =>
        m.file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.file.reference_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.handed_over_to.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="file-movement-page fade-in">
            <div className="page-header">
                <h1 className="page-title">File Movement Tracking</h1>
            </div>

            <div className="content-grid-vertical">
                <div className="form-section">
                    <h2>Record New Movement</h2>
                    <div className="input-group">
                        <label>Select File</label>
                        <SearchBar onSelect={handleSelectFile} placeholder="Search by name or code..." />
                        {selectedFile && <div className="selected-file-badge">Selected: {selectedFile.reference_code}</div>}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="input-group">
                                <label>Handed Over To</label>
                                <input
                                    type="text"
                                    name="handed_over_to"
                                    className="input-control"
                                    value={formData.handed_over_to}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Purpose</label>
                                <input
                                    type="text"
                                    name="purpose"
                                    className="input-control"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>Transfer Date</label>
                                <input
                                    type="date"
                                    name="transfer_date"
                                    className="input-control"
                                    value={formData.transfer_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Expected Return Date</label>
                                <input
                                    type="date"
                                    name="expected_return_date"
                                    className="input-control"
                                    value={formData.expected_return_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <ArrowRight size={18} /> Record Movement
                        </button>
                        {error && <div className="alert error">{error}</div>}
                    </form>
                </div>

                <div className="card list-section">
                    <div className="list-header">
                        <h2>Movement History</h2>
                        <div className="list-search">
                            <input
                                type="text"
                                className="input-control"
                                placeholder="Filter history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ref Code</th>
                                    <th>File Name</th>
                                    <th>Handed To</th>
                                    <th>Date</th>
                                    <th>Expected Return</th>
                                    <th>Actual Return</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMovements.length === 0 ? (
                                    <tr><td colSpan="8">No movements recorded.</td></tr>
                                ) : (
                                    filteredMovements.slice().reverse().map(m => (
                                        <tr key={m.id} className={m.status === 'Received' ? 'row-received' : 'row-moved'}>
                                            <td>{m.file.reference_code}</td>
                                            <td>{m.file.name}</td>
                                            <td>{m.handed_over_to}</td>
                                            <td>{m.transfer_date}</td>
                                            <td>{m.expected_return_date}</td>
                                            <td>{m.actual_return_date || '-'}</td>
                                            <td>
                                                <span className={`status-badge ${m.status.toLowerCase()}`}>{m.status}</span>
                                            </td>
                                            <td>
                                                {m.status === 'Moved' && (
                                                    <button className="btn-sm btn-receive" onClick={() => handleReturn(m.id)}>
                                                        Mark Received
                                                    </button>
                                                )}
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

export default FileMovement;
