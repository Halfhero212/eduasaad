import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string | number;
  author: {
    name: string;
    role: "student" | "teacher";
  };
  content: string;
  timestamp: string;
  isReply?: boolean;
}

interface CommentSectionProps {
  lessonId: string | number;
  comments?: Comment[];
  userRole?: "student" | "teacher";
  onSubmitComment?: (content: string) => void;
}

export function CommentSection({
  lessonId,
  comments = [],
  userRole = "student",
  onSubmitComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (newComment.trim()) {
      onSubmitComment?.(newComment);
      console.log('Submitting comment:', newComment);
      setNewComment("");
    }
  };

  return (
    <Card data-testid={`comment-section-${lessonId}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Questions & Answers
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {userRole === "student" 
            ? "Ask your teacher questions about this lesson" 
            : "Answer student questions"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Comment Form */}
        <div className="space-y-3">
          <Textarea
            placeholder={userRole === "student" ? "Ask a question..." : "Write your answer..."}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="resize-none min-h-[100px]"
            data-testid="input-new-comment"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!newComment.trim()}
              data-testid="button-submit-comment"
            >
              <Send className="h-4 w-4 mr-2" />
              {userRole === "student" ? "Ask Question" : "Post Answer"}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No questions yet. Be the first to ask!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${comment.isReply ? 'ml-12 pl-4 border-l-2' : ''}`}
                  data-testid={`comment-${comment.id}`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className={
                      comment.author.role === "teacher" 
                        ? "bg-gradient-to-br from-primary to-chart-2 text-primary-foreground" 
                        : "bg-accent text-accent-foreground"
                    }>
                      {comment.author.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm" data-testid={`comment-author-${comment.id}`}>
                        {comment.author.name}
                      </span>
                      <Badge variant={comment.author.role === "teacher" ? "default" : "secondary"} className="text-xs">
                        {comment.author.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground" data-testid={`comment-timestamp-${comment.id}`}>
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm" data-testid={`comment-content-${comment.id}`}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
