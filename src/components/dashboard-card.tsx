'use client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';

interface DashboardCardProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    stat?: number;
    isStatLoading?: boolean;
}

export function DashboardCard({ href, icon, title, description, stat, isStatLoading }: DashboardCardProps) {
    return (
        <Link href={href}>
            <Card className="h-full hover:border-primary transition-colors flex flex-col">
                <CardHeader className="flex-grow">
                    <div className="text-primary">{icon}</div>
                    <CardTitle className="pt-2">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                {(stat !== undefined || isStatLoading) && (
                    <CardContent>
                        {isStatLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                             <div className="text-3xl font-bold">{stat?.toLocaleString()}</div>
                        )}
                    </CardContent>
                )}
            </Card>
        </Link>
    );
}
