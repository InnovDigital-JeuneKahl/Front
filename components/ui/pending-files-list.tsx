import { ProcessingFile } from "@/components/ui/processing-file"

interface PendingFilesListProps {
  files: Array<{
    id: string
    name: string
    type: string
    status: "pending" | "processing" | "ready"
    progress: number
  }>
  onDelete: (id: string) => void
}

export function PendingFilesList({ files, onDelete }: PendingFilesListProps) {
  if (!files.length) return null
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Pending Files</h3>
      <div className="space-y-3">
        {files.map((file) => (
          <ProcessingFile
            key={file.id}
            file={file}
            onDelete={() => onDelete(file.id)}
          />
        ))}
      </div>
    </div>
  )
}