'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Avatar } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select } from '@/components/ui/select'
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Download,
  Edit3,
  Award,
  Users,
  BookOpen,
  Loader,
} from 'lucide-react'

export default function ComponentShowcase() {
  const [showPassword, setShowPassword] = useState(false)
  const [checked, setChecked] = useState({ terms: false, newsletter: false, notifications: false })

  const students = [
    { name: 'Aarav Kumar', rollNo: '001', email: 'aarav@school.com', status: 'Active', grade: 'A+' },
    { name: 'Priya Singh', rollNo: '002', email: 'priya@school.com', status: 'Active', grade: 'A' },
    { name: 'Rohan Sharma', rollNo: '003', email: 'rohan@school.com', status: 'Active', grade: 'A+' },
    { name: 'Maya Patel', rollNo: '004', email: 'maya@school.com', status: 'Inactive', grade: 'B+' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* HEADER */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-foreground">GradGrid UI Components</h1>
          <p className="text-lg text-muted-foreground">
            Complete production-ready component library for Education ERP platform
          </p>
        </div>

        {/* BUTTONS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Buttons
            </CardTitle>
            <CardDescription>All button variants, sizes, and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-semibold mb-3">Primary Buttons</p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Primary</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled>Disabled</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Mail className="w-4 h-4 mr-2" />With Icon</Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Secondary Buttons</p>
              <div className="flex flex-wrap gap-3">
                <Button className="border border-border hover:bg-muted text-foreground">Ghost</Button>
                <Button className="border border-red-500 text-red-600 hover:bg-red-50">Danger</Button>
                <Button className="border border-green-500 text-green-600 hover:bg-green-50">Success</Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Sizes</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button className="text-xs px-2 py-1 bg-blue-600 text-white">XS</Button>
                <Button className="text-sm px-3 py-1.5 bg-blue-600 text-white">Small</Button>
                <Button className="bg-blue-600 text-white">Medium</Button>
                <Button className="text-lg px-8 py-3 bg-blue-600 text-white">Large</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* INPUTS */}
        <Card>
          <CardHeader>
            <CardTitle>Input Fields</CardTitle>
            <CardDescription>Various input states and configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Default Input</label>
              <Input placeholder="Enter text..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email Input</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="user@example.com" className="pl-10" />
              </div>
              <p className="text-xs text-green-600 mt-1">✓ Valid email</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password Input</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  defaultValue="password123"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Disabled Input</label>
              <Input placeholder="Cannot edit" disabled defaultValue="GradGrid-2024-001" />
            </div>
          </CardContent>
        </Card>

        {/* BADGES */}
        <Card>
          <CardHeader>
            <CardTitle>Badges & Status Indicators</CardTitle>
            <CardDescription>Tags and status badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-3">Status Badges</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Pending</Badge>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Inactive</Badge>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Info</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-3">Grade Badges</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">A+</Badge>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">A</Badge>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">B</Badge>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">C</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ALERTS */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>Alert states and messages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
              <Info className="w-4 h-4 inline mr-2 text-blue-600" />
              <span className="text-blue-800">This is an informational message</span>
            </Alert>
            <Alert className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
              <CheckCircle2 className="w-4 h-4 inline mr-2 text-green-600" />
              <span className="text-green-800">Operation completed successfully</span>
            </Alert>
            <Alert className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
              <AlertTriangle className="w-4 h-4 inline mr-2 text-amber-600" />
              <span className="text-amber-800">Warning: Please verify this action</span>
            </Alert>
            <Alert className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
              <AlertCircle className="w-4 h-4 inline mr-2 text-red-600" />
              <span className="text-red-800">Error: Something went wrong</span>
            </Alert>
          </CardContent>
        </Card>

        {/* AVATARS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Avatars
            </CardTitle>
            <CardDescription>User profile avatars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 flex-wrap">
              <Avatar className="w-12 h-12 bg-blue-500 text-white font-bold flex items-center justify-center rounded-full">
                AK
              </Avatar>
              <Avatar className="w-12 h-12 bg-purple-500 text-white font-bold flex items-center justify-center rounded-full">
                RS
              </Avatar>
              <Avatar className="w-12 h-12 bg-green-500 text-white font-bold flex items-center justify-center rounded-full">
                MP
              </Avatar>
              <Avatar className="w-12 h-12 bg-orange-500 text-white font-bold flex items-center justify-center rounded-full">
                SN
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* FORMS */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Textarea, Checkboxes, and Select components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Comments</label>
              <Textarea placeholder="Enter your feedback here..." className="border border-border rounded-md p-3 min-h-24" />
            </div>
            <div>
              <label className="text-sm font-medium mb-3 block">Preferences</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={checked.terms}
                    onChange={() => setChecked({ ...checked, terms: !checked.terms })}
                  />
                  <label className="text-sm cursor-pointer">I agree to terms and conditions</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={checked.newsletter}
                    onChange={() => setChecked({ ...checked, newsletter: !checked.newsletter })}
                  />
                  <label className="text-sm cursor-pointer">Subscribe to newsletter</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={true} disabled />
                  <label className="text-sm cursor-pointer text-muted-foreground">Disabled checkbox</label>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Select Class</label>
              <Select
                options={[
                  { label: 'Class 9-A', value: '9a' },
                  { label: 'Class 10-A', value: '10a' },
                  { label: 'Class 12-A', value: '12a' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* SKELETON LOADING */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Loading States
            </CardTitle>
            <CardDescription>Skeleton screens and spinners</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Skeleton Loaders</p>
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-2/3" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Progress Bar</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">70% Complete</p>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Data Table
            </CardTitle>
            <CardDescription>Student information table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Roll No</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Grade</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.rollNo}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <Badge className={student.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-gray-100 text-gray-800'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* STUDENT PROFILE CARD */}
        <Card className="border-2 border-blue-500/30">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Aarav Kumar Singh</CardTitle>
                <CardDescription className="text-blue-100">Student ID: GradGrid-2024-001</CardDescription>
              </div>
              <Avatar className="w-16 h-16 bg-white text-blue-600 font-bold text-xl flex items-center justify-center rounded-full">
                AK
              </Avatar>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="font-semibold">12-A</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stream</p>
                <p className="font-semibold">Science</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Roll No</p>
                <p className="font-semibold">001</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold text-green-600">Active</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Email:</span> aarav.kumar@school.com</p>
              <p><span className="text-muted-foreground">Phone:</span> +91 9876543210</p>
              <p><span className="text-muted-foreground">DOB:</span> 15 Jan 2006</p>
              <p><span className="text-muted-foreground">Address:</span> 123 Main Street, Delhi</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button className="flex-1 bg-blue-600 text-white gap-2"><Download className="w-4 h-4" />Download</Button>
              <Button className="flex-1 border border-border hover:bg-muted gap-2"><Edit3 className="w-4 h-4" />Edit</Button>
            </div>
          </CardContent>
        </Card>

        {/* FOOTER */}
        <div className="text-center text-sm text-muted-foreground py-8 border-t">
          <p>GradGrid Design System © 2024 - All components demonstrated on this page</p>
        </div>
      </div>
    </div>
  )
}
