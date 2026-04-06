import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const topics = [
    { name: 'AI & Machine Learning', query: 'topic:ai topic:machine-learning' },
    { name: 'Web Development', query: 'topic:web-development' },
    { name: 'Mobile Apps', query: 'topic:mobile' },
    { name: 'DevOps', query: 'topic:devops' },
    { name: 'Security', query: 'topic:security' },
    { name: 'Game Development', query: 'topic:gamedev' },
    { name: 'Data Science', query: 'topic:data-science' },
    { name: 'Blockchain', query: 'topic:blockchain' },
];

export function TopicBrowser() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Browse by Topic</CardTitle>
                <CardDescription>Explore repositories in popular categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {topics.map(topic => (
                        <Link key={topic.name} href={`/search?q=${encodeURIComponent(topic.query)}&tab=github`} passHref>
                            <Badge variant="secondary" className="text-sm py-1 px-3 hover:bg-primary/10 cursor-pointer">
                                {topic.name}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
