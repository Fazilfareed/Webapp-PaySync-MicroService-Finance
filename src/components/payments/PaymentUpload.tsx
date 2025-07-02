import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Calendar,
  DollarSign,
  CreditCard,
  Clock,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { usePaymentStore } from '../../store/paymentStore';
import { PaymentFormData } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { usePermissions } from '../../hooks/use-permissions';

interface PaymentUploadProps {
  loanId?: string;
  installmentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentUpload: React.FC<PaymentUploadProps> = ({
  loanId,
  installmentId,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const { uploadPayment, isLoading, uploadProgress, error } = usePaymentStore();
  const { canUploadPaymentReceipt, canCreatePayments, user } = usePermissions();
  
  const [formData, setFormData] = useState<Partial<PaymentFormData>>({
    loanId: loanId || '',
    installmentId: installmentId || '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'online',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type and size
      if (!file.type.includes('image') && !file.type.includes('pdf')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image or PDF file',
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedFile(file);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.loanId || !formData.installmentId || !formData.amount || !selectedFile) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields and upload a payment receipt',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadPayment({
        loanId: formData.loanId,
        installmentId: formData.installmentId,
        amount: formData.amount,
        paymentDate: formData.paymentDate!,
        paymentMethod: formData.paymentMethod!,
        paymentSlip: selectedFile,
      });

      toast({
        title: 'Payment uploaded successfully',
        description: 'Your payment is now pending approval',
      });

      // Reset form
      setFormData({
        loanId: loanId || '',
        installmentId: installmentId || '',
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'online',
      });
      setSelectedFile(null);
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // Permission check
  if (!canUploadPaymentReceipt() && !canCreatePayments()) {
    return (
      <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <div className="glass-icon p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 mx-auto mb-4 w-fit">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to upload payment receipts. Please contact your administrator.
          </p>
          <Badge variant="outline" className="mt-4 border-red-500/30 text-red-400">
            Role: {user?.role}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-icon p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20">
              <Upload className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <CardTitle className="text-foreground">Upload Payment</CardTitle>
              <CardDescription className="text-muted-foreground">
                Submit your payment receipt for verification
              </CardDescription>
            </div>
          </div>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                Payment Amount *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="pl-10 glass-input bg-white/5 border-white/20 focus:border-white/40 focus:bg-white/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate" className="text-sm font-medium text-foreground">
                Payment Date *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="pl-10 glass-input bg-white/5 border-white/20 focus:border-white/40 focus:bg-white/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium text-foreground">
                Payment Method *
              </Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: 'cash' | 'online') => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger className="glass-input bg-white/5 border-white/20 focus:border-white/40 focus:bg-white/10">
                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
                  <SelectItem value="online">Online Transfer</SelectItem>
                  <SelectItem value="cash">Cash Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanId" className="text-sm font-medium text-foreground">
                Loan ID *
              </Label>
              <Input
                id="loanId"
                placeholder="Enter loan ID"
                value={formData.loanId}
                onChange={(e) => setFormData({ ...formData, loanId: e.target.value })}
                className="glass-input bg-white/5 border-white/20 focus:border-white/40 focus:bg-white/10"
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-foreground">
              Payment Receipt *
            </Label>
            
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`
                  glass-card p-8 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
                  ${isDragActive ? 'border-blue-400 bg-blue-400/10' : 'border-white/30 hover:border-white/50'}
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="glass-icon p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Upload className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      Drop your payment receipt here
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      or click to browse files (Images or PDF, max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-4 rounded-xl border border-white/20 bg-gradient-to-br from-green-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Uploading payment...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="glass-card p-4 rounded-xl border border-red-500/20 bg-red-500/10">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-white/20 hover:bg-white/10"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || !selectedFile || !formData.amount}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
