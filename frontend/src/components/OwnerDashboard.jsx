import React, { useState, useEffect } from 'react';
import ParkingForm from './ParkingForm';
import ParkingCard from './ParkingCard';
import { api } from '../api';

export default function OwnerDashboard({ currentUser }) {
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchParkings();
  }, []);

  const fetchParkings = async () => {
    setLoading(true);
    try {
      const res = await api.getOwnerParkings(currentUser._id);
      setParkings(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editData) {
        await api.updateParking(editData._id, formData);
        setEditData(null);
      } else {
        await api.addParking(formData, currentUser._id);
      }
      fetchParkings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteParking(id);
      fetchParkings();
    } catch(err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-owner-header" style={{ padding: '0 0 2rem 0' }}>
         <h2>Manage Your Listed Spaces</h2>
      </div>
      
      <div className="main-content owner-layout">
        <ParkingForm 
          onSubmit={handleFormSubmit} 
          initialData={editData} 
          onCancel={() => setEditData(null)} 
        />
        
        <div className="list-panel">
          {loading ? (
            <div className="loading">Loading your spots...</div>
          ) : parkings.length === 0 ? (
            <div className="empty-state">
              <h3>No spaces listed yet</h3>
              <p>Add a new space using the form to start earning.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {parkings.map(p => (
                <ParkingCard 
                  key={p._id} 
                  parking={p} 
                  isOwner={true} 
                  onEdit={setEditData}
                  onDelete={handleDelete}
                  onRate={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
