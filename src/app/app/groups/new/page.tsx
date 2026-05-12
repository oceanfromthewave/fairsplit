import type { Metadata } from "next";
import { NewGroupForm } from "@/components/new-group-form";

export const metadata: Metadata = {
  title: "새 그룹",
};

export default function NewGroupPage() {
  return (
    <div>
      <NewGroupForm />
    </div>
  );
}
