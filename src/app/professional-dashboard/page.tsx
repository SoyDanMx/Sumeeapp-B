'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../hooks/useUser'; // Hook de usuario (crea si no existe)
import { supabase } from '@/lib/supabase';
import MapSection from '@/components/MapSection'; // Tu componente de mapa existente
import { WhatsAppButton } from '@/components/WhatsAppButton'; // Asume componente para WhatsApp

export default function ProfessionalDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [leads, setLeads] = useState([]); // Leads del pro
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [progress, setProgress] = useState(0); // % perfil completo
  const [newPhoto, setNewPhoto] = useState(null); // Para upload portfolio
  const [showLeadModal, setShowLeadModal] = useState(null); // Modal para lead details

  const [profileData, setProfileData] = useState({
    fullName: '',
    profession: '',
    phone: '',
    bio: '',
    workAreas: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'professional') {
      router.push('/unauthorized');
      return;
    }
    loadDashboardData();
  }, [user, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch leads para este pro
      const { data: leadsData } = await supabase
        .from('leads') // O 'bookings' si usas eso
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      setLeads(leadsData || []);

      // Fetch perfil para progreso
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setProfileData(profile);
        // Calcula progreso (enriquecedor: % basado en campos llenos)
        const fields = ['full_name', 'profession', 'phone', 'bio', 'work_areas'];
        const filled = fields.filter(field => profile[field]).length;
        setProgress((filled / fields.length) * 100);
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptLead = async (leadId) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: 'accepted' })
      .eq('id', leadId);

    if (error) {
      alert('Error aceptando lead.');
    } else {
      loadDashboardData(); // Refresh
      alert('¡Lead aceptado! Contacta via WhatsApp.');
    }
  };

  const rejectLead = async (leadId) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: 'rejected' })
      .eq('id', leadId);

    if (error) {
      alert('Error rechazando lead.');
    } else {
      loadDashboardData();
      alert('Lead rechazado.');
    }
  };

  const uploadPortfolioPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const { data, error } = await supabase.storage
      .from('portfolio') // Bucket para fotos
      .upload(`${user.id}/${Date.now()}-${file.name}`, file);

    if (error) {
      alert('Error subiendo foto.');
    } else {
      // Añade URL a profiles o portfolio table
      await supabase
        .from('profiles')
        .update({ portfolio_photos: [...(profileData.portfolio_photos || []), data.path] })
        .eq('user_id', user.id);

      setNewPhoto(null);
      loadDashboardData(); // Refresh progreso
      alert('Foto añadida a portfolio.');
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', user.id);

    if (error) {
      alert('Error actualizando perfil.');
    } else {
      setEditingProfile(false);
      loadDashboardData(); // Recalcula progreso
      alert('Perfil actualizado. ¡Atrae más leads!');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Cargando dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Uber-like */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Profesional</h1>
            <div className="text-right">
              <p className="text-sm text-gray-500">Bienvenido, {profileData.fullName}</p>
              <p className="font-semibold text-green-600">Progreso: {progress.toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Mapa con Leads (Enriquecedor) */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Leads en el Mapa (CDMX)</h2>
              {leads.length === 0 ? (
                <p className="text-gray-500">No hay leads activos. Completa tu perfil para atraer más.</p>
              ) : (
                <div className="h-96 rounded-lg overflow-hidden"> {/* Contenedor mapa */}
                  <MapSection
                    leads={leads} // Pasa leads a tu componente MapSection
                    onLeadClick={(lead) => setShowLeadModal(lead)} // Popup al clic
                    center={{ lat: 19.4326, lng: -99.1332 }} // Centro CDMX
                  />
                </div>
              )}
            </section>
          </div>

          {/* Columna Derecha: Perfil y Stats */}
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Tu Perfil</h2>
              <div className="progress-bar mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-gray-600">Completa para atraer +30% leads</p>
              </div>
              {editingProfile ? (
                <form onSubmit={updateProfile} className="space-y-4">
                  <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} placeholder="Nombre" className="w-full p-2 border rounded" />
                  <input type="text" value={profileData.profession} onChange={(e) => setProfileData({...profileData, profession: e.target.value})} placeholder="Profesión" className="w-full p-2 border rounded" />
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="Teléfono" className="w-full p-2 border rounded" />
                  <textarea value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} placeholder="Biografía (e.g., 10 años experiencia en A/C)" className="w-full p-2 border rounded" />
                  <input type="text" value={profileData.workAreas} onChange={(e) => setProfileData({...profileData, workAreas: e.target.value})} placeholder="Zonas (e.g., CDMX, Naucalpan)" className="w-full p-2 border rounded" />
                  <div className="flex space-x-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded">Guardar</button>
                    <button type="button" onClick={() => setEditingProfile(false)} className="flex-1 bg-gray-300 p-2 rounded">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">Nombre: {profileData.fullName}</p>
                  <p className="text-gray-600 mb-2">Profesión: {profileData.profession}</p>
                  <p className="text-gray-600 mb-2">Teléfono: {profileData.phone}</p>
                  <p className="text-gray-600 mb-2">Bio: {profileData.bio || 'Añade tu bio para atraer clientes.'}</p>
                  <p className="text-gray-600 mb-2">Zonas: {profileData.workAreas || 'Define zonas para leads locales.'}</p>
                  <button onClick={() => setEditingProfile(true)} className="w-full bg-blue-600 text-white p-2 rounded mt-4">
                    Editar Perfil
                  </button>
                </div>
              )}
            </section>

            {/* Portfolio */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Portfolio de Trabajos</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {profileData.portfolio_photos ? (
                  profileData.portfolio_photos.map((photo, index) => (
                    <img key={index} src={supabase.storage.from('portfolio').getPublicUrl(photo).data.publicUrl} alt="Trabajo" className="w-full h-24 object-cover rounded" />
                  ))
                ) : (
                  <p className="col-span-2 text-gray-500">Portfolio vacío. Sube fotos para atraer clientes.</p>
                )}
              </div>
              <input type="file" onChange={uploadPortfolioPhoto} accept="image/*" className="w-full p-2 border rounded" />
            </section>
          </div>
        </div>
      </div>

      {/* Modal para Lead Details (Enriquecedor) */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">{showLeadModal.name}</h3>
            <p className="mb-2">Oferta: {showLeadModal.offer}</p>
            <p className="mb-2">Ubicación: {showLeadModal.location}</p>
            <div className="mb-4">
              <p>Fotos:</p>
              {showLeadModal.photos && showLeadModal.photos.map((photo, index) => (
                <img key={index} src={photo} alt="Lead photo" className="w-full h-32 object-cover rounded mb-2" />
              ))}
            </div>
            <div className="flex space-x-2">
              <WhatsAppButton phone={showLeadModal.whatsapp} message={`Hola, soy ${profileData.fullName}. Interesado en tu lead de ${showLeadModal.offer}.`} />
              <button onClick={() => acceptLead(showLeadModal.id)} className="bg-green-600 text-white px-4 py-2 rounded">Aceptar</button>
              <button onClick={() => { rejectLead(showLeadModal.id); setShowLeadModal(null); }} className="bg-red-600 text-white px-4 py-2 rounded">Rechazar</button>
            </div>
            <button onClick={() => setShowLeadModal(null)} className="mt-4 w-full bg-gray-300 p-2 rounded">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}