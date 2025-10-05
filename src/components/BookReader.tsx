import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookReaderProps {
  bookId: string;
  title: string;
  author?: string;
  pdfUrl: string;
  initialPage?: number;
  onClose: () => void;
  onProgressUpdate: (page: number, totalPages?: number) => void;
}

export function BookReader({
  bookId,
  title,
  author,
  pdfUrl,
  initialPage = 1,
  onClose,
  onProgressUpdate,
}: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [pageInput, setPageInput] = useState(String(initialPage));
  const [isLoading, setIsLoading] = useState(true);
  const isInitialMount = useRef(true);

  // Save progress whenever page changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onProgressUpdate(currentPage);
  }, [currentPage]);

  // Update page input when current page changes
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.8));
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
    setIsLoading(false);
    // Update the book's total pages in storage
    onProgressUpdate(currentPage, numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error);
    setIsLoading(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const progress = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="truncate">{title}</h2>
            {author && (
              <p className="text-muted-foreground truncate">{author}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-muted/30">
        <div className="min-h-full flex items-center justify-center p-4 md:p-8">
          {isLoading && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span>Loading PDF...</span>
            </div>
          )}
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className="shadow-2xl"
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mx-auto"
            />
          </Document>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="border-t px-4 py-3 space-y-3">
        <Progress value={progress} className="h-1" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
              <Input
                type="number"
                value={pageInput}
                onChange={handlePageInputChange}
                className="w-16 text-center"
                min={1}
                max={totalPages}
              />
              <span className="text-muted-foreground">/ {totalPages}</span>
            </form>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-muted-foreground w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
