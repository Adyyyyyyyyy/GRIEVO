import { useState, useEffect } from 'react';
import {
  FileText, CheckCircle2, Clock, AlertCircle,
  MessageSquare, User, LogOut, Send, Upload,
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface StudentDashboardProps {
  email: string;
  userId: number;
  onLogout: () => void;
}

export function StudentDashboard({ email, userId, onLogout }: StudentDashboardProps) {
  const [grievances, setGrievances] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [activeTab, setActiveTab] = useState('register');
  const [loading, setLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [feedbackGrievanceId, setFeedbackGrievanceId] = useState('');
  const [isResolved, setIsResolved] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadCategories();
    loadGrievances();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await api.getCategories();
      if (result.status === 'success ✅') setCategories(result.categories);
    } catch { toast.error('Failed to load categories'); }
  };

  const loadGrievances = async () => {
    try {
      const result = await api.getMyGrievances(userId);
      if (result.status === 'success ✅') setGrievances(result.grievances);
    } catch { toast.error('Failed to load grievances'); }
  };

  const handleSubmit = async () => {
    if (!categoryId || !description.trim()) {
      toast.error('Please select a category and enter a description');
      return;
    }
    setLoading(true);
    try {
      const result = await api.submitGrievance({
        student_id: userId,
        category_id: parseInt(categoryId),
        description,
        priority,
        is_anonymous: false,
      }, attachmentFile || undefined);

      if (result.status === 'success ✅') {
        toast.success('Grievance submitted successfully!');
        setCategoryId('');
        setDescription('');
        setPriority('Medium');
        setAttachmentFile(null);
        loadGrievances();
        setActiveTab('status');
      } else {
        toast.error(result.message || 'Submission failed');
      }
    } catch { toast.error('Could not connect to server'); }
    finally { setLoading(false); }
  };

  const handleFeedback = async () => {
    if (!feedbackGrievanceId || isResolved === null) {
      toast.error('Please select a grievance and resolution status');
      return;
    }
    try {
      const result = await api.submitFeedback({
        grievance_id: parseInt(feedbackGrievanceId),
        is_resolved: isResolved,
        comments,
      });
      if (result.status === 'success ✅') {
        if (isResolved) {
          toast.success('Thank you! Grievance has been Closed ✅');
        } else {
          toast.info('Grievance reopened — admin will follow up 🔄');
        }
        setFeedbackGrievanceId('');
        setIsResolved(null);
        setComments('');
        loadGrievances();
      } else {
        toast.error(result.message || 'Feedback failed');
      }
    } catch { toast.error('Could not connect to server'); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': case 'Assigned': return 'bg-red-100 text-red-700 border-red-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Resolved': case 'Closed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': case 'Assigned': return <AlertCircle className="w-4 h-4" />;
      case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'Resolved': case 'Closed': return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  const resolvedGrievances = grievances.filter(g => g.status === 'Resolved');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">GRIEVO</h1>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-700">{email}</p>
                <p className="text-xs text-gray-500">Student Account</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-12">
            <TabsTrigger value="register" className="flex items-center gap-2">
              <Send className="w-4 h-4" /><span className="hidden sm:inline">Register</span>
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /><span className="hidden sm:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /><span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" /><span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Register */}
          <TabsContent value="register" className="space-y-6">
            <Card className="p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register New Grievance</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                          {cat.category_name} — {cat.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe your grievance in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attach Image (Optional)</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    {attachmentFile ? (
                      <p className="text-sm text-emerald-600 font-medium">✅ {attachmentFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
                      </>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>

                <Button onClick={handleSubmit} size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Grievance'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Status */}
          <TabsContent value="status" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">My Grievances</h2>
              <div className="flex gap-2">
                <Badge variant="outline">{grievances.length} Total</Badge>
                <Button variant="outline" size="sm" onClick={loadGrievances}>Refresh</Button>
              </div>
            </div>
            {grievances.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No grievances submitted yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {grievances.map((g) => (
                  <Card key={g.grievance_id} className={'p-6 transition-all hover:shadow-md ' + (g.rtci_status === 'Delayed' ? 'border-l-4 border-l-red-500' : '')}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="outline">{g.category_name}</Badge>
                          <Badge className={getStatusColor(g.status) + ' flex items-center gap-1'}>
                            {getStatusIcon(g.status)}<span>{g.status}</span>
                          </Badge>
                          <Badge variant="outline">{g.priority}</Badge>
                          {g.rtci_status === 'Delayed' && (
                            <Badge className="bg-red-100 text-red-700">Delayed</Badge>
                          )}
                          {g.rtci_status === 'Near Deadline' && (
                            <Badge className="bg-orange-100 text-orange-700">Near Deadline</Badge>
                          )}
                        </div>
                        <p className="text-gray-700">{g.description}</p>
                       {g.attachment_url ? (
                          <a href={g.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                            📎 View Attachment
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏢</span>
                        <div>
                          <p className="text-xs text-blue-500 font-medium">Domain</p>
                          <p className="text-sm font-semibold text-gray-800">{g.department_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <div>
                          <p className="text-xs text-blue-500 font-medium">Assigned Admin</p>
                          <p className="text-sm font-semibold text-gray-800">{g.admin_name || 'Not yet assigned'}</p>
                          {g.admin_email && (
                            <p className="text-xs text-gray-500">{g.admin_email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <GrievanceResponses grievanceId={g.grievance_id} />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 mt-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Submitted</p>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Expected Resolution</p>
                        <p className="text-sm font-medium text-gray-700">{g.expected_resolution_days} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Timeline</p>
                        <p className="text-sm font-medium text-gray-700">{g.rtci_status}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-4">
            <Card className="p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Submit Feedback</h2>
              <p className="text-sm text-gray-500 mb-6">
                Only available for grievances marked <strong>Resolved</strong> by admin.
                Your response determines the final status.
              </p>
              {resolvedGrievances.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No resolved grievances awaiting your feedback</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Select Grievance</Label>
                    <Select value={feedbackGrievanceId} onValueChange={setFeedbackGrievanceId}>
                      <SelectTrigger><SelectValue placeholder="Select a resolved grievance" /></SelectTrigger>
                      <SelectContent>
                        {resolvedGrievances.map((g) => (
                          <SelectItem key={g.grievance_id} value={String(g.grievance_id)}>
                            {'#' + g.grievance_id + ' — ' + g.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Was your grievance resolved to your satisfaction?</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setIsResolved(true)}
                        className={'p-6 rounded-xl border-2 text-center transition-all ' + (isResolved === true ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300')}
                      >
                        <p className="text-3xl mb-2">✅</p>
                        <p className="font-semibold text-gray-800">Yes, Resolved</p>
                        <p className="text-xs text-gray-500 mt-1">Grievance will be Closed</p>
                      </button>
                      <button
                        onClick={() => setIsResolved(false)}
                        className={'p-6 rounded-xl border-2 text-center transition-all ' + (isResolved === false ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300')}
                      >
                        <p className="text-3xl mb-2">❌</p>
                        <p className="font-semibold text-gray-800">Not Resolved</p>
                        <p className="text-xs text-gray-500 mt-1">Grievance will be reopened</p>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Comments (Optional)</Label>
                    <Textarea
                      placeholder="Share any additional comments..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleFeedback}
                    size="lg"
                    className="w-full"
                    disabled={isResolved === null || !feedbackGrievanceId}
                  >
                    Submit Feedback
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">Student Account</p>
                    <p className="text-sm text-gray-600">{email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-2xl font-semibold text-gray-800">{grievances.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Resolved</p>
                    <p className="text-2xl font-semibold text-emerald-600">
                      {grievances.filter(g => g.status === 'Resolved' || g.status === 'Closed').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">In Progress</p>
                    <p className="text-2xl font-semibold text-yellow-600">
                      {grievances.filter(g => g.status === 'In Progress').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">New</p>
                    <p className="text-2xl font-semibold text-red-600">
                      {grievances.filter(g => g.status === 'New').length}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function GrievanceResponses({ grievanceId }: { grievanceId: number }) {
  const [responses, setResponses] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const toggle = async () => {
    if (expanded) { setExpanded(false); return; }
    if (!loaded) {
      try {
        const result = await api.getGrievanceResponses(grievanceId);
        if (result.status === 'success ✅') setResponses(result.responses);
      } catch {}
      setLoaded(true);
    }
    setExpanded(true);
  };

  return (
    <div className="my-3">
      <button onClick={toggle} className="text-xs text-emerald-600 hover:underline font-medium">
        {expanded ? '▲ Hide admin responses' : '▼ View admin responses'}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {responses.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No responses from admin yet</p>
          ) : (
            responses.map((r) => (
              <div key={r.response_id} className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                <p className="text-sm text-gray-700">{r.response_text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {'— ' + r.responder_name + ' · ' + new Date(r.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}