"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, AlertTriangle, Search, Plus, TrendingDown, Trash2, Edit, X } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"
import { pharmacyService } from "@/lib/api/pharmacy"
import { InventoryItem, InventoryStats } from "@/lib/api/types"

export default function PharmacyInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats>({
      totalItems: 0,
      totalStock: 0,
      lowStock: 0,
      expiringSoon: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
      medicine_name: "",
      category: "",
      stock: 0,
      min_stock: 10,
      price: 0,
      expiry_date: "",
      supplier: ""
  })

  // Data Loading
  const loadData = async () => {
      try {
          setLoading(true)
          const [invData, statsData] = await Promise.all([
              pharmacyService.getInventory(searchQuery),
              pharmacyService.getInventoryStats()
          ])
          setInventory(invData)
          setStats(statsData)
      } catch (error) {
          console.error("Failed to load inventory:", error)
      } finally {
          setLoading(false)
      }
  }

  useEffect(() => {
      loadData()
  }, [searchQuery])

  // Handlers
  const handleOpenAdd = () => {
      setEditingItem(null)
      setFormData({
          medicine_name: "",
          category: "",
          stock: 0,
          min_stock: 10,
          price: 0,
          expiry_date: "",
          supplier: ""
      })
      setIsModalOpen(true)
  }

  const handleOpenEdit = (item: InventoryItem) => {
      setEditingItem(item)
      setFormData({
          medicine_name: item.medicine_name,
          category: item.category || "",
          stock: item.stock,
          min_stock: item.min_stock || 10,
          price: item.price,
          expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : "",
          supplier: item.supplier || ""
      })
      setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
      if(!confirm("Are you sure you want to delete this item?")) return
      try {
          await pharmacyService.deleteInventoryItem(id)
          loadData()
      } catch (e) {
          alert("Failed to delete item")
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
          if (editingItem) {
              await pharmacyService.updateInventoryItem(editingItem.id, formData)
          } else {
              await pharmacyService.addInventoryItem(formData)
          }
          setIsModalOpen(false)
          loadData()
      } catch (e) {
          alert("Failed to save item")
      }
  }

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <div className="flex gap-2">
            <Button onClick={handleOpenAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
            </Button>
            <LogoutButton />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Unique medicines</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-destructive">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Need restock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock}</div>
            <p className="text-xs text-muted-foreground">Units available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Medicine Inventory</CardTitle>
              <CardDescription>Manage stock levels and track medicines</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search medicines..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
             {loading ? (
                 <div className="text-center p-4">Loading...</div>
             ) : inventory.length === 0 ? (
                 <div className="text-center p-4 text-muted-foreground">No items found.</div>
             ) : (
                inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4 flex-1">
                    <div className="rounded-full bg-primary/10 p-2">
                        <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                        <div>
                            <p className="font-semibold">{item.medicine_name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            (item.stock < (item.min_stock || 10))
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}>
                            {(item.stock < (item.min_stock || 10)) ? "Low Stock" : "In Stock"}
                        </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                            <span className="text-muted-foreground">Stock:</span>
                            <p className="font-medium">{item.stock} units</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Min Stock:</span>
                            <p className="font-medium">{item.min_stock || 10} units</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Expiry:</span>
                            <p className="font-medium">{new Date(item.expiry_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Supplier:</span>
                            <p className="font-medium">{item.supplier || "N/A"}</p>
                        </div>
                        </div>
                    </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item)}>
                             <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                ))
             )}
          </div>
        </CardContent>
      </Card>

      {/* Simple Modal Implementation */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">{editingItem ? "Edit Medicine" : "Add Medicine"}</h2>
                      <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                          <X className="h-4 w-4" />
                      </Button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Medicine Name</label>
                              <Input 
                                  required 
                                  value={formData.medicine_name} 
                                  onChange={e => setFormData({...formData, medicine_name: e.target.value})} 
                              />
                          </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium">Category</label>
                              <Input 
                                  value={formData.category} 
                                  onChange={e => setFormData({...formData, category: e.target.value})} 
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Stock</label>
                              <Input 
                                  type="number" 
                                  required 
                                  value={formData.stock} 
                                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} 
                              />
                          </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium">Min Stock</label>
                              <Input 
                                  type="number" 
                                  required 
                                  value={formData.min_stock} 
                                  onChange={e => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})} 
                              />
                          </div>
                          <div className="space-y-2">
                              <label className="text-sm font-medium">Price</label>
                              <Input 
                                  type="number" 
                                  step="0.01"
                                  required 
                                  value={formData.price} 
                                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} 
                              />
                          </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium">Expiry Date</label>
                              <Input 
                                  type="date"
                                  required 
                                  value={formData.expiry_date} 
                                  onChange={e => setFormData({...formData, expiry_date: e.target.value})} 
                              />
                          </div>
                          <div className="space-y-2 col-span-2">
                              <label className="text-sm font-medium">Supplier</label>
                              <Input 
                                  value={formData.supplier} 
                                  onChange={e => setFormData({...formData, supplier: e.target.value})} 
                              />
                          </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                          <Button type="submit">Save</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  )
}
