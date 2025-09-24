"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetDriverDocumentByIdQuery, useGetDriverByIdQuery } from "@/store/api/fleetApi";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { Button } from "@/components/ui-elements/button";
import { ArrowLeft, User, FileText, Calendar, CheckCircle, XCircle, Download, Edit, Trash2 } from "lucide-react";

export default function DriverDocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const { data: documentData, isLoading: documentLoading, error: documentError } = useGetDriverDocumentByIdQuery(documentId);
  const { data: driverData } = useGetDriverByIdQuery(documentData?.driver?.toString() || '', {
    skip: !documentData?.driver
  });

  if (documentLoading) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (documentError || !documentData) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
        <div className="text-center text-red-600">
          <p>Failed to load driver document details. Please try again.</p>
          <Button 
            onClick={() => router.back()} 
            variant="primary" 
            label="Back to Driver Documents"
            className="mt-4"
          />
        </div>
      </ProtectedRoute>
    );
  }

  const document = documentData;
  const driver = driverData;

  // Calculate days to expiry
  const getDaysToExpiry = () => {
    if (!document.expiry_date) return null;
    const expiryDate = new Date(document.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysToExpiry = getDaysToExpiry();

  return (
    <ProtectedRoute requiredRoles={['admin', 'manager', 'operator', 'viewer', 'FLEET_USER']}>
      <div className="space-y-6">
        {/* HEADER: Back Button + Beautiful Title Card */}
        <div className="relative">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              onClick={() => router.back()}
              variant="outlineDark"
              label="Back"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="px-4 py-2 rounded-lg"
            />
          </div>

          {/* Beautiful Title Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-gray-600 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 dark:bg-gray-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 dark:bg-gray-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                {/* Left Side - Document Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Driver Document — Detail
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {document.doc_type || document.document_type || 'Document'} • {document.doc_number || document.document_number || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Driver</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {driver?.name || driver?.full_name || driver?.username || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {document.doc_type || document.document_type || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${document.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {document.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center text-xs ${document.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {document.is_active ? '● Active' : '● Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <div className="flex space-x-2">
                    <Button
                      label="View Driver"
                      variant="outlineDark"
                      size="small"
                      icon={<User className="h-3 w-3" />}
                      onClick={() => router.push(`/drivers/${driver?.id}`)}
                      className="px-3 py-2 text-xs"
                    />
                    <Button
                      label="Edit"
                      variant="outlineDark"
                      size="small"
                      icon={<Edit className="h-3 w-3" />}
                      onClick={() => router.push(`/driver-documents/${documentId}/edit`)}
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      label="Delete"
                      variant="outlineDark"
                      size="small"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={() => {}} // TODO: Add delete functionality
                      className="px-3 py-2 text-xs text-red-600 hover:text-red-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {document.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                {document.is_active ? (
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expires In</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {daysToExpiry !== null ? `${daysToExpiry}d` : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiry Date</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {document.expiry_date ? new Date(document.expiry_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {document.doc_type || document.document_type || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fields Section */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <h3 className="text-lg font-semibold mb-4">Document Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Driver (id):</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {driver?.id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {document.doc_type || document.document_type || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Number:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {document.doc_number || document.document_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {document.issue_date ? new Date(document.issue_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Expiry Date:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {document.expiry_date ? new Date(document.expiry_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {document.is_active ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {document.created_at ? new Date(document.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                {document.doc_file && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">File:</span>
                    <Button
                      label="Download"
                      variant="outlineDark"
                      size="small"
                      icon={<Download className="h-4 w-4" />}
                      onClick={() => {}} // TODO: Add download functionality
                      className="px-3 py-2 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Summary */}
            <div className="bg-white dark:bg-gray-dark rounded-lg p-6 shadow-1">
              <h3 className="text-lg font-semibold mb-4">Driver Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {driver?.name || driver?.full_name || driver?.username || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {driver?.phone_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">License:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {driver?.license_number || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {driver?.status || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  label="Open Driver"
                  variant="outlineDark"
                  size="small"
                  icon={<User className="h-4 w-4" />}
                  onClick={() => router.push(`/drivers/${driver?.id}`)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
