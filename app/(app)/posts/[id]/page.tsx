"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  ArrowLeft,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getHomePageData } from "@/app/(app)/feed/getHomePageData";
import { getProfile } from "@/lib/profileStore";
import { getInitials } from "@/lib/utils";

interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  likes: number;
  comments: number;
  shares: number;
  image?: string | null;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const currentUser = getProfile();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await getHomePageData();

        if (data?.feed && Array.isArray(data.feed)) {
          const foundPost = data.feed.find(
            (item: any) => item.id?.toString() === postId,
          );

          if (foundPost) {
            const transformedPost: Post = {
              id: foundPost.id?.toString() || "",
              author_id: foundPost.author_id?.toString() || "",
              content: foundPost.content || "",
              created_at: foundPost.created_at || new Date().toISOString(),
              likes: foundPost.like_count || 0,
              comments: foundPost.comment_count || 0,
              shares: 0,
              image: foundPost.media_url || null,
            };

            setPost(transformedPost);

            // Build users map
            const usersMap = new Map<string, User>();
            if (data.users && Array.isArray(data.users)) {
              data.users.forEach((user: any) => {
                usersMap.set(user.id?.toString(), {
                  id: user.id?.toString() || "",
                  name: user.full_name || user.name || "Unknown User",
                  avatar: user.profile_image_url || "/placeholder.svg",
                  title: user.headline || "Professional",
                  company: user.company || "Company",
                });
              });
            }
            setUsers(usersMap);
          } else {
            console.log("[v0] Post not found:", postId);
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const getUser = (userId: string): User => {
    return (
      users.get(userId) || {
        id: userId,
        name: "Unknown User",
        avatar: "/placeholder.svg",
        title: "Professional",
        company: "Company",
      }
    );
  };

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(link);
    console.log("[v0] Copied link:", link);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    console.log("[v0] Adding comment to post:", postId, commentText);
    setCommentText("");
    setShowComments(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="p-5 animate-pulse border-border/50">
          <div className="flex gap-4">
            <div className="h-11 w-11 rounded-full bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-muted rounded-lg w-1/3" />
              <div className="h-3 bg-muted rounded-lg w-1/4" />
              <div className="h-20 bg-muted rounded-lg w-full mt-4" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="p-8 text-center border-border/50">
          <p className="text-muted-foreground">Post not found</p>
        </Card>
      </div>
    );
  }

  const author = getUser(post.author_id);
  const isLiked = likedPosts.has(post.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Post Detail */}
      <Card className="p-5 shadow-sm border-border/50">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3 flex-1">
            <Avatar className="h-11 w-11 ring-2 ring-border">
              {author?.avatar && author.avatar !== "/placeholder.svg" && (
                <AvatarImage src={author.avatar} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(author?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Link href={`/users/${author?.id}`}>
                <p className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                  {author?.name}
                </p>
              </Link>
              <p className="text-sm text-muted-foreground leading-tight">
                {author?.title} at {author?.company}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>

          {/* Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-secondary"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                Copy link to post
              </DropdownMenuItem>
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                Report post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <p className="text-foreground leading-relaxed mb-4 text-base">
          {post.content}
        </p>

        {/* Post Image/Video */}
        {post.image && (
          <div className="relative rounded-lg overflow-hidden border border-border/50 mb-4">
            <img
              src={post.image}
              alt="Post media"
              className="w-full max-h-96 object-cover bg-secondary/20"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground py-3 border-y border-border/50 mb-3">
          <span>{post.likes} likes</span>
          <div className="flex gap-3">
            <span>{post.comments} comments</span>
            <span>{post.shares} shares</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around py-2 mb-4">
          <Button
            variant="ghost"
            className={`flex-1 gap-2 rounded-lg h-10 ${
              isLiked
                ? "text-red-500 hover:text-red-600 hover:bg-red-50/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
            onClick={() => toggleLike(post.id)}
          >
            <Heart
              className="h-4 w-4"
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className="font-medium">Like</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 h-10"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">Comment</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 h-10"
            onClick={handleCopyLink}
          >
            <Share2 className="h-4 w-4" />
            <span className="font-medium">Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-border/50 pt-4 space-y-4">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-border">
                {(currentUser?.profile_image_url || currentUser?.avatar) &&
                  (currentUser?.profile_image_url || currentUser?.avatar) !==
                    "/placeholder.svg" && (
                  <AvatarImage
                    src={
                      currentUser?.profile_image_url || currentUser?.avatar
                    }
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(currentUser?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="resize-none min-h-[60px] border-border/50 rounded-lg"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCommentText("");
                      setShowComments(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!commentText.trim()}
                    onClick={handleAddComment}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
