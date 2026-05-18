import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState, useCallback } from "react";
import { agencyAssociationService } from "../../services/agencyAssociationService";
import { agencyService } from "../../services/agencyService";
import { classeService } from "../../services/classService";

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ClassAgency = () => {
  const [classAgencies, setClassAgencies] = useState([]);
  const [flightAgencies, setFlightAgencies] = useState([]);
  const [classes, setClasses] = useState([]);
  const [userAgency, setUserAgency] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    classId: "",
    agencyVolId: "",
    price: "",
    status: "active",
  });

  /* ===============================
     Récupérer l'agence de l'utilisateur
  =============================== */
  const fetchUserAgency = useCallback(async () => {
    try {
      const res = await agencyService.getUserAgencies();
      
      let agency = null;
      if (res?.data) {
        if (Array.isArray(res.data) && res.data.length > 0) {
          agency = res.data[0];
        } else if (res.data.id) {
          agency = res.data;
        }
      } else if (Array.isArray(res) && res.length > 0) {
        agency = res[0];
      } else if (res?.id) {
        agency = res;
      }

      if (!agency) {
        setError("Aucune agence associée à votre compte");
        return null;
      }

      setUserAgency(agency);
      return agency;
    } catch (err) {
      console.error("❌ Erreur getUserAgencies:", err);
      setError("Impossible de récupérer votre agence");
      return null;
    }
  }, []);

  /* ===============================
     Récupérer les vols de l'agence (pour le formulaire)
  =============================== */
  const fetchFlightAgencies = useCallback(async () => {
    try {
      const res = await agencyAssociationService.getUserFlightAgencies();
      
      let flights = [];
      if (Array.isArray(res)) {
        flights = res;
      } else if (res?.data && Array.isArray(res.data)) {
        flights = res.data;
      }

      setFlightAgencies(flights);
      return flights;
    } catch (err) {
      console.error("❌ Erreur getUserFlightAgencies:", err);
      return [];
    }
  }, []);

  /* ===============================
     Récupérer toutes les ClassAgency
     Le backend ne retourne que celles de l'agence de l'utilisateur
  =============================== */
  const fetchClassAgencies = useCallback(async () => {
    try {
      const res = await agencyAssociationService.getUserClassAgencies();
      console.log("📦 getUserAllClassAgencies:", res);
      
      let allClassAgencies = [];
      if (res?.data && Array.isArray(res.data)) {
        allClassAgencies = res.data;
      } else if (Array.isArray(res)) {
        allClassAgencies = res;
      }

      console.log("📊 ClassAgency reçues:", allClassAgencies);
      
      // On ne filtre PAS car le backend nous retourne déjà
      // uniquement les ClassAgency de notre agence
      setClassAgencies(allClassAgencies);
    } catch (err) {
      console.error("❌ Erreur getAllClassAgencies:", err);
    }
  }, []);

  /* ===============================
     Récupérer les classes (génériques)
  =============================== */
  const fetchClasses = useCallback(async () => {
    try {
      const res = await classeService.getClasses();

      let classesData = [];
      if (res?.data) {
        classesData = Array.isArray(res.data) ? res.data : [];
      } else if (Array.isArray(res)) {
        classesData = res;
      }

      setClasses(classesData);
    } catch (err) {
      console.error("❌ Erreur getClasses:", err);
    }
  }, []);

  /* ===============================
     Charger toutes les données
  =============================== */
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Récupérer l'agence
      await fetchUserAgency();

      // 2. Récupérer les classes génériques
      await fetchClasses();

      // 3. Récupérer les vols de l'agence (pour le formulaire)
      await fetchFlightAgencies();

      // 4. Récupérer les ClassAgency (déjà filtrées par le backend)
      await fetchClassAgencies();
      
    } catch (err) {
      console.error("❌ Erreur loadAllData:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [fetchUserAgency, fetchClasses, fetchFlightAgencies, fetchClassAgencies]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  /* ===============================
     Helpers pour l'affichage
  =============================== */
  const getFlightLabel = (flight) => {
    if (!flight) return "Vol inconnu";
    const origin = flight.flight?.origin?.name || flight.flight?.origin?.city || "???";
    const destination = flight.flight?.destination?.name || flight.flight?.destination?.city || "???";
    const company = flight.flight?.companyVol?.name || "";
    return `${flight.flight?.name || "Vol"} - ${company} (${origin} → ${destination})`;
  };

  /* ===============================
     Handlers formulaire
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      classId: "",
      agencyVolId: "",
      price: "",
      status: "active",
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.classId || !formData.agencyVolId || !formData.price) {
      setError("Tous les champs sont requis");
      setLoading(false);
      return;
    }

    // Vérifier que le vol appartient bien à l'agence
    const selectedFlight = flightAgencies.find(f => Number(f.id) === Number(formData.agencyVolId));
    if (!selectedFlight) {
      setError("Vol non autorisé pour votre agence");
      setLoading(false);
      return;
    }

    const payload = {
      classId: Number(formData.classId),
      agencyVolId: Number(formData.agencyVolId),
      price: Number(formData.price),
      status: formData.status,
    };

    try {
      if (editMode) {
        await agencyAssociationService.updateClassAgency(editId, payload);
        setSuccess("Association mise à jour avec succès");
      } else {
        await agencyAssociationService.createClassAgency(payload);
        setSuccess("Association créée avec succès");
      }
      resetForm();
      loadAllData();
    } catch (err) {
      console.error("❌ Erreur sauvegarde:", err);
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      classId: item.classId.toString(),
      agencyVolId: item.agencyVolId.toString(),
      price: item.price.toString(),
      status: item.status,
    });
    setEditMode(true);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette association ?")) return;
    try {
      await agencyAssociationService.deleteClassAgency(id);
      setSuccess("Association supprimée avec succès");
      loadAllData();
    } catch (err) {
      console.error("❌ Erreur suppression:", err);
      setError("Erreur lors de la suppression");
    }
  };

  /* ===============================
     Rendu
  =============================== */
  if (loading && !userAgency) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-600">Chargement de votre agence...</p>
        </div>
      </div>
    );
  }

  if (!userAgency && !loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold text-yellow-800 mb-2">Agence non trouvée</h2>
        <p className="text-yellow-600">
          Vous n'êtes pas associé à une agence. Veuillez contacter l'administrateur.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des prix par classe</h1>
        {userAgency && (
          <p className="text-gray-600 mt-1">
            Agence: <span className="font-semibold text-orange-600">{userAgency.name}</span>
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Formulaire */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {editMode ? "Modifier le prix" : "Ajouter un nouveau prix"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe <span className="text-red-500">*</span>
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Sélectionnez une classe</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vol agence <span className="text-red-500">*</span>
              </label>
              <select
                name="agencyVolId"
                value={formData.agencyVolId}
                onChange={handleChange}
                required
                disabled={flightAgencies.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
              >
                <option value="">
                  {flightAgencies.length === 0
                    ? "Aucun vol disponible"
                    : "Sélectionnez un vol"}
                </option>
                {flightAgencies.map((f) => (
                  <option key={f.id} value={f.id}>
                    {getFlightLabel(f)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="100"
                step="100"
                placeholder="Ex: 15000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "En cours..." : editMode ? "Mettre à jour" : "Créer"}
            </button>

            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Liste des associations */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Liste des prix par classe</h2>
          <p className="text-sm text-gray-500 mt-1">
            {classAgencies.length} association(s) pour votre agence
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        ) : classAgencies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune association trouvée pour votre agence</p>
            <p className="text-sm text-gray-400 mt-2">
              {flightAgencies.length} vol(s) disponible(s) pour créer des associations
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trajet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compagnie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Départ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classAgencies.map((item) => {
                  // Le vol est directement dans item.agencyVol
                  const flight = item.agencyVol;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.class?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {flight?.flight?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {flight?.flight?.origin?.name || "N/A"} → {flight?.flight?.destination?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {flight?.flight?.companyVol?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {flight?.departureTime ? formatDateTime(flight.departureTime) : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          {Number(item.price).toLocaleString()} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status === "active" ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-orange-600 hover:text-orange-900 mr-4"
                          title="Modifier"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassAgency;
