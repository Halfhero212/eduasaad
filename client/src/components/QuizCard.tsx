import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileImage, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

interface QuizCardProps {
  id: string | number;
  title: string;
  description: string;
  lessonTitle: string;
  deadline?: string;
  submitted?: boolean;
  graded?: boolean;
  score?: number;
  onSubmit?: (file: File) => void;
}

export function QuizCard({
  id,
  title,
  description,
  lessonTitle,
  deadline,
  submitted = false,
  graded = false,
  score,
  onSubmit,
}: QuizCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      console.log('File selected:', e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onSubmit?.(selectedFile);
      console.log('Submitting quiz with file:', selectedFile.name);
    }
  };

  return (
    <Card data-testid={`card-quiz-${id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-1" data-testid={`text-lesson-${id}`}>
              {lessonTitle}
            </div>
            <CardTitle className="text-xl" data-testid={`text-title-${id}`}>{title}</CardTitle>
          </div>
          {submitted && (
            <Badge variant={graded ? "default" : "secondary"} data-testid={`badge-status-${id}`}>
              {graded ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
              {graded ? 'Graded' : 'Submitted'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" data-testid={`text-description-${id}`}>
          {description}
        </p>

        {deadline && !submitted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span data-testid={`text-deadline-${id}`}>Due: {deadline}</span>
          </div>
        )}

        {graded && score !== undefined && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="text-sm font-medium mb-1">Your Score</div>
            <div className="text-3xl font-bold text-primary" data-testid={`text-score-${id}`}>
              {score}%
            </div>
          </div>
        )}

        {!submitted && (
          <div className="space-y-3">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover-elevate active-elevate-2 transition-colors">
              <input
                type="file"
                id={`quiz-file-${id}`}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                data-testid={`input-file-${id}`}
              />
              <label htmlFor={`quiz-file-${id}`} className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <div className="text-sm font-medium mb-1">
                  {selectedFile ? selectedFile.name : 'Click to upload solution'}
                </div>
                <div className="text-xs text-muted-foreground">
                  PNG, JPG up to 10MB
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-md">
                <FileImage className="h-5 w-5 text-primary" />
                <span className="text-sm flex-1">{selectedFile.name}</span>
                <Button size="sm" onClick={handleSubmit} data-testid={`button-submit-${id}`}>
                  Submit Quiz
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
