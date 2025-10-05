import { useState, useMemo } from "react";
import { Plus, Search, Library, SortAsc } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BookCard } from "./BookCard";
import { BookUploadDialog } from "./BookUploadDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface Book {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  pdfUrl: string;
  currentPage: number;
  totalPages: number;
  lastRead?: string;
  uploadedAt: string;
}

interface BookLibraryProps {
  books: Book[];
  onBookClick: (book: Book) => void;
  onUpload: (book: { title: string; author: string; file: File }) => Promise<void>;
}

export function BookLibrary({ books, onBookClick, onUpload }: BookLibraryProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "progress">("recent");

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author?.toLowerCase().includes(query)
      );
    }

    // Sort books
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.lastRead || b.uploadedAt).getTime() -
            new Date(a.lastRead || a.uploadedAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "progress":
          const progressA = (a.currentPage / a.totalPages) * 100;
          const progressB = (b.currentPage / b.totalPages) * 100;
          return progressB - progressA;
        default:
          return 0;
      }
    });

    return sorted;
  }, [books, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              <div>
                <h1>My Library</h1>
                <p className="text-muted-foreground">
                  {books.length} {books.length === 1 ? "book" : "books"}
                </p>
              </div>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Book
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search books or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Read</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredAndSortedBooks.length === 0 ? (
          <div className="text-center py-16">
            <Library className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            {books.length === 0 ? (
              <>
                <h3 className="mb-2">Your library is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first PDF book to get started
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Book
                </Button>
              </>
            ) : (
              <>
                <h3 className="mb-2">No books found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search query
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredAndSortedBooks.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                coverUrl={book.coverUrl}
                progress={(book.currentPage / book.totalPages) * 100}
                totalPages={book.totalPages}
                currentPage={book.currentPage}
                lastRead={book.lastRead}
                onClick={() => onBookClick(book)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <BookUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={onUpload}
      />
    </div>
  );
}
