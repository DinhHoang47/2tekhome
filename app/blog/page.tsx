"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article } from "@/shared/schema";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Clock, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ARTICLES_PER_PAGE = 6;

export default function Blog() {
  const [displayCount, setDisplayCount] = useState(ARTICLES_PER_PAGE);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { data: allArticles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const sortedArticles = allArticles?.slice().sort((a, b) => {
    const dateA = new Date(a.publishedAt || 0).getTime();
    const dateB = new Date(b.publishedAt || 0).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const articles = sortedArticles?.slice(0, displayCount);
  const hasMore = sortedArticles && sortedArticles.length > displayCount;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-linear-to-b from-muted/30 to-background py-20 border-b">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Blog & Tin Tức</h1>
              <p className="text-lg text-muted-foreground">
                Khám phá thông tin hữu ích về robot hút bụi, thiết bị gia dụng
                thông minh và công nghệ smart home
              </p>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="py-8 border-b">
          <div className="container">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {allArticles
                    ? `${allArticles.length} bài viết`
                    : "Đang tải..."}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                <Select
                  value={sortBy}
                  onValueChange={(value: "newest" | "oldest") =>
                    setSortBy(value)
                  }
                >
                  <SelectTrigger
                    className="w-[180px]"
                    data-testid="select-sort"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16">
          <div className="container">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6 mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !articles || articles.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-2xl font-semibold">Chưa Có Bài Viết</h2>
                  <p className="text-muted-foreground">
                    Chúng tôi đang chuẩn bị nội dung mới. Hãy quay lại sau nhé!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    data-testid={`link-article-${article.slug}`}
                    className="block"
                  >
                    <Card className="overflow-hidden h-full transition-all hover-elevate active-elevate-2 group">
                      {article.featuredImage && (
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img
                            src={article.featuredImage}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            data-testid={`img-article-${article.slug}`}
                          />
                        </div>
                      )}

                      <CardHeader className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <time
                              dateTime={
                                article.publishedAt
                                  ? new Date(article.publishedAt).toISOString()
                                  : ""
                              }
                              data-testid={`date-article-${article.slug}`}
                            >
                              {article.publishedAt
                                ? format(
                                    new Date(article.publishedAt),
                                    "dd MMM yyyy",
                                    {
                                      locale: vi,
                                    }
                                  )
                                : ""}
                            </time>
                          </div>

                          {article.excerpt && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>
                                {Math.ceil(article.content.length / 1000)} phút
                                đọc
                              </span>
                            </div>
                          )}
                        </div>

                        <h2
                          className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors"
                          data-testid={`title-article-${article.slug}`}
                        >
                          {article.title}
                        </h2>
                      </CardHeader>

                      <CardContent>
                        {article.excerpt ? (
                          <p
                            className="text-muted-foreground line-clamp-3"
                            data-testid={`excerpt-article-${article.slug}`}
                          >
                            {article.excerpt}
                          </p>
                        ) : (
                          <p className="text-muted-foreground line-clamp-3">
                            {article.content.substring(0, 150)}...
                          </p>
                        )}
                      </CardContent>

                      <CardFooter>
                        <Button
                          variant="ghost"
                          className="group-hover:gap-3 transition-all"
                          data-testid={`button-read-${article.slug}`}
                        >
                          Đọc tiếp
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {sortedArticles && sortedArticles.length > 0 && !isLoading && (
              <div className="mt-12 text-center space-y-4">
                {hasMore && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      setDisplayCount((prev) => prev + ARTICLES_PER_PAGE)
                    }
                    data-testid="button-load-more"
                    className="group"
                  >
                    Xem Thêm Bài Viết
                    <ChevronDown className="ml-2 w-4 h-4 transition-transform group-hover:translate-y-1" />
                  </Button>
                )}
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="text-pagination-status"
                >
                  Đang hiển thị {Math.min(displayCount, sortedArticles.length)}{" "}
                  / {sortedArticles.length} bài viết
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
