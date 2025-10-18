import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentProgress {
  id: string | number;
  name: string;
  email: string;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesSubmitted: number;
  totalQuizzes: number;
  avgScore: number;
  lastActive: string;
}

interface StudentProgressTableProps {
  courseTitle: string;
  students: StudentProgress[];
  onViewDetails?: (studentId: string | number) => void;
}

export function StudentProgressTable({
  courseTitle,
  students,
  onViewDetails,
}: StudentProgressTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-course-title">{courseTitle} - Student Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Lesson Progress</TableHead>
              <TableHead>Quizzes</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const lessonProgress = Math.round((student.lessonsCompleted / student.totalLessons) * 100);
              
              return (
                <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground text-sm">
                          {student.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm" data-testid={`text-name-${student.id}`}>
                          {student.name}
                        </div>
                        <div className="text-xs text-muted-foreground" data-testid={`text-email-${student.id}`}>
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 min-w-[150px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {student.lessonsCompleted}/{student.totalLessons} lessons
                        </span>
                        <span className="font-medium" data-testid={`text-lesson-progress-${student.id}`}>
                          {lessonProgress}%
                        </span>
                      </div>
                      <Progress value={lessonProgress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm" data-testid={`text-quizzes-${student.id}`}>
                      {student.quizzesSubmitted}/{student.totalQuizzes}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium" data-testid={`text-avg-score-${student.id}`}>
                      {student.avgScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground" data-testid={`text-last-active-${student.id}`}>
                      {student.lastActive}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(student.id)}
                      data-testid={`button-view-details-${student.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {students.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No students enrolled yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
