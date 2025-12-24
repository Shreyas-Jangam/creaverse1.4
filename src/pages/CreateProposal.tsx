import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateProposal } from "@/hooks/useGovernance";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, 
  Vote,
  Calendar as CalendarIcon,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Upload
} from "lucide-react";

export default function CreateProposal() {
  const navigate = useNavigate();
  const createProposal = useCreateProposal();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [votingEndDate, setVotingEndDate] = useState<Date>(addDays(new Date(), 7));

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a proposal title");
      return;
    }
    if (title.length < 10) {
      toast.error("Title must be at least 10 characters");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a proposal description");
      return;
    }
    if (description.length < 100) {
      toast.error("Description must be at least 100 characters");
      return;
    }

    try {
      await createProposal.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        creator_id: "temp-user-id", // TODO: Replace with actual authenticated user ID
        voting_start_date: new Date().toISOString(),
        voting_end_date: votingEndDate.toISOString(),
      });

      toast.success("Proposal created successfully!", {
        description: "Your proposal is now live for voting"
      });
      
      navigate("/governance");
    } catch (error: any) {
      toast.error("Failed to create proposal", {
        description: error.message || "Please try again"
      });
    }
  };

  const isValid = title.length >= 10 && description.length >= 100;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/governance">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create Proposal</h1>
            <p className="text-sm text-muted-foreground">Submit a new proposal for the community to vote on</p>
          </div>
        </div>

        {/* Requirements Card */}
        <Card variant="gradient" className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Vote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Proposal Requirements</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    {title.length >= 10 ? (
                      <CheckCircle className="w-3 h-3 text-success" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-muted-foreground" />
                    )}
                    Title: at least 10 characters ({title.length}/10)
                  </li>
                  <li className="flex items-center gap-2">
                    {description.length >= 100 ? (
                      <CheckCircle className="w-3 h-3 text-success" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-muted-foreground" />
                    )}
                    Description: at least 100 characters ({description.length}/100)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-base font-semibold mb-2 block">
              Proposal Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, concise title for your proposal"
              className="text-lg"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-base font-semibold mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal in detail. Explain the problem, your proposed solution, and the expected impact on the community..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Be specific and provide context for community members to make an informed decision.
            </p>
          </div>

          {/* Voting End Date */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Voting End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !votingEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {votingEndDate ? format(votingEndDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={votingEndDate}
                  onSelect={(date) => date && setVotingEndDate(date)}
                  disabled={(date) => date < new Date() || date < addDays(new Date(), 1)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-2">
              Voting will be open until this date. Minimum 1 day from now.
            </p>
          </div>

          {/* Attachments (Optional) */}
          <div>
            <Label className="text-base font-semibold mb-2 block">
              Attachments (Optional)
            </Label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, images, or documents up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <Card className="mt-6 mb-6 border-dashed">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Proposal Guidelines
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be clear and specific about what you're proposing</li>
              <li>• Include measurable outcomes or success criteria</li>
              <li>• Consider the impact on the entire community</li>
              <li>• Provide a realistic timeline if applicable</li>
              <li>• Be open to feedback and discussion</li>
            </ul>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Link to="/governance" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button 
            variant="glow" 
            className="flex-1"
            onClick={handleSubmit}
            disabled={!isValid || createProposal.isPending}
          >
            {createProposal.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Submit Proposal
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
