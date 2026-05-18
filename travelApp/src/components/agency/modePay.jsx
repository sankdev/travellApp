import React, { useState, useEffect } from 'react';
import { paymentModeService } from '../../services/paymentModeService';

const ModePayment = () => {
    const [paymentModes, setPaymentModes] = useState([]);
    const [newPaymentMode, setNewPaymentMode] = useState('');
    const [editMode, setEditMode] = useState(null);
    const [editPaymentMode, setEditPaymentMode] = useState('');

    useEffect(() => {
        fetchPaymentModes();
    }, []);

    const fetchPaymentModes = async () => {
        try {
            const modes = await paymentModeService.getActivePaymentModes();
            console.log('modes',modes)
            setPaymentModes(Array.isArray(modes) ? modes : []);
        } catch (error) {
            console.error('Failed to fetch payment modes:', error);
            setPaymentModes([]);
        }
    };

    const handleCreate = async () => {
        if (newPaymentMode) {
            await paymentModeService.createPaymentMode({ name: newPaymentMode });
            setNewPaymentMode('');
            fetchPaymentModes();
        }
    };

    const handleUpdate = async (id) => {
        if (editPaymentMode) {
            await paymentModeService.updatePaymentMode(id, { name: editPaymentMode });
            setEditMode(null);
            setEditPaymentMode('');
            fetchPaymentModes();
        }
    };

    const handleDelete = async (id) => {
        await paymentModeService.deletePaymentMode(id);
        fetchPaymentModes();
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Manage Payment Modes</h2>
            <div className="mb-4">
                <input
                    type="text"
                    value={newPaymentMode}
                    onChange={(e) => setNewPaymentMode(e.target.value)}
                    placeholder="New Payment Mode"
                    className="p-2 border rounded mr-2"
                />
                <button onClick={handleCreate} className="p-2 bg-blue-500 text-white rounded">Add</button>
            </div>
            <ul>
                {paymentModes.map((mode) => (
                    <li key={mode.id} className="mb-2 flex justify-between items-center">
                        {editMode === mode.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editPaymentMode}
                                    onChange={(e) => setEditPaymentMode(e.target.value)}
                                    className="p-2 border rounded mr-2"
                                />
                                <button onClick={() => handleUpdate(mode.id)} className="p-2 bg-green-500 text-white rounded">Save</button>
                                <button onClick={() => setEditMode(null)} className="p-2 bg-gray-500 text-white rounded">Cancel</button>
                            </>
                        ) : (
                            <>
                                <span>{mode.name}</span>
                                <div>
                                    <button onClick={() => { setEditMode(mode.id); setEditPaymentMode(mode.name); }} className="p-2 bg-yellow-500 text-white rounded mr-2">Edit</button>
                                    <button onClick={() => handleDelete(mode.id)} className="p-2 bg-red-500 text-white rounded">Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ModePayment;
