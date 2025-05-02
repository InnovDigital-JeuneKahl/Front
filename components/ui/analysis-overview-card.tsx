import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalysisOverviewCardProps {
  overview: string
  onClick: () => void
}

export function AnalysisOverviewCard({ overview, onClick }: AnalysisOverviewCardProps) {
  return (
    <Card className="mb-4 cursor-pointer hover:bg-muted/50" onClick={onClick}>
      <CardHeader>
        <CardTitle>Analysis Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{overview}</p>
        <span className="text-xs text-muted-foreground">Click for details</span>
      </CardContent>
    </Card>
  )
}