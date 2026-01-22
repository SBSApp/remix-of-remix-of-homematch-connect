import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
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

  return (
    <AppLayout userType="agent">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground mt-1">
              {listings.length} properties
            </p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/add-listing")}>
            <Plus className="w-4 h-4" />
            Add New Listing
          </Button>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-card rounded-xl shadow-card overflow-hidden"
              >
                <img
                  src={listing.photos?.[0] || "/placeholder.svg"}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-card-foreground truncate">
                    {listing.title}
                  </h3>
                  <p className="text-primary font-bold text-xl mt-1">{listing.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">{listing.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {listing.size} • {listing.stay_type || "Flexible"}
                  </p>
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
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
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
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first listing to start connecting with students
            </p>
            <Button onClick={() => navigate("/add-listing")} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Listing
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ManageListings;
