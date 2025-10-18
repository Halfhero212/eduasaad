import { StudentProgressTable } from '../StudentProgressTable';

export default function StudentProgressTableExample() {
  const mockStudents = [
    {
      id: 1,
      name: "Ahmed Ali",
      email: "ahmed@example.com",
      lessonsCompleted: 18,
      totalLessons: 24,
      quizzesSubmitted: 4,
      totalQuizzes: 6,
      avgScore: 92,
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Fatima Hassan",
      email: "fatima@example.com",
      lessonsCompleted: 24,
      totalLessons: 24,
      quizzesSubmitted: 6,
      totalQuizzes: 6,
      avgScore: 98,
      lastActive: "1 day ago",
    },
    {
      id: 3,
      name: "Mohammed Khalil",
      email: "mohammed@example.com",
      lessonsCompleted: 12,
      totalLessons: 24,
      quizzesSubmitted: 3,
      totalQuizzes: 6,
      avgScore: 85,
      lastActive: "3 days ago",
    },
  ];

  return (
    <div className="p-6">
      <StudentProgressTable
        courseTitle="Advanced JavaScript Programming"
        students={mockStudents}
        onViewDetails={(id) => console.log('View details for student:', id)}
      />
    </div>
  );
}
