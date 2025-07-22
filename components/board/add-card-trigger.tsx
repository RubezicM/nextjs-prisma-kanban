import { useBoardContext } from "@/contexts/BoardProvider";
import { ChevronRight } from "lucide-react";

import { useState } from "react";

import AddCardForm from "@/components/board/add-card-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AddCardTrigger = ({
  children,
  onClick,
  listId,
}: {
  children: React.ReactNode;
  listId: string;
  onClick?: () => void;
}) => {
  const { boardData } = useBoardContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleClose = () => {
    setIsDialogOpen(false);
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild onClick={onClick}>
        {children}
      </DialogTrigger>
      <DialogHeader></DialogHeader>
      <DialogContent className="bg-background text-card-foreground rounded-lg p-6 shadow-lg w-[750px] max-w-7xl">
        <DialogHeader>
          <DialogTitle className="text-left">
            <div className="text-sm flex items-center gap-1">
              <h3 className="border uppercase inline-block p-1 text-lg font-semibold rounded-sm text-foreground">
                {boardData?.title}
              </h3>
              <ChevronRight strokeWidth={1} />
              <span className="text-foreground">New card</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <AddCardForm listId={listId} onSuccess={handleClose} boardSlug={boardData?.slug} />
      </DialogContent>
    </Dialog>
  );
};

export default AddCardTrigger;
