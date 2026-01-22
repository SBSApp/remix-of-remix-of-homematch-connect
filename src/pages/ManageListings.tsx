import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAgentListings } from "@/hooks/useListings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ManageListings = () => {
  const navigate = useNavigate();
  const { listings, loading, deleteListing } = useAgentListings();

  const handleDelete = async (id: string, title: string) => {
    const success = await deleteListing(id);
    if (success) {
      toast.success(`"${title}" has been deleted`);
    }
  };

  const handleEdit = (id: string) => {
    toast.info("Edit functionality coming soon");
  };

  const getStayTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Short Term":
        return "bg-orange-100 text-orange-700";
      case "Long Term":
        return "bg-blue-100 text-blue-700";
      case "Either":
        return "bg-green-100 text-green-700";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">My Listings</h1>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => navigate("/add-listing")}>
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-card rounded-xl shadow-card overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={listing.photos?.[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">
                      {listing.title}
                    </h3>
                    <p className="text-primary font-bold text-lg">{listing.price}</p>
                    <p className="text-sm text-muted-foreground">{listing.location}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing.size} • {listing.stay_type || "Flexible"}
                    </p>
                  </div>
                </div>
                <div className="flex border-t border-border">
                  <button
                    onClick={() => handleEdit(listing.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <div className="w-px bg-border" />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(listing.id, listing.title)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No listings yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first listing to start connecting with students</p>
            <Button onClick={() => navigate("/add-listing")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Listing
            </Button>
          </div>
        )}
      </div>

      <BottomNav userType="agent" />
    </div>
  );
};

export default ManageListings;
