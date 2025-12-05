import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  TrendingUp
} from "lucide-react";

export default function TuitionRates() {
  const rates = [
    {
      level: "Primary 1-3",
      partTime: "$25-35",
      fullTime: "$30-40",
      moe: "$35-45",
    },
    {
      level: "Primary 4-6",
      partTime: "$30-40",
      fullTime: "$35-45",
      moe: "$40-50",
    },
    {
      level: "Secondary 1-2",
      partTime: "$35-45",
      fullTime: "$40-50",
      moe: "$45-55",
    },
    {
      level: "Secondary 3-4",
      partTime: "$40-50",
      fullTime: "$45-60",
      moe: "$55-70",
    },
    {
      level: "JC 1-2",
      partTime: "$50-70",
      fullTime: "$60-80",
      moe: "$70-100",
    },
    {
      level: "IB / IGCSE",
      partTime: "$60-80",
      fullTime: "$70-90",
      moe: "$80-120",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4" data-testid="text-page-title">
            Tuition Rates in Singapore
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Recommended hourly rates for private tuition based on tutor qualifications and student level
          </p>
        </div>

        {/* Rate Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Part-Time Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                University students or individuals tutoring on a part-time basis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-3">
                <GraduationCap className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle className="text-lg">Full-Time Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Professional tutors with degree qualifications and extensive experience
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-chart-3" />
              </div>
              <CardTitle className="text-lg">MOE Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Current or former MOE-trained teachers with NIE certification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rate Table */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Rate Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Level
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Part-Time Tutor
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Full-Time Tutor
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      MOE Teacher
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate, index) => (
                    <tr
                      key={rate.level}
                      className={`border-b border-border ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                      data-testid={`row-rate-${rate.level.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <td className="py-4 px-4 font-medium text-foreground">
                        {rate.level}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {rate.partTime}/hr
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {rate.fullTime}/hr
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {rate.moe}/hr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border space-y-3">
              <h3 className="font-semibold text-foreground mb-3">Important Notes:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Rates may vary based on tutor's qualifications, experience, and student's specific needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Special needs students and subjects like Chinese, Music, or Arts may command higher rates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Group tuition rates are typically lower per student</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Online tuition may be priced slightly lower than in-person sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Rates are subject to negotiation between tutors and parents</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Factors Affecting Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• <strong>Qualifications:</strong> Higher degrees and certifications</p>
              <p>• <strong>Experience:</strong> Years of teaching experience</p>
              <p>• <strong>Subject Difficulty:</strong> Specialized subjects command higher rates</p>
              <p>• <strong>Location:</strong> Travel distance and convenience</p>
              <p>• <strong>Commitment:</strong> Long-term contracts may offer better rates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Set Your Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Review your qualifications and experience level</p>
              <p>• Research current market rates for your subjects</p>
              <p>• Consider your travel time and expenses</p>
              <p>• Factor in lesson preparation time</p>
              <p>• Be flexible and open to negotiation</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
