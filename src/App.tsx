import { useState, useEffect, useCallback } from "react";
import { BookLibrary, Book } from "./components/BookLibrary";
import { BookReader } from "./components/BookReader";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

const STORAGE_KEY = "libro_books";

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load books from localStorage on mount
  useEffect(() => {
    const loadBooks = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedBooks = JSON.parse(stored);
          setBooks(parsedBooks);
        }
      } catch (error) {
        console.error("Error loading books:", error);
        toast.error("Failed to load your library");
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Save books to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && books.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
      } catch (error: any) {
        console.error("Error saving books:", error);
        if (error.name === 'QuotaExceededError') {
          toast.error(
            "Storage quota exceeded. Unable to save reading progress. Consider deleting some books.",
            { duration: 5000 }
          );
        } else {
          toast.error("Failed to save changes");
        }
      }
    }
  }, [books, isLoading]);

  const handleUpload = useCallback(
    async (bookData: { title: string; author: string; file: File }) => {
      try {
        // Check file size (warn if over 3MB)
        const fileSizeMB = bookData.file.size / (1024 * 1024);
        if (fileSizeMB > 3) {
          toast.error(
            `File is ${fileSizeMB.toFixed(1)}MB. This may exceed browser storage limits. Consider using smaller files or Supabase for unlimited cloud storage.`,
            { duration: 5000 }
          );
          return;
        }

        // Convert PDF file to base64 for storage
        const fileReader = new FileReader();
        
        const pdfUrl = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => {
            const result = fileReader.result as string;
            resolve(result);
          };
          fileReader.onerror = () => reject(new Error("Failed to read file"));
          fileReader.readAsDataURL(bookData.file);
        });

        const newBook: Book = {
          id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: bookData.title,
          author: bookData.author || undefined,
          pdfUrl,
          currentPage: 1,
          totalPages: 100, // Would need proper PDF parsing to get actual page count
          uploadedAt: new Date().toISOString(),
        };

        // Test if we can save to localStorage
        const testBooks = [newBook, ...books];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(testBooks));
        } catch (storageError: any) {
          if (storageError.name === 'QuotaExceededError') {
            toast.error(
              "Storage quota exceeded. Your browser has a ~5MB limit. Delete some books or use Supabase for unlimited cloud storage.",
              { duration: 6000 }
            );
            throw new Error("Storage quota exceeded");
          }
          throw storageError;
        }

        setBooks(testBooks);
        toast.success(`"${bookData.title}" added to your library`);
      } catch (error) {
        console.error("Error uploading book:", error);
        if (error instanceof Error && error.message !== "Storage quota exceeded") {
          toast.error("Failed to upload book");
        }
      }
    },
    [books]
  );

  const handleProgressUpdate = useCallback((page: number, totalPages?: number) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === selectedBook?.id
          ? {
              ...book,
              currentPage: page,
              totalPages: totalPages || book.totalPages,
              lastRead: new Date().toISOString(),
            }
          : book
      )
    );
  }, [selectedBook?.id]);

  const handleBookClick = useCallback((book: Book) => {
    setSelectedBook(book);
  }, []);

  const handleCloseReader = useCallback(() => {
    setSelectedBook(null);
  }, []);

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="animate-pulse">Loading your library...</div>
      </div>
    );
  }

  return (
    <>
      {selectedBook ? (
        <BookReader
          bookId={selectedBook.id}
          title={selectedBook.title}
          author={selectedBook.author}
          pdfUrl={selectedBook.pdfUrl}
          initialPage={selectedBook.currentPage}
          onClose={handleCloseReader}
          onProgressUpdate={handleProgressUpdate}
        />
      ) : (
        <BookLibrary
          books={books}
          onBookClick={handleBookClick}
          onUpload={handleUpload}
        />
      )}
      <Toaster />
    </>
  );
}
