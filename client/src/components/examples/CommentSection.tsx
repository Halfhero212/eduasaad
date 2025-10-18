import { CommentSection } from '../CommentSection';

export default function CommentSectionExample() {
  const mockComments = [
    {
      id: 1,
      author: { name: "Ahmed Ali", role: "student" as const },
      content: "I don't understand the difference between let and const. Can you explain?",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      author: { name: "Dr. Sarah Ibrahim", role: "teacher" as const },
      content: "Great question! 'let' allows you to reassign the variable, while 'const' creates a constant reference that cannot be reassigned. However, if const holds an object or array, you can still modify the contents.",
      timestamp: "1 hour ago",
      isReply: true,
    },
    {
      id: 3,
      author: { name: "Mohammed Khalil", role: "student" as const },
      content: "Could you provide more examples of closure use cases in real applications?",
      timestamp: "30 minutes ago",
    },
  ];

  return (
    <div className="p-6">
      <CommentSection
        lessonId="lesson-3"
        comments={mockComments}
        userRole="student"
        onSubmitComment={(content) => console.log('New comment:', content)}
      />
    </div>
  );
}
