import React, { useState, useEffect } from 'react'
import { Upload, FileText, Brain, Download, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Progress } from './components/ui/progress'
import { Badge } from './components/ui/badge'
import { Textarea } from './components/ui/textarea'
import { Alert, AlertDescription } from './components/ui/alert'

type ProcessingStep = 'upload' | 'detect' | 'map' | 'fill' | 'complete'

interface FormField {
  name: string
  type: 'text' | 'checkbox' | 'date' | 'table' | 'signature'
  position: { x: number; y: number; width: number; height: number }
  confidence: number
}

interface ProcessingState {
  currentStep: ProcessingStep
  progress: number
  isProcessing: boolean
  error?: string
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>({
    currentStep: 'upload',
    progress: 0,
    isProcessing: false
  })
  const [detectedFields, setDetectedFields] = useState<FormField[]>([])
  const [userData, setUserData] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [filledDocumentUrl, setFilledDocumentUrl] = useState<string | null>(null)

  // Cleanup blob URL when component unmounts or new file is selected
  useEffect(() => {
    return () => {
      if (filledDocumentUrl) {
        URL.revokeObjectURL(filledDocumentUrl)
      }
    }
  }, [filledDocumentUrl])

  // Reset processing state when new file is selected
  useEffect(() => {
    if (file) {
      setProcessingState({
        currentStep: 'upload',
        progress: 0,
        isProcessing: false
      })
      setDetectedFields([])
      if (filledDocumentUrl) {
        URL.revokeObjectURL(filledDocumentUrl)
        setFilledDocumentUrl(null)
      }
    }
  }, [file, filledDocumentUrl])

  const steps = [
    { id: 'upload', label: 'Upload Document', icon: Upload },
    { id: 'detect', label: 'Detect Fields', icon: FileText },
    { id: 'map', label: 'Map Data', icon: Brain },
    { id: 'fill', label: 'Fill & Download', icon: Download }
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      const selectedFile = files[0]
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const simulateProcessing = async () => {
    setProcessingState({ currentStep: 'detect', progress: 25, isProcessing: true })
    
    // Simulate field detection
    await new Promise(resolve => setTimeout(resolve, 2000))
    const mockFields: FormField[] = [
      { name: 'Full Name', type: 'text', position: { x: 100, y: 150, width: 200, height: 30 }, confidence: 0.95 },
      { name: 'Email Address', type: 'text', position: { x: 100, y: 200, width: 250, height: 30 }, confidence: 0.92 },
      { name: 'Date of Birth', type: 'date', position: { x: 100, y: 250, width: 150, height: 30 }, confidence: 0.88 },
      { name: 'Terms Agreement', type: 'checkbox', position: { x: 100, y: 300, width: 20, height: 20 }, confidence: 0.91 }
    ]
    setDetectedFields(mockFields)
    
    setProcessingState({ currentStep: 'map', progress: 50, isProcessing: true })
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setProcessingState({ currentStep: 'fill', progress: 75, isProcessing: true })
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate creating a filled document
    const mockFilledDocument = createMockFilledDocument(file!)
    setFilledDocumentUrl(mockFilledDocument)
    
    setProcessingState({ currentStep: 'complete', progress: 100, isProcessing: false })
  }

  const createMockFilledDocument = (originalFile: File): string => {
    // In a real implementation, this would call the API to fill the document
    // For now, we'll create a mock blob URL
    const mockContent = `Filled Document: ${originalFile.name}\n\nThis is a mock filled document with the following data:\n${userData || 'No data provided'}\n\nGenerated at: ${new Date().toISOString()}`
    const blob = new Blob([mockContent], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }

  const handleDownload = () => {
    if (!filledDocumentUrl || !file) return
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a')
    link.href = filledDocumentUrl
    link.download = `filled_${file.name.replace(/\.[^/.]+$/, '')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    const currentIndex = steps.findIndex(s => s.id === processingState.currentStep)
    
    if (stepIndex < currentIndex) return 'complete'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Bolt AI</h1>
                <p className="text-sm text-gray-500">Form Filler API</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              v1.0 Beta
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id)
              const Icon = step.icon
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    status === 'complete' ? 'bg-green-500 border-green-500 text-white' :
                    status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {status === 'complete' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    status === 'complete' ? 'text-green-600' :
                    status === 'current' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      status === 'complete' ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          
          {processingState.isProcessing && (
            <Progress value={processingState.progress} className="w-full" />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Document</span>
                </CardTitle>
                <CardDescription>
                  Upload a PDF or DOCX file to detect and fill form fields automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button onClick={simulateProcessing} disabled={processingState.isProcessing}>
                        {processingState.isProcessing ? 'Processing...' : 'Start Processing'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Drop your document here
                        </p>
                        <p className="text-gray-500">or click to browse</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>Choose File</span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-400">
                        Supports PDF and DOCX files up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detected Fields */}
            {detectedFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Detected Form Fields</span>
                  </CardTitle>
                  <CardDescription>
                    AI-detected form fields with confidence scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {detectedFields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="capitalize">
                            {field.type}
                          </Badge>
                          <span className="font-medium">{field.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-500">
                            {Math.round(field.confidence * 100)}% confidence
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            field.confidence > 0.9 ? 'bg-green-500' :
                            field.confidence > 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Input Data</span>
                </CardTitle>
                <CardDescription>
                  Provide unstructured data that will be intelligently mapped to form fields using AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder={`Enter any unstructured data here. The AI will intelligently map this information to the detected form fields.

Example:
My name is John Doe and I was born on January 15, 1990. You can reach me at john.doe@example.com. I'm 34 years old and work as a Software Engineer at Tech Corp. My address is 123 Main Street, San Francisco, CA 94105. Phone number is (555) 123-4567. I agree to the terms and conditions.`}
                    value={userData}
                    onChange={(e) => setUserData(e.target.value)}
                    className="min-h-[250px] text-sm resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{userData.length} characters</span>
                    <span>AI will extract relevant information automatically</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Field Detection</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Mapping</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Document Fill</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Processing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Step:</span>
                    <span className="font-medium capitalize">{processingState.currentStep}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">{processingState.progress}%</span>
                  </div>
                  {file && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">File Size:</span>
                      <span className="font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Download Results */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  {processingState.currentStep === 'complete' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Ready to Download</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-gray-400" />
                      <span>Download Results</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {processingState.currentStep === 'complete' ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Document processed successfully! All fields have been filled with the provided data.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Complete processing to download your filled document
                  </div>
                )}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleDownload}
                  disabled={!filledDocumentUrl}
                  variant={filledDocumentUrl ? "default" : "outline"}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {filledDocumentUrl ? "Download Filled PDF" : "Download Not Ready"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App