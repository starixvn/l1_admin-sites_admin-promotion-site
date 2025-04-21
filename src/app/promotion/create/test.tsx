import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  
  export default function TestDialog() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Test Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hello Dialog</DialogTitle>
          </DialogHeader>
          <p>This is a test content.</p>
        </DialogContent>
      </Dialog>
    );
  }
  