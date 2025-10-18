import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Key, Copy, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
  id: string | number;
  name: string;
  email: string;
  coursesCount: number;
  studentsCount: number;
  joinedDate: string;
}

interface AdminUserManagementProps {
  teachers?: Teacher[];
  onCreateTeacher?: (name: string, email: string) => void;
}

export function AdminUserManagement({ teachers = [], onCreateTeacher }: AdminUserManagementProps) {
  const [open, setOpen] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const { toast } = useToast();

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateTeacher = () => {
    if (teacherName && teacherEmail) {
      const password = generatePassword();
      setGeneratedPassword(password);
      onCreateTeacher?.(teacherName, teacherEmail);
      console.log('Creating teacher:', { name: teacherName, email: teacherEmail, password });
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({
      title: "Password copied!",
      description: "The password has been copied to your clipboard.",
    });
  };

  const resetForm = () => {
    setTeacherName("");
    setTeacherEmail("");
    setGeneratedPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">Teacher Management</h2>
          <p className="text-muted-foreground">Create and manage teacher accounts</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-teacher">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Teacher Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Teacher Account</DialogTitle>
              <DialogDescription>
                Enter teacher details to generate login credentials
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-name">Full Name</Label>
                <Input
                  id="teacher-name"
                  placeholder="Enter teacher's full name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  data-testid="input-teacher-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher-email">Email</Label>
                <Input
                  id="teacher-email"
                  type="email"
                  placeholder="teacher@example.com"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  data-testid="input-teacher-email"
                />
              </div>

              {generatedPassword && (
                <div className="space-y-2 p-4 bg-accent rounded-lg">
                  <Label className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Generated Password
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedPassword}
                      readOnly
                      className="font-mono"
                      data-testid="input-generated-password"
                    />
                    <Button variant="outline" onClick={copyPassword} data-testid="button-copy-password">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 inline mr-1" />
                    Make sure to send these credentials to the teacher securely
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCreateTeacher}
                disabled={!teacherName || !teacherEmail || !!generatedPassword}
                data-testid="button-generate-credentials"
              >
                Generate Credentials
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Teachers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id} data-testid={`row-teacher-${teacher.id}`}>
                  <TableCell className="font-medium" data-testid={`text-name-${teacher.id}`}>
                    {teacher.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-email-${teacher.id}`}>
                    {teacher.email}
                  </TableCell>
                  <TableCell data-testid={`text-courses-${teacher.id}`}>
                    {teacher.coursesCount}
                  </TableCell>
                  <TableCell data-testid={`text-students-${teacher.id}`}>
                    {teacher.studentsCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-joined-${teacher.id}`}>
                    {teacher.joinedDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {teachers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No teachers yet. Create your first teacher account!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
