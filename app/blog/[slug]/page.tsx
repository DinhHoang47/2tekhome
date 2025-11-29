"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/shared/schema";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import remarkGfm from "remark-gfm";
import {
  Calendar,
  Clock,
  Home,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.slug;

  const {
    data: article,
    isLoading,
    error,
  } = useQuery<Article>({
    queryKey: ["/api/articles", slug],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${slug}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch article: ${res.statusText}`);
      }
      return await res.json();
    },
    enabled: !!slug,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    if (!article || isLoading) return;

    document.title = article.metaTitle || `${article.title} | Smart Home Blog`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        article.metaDescription || article.excerpt || ""
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = article.metaDescription || article.excerpt || "";
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute("content", article.metaKeywords || "");
    } else if (article.metaKeywords) {
      const meta = document.createElement("meta");
      meta.name = "keywords";
      meta.content = article.metaKeywords;
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", article.title);
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:title");
      meta.content = article.title;
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    if (ogDescription) {
      ogDescription.setAttribute(
        "content",
        article.excerpt || article.metaDescription || ""
      );
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:description");
      meta.content = article.excerpt || article.metaDescription || "";
      document.head.appendChild(meta);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (article.featuredImage) {
      if (ogImage) {
        ogImage.setAttribute("content", article.featuredImage);
      } else {
        const meta = document.createElement("meta");
        meta.setAttribute("property", "og:image");
        meta.content = article.featuredImage;
        document.head.appendChild(meta);
      }
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    const currentUrl = window.location.href;
    if (ogUrl) {
      ogUrl.setAttribute("content", currentUrl);
    } else {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:url");
      meta.content = currentUrl;
      document.head.appendChild(meta);
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.excerpt || article.metaDescription || "",
      image: article.featuredImage || "",
      datePublished: article.publishedAt || "",
      dateModified: article.updatedAt || "",
      author: {
        "@type": "Person",
        name: "Smart Home Expert",
      },
      publisher: {
        "@type": "Organization",
        name: "Smart Home Vietnam",
        logo: {
          "@type": "ImageObject",
          url: window.location.origin + "/logo.png",
        },
      },
    };

    let scriptTag = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.setAttribute("type", "application/ld+json");
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLd);

    return () => {
      document.title = "Smart Home Vietnam";
    };
  }, [article, isLoading]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = article?.title || "";

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        toast.success("Đã sao chép", {
          description: "Link bài viết đã được sao chép vào clipboard",
        });
        return;
    }
    window.open(url, "_blank", "width=600,height=400");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container max-w-4xl">
            <Skeleton className="h-8 w-2/3 mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-8" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-20">
          <div className="container max-w-4xl text-center">
            <h1 className="text-3xl font-bold mb-4">Không Tìm Thấy Bài Viết</h1>
            <p className="text-muted-foreground mb-8">
              Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button asChild data-testid="button-back-to-blog">
              <Link href="/blog">Quay Lại Blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumbs */}
        <section className="border-b bg-muted/30">
          <div className="container py-4">
            <nav
              className="flex items-center gap-2 text-sm"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="breadcrumb-home"
              >
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Link
                className="text-muted-foreground hover:text-foreground transition-colors"
                href="/blog"
              >
                Blog
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span
                className="text-foreground font-medium line-clamp-1"
                data-testid="breadcrumb-current"
              >
                {article.title}
              </span>
            </nav>
          </div>
        </section>

        {/* Article Header */}
        <section className="py-12 border-b">
          <div className="container max-w-4xl">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              data-testid="article-title"
            >
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time
                  dateTime={
                    article.publishedAt
                      ? new Date(article.publishedAt).toISOString()
                      : ""
                  }
                  data-testid="article-date"
                >
                  {article.publishedAt
                    ? format(new Date(article.publishedAt), "dd MMMM yyyy", {
                        locale: vi,
                      })
                    : ""}
                </time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span data-testid="article-reading-time">
                  {Math.ceil(article.content.length / 1000)} phút đọc
                </span>
              </div>
            </div>

            {article.excerpt && (
              <p
                className="text-lg text-muted-foreground leading-relaxed"
                data-testid="article-excerpt"
              >
                {article.excerpt}
              </p>
            )}
          </div>
        </section>

        {/* Featured Image */}
        {article.featuredImage && (
          <section className="py-8 border-b">
            <div className="container max-w-4xl">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  data-testid="article-featured-image"
                />
              </div>
            </div>
          </section>
        )}

        {/* Article Content */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <article
              className="prose prose-lg max-w-none dark:prose-invert
    prose-headings:font-bold prose-headings:tracking-tight
    prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
    prose-p:leading-relaxed prose-p:text-foreground/90
    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
    prose-img:rounded-lg prose-img:shadow-md
    prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
    prose-pre:bg-muted prose-pre:border
    prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1
    prose-table:border prose-table:border-collapse
    prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-100
    prose-td:border prose-td:border-gray-300 prose-td:p-2"
              data-testid="article-content"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6">
                      <table
                        {...props}
                        className="w-full border border-gray-300 border-collapse text-center"
                      />
                    </div>
                  ),
                  tbody: ({ node, ...props }) => (
                    <tbody
                      className="[&>tr:nth-child(even)]:bg-gray-50 dark:[&>tr:nth-child(even)]:bg-gray-800/50"
                      {...props}
                    />
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </article>
          </div>
        </section>

        <Separator className="container max-w-4xl" />

        {/* Share Section */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-lg bg-muted/30 border">
              <div>
                <h3 className="text-lg font-semibold mb-1">Chia sẻ bài viết</h3>
                <p className="text-sm text-muted-foreground">
                  Giúp bạn bè biết thêm về smart home
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("facebook")}
                  data-testid="button-share-facebook"
                  title="Chia sẻ lên Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("twitter")}
                  data-testid="button-share-twitter"
                  title="Chia sẻ lên Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("linkedin")}
                  data-testid="button-share-linkedin"
                  title="Chia sẻ lên LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleShare("copy")}
                  data-testid="button-share-copy"
                  title="Sao chép link"
                >
                  <LinkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                asChild
                variant="outline"
                data-testid="button-back-to-list"
              >
                <Link href="/blog">← Quay Lại Danh Sách Bài Viết</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
