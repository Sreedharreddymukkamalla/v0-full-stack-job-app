"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { useRef } from "react";
import { getCroppedImg } from "@/lib/utils"; // We'll add this helper below
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
  ThumbsUp,
  MessageCircle,
  Share2,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  ImageIcon,
  Video,
  Bookmark,
  Repeat2,
  Link as LinkIcon,
  Upload,
  Crop,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { getProfile, loadProfileFromApi, setProfile } from "@/lib/profileStore";
import { formatTimeAgo, getInitials } from "@/lib/utils";
import { getHomePageData } from "../feed/getHomePageData";
import { apiFetch, uploadImage } from "@/lib/api";

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

interface PostUser {
  id: string;
  name: string;
  avatar: string;
  title: string;
  company: string;
}

export default function ProfilePage() {
  // Avatar crop modal state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUploadUrl, setAvatarUploadUrl] = useState<string | null>(null);
  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 });
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarCroppedAreaPixels, setAvatarCroppedAreaPixels] =
    useState<any>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(() => getProfile());
  const isSelfProfile = true; // This would normally check if viewing own profile

  // State for section-wise editing
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(
    null,
  );
  const [editingExperienceOriginal, setEditingExperienceOriginal] = useState<
    any | null
  >(null);
  const [editingEducationId, setEditingEducationId] = useState<number | null>(
    null,
  );
  const [editingEducationOriginal, setEditingEducationOriginal] = useState<
    any | null
  >(null);
  const [skillsBackup, setSkillsBackup] = useState<string[] | null>(null);

  const [profileData, setProfileData] = useState<any>({
    name: "",
    title: "",
    location: "",
    bio: "",
    skills: [] as string[],
    newSkill: "",
  });

  const [experienceData, setExperienceData] = useState<any[]>([]);
  const [educationData, setEducationData] = useState<any[]>([]);

  // Activity / user posts (profile)
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [postUsers, setPostUsers] = useState<Map<string, PostUser>>(new Map());
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [sharePostDialogOpen, setSharePostDialogOpen] = useState(false);
  const [sharePostContent, setSharePostContent] = useState("");
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);
  const [showAllProfilePosts, setShowAllProfilePosts] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);
  const [coverSaving, setCoverSaving] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [coverUploadUrl, setCoverUploadUrl] = useState<string | null>(null);
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [coverZoom, setCoverZoom] = useState(1);
  const [coverCroppedAreaPixels, setCoverCroppedAreaPixels] =
    useState<any>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Reset modal state when closed
  useEffect(() => {
    if (!avatarModalOpen) {
      setAvatarUploadUrl(null);
      setAvatarCrop({ x: 0, y: 0 });
      setAvatarZoom(1);
      setAvatarCroppedAreaPixels(null);
      setAvatarError(null);
    }
  }, [avatarModalOpen]);

  useEffect(() => {
    if (!coverModalOpen) {
      setCoverUploadUrl(null);
      setCoverCrop({ x: 0, y: 0 });
      setCoverZoom(1);
      setCoverCroppedAreaPixels(null);
      setCoverError(null);
    }
  }, [coverModalOpen]);

  // Load profile into local state on mount (re-populates after reload)
  useEffect(() => {
    if (currentProfile) {
      // already have it
      return;
    }
    loadProfileFromApi()
      .then((p) => {
        if (p) setCurrentProfile(p);
      })
      .catch(() => null);
  }, []);

  // When profile is available, map it into the form states
  useEffect(() => {
    if (!currentProfile) return;

    const p = currentProfile;
    const mappedExperiences = (p.experience?.experience || []).map(
      (e: any, idx: number) => ({
        id: e.id || `exp-${idx}`,
        title: e.title || e.job_title || "",
        company: e.company || "",
        period: `${e.startDate || e.start || ""} - ${e.endDate || e.end || "Present"}`,
        description: e.description || "",
      }),
    );

    const mappedEducation = (p.experience?.education || []).map(
      (ed: any, idx: number) => ({
        id: ed.id || `edu-${idx}`,
        degree: ed.degree || ed.field || "",
        school: ed.school || "",
        year: ed.endDate || ed.year || "",
      }),
    );

    setProfileData({
      name: p.full_name || p.name || p.user?.full_name || "",
      title: p.headline || p.title || "",
      location: p.location || "",
      bio: p.summary || p.about || "",
      skills: p.skills || [],
      newSkill: "",
    });

    setExperienceData(mappedExperiences);
    setEducationData(mappedEducation);
  }, [currentProfile]);

  const handleDeleteAvatar = async () => {
    try {
      setAvatarDeleting(true);
      setAvatarError(null);
      // Optimistically clear locally
      const updated = {
        ...currentProfile,
        profile_image_url: null,
        profile_image: null,
        avatar: null,
      };
      setCurrentProfile(updated);
      setProfile(updated);
      setAvatarPreview(null);
      // Persist to backend if available
      await apiFetch("/profiles/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_image_url: null,
          profile_image: null,
          avatar: null,
        }),
      }).catch(() => null);
      setAvatarModalOpen(false);
    } catch (err: any) {
      setAvatarError(err?.message || "Failed to delete profile photo");
    } finally {
      setAvatarDeleting(false);
    }
  };

  // Fetch feed and filter to this user's posts only (profile Activity)
  const profileUserId = currentProfile?.user_id ?? currentProfile?.id;
  const profile = currentProfile;
  useEffect(() => {
    if (!profileUserId) {
      setPostsLoading(false);
      return;
    }
    const fetchUserPosts = async () => {
      try {
        setPostsLoading(true);
        const data = (await getHomePageData()) as {
          feed?: Array<{
            id?: unknown;
            author_id?: unknown;
            author_name?: string;
            author_avatar?: string;
            author_headline?: string;
            content?: string;
            created_at?: string;
            like_count?: number;
            comment_count?: number;
            media_url?: string | null;
            liked_by_me?: boolean;
          }>;
        };
        if (data?.feed && Array.isArray(data.feed)) {
          const idStr = String(profileUserId);
          const filtered = data.feed.filter(
            (item: any) => item.author_id?.toString() === idStr,
          );
          const transformed: Post[] = filtered.map((item: any) => ({
            id: item.id?.toString() || "",
            author_id: item.author_id?.toString() || "",
            content: item.content || "",
            created_at: item.created_at || new Date().toISOString(),
            likes: item.like_count || 0,
            comments: item.comment_count || 0,
            shares: 0,
            image: item.media_url || null,
          }));
          setUserPosts(transformed);
          const userMap = new Map<string, PostUser>();
          filtered.forEach((item: any) => {
            const uid = item.author_id?.toString() || "";
            if (!userMap.has(uid)) {
              userMap.set(uid, {
                id: uid,
                name: item.author_name || "User",
                avatar: item.author_avatar || "/placeholder.svg",
                title: item.author_headline || "",
                company: "",
              });
            }
          });
          setPostUsers(userMap);
          const initialLiked = new Set<string>();
          filtered.forEach((item: any) => {
            if (item.liked_by_me) initialLiked.add(item.id?.toString() || "");
          });
          setLikedPosts(initialLiked);
        }
      } catch (e) {
        console.error("[profile] Error fetching user posts:", e);
      } finally {
        setPostsLoading(false);
      }
    };
    fetchUserPosts();
  }, [profileUserId]);

  const handleSaveSection = async (section: string) => {
    if (section === "about") {
      try {
        const updated = await apiFetch<any>("/profiles/me", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summary: profileData.bio }),
        });
        setCurrentProfile(updated);
        setProfile(updated);
      } catch (err) {
        console.error("[profile] Failed to save about:", err);
      }
    }
    if (section === "skills") setSkillsBackup(null);
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    if (editingSection === "skills") {
      if (skillsBackup) {
        setProfileData({ ...profileData, skills: skillsBackup, newSkill: "" });
        setSkillsBackup(null);
      }
      setEditingSection(null);
      return;
    }
    // If cancelling a section-level edit for experience/education, remove any newly-added blank entries
    if (editingSection === "experience") {
      setExperienceData(
        experienceData.filter((exp) => {
          const t = (exp.title || "").toString().trim();
          const c = (exp.company || "").toString().trim();
          const p = (exp.period || "").toString().trim();
          const d = (exp.description || "").toString().trim();
          return !(t === "" && c === "" && p === "" && d === "");
        }),
      );
    }
    if (editingSection === "education") {
      setEducationData(
        educationData.filter((ed) => {
          const deg = (ed.degree || "").toString().trim();
          const school = (ed.school || "").toString().trim();
          const year = (ed.year || "").toString().trim();
          return !(deg === "" && school === "" && year === "");
        }),
      );
    }
    setEditingSection(null);
  };

  const startEditSkills = () => {
    setSkillsBackup(profileData.skills ? [...profileData.skills] : []);
    setEditingSection("skills");
  };

  const addSkill = () => {
    if (profileData.newSkill.trim()) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, profileData.newSkill.trim()],
        newSkill: "",
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter((s: string) => s !== skillToRemove),
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
    setExperienceData([newExp, ...experienceData]);
    // open the newly created form for editing
    setEditingExperienceId(newExp.id);
    setEditingExperienceOriginal(null);
  };

  const addEducation = () => {
    const newEdu = { id: Date.now(), degree: "", school: "", year: "" };
    setEducationData([newEdu, ...educationData]);
    setEditingEducationId(newEdu.id);
    setEditingEducationOriginal(null);
  };

  const startEditExperience = (id: number) => {
    const orig = experienceData.find((e) => e.id === id);
    setEditingExperienceOriginal(orig ? { ...orig } : null);
    setEditingExperienceId(id);
  };

  const cancelEditExperience = (id: number) => {
    if (editingExperienceOriginal) {
      setExperienceData(
        experienceData.map((exp) =>
          exp.id === id ? editingExperienceOriginal : exp,
        ),
      );
    } else {
      // newly created entry — remove it
      setExperienceData(experienceData.filter((exp) => exp.id !== id));
    }
    setEditingExperienceId(null);
    setEditingExperienceOriginal(null);
  };

  const saveEditExperience = (id: number) => {
    // In a full app we'd persist to the API here.
    console.log(
      "[v0] Saved experience",
      experienceData.find((e) => e.id === id),
    );
    setEditingExperienceId(null);
    setEditingExperienceOriginal(null);
  };

  const startEditEducation = (id: number) => {
    const orig = educationData.find((e) => e.id === id);
    setEditingEducationOriginal(orig ? { ...orig } : null);
    setEditingEducationId(id);
  };

  const cancelEditEducation = (id: number) => {
    if (editingEducationOriginal) {
      setEducationData(
        educationData.map((ed) =>
          ed.id === id ? editingEducationOriginal : ed,
        ),
      );
    } else {
      // newly created entry — remove it
      setEducationData(educationData.filter((ed) => ed.id !== id));
    }
    setEditingEducationId(null);
    setEditingEducationOriginal(null);
  };

  const saveEditEducation = (id: number) => {
    console.log(
      "[v0] Saved education",
      educationData.find((e) => e.id === id),
    );
    setEditingEducationId(null);
    setEditingEducationOriginal(null);
  };

  // Activity / posts helpers
  const getPostUser = (userId: string): PostUser | undefined =>
    postUsers.get(userId);
  const formatPostDate = (dateString: string): string => {
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
  const togglePostComments = (postId: string) => {
    setShowComments((prev) => (prev === postId ? null : postId));
  };
  const handleCreatePost = async () => {
    const content = newPost.trim();
    if (!content) return;
    const mediaUrl = uploadedMedia?.url ?? null;
    try {
      const created = await apiFetch<any>("/posts", {
        method: "POST",
        json: { content, visibility: "public", media_url: mediaUrl },
      });
      const newP: Post = {
        id: created?.id?.toString() ?? String(Math.random()),
        author_id: created?.author_id?.toString() ?? String(profileUserId),
        content: created?.content ?? content,
        created_at: created?.created_at ?? new Date().toISOString(),
        likes: created?.like_count ?? 0,
        comments: created?.comment_count ?? 0,
        shares: 0,
        image: created?.media_url ?? mediaUrl ?? undefined,
      };
      setUserPosts((prev) => [newP, ...prev]);
      setNewPost("");
      setUploadedMedia(null);
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };
  const handleDeletePost = (postId: string) => {
    setUserPosts((prev) => prev.filter((p) => p.id !== postId));
    (async () => {
      try {
        await apiFetch(`/posts/${postId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to delete post", err);
      }
    })();
  };
  const openEditPostDialog = (post: Post) => {
    setEditingPost(post);
    setEditPostContent(post.content || "");
    setEditPostDialogOpen(true);
  };
  const handleEditPostSubmit = async () => {
    if (!editingPost) return;
    const trimmed = editPostContent.trim();
    if (!trimmed) return;
    try {
      const res = await apiFetch<any>(`/posts/${editingPost.id}`, {
        method: "PATCH",
        json: { content: trimmed },
      });
      setUserPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? { ...p, content: res?.content ?? trimmed }
            : p,
        ),
      );
      setEditPostDialogOpen(false);
      setEditingPost(null);
      setEditPostContent("");
    } catch (err) {
      console.error("Failed to update post", err);
    }
  };
  const handleCopyPostLink = (postId: string) => {
    const link = `${typeof window !== "undefined" ? window.location?.origin : ""}/posts/${postId}`;
    if (typeof navigator !== "undefined" && navigator.clipboard)
      navigator.clipboard.writeText(link);
  };
  const handleSharePostToFeed = (post: Post) => {
    setSharingPost(post);
    setSharePostDialogOpen(true);
  };
  const handleSharePostSubmit = () => {
    if (!sharePostContent.trim()) return;
    setSharePostDialogOpen(false);
    setSharePostContent("");
    setSharingPost(null);
  };
  const handleAddPostComment = (postId: string) => {
    if (!commentText.trim()) return;
    setCommentText("");
    setShowComments(null);
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setExperienceData(
      experienceData.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    );
  };

  const removeExperience = (id: number) => {
    setExperienceData(experienceData.filter((exp) => exp.id !== id));
  };

  const renderDescription = (desc?: string | null) => {
    if (!desc) return null;
    const lines = desc.split(/\r?\n/);
    const elements: any[] = [];
    let listBuffer: string[] = [];

    const flushList = (key: string) => {
      if (listBuffer.length === 0) return;
      elements.push(
        <ul key={key} className="list-disc ml-5 text-sm text-foreground">
          {listBuffer.map((li, i) => (
            <li key={`${key}-li-${i}`}>{li}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    };

    lines.forEach((raw, idx) => {
      const line = raw.replace(/\t+/g, " ").trimRight();
      const trimmed = line.trim();
      if (trimmed.match(/^[-*+]\s+/)) {
        // list item
        listBuffer.push(trimmed.replace(/^[-*+]\s+/, ""));
      } else if (trimmed === "") {
        // blank line -> flush any list and add a small spacer
        flushList(`list-${idx}`);
        elements.push(<div key={`br-${idx}`} className="h-2" />);
      } else {
        // regular paragraph line
        flushList(`list-${idx}`);
        elements.push(
          <p key={`p-${idx}`} className="text-sm text-foreground mt-2">
            {line}
          </p>,
        );
      }
    });

    flushList("last");
    return elements;
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Avatar Edit Modal */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (!file.type.startsWith("image/")) {
            setAvatarError("Invalid file type. Please select an image.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            setAvatarUploadUrl(reader.result as string);
            setAvatarError(null);
          };
          reader.readAsDataURL(file);
          e.target.value = "";
        }}
      />
      <Dialog open={avatarModalOpen} onOpenChange={setAvatarModalOpen}>
        <DialogContent>
          <h2 className="text-lg font-semibold mb-4">Profile photo</h2>
          {avatarUploadUrl ? (
            <div className="space-y-4">
              <div className="relative h-64 w-full flex flex-col items-center">
                <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden">
                  <Cropper
                    image={avatarUploadUrl}
                    crop={avatarCrop}
                    zoom={avatarZoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setAvatarCrop}
                    onZoomChange={setAvatarZoom}
                    onCropComplete={(_, croppedAreaPixels) =>
                      setAvatarCroppedAreaPixels(croppedAreaPixels)
                    }
                  />
                </div>
                <div className="mt-4 w-full flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={avatarZoom}
                    onChange={(e) => setAvatarZoom(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
              {avatarError && (
                <div className="text-destructive text-sm">{avatarError}</div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAvatarUploadUrl(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!avatarCroppedAreaPixels || avatarSaving}
                  onClick={async () => {
                    if (!avatarUploadUrl || !avatarCroppedAreaPixels) return;
                    try {
                      setAvatarSaving(true);
                      setAvatarError(null);
                      const croppedDataUrl = await getCroppedImg(
                        avatarUploadUrl,
                        avatarCroppedAreaPixels,
                      );
                      const res = await fetch(croppedDataUrl);
                      const blob = await res.blob();
                      const file = new File([blob], "profile-photo.png", {
                        type: "image/png",
                      });
                      const url = await uploadImage(file);
                      const updated = await apiFetch<any>("/profiles/me", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ profile_image_url: url }),
                      });
                      setCurrentProfile(updated);
                      setProfile(updated);
                      setAvatarPreview(croppedDataUrl);
                      setAvatarUploadUrl(null);
                      setAvatarModalOpen(false);
                    } catch (err: any) {
                      setAvatarError(
                        err?.message || "Failed to save profile photo",
                      );
                    } finally {
                      setAvatarSaving(false);
                    }
                  }}
                >
                  {avatarSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center py-6">
                <Avatar className="h-32 w-32 border-4 border-muted">
                  {(avatarPreview ||
                    currentProfile?.profile_image_url ||
                    currentProfile?.profile_image ||
                    currentProfile?.avatar) &&
                    (avatarPreview ||
                      currentProfile?.profile_image_url ||
                      currentProfile?.profile_image ||
                      currentProfile?.avatar) !== "/placeholder.svg" && (
                      <AvatarImage
                        src={
                          avatarPreview ||
                          currentProfile?.profile_image_url ||
                          currentProfile?.profile_image ||
                          currentProfile?.avatar
                        }
                      />
                    )}
                  <AvatarFallback className="text-2xl">
                    {getInitials(profileData.name || "")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => {
                    const url =
                      avatarPreview ||
                      currentProfile?.profile_image_url ||
                      currentProfile?.profile_image ||
                      currentProfile?.avatar;
                    if (url && !url.includes("placeholder")) {
                      setAvatarUploadUrl(url);
                    } else {
                      avatarInputRef.current?.click();
                    }
                  }}
                >
                  <Pencil className="h-5 w-5" />
                  <span className="text-xs">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">Upload</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={avatarDeleting}
                  onClick={handleDeleteAvatar}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="text-xs">Delete</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => {
                    const url =
                      avatarPreview ||
                      currentProfile?.profile_image_url ||
                      currentProfile?.profile_image ||
                      currentProfile?.avatar;
                    if (url && !url.includes("placeholder")) {
                      setAvatarUploadUrl(url);
                    } else {
                      avatarInputRef.current?.click();
                    }
                  }}
                >
                  <Crop className="h-5 w-5" />
                  <span className="text-xs">Crop</span>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Cover Edit Modal */}
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        id="cover-upload"
        disabled={coverSaving}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (!file.type.startsWith("image/")) {
            setCoverError("Invalid file type. Please select an image.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            setCoverUploadUrl(reader.result as string);
            setCoverError(null);
          };
          reader.readAsDataURL(file);
          e.target.value = "";
        }}
      />
      <Dialog open={coverModalOpen} onOpenChange={setCoverModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Cover photo</h2>
          {coverUploadUrl ? (
            <div className="space-y-4">
              <div className="relative h-56 w-full rounded-lg overflow-hidden bg-muted">
                <Cropper
                  image={coverUploadUrl}
                  crop={coverCrop}
                  zoom={coverZoom}
                  aspect={3}
                  cropShape="rect"
                  showGrid={false}
                  onCropChange={setCoverCrop}
                  onZoomChange={setCoverZoom}
                  onCropComplete={(_, croppedAreaPixels) =>
                    setCoverCroppedAreaPixels(croppedAreaPixels)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={coverZoom}
                  onChange={(e) => setCoverZoom(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              {coverError && (
                <div className="text-destructive text-sm">{coverError}</div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCoverUploadUrl(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!coverCroppedAreaPixels || coverSaving}
                  onClick={async () => {
                    if (!coverUploadUrl || !coverCroppedAreaPixels) return;
                    try {
                      setCoverSaving(true);
                      setCoverError(null);
                      const croppedDataUrl = await getCroppedImg(
                        coverUploadUrl,
                        coverCroppedAreaPixels,
                      );
                      const res = await fetch(croppedDataUrl);
                      const blob = await res.blob();
                      const file = new File([blob], "cover-photo.png", {
                        type: "image/png",
                      });
                      const url = await uploadImage(file);
                      const updated = await apiFetch<any>("/profiles/me", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cover_image_url: url }),
                      });
                      setCurrentProfile(updated);
                      setProfile(updated);
                      setCoverUploadUrl(null);
                      setCoverModalOpen(false);
                    } catch (err: any) {
                      setCoverError(
                        err?.message || "Failed to save cover photo",
                      );
                    } finally {
                      setCoverSaving(false);
                    }
                  }}
                >
                  {coverSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-full aspect-[3/1] max-h-40 rounded-lg overflow-hidden bg-muted">
                  {(profile?.cover_image_url || profile?.banner) &&
                  !(profile?.cover_image_url || profile?.banner)?.includes(
                    "placeholder",
                  ) ? (
                    <img
                      src={profile?.cover_image_url || profile?.banner || ""}
                      alt="Current cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No cover photo
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => {
                    const url = profile?.cover_image_url || profile?.banner;
                    if (url && !url.includes("placeholder")) {
                      setCoverUploadUrl(url);
                    } else {
                      document.getElementById("cover-upload")?.click();
                    }
                  }}
                >
                  <Pencil className="h-5 w-5" />
                  <span className="text-xs">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() =>
                    document.getElementById("cover-upload")?.click()
                  }
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">Upload</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={async () => {
                    try {
                      const updated = {
                        ...currentProfile,
                        cover_image_url: null,
                        banner: null,
                      };
                      setCurrentProfile(updated);
                      setProfile(updated);
                      await apiFetch<any>("/profiles/me", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cover_image_url: null }),
                      }).catch(() => null);
                      setCoverModalOpen(false);
                    } catch (err) {
                      console.error("[profile] Failed to delete cover:", err);
                    }
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="text-xs">Delete</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-3 gap-1"
                  onClick={() => {
                    const url = profile?.cover_image_url || profile?.banner;
                    if (url && !url.includes("placeholder")) {
                      setCoverUploadUrl(url);
                    } else {
                      document.getElementById("cover-upload")?.click();
                    }
                  }}
                >
                  <Crop className="h-5 w-5" />
                  <span className="text-xs">Crop</span>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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
        <Card className="overflow-hidden mb-4 relative gap-0 pt-0">
          {/* Banner */}
          <div className="h-56 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient relative group">
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
            {/* Edit Cover Photo Button */}
            {isSelfProfile && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                disabled={coverSaving}
                onClick={() => setCoverModalOpen(true)}
              >
                <Camera className="h-4 w-4" />
                Edit Cover
              </Button>
            )}
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-start relative z-10 mb-6">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div
                  className="relative -mt-20 z-20 group w-fit cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("button")) return;
                    const url =
                      avatarPreview ||
                      currentProfile?.profile_image_url ||
                      currentProfile?.profile_image ||
                      currentProfile?.avatar ||
                      "/placeholder.svg";
                    if (url && !url.includes("placeholder"))
                      setImagePreviewUrl(url);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    if ((e.target as HTMLElement).closest("button")) return;
                    const url =
                      avatarPreview ||
                      currentProfile?.profile_image_url ||
                      currentProfile?.profile_image ||
                      currentProfile?.avatar ||
                      "/placeholder.svg";
                    if (url && !url.includes("placeholder"))
                      setImagePreviewUrl(url);
                  }}
                >
                  <Avatar className="h-36 w-36 border-4 border-card ring-4 ring-background shadow-xl group">
                    {(avatarPreview ||
                        currentProfile?.profile_image_url ||
                        currentProfile?.profile_image ||
                        currentProfile?.avatar) &&
                      (avatarPreview ||
                        currentProfile?.profile_image_url ||
                        currentProfile?.profile_image ||
                        currentProfile?.avatar) !== "/placeholder.svg" && (
                        <AvatarImage
                          src={
                            avatarPreview ||
                            currentProfile?.profile_image_url ||
                            currentProfile?.profile_image ||
                            currentProfile?.avatar
                          }
                        />
                      )}
                    <AvatarFallback>
                      {getInitials(profileData.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  {isSelfProfile && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-white border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarModalOpen(true);
                      }}
                    >
                      <Pencil className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt--2 ml-2">
                <h1 className="text-2xl font-bold text-foreground/80 mt-2">
                  {profileData.name || "John Doe"}
                </h1>
                <p className="text-base text-foreground/80 font-medium">
                  {profileData.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {profileData.location}
                </p>
              </div>
            </div>

            {/* About */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 group relative">
                <h3 className="font-semibold text-foreground">About</h3>
                {isSelfProfile && editingSection !== "about" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setEditingSection("about")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editingSection === "about" ? (
                <div className="space-y-2">
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself"
                    className="resize-none min-h-[80px] text-base"
                    maxLength={5000}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection("about")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-foreground text-base leading-relaxed">
                  {profileData.bio}
                </p>
              )}
            </div>

            {/* Activity / Posts (after About, before Skills) */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3">Activity</h3>
              <Button
                variant="default"
                size="sm"
                className="rounded-md mb-4 bg-primary text-primary-foreground"
              >
                Posts
              </Button>

              {/* Create post card (own profile only) */}
              {isSelfProfile && (
                <Card className="p-5 shadow-sm border-border/50 mb-4">
                  <div className="flex gap-4">
                    <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                      {(currentProfile?.profile_image_url ||
                          currentProfile?.profile_image ||
                          currentProfile?.avatar) &&
                        (currentProfile?.profile_image_url ||
                          currentProfile?.profile_image ||
                          currentProfile?.avatar) !== "/placeholder.svg" && (
                          <AvatarImage
                            src={
                              currentProfile?.profile_image_url ||
                              currentProfile?.profile_image ||
                              currentProfile?.avatar
                            }
                          />
                        )}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(profileData.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-4">
                      <Textarea
                        placeholder="Write a post..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="resize-none min-h-[80px] border-0 bg-secondary/30 rounded-xl p-4 focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-muted-foreground/70"
                      />
                      {uploadedMedia && (
                        <div className="relative rounded-lg overflow-hidden border border-border/50">
                          <button
                            type="button"
                            onClick={() => setUploadedMedia(null)}
                            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                          >
                            <X className="h-4 w-4 text-foreground" />
                          </button>
                          {uploadedMedia.type === "image" ? (
                            <img
                              src={uploadedMedia.url || "/placeholder.svg"}
                              alt="Upload preview"
                              className="w-full max-h-80 object-contain bg-secondary/20"
                            />
                          ) : (
                            <video
                              src={uploadedMedia.url}
                              controls
                              className="w-full max-h-80 bg-secondary/20"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                setUploadedMedia({
                                  type: "image",
                                  url: URL.createObjectURL(file),
                                });
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 px-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            <ImageIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">Photo</span>
                          </Button>
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                setUploadedMedia({
                                  type: "video",
                                  url: URL.createObjectURL(file),
                                });
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 px-3 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2"
                            onClick={() => videoInputRef.current?.click()}
                          >
                            <Video className="h-5 w-5" />
                            <span className="text-sm font-medium">Video</span>
                          </Button>
                        </div>
                        <Button
                          disabled={!newPost.trim()}
                          onClick={handleCreatePost}
                          className="rounded-xl px-6 h-9 font-semibold shadow-sm"
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* User posts list or empty state — scrollable row, "See more" when there are posts */}
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
                  <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {isSelfProfile
                      ? "Posts you create will appear here"
                      : "No posts yet"}
                  </p>
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
                      const author = getPostUser(post.author_id);
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
                      const isOwnPost =
                        isSelfProfile &&
                        String(post.author_id) === String(profileUserId);

                      return (
                        <Card
                          key={post.id}
                          className={
                            showAllProfilePosts
                              ? "p-5 shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200"
                              : "p-5 shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200 min-w-[320px] max-w-[380px] flex-shrink-0 snap-start overflow-hidden flex flex-col"
                          }
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex gap-3">
                              <Avatar className="h-11 w-11 ring-2 ring-border">
                                {author?.avatar &&
                                  author.avatar !== "/placeholder.svg" && (
                                    <AvatarImage src={author.avatar} />
                                  )}
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {getInitials(author?.name || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <Link href={`/users/${author?.id}`}>
                                  <p className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors">
                                    {author?.name}
                                  </p>
                                </Link>
                                <p className="text-sm text-muted-foreground leading-tight">
                                  {author?.title}
                                  {author?.company
                                    ? ` at ${author.company}`
                                    : ""}
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-0.5">
                                  {formatPostDate(post.created_at)}
                                </p>
                              </div>
                            </div>
                            {isOwnPost && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openEditPostDialog(post)}
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-destructive focus:text-destructive cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete post
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          <div
                            className={
                              showAllProfilePosts
                                ? "mb-4 space-y-2 text-foreground leading-relaxed text-sm"
                                : "mb-4 space-y-2 text-foreground leading-relaxed text-sm max-h-[140px] overflow-y-auto"
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
                            <div className="mb-4 rounded-lg overflow-hidden border border-border/50">
                              <img
                                src={post.image}
                                alt="Post"
                                className="w-full h-auto max-h-[200px] object-cover"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm text-muted-foreground py-2 border-y border-border/50">
                            <span>{post.likes + (isLiked ? 1 : 0)} likes</span>
                            <div className="flex gap-4">
                              <span>{post.comments} comments</span>
                              <span>{post.shares} shares</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 -mx-2">
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
                              onClick={() => togglePostComments(post.id)}
                              className="flex-1 h-10 rounded-lg gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 font-medium"
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
                                  onClick={() => handleSharePostToFeed(post)}
                                  className="cursor-pointer"
                                >
                                  <Repeat2 className="mr-2 h-4 w-4" />
                                  Share to feed
                                </DropdownMenuItem>
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
                          {showComments === post.id && (
                            <div className="border-t border-border/50 pt-4 space-y-4">
                              <div className="flex gap-3">
                                <Avatar className="h-9 w-9 ring-2 ring-border flex-shrink-0">
                                  {(currentProfile?.profile_image_url ||
                                    currentProfile?.profile_image ||
                                    currentProfile?.avatar) &&
                                    (currentProfile?.profile_image_url ||
                                      currentProfile?.profile_image ||
                                      currentProfile?.avatar) !==
                                      "/placeholder.svg" && (
                                    <AvatarImage
                                      src={
                                        currentProfile?.profile_image_url ||
                                        currentProfile?.profile_image ||
                                        currentProfile?.avatar
                                      }
                                    />
                                  )}
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    {getInitials(profileData.name || "")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                  <Textarea
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={(e) =>
                                      setCommentText(e.target.value)
                                    }
                                    className="resize-none min-h-[60px] text-sm border-0 bg-secondary/30 rounded-xl p-3 focus-visible:ring-1 focus-visible:ring-primary/30"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowComments(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleAddPostComment(post.id)
                                      }
                                      disabled={!commentText.trim()}
                                    >
                                      Comment
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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
            <div className="mb-6 group relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  Skills & Expertise
                </h3>
              </div>
              {isSelfProfile && editingSection !== "skills" && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={startEditSkills}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {editingSection === "skills" ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill: string) => (
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
                  <div className="flex gap-2 items-center">
                    <Input
                      value={profileData.newSkill}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          newSkill: e.target.value,
                        })
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
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill: string) => (
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
                {isSelfProfile && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addExperience()}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                )}
              </div>
              {editingSection === "experience" ? (
                <div className="space-y-4">
                  {experienceData.map((exp, index) => (
                    <div
                      key={exp.id}
                      className={`border-l-2 ${index === 0 ? "border-accent" : "border-primary"} pl-4 relative`}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
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
                    </div>
                  ))}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection("experience")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {experienceData.map((exp, index) => (
                    <div
                      key={exp.id}
                      className={`group border-l-2 ${index === 0 ? "border-accent" : "border-primary"} pl-4 relative`}
                    >
                      {editingExperienceId === exp.id ? (
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
                                updateExperience(
                                  exp.id,
                                  "period",
                                  e.target.value,
                                )
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
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelEditExperience(exp.id)}
                              className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => saveEditExperience(exp.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-foreground">
                            {exp.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {exp.company} • {exp.period}
                          </p>
                          {renderDescription(exp.description)}
                          {isSelfProfile && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditExperience(exp.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeExperience(exp.id)}
                                className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Education</h3>
                {isSelfProfile && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEducation()}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                )}
              </div>
              {editingSection === "education" ? (
                <div className="space-y-4">
                  {educationData.map((edu: any, index: number) => (
                    <div
                      key={edu.id}
                      className="space-y-3 p-4 pt-6 border border-border rounded-lg relative"
                    >
                      {educationData.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEducationData(
                              educationData.filter((e: any) => e.id !== edu.id),
                            );
                          }}
                          className="absolute -top-3 right-2 h-7 w-7 rounded-full bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = educationData.map((ed: any) =>
                            ed.id === edu.id
                              ? { ...ed, degree: e.target.value }
                              : ed,
                          );
                          setEducationData(updated);
                        }}
                        placeholder="Degree and Field of Study"
                      />
                      <Input
                        value={edu.school}
                        onChange={(e) => {
                          const updated = educationData.map((ed: any) =>
                            ed.id === edu.id
                              ? { ...ed, school: e.target.value }
                              : ed,
                          );
                          setEducationData(updated);
                        }}
                        placeholder="School or University"
                      />
                      <Input
                        value={edu.year}
                        onChange={(e) => {
                          const updated = educationData.map((ed: any) =>
                            ed.id === edu.id
                              ? { ...ed, year: e.target.value }
                              : ed,
                          );
                          setEducationData(updated);
                        }}
                        placeholder="Graduation Year"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newId =
                          educationData.length > 0
                            ? Math.max(...educationData.map((e: any) => e.id)) +
                              1
                            : 1;
                        setEducationData([
                          ...educationData,
                          { id: newId, degree: "", school: "", year: "" },
                        ]);
                      }}
                      className="bg-transparent gap-2 h-8"
                    >
                      <Plus className="h-3 w-3" />
                      Add Education
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection("education")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {educationData.map((edu: any) => (
                    <div
                      key={edu.id}
                      className="group flex items-start gap-3 relative"
                    >
                      {editingEducationId === edu.id ? (
                        <div className="w-full space-y-3 p-4 pt-0">
                          <Input
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = educationData.map((ed: any) =>
                                ed.id === edu.id
                                  ? { ...ed, degree: e.target.value }
                                  : ed,
                              );
                              setEducationData(updated);
                            }}
                            placeholder="Degree and Field of Study"
                          />
                          <Input
                            value={edu.school}
                            onChange={(e) => {
                              const updated = educationData.map((ed: any) =>
                                ed.id === edu.id
                                  ? { ...ed, school: e.target.value }
                                  : ed,
                              );
                              setEducationData(updated);
                            }}
                            placeholder="School or University"
                          />
                          <Input
                            value={edu.year}
                            onChange={(e) => {
                              const updated = educationData.map((ed: any) =>
                                ed.id === edu.id
                                  ? { ...ed, year: e.target.value }
                                  : ed,
                              );
                              setEducationData(updated);
                            }}
                            placeholder="Graduation Year"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelEditEducation(edu.id)}
                              className="bg-white text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => saveEditEducation(edu.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-foreground">
                              {edu.school
                                .split(" ")
                                .map((w: string) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">
                              {edu.degree}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {edu.school} • {edu.year}
                            </p>
                          </div>
                          {isSelfProfile && (
                            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEditEducation(edu.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEducationData(
                                    educationData.filter(
                                      (e: any) => e.id !== edu.id,
                                    ),
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Share post dialog (profile Activity) */}
      <Dialog open={sharePostDialogOpen} onOpenChange={setSharePostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Share to feed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Add your thoughts..."
              value={sharePostContent}
              onChange={(e) => setSharePostContent(e.target.value)}
              className="resize-none min-h-[100px] border-0 bg-secondary/30 rounded-xl p-4"
            />
            {sharingPost && (
              <Card className="p-4 bg-secondary/20 border-border/50">
                <p className="text-sm line-clamp-3">{sharingPost.content}</p>
              </Card>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSharePostDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSharePostSubmit}
                disabled={!sharePostContent.trim()}
              >
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit post dialog (profile Activity) */}
      <Dialog open={editPostDialogOpen} onOpenChange={setEditPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Edit your post"
              value={editPostContent}
              onChange={(e) => setEditPostContent(e.target.value)}
              className="resize-none min-h-[100px] border-0 bg-secondary/30 rounded-xl p-4"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditPostDialogOpen(false);
                  setEditingPost(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditPostSubmit}
                disabled={!editPostContent.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
