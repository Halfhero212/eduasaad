import { Navbar } from '../Navbar';

export default function NavbarExample() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-4">Student logged in:</p>
        <Navbar 
          user={{ name: "Ahmed Ali", role: "student" }}
          notificationCount={3}
          onLogout={() => console.log('Logout clicked')}
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-4">Teacher logged in:</p>
        <Navbar 
          user={{ name: "Dr. Sarah Ibrahim", role: "teacher" }}
          notificationCount={7}
          onLogout={() => console.log('Logout clicked')}
        />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-4">Not logged in:</p>
        <Navbar />
      </div>
    </div>
  );
}
