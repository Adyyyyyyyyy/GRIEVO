import { useState, useEffect } from 'react';
import {
  Shield, LogOut, FileText, Clock, CheckCircle2,
  AlertTriangle, TrendingUp, Filter, Search,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';

interface AdminDashboardProps {
  email: string;
  userId: number;
  departmentId: number | null;
  onLogout: () => void;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export function AdminDashboard({ email, userId, departmentId, onLogout }: AdminDashboardProps) {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => { loadGrievances(); }, []);

  const loadGrievances = async () => {
    setLoading(true);
    try {
      const result = await api.getAllGrievances(departmentId || undefined);
      if (result.status === 'success ✅') setGrievances(result.grievances);
      else toast.error('Failed to load grievances');
    } catch { toast.error('Could not connect to server'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (grievanceId: number, newStatus: string) => {
    try {
      const result = await api.updateGrievanceStatus({ grievance_id: grievanceId, status: newStatus });
      if (result.status === 'success ✅') {
        toast.success('Status updated to ' + newStatus);
        loadGrievances();
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch { toast.error('Could not connect to server'); }
  };

  const handleAddResponse = async (grievanceId: number) => {
    if (!responseText.trim()) { toast.error('Please enter a response'); return; }
    setSubmittingResponse(true);
    try {
      const result = await api.addResponse({
        grievance_id: grievanceId,
        responder_id: userId,
        response_text: responseText,
      });
      if (result.status === 'success ✅') {
        toast.success('Response sent successfully!');
        setRespondingId(null);
        setResponseText('');
      } else {
        toast.error(result.message || 'Failed to send response');
      }
    } catch { toast.error('Could not connect to server'); }
    finally { setSubmittingResponse(false); }
  };

  const filteredGrievances = grievances.filter((g) => {
    const matchesCategory = filterCategory === 'all' || g.category_name === filterCategory;
    const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchesSearch = searchQuery === '' ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.student_email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const total = grievances.length;
  const pending = grievances.filter(g => g.status === 'New' || g.status === 'Assigned').length;
  const inProgress = grievances.filter(g => g.status === 'In Progress').length;
  const resolved = grievances.filter(g => g.status === 'Resolved' || g.status === 'Closed').length;
  const delayed = grievances.filter(g => g.rtci_status === 'Delayed').length;

  const categoryMap: Record<string, number> = {};
  grievances.forEach(g => { categoryMap[g.category_name] = (categoryMap[g.category_name] || 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const statusData = [
    { name: 'New/Assigned', value: pending },
    { name: 'In Progress', value: inProgress },
    { name: 'Resolved', value: resolved },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': case 'Assigned': return 'bg-red-100 text-red-700 border-red-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Resolved': case 'Closed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const uniqueCategories = [...new Set(grievances.map(g => g.category_name))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">GRIEVO</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700">{email}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-red-50 to-white border-red-200">
            <Clock className="w-8 h-8 text-red-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
            <TrendingUp className="w-8 h-8 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{inProgress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{resolved}</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-white border-orange-200">
            <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{delayed}</p>
            <p className="text-sm text-gray-600">Delayed</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grievances by Category</h3>
            {categoryData.length === 0 ? (
              <p className="text-gray-400 text-center py-16">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grievances by Status</h3>
            {total === 0 ? (
              <p className="text-gray-400 text-center py-16">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5" />Complaint Management
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={loadGrievances} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrievances.map((g) => (
                  <TableRow key={g.grievance_id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">#{g.grievance_id}</TableCell>
                    <TableCell className="text-sm">
                      {g.is_anonymous ? '🔒 Anonymous' : g.student_email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{g.category_name}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{g.department_name}</TableCell>
                    <TableCell className="max-w-xs text-sm">
                      <p className="truncate">{g.description}</p>
                      {g.attachment ? (
                        <a href={'http://localhost:5000/uploads/' + g.attachment} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                          📎 View Attachment
                        </a>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        g.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                        g.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        g.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>{g.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        g.rtci_status === 'Delayed' ? 'bg-red-100 text-red-700' :
                        g.rtci_status === 'Near Deadline' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }>{g.rtci_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(g.status)}>{g.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Select value={g.status} onValueChange={(val) => handleStatusUpdate(g.grievance_id, val)}>
                          <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-32 h-8 text-xs"
                          onClick={() => {
                            setRespondingId(respondingId === g.grievance_id ? null : g.grievance_id);
                            setResponseText('');
                          }}
                        >
                          💬 Respond
                        </Button>
                        {respondingId === g.grievance_id && (
                          <div className="flex flex-col gap-1 mt-1">
                            <Textarea
                              placeholder="Type your response..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={2}
                              className="text-xs w-48"
                            />
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              disabled={submittingResponse}
                              onClick={() => handleAddResponse(g.grievance_id)}
                            >
                              {submittingResponse ? 'Sending...' : 'Send'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredGrievances.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                {loading ? 'Loading grievances...' : 'No grievances found'}
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}