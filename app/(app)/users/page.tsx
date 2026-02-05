"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  UserPlus,
  MessageSquare,
  UserCheck,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getUserNetwork } from "@/lib/supabase";
import { getProfile } from "@/lib/profileStore";
import { apiFetch } from "@/lib/api";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [suggested, setSuggested] = useState([]);
  const [invites, setInvites] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [removingConnectionId, setRemovingConnectionId] = useState<number | null>(null);
  const [pending, setPending] = useState([]);
  const [invitationsOpen, setInvitationsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleMessage = (user: any) => {
    const targetId = user?.id;
    if (!targetId) return;
    try {
      // store a marker so the messages page can open the right conversation
      sessionStorage.setItem('messageUser', String(user.name || ''));
      sessionStorage.setItem('messageUserId', String(targetId));
    } catch { }
    router.push('/messages');
  };

  // Fetch network data from RPC on component mount
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        // Use in-memory profile store instead of localStorage
        const profile = getProfile();
        if (!profile) {
          console.log(
            "[v0] No profile available in store, using mock network data",
          );
          setLoading(false);
          return;
        }

        const userId = profile.user_id ?? profile.id ?? profile.user?.id;

        console.log("[v0] Fetching network data for user:", userId);
        const data = await getUserNetwork(userId);
        console.log("[v0] Fetched network data:", data);

        // Transform RPC data to match component structure
        if (data) {
          // Connections
          if (data.connections && Array.isArray(data.connections)) {
            const mappedConnections = data.connections.map((c: any) => ({
              id: c.id,
              connectionId: c.connection_id ?? c.connectionId ?? c.connection?.id ?? undefined,
              name: c.name || c.other_name || c.full_name || "",
              title: c.title || c.headline || c.other_headline || "",
              company: c.company || c.company_name || "",
              avatar:
                c.avatar ||
                c.other_avatar ||
                c.author_avatar ||
                "/placeholder.svg",
              banner: c.cover_image_url || c.banner || "",
              skills: c.skills || [],
              type: "connected",
            }));
            setMyConnections(mappedConnections);
          }

          // Incoming requests / invitations
          if (data.requests && Array.isArray(data.requests)) {
            const incoming: any[] = [];
            const sent: any[] = [];
            for (const r of data.requests) {
              const item = {
                id: r.id,
                connectionId: r.id ?? r.connection_id ?? r.connectionId ?? undefined,
                name: r.other_name || r.name || "",
                title: r.other_headline || r.other_title || "",
                company: r.company || "",
                avatar: r.other_avatar || r.avatar || "/placeholder.svg",
                banner: r.cover_image_url || r.banner || "",
                skills: [],
                type: "invitation",
                created_at: r.created_at,
                requester_id: r.requester_id,
                receiver_id: r.receiver_id,
              };

              // If the current user is the requester, treat as a sent (pending) request
              if (r.requester_id && Number(r.requester_id) === Number(userId)) {
                sent.push({ ...item, status: 'pending', isReceived: false });
              } else {
                incoming.push(item);
              }
            }
            setInvites(incoming);
            setPending(sent);
          }

          // Suggestions
          if (data.suggestions && Array.isArray(data.suggestions)) {
            const mappedSuggestions = data.suggestions.map((s: any) => ({
              id: s.id,
              name: s.name || s.other_name || "",
              title: s.headline || s.other_headline || "",
              company: s.company || "",
              avatar: s.avatar || s.profile_image_url || "/placeholder.svg",
              banner: s.cover_image_url || s.banner || "",
              skills: [],
              type: "suggested",
            }));
            setSuggested(mappedSuggestions);
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching network data:", error);
        // Fall back to mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, []);

  const handleRemove = (userId: number, type: string) => {
    if (type === "suggested") {
      setSuggested(suggested.filter((user) => user.id !== userId));
    } else if (type === "invitation") {
      setInvites(invites.filter((user) => user.id !== userId));
    }
  };

  const handleAcceptInvite = (userId: number) => {
    const user = invites.find((u) => u.id === userId);
    if (user) {
      setMyConnections([...myConnections, { ...user, type: "connected" }]);
      setInvites(invites.filter((u) => u.id !== userId));
    }
  };

  const handleConnect = async (userId: number) => {
    try {
      const res = await apiFetch<any>("/connections/requests", {
        method: "POST",
        json: { receiver_user_id: userId },
      });
      const createdConnectionId =
        res?.id ?? res?.connection_id ?? res?.connectionId ?? undefined;
      const suggestion = suggested.find((p) => p.id === userId);
      if (suggestion) {
        setPending((prev) => {
          if (prev.some((p) => p.id === userId && p.status === "pending"))
            return prev;
          return [
            ...prev,
            {
              ...suggestion,
              status: "pending",
              isReceived: false,
              connectionId: createdConnectionId,
            },
          ];
        });
      }

      // mark suggestion as pending locally
      setSuggested((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, status: "pending" } : p)),
      );

      // try to clear cached suggestions in sessionStorage if present
      try {
        sessionStorage.removeItem("suggestions_cache");
        sessionStorage.removeItem("suggestions_cache_ts");
      } catch { }
      setSuggested((prev) => prev.filter((p) => p.id !== userId));
      setPending((prev) =>
        prev.filter((p) => p.connectionId !== createdConnectionId),
      );

      console.log("Connection request sent");
    } catch (e) {
      console.error("Unable to send connection request", e);
    }
  };

  const handleAccept = async (connectionId?: number) => {
    if (!connectionId) return;
    try {
      await apiFetch(`/connections/requests/${connectionId}/accept`, {
        method: "POST",
      });
      const accepted =
        pending.find((p) => p.connectionId === connectionId || p.id === connectionId) ||
        invites.find((i) => i.connectionId === connectionId || i.id === connectionId);
      if (accepted) {
        setMyConnections((prev) => [
          ...prev,
          { ...accepted, type: "connected" },
        ]);
      }
      setPending((prev) => prev.filter((p) => p.connectionId !== connectionId));
      setInvites((prev) => prev.filter((i) => i.connectionId !== connectionId && i.id !== connectionId));
      console.log("Connection accepted");
    } catch (e) {
      console.error("Unable to accept request", e);
    }
  };

  const handleRemoveConnection = async (userId: number) => {
    try {
      setRemovingConnectionId(userId);
      const connection = myConnections.find((c) => c.id === userId);
      if (!connection || !connection.connectionId) {
        toast.error("Connection not found");
        return;
      }
      await apiFetch(`/connections/${connection.connectionId}`, {
        method: "DELETE",
      });
      setMyConnections((prev) => prev.filter((c) => c.id !== userId));
      toast.success("Connection removed");
    } catch (e) {
      toast.error((e as any)?.message || "Unable to remove connection");
    } finally {
      setRemovingConnectionId((prev) => (prev === userId ? null : prev));
    }
  };

  const handleReject = async (connectionId?: number, isSent?: boolean) => {
    if (!connectionId) return;
    try {
      if (isSent) {
        await apiFetch(`/connections/requests/${connectionId}/cancel`, {
          method: "POST",
        });
        console.log("Request cancelled");
      } else {
        await apiFetch(`/connections/requests/${connectionId}/reject`, {
          method: "POST",
        });
        console.log("Request ignored");
      }
      setPending((prev) => prev.filter((p) => p.connectionId !== connectionId));
      // also remove any matching invite entry
      setInvites((prev) =>
        prev.filter(
          (i) => i.id !== connectionId && i.connectionId !== connectionId,
        ),
      );
    } catch (e) {
      console.error("Unable to reject/cancel request", e);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Network
          </h1>
          <p className="text-muted-foreground">
            Connect and network with professionals in your field
          </p>
        </div>

        <Tabs defaultValue="suggested" className="space-y-6">
          <TabsList>
            <TabsTrigger value="suggested">
              Suggested People
              {suggested.length + invites.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs">
                  {suggested.length + invites.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections">
              My Connections
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {myConnections.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent Requests
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {pending.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggested" className="space-y-6">
            {/* Invitations Section */}
            {invites.length > 0 && (
              <Collapsible
                open={invitationsOpen}
                onOpenChange={setInvitationsOpen}
              >
                <Card className="p-4 border-border/50">
                  <CollapsibleTrigger className="flex items-center justify-between w-full group">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Invitations ({invites.length})
                    </h2>
                    {invitationsOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {invites.map((user) => (
                        <Card
                          key={user.id}
                          className="overflow-hidden relative group hover:shadow-lg transition-shadow"
                        >
                          <button
                            onClick={() => handleRemove(user.id, "invitation")}
                            className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                          >
                            <X className="h-4 w-4 text-foreground" />
                          </button>

                          <div className="h-24 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                            <img
                              src={user.banner || "/placeholder.svg"}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="relative pb-6">
                            <div className="flex justify-center -mt-12 mb-3">
                              <Avatar className="h-24 w-24 ring-4 ring-card">
                                <AvatarImage
                                  src={user.avatar || "/placeholder.svg"}
                                />
                                <AvatarFallback className="text-lg">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </div>

                            <div className="text-center px-4 mb-6">
                              <h3 className="font-semibold text-lg text-foreground mb-1">
                                {user.name}
                              </h3>
                              <p className="text-sm text-primary font-medium">
                                {user.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {user.company}
                              </p>
                            </div>

                            <div className="px-4 flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => handleAccept(user.connectionId ?? user.id)}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => handleMessage(user)}
                              >
                                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                Message
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => handleReject(user.connectionId ?? user.id, false)}
                              >
                                Ignore
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Suggested People */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                People You May Know
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {suggested.map((user) => (
                  <Card
                    key={user.id}
                    className="overflow-hidden relative group hover:shadow-lg transition-shadow"
                  >
                    <button
                      onClick={() => handleRemove(user.id, "suggested")}
                      className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                    >
                      <X className="h-4 w-4 text-foreground" />
                    </button>

                    <div className="h-24 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                      <img
                        src={user.banner || "/placeholder.svg"}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="relative pb-6">
                      <div className="flex justify-center -mt-12 mb-3">
                        <Avatar className="h-24 w-24 ring-4 ring-card">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback className="text-lg">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="text-center px-4 mb-6">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {user.name}
                        </h3>
                        <p className="text-sm text-primary font-medium">
                          {user.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {user.company}
                        </p>
                      </div>

                      <div className="px-4 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleConnect(user.id)}
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connections">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myConnections.map((user) => (
                <Card
                  key={user.id}
                  className="overflow-hidden relative group hover:shadow-lg transition-shadow"
                >
                  <div className="h-24 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={user.banner || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="relative pb-6">
                    <div className="flex justify-center -mt-12 mb-3">
                      <Avatar className="h-24 w-24 ring-4 ring-card">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="text-center px-4 mb-4">
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {user.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {user.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user.company}
                      </p>
                    </div>

                    <div className="px-4 mb-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {user.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleMessage(user)}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent text-destructive"
                          onClick={() => handleRemoveConnection(user.id)}
                          disabled={removingConnectionId === user.id}
                        >
                          {removingConnectionId === user.id ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sent">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pending.map((user) => (
                <Card
                  key={user.id}
                  className="overflow-hidden relative group hover:shadow-lg transition-shadow"
                >
                  <div className="h-24 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={user.banner || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="relative pb-6">
                    <div className="flex justify-center -mt-12 mb-3">
                      <Avatar className="h-24 w-24 ring-4 ring-card">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="text-center px-4 mb-4">
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {user.name}
                      </h3>
                      <p className="text-sm text-primary font-medium">
                        {user.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user.company}
                      </p>
                    </div>

                    <div className="px-4 mb-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {user.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="px-4 flex gap-2 items-center justify-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Request Pending
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
