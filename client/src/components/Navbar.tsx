import { Bell, BookOpen, LogOut, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Link } from "wouter";

interface NavbarProps {
  user?: {
    name: string;
    role: "superadmin" | "teacher" | "student";
  };
  notificationCount?: number;
  onLogout?: () => void;
}

export function Navbar({ user, notificationCount = 0, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all" data-testid="link-home">
            <div className="bg-gradient-to-r from-primary to-chart-2 p-2 rounded-md">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold">EduPlatform</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link href="/courses" data-testid="link-courses">
                  <Button variant="ghost" className="hover-elevate active-elevate-2">
                    Courses
                  </Button>
                </Link>
                <Link href="/dashboard" data-testid="link-dashboard">
                  <Button variant="ghost" className="hover-elevate active-elevate-2">
                    Dashboard
                  </Button>
                </Link>
                {user.role === "student" && (
                  <Link href="/my-courses" data-testid="link-my-courses">
                    <Button variant="ghost" className="hover-elevate active-elevate-2">
                      My Learning
                    </Button>
                  </Link>
                )}
                {user.role === "teacher" && (
                  <Link href="/my-courses" data-testid="link-my-courses">
                    <Button variant="ghost" className="hover-elevate active-elevate-2">
                      My Courses
                    </Button>
                  </Link>
                )}
                {user.role === "superadmin" && (
                  <Link href="/admin" data-testid="link-admin">
                    <Button variant="ghost" className="hover-elevate active-elevate-2">
                      Admin Panel
                    </Button>
                  </Link>
                )}

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs" data-testid="badge-notification-count">
                          {notificationCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {/* Todo: Remove mock notifications */}
                      <DropdownMenuItem className="flex flex-col items-start gap-1 p-3" data-testid="notification-item-1">
                        <div className="flex items-center gap-2 w-full">
                          <div className="h-2 w-2 bg-primary rounded-full"></div>
                          <span className="font-medium text-sm">New quiz submission</span>
                          <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Ahmed submitted Quiz 3 in "Advanced JavaScript"</p>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start gap-1 p-3" data-testid="notification-item-2">
                        <div className="flex items-center gap-2 w-full">
                          <span className="font-medium text-sm">Question answered</span>
                          <span className="text-xs text-muted-foreground ml-auto">1h ago</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Your teacher replied to your question in Lesson 5</p>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-user-menu">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium" data-testid="text-user-name">{user.name}</span>
                        <span className="text-xs text-muted-foreground capitalize" data-testid="text-user-role">{user.role}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login" data-testid="link-login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register" data-testid="link-register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-2">
            {user ? (
              <>
                <Link href="/courses" data-testid="link-courses-mobile">
                  <Button variant="ghost" className="w-full justify-start">
                    Courses
                  </Button>
                </Link>
                <Link href="/dashboard" data-testid="link-dashboard-mobile">
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/my-courses" data-testid="link-my-courses-mobile">
                  <Button variant="ghost" className="w-full justify-start">
                    My Learning
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start" onClick={onLogout} data-testid="button-logout-mobile">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" data-testid="link-login-mobile">
                  <Button variant="ghost" className="w-full">Login</Button>
                </Link>
                <Link href="/register" data-testid="link-register-mobile">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
