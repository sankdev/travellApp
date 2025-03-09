import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { agencyAssociationService } from '../../services/agencyAssociationService';
import { agencyService } from '../../services/agencyService';
import { pricingRuleService } from '../../services/pricingRuleService';
import { volService } from '../../services/volService';

const PricingRuleCRUD = () => {
  const [pricingRules, setPricingRules] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [vols, setVols] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    agencyId: '',
    companyId: '',
    agencyVolId: '',
    agencyClassId: '',
    typePassenger: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rules, agencies, vols, classes] = await Promise.all([
        pricingRuleService.getUserPricingRules(),
        agencyService.getUserAgencies(),
        volService.getVols(),
        agencyAssociationService.getUserClassAgencies()
      ]);
      setPricingRules(rules || []);
      setAgencies(agencies.data || []);
      setVols(Array.isArray(vols) ? vols : []);
      setClasses(classes || []);
    } catch {
      setMessage({ type: 'error', text: 'Error loading data' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (editMode) {
        await pricingRuleService.updatePricingRule(editId, formData);
        setMessage({ type: 'success', text: 'Pricing rule updated successfully!' });
      } else {
        await pricingRuleService.createPricingRule(formData);
        setMessage({ type: 'success', text: 'Pricing rule created successfully!' });
      }
      resetForm();
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save pricing rule' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      agencyId: '',
      companyId: '',
      agencyVolId: '',
      agencyClassId: '',
      typePassenger: '',
      price: ''
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (rule) => {
    setFormData({
      agencyId: rule.agencyId,
      companyId: rule.companyId,
      agencyVolId: rule.agencyVolId,
      agencyClassId: rule.agencyClassId,
      typePassenger: rule.typePassenger,
      price: rule.price
    });
    setEditMode(true);
    setEditId(rule.id);
  };

  const handleDelete = async (id) => {
    try {
      await pricingRuleService.deletePricingRule(id);
      setMessage({ type: 'success', text: 'Pricing rule deleted successfully!' });
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete pricing rule' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Manage Pricing Rules</h1>
      
      {message.text && (
        <div className={`p-3 rounded-md mb-4 text-white text-center ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          name="agencyId"
          value={formData.agencyId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Agency</option>
          {agencies.map((agency) => (
            <option key={agency.id} value={agency.id}>
              {agency.name}
            </option>
          ))}
        </select>
    
        <select
          name="agencyVolId"
          value={formData.agencyVolId}
          onChange={handleChange}
          required
          className="w-md px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Vol</option>
          {vols.map((vol) => (
            <option key={vol.id} value={vol.id}>
              {vol.name}
            </option>
          ))}
        </select>
    
        <select
          name="agencyClassId"
          value={formData.agencyClassId}
          onChange={handleChange}
          required
          className="w-md px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.class.name}>
              {cls.class.name}
            </option>
          ))}
        </select>
    
        <input
          type="text"
          name="typePassenger"
          value={formData.typePassenger}
          onChange={handleChange}
          required
          placeholder="Type Passenger"
          className="w-md px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
    
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          placeholder="Price"
          className="w-md px-3 py-2 text-sm font-medium border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    
      <button
        type="submit"
        disabled={loading}
        className={`w-md mt-4 px-4 py-2 text-white font-semibold bg-indigo-600 rounded-md shadow-md transition duration-200 ease-in-out transform hover:scale-105 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Saving..." : editMode ? "Update Pricing Rule" : "Create Pricing Rule"}
      </button>
    </form>
    

       {/* Table */}
       <div className="bg-white p-6 shadow rounded-lg">
       <h2 className="text-xl font-semibold mb-4 text-gray-700">Pricing Rule List</h2>
       <div className="overflow-x-auto">
         <table className="w-full border-collapse">
           <thead>
             <tr className="bg-gray-100">
               <th className="border p-2">Agency</th>
               <th className="border p-2">Vol</th>
               <th className="border p-2">Class</th>
               <th className="border p-2">Passenger Type</th>
               <th className="border p-2">Price</th>
               <th className="border p-2">Actions</th>
             </tr>
           </thead>
           <tbody>
             {pricingRules.map((rule) => (
               <tr key={rule.id} className="text-center">
                 <td className="border p-2">{rule.agency?.name || 'N/A'}</td>
                 <td className="border p-2">{rule.vol?.flight?.name || 'N/A'}</td>
                 <td className="border p-2">{rule.class?.class?.name || 'N/A'}</td>
                 <td className="border p-2">{rule.typePassenger}</td>
                 <td className="border p-2">{rule.price}</td>
                 <td className="border p-2 flex justify-center space-x-4">
                   <FontAwesomeIcon icon={faEdit} className="text-indigo-600 cursor-pointer" onClick={() => handleEdit(rule)} />
                   <FontAwesomeIcon icon={faTrash} className="text-red-600 cursor-pointer" onClick={() => handleDelete(rule.id)} />
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
        </div>
      </div>
    </div>
  );
};

export default PricingRuleCRUD;
