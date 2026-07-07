import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Play,
  Download,
  Trash2,
  Clock,
  Crown,
  Plus,
  MoreVertical,
  Loader2,
  RefreshCw,
  Calendar,
  Sparkles,
  Zap,
  Volume2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useConversions } from "@/hooks/useConversions";
import { format } from "date-fns";
import { useAudioPlayer } from "@/contexts/AudioPlayerContext";
import { getSignedAudioUrl } from "@/lib/audioUrl";
import { toast } from "sonner";
import AccountStatusCard from "@/components/layout/AccountStatusCard";

const planDetails = {
  free: {
    name: "Free",
    color: "from-gray-400 to-gray-500",
    icon: FileText,
    uploadLimit: 3,
    features: ["3 PDF uploads", "5,000 chars/conversion", "4 voices"],
  },
  pro: {
    name: "Pro",
    color: "from-primary to-accent",
    icon: Sparkles,
    uploadLimit: -1,
    features: ["Unlimited uploads", "50,000 chars/conversion", "15+ voices"],
  },
  enterprise: {
    name: "Enterprise",
    color: "from-purple-500 to-pink-500",
    icon: Zap,
    uploadLimit: -1,
    features: ["Everything in Pro", "API access", "Custom voice cloning"],
  },
};

const Dashboard = () => {
  const { user, loading, subscription, subscriptionLoading, refreshSubscription } = useAuth();
  const { conversions, loading: conversionsLoading, totalDuration, totalFiles, deleteConversion, formatDuration, formatFileSize, fetchConversions } = useConversions();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversionToDelete, setConversionToDelete] = useState<string | null>(null);
  const { playTrack, currentTrack } = useAudioPlayer();

  const handlePlay = async (file: { id: string; name: string; audio_url: string | null }) => {
    if (!file.audio_url) return;
    try {
      const url = await getSignedAudioUrl(file.audio_url);
      playTrack({ id: file.id, name: file.name, audioUrl: url });
    } catch (e) {
      console.error(e);
      toast.error("Could not load audio");
    }
  };

  const handleDownload = async (file: { name: string; audio_url: string | null }) => {
    if (!file.audio_url) return;
    try {
      const url = await getSignedAudioUrl(file.audio_url);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      toast.error("Could not download audio");
    }
  };
  
  const currentPlan = planDetails[subscription.plan];
  const uploadLimit = currentPlan.uploadLimit;
  const isUnlimited = uploadLimit === -1;
  const usagePercent = isUnlimited ? 0 : (totalFiles / uploadLimit) * 100;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleRefreshSubscription = async () => {
    setIsRefreshing(true);
    await refreshSubscription();
    setIsRefreshing(false);
  };

  const handleDeleteClick = (id: string) => {
    setConversionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (conversionToDelete) {
      await deleteConversion(conversionToDelete);
      setConversionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const PlanIcon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, <span className="gradient-text">{user.email?.split("@")[0]}</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your audio files and track your usage
              </p>
            </div>
            <Link to="/converter" className="mt-4 md:mt-0">
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                New Conversion
              </Button>
            </Link>
          </motion.div>

          <div className="mb-6">
            <AccountStatusCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6 card-shadow"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Your Audio Files</h2>
                  <Button variant="ghost" size="icon" onClick={fetchConversions} disabled={conversionsLoading}>
                    <RefreshCw className={`w-4 h-4 ${conversionsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                
                {conversionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : conversions.length > 0 ? (
                  <div className="space-y-4">
                    {conversions.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {file.duration_seconds && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(file.duration_seconds)}
                                </span>
                              )}
                              {file.file_size_bytes && <span>{formatFileSize(file.file_size_bytes)}</span>}
                              <span>{format(new Date(file.created_at), "MMM d, yyyy")}</span>
                              {file.status !== "completed" && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  file.status === "processing" ? "bg-yellow-500/20 text-yellow-500" :
                                  file.status === "failed" ? "bg-red-500/20 text-red-500" :
                                  "bg-gray-500/20 text-gray-500"
                                }`}>
                                  {file.status}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {file.audio_url && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handlePlay(file)}
                                  className={currentTrack?.id === file.id ? "text-primary" : ""}
                                >
                                  {currentTrack?.id === file.id ? (
                                    <Volume2 className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDownload(file)}>
                                  <Download className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="glass">
                                {file.audio_url && (
                                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(file.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No audio files yet. Start by converting your first document!
                    </p>
                    <Link to="/converter">
                      <Button variant="gradient">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Audio
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`rounded-2xl p-6 card-shadow ${
                  subscription.subscribed 
                    ? "bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30" 
                    : "glass"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Subscription</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefreshSubscription}
                    disabled={isRefreshing || subscriptionLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${(isRefreshing || subscriptionLoading) ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPlan.color} flex items-center justify-center`}>
                        <PlanIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{currentPlan.name}</span>
                          {subscription.subscribed && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Active</span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {subscription.subscribed ? "Premium Member" : "Free Tier"}
                        </span>
                      </div>
                    </div>

                    {subscription.subscriptionEnd && (
                      <div className="p-3 rounded-lg bg-secondary/50 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Renews:</span>
                          <span className="font-medium">
                            {format(new Date(subscription.subscriptionEnd), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 card-shadow"
              >
                <h3 className="font-semibold mb-4">Account</h3>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-xs text-muted-foreground mb-1">Email</div>
                  <div className="text-sm font-medium truncate">{user.email}</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-6 card-shadow"
              >
                <h3 className="font-semibold mb-4">Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">PDF Uploads</span>
                      <span className="font-medium">
                        {isUnlimited ? `${totalFiles} / Unlimited` : `${totalFiles} / ${uploadLimit}`}
                      </span>
                    </div>
                    {!isUnlimited && <Progress value={usagePercent} className="h-2" />}
                    {isUnlimited && (
                      <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                    )}
                  </div>
                </div>
              </motion.div>

              {!subscription.subscribed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-6 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Upgrade to Pro</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get unlimited uploads, premium voices, and priority processing.
                  </p>
                  <Link to="/pricing">
                    <Button variant="gradient" className="w-full">View Plans</Button>
                  </Link>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass rounded-2xl p-6 card-shadow"
              >
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <div className="text-2xl font-bold gradient-text">{totalFiles}</div>
                    <div className="text-xs text-muted-foreground">Total Files</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <div className="text-2xl font-bold gradient-text">{formatDuration(totalDuration)}</div>
                    <div className="text-xs text-muted-foreground">Total Duration</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio Conversion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this audio file? This action cannot be undone and will permanently remove the file from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
