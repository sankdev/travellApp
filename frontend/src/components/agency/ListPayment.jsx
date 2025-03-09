import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { paymentService } from "../../services/paymentService";
import { faCheckCircle, faSearch, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const PaymentsList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getPayments(); 
      console.log('liste payment',response.data)// 🔥 Adapte l'URL selon ton API
      setPayments(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePayment = async (paymentId) => {
    try {
      await paymentService.validatePay(paymentId);
      fetchPayments(); // 🔄 Refresh après validation
    } catch (error) {
      console.error("Erreur lors de la validation du paiement :", error);
    }
  };

  // ✅ Filtrage des paiements selon statut et recherche
  const filteredPayments = Array.isArray(payments) ? payments.filter((payment) => {
    const matchStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchSearch = payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  }) : [];
console.log('filteredPayments',filteredPayments)
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">📜 Liste des paiements</h2>

      {/* ✅ Barre de recherche & Filtrage */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <div className="relative w-full md:w-1/2">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="🔍 Rechercher par référence..."
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="w-full md:w-1/3 border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">📌 Tous les statuts</option>
          <option value="completed">✅ Complété</option>
          <option value="pending">⏳ En attente</option>
          <option value="failed">❌ Échoué</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Chargement...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">Référence</th>
                <th className="py-3 px-4 text-left">Montant (XOF)</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Facture</th>
                

                <th className="py-3 px-4 text-left">Client</th>
                <th className="py-3 px-4 text-left">Statut</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{payment.reference}</td>
                    <td className="py-3 px-4">{payment.amount.toLocaleString()} XOF</td>
                    <td className="py-3 px-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    
                    {/* ✅ Affichage des détails de la facture */}
                    <td className="py-3 px-4">
                      {payment.invoicePayment ? (
                        <span className="flex items-center gap-2 text-blue-600">
                          <FontAwesomeIcon icon={faFileInvoice} />
                          Total:{payment.invoicePayment.
                            totalWithTax}-restant:{payment.invoicePayment.balance.toLocaleString()}-
                            
                        </span>
                        
                      ) : (
                        <span className="text-gray-500">Aucune</span>
                      )}
                    </td>
                    
                    
                    {/* ✅ Affichage du client lié */}
                    <td className="py-3 px-4">
                      {payment.invoicePayment?.customer ? (
                        `${payment.invoicePayment.customer.firstName} ${payment.invoicePayment.customer.lastName}`
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>

                    <td
                      className={`py-3 px-4 font-semibold ${
                        payment.status === "completed" ? "text-green-600" :
                        payment.status === "pending" ? "text-yellow-600" : "text-red-600"
                      }`}
                    >
                      {payment.status}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {payment.status !== "completed" && (
                        <button
                          onClick={() => handleValidatePayment(payment.id)}
                          className="text-green-500 hover:text-green-700 transition duration-300"
                          title="Valider le paiement"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Aucun paiement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;
