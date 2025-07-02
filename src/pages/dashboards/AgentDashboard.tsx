import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  UserPlus,
  FileText,
  Upload,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Layers,
} from 'lucide-react';

import { DocumentManager } from '../../components/DocumentManager';
import { AgentAnalytics } from '../../components/AgentAnalytics';
import { PaymentDashboard } from '../../components/payments';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { useBorrowerStore } from '../../store/borrowerStore';
import { useLoanStore } from '../../store/loanStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { formatCurrency, formatDate, formatNumber, getInitials } from '../../lib/utils';
import { Borrower, BorrowerFormData } from '../../types';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { DialogFooter } from '../../components/ui/dialog';
import Switch from '@mui/material/Switch';
import { toast } from '../../hooks/use-toast';

// Add at the top of the file or inside the component file
const sendToRegionalAdmin = async (borrowerId: string) => {
  // TODO: Replace with real API call
  return new Promise((resolve) => setTimeout(resolve, 1200));
};

// BorrowerDetailsModal Component
const BorrowerDetailsModal = ({ 
  borrower, 
  isOpen, 
  onClose 
}: { 
  borrower: Borrower | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const [notes, setNotes] = useState('');
  // Checked state for each section
  const [checkedSections, setCheckedSections] = useState({
    registration: false,
    personal: false,
    identity: false,
    employment: false,
    documents: false,
    decision: false,
  });

  // Simulate status update
  const [localStatus, setLocalStatus] = useState(borrower?.status || 'pending');
  const [sending, setSending] = useState(false);
  const [agentDecision, setAgentDecision] = useState<'none' | 'approved' | 'rejected'>('none');

  useEffect(() => {
    setLocalStatus(borrower?.status || 'pending');
    setCheckedSections({
      registration: false,
      personal: false,
      identity: false,
      employment: false,
      documents: false,
      decision: false,
    });
    setNotes('');
    setSending(false);
    setAgentDecision('none');
  }, [borrower, isOpen]);

  if (!borrower) return null;

  // Mock data for demonstration
  const registrationOverview = {
    registrationId: 'L00001',
    submissionDate: '2/5/2025',
    assignedReviewer: 'John Smith',
    lastUpdate: '4/5/2025',
    status: 'Pending Review',
  };
  const personalInfo = {
    fullName: borrower.name,
    contactNumber: borrower.phone,
    email: borrower.email,
    dob: '4/5/2025',
    address: borrower.address,
  };
  const identity = {
    idType: borrower.idType.toUpperCase(),
    idNumber: borrower.idNumber,
    document: 'View Document',
  };
  const employment = {
    employer: 'Government School',
    jobRole: 'Principal',
    monthlyIncome: '60,000',
    employmentLetter: 'View Document',
    duration: '20 years',
  };
  const documents = [
    { name: 'ID Card', date: '6/15/2023' },
    { name: 'Employment Letter', date: '6/15/2023' },
    { name: 'Photo', date: '6/15/2023' },
    { name: 'Paysheet', date: '6/15/2023' },
  ];

  // Handle toggle
  const handleToggle = (section: keyof typeof checkedSections) => {
    setCheckedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle Approve/Reject
  const handleDecision = (decision: 'approve' | 'reject') => {
    setAgentDecision(decision === 'approve' ? 'approved' : 'rejected');
    setLocalStatus(decision === 'approve' ? 'approved' : 'rejected');
  };

  const handleSendToRegionalAdmin = async () => {
    if (!borrower) return;
    setSending(true);
    try {
      await sendToRegionalAdmin(borrower.id);
      setLocalStatus('agent_approved');
      toast({
        title: 'Sent to Regional Admin',
        description: 'The application has been forwarded to the assigned regional admin.',
      });
      // TODO: Optionally update global state or refetch borrowers
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>
            User Registration : R001
            <Chip label={registrationOverview.status} color="warning" style={{ float: 'right' }} />
          </DialogTitle>
        </div>
      </DialogHeader>
      <DialogContent style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Review the Registration application details below
        </Typography>
        {/* Registration Overview */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Registration Overview</Typography>
            <Box ml={2} display="flex" alignItems="center" gap={1}>
              <Switch checked={checkedSections.registration} onChange={() => handleToggle('registration')} size="small" />
              <Typography color={checkedSections.registration ? 'success.main' : 'error.main'}>
                {checkedSections.registration ? 'Checked' : 'Unchecked'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexWrap="wrap" gap={4}>
              <Box minWidth={200}>
                <Typography variant="body2">Registration ID</Typography>
                <Typography fontWeight="bold">{registrationOverview.registrationId}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Submission Date</Typography>
                <Typography fontWeight="bold">{registrationOverview.submissionDate}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Assigned Reviewer</Typography>
                <Typography fontWeight="bold">{registrationOverview.assignedReviewer}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Last Update</Typography>
                <Typography fontWeight="bold">{registrationOverview.lastUpdate}</Typography>
              </Box>
            </Box>
            <Box mt={2}>
              <Chip label="unchecked" color="error" size="small" style={{ marginRight: 8 }} />
              <Chip label="checked" color="success" size="small" />
            </Box>
          </AccordionDetails>
        </Accordion>
        {/* Personal Information */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Personal Information</Typography>
            <Box ml={2} display="flex" alignItems="center" gap={1}>
              <Switch checked={checkedSections.personal} onChange={() => handleToggle('personal')} size="small" />
              <Typography color={checkedSections.personal ? 'success.main' : 'error.main'}>
                {checkedSections.personal ? 'Checked' : 'Unchecked'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexWrap="wrap" gap={4}>
              <Box minWidth={200}>
                <Typography variant="body2">Full Name</Typography>
                <Typography fontWeight="bold">{personalInfo.fullName}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Contact Number</Typography>
                <Typography fontWeight="bold">{personalInfo.contactNumber}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Email Address</Typography>
                <Typography fontWeight="bold">{personalInfo.email}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Date of Birth</Typography>
                <Typography fontWeight="bold">{personalInfo.dob}</Typography>
              </Box>
              <Box minWidth={300}>
                <Typography variant="body2">Residential Address</Typography>
                <Typography fontWeight="bold">{personalInfo.address}</Typography>
              </Box>
            </Box>
            <Box mt={2}>
              <Chip label="unchecked" color="error" size="small" style={{ marginRight: 8 }} />
              <Chip label="checked" color="success" size="small" />
            </Box>
          </AccordionDetails>
        </Accordion>
        {/* Identity Verification */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Identity Verification</Typography>
            <Box ml={2} display="flex" alignItems="center" gap={1}>
              <Switch checked={checkedSections.identity} onChange={() => handleToggle('identity')} size="small" />
              <Typography color={checkedSections.identity ? 'success.main' : 'error.main'}>
                {checkedSections.identity ? 'Checked' : 'Unchecked'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexWrap="wrap" gap={4} alignItems="center">
              <Box minWidth={200}>
                <Typography variant="body2">Government ID</Typography>
                <Button variant="outline" size="sm">View Document</Button>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">ID Type</Typography>
                <Typography fontWeight="bold">{identity.idType}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">ID Number</Typography>
                <Typography fontWeight="bold">{identity.idNumber}</Typography>
              </Box>
            </Box>
            <Box mt={2}>
              <Chip label="unchecked" color="error" size="small" style={{ marginRight: 8 }} />
              <Chip label="checked" color="success" size="small" />
            </Box>
          </AccordionDetails>
        </Accordion>
        {/* Employment Details */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Employment Details</Typography>
            <Box ml={2} display="flex" alignItems="center" gap={1}>
              <Switch checked={checkedSections.employment} onChange={() => handleToggle('employment')} size="small" />
              <Typography color={checkedSections.employment ? 'success.main' : 'error.main'}>
                {checkedSections.employment ? 'Checked' : 'Unchecked'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexWrap="wrap" gap={4}>
              <Box minWidth={200}>
                <Typography variant="body2">Employer</Typography>
                <Typography fontWeight="bold">{employment.employer}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Job Role</Typography>
                <Typography fontWeight="bold">{employment.jobRole}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Monthly Income</Typography>
                <Typography fontWeight="bold">{employment.monthlyIncome}</Typography>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Employment Letter</Typography>
                <Button variant="outline" size="sm">View Document</Button>
              </Box>
              <Box minWidth={200}>
                <Typography variant="body2">Employment Duration</Typography>
                <Typography fontWeight="bold">{employment.duration}</Typography>
              </Box>
            </Box>
            <Box mt={2}>
              <Chip label="unchecked" color="error" size="small" style={{ marginRight: 8 }} />
              <Chip label="checked" color="success" size="small" />
            </Box>
          </AccordionDetails>
        </Accordion>
        {/* Document Viewer */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Document Viewer</Typography>
            <Box ml={2} display="flex" alignItems="center" gap={1}>
              <Switch checked={checkedSections.documents} onChange={() => handleToggle('documents')} size="small" />
              <Typography color={checkedSections.documents ? 'success.main' : 'error.main'}>
                {checkedSections.documents ? 'Checked' : 'Unchecked'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {documents.map((doc, idx) => (
                <Box key={doc.name} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography>{doc.name} <span style={{ color: '#888', fontSize: 12 }}>(Uploaded on {doc.date})</span></Typography>
                  <Button variant="outline" size="sm">View</Button>
                </Box>
              ))}
            </Box>
            <Box mt={2}>
              <Chip label="unchecked" color="error" size="small" style={{ marginRight: 8 }} />
              <Chip label="checked" color="success" size="small" />
            </Box>
          </AccordionDetails>
        </Accordion>
        {/* Application Decision */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Application Decision</Typography>
            <Box ml={2} display="flex" alignItems="center" gap={1}>
              <Switch checked={checkedSections.decision} onChange={() => handleToggle('decision')} size="small" />
              <Typography color={checkedSections.decision ? 'success.main' : 'error.main'}>
                {checkedSections.decision ? 'Checked' : 'Unchecked'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" gutterBottom>Agent Notes..</Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="add your notes about this application..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              variant="outlined"
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogFooter>
        {agentDecision === 'none' && (
          <>
            <Button onClick={() => handleDecision('reject')} variant="outline" color="error">Reject</Button>
            <Button onClick={() => handleDecision('approve')} variant="default" color="primary">Approve</Button>
          </>
        )}
        {agentDecision === 'approved' && (
          <Button
            onClick={handleSendToRegionalAdmin}
            variant="default"
            color="primary"
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send to Regional Admin'}
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
};

// EditBorrowerModal Component
const EditBorrowerModal = ({ 
  borrower, 
  isOpen, 
  onClose 
}: { 
  borrower: Borrower | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const { updateBorrower, isLoading } = useBorrowerStore();
  const [formData, setFormData] = useState<BorrowerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    idType: 'nic',
  });

  useEffect(() => {
    if (borrower) {
      setFormData({
        name: borrower.name,
        email: borrower.email,
        phone: borrower.phone,
        address: borrower.address,
        idNumber: borrower.idNumber,
        idType: borrower.idType,
      });
    }
  }, [borrower]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (borrower) {
      try {
        await updateBorrower(borrower.id, formData);
        onClose();
      } catch (error) {
        console.error('Failed to update borrower:', error);
      }
    }
  };

  if (!borrower) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-modal max-w-2xl border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-3">
            <div className="glass-icon p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
              <Edit className="h-5 w-5 text-emerald-400" />
            </div>
            Edit Borrower Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update the borrower's information below
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-muted-foreground">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="glass-input bg-white/5 border-white/10 text-foreground"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-input bg-white/5 border-white/10 text-foreground"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-muted-foreground">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="glass-input bg-white/5 border-white/10 text-foreground"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="idType" className="text-muted-foreground">ID Type</Label>
              <Select
                value={formData.idType}
                onValueChange={(value: 'nic' | 'passport' | 'license') => 
                  setFormData({ ...formData, idType: value })
                }
              >
                <SelectTrigger className="glass-input bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-dropdown">
                  <SelectItem value="nic">National ID Card</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="idNumber" className="text-muted-foreground">ID Number</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="glass-input bg-white/5 border-white/10 text-foreground"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address" className="text-muted-foreground">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="glass-input bg-white/5 border-white/10 text-foreground"
              rows={3}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="glass-button bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AgentDashboard = () => {
  const location = useLocation();
  const { borrowers, fetchBorrowers, createBorrower, isLoading: borrowersLoading } = useBorrowerStore();
  const { loans, fetchLoans, createLoan, isLoading: loansLoading } = useLoanStore();
  const { stats, fetchDashboardStats } = useDashboardStore();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [showBorrowerForm, setShowBorrowerForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [showBorrowerDetails, setShowBorrowerDetails] = useState(false);
  const [showEditBorrower, setShowEditBorrower] = useState(false);
  const [borrowerFilter, setBorrowerFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [borrowerFormData, setBorrowerFormData] = useState<BorrowerFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    idType: 'nic',
  });
  
  const [loanFormData, setLoanFormData] = useState({
    borrowerId: '',
    amount: 0,
    purpose: '',
    termMonths: 12,
    guarantors: [],
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchBorrowers();
    fetchLoans();
  }, [fetchDashboardStats, fetchBorrowers, fetchLoans]);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/analytics')) setActiveTab('analytics');
    else if (path.includes('/borrowers')) setActiveTab('borrowers');
    else if (path.includes('/loans')) setActiveTab('loans');
    else if (path.includes('/documents')) setActiveTab('documents');
    else if (path.includes('/commission')) setActiveTab('commission');
    else if (path.includes('/my-borrowers')) setActiveTab('my-borrowers');
    else setActiveTab('overview');
  }, [location.pathname]);

  // Filter borrowers based on search and status
  const filteredBorrowers = borrowers.filter(borrower => {
    const matchesSearch = borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         borrower.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         borrower.phone.includes(searchTerm);
    const matchesFilter = borrowerFilter === 'all' || borrower.status === borrowerFilter;
    return matchesSearch && matchesFilter;
  });

  // Get status counts
  const statusCounts = {
    all: borrowers.length,
    pending: borrowers.filter(b => b.status === 'pending').length,
    approved: borrowers.filter(b => b.status === 'approved').length,
    rejected: borrowers.filter(b => b.status === 'rejected').length,
  };

  const handleCreateBorrower = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBorrower(borrowerFormData);
      setShowBorrowerForm(false);
      setBorrowerFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        idNumber: '',
        idType: 'nic',
      });
    } catch (error) {
      console.error('Failed to create borrower:', error);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLoan(loanFormData);
      setShowLoanForm(false);
      setLoanFormData({
        borrowerId: '',
        amount: 0,
        purpose: '',
        termMonths: 12,
        guarantors: [],
      });
    } catch (error) {
      console.error('Failed to create loan:', error);
    }
  };

  const handleViewBorrower = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setShowBorrowerDetails(true);
  };

  const handleEditBorrower = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setShowEditBorrower(true);
  };

  return (
    <div className="agent-dashboard min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20">
        <div className="absolute inset-0 bg-[url('/images/glass-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
      </div>
      
      {/* Floating Glass Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-32 w-48 h-48 bg-gradient-to-br from-emerald-400/5 to-cyan-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-32 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Header */}
        <div className="glass-header backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
                <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <Sparkles className="h-8 w-8 text-blue-400" />
                </div>
                Agent Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">Manage borrowers, loans, and track your performance</p>
            </div>
            <div className="flex space-x-4">
              <Dialog open={showBorrowerForm} onOpenChange={setShowBorrowerForm}>
                <DialogTrigger asChild>
                  <Button className="glass-button bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white border-0 shadow-xl">
                    <UserPlus className="h-4 w-4 mr-2" />
                    New Borrower
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Dialog open={showLoanForm} onOpenChange={setShowLoanForm}>
                <DialogTrigger asChild>
                  <Button className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    New Loan
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="glass-tabs bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl">
            <TabsTrigger value="overview" className="glass-tab-trigger data-[state=active]:bg-white/20">
              <TrendingUp className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="my-borrowers" className="glass-tab-trigger data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 mr-2" />
              My Borrowers
            </TabsTrigger>
            <TabsTrigger value="loans" className="glass-tab-trigger data-[state=active]:bg-white/20">
              <DollarSign className="h-4 w-4 mr-2" />
              Loans
            </TabsTrigger>
            <TabsTrigger value="payments" className="glass-tab-trigger data-[state=active]:bg-white/20">
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="documents" className="glass-tab-trigger data-[state=active]:bg-white/20">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="analytics" className="glass-tab-trigger data-[state=active]:bg-white/20">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Borrowers</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{formatNumber(stats?.totalBorrowers || 0)}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Loans</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{formatNumber(stats?.activeLoans || 0)}</div>
                  <p className="text-xs text-muted-foreground">+8% from last month</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalLoanAmount || 0)}</div>
                  <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Commission Earned</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.commissionsPaid || 0)}</div>
                  <p className="text-xs text-muted-foreground">+22% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {borrowers.slice(0, 5).map((borrower, index) => (
                    <div key={borrower.id} className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 border border-white/10">
                      <Avatar className="h-10 w-10 ring-2 ring-white/20">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(borrower.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{borrower.name}</p>
                        <p className="text-xs text-muted-foreground">Registered on {formatDate(borrower.createdAt)}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`border-0 ${
                          borrower.status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : borrower.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {borrower.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced My Borrowers Tab */}
          <TabsContent value="my-borrowers" className="space-y-6">
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-3">
                  <div className="glass-icon p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  My Borrower Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage and monitor all borrowers under your supervision
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Search and Filter Controls */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search borrowers by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="glass-input pl-10 bg-white/5 border-white/10 text-foreground"
                    />
                  </div>
                  
                  <Select value={borrowerFilter} onValueChange={(value: any) => setBorrowerFilter(value)}>
                    <SelectTrigger className="glass-input w-48 bg-white/5 border-white/10">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-dropdown">
                      <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                      <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                      <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
                      <SelectItem value="rejected">Rejected ({statusCounts.rejected})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card p-4 rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{statusCounts.all}</p>
                        <p className="text-xs text-muted-foreground">Total Borrowers</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-400/50" />
                    </div>
                  </div>
                  
                  <div className="glass-card p-4 rounded-xl border border-white/10 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending}</p>
                        <p className="text-xs text-muted-foreground">Pending Review</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-400/50" />
                    </div>
                  </div>
                  
                  <div className="glass-card p-4 rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-green-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-400">{statusCounts.approved}</p>
                        <p className="text-xs text-muted-foreground">Approved</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400/50" />
                    </div>
                  </div>
                  
                  <div className="glass-card p-4 rounded-xl border border-white/10 bg-gradient-to-br from-red-500/10 to-red-500/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-red-400">{statusCounts.rejected}</p>
                        <p className="text-xs text-muted-foreground">Rejected</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-400/50" />
                    </div>
                  </div>
                </div>

                {/* Borrowers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBorrowers.map((borrower) => (
                    <Card key={borrower.id} className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md hover:from-white/15 hover:to-white/10 transition-all duration-300 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                              {getInitials(borrower.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-foreground text-sm font-semibold">{borrower.name}</CardTitle>
                            <p className="text-muted-foreground text-xs">{borrower.email}</p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              Phone:
                            </span>
                            <span className="text-foreground font-medium">{borrower.phone}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm">Status:</span>
                            <Badge
                              variant="outline"
                              className={`border-0 text-xs font-medium ${
                                borrower.status === 'approved'
                                  ? 'bg-green-500/20 text-green-400'
                                  : borrower.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {borrower.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Registered:</span>
                            <span className="text-foreground">{formatDate(borrower.createdAt)}</span>
                          </div>
                        </div>
                        
                        <Separator className="bg-white/10" />
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewBorrower(borrower)}
                            className="flex-1 glass-button border-white/20 hover:border-white/40 hover:bg-white/10 text-foreground"
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBorrower(borrower)}
                            className="flex-1 glass-button border-white/20 hover:border-white/40 hover:bg-white/10 text-foreground"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredBorrowers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No borrowers found matching your criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-4">
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  Loan Applications
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Track and manage loan applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-muted-foreground">Borrower</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Purpose</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.slice(0, 5).map((loan) => {
                      const borrower = borrowers.find(b => b.id === loan.borrowerId);
                      return (
                        <TableRow key={loan.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-foreground">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                  {borrower ? getInitials(borrower.name) : 'N/A'}
                                </AvatarFallback>
                              </Avatar>
                              <span>{borrower?.name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground font-medium">{formatCurrency(loan.amount)}</TableCell>
                          <TableCell className="text-foreground">{loan.purpose}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`border-0 ${
                                loan.status === 'approved'
                                  ? 'bg-green-500/20 text-green-400'
                                  : loan.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(loan.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <PaymentDashboard userRole="agent" />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <DocumentManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <AgentAnalytics />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <BorrowerDetailsModal
        borrower={selectedBorrower}
        isOpen={showBorrowerDetails}
        onClose={() => {
          setShowBorrowerDetails(false);
          setSelectedBorrower(null);
        }}
      />

      <EditBorrowerModal
        borrower={selectedBorrower}
        isOpen={showEditBorrower}
        onClose={() => {
          setShowEditBorrower(false);
          setSelectedBorrower(null);
        }}
      />

      {/* Borrower Registration Form Dialog */}
      <Dialog open={showBorrowerForm} onOpenChange={setShowBorrowerForm}>
        <DialogContent className="glass-modal border-white/20 bg-white/10 backdrop-blur-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-3">
              <div className="glass-icon p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                <UserPlus className="h-5 w-5 text-emerald-400" />
              </div>
              Register New Borrower
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the borrower's information to register them in the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBorrower} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-muted-foreground">Full Name</Label>
                <Input
                  id="name"
                  value={borrowerFormData.name}
                  onChange={(e) => setBorrowerFormData({ ...borrowerFormData, name: e.target.value })}
                  className="glass-input bg-white/5 border-white/10 text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={borrowerFormData.email}
                  onChange={(e) => setBorrowerFormData({ ...borrowerFormData, email: e.target.value })}
                  className="glass-input bg-white/5 border-white/10 text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-muted-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  value={borrowerFormData.phone}
                  onChange={(e) => setBorrowerFormData({ ...borrowerFormData, phone: e.target.value })}
                  className="glass-input bg-white/5 border-white/10 text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="idType" className="text-muted-foreground">ID Type</Label>
                <Select
                  value={borrowerFormData.idType}
                  onValueChange={(value: 'nic' | 'passport' | 'license') => 
                    setBorrowerFormData({ ...borrowerFormData, idType: value })
                  }
                >
                  <SelectTrigger className="glass-input bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    <SelectItem value="nic">National ID Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="license">License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idNumber" className="text-muted-foreground">ID Number</Label>
                <Input
                  id="idNumber"
                  value={borrowerFormData.idNumber}
                  onChange={(e) => setBorrowerFormData({ ...borrowerFormData, idNumber: e.target.value })}
                  className="glass-input bg-white/5 border-white/10 text-foreground"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-muted-foreground">Address</Label>
              <Textarea
                id="address"
                value={borrowerFormData.address}
                onChange={(e) => setBorrowerFormData({ ...borrowerFormData, address: e.target.value })}
                className="glass-input bg-white/5 border-white/10 text-foreground"
                placeholder="Enter full address..."
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowBorrowerForm(false)}
                className="hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="glass-button bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white border-0"
                disabled={borrowersLoading}
              >
                {borrowersLoading ? 'Creating...' : 'Register Borrower'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Loan Application Form Dialog */}
      <Dialog open={showLoanForm} onOpenChange={setShowLoanForm}>
        <DialogContent className="glass-modal border-white/20 bg-white/10 backdrop-blur-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-3">
              <div className="glass-icon p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                <Plus className="h-5 w-5 text-purple-400" />
              </div>
              Create Loan Application
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new loan application for an approved borrower
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLoan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="borrowerId" className="text-muted-foreground">Select Borrower</Label>
                <Select
                  value={loanFormData.borrowerId}
                  onValueChange={(value) => setLoanFormData({ ...loanFormData, borrowerId: value })}
                >
                  <SelectTrigger className="glass-input bg-white/5 border-white/10">
                    <SelectValue placeholder="Select a borrower" />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    {borrowers.filter(b => b.status === 'approved').map((borrower) => (
                      <SelectItem key={borrower.id} value={borrower.id}>
                        {borrower.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount" className="text-muted-foreground">Loan Amount (LKR)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={loanFormData.amount}
                  onChange={(e) => setLoanFormData({ ...loanFormData, amount: Number(e.target.value) })}
                  className="glass-input bg-white/5 border-white/10 text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="termMonths" className="text-muted-foreground">Term (Months)</Label>
                <Select
                  value={loanFormData.termMonths.toString()}
                  onValueChange={(value) => setLoanFormData({ ...loanFormData, termMonths: Number(value) })}
                >
                  <SelectTrigger className="glass-input bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                    <SelectItem value="48">48 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="purpose" className="text-muted-foreground">Loan Purpose</Label>
              <Textarea
                id="purpose"
                value={loanFormData.purpose}
                onChange={(e) => setLoanFormData({ ...loanFormData, purpose: e.target.value })}
                className="glass-input bg-white/5 border-white/10 text-foreground"
                placeholder="Describe the purpose of the loan..."
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowLoanForm(false)}
                className="hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="glass-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                disabled={loansLoading}
              >
                {loansLoading ? 'Creating...' : 'Create Application'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default AgentDashboard;
