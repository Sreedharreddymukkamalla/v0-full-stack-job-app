"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit3,
  Check,
  X,
  Camera,
  Plus,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Link as LinkIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiFetch, uploadImage } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

interface UserProfile {
  id: string;
  full_name?: string;
  name?: string;
  headline?: string;
  title?: string;
  avatar?: string;
  profile_image_url?: string;
  avatar_url?: string;
  location?: string;
  summary?: string;
  about?: string;
  skills?: string[];
  cover_image_url?: string;
  banner?: string;
  experience?: {
    experience?: any[];
    education?: any[];
  };
}

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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const currentUser = getCurrentUser();
  const isOwnProfile = currentUser?.id === userId;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    title: "",
    location: "",
    bio: "",
    skills: [] as string[],
    newSkill: "",
    experiences: [] as any[],
    education: [] as any[],
  });

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showAllProfilePosts, setShowAllProfilePosts] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch<any>(`/profiles/${userId}`, {
          method: "GET",
        });

        if (!response) {
          setError("User profile not found");
          setLoading(false);
          return;
        }

        setProfile(response);

        // Map profile data to form state
        const mappedExperiences = (response.experience?.experience || []).map(
          (e: any, idx: number) => ({
            id: e.id || `exp-${idx}`,
            title: e.title || e.job_title || "",
            company: e.company || "",
            period: `${e.startDate || e.start || ""} - ${e.endDate || e.end || "Present"}`,
            description: e.description || "",
          }),
        );

        const mappedEducation = (response.experience?.education || []).map(
          (ed: any, idx: number) => ({
            id: ed.id || `edu-${idx}`,
            degree: ed.degree || ed.field || "",
            school: ed.school || "",
            year: ed.endDate || ed.year || "",
          }),
        );

        setFormData({
          name: response.full_name || response.name || "",
          title: response.headline || response.title || "",
          location: response.location || "",
          bio: response.summary || response.about || "",
          skills: response.skills || [],
          newSkill: "",
          experiences: mappedExperiences,
          education: mappedEducation,
        });
      } catch (err) {
        console.error("[v0] Error fetching user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) {
        setPostsLoading(false);
        return;
      }
      try {
        setPostsLoading(true);
        const posts = await apiFetch<any[]>(`/posts/user/${userId}`);
        if (Array.isArray(posts)) {
          const transformed: Post[] = posts.map((p: any) => ({
            id: String(p.id),
            author_id: String(p.author_id ?? userId),
            content: p.content || "",
            created_at: p.created_at || new Date().toISOString(),
            likes: p.like_count ?? 0,
            comments: p.comment_count ?? 0,
            shares: 0,
            image: p.media_url ?? null,
          }));
          setUserPosts(transformed);
          const initialLiked = new Set<string>();
          posts.forEach((p: any) => {
            if (p.liked_by_me) initialLiked.add(String(p.id));
          });
          setLikedPosts(initialLiked);
        }
      } catch (e) {
        console.error("[user-profile] Error fetching user posts:", e);
        setUserPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchUserPosts();
  }, [userId]);

  const handleSave = () => {
    console.log("[v0] Saving profile:", formData);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  const addSkill = () => {
    if (formData.newSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.newSkill.trim()],
        newSkill: "",
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove),
    });
  };

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: "",
      company: "",
      period: "",
      description: "",
    };
    setFormData({
      ...formData,
      experiences: [newExp, ...formData.experiences],
    });
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    });
  };

  const removeExperience = (id: number) => {
    setFormData({
      ...formData,
      experiences: formData.experiences.filter((exp) => exp.id !== id),
    });
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const togglePostLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const togglePostSave = (postId: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const togglePostExpanded = (postId: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleCopyPostLink = (postId: string) => {
    const link = `${typeof window !== "undefined" ? window.location?.origin : ""}/posts/${postId}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/20">
        <div className="max-w-5xl mx-auto p-6">
          <Card className="overflow-hidden mb-6 animate-pulse gap-0 p-0">
            <div className="h-40 bg-muted" />
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-start -mt-16 relative z-10 mb-4">
                <div className="h-32 w-32 bg-muted rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-muted rounded w-1/3" />
                <div className="h-5 bg-muted rounded w-1/4" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-secondary/20">
        <div className="max-w-5xl mx-auto p-6">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">{error || "User not found"}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <Dialog
        open={!!imagePreviewUrl}
        onOpenChange={() => setImagePreviewUrl(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0 shadow-none [&>button]:hidden">
          {imagePreviewUrl && (
            <div className="relative">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                onClick={() => setImagePreviewUrl(null)}
              />
              <button
                type="button"
                onClick={() => setImagePreviewUrl(null)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black shadow-lg ring-2 ring-white/30"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="max-w-7xl mx-auto px-6 pt-0 pb-6">
        {/* Profile Header */}
        <Card className="overflow-hidden mb-4 relative gap-0 p-0">
          {/* Banner */}
          <div className="h-40 relative bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient">
            {profile?.cover_image_url || profile?.banner ? (
              <img
                src={
                  profile.cover_image_url ||
                  profile.banner ||
                  "/placeholder.svg"
                }
                alt="Cover"
                className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => {
                  const url = profile?.cover_image_url || profile?.banner;
                  if (url && !url.includes("placeholder"))
                    setImagePreviewUrl(url);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    const url = profile?.cover_image_url || profile?.banner;
                    if (url && !url.includes("placeholder"))
                      setImagePreviewUrl(url);
                  }
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            {isEditMode && (
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="cover-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const url = await uploadImage(file);
                    const updated = await apiFetch<any>("/profiles/me", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ cover_image_url: url }),
                    });
                    if (updated) setProfile(updated);
                  } catch (err) {
                    console.error("[profile] Failed to save cover photo:", err);
                  } finally {
                    e.target.value = "";
                  }
                }}
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-start relative z-10 mb-4">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div
                  className="relative -mt-16 z-20 w-fit cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("button")) return;
                    const url =
                      profile?.profile_image_url ||
                      profile?.profile_image ||
                      profile?.avatar ||
                      "/placeholder.svg";
                    if (url && !url.includes("placeholder"))
                      setImagePreviewUrl(url);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    if ((e.target as HTMLElement).closest("button")) return;
                    const url =
                      profile?.profile_image_url ||
                      profile?.profile_image ||
                      profile?.avatar ||
                      "/placeholder.svg";
                    if (url && !url.includes("placeholder"))
                      setImagePreviewUrl(url);
                  }}
                >
                  <Avatar className="h-32 w-32 border-4 border-card ring-4 ring-background shadow-xl">
                    {(profile?.profile_image_url ||
                        profile?.profile_image ||
                        profile?.avatar) &&
                      (profile?.profile_image_url ||
                        profile?.profile_image ||
                        profile?.avatar) !== "/placeholder.svg" && (
                        <AvatarImage
                          src={
                            profile?.profile_image_url ||
                            profile?.profile_image ||
                            profile?.avatar
                          }
                        />
                      )}
                    <AvatarFallback>
                      {getInitials(formData.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && isEditMode && (
                    <>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="avatar-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            console.log(
                              "[v0] Profile photo selected:",
                              file.name,
                            );
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById("avatar-upload")?.click();
                        }}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="mt-2 md:mt-0 md:ml-2 md:self-center">
                  {isOwnProfile && isEditMode ? (
                    <div className="space-y-2">
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your name"
                        className="text-2xl font-bold h-auto py-1 px-2"
                      />
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Your title"
                        className="text-base h-auto py-1 px-2"
                      />
                      <Input
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="Location"
                        className="text-sm h-auto py-1 px-2"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold text-foreground">
                        {formData.name || "User"}
                      </h1>
                      <p className="text-base text-foreground/80 font-medium">
                        {formData.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.location}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">About</h3>
              {isOwnProfile && isEditMode ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself"
                  className="resize-none min-h-[80px] text-base"
                  maxLength={500}
                />
              ) : (
                <p className="text-foreground text-base leading-relaxed">
                  {formData.bio}
                </p>
              )}
            </div>

            {/* Posts Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Posts</h3>
              {postsLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 scrollbar-thin">
                  {[1, 2].map((i) => (
                    <Card
                      key={i}
                      className="p-5 animate-pulse border-border/50 min-w-[320px] max-w-[380px] flex-shrink-0"
                    >
                      <div className="flex gap-4">
                        <div className="h-11 w-11 rounded-full bg-muted" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-muted rounded-lg w-1/3" />
                          <div className="h-3 bg-muted rounded-lg w-1/4" />
                          <div className="h-20 bg-muted rounded-lg w-full mt-4" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : userPosts.length === 0 ? (
                <Card className="p-12 border-border/50 flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground">No posts yet</p>
                </Card>
              ) : (
                <>
                  <div
                    className={
                      showAllProfilePosts
                        ? "space-y-4"
                        : "flex gap-4 overflow-x-auto pb-2 -mx-1 scrollbar-thin snap-x snap-mandatory"
                    }
                  >
                    {userPosts.map((post) => {
                      const isLiked = likedPosts.has(post.id);
                      const isSaved = savedPosts.has(post.id);
                      const normalizedContent = post.content?.trim() ?? "";
                      const paragraphs = normalizedContent
                        .split(/\n\s*\n/)
                        .map((p) => p.trim())
                        .filter(Boolean);
                      const hasLongContent = paragraphs.length > 2;
                      const isExpanded = expandedPosts.has(post.id);
                      const displayedParagraphs =
                        !hasLongContent || isExpanded
                          ? paragraphs
                          : paragraphs.slice(0, 2);

                      return (
                        <Card
                          key={post.id}
                          className={
                            showAllProfilePosts
                              ? "p-5 shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200"
                              : "p-5 shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200 min-w-[320px] max-w-[380px] min-h-[420px] flex-shrink-0 snap-start overflow-hidden flex flex-col"
                          }
                        >
                          <div className="flex items-start justify-between mb-4 shrink-0">
                            <div className="flex gap-3">
                              <Avatar className="h-11 w-11 ring-2 ring-border">
                                {(profile?.profile_image_url ||
                                  profile?.profile_image ||
                                  profile?.avatar) &&
                                  (profile?.profile_image_url ||
                                    profile?.profile_image ||
                                    profile?.avatar) !==
                                    "/placeholder.svg" && (
                                    <AvatarImage
                                      src={
                                        profile?.profile_image_url ||
                                        profile?.profile_image ||
                                        profile?.avatar
                                      }
                                    />
                                  )}
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {getInitials(formData.name || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link href={`/users/${userId}`}>
                                  <p className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                                    {formData.name || "User"}
                                  </p>
                                </Link>
                                <p className="text-sm text-muted-foreground leading-tight">
                                  {formData.title || ""}
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-0.5">
                                  {formatPostDate(post.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={
                              showAllProfilePosts
                                ? "mb-4 space-y-2 text-foreground leading-relaxed text-sm"
                                : "mb-4 space-y-2 text-foreground leading-relaxed text-sm max-h-[140px] overflow-y-auto shrink-0"
                            }
                          >
                            {displayedParagraphs.length > 0 ? (
                              displayedParagraphs.map((paragraph, index) => {
                                const isLast =
                                  index === displayedParagraphs.length - 1;
                                const showToggle = hasLongContent && isLast;
                                return (
                                  <p
                                    key={`${post.id}-p-${index}`}
                                    className="whitespace-pre-wrap"
                                  >
                                    {paragraph}
                                    {showToggle && (
                                      <>
                                        {" "}
                                        <button
                                          type="button"
                                          className="text-primary hover:underline font-medium"
                                          onClick={() =>
                                            togglePostExpanded(post.id)
                                          }
                                        >
                                          {isExpanded ? "See less" : "See more"}
                                        </button>
                                      </>
                                    )}
                                  </p>
                                );
                              })
                            ) : (
                              <p className="whitespace-pre-wrap">
                                {post.content}
                              </p>
                            )}
                          </div>
                          {post.image && (
                            <div
                              className={`mb-4 rounded-lg overflow-hidden border border-border/50 bg-secondary/20 flex items-center justify-center shrink-0 ${
                                showAllProfilePosts
                                  ? "min-h-[200px]"
                                  : "min-h-[120px]"
                              }`}
                            >
                              <img
                                src={post.image}
                                alt="Post"
                                className={`w-full h-auto object-contain ${
                                  showAllProfilePosts
                                    ? "max-h-[500px]"
                                    : "max-h-[200px]"
                                }`}
                              />
                            </div>
                          )}
                          {!showAllProfilePosts && (
                            <div className="flex-1 min-h-4" aria-hidden />
                          )}
                          <div className="flex items-center justify-between text-sm text-muted-foreground py-2 border-y border-border/50 shrink-0">
                            <span>
                              {post.likes + (isLiked ? 1 : 0)} likes
                            </span>
                            <div className="flex gap-4">
                              <span>{post.comments} comments</span>
                              <span>{post.shares} shares</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 -mx-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePostLike(post.id)}
                              className={`flex-1 h-10 rounded-lg gap-2 font-medium ${
                                isLiked
                                  ? "text-primary hover:bg-primary/10"
                                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                              }`}
                            >
                              <ThumbsUp
                                className={`h-[18px] w-[18px] ${isLiked ? "fill-current" : ""}`}
                              />
                              <span>Like</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-10 rounded-lg gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
                              onClick={() => router.push(`/posts/${post.id}`)}
                            >
                              <MessageCircle className="h-[18px] w-[18px]" />
                              <span>Comment</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-1 h-10 rounded-lg gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
                                >
                                  <Share2 className="h-[18px] w-[18px]" />
                                  <span>Share</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center">
                                <DropdownMenuItem
                                  onClick={() => handleCopyPostLink(post.id)}
                                  className="cursor-pointer"
                                >
                                  <LinkIcon className="mr-2 h-4 w-4" />
                                  Copy link
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => togglePostSave(post.id)}
                              className={`h-10 w-10 rounded-lg ${
                                isSaved
                                  ? "text-primary"
                                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                              }`}
                            >
                              <Bookmark
                                className={`h-[18px] w-[18px] ${isSaved ? "fill-current" : ""}`}
                              />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="secondary"
                      className="rounded-lg px-6 border border-border bg-card text-card-foreground hover:bg-muted/50"
                      onClick={() =>
                        setShowAllProfilePosts(!showAllProfilePosts)
                      }
                    >
                      {showAllProfilePosts ? "See less posts" : "See more"}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">
                Skills & Expertise
              </h3>
              {isOwnProfile && isEditMode ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={formData.newSkill}
                      onChange={(e) =>
                        setFormData({ ...formData, newSkill: e.target.value })
                      }
                      placeholder="Add a skill"
                      className="max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSkill}
                      className="bg-transparent"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Experience</h3>
                {isOwnProfile && isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addExperience}
                    className="bg-transparent"
                  >
                    Add Experience
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {formData.experiences.map((exp, index) => (
                  <div
                    key={exp.id}
                    className={`border-l-2 ${index === 0 ? "border-accent" : "border-primary"} pl-4 relative`}
                  >
                    {isOwnProfile && isEditMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-card hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                    {isOwnProfile && isEditMode ? (
                      <div className="space-y-2">
                        <Input
                          value={exp.title}
                          onChange={(e) =>
                            updateExperience(exp.id, "title", e.target.value)
                          }
                          placeholder="Job title"
                          className="font-semibold"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={exp.company}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "company",
                                e.target.value,
                              )
                            }
                            placeholder="Company"
                            className="flex-1"
                          />
                          <Input
                            value={exp.period}
                            onChange={(e) =>
                              updateExperience(exp.id, "period", e.target.value)
                            }
                            placeholder="2021 - Present"
                            className="flex-1"
                          />
                        </div>
                        <Textarea
                          value={exp.description}
                          onChange={(e) =>
                            updateExperience(
                              exp.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Describe your role and achievements..."
                          className="resize-none min-h-[60px]"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-foreground">
                          {exp.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {exp.company} • {exp.period}
                        </p>
                        <p className="text-sm text-foreground mt-2">
                          {exp.description}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Education</h3>
                {isOwnProfile && isEditMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newId =
                        Math.max(
                          ...formData.education.map((e: any) => e.id),
                          0,
                        ) + 1;
                      setFormData({
                        ...formData,
                        education: [
                          ...formData.education,
                          { id: newId, degree: "", school: "", year: "" },
                        ],
                      });
                    }}
                    className="bg-transparent gap-2 h-8"
                  >
                    <Plus className="h-3 w-3" />
                    Add Education
                  </Button>
                )}
              </div>
              {isOwnProfile && isEditMode ? (
                <div className="space-y-4">
                  {formData.education.map((edu: any, index: number) => (
                    <div
                      key={edu.id}
                      className="space-y-3 p-4 pt-6 border border-border rounded-lg relative"
                    >
                      {formData.education.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              education: formData.education.filter(
                                (e: any) => e.id !== edu.id,
                              ),
                            });
                          }}
                          className="absolute -top-3 right-2 h-7 w-7 text-muted-foreground hover:bg-destructive hover:text-white transition-colors rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = formData.education.map((e: any) =>
                            e.id === edu.id
                              ? { ...e, degree: e.target.value }
                              : e,
                          );
                          setFormData({ ...formData, education: updated });
                        }}
                        placeholder="Degree and Field of Study"
                      />
                      <Input
                        value={edu.school}
                        onChange={(e) => {
                          const updated = formData.education.map((e: any) =>
                            e.id === edu.id
                              ? { ...e, school: e.target.value }
                              : e,
                          );
                          setFormData({ ...formData, education: updated });
                        }}
                        placeholder="School or University"
                      />
                      <Input
                        value={edu.year}
                        onChange={(e) => {
                          const updated = formData.education.map((e: any) =>
                            e.id === edu.id
                              ? { ...e, year: e.target.value }
                              : e,
                          );
                          setFormData({ ...formData, education: updated });
                        }}
                        placeholder="Graduation Year"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.education.map((edu: any) => (
                    <div key={edu.id} className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-foreground">
                          {edu.school
                            .split(" ")
                            .map((w: string) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {edu.degree}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {edu.school} • {edu.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Button - Bottom Right */}
            {isOwnProfile && !isEditMode && (
              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => setIsEditMode(true)}
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            )}

            {/* Save/Cancel Buttons - Bottom Right */}
            {isOwnProfile && isEditMode && (
              <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
