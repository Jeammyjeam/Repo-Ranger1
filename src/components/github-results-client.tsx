"use client";

import type { Repository } from "@/lib/types";
import { useUser } from "@/firebase";
import { RepoCard } from "./repo-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { Download, FileText, Code, Database } from "lucide-react";
import {
  exportToMarkdown,
  exportToJSON,
  exportToCSV,
  downloadFile,
} from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

export function GithubResultsClient({ repos }: { repos: Repository[] }) {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const reposToShow = !isUserLoading && user ? repos : repos.slice(0, 20);
  const isTruncated = repos.length > 20 && !user && !isUserLoading;

  const handleExport = (format: "markdown" | "json" | "csv") => {
    if (reposToShow.length === 0) {
      toast({ variant: "destructive", title: "No results to export" });
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case "markdown":
        content = exportToMarkdown(reposToShow);
        filename = `repositories-${new Date().toISOString().split("T")[0]}.md`;
        mimeType = "text/markdown";
        break;
      case "json":
        content = exportToJSON(reposToShow);
        filename = `repositories-${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json";
        break;
      case "csv":
        content = exportToCSV(reposToShow);
        filename = `repositories-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv";
        break;
    }

    downloadFile(content, filename, mimeType);
    toast({
      title: `Exported ${reposToShow.length} repositories as ${format.toUpperCase()}`,
    });
  };

  return (
    <>
      <div className="mt-8">
        {reposToShow.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("markdown")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
            >
              <Code className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
            >
              <Database className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        )}

        {isTruncated && (
          <div className="text-center p-4 mb-4 border rounded-lg bg-secondary/50">
            <p>
              Showing the top 20 results.{" "}
              <Link
                href="/login"
                className="font-bold underline hover:text-primary"
              >
                Sign in
              </Link>{" "}
              to view all results.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reposToShow.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </div>
    </>
  );
}
