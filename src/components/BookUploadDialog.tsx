import { useState, useRef } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface BookUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (book: {
    title: string;
    author: string;
    file: File;
  }) => Promise<void>;
}

export function BookUploadDialog({
  open,
  onOpenChange,
  onUpload,
}: BookUploadDialogProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(".pdf", ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    try {
      await onUpload({ title, author, file });
      setTitle("");
      setAuthor("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Book</DialogTitle>
          <DialogDescription>
            Upload a PDF file to add to your library. For best performance, keep files under 2MB.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">PDF File</Label>
            <div className="relative">
              <Input
                id="file"
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name (optional)"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || !title || uploading}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
