import { Book, Clock, FileText } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface BookCardProps {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  progress?: number;
  totalPages?: number;
  currentPage?: number;
  lastRead?: string;
  onClick: () => void;
}

export function BookCard({
  title,
  author,
  coverUrl,
  progress = 0,
  totalPages,
  currentPage,
  lastRead,
  onClick,
}: BookCardProps) {
  const formatLastRead = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-200"
      onClick={onClick}
    >
      <div className="aspect-[3/4] relative bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Book className="w-16 h-16 text-muted-foreground/40" />
        )}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div>
          <h3 className="line-clamp-2 min-h-[3em]">{title}</h3>
          {author && (
            <p className="text-muted-foreground mt-1 line-clamp-1">{author}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {totalPages && (
            <Badge variant="secondary" className="gap-1">
              <FileText className="w-3 h-3" />
              {currentPage || 1}/{totalPages}
            </Badge>
          )}
          {lastRead && (
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {formatLastRead(lastRead)}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
