import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Ticket } from "../types";
import {
  Ticket as TicketIcon,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Hash,
  X,
  Send,
} from "lucide-react";

interface TicketResponse {
  id: string;
  ticketId: string;
  response: string;
  createdAt: string;
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [newResponse, setNewResponse] = useState("");
  const [ticketResponses, setTicketResponses] = useState<TicketResponse[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await api.getTickets(currentPage, statusFilter);
        setTickets(data.tickets);
        setTotalPages(data.totalPages);
        setTotalTickets(data.total);
        setError(null);
      } catch (err) {
        setError("Failed to load tickets");
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [currentPage, statusFilter]);

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.description &&
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "CLOSED":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "BUG":
        return "bg-red-100 text-red-800";
      case "IMPROVEMENT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    try {
      setSelectedTicket(ticket);
      setShowTicketModal(true);
      setNewResponse("");
      // In a real implementation, you would fetch ticket responses here
      setTicketResponses([]);
    } catch (err) {
      console.error("Error opening ticket:", err);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      setStatusUpdateLoading(true);
      const updatedTicket = await api.updateTicketStatus(ticketId, newStatus);

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? updatedTicket : ticket
        )
      );

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updatedTicket);
      }
    } catch (err) {
      console.error("Error updating ticket status:", err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return;

    try {
      setResponseLoading(true);
      await api.addTicketResponse(selectedTicket.id, newResponse);

      const newTicketResponse: TicketResponse = {
        id: Date.now().toString(),
        ticketId: selectedTicket.id,
        response: newResponse,
        createdAt: new Date().toISOString(),
      };

      setTicketResponses((prev) => [...prev, newTicketResponse]);
      setNewResponse("");
    } catch (err) {
      console.error("Error sending response:", err);
    } finally {
      setResponseLoading(false);
    }
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setSelectedTicket(null);
    setTicketResponses([]);
    setNewResponse("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-2">
            Manage user support requests and bug reports
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Total Tickets
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {totalTickets.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TicketIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Tickets
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by username or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status Filter
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Recent Tickets
          </h2>
          {filteredTickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {searchTerm || statusFilter
                ? "No tickets found matching your criteria"
                : "No tickets created yet"}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ticket Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Server ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleViewTicket(ticket)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <TicketIcon className="h-4 w-4 text-blue-500 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Ticket #{ticket.id.slice(0, 8)}
                              </div>
                              {ticket.description && (
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {ticket.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {ticket.username}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {ticket.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                              ticket.type
                            )}`}
                          >
                            {ticket.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(ticket.status)}
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500 font-mono">
                              {ticket.guildId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatDate(ticket.createdAt)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={closeTicketModal}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ticket #{selectedTicket.id.slice(0, 8)}
              </h3>
              <button
                onClick={closeTicketModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Ticket Details */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedTicket.username}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedTicket.userId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Server ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedTicket.guildId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                      selectedTicket.type
                    )}`}
                  >
                    {selectedTicket.type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedTicket.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-900">
                    {selectedTicket.description || "No description provided"}
                  </p>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      handleStatusChange(selectedTicket.id, e.target.value)
                    }
                    disabled={statusUpdateLoading}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  {statusUpdateLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Responses */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Responses
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {ticketResponses.length === 0 ? (
                  <p className="text-sm text-gray-500">No responses yet</p>
                ) : (
                  ticketResponses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-blue-50 p-3 rounded-md"
                    >
                      <p className="text-sm text-gray-900">
                        {response.response}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(response.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Response */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Response
              </label>
              <div className="flex space-x-2">
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleSendResponse}
                  disabled={!newResponse.trim() || responseLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {responseLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeTicketModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
