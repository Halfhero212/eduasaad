import { StatCard } from '../StatCard';
import { BookOpen, Users, Award, TrendingUp } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatCard
        title="Total Courses"
        value="24"
        icon={BookOpen}
        trend={{ value: "12%", isPositive: true }}
        gradient="from-primary to-chart-2"
      />
      <StatCard
        title="Total Students"
        value="1,234"
        icon={Users}
        trend={{ value: "8%", isPositive: true }}
        gradient="from-chart-2 to-chart-3"
      />
      <StatCard
        title="Completion Rate"
        value="87%"
        icon={Award}
        gradient="from-chart-3 to-chart-4"
      />
      <StatCard
        title="Active Learners"
        value="456"
        icon={TrendingUp}
        trend={{ value: "15%", isPositive: true }}
        gradient="from-chart-4 to-primary"
      />
    </div>
  );
}
