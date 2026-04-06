
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';


export function RepoCardSkeleton({ count = 1 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <Card className="flex h-full flex-col" key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4 rounded-md" />
                        <Skeleton className="h-4 w-full mt-2 rounded-md" />
                        <Skeleton className="h-4 w-5/6 mt-1 rounded-md" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex flex-wrap gap-1">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between text-xs text-muted-foreground">
                        <Skeleton className="h-4 w-10 rounded-md" />
                        <Skeleton className="h-4 w-24 rounded-md" />
                    </CardFooter>
                </Card>
            ))}
        </>
    )
}
