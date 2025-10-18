import { AdminUserManagement } from '../AdminUserManagement';

export default function AdminUserManagementExample() {
  const mockTeachers = [
    {
      id: 1,
      name: "Dr. Ahmed Hassan",
      email: "ahmed.hassan@example.com",
      coursesCount: 5,
      studentsCount: 342,
      joinedDate: "Jan 15, 2024",
    },
    {
      id: 2,
      name: "Prof. Sarah Ali",
      email: "sarah.ali@example.com",
      coursesCount: 3,
      studentsCount: 567,
      joinedDate: "Feb 3, 2024",
    },
    {
      id: 3,
      name: "Mohammed Khalil",
      email: "mohammed.k@example.com",
      coursesCount: 8,
      studentsCount: 891,
      joinedDate: "Mar 12, 2024",
    },
  ];

  return (
    <div className="p-6">
      <AdminUserManagement
        teachers={mockTeachers}
        onCreateTeacher={(name, email) => console.log('Creating teacher:', { name, email })}
      />
    </div>
  );
}
