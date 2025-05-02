import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Insight {
  id: string
  text: string
  confidence: string
  source: any
}

interface AnalysisDetailsModalProps {
  open: boolean
  onClose: () => void
  insights: Insight[]
}

export function AnalysisDetailsModal({ open, onClose, insights }: AnalysisDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Analysis Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {insights.map(insight => (
            <div key={insight.id} className="p-2 border rounded">
              <div className="font-medium">{insight.text}</div>
              <div className="text-xs text-muted-foreground">
                Confidence: {insight.confidence}
              </div>
              {/* Add more details as needed */}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}