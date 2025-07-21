"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AddCardForm = () => {
  return (
    <form>
      <div className="flex flex-col gap-2">
        <div>
          <Label htmlFor="title" className="hidden">
            Title
          </Label>
          <Input
            type="text"
            name="title"
            className="placeholder:text-lg text-lg"
            placeholder="Add Title"
            id="title"
          ></Input>
        </div>
        <div className="border rounded-md bg-background"></div>
      </div>
      <div className="border-t py-2 my-4 flex items-end justify-end gap-2">
        <Button type="submit" size="sm">
          Submit
        </Button>
      </div>
    </form>
  );
};

export default AddCardForm;
