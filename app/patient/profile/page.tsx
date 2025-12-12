"use client"

import { useEffect, useState } from "react"
import { User, Mail, Phone, MapPin, Calendar, Edit, Loader2, Save, X } from "lucide-react"
import { patientService } from "@/lib/api/patient"
import { MedicalRecord, Patient, UpdateProfileRequest } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PatientProfilePage() {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPatient, setEditedPatient] = useState<UpdateProfileRequest>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileData, historyData] = await Promise.all([
        patientService.getProfile(),
        patientService.getMedicalHistory()
      ])
      setPatient(profileData)
      setMedicalHistory(Array.isArray(historyData) ? historyData : [])
      setEditedPatient(profileData) // Initialize form with current data
    } catch (error) {
      console.error("Failed to load profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
        // Cancel logic
        setEditedPatient(patient || {})
        setIsEditing(false)
    } else {
        // Start edit logic
        setEditedPatient(patient || {})
        setIsEditing(true)
    }
  }

  const handleSave = async () => {
      setSaving(true)
      try {
          // ensure DOB is YYYY-MM-DD
          const dataToSave = { ...editedPatient }
          if (dataToSave.dob) {
              dataToSave.dob = new Date(dataToSave.dob).toISOString().split('T')[0]
          }
          await patientService.updateProfile(dataToSave)
          await loadData() // Reload to get fresh data
          setIsEditing(false)
      } catch (error) {
          console.error("Failed to update profile", error)
          alert("Failed to update profile")
      } finally {
          setSaving(false)
      }
  }

  const handleInputChange = (field: keyof UpdateProfileRequest, value: string) => {
      setEditedPatient(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
      return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!patient) {
      return <div className="p-12 text-center">Failed to load profile.</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <div className="flex gap-2">
            {isEditing ? (
                <>
                    <Button variant="outline" onClick={handleEditToggle} disabled={saving}>
                         <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                         {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                         Save Changes
                    </Button>
                </>
            ) : (
                <Button onClick={handleEditToggle} className="bg-teal-600 hover:bg-teal-700">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                </Button>
            )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-1">Personal Information</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Your basic details</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-teal-100 dark:bg-teal-900 p-3">
                  <User className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Patient Name</p>
                  {isEditing ? (
                      <Input value={editedPatient.name || ''} onChange={e => handleInputChange('name', e.target.value)} />
                  ) : (
                      <p className="font-semibold text-lg">{patient.name || patient.User?.username}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <p className="font-medium">{patient.User?.email}</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    {isEditing ? (
                        <Input value={editedPatient.contact_info || ''} onChange={e => handleInputChange('contact_info', e.target.value)} />
                    ) : (
                        <p className="font-medium">{patient.contact_info || "N/A"}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Date of Birth</label>
                    {isEditing ? (
                        <Input type="date" value={editedPatient.dob ? new Date(editedPatient.dob).toISOString().split('T')[0] : ''} onChange={e => handleInputChange('dob', e.target.value)} />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <p className="font-medium">{patient.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}</p>
                        </div>
                    )}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Gender</label>
                    {isEditing ? (
                        <Select value={editedPatient.gender} onValueChange={(val: string) => handleInputChange('gender', val)}>
                             <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                             </SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="male">Male</SelectItem>
                                 <SelectItem value="female">Female</SelectItem>
                                 <SelectItem value="other">Other</SelectItem>
                             </SelectContent>
                        </Select>
                    ) : (
                         <p className="font-medium capitalize">{patient.gender || "N/A"}</p>
                    )}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Blood Type</label>
                    {isEditing ? (
                        <Select value={editedPatient.blood_type} onValueChange={(val: string) => handleInputChange('blood_type', val)}>
                             <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                             </SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="A+">A+</SelectItem>
                                 <SelectItem value="A-">A-</SelectItem>
                                 <SelectItem value="B+">B+</SelectItem>
                                 <SelectItem value="B-">B-</SelectItem>
                                 <SelectItem value="O+">O+</SelectItem>
                                 <SelectItem value="O-">O-</SelectItem>
                                 <SelectItem value="AB+">AB+</SelectItem>
                                 <SelectItem value="AB-">AB-</SelectItem>
                             </SelectContent>
                        </Select>
                    ) : (
                         <p className="font-medium">{patient.blood_type || "N/A"}</p>
                    )}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Address</label>
                  <div className="flex items-start gap-2">
                     <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                     {isEditing ? (
                         <Textarea className="min-h-[60px]" value={editedPatient.address || ''} onChange={e => handleInputChange('address', e.target.value)} />
                     ) : (
                         <p className="font-medium">{patient.address || "N/A"}</p>
                     )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Emergency Contact</label>
                    {isEditing ? (
                        <Input value={editedPatient.emergency_contact || ''} onChange={e => handleInputChange('emergency_contact', e.target.value)} placeholder="Name - Phone" />
                    ) : (
                        <p className="font-medium">{patient.emergency_contact || "N/A"}</p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Medical History</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Chronic conditions and diagnoses</p>
              
               {/* Display structured medical history from records */}
              {medicalHistory.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {medicalHistory.map((item, index) => (
                    <div key={index} className="p-3 border border-slate-200 rounded-lg dark:border-slate-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{item.diagnosis}</p>
                          <p className="text-sm text-slate-500">
                            Diagnosed: {new Date(item.created_at).toLocaleDateString()}
                          </p>
                          {item.treatment && (
                            <p className="text-sm mt-1">Treatment: {item.treatment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Display/Edit General Medical History Text */}
              <div className="mt-2">
                   <Label className="text-xs text-muted-foreground uppercase">General History / Notes</Label>
                   {isEditing ? (
                       <Textarea 
                            value={editedPatient.medical_history || ''} 
                            onChange={e => handleInputChange('medical_history', e.target.value)} 
                            placeholder="Enter any other medical history..."
                            className="mt-1"
                       />
                   ) : (
                       <p className="mt-1 text-sm">{patient.medical_history || (medicalHistory.length === 0 ? "No medical history recorded." : "")}</p>
                   )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Allergies</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Known allergies and sensitivities</p>
              
              {isEditing ? (
                  <Input 
                      value={editedPatient.allergies || ''} 
                      onChange={e => handleInputChange('allergies', e.target.value)} 
                      placeholder="e.g. Penicillin, Peanuts (Comma separated)"
                  />
              ) : (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies ? (
                        patient.allergies.split(',').map((allergy, index) => (
                        <span key={index} className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {allergy.trim()}
                        </span>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No allergies recorded.</p>
                    )}
                  </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">Insurance Information</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Coverage details</p>
              <div className="space-y-2">
                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Provider</label>
                  {isEditing ? (
                      <Input value={editedPatient.insurance_provider || ''} onChange={e => handleInputChange('insurance_provider', e.target.value)} />
                  ) : (
                      <p className="font-medium">{patient.insurance_provider || "N/A"}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Policy Number</label>
                   {isEditing ? (
                      <Input value={editedPatient.policy_number || ''} onChange={e => handleInputChange('policy_number', e.target.value)} />
                  ) : (
                      <p className="font-medium">{patient.policy_number || "N/A"}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-slate-500">Group Number</label>
                   {isEditing ? (
                      <Input value={editedPatient.group_number || ''} onChange={e => handleInputChange('group_number', e.target.value)} />
                  ) : (
                      <p className="font-medium">{patient.group_number || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
