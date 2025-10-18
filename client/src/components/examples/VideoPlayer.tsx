import { VideoPlayer } from '../VideoPlayer';

export default function VideoPlayerExample() {
  const lessons = [
    { id: 1, title: "Introduction to JavaScript", duration: "12:30", completed: true },
    { id: 2, title: "Variables and Data Types", duration: "15:45", completed: true },
    { id: 3, title: "Functions and Scope", duration: "18:20", completed: false },
    { id: 4, title: "Arrays and Objects", duration: "22:15", completed: false },
    { id: 5, title: "Loops and Iteration", duration: "16:40", completed: false },
  ];

  return (
    <div className="p-6">
      <VideoPlayer
        videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        lessonTitle="Functions and Scope"
        courseTitle="Advanced JavaScript Programming"
        currentLesson={2}
        lessons={lessons}
        completed={false}
        onMarkComplete={() => console.log('Mark complete toggled')}
        onLessonChange={(id) => console.log('Changed to lesson:', id)}
        onPrevious={() => console.log('Previous lesson')}
        onNext={() => console.log('Next lesson')}
      />
    </div>
  );
}
