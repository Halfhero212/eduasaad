import { CourseCard } from '../CourseCard';
import programmingThumb from '@assets/generated_images/Programming_course_thumbnail_d3f5d2c9.png';
import mathThumb from '@assets/generated_images/Mathematics_course_thumbnail_0882555e.png';

export default function CourseCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <CourseCard
        id={1}
        title="Advanced JavaScript Programming"
        description="Master modern JavaScript with ES6+, async/await, and more advanced concepts"
        teacher={{ name: "Dr. Ahmed Hassan", avatar: "A" }}
        category="Programming"
        price={49}
        thumbnail={programmingThumb}
        lessonCount={24}
        duration="12h 30m"
        enrollmentCount={342}
        onClick={() => console.log('Course 1 clicked')}
      />
      <CourseCard
        id={2}
        title="Calculus I - Complete Course"
        description="Learn calculus from basics to advanced topics with real-world applications"
        teacher={{ name: "Prof. Sarah Ali", avatar: "S" }}
        category="Mathematics"
        isFree={true}
        thumbnail={mathThumb}
        lessonCount={18}
        duration="8h 45m"
        enrollmentCount={567}
        onClick={() => console.log('Course 2 clicked')}
      />
      <CourseCard
        id={3}
        title="Web Development Bootcamp"
        description="Complete web development course covering HTML, CSS, JavaScript, React, and Node.js"
        teacher={{ name: "Mohammed Khalil", avatar: "M" }}
        category="Programming"
        price={99}
        thumbnail={programmingThumb}
        lessonCount={48}
        duration="25h 15m"
        enrollmentCount={891}
        enrolled={true}
        progress={65}
        onClick={() => console.log('Course 3 clicked')}
      />
    </div>
  );
}
