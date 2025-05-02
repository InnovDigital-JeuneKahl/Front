"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Calendar,
  Tag,
  X,
  ChevronDown,
  FileType2,
  Clock,
  CreditCard,
  User,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { PriceRangeSlider } from "@/components/price-range-slider"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<{
    fileExtensions: string[]
    analysisDateRange: { from: Date | undefined; to: Date | undefined } | undefined
    documentDateRange: { from: Date | undefined; to: Date | undefined } | undefined
    priceRange: [number, number] | undefined
    keywords: string[]
    suppliers: string[]
    clients: string[]
  }>({
    fileExtensions: [],
    analysisDateRange: undefined,
    documentDateRange: undefined,
    priceRange: undefined,
    keywords: [],
    suppliers: [],
    clients: [],
  })

  const fileExtensions = [
    { value: "pdf", label: "PDF" },
    { value: "docx", label: "Word (DOCX)" },
    { value: "xlsx", label: "Excel (XLSX)" },
    { value: "jpg", label: "Image (JPG)" },
    { value: "png", label: "Image (PNG)" },
    { value: "txt", label: "Texte (TXT)" },
  ]

  const toggleFileExtension = (ext: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      fileExtensions: prev.fileExtensions.includes(ext)
        ? prev.fileExtensions.filter((e) => e !== ext)
        : [...prev.fileExtensions, ext],
    }))
  }

  const setAnalysisDateRange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    setActiveFilters((prev) => ({
      ...prev,
      analysisDateRange: range,
    }))
  }

  const setDocumentDateRange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    setActiveFilters((prev) => ({
      ...prev,
      documentDateRange: range,
    }))
  }

  const setPriceRange = (range: [number, number] | undefined) => {
    setActiveFilters((prev) => ({
      ...prev,
      priceRange: range,
    }))
  }

  const removeFilter = (type: string, value?: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }

      switch (type) {
        case "fileExtension":
          if (value) newFilters.fileExtensions = prev.fileExtensions.filter((ext) => ext !== value)
          break
        case "analysisDateRange":
          newFilters.analysisDateRange = undefined
          break
        case "documentDateRange":
          newFilters.documentDateRange = undefined
          break
        case "priceRange":
          newFilters.priceRange = undefined
          break
        case "keyword":
          if (value) newFilters.keywords = prev.keywords.filter((k) => k !== value)
          break
        case "supplier":
          if (value) newFilters.suppliers = prev.suppliers.filter((s) => s !== value)
          break
        case "client":
          if (value) newFilters.clients = prev.clients.filter((c) => c !== value)
          break
      }

      return newFilters
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({
      fileExtensions: [],
      analysisDateRange: undefined,
      documentDateRange: undefined,
      priceRange: undefined,
      keywords: [],
      suppliers: [],
      clients: [],
    })
  }

  const handleSearch = () => {
    console.log("Recherche avec:", { query, activeFilters })
    // Implémentez ici la logique de recherche
  }

  return (
    <div className="space-y-4 h-full">
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* File Extension Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <FileType2 className="h-3.5 w-3.5" />
                  <span>Extension</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Extensions de fichier</h4>
                  <div className="space-y-2">
                    {fileExtensions.map((ext) => (
                      <div key={ext.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ext-${ext.value}`}
                          checked={activeFilters.fileExtensions.includes(ext.value)}
                          onCheckedChange={() => toggleFileExtension(ext.value)}
                        />
                        <Label htmlFor={`ext-${ext.value}`}>{ext.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Analysis Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Date d'analyse</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Période d'analyse</h4>
                  <DatePickerWithRange date={activeFilters.analysisDateRange} setDate={setAnalysisDateRange} />
                </div>
              </PopoverContent>
            </Popover>

            {/* Document Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Date du document</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Période du document</h4>
                  <DatePickerWithRange date={activeFilters.documentDateRange} setDate={setDocumentDateRange} />
                </div>
              </PopoverContent>
            </Popover>

            {/* Price Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Fourchette de prix</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Fourchette de prix</h4>
                  <PriceRangeSlider value={activeFilters.priceRange || [0, 10000]} onChange={setPriceRange} />
                </div>
              </PopoverContent>
            </Popover>

            {/* Keywords Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Mots-clés</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Mots-clés</h4>
                  <Input
                    placeholder="Ajouter un mot-clé"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        setActiveFilters((prev) => ({
                          ...prev,
                          keywords: [...prev.keywords, e.currentTarget.value],
                        }))
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activeFilters.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1">
                        {keyword}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("keyword", keyword)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Supplier Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Building className="h-3.5 w-3.5" />
                  <span>Fournisseur</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Fournisseurs</h4>
                  <Input
                    placeholder="Ajouter un fournisseur"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        setActiveFilters((prev) => ({
                          ...prev,
                          suppliers: [...prev.suppliers, e.currentTarget.value],
                        }))
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activeFilters.suppliers.map((supplier) => (
                      <Badge key={supplier} variant="secondary" className="gap-1">
                        {supplier}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("supplier", supplier)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Client Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>Client</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Clients</h4>
                  <Input
                    placeholder="Ajouter un client"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.currentTarget.value) {
                        setActiveFilters((prev) => ({
                          ...prev,
                          clients: [...prev.clients, e.currentTarget.value],
                        }))
                        e.currentTarget.value = ""
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {activeFilters.clients.map((client) => (
                      <Badge key={client} variant="secondary" className="gap-1">
                        {client}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("client", client)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* More Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Plus de filtres</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Statut du document</DropdownMenuItem>
                <DropdownMenuItem>Type de document</DropdownMenuItem>
                <DropdownMenuItem>Montant TVA</DropdownMenuItem>
                <DropdownMenuItem>Numéro de facture</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active Filters */}
          {(activeFilters.fileExtensions.length > 0 ||
            activeFilters.analysisDateRange ||
            activeFilters.documentDateRange ||
            activeFilters.priceRange ||
            activeFilters.keywords.length > 0 ||
            activeFilters.suppliers.length > 0 ||
            activeFilters.clients.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Filtres actifs:</span>

              {activeFilters.fileExtensions.map((ext) => (
                <Badge key={ext} variant="secondary" className="gap-1">
                  <FileType2 className="h-3 w-3" />
                  {ext.toUpperCase()}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("fileExtension", ext)} />
                </Badge>
              ))}

              {activeFilters.analysisDateRange && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {`Analyse: ${activeFilters.analysisDateRange.from?.toLocaleDateString()} - ${activeFilters.analysisDateRange.to?.toLocaleDateString()}`}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("analysisDateRange")} />
                </Badge>
              )}

              {activeFilters.documentDateRange && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {`Document: ${activeFilters.documentDateRange.from?.toLocaleDateString()} - ${activeFilters.documentDateRange.to?.toLocaleDateString()}`}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("documentDateRange")} />
                </Badge>
              )}

              {activeFilters.priceRange && (
                <Badge variant="secondary" className="gap-1">
                  <CreditCard className="h-3 w-3" />
                  {`${activeFilters.priceRange[0]}€ - ${activeFilters.priceRange[1]}€`}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("priceRange")} />
                </Badge>
              )}

              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAllFilters}>
                Effacer tous les filtres
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Results would go here */}
      <div className="p-8 text-center text-muted-foreground">
        Utilisez les filtres ci-dessus pour rechercher dans vos documents
      </div>
    </div>
  )
}
