import { useState, useRef } from 'react';
import {
  Upload,
  File,
  FileText,
  Image,
  X,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { formatFileSize, formatDate } from '../lib/utils';

interface Document {
  id: string;
  name: string;
  type: 'identity' | 'income' | 'bank_statement' | 'collateral' | 'guarantor_id' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  size: number;
  borrowerId?: string;
  borrowerName?: string;
  url?: string;
  notes?: string;
}

interface DocumentManagerProps {
  borrowerId?: string;
  borrowerName?: string;
}

const DOCUMENT_TYPES = [
  { value: 'identity', label: 'Identity Document', icon: FileText },
  { value: 'income', label: 'Income Proof', icon: File },
  { value: 'bank_statement', label: 'Bank Statement', icon: File },
  { value: 'collateral', label: 'Collateral Document', icon: FileText },
  { value: 'guarantor_id', label: 'Guarantor ID', icon: FileText },
  { value: 'other', label: 'Other', icon: File },
];

export const DocumentManager = ({ borrowerId, borrowerName }: DocumentManagerProps) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'national_id.pdf',
      type: 'identity',
      status: 'approved',
      uploadDate: '2024-01-15T10:30:00Z',
      size: 2048576,
      borrowerId: 'B001',
      borrowerName: 'John Doe',
    },
    {
      id: '2',
      name: 'salary_slip.pdf',
      type: 'income',
      status: 'pending',
      uploadDate: '2024-01-16T14:20:00Z',
      size: 1536000,
      borrowerId: 'B001',
      borrowerName: 'John Doe',
    },
    {
      id: '3',
      name: 'bank_statement.pdf',
      type: 'bank_statement',
      status: 'rejected',
      uploadDate: '2024-01-17T09:15:00Z',
      size: 3072000,
      borrowerId: 'B002',
      borrowerName: 'Jane Smith',
      notes: 'Document is not clear, please upload a better quality scan',
    },
  ]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedBorrower, setSelectedBorrower] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock borrowers data - in real app this would come from store
  const borrowers = [
    { id: 'B001', name: 'John Doe' },
    { id: 'B002', name: 'Jane Smith' },
    { id: 'B003', name: 'Mike Johnson' },
  ];

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedType || !selectedBorrower) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload delay
    setTimeout(() => {
      const file = files[0];
      const selectedBorrowerData = borrowers.find(b => b.id === selectedBorrower);
      
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: selectedType as any,
        status: 'pending',
        uploadDate: new Date().toISOString(),
        size: file.size,
        borrowerId: selectedBorrower,
        borrowerName: selectedBorrowerData?.name || '',
      };

      setDocuments(prev => [newDocument, ...prev]);
      setUploading(false);
      setUploadProgress(0);
      setSelectedType('');
      setSelectedBorrower('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: 'border-green-500 text-green-400',
      rejected: 'border-red-500 text-red-400',
      pending: 'border-yellow-500 text-yellow-400',
    };

    return (
      <Badge variant="outline" className={statusConfig[status as keyof typeof statusConfig]}>
        {status}
      </Badge>
    );
  };

  const filteredDocuments = borrowerId 
    ? documents.filter(doc => doc.borrowerId === borrowerId)
    : documents;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Upload borrower documents for verification and approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="borrower-select" className="text-muted-foreground">
                Select Borrower
              </Label>
              <Select 
                value={selectedBorrower} 
                onValueChange={setSelectedBorrower}
                disabled={!!borrowerId}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Choose a borrower" />
                </SelectTrigger>
                <SelectContent>
                  {borrowers.map((borrower) => (
                    <SelectItem key={borrower.id} value={borrower.id}>
                      {borrower.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="document-type" className="text-muted-foreground">
                Document Type
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              disabled={uploading || !selectedType || !selectedBorrower}
            />
            
            {uploading ? (
              <div className="space-y-4">
                <div className="text-muted-foreground">Uploading document...</div>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <div className="text-sm text-muted-foreground">{uploadProgress}%</div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-foreground font-medium">Click to upload documents</p>
                  <p className="text-sm text-muted-foreground">
                    PDF, JPG, PNG, DOC files up to 10MB
                  </p>
                </div>
                <Button
                  onClick={handleFileSelect}
                  disabled={!selectedType || !selectedBorrower}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Select Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage and track document verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Document</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Borrower</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Upload Date</TableHead>
                <TableHead className="text-muted-foreground">Size</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => {
                const documentType = DOCUMENT_TYPES.find(t => t.value === document.type);
                const TypeIcon = documentType?.icon || File;
                
                return (
                  <TableRow key={document.id} className="border-border">
                    <TableCell className="text-foreground">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {documentType?.label}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {document.borrowerName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(document.status)}
                        {getStatusBadge(document.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(document.uploadDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(document.size)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
