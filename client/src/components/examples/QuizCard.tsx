import { QuizCard } from '../QuizCard';

export default function QuizCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <QuizCard
        id={1}
        title="Quiz 3: Functions and Closures"
        description="Complete the exercises on JavaScript functions, closures, and scope. Upload your solutions as images."
        lessonTitle="Lesson 8: Advanced Functions"
        deadline="Dec 25, 2024"
        onSubmit={(file) => console.log('Submitting:', file.name)}
      />
      <QuizCard
        id={2}
        title="Quiz 4: Async Programming"
        description="Solve the async/await challenges and upload screenshots of your working code."
        lessonTitle="Lesson 12: Asynchronous JavaScript"
        submitted={true}
        graded={false}
      />
      <QuizCard
        id={3}
        title="Quiz 2: Array Methods"
        description="Practice array manipulation methods and upload your solution files."
        lessonTitle="Lesson 5: Working with Arrays"
        submitted={true}
        graded={true}
        score={95}
      />
    </div>
  );
}
