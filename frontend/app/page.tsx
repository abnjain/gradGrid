'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Users,
  BookOpen,
  IdCard,
  Calendar,
  FileText,
  Download,
  Eye,
  Loader,
  Clock,
  Award,
} from 'lucide-react'

export default function DesignSystemPage() {
  const [showToast, setShowToast] = useState(false)

  const studentData = {
    personalInfo: {
      name: 'Aarav Kumar Singh',
      dateOfBirth: '15-05-2008',
      gender: 'Male',
      religion: 'Hindu',
      caste: 'General',
      category: 'General',
      handicapped: 'No',
      aadharCard: '1234 5678 9012',
      childId: 'CH-2024-001',
      familyId: 'FAM-2024-001',
    },
    academicInfo: {
      class: '12-A',
      section: 'A',
      scholarNo: 'SCH-2024-12001',
      studentType: 'Old Student',
      dateOfAdmission: '01-04-2018',
      stream: 'Science',
      enrollmentNo: 'ENR-2024-001',
      house: 'Blue House',
      medium: 'English',
      previousSchool: 'Delhi Public School',
      previousCity: 'Delhi',
      lastClass: '11-A',
      lastResult: 'A+',
    },
    parentInfo: {
      fatherName: 'Rajesh Kumar Singh',
      fatherDOB: '12-03-1970',
      fatherQualification: 'B.Tech',
      fatherOccupation: 'Software Engineer',
      fatherMobile: '+91-98765-43210',
      motherName: 'Priya Singh',
      motherDOB: '20-06-1975',
      motherQualification: 'M.A',
      motherOccupation: 'Teacher',
      motherMobile: '+91-98765-43211',
      dateOfAnniversary: '15-06-1995',
    },
    contactInfo: {
      email: 'aarav.kumar@example.com',
      mobileNo: '+91-98765-43212',
      otherContactNo: '+91-98765-43213',
      address: '123, Green Avenue, Sector-5',
      landmark: 'Near City Hospital',
      cityGramPost: 'New Delhi',
      district: 'Delhi',
      pinCode: '110001',
      state: 'Delhi',
    },
    bankInfo: {
      bankName: 'HDFC Bank',
      accountNo: '1234567890123456',
      ifscCode: 'HDFC0001234',
      accountHolderName: 'Rajesh Kumar Singh',
    },
    otherInfo: {
      scholarship: 'Merit Scholarship',
      admittedClass: '9-A',
      route: 'Route-5',
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Premium Features Coming Soon</span>
        </span>
        <button className="text-xs underline hover:opacity-80">Dismiss</button>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">GradGrid Design System</h1>
          <p className="text-muted-foreground">
            Complete UI/UX component library with all design principles applied
          </p>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="components">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="profile">Student Profile</TabsTrigger>
            <TabsTrigger value="forms">Forms & States</TabsTrigger>
          </TabsList>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8 mt-6">
            {/* Buttons Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Button States
                </CardTitle>
                <CardDescription>All button variants and states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3 text-foreground">Primary Buttons</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="default">Default</Button>
                      <Button variant="default" disabled>
                        Disabled
                      </Button>
                      <Button variant="default" onClick={() => setShowToast(true)}>
                        With Action
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-3 text-foreground">Secondary Buttons</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline">Outline</Button>
                      <Button variant="outline" disabled>
                        Disabled
                      </Button>
                      <Button variant="ghost">Ghost</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-3 text-foreground">Danger Buttons</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="destructive">Delete</Button>
                      <Button variant="destructive" disabled>
                        Disabled
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Badge Styles
                </CardTitle>
                <CardDescription>Status indicators and tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="default">Active</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Pending</Badge>
                  <Badge variant="danger">Inactive</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Avatars Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Avatar Styles
                </CardTitle>
                <CardDescription>User avatars with images and initials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium mb-4 text-foreground">Avatar with Initials</p>
                    <div className="flex gap-4 items-center">
                      <Avatar>
                        <AvatarFallback>AK</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>RS</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>PS</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading States */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Loading States
                </CardTitle>
                <CardDescription>Skeletons and progress indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3 text-foreground">Skeleton Loading</p>
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-2/3" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3 text-foreground">Progress Bar</p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">65% Complete</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3 text-foreground">Spinner</p>
                  <Loader className="w-6 h-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>

            {/* Alerts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Alerts & Toasts
                </CardTitle>
                <CardDescription>Message and notification states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="default">
                  <Info className="h-4 w-4" />
                  <span>This is an informational message</span>
                </Alert>
                <Alert variant="success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Operation completed successfully</span>
                </Alert>
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Warning: Please review this action</span>
                </Alert>
                <Alert variant="error">
                  <AlertCircle className="h-4 w-4" />
                  <span>Error: Something went wrong</span>
                </Alert>

                {showToast && (
                  <div className="fixed bottom-4 right-4 bg-primary text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Action completed successfully</span>
                    <button onClick={() => setShowToast(false)} className="ml-2 text-xs underline">
                      Dismiss
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ID Cards Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="w-5 h-5" />
                  ID Card Designs
                </CardTitle>
                <CardDescription>Student and staff ID card layouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Student ID Card */}
                  <div className="border-2 border-primary rounded-lg p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">STUDENT ID CARD</p>
                        <p className="text-lg font-bold text-primary">SCH-2024-12001</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Valid Till</p>
                        <p className="font-semibold">31-03-2025</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-4 pb-4 border-b">
                      <Avatar className="h-20 w-20 border-4 border-white shadow">
                        <AvatarFallback className="text-lg">AK</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">Aarav Kumar Singh</p>
                        <p className="text-sm text-muted-foreground">Class 12-A</p>
                        <p className="text-sm text-muted-foreground">Roll No. 01</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">15-05-2008</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="font-medium">Male</p>
                      </div>
                    </div>
                  </div>

                  {/* Staff ID Card */}
                  <div className="border-2 border-amber-600 rounded-lg p-6 bg-gradient-to-br from-amber-50 to-amber-100">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">STAFF ID CARD</p>
                        <p className="text-lg font-bold text-amber-700">STAFF-2024-001</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Valid Till</p>
                        <p className="font-semibold">31-12-2025</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-4 pb-4 border-b">
                      <Avatar className="h-20 w-20 border-4 border-white shadow">
                        <AvatarFallback className="text-lg">RS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">Rajesh Kumar Singh</p>
                        <p className="text-sm text-muted-foreground">Physics Department</p>
                        <p className="text-sm text-muted-foreground">Senior Teacher</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Joining Date</p>
                        <p className="font-medium">15-07-2015</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Qualification</p>
                        <p className="font-medium">M.Sc, B.Ed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marksheet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Marksheet Template
                </CardTitle>
                <CardDescription>Exam results and academic performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-primary">
                        <th className="text-left py-2 font-semibold">Subject</th>
                        <th className="text-center py-2 font-semibold">Max Marks</th>
                        <th className="text-center py-2 font-semibold">Obtained</th>
                        <th className="text-center py-2 font-semibold">Percentage</th>
                        <th className="text-center py-2 font-semibold">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { subject: 'Physics', max: 100, obtained: 92, grade: 'A+' },
                        { subject: 'Chemistry', max: 100, obtained: 88, grade: 'A' },
                        { subject: 'Mathematics', max: 100, obtained: 95, grade: 'A+' },
                        { subject: 'English', max: 100, obtained: 85, grade: 'A' },
                        { subject: 'Computer Science', max: 100, obtained: 98, grade: 'A+' },
                      ].map((mark) => (
                        <tr key={mark.subject} className="border-b hover:bg-secondary/50">
                          <td className="py-3 font-medium">{mark.subject}</td>
                          <td className="text-center py-3">{mark.max}</td>
                          <td className="text-center py-3 font-semibold">{mark.obtained}</td>
                          <td className="text-center py-3">{((mark.obtained / mark.max) * 100).toFixed(1)}%</td>
                          <td className="text-center py-3">
                            <Badge variant="success">{mark.grade}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Student Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Profile Header */}
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarFallback className="text-2xl font-bold">AK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 pt-2">
                    <CardTitle className="text-2xl">{studentData.personalInfo.name}</CardTitle>
                    <CardDescription className="text-base">Student ID: SCH-2024-12001</CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="success">Active</Badge>
                      <Badge variant="info">Class 12-A</Badge>
                      <Badge variant="default">Science</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(studentData.personalInfo).map(([key, value]) => (
                      <div key={key} className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Academic Information
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(studentData.academicInfo).map(([key, value]) => (
                      <div key={key} className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parent Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Parent Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4 space-y-3">
                      <p className="font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Father Details
                      </p>
                      {Object.entries(studentData.parentInfo)
                        .slice(0, 5)
                        .map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="font-medium text-foreground">{value}</p>
                          </div>
                        ))}
                    </div>
                    <div className="border rounded-lg p-4 space-y-3">
                      <p className="font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Mother Details
                      </p>
                      {Object.entries(studentData.parentInfo)
                        .slice(5, 10)
                        .map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="font-medium text-foreground">{value}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(studentData.contactInfo).map(([key, value]) => (
                      <div key={key} className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-semibold text-foreground text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Bank Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(studentData.bankInfo).map(([key, value]) => (
                      <div key={key} className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Other Information
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(studentData.otherInfo).map(([key, value]) => (
                      <div key={key} className="bg-secondary/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-semibold text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Profile
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Print Card
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms & States Tab */}
          <TabsContent value="forms" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Input States</CardTitle>
                <CardDescription>All input field variations with validation states</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default State */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input placeholder="Enter your full name" className="w-full" />
                  <p className="text-xs text-muted-foreground">Helper text for guidance</p>
                </div>

                {/* Success State */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <div className="flex items-center gap-2">
                    <Input value="student@example.com" className="w-full border-green-500 bg-green-50" readOnly />
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-green-600 font-medium">Email verified successfully</p>
                </div>

                {/* Error State */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value="123"
                      placeholder="Enter phone number"
                      className="w-full border-red-500 bg-red-50"
                    />
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-red-600 font-medium">Phone number is invalid</p>
                </div>

                {/* Warning State */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Admission Date</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value="01-04-2023"
                      placeholder="Select date"
                      className="w-full border-amber-500 bg-amber-50"
                    />
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-amber-600 font-medium">This date is in the past</p>
                </div>

                {/* Disabled State */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                  <Input value="SCH-2024-12001" disabled className="w-full" />
                  <p className="text-xs text-muted-foreground">This field cannot be edited</p>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Additional Notes</label>
                  <Textarea placeholder="Enter any additional information here..." />
                  <p className="text-xs text-muted-foreground">Maximum 500 characters</p>
                </div>

                {/* Select Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Class Selection</label>
                  <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
                    <option>Select your class</option>
                    <option>Class 10-A</option>
                    <option>Class 12-A</option>
                    <option>Class 12-B</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Choose from available classes</p>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Preferences</label>
                  <div className="flex items-center gap-2">
                    <Checkbox id="terms" />
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the terms and conditions
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="newsletter" defaultChecked />
                    <label htmlFor="newsletter" className="text-sm cursor-pointer">
                      Subscribe to newsletters
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="notifications" disabled />
                    <label htmlFor="notifications" className="text-sm cursor-pointer opacity-50">
                      Receive notifications (disabled)
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button className="flex-1">Submit</Button>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
